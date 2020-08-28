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

const Heading = (props) => {
  const { currentStep } = props;

  if (currentStep === 0) {
    return (
      <h1 className="usite-page-title" id="basic-mega-menu">
        Required Metadata
      </h1>
    );
  }
  if (currentStep === 1) {
    return (
      <h1 className="usite-page-title" id="basic-mega-menu">
        Additional Metadata
      </h1>
    );
  }
  return '';
};

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
      <Heading currentStep={currentStep} />

      {/* Page 1 -- Required Metadata */}
      {currentStep === 0 && (
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
                setAlert(
                  <AlertBox type="error" heading="Error saving metadata" message={message} />
                );
                console.error('CREATE DATASET ERROR', error); // eslint-disable-line
                window.scrollTo(0, 0);
              });
          }}
          validationSchema={RequiredMetadataSchema}
        >
          {({ values, handleSubmit, errors, isSubmitting, isValidating }) => {
            return (
              <div>
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
                </Form>
              </div>
            );
          }}
        </Formik>
      )}

      {currentStep === 1 && (
        <Formik
          initialValues={requiredValues} // TODO
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
                setAlert(
                  <AlertBox type="error" heading="Error saving metadata" message={message} />
                );
                console.error('CREATE DATASET ERROR', error); // eslint-disable-line
                window.scrollTo(0, 0);
              });
          }}
          validationSchema={RequiredMetadataSchema}
        >
          {({ values, handleSubmit, errors, isSubmitting, isValidating }) => {
            return (
              <div>
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
                  <div>
                    <AdditionalMetadata
                      apiKey={apiKey}
                      apiUrl={apiUrl}
                      ownerOrg={ownerOrg}
                      currentStep={1}
                      fetchDatasetsOpts="false"
                      values={values}
                      errors={errors}
                    />
                  </div>
                </Form>
              </div>
            );
          }}
        </Formik>
      )}
    </div>
  );
};

MetadataForm.propTypes = {
  apiUrl: PropTypes.string.isRequired,
  apiKey: PropTypes.string.isRequired,
  ownerOrg: PropTypes.string.isRequired,
};

export default MetadataForm;
