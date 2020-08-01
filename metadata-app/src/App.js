import React from 'react';
import './App.css';
import MetadataForm from './components/MetadataForm';

const App = (props) => {
  const opts = {
    apiUrl: 'http://localhost:5000/api/3/action/',
    apiKey: '6556b77b-b96b-4352-999c-bde4a0d86cce',
    ownerOrg: '123',
  };

  const ourOpts = Object.assign({}, { ...props }, { ...opts });

  return (
    <div className="App">
      <MetadataForm {...ourOpts} />
    </div>
  );
};

export default App;
