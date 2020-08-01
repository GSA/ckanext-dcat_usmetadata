import React from 'react';
import PropTypes from 'prop-types';

const MetadataForm = (props) => {
  const { apiUrl, apiKey, ownerOrg } = props;
  return (
    <div>
      <p>apiUrl : {apiUrl}</p>
      <p>apiKey : {apiKey}</p>
      <p>ownerOrg : {ownerOrg}</p>
    </div>
  );
};

MetadataForm.propTypes = {
  apiUrl: PropTypes.string.isRequired,
  apiKey: PropTypes.string.isRequired,
  ownerOrg: PropTypes.string.isRequired,
};

export default MetadataForm;
