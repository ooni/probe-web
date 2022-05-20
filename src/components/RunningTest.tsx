import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { Line } from "rc-progress";

import styled from "styled-components";

import { Heading, Text, Container, theme } from "ooni-components";

import Runner from "./Runner";
import type { RunnerOptions, Measurement } from "./Runner";

const HeroUnit = styled.div`
  background: linear-gradient(
      319.33deg,
      ${(props) => props.theme.colors.blue9} 39.35%,
      ${(props) => props.theme.colors.base} 82.69%
    ),
    ${(props) => props.theme.colors.base};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  padding-bottom: 16px;
  padding-top: 16px;
`;

const LogContainer = styled.div`
  background-color: ${(props) => props.theme.colors.gray8};
  color: ${(props) => props.theme.colors.white};
  padding-left: 32px;
  height: 300px;
  overflow: scroll;
`;

const RunningTest = () => {
  const [logs, setLog] = useState([]);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("Starting...");
  const [progress, setProgress] = useState(0);
  const [finished, setFinished] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const runnerRef = useRef<Runner>();
  const logEndRef = useRef<HTMLDivElement>();

  let runnerOptions: RunnerOptions = {
    onLog: (l) => {
      setLog((logs) => [...logs, l]);
    },
    onProgress: setProgress,
    onStatus: setStatus,
    onFinish: setFinished,
    onResult: (newResult : Measurement) => setResults(prevResults => [...prevResults, newResult]),
    uploadResults: true,
    urlLimit: 10,
  };

  useEffect(() => {
    const qOptions = searchParams.get("options");
    if (qOptions) {
      const parsedOptions = JSON.parse(atob(qOptions));
      runnerOptions.urlLimit = parsedOptions.urlLimit;
      runnerOptions.uploadResults = parsedOptions.uploadResults;
    }
    const runner = new Runner(runnerOptions);
    runnerRef.current = runner;
    runner.run();
  }, []);

  useEffect(() => {
    if (finished === false) {
        logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  });

  return (
    <div className="App">
      <HeroUnit>
        <Container>
          <Heading h={2} px={4} color="white">
            {finished ? "Finished" : status}
          </Heading>
          {!finished && <Line percent={progress} strokeColor={theme.colors.gray5} />}
        </Container>
      </HeroUnit>
      {!finished && <LogContainer>
        {logs.map((l) => (
          <Text>{l.toString()}</Text>
        ))}
        <div ref={logEndRef}></div>
      </LogContainer>}
      <ul>
        {results.map((r) => (
          <li>
            {r.test_keys.result == "ok" ? "✅" : "❌"} {r.input} (
            {r.test_runtime})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RunningTest;
