import * as React from "react";
import { useState } from "react";

import { createGlobalStyle, ThemeProvider } from "styled-components";
import styled from "styled-components";

import { Flex, Box, Heading, Modal as BaseModal, Text, theme } from "ooni-components";
import { Routes, Route, useNavigate } from "react-router-dom";

import { FormattedMessage } from "react-intl"

import RunningTest from "./components/RunningTest";
import Sections from "./components/onboard/Sections";
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
  @media only screen and (max-width: 768px) {
    display: none;
  }
`;

const Content = styled.div`
  margin-left: 300px;
  @media only screen and (max-width: 768px) {
    margin-left: 0;
  }
`;

const UnsupportedBrowserContainer = styled.div`
  height: 90vh;
  width: 90vw;
  padding: 30px;
  text-align: center;
`

const OnboardSectionContainer = styled.div`
  color: ${(props) => props.theme.colors.white};
`;

const Modal = styled(BaseModal)`
    border-radius: 30px;
    @media only screen and (max-width: 768px) {
        width: 100%;
    }
`

const isBrowserSupported = () => {
  return 'fetch' in window
  return !('fetch' in window)
}

const gaveInformedConsent = () => {
  return window.localStorage.getItem("informedConsent") === "yes";
}

const App = () => {
  const [informedConsent, setInformedConsent] = useState(gaveInformedConsent());

  const onGo = (crashReporting: boolean) => {
    if (crashReporting === true) {
      window.localStorage.setItem("crashReporting", "yes");
    } else {
      window.localStorage.setItem("crashReporting", "no");
    }
    window.localStorage.setItem("informedConsent", "yes");
    setInformedConsent(true);
  };

  const onResetInformedConsent = () => {
    window.localStorage.clear();
    setInformedConsent(false);
  };


  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContainer>
        <SideBar>
          <Flex alignItems="center" height="100vh" flexWrap="wrap" pl={4}>
            <Box width={1}>
              <OONILogo width={150} height={50} />
              <Heading h={3} color="white">
                <FormattedMessage id="General.AppName" />
              </Heading>
            </Box>
          </Flex>
        </SideBar>
        <Content>

          <Modal show={!isBrowserSupported()} sx={{ borderRadius: 30 }}>
            <UnsupportedBrowserContainer>
              <Heading>
                <FormattedMessage id="UnsupportedBrowser.Title" />
              </Heading>
              <Text>
                <FormattedMessage id="UnsupportedBrowser.PleaseUpgrade" />
            </Text>
              <ul>
                <li><a href="https://www.mozilla.org/firefox/download/">Mozilla Firefox</a></li>
                <li><a href="https://www.google.com/chrome/">Google Chrome</a></li>
                <li><a href="https://brave.com/">Brave Browser</a></li>
              </ul>
            </UnsupportedBrowserContainer>
          </Modal>

          <Modal show={!informedConsent && isBrowserSupported()} borderRadius={30}>
            <OnboardSectionContainer>
              <Sections onGo={onGo} />
            </OnboardSectionContainer>
          </Modal>

          {informedConsent &&
            <Routes>
              <Route path="/" element={<Home onResetInformedConsent={onResetInformedConsent} />} />
              <Route path="run" element={<RunningTest />} />
            </Routes>
          }
        </Content>
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;
