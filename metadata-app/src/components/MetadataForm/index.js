import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Formik, Form } from 'formik';
import RequiredMetadata from '../RequiredMetadata';
import RequiredMetadataSchema from '../RequiredMetadata/validationSchema';
import RequiredMetadataLabels from '../RequiredMetadata/validationLabels';
import defaultRequiredValues from '../RequiredMetadata/defaultValues';
import AdditionalMetadata from '../AdditionalMetadata';
import Navigation from '../Navigation';
import AlertBox from '../AlertBox';
import ErrorFocus from '../ErrorFocus';
import Api from '../../api';
import '../../css/custom.css';
import '../../css/uswds.css';

const formatErrors = (errors) =>
  Object.keys(errors).map((name) => {
    return {
      name,
      label: RequiredMetadataLabels[name],
      message: errors[name],
    };
  });

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
              const message = JSON.stringify(error);
              setAlert(<AlertBox type="error" heading="Error saving metadata" message={message} />);
              console.error('CREATE DATASET ERROR', error); // eslint-disable-line
              window.scrollTo(0, 0);
            });
        }}
        validationSchema={RequiredMetadataSchema}
      >
        {({ values, handleSubmit, errors, isSubmitting, isValidating }) => {
          return (
            <div>
              {currentStep === 0 && (
                <h1 className="usite-page-title" id="basic-mega-menu">
                  Required Metadata
                </h1>
              )}
              {currentStep === 1 && (
                <h1 className="usite-page-title" id="basic-mega-menu">
                  Additional Metadata
                </h1>
              )}
              {errors && Object.keys(errors).length > 0 && (
                <div>
                  <AlertBox
                    type="error"
                    heading="This form contains invalid entries"
                    errors={formatErrors(errors)}
                  />
                  <ErrorFocus
                    errors={errors}
                    isSubmitting={isSubmitting}
                    isValidating={isValidating}
                  />
                </div>
              )}
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
                {currentStep === 1 && (
                  <div>
                    <AdditionalMetadata
                      apiKey={apiKey}
                      apiUrl={apiUrl}
                      ownerOrg={ownerOrg}
                      currentStep={2}
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
