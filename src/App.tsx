import React, { useState, useRef, useEffect } from 'react'

import runExperiment from './runExperiment'

const App = () => {
    const [ updates, setUpdate ] = useState([])
    const runnerRef = useRef()
    useEffect(() => {
        runnerRef.current = runExperiment((u) => {
            setUpdate(updates => [...updates, u])
        })
    }, [])
    return (
        <div className="App">
            <h2>Running</h2>
            {updates.map(u => <p>{u.toString()}</p>)}
        </div>
    );
}

export default App;
    