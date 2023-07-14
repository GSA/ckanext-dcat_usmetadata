import React from 'react';
import AlertBox from '.';

const errors = {
  contact_name: 'Contact is required',
  unique_id: 'Unique ID is required',
  contact_email: 'Contact email is required',
  publisher: 'Publisher is required',
  public_access_level: 'Access level is required',
};

export default {
  formAlerts: (
    <div style={{ margin: '1em' }}>
      <AlertBox type="error" heading="This form contains invalid entries:" errors={errors} />
    </div>
  ),
  submitSuccess: (
    <div style={{ margin: '1em' }}>
      <AlertBox type="success" heading="You dataset was successfully submitted." />
    </div>
  ),
  warning: (
    <div style={{ margin: '1em' }}>
      <AlertBox
        type="warning"
        heading="This is your final warning!"
        message="This is a message that is related to your warning. Please heed the message."
      />
    </div>
  ),
};
