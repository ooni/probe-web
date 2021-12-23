
const software_name = 'ooniprobe-web'
const software_version = '0.0.1'
const data_format_version = '0.2.0'

type GeoIPLookup = {
    asn: number,
    organization: string,
    country: string
};

type TestKeys = {
    result: string
}

type Measurement = {
    report_id: string,
    input: string,
    test_start_time: string,
    measurement_start_time: string,
    test_runtime: number,
    probe_asn: string,
    probe_cc: string,
    software_name: string,
    software_version: string,
    test_name: string,
    test_version: string,
    data_format_version: string,
    probe_network_name: string,
    test_keys: TestKeys,
}

export type RunnerOptions = {
    onLog: Function,
    onProgress: Function,
    onStatus: Function,
    onResults: Function,
    uploadResults: boolean,
    urlLimit: number
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

async function measure(input: string) : Promise<[string, number]> {
    let result : string;
    const start_time = performance.now()
    try {
        await fetch(input, {
            method: 'GET',
            mode: 'no-cors',
            cache: 'no-store',
            credentials: 'omit'
        })
        result = 'ok'
    } catch(error) {
        result = 'error'
    }
    return [result, performance.now() - start_time]
}

class Runner {
    geoip : GeoIPLookup;

    apiBaseURL : string;

    // onLog is a handler that is called whenever a log message needs to be
    // written to the log console.
    private onLog: Function;

    // onProgress is a handler that is called whenever a progress update event
    // happens.
    private onProgress : Function;

    // onStatus is a handler that is called whenever the current status of a
    // running test is updated. Only one state is possible at a given moment.
    private onStatus: Function;

    // onResults is a handler that is called when the test has finished running
    // and results are available.
    // XXX maybe it's cleaner to return this via the promise from run(), however
    // it's considered an antipattern to do that inside of the useEffect hook so
    // some better approach should be devised.
    private onResults: Function;

    private uploadResults: boolean;
    private urlLimit: number;

    constructor(options : RunnerOptions) {
        this.uploadResults = options.uploadResults
        this.onLog = options.onLog
        this.onProgress = options.onProgress
        this.onStatus = options.onStatus
        this.onResults = options.onResults
        this.urlLimit = options.urlLimit
        this.apiBaseURL = 'https://ams-pg-test.ooni.org'
    }

    async lookupInputs(): Promise<InputList> {
        const req = {
            "charging": true,
            "on_wifi": true,
            "platform": "browser",
            "probe_asn": `AS${this.geoip.asn}`,
            "probe_cc": this.geoip.country,
            "run_type": "timed",
            "software_name": software_name,
            "software_version": software_version,
            "web_connectivity": {
                "category_codes": []
            }
        }
        const checkInURL = `${this.apiBaseURL}/api/v1/check-in`
        this.onLog(`Fetching URLs via ${checkInURL}`)
        const resp = await fetch(checkInURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req)
        })
        const j = await resp.json()
        try {
            let urls = j['tests']['web_connectivity']['urls'].map(u => u.url)
            if (this.urlLimit !== 0) {
                urls = urls.slice(0, this.urlLimit)
            }
            return urls
        } catch (e) {
            console.log('failed to lookup inputs', e)
            throw e
        }
    }

    async openReport(test_start_time : string, test_name : string, test_version : string) : Promise<string> {
        const req = {
            "data_format_version": data_format_version,
            "format": "json",
            "probe_asn": `AS${this.geoip.asn}`,
            "probe_cc": this.geoip.country,
            "software_name": software_name,
            "software_version": software_version,
            "test_name": test_name,
            "test_start_time": test_start_time,
            "test_version": test_version
          }
        const openReportURL = `${this.apiBaseURL}/report`
        this.onLog(`Opening report via ${openReportURL}`)
        const resp = await fetch(openReportURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req)
        })
        const j = await resp.json()
        return j['report_id']
    }

    async submitMeasurement(measurement : Measurement) : Promise<string> {
        const req = {
            "content": measurement,
            "format": "json"
        }
        const submitMeasurementURL = `${this.apiBaseURL}/report/${measurement.report_id}`
        this.onLog(`Submitting measurement via ${submitMeasurementURL}`)
        const resp = await fetch(submitMeasurementURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req)
        })
        const j = await resp.json()
        return j['measurement_uid']
    }

    async run() : Promise<> {
        let results = []

        const test_name = 'browser_web'
        const test_version = '0.1.0'

        this.geoip = await lookupGeoIP()
        this.onLog('looked up geoIP', this.geoip)
        const inputs = await this.lookupInputs()
        this.onLog('looked up inputs', inputs)

        const test_start_time = new Date().toISOString().replace('T', ' ').slice(0, 19)
        let report_id = ''
        if (this.uploadResults === true) {
            report_id = await this.openReport(test_start_time, test_name, test_version)
        }
        for (let idx = 0; idx < inputs.length; idx++) {
            let i = inputs[idx]
            let progress = idx/inputs.length * 100
            this.onProgress(progress)
            const measurement_start_time = new Date().toISOString().replace('T', ' ').slice(0, 19)
            let measurement: Measurement = {
                software_name,
                software_version,
                test_start_time,
                test_name,
                test_version,
                data_format_version,
                report_id,
                measurement_start_time,
                probe_asn: `AS${this.geoip.asn}`,
                probe_cc: this.geoip.country,
                probe_network_name: this.geoip.organization,
                input: i,
                test_runtime: -1,
                test_keys: { result: "" }
            };
            this.onStatus(`Measuring ${i}`)
            this.onLog(`Measuring ${i}`)
            let [result, runtime] = await measure(i)
            measurement.test_runtime = runtime
            measurement.test_keys = { 'result': result }
            this.onLog(`Measured: ${JSON.stringify(measurement)}`)

            if (this.uploadResults === true) {
                const msmtUID = await this.submitMeasurement(measurement)
                this.onLog(`Submitted measurement with UID ${msmtUID}`)
            }

            results.push(measurement)
        }
        this.onResults(results)
    }
}

export default Runner