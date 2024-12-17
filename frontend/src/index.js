import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { MetaMaskProvider } from "@metamask/sdk-react";
import './index.css';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MetaMaskProvider
      sdkOptions={{
        dappMetadata: {
          name: "Ownership verification",
          url: window.location.href,
        },
        infuraAPIKey: process.env.INFURA_API_KEY,
      }}>
      <App />
    </MetaMaskProvider>
  </React.StrictMode>
);

reportWebVitals();
