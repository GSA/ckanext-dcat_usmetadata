import React from 'react';
import MetadataForm from '.';

export default {
  new: (
    <MetadataForm
      apiUrl="http://localhost:5000/api/3/action/"
      apiKey="6556b77b-b96b-4352-999c-bde4a0d86cce"
      ownerOrg="test-org-1"
    />
  ),
  edit: (
    <MetadataForm
      apiUrl="http://localhost:5000/api/3/action/"
      apiKey="6556b77b-b96b-4352-999c-bde4a0d86cce"
      ownerOrg="test-org-1"
      datasetId="pacam"
    />
  ),
};
