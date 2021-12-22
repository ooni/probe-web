import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { IntlProvider } from 'react-intl'

import messages from '../lang/en.json'

import App from './App'

document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    ReactDOM.render(
        <IntlProvider locale='en' messages={messages}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </IntlProvider>,
        document.getElementById('root')
    );
})