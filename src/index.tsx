import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import runExperiment from './runExperiment'

document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    runExperiment(console.log)
    ReactDOM.render(
        <App />,
        document.getElementById('root')
    );
})