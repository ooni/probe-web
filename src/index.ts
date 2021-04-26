import 'whatwg-fetch'

type GeoIPLookup = {
    asn: number,
    organization: string,
    country: string
}

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

async function main() {
    const geoIP : GeoIPLookup = await lookupGeoIP()
    console.log(geoIP)
}

document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    main()
})
