import React from 'react';
import PropTypes from 'prop-types';
import MetadataForm from './components/MetadataForm';

const App = (props) => {
  const { apiUrl, apiKey, ownerOrg, datasetId } = props;
  // console.log({ apiUrl, apiKey, ownerOrg }); // eslint-disable-line
  return (
    <div className="App">
      <MetadataForm apiUrl={apiUrl} apiKey={apiKey} ownerOrg={ownerOrg} datasetId={datasetId} />
    </div>
  );
};

App.propTypes = {
  apiUrl: PropTypes.string.isRequired,
  apiKey: PropTypes.string.isRequired,
  ownerOrg: PropTypes.string, // required if creating new dataset
  datasetId: PropTypes.string,
};

export default App;
