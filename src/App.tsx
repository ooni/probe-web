import * as React from 'react'
import { useEffect } from 'react'

import { createGlobalStyle, ThemeProvider } from 'styled-components'

import { theme } from 'ooni-components'
import { Routes, Route, useNavigate } from "react-router-dom";

import RunningTest from './components/RunningTest'
import Onboard from './components/Onboard'
import Home from './components/Home'

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
    const navigate = useNavigate()

    useEffect(() => {
        const consent = window.localStorage.getItem('informedConsent');
        if (consent !== 'yes') {
            navigate('onboard')
        }
    }, [])

    return (
        <ThemeProvider theme={theme}>
            <GlobalStyle />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="run" element={<RunningTest/>} />
                <Route path="onboard" element={<Onboard />} />
            </Routes>
        </ThemeProvider>
    );
}

export default App;
    