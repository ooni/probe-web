import * as React from "react";
import { useEffect } from "react";

import { createGlobalStyle, ThemeProvider } from "styled-components";
import styled from "styled-components";

import { Flex, Box, Heading, theme } from "ooni-components";
import { Routes, Route, useNavigate } from "react-router-dom";

import RunningTest from "./components/RunningTest";
import Onboard from "./components/Onboard";
import Home from "./components/Home";
import OONILogo from "./components/OONILogo";

const GlobalStyle = createGlobalStyle`
  * {
    text-rendering: geometricPrecision;
    box-sizing: border-box;
  }
  body, html {
    margin: 0;
    padding: 0;
    font-family: "Fira Sans";
    font-size: 14px;
    height: 100%;
    background-color: #ffffff;
  }
`;

const AppContainer = styled.div``;

const SideBar = styled.div`
  height: 100vh;
  width: 300px;
  position: fixed;
  background-color: ${(props) => props.theme.colors.primary};
`;

const Content = styled.div`
  margin-left: 300px;
`;

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const consent = window.localStorage.getItem("informedConsent");
    if (consent !== "yes") {
      navigate("onboard");
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContainer>
        <SideBar>
          <Flex alignItems="center" height="100vh" flexWrap="wrap" pl={4}>
            <Box width={1}>
              <OONILogo width={150} height={50} />
              <Heading h={3} color="white">
                Probe Web
              </Heading>
            </Box>
          </Flex>
        </SideBar>
        <Content>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="run" element={<RunningTest />} />
            <Route path="onboard" element={<Onboard />} />
          </Routes>
        </Content>
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;
