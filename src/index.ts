import 'whatwg-fetch'

type GeoIPLookup = {
    asn: number,
    organization: string,
    country: string
};

class Measurer {

    src: string;
    element: string;
    startTime: number;
    geoipLookup: GeoIPLookup;

    constructor(element: string, src: string, geoipLookup: GeoIPLookup) {
        this.element = element
        this.src = src
        this.geoipLookup = geoipLookup
    }

    measure() {
        let el = document.createElement(this.element)
        el.setAttribute('src', this.src)
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
            'input': this.src,
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
            'input': this.src,
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

type InputSpec = {
    element: string,
    src: string
};

type InputList = Array<InputSpec>;

async function lookupInputs() : Promise<InputList> {
    return new Promise((resolve, reject) => {
        resolve([
            {
                src: 'https://twitter.com/favicon.ico',
                element: 'img' 
            },
            {
                src: 'https://thepiratebay.se/favicon.ico',
                element: 'img' 
            }
        ])
    })
}

async function main() {
    const geoIPlookup : GeoIPLookup = await lookupGeoIP()
    console.log(geoIPlookup)
    const inputs = await lookupInputs()
    console.log(inputs)
    inputs.forEach(i => {
        const m = new Measurer(i.element, i.src, geoIPlookup)
        m.measure()
    })
}

document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    main()
})
