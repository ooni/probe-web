type GeoIPLookup = {
    asn: number,
    organization: string,
    country: string
};

type TestKeys = {
    result: string
}

type Measurement = {
    input: string,
    test_start_time: string,
    measurement_start_time: string,
    test_runtime: number,
    probe_asn: string,
    probe_cc: string,
    probe_network_name: string,
    test_keys: TestKeys,
}

async function lookupGeoIP() : Promise<GeoIPLookup> {
    try {
        const resp = await fetch('https://get.geojs.io/v1/ip/geo.json')
        const j = await resp.json()
        const g: GeoIPLookup = {
            asn: j['asn'],
            organization: j['organization_name'],
            country: j['country_code']
        }
        return g

    } catch (err) {
        console.log('failed with error', err)
        throw err
    }
}

type InputList = Array<string>;

async function lookupInputs() : Promise<InputList> {
    return new Promise((resolve, reject) => {
        resolve([
                'https://twitter.com/',
                'https://thepiratebay.se/',
        ])
    })
}

async function measure(input: string) : Promise<[string, number]> {
    let result : string;
    const start_time = performance.now()
    try {
        await fetch(input, {method: 'GET', mode: 'no-cors', cache: 'no-store'})
        result = 'ok'
    } catch(error) {
        result = 'error'
    }
    return [result, performance.now() - start_time]
}

async function main() {
    const geoIPlookup : GeoIPLookup = await lookupGeoIP()
    console.log('looked up geoIP', geoIPlookup)
    const inputs = await lookupInputs()
    console.log('looked up inputs', inputs)
    for (const i of inputs) {
        let measurement : Measurement = {};
        measurement.probe_asn = `AS${geoIPlookup.asn}`
        measurement.probe_cc = geoIPlookup.country
        measurement.probe_network_name = geoIPlookup.organization
        measurement.input = i
        measurement.test_start_time = `${Date.now()}`
        measurement.measurement_start_time = `${Date.now()}`

        let [result, runtime] = await measure(i, geoIPlookup)
        measurement.test_runtime = runtime
        measurement.test_keys = {'result': result}
        console.log(measurement)
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    main()
})