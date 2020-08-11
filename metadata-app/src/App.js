import React from 'react';
import PropTypes from 'prop-types';
import MetadataForm from './components/MetadataForm';

const App = (props) => {
  const { apiUrl, apiKey } = props;

  return (
    <div className="App">
      <MetadataForm apiUrl={apiUrl} apiKey={apiKey} />
    </div>
  );
};

App.propTypes = {
  apiUrl: PropTypes.string.isRequired,
  apiKey: PropTypes.string.isRequired,
};

export default App;
