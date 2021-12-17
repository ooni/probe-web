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

async function lookupInputs(geoip_lookup : GeoIPLookup) : Promise<InputList> {
    const req = {
        "charging": true,
        "on_wifi": true,
        "platform": "browser",
        "probe_asn": `AS${geoip_lookup.asn}`,
        "probe_cc": geoip_lookup.country,
        "run_type": "timed",
        "software_name": "ooniprobe-web",
        "software_version": "0.0.1",
        "web_connectivity": {
            "category_codes": []
        }
    }
    const resp = await fetch('https://api.ooni.io/api/v1/check-in', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(req)
    })
    const j = await resp.json()
    console.log(j)
    try {
        return j['tests']['web_connectivity']['urls'].map(u => u.url)
    } catch(e) {
        console.log('failed to lookup inputs', e)
        throw e
    }
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


async function runExperiment(measurementDone : Function) {
    const geoIPlookup : GeoIPLookup = await lookupGeoIP()
    console.log('looked up geoIP', geoIPlookup)
    const inputs = await lookupInputs(geoIPlookup)
    console.log('looked up inputs', inputs)
    for (const i of inputs) {
        const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19)
        let measurement : Measurement = {
            probe_asn: `AS${geoIPlookup.asn}`,
            probe_cc: geoIPlookup.country,
            probe_network_name: geoIPlookup.organization,
            input: i,
            test_start_time: timestamp,
            measurement_start_time: timestamp,
            test_runtime: -1,
            test_keys: {result: ""}
        };
        console.log(`Measuring ${i}`)
        let [result, runtime] = await measure(i)
        measurement.test_runtime = runtime
        measurement.test_keys = {'result': result}
        measurementDone(measurement)
    }
}

export default runExperiment