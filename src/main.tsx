import React from "react";
import ReactDOM from "react-dom/client"; // Correct import for React 18
import App from "./App";
// import "@elastic/eui/dist/eui_theme_light.css";
// import "@elastic/eui/dist/eui_theme_dark.css";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "./app/store";

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
