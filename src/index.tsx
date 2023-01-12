import * as React from "react";
import * as ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";
import { IntlProvider } from "react-intl";
import "@fontsource/fira-sans";

import messages from "../lang/en.json";

import App from "./App";

document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM fully loaded and parsed");
  ReactDOM.render(
    <IntlProvider locale="en" messages={messages}>
      <HashRouter>
        <App />
      </HashRouter>
    </IntlProvider>,
    document.getElementById("root")
  );
});
