import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

const root = document.getElementById('root');
const apiUrl = root.getAttribute('data-apiUrl') || 'http://localhost:5000/api/3/action/';
const apiKey = root.getAttribute('data-apiKey') || 'a99bb2cc-c6da-4ea3-acf9-b7eab58c6c42';
const ownerOrg = root.getAttribute('data-ownerOrg') || '123';
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
