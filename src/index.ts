import 'whatwg-fetch'

type GeoIPLookup = {
    asn: number,
    organization: string,
    country: string
};

class Measurer {

    input: string;
    startTime: number;
    geoipLookup: GeoIPLookup;

    constructor(input: string, geoipLookup: GeoIPLookup) {
        this.input = input 
        this.geoipLookup = geoipLookup
    }

    measure() {
        let el = document.createElement('img')
        el.setAttribute('src', this.input)
        el.addEventListener('load', () => {
            const endTime = Date.now()
            this.submitResult(endTime)
        })
        el.addEventListener('error', (err) => {
            const endTime = Date.now()
            this.submitError(endTime, err)
        })
        this.startTime = Date.now()
        document.getElementById('measurer').appendChild(el)
    }

    submitResult(endTime: number) {
        console.log('OK')
        console.log({
            'input': this.input,
            'result': 'ok',
            'result_failure': null,
            'test_runtime': endTime - this.startTime,
            'probe_asn': this.geoipLookup.asn,
            'probe_cc': this.geoipLookup.country,
            'probe_network_name': this.geoipLookup.organization,
        })
    }

    submitError(endTime: number, error) {
        console.log('Error')
        console.log({
            'input': this.input,
            'result': 'error',
            'result_failure': error,
            'test_runtime': endTime - this.startTime,
            'probe_asn': this.geoipLookup.asn,
            'probe_cc': this.geoipLookup.country,
            'probe_network_name': this.geoipLookup.organization,
        })
    }
};

async function lookupGeoIP() : Promise<GeoIPLookup> {
    try {
        const resp = await window.fetch('https://get.geojs.io/v1/ip/geo.json')
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
                'https://twitter.com/favicon.ico',
                'https://thepiratebay.se/favicon.ico',
        ])
    })
}

async function main() {
    const geoIPlookup : GeoIPLookup = await lookupGeoIP()
    console.log(geoIPlookup)
    const inputs = await lookupInputs()
    console.log(inputs)
    inputs.forEach(i => {
        const m = new Measurer(i, geoIPlookup)
        m.measure()
    })
}

document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    main()
})
