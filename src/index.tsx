import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { BrowserRouter } from "react-router-dom";

import App from './App'

document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    ReactDOM.render(
        <BrowserRouter>
            <App />
        </BrowserRouter>,
        document.getElementById('root')
    );
})