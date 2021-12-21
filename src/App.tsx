import React, { useState, useRef, useEffect } from 'react'

import { createGlobalStyle, ThemeProvider } from 'styled-components'
import styled from 'styled-components'

import { theme } from 'ooni-components'

import { 
    Heading,
    Text
} from 'ooni-components'

import Runner from './Runner'

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

const HeroUnit = styled.div`
background: linear-gradient(
    319.33deg,
    ${props => props.theme.colors.blue9} 39.35%,
    ${props => props.theme.colors.base} 82.69%),
    ${props => props.theme.colors.base};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  padding-bottom: 16px;
  padding-top: 16px;
`

const LogContainer = styled.div`
    background-color: ${props => props.theme.colors.gray8};
    color: ${props => props.theme.colors.white};
    padding-left: 32px;
    height: 300px;
    overflow: scroll;
`

const App = () => {
    const [ logs, setLog ] = useState([])
    const [ status, setStatus] = useState('')
    const [ progress, setProgress] = useState(0)

    const runnerRef = useRef()
    const logEndRef = useRef()

    const onLog = (l) => {
        setLog(logs => [...logs, l])
    }

    const onProgress = (p) => {
        setProgress(p)
    }

    const onStatus = (s) => {
        setStatus(s)
    }


    useEffect(() => {
        const runner = new Runner(onLog, onProgress, onStatus)
        runnerRef.current = runner
        runner.run()
    }, [])

    useEffect(() => {
        logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    })

    return (
        <ThemeProvider theme={theme}>
            <GlobalStyle />
            <div className="App">
                <HeroUnit>
                    <Heading h={2} px={4} color='white'>{status}</Heading>
                </HeroUnit>
                <LogContainer>
                    {logs.map(l => <Text>{l.toString()}</Text>)}
                    <div ref={logEndRef}></div>
                </LogContainer>
            </div>
        </ThemeProvider>

    );
}

export default App;
    