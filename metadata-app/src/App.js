import React from 'react';
import PropTypes from 'prop-types';
import MetadataForm from './components/MetadataForm';

const App = (props) => {
  const { apiUrl, apiKey, ownerOrg } = props;
  console.log({ apiUrl, apiKey, ownerOrg }); // eslint-disable-line
  return (
    <div className="App">
      <MetadataForm apiUrl={apiUrl} apiKey={apiKey} ownerOrg={ownerOrg} />
    </div>
  );
};

App.propTypes = {
  apiUrl: PropTypes.string.isRequired,
  apiKey: PropTypes.string.isRequired,
  ownerOrg: PropTypes.string.isRequired,
};

export default App;
