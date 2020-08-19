import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Formik, Form } from 'formik';
import RequiredMetadata from '../RequiredMetadata';
import RequiredMetadataSchema from '../RequiredMetadata/validationSchema';
import defaultRequiredValues from '../RequiredMetadata/defaultValues';
import Navigation from '../Navigation';
import '../../css/custom.css';
import '../../css/uswds.css';

const MetadataForm = (props) => {
  const { apiUrl, apiKey, ownerOrg } = props;

  // most of the application state is captured here:
  const [currentStep, setCurrentStep] = useState(0);

  // render metadata form
  return (
    <div className="grid-container">
      <Navigation currentStep={currentStep} handleSteps={setCurrentStep} />
      <Formik
        validationSchema={RequiredMetadataSchema}
        initialValues={defaultRequiredValues}
        enableReinitialize="true"
        validateOnChange={false}
        validateOnBlur={false}
      >
        {({ values, handleSubmit, errors }) => {
          return (
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
          );
        }}
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
