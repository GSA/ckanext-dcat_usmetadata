import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

const root = document.getElementById('root');
const apiUrl = root.getAttribute('data-apiUrl');
// API key is only needed when running the React app outside of CKAN and only
// for development purposes. In production, we shouldn't expose API key in
// HTML template so that variable 'apiKey' below has value of undefined. This
// would work because CKAN authenticates the caller using the session information.
const apiKey = root.getAttribute('data-apiKey');
const ownerOrg = root.getAttribute('data-ownerOrg');
const datasetId = root.getAttribute('data-datasetId');

ReactDOM.render(
  <React.StrictMode>
    <App apiUrl={apiUrl} apiKey={apiKey} ownerOrg={ownerOrg} datasetId={datasetId} />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
