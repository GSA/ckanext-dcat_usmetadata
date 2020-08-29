import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Formik, Form } from 'formik';
import RequiredMetadata from '../RequiredMetadata';
import RequiredMetadataSchema from '../RequiredMetadata/validationSchema';
import RequiredMetadataLabels from '../RequiredMetadata/validationLabels';
import defaultRequiredValues from '../RequiredMetadata/defaultValues';
import AdditionalMetadata from '../AdditionalMetadata';
import AdditionalMetadataSchema from '../AdditionalMetadata/validationSchema';
import defaultAdditionalValues from '../AdditionalMetadata/defaultValues';
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
  const { apiUrl, apiKey, ownerOrg, datasetId } = props;

  const [shouldFetch, setShouldFetch] = useState(true);
  const [curDatasetId, setCurDatasetId] = useState(datasetId); // initial or fetched
  const [requiredValues, setRequiredValues] = useState(defaultRequiredValues);
  // TODO set this on submit:
  const [additionalValues, setAdditionalValues] = useState(defaultAdditionalValues); // eslint-disable-line
  const [currentStep, setCurrentStep] = useState(0);
  const [alert, setAlert] = useState();

  if (curDatasetId && shouldFetch) {
    setShouldFetch(false);
    Api.fetchDataset(curDatasetId, apiUrl, apiKey)
      .then((result) => {
        const apiRes = Object.assign({}, result);
        apiRes.description = result.notes;

        // raw form values
        setRequiredValues(Object.assign({}, defaultAdditionalValues, apiRes));
        setCurDatasetId(apiRes.id);
      })
      .catch((e) => {
        // TODO throw Alert
        console.error('Error fetching metadata', e); // eslint-disable-line
      });
  }

  // render metadata form
  return (
    <div className="grid-container">
      <Navigation currentStep={currentStep} handleSteps={setCurrentStep} />
      {alert}
      <Heading currentStep={currentStep} />

      {/* ---------- PAGE 2 -- ADDITIONAL METADA ---------- */}
      {currentStep === 0 && (
        <Formik
          initialValues={requiredValues}
          enableReinitialize="true"
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={(values) => {
            Api.createDataset(ownerOrg, values, apiUrl, apiKey)
              .then((res) => {
                setRequiredValues(res);
                setAlert(<AlertBox type="success" heading="Dataset updated successfully" />);
                setCurrentStep(1);
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
                      currentStep={0}
                      fetchDatasetsOpts="false"
                      values={values || {}}
                      errors={errors}
                    />
                  </div>
                </Form>
              </div>
            );
          }}
        </Formik>
      )}

      {/* ---------- PAGE 2 -- ADDITIONAL METADA ---------- */}
      {currentStep === 1 && (
        <Formik
          initialValues={additionalValues}
          enableReinitialize="true"
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={(values) => {
            const id = requiredValues && requiredValues.id;
            if (id) {
              Api.updateDataset(id, values, apiUrl, apiKey)
                .then((res) => {
                  console.log('Dataset updated successfully', res); // eslint-disable-line
                  setCurrentStep(2);
                })
                .catch((error) => {
                  const message = JSON.stringify(error);
                  setAlert(
                    <AlertBox
                      type="error"
                      heading="Error saving additional metadata"
                      message={message}
                    />
                  );
                  console.error('UPDATE DATASET ERROR', error); // eslint-disable-line
                  window.scrollTo(0, 0);
                });
            } else {
              // TODO add alert
              console.error('NO VALID DATASET SAVED IN STEP 1'); // eslint-disable-line
            }
          }}
          validationSchema={AdditionalMetadataSchema}
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
                      values={values || {}}
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
  ownerOrg: PropTypes.string, // required if creating new metadata
  datasetId: PropTypes.string,
};

export default MetadataForm;
