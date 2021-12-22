import React, { useState, useRef, useEffect } from 'react'

import styled from 'styled-components'

import { 
    Heading,
    Text
} from 'ooni-components'

import Runner from './Runner'
import type { RunnerOptions } from './Runner'

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

const RunningTest = () => {
    const [ logs, setLog ] = useState([])
    const [ results, setResults] = useState([])
    const [ status, setStatus] = useState('Starting...')
    const [ progress, setProgress] = useState(0)

    const runnerRef = useRef()
    const logEndRef = useRef()

    const runnerOptions : RunnerOptions = {
        onLog: (l) => {
            setLog(logs => [...logs, l])
        },
        onProgress: setProgress,
        onStatus: setStatus,
        onResults: setResults,
        uploadResults: true,
        urlLimit: 10
    }

    useEffect(() => {
        const runner = new Runner(runnerOptions)
        runnerRef.current = runner
        runner.run()
    }, [])

    useEffect(() => {
        logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    })

    return (
        <div className="App">
            <HeroUnit>
                <Heading h={2} px={4} color='white'>{status}</Heading>
            </HeroUnit>
            <LogContainer>
                {logs.map(l => <Text>{l.toString()}</Text>)}
                <div ref={logEndRef}></div>
            </LogContainer>
            <ul>
                {results.map(r => <li>{r.test_keys.result == 'ok' ? '✅' : '❌'} {r.input} ({r.test_runtime})</li>)}
            </ul>
        </div>
    );
}

export default RunningTest;
    