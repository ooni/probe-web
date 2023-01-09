import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { Line } from "rc-progress";

import styled from "styled-components";

import {
  Flex,
  Box,
  Heading,
  Text,
  Container,
  Button,
  theme,
} from "ooni-components";

import Runner from "./Runner";
import type { RunnerOptions, ResultEntry } from "./Runner";

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

const ResultRow = ({ resultEntry }) => {
  const url = resultEntry.url,
    m = resultEntry.measurement;
  return (
    <Flex>
      <Box pr={2}>{m.test_keys.result == "ok" ? "✅" : "❌"}</Box>
      <Box pr={2}>{Math.round(m.test_keys.load_time_ms)} ms</Box>
      <Box pr={2}>
        {url.category_code} - {url.url}
      </Box>
    </Flex>
  );
};

const RunningTest = () => {
  const [logs, setLog] = useState([]);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("Starting...");
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(true);
  const [failed, setFailed] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const runnerRef = useRef<Runner>();
  const logEndRef = useRef<HTMLDivElement>();

  let runnerOptions: RunnerOptions = {
    onLog: (l: string) => {
      console.log(l)
      setLog((logs) => [...logs, l]);
    },
    onProgress: setProgress,
    onStatus: setStatus,
    onFinish: (success: boolean) => {
      if (success === false) {
        setFailed(true);
      }
      setRunning(false);
    },
    onResult: (newResult: ResultEntry) =>
      setResults((prevResults) => [...prevResults, newResult]),
    uploadResults: true,
    urlLimit: 10,
  };

  const rerun = () => {
    setLog([]);
    setResults([]);
    setStatus("Starting...");
    setProgress(0);
    setFailed(false);
    setRunning(true);
  };

  useEffect(() => {
    if (running === false) {
      return;
    }
    const qOptions = searchParams.get("options");
    if (qOptions) {
      const parsedOptions = JSON.parse(atob(qOptions));
      runnerOptions.urlLimit = parsedOptions.urlLimit;
      runnerOptions.uploadResults = parsedOptions.uploadResults;
    }
    const runner = new Runner(runnerOptions);
    runnerRef.current = runner;
    runner.run();
  }, [running]);

  useEffect(() => {
    if (running === true) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  });

  return (
    <div className="App">
      <HeroUnit>
        <Container>
          <Heading h={2} px={4} color="white">
            {!running && !failed && "Finished"}
            {!running && failed && "Test failed"}
            {running && status}
          </Heading>
          {running && (
            <Line percent={progress} strokeColor={theme.colors.gray5} />
          )}
          {!running && (
            <Button hollow inverted onClick={rerun}>
              Rerun
            </Button>
          )}
        </Container>
      </HeroUnit>
      {running && (
        <LogContainer>
          {logs.map((l) => (
            <Text>{l.toString()}</Text>
          ))}
          <div ref={logEndRef}></div>
        </LogContainer>
      )}
      <ul>
        {results.map((r) => (
          <ResultRow resultEntry={r} />
        ))}
      </ul>
    </div>
  );
};

export default RunningTest;
