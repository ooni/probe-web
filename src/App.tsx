import React, { useState, useRef, useEffect } from 'react'

import Runner from './Runner'

const App = () => {
    const [ logs, setLog ] = useState([])
    const [ status, setStatus] = useState('')
    const [ progress, setProgress] = useState(0)

    const runnerRef = useRef()

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

    return (
        <div className="App">
            <h2>{status}</h2>
            {logs.map(l => <p>{l.toString()}</p>)}
        </div>
    );
}

export default App;
    