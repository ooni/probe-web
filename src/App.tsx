import React from 'react'

import { createGlobalStyle, ThemeProvider } from 'styled-components'

import { theme } from 'ooni-components'
import { Routes, Route, Link } from "react-router-dom";

import RunningTest from './components/RunningTest'
import Onboard from './components/Onboard'

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
`
const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <GlobalStyle />
            <Routes>
                <Route path="run" element={<RunningTest/>} />
                <Route path="onboard" element={<Onboard />} />
            </Routes>
        </ThemeProvider>
    );
}

export default App;
    