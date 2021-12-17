import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    ReactDOM.render(
        <App />,
        document.getElementById('root')
    );
})