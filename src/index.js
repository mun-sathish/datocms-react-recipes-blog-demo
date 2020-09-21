import React from "react";
import ReactDOM from "react-dom";
import "./index.sass";
import App from "./netlify-identity-example/App";
import netlifyIdentity from "netlify-identity-widget";

window.netlifyIdentity = netlifyIdentity;
// You must run this once before trying to interact with the widget
netlifyIdentity.init();

ReactDOM.render(<App />, document.getElementById("root"));
