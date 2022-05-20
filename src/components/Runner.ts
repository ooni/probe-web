const software_name = "ooniprobe-web";
const software_version = "0.0.1";
const data_format_version = "0.2.0";

type GeoIPLookup = {
  probe_cc: string;
  probe_asn: string;
  probe_network_name: string;
};

type TestKeys = {
  result: string;
  load_time_ms: number;
};

export type Measurement = {
  report_id: string;
  input: string;
  test_start_time: string;
  measurement_start_time: string;
  test_runtime: number;
  probe_asn: string;
  probe_cc: string;
  software_name: string;
  software_version: string;
  test_name: string;
  test_version: string;
  data_format_version: string;
  probe_network_name: string;
  test_keys: TestKeys;
};

export type RunnerOptions = {
  onLog: Function;
  onProgress: Function;
  onStatus: Function;
  onResult: Function;
  onFinish: Function;
  uploadResults: boolean;
  urlLimit: number;
};

type InputList = Array<string>;

async function measure(input: string): Promise<[string, number]> {
  let result: string;
  const start_time = performance.now();
  try {
    let resp = await fetch(input, {
      method: "GET",
      mode: "no-cors",
      cache: "no-store",
      credentials: "omit",
      referrer: "no-referrer",
      referrerPolicy: "no-referrer",
      redirect: "follow",
      // XXX investigate if using this property: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
      // signal
      headers: {
        "Accept-Language": "en-US,en;q=0.8",
        "Accept-Charset": "ISO-8859-1,utf-8;q=0.7,*;q=0.3",
      },
    });
    console.log(resp);
    result = "ok";
  } catch (error) {
    console.log("failed to measure with error", error);
    result = "error";
  }
  return [result, performance.now() - start_time];
}

class Runner {
  geoip: GeoIPLookup;

  apiBaseURL: string;

  // onLog is a handler that is called whenever a log message needs to be
  // written to the log console.
  private onLog: Function;

  // onProgress is a handler that is called whenever a progress update event
  // happens.
  private onProgress: Function;

  // onStatus is a handler that is called whenever the current status of a
  // running test is updated. Only one state is possible at a given moment.
  private onStatus: Function;

  // onFinish is a handler that is called when the test has finished running
  // and results are available.
  // XXX maybe it's cleaner to return this via the promise from run(), however
  // it's considered an antipattern to do that inside of the useEffect hook so
  // some better approach should be devised.
  private onFinish: Function;

  // onResult is called every time we have a measurement result available
  private onResult: Function;

  private uploadResults: boolean;
  private urlLimit: number;

  constructor(options: RunnerOptions) {
    this.uploadResults = options.uploadResults;
    this.onLog = options.onLog;
    this.onProgress = options.onProgress;
    this.onStatus = options.onStatus;
    this.onResult = options.onResult;
    this.onFinish = options.onFinish;
    this.urlLimit = options.urlLimit;
    this.apiBaseURL = "https://ams-pg-test.ooni.org";
  }

  async checkinRequest(): Promise<InputList> {
    const req = {
      charging: true,
      on_wifi: true,
      platform: "browser",
      run_type: "timed",
      software_name: software_name,
      software_version: software_version,
      web_connectivity: {
        category_codes: [],
      },
    };
    const checkInURL = `${this.apiBaseURL}/api/v1/check-in`;
    this.onLog(`Fetching URLs via ${checkInURL}`);
    const resp = await fetch(checkInURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    });
    const j = await resp.json();
    this.geoip = {
      probe_asn: j["probe_asn"],
      probe_cc: j["probe_cc"],
      probe_network_name: j["probe_network_name"],
    };

    let urls = j["tests"]["web_connectivity"]["urls"].map((u) => u.url);
    if (this.urlLimit !== 0) {
      urls = urls.slice(0, this.urlLimit);
    }
    return urls;
  }

  async openReport(
    test_start_time: string,
    test_name: string,
    test_version: string
  ): Promise<string> {
    const req = {
      data_format_version: data_format_version,
      format: "json",
      probe_asn: this.geoip.probe_asn,
      probe_cc: this.geoip.probe_cc,
      software_name: software_name,
      software_version: software_version,
      test_name: test_name,
      test_start_time: test_start_time,
      test_version: test_version,
    };
    const openReportURL = `${this.apiBaseURL}/report`;
    this.onLog(`Opening report via ${openReportURL}`);
    const resp = await fetch(openReportURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    });
    const j = await resp.json();
    return j["report_id"];
  }

  async submitMeasurement(measurement: Measurement): Promise<string> {
    const req = {
      content: measurement,
      format: "json",
    };
    const submitMeasurementURL = `${this.apiBaseURL}/report/${measurement.report_id}`;
    this.onLog(`Submitting measurement via ${submitMeasurementURL}`);
    const resp = await fetch(submitMeasurementURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    });
    const j = await resp.json();
    return j["measurement_uid"];
  }

  async run(): Promise<Array<Measurement>> {
    let results = [];

    const test_name = "browser_web";
    const test_version = "0.1.0";

    this.onLog("looked up geoIP", this.geoip);
    const inputs = await this.checkinRequest();
    this.onLog("looked up inputs", inputs);

    const test_start_time = new Date()
      .toISOString()
      .replace("T", " ")
      .slice(0, 19);
    let report_id = "";
    if (this.uploadResults === true) {
      report_id = await this.openReport(
        test_start_time,
        test_name,
        test_version
      );
    }
    for (let idx = 0; idx < inputs.length; idx++) {
      let i = inputs[idx];
      let progress = (idx / inputs.length) * 100;
      this.onProgress(progress);
      const measurement_start_time = new Date()
        .toISOString()
        .replace("T", " ")
        .slice(0, 19);
      let measurement: Measurement = {
        software_name,
        software_version,
        test_start_time,
        test_name,
        test_version,
        data_format_version,
        report_id,
        measurement_start_time,
        probe_asn: this.geoip.probe_asn,
        probe_cc: this.geoip.probe_cc,
        probe_network_name: this.geoip.probe_network_name,
        input: i,
        test_runtime: 0,
        test_keys: { result: "", load_time_ms: 0 },
      };
      this.onStatus(`Measuring ${i}`);
      this.onLog(`Measuring ${i}`);
      let [result, runtime] = await measure(i);
      measurement.test_runtime = runtime / 1000;
      measurement.test_keys = {
        result: result,
        load_time_ms: runtime,
      };
      this.onLog(`Measured: ${JSON.stringify(measurement)}`);

      if (this.uploadResults === true) {
        const msmtUID = await this.submitMeasurement(measurement);
        this.onLog(`Submitted measurement with UID ${msmtUID}`);
      }
      this.onResult(measurement);
    }
    this.onProgress(100);
    this.onFinish(true);
    return results;
  }
}

export default Runner;
