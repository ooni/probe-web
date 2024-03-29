const software_name = "ooniprobe-web";
const software_version = require("../../package.json")["version"];
const data_format_version = "0.2.0";

import { getBrowserName } from "./utils"

type GeoIPLookup = {
  probe_cc: string;
  probe_asn: string;
  probe_network_name: string;
};

type TestKeys = {
  browser_name: string;
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
  apiBaseURL?: string;
  urlLimit: number;
};

export type URLEntry = {
  url: string;
  category_code: string;
  country_code: string;
};

export type URLList = Array<URLEntry>;

export type ResultEntry = {
  url: URLEntry;
  measurement: Measurement;
};

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
    result = "ok";
  } catch (error) {
    console.log("failed to measure with error", error);
    result = "error";
  }
  return [result, performance.now() - start_time];
}

class Runner {
  geoip: GeoIPLookup;

  apiBaseURL: string = "https://api.ooni.io";

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

  // String indicating the name of the browser
  private browserName: string;

  constructor(options: RunnerOptions) {
    this.uploadResults = options.uploadResults;
    this.onLog = options.onLog;
    this.onProgress = options.onProgress;
    this.onStatus = options.onStatus;
    this.onResult = options.onResult;
    this.onFinish = options.onFinish;
    this.urlLimit = options.urlLimit;
    this.browserName = getBrowserName();

    if (options.apiBaseURL !== undefined) {
      this.apiBaseURL = options.apiBaseURL;
    }
  }

  async checkinRequest(): Promise<URLList> {
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

    let urls = j["tests"]["web_connectivity"]["urls"];
    if (this.urlLimit != 0) {
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

    this.onLog("starting test");
    let inputs: URLList;
    try {
      inputs = await this.checkinRequest();
    } catch (error) {
      this.onLog("‼ failed to communicate with the check-in API: ${error}");
      return this.onFinish(false);
    }
    this.onLog("looked up inputs and GeoIP", inputs);

    const test_start_time = new Date()
      .toISOString()
      .replace("T", " ")
      .slice(0, 19);
    let report_id = "";
    if (this.uploadResults === true) {
      try {
        report_id = await this.openReport(
          test_start_time,
          test_name,
          test_version
        );
      } catch (error) {
        this.onLog("‼ failed to open report: ${error}");
        return this.onFinish(false);
      }
    }
    for (let idx = 0; idx < inputs.length; idx++) {
      let url_entry = inputs[idx];
      let progress = (idx / inputs.length) * 100;
      // We skip http:// URLs because if they are blocked with blockpages, they
      // would lead to false negatives.
      if (url_entry.url.startsWith("http://") === true) {
        this.onLog(`Skipping ${url_entry.url} because it's HTTP`);
        continue;
      }
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
        input: url_entry.url,
        test_runtime: 0,
        test_keys: { result: "", load_time_ms: 0, browser_name: this.browserName },
      };
      this.onStatus(`Measuring ${url_entry.url}`);
      this.onLog(`Measuring ${url_entry.url}`);
      let [result, runtime] = await measure(url_entry.url);
      measurement.test_runtime = runtime / 1000;
      measurement.test_keys = {
        result: result,
        load_time_ms: runtime,
        browser_name: this.browserName
      };
      this.onLog(`Measured: ${JSON.stringify(measurement)}`);

      if (this.uploadResults === true) {
        try {
          const msmtUID = await this.submitMeasurement(measurement);
          this.onLog(`Submitted measurement with UID ${msmtUID}`);
        } catch (error) {
          this.onLog("‼ failed to upload measurement: ${error}");
        }
      }
      this.onResult({ url: url_entry, measurement });
    }
    this.onProgress(100);
    this.onFinish(true);
    return results;
  }
}

export default Runner;
