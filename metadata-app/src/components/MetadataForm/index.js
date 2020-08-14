import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Formik, Form } from 'formik';
import RequiredMetadata from '../RequiredMetadata';
import defaultRequiredValues from '../RequiredMetadata/defaultValues';
import Navigation from '../Navigation';
import AlertBox from '../AlertBox';
import Api from '../../api';
import '../../css/custom.css';
import '../../css/uswds.css';

const MetadataForm = (props) => {
  const { apiUrl, apiKey, ownerOrg } = props;
  const [requiredValues, setRequiredValues] = useState(defaultRequiredValues);
  const [currentStep, setCurrentStep] = useState(0);
  const [alert, setAlert] = useState();

  // render metadata form
  return (
    <div className="grid-container">
      <Navigation currentStep={currentStep} handleSteps={setCurrentStep} />
      {alert}
      <Formik
        initialValues={requiredValues}
        enableReinitialize="true"
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={(values) => {
          Api.createDataset(ownerOrg, values, apiUrl, apiKey)
            .then((res) => {
              setAlert(<AlertBox type="success" heading="Dataset updated successfully" />);
              setRequiredValues(res);
              window.scrollTo(0, 0);
            })
            .catch((error) => {
              console.error('CREATE DATASET ERROR', error); // eslint-disable-line
              window.scrollTo(0, 0);
            });
        }}
      >
        {({ values, errors, handleSubmit }) => (
          <div>
            <Form onSubmit={handleSubmit}>
              {currentStep === 0 && (
                <div>
                  <RequiredMetadata
                    apiKey={apiKey}
                    apiUrl={apiUrl}
                    ownerOrg={ownerOrg}
                    currentStep={1}
                    fetchDatasetsOpts="false"
                    values={values}
                    errors={errors}
                  />
                </div>
              )}
            </Form>
          </div>
        )}
      </Formik>
    </div>
  );
};

MetadataForm.propTypes = {
  apiUrl: PropTypes.string.isRequired,
  apiKey: PropTypes.string.isRequired,
  ownerOrg: PropTypes.string.isRequired,
};

export default MetadataForm;
