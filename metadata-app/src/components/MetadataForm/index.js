import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Formik, Form } from 'formik';
import RequiredMetadata from '../RequiredMetadata';
import RequiredMetadataSchema from '../RequiredMetadata/validationSchema';
import RequiredMetadataLabels from '../RequiredMetadata/validationLabels';
import defaultRequiredValues from '../RequiredMetadata/defaultValues';
import AdditionalMetadata from '../AdditionalMetadata';
import AdditionalMetadataSchema from '../AdditionalMetadata/validationSchema';
import ResourceUpload from '../ResourceUpload';
import ResourceUploadSchema from '../ResourceUpload/validationSchema';
import Navigation from '../Navigation';
import AlertBox from '../AlertBox';
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
  const [formValues, setFormValues] = useState(defaultRequiredValues);
  const [currentStep, setCurrentStep] = useState(0);
  const [alert, setAlert] = useState();

  if (curDatasetId && shouldFetch) {
    setShouldFetch(false);
    Api.fetchDataset(curDatasetId, apiUrl, apiKey)
      .then((result) => {
        const apiRes = Object.assign({}, result);
        apiRes.description = result.notes;
        setFormValues(Object.assign({}, apiRes));
        setCurDatasetId(apiRes.id);
      })
      .catch((e) => {
        setAlert(
          <AlertBox
            type="error"
            heading="Error loading metadata"
            message="See the console output for more information on this error."
          />
        );
        console.error('CREATE DATASET ERROR', e); // eslint-disable-line
        window.scrollTo(0, 0);
      });
  }

  // render metadata form
  return (
    <div className="grid-container">
      <Navigation currentStep={currentStep} handleSteps={setCurrentStep} />
      <Heading currentStep={currentStep} />
      {alert}

      {/* ---------- PAGE 1 -- REQUIRED METADATA ---------- */}
      {currentStep === 0 && (
        <Formik
          initialValues={formValues}
          enableReinitialize="true"
          validateOnChange={false}
          validateOnBlur={false}
          validateOnMount={false}
          onSubmit={(values) => {
            // update or create dataset:
            if (curDatasetId) {
              Api.updateDataset(curDatasetId, values, apiUrl, apiKey)
                .then((res) => {
                  setFormValues(Object.assign({}, res, { description: res.notes }));
                  setAlert(<AlertBox type="success" heading="Dataset saved successfully" />);
                  setCurrentStep(1);
                })
                .catch((e) => {
                  setAlert(
                    <AlertBox
                      type="error"
                      heading="Error saving metadata"
                      message="See the console output for more information on this error."
                    />
                  );
                  console.error('CREATE DATASET ERROR', e); // eslint-disable-line
                });
            } else {
              Api.createDataset(ownerOrg, values, apiUrl, apiKey)
                .then((res) => {
                  setFormValues(res);
                  setCurDatasetId(res.id);
                  setAlert(<AlertBox type="success" heading="Dataset saved successfully" />);
                  setCurrentStep(1);
                  window.scrollTo(0, 0);
                })
                .catch((e) => {
                  setAlert(
                    <AlertBox
                      type="error"
                      heading="Error saving metadata"
                      message="See the console output for more information on this error."
                    />
                  );
                  console.error('CREATE DATASET ERROR', e); // eslint-disable-line
                });
            }
          }}
          validationSchema={RequiredMetadataSchema}
        >
          {({ values, handleSubmit, errors }) => {
            return (
              <div>
                {errors && Object.keys(errors).length > 0 && (
                  <div>
                    <AlertBox
                      type="error"
                      heading="This form contains invalid entries"
                      errors={formatErrors(errors)}
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

      {/* ---------- PAGE 2 -- ADDITIONAL METADATA ---------- */}
      {currentStep === 1 && (
        <Formik
          initialValues={formValues}
          enableReinitialize="true"
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={(values) => {
            const id = formValues && formValues.id;
            setFormValues(Object.assign({}, formValues, values));
            if (id) {
              Api.updateDataset(id, formValues, apiUrl, apiKey)
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
                });
            } else {
              setAlert(
                <AlertBox
                  type="error"
                  heading="No valid metadata saved in step 1."
                  message="Please complete complete step one before submitting step 2."
                />
              );
            }
          }}
          validationSchema={AdditionalMetadataSchema}
        >
          {({ values, handleSubmit, errors }) => {
            return (
              <div>
                {errors && Object.keys(errors).length > 0 && (
                  <div>
                    <AlertBox
                      type="error"
                      heading="This form contains invalid entries"
                      errors={formatErrors(errors)}
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
      {/* ---------- PAGE 3 -- RESOURSE UPLOAD ---------- */}
      {currentStep === 2 && (
        <Formik
          initialValues={{
            name: '',
            description: '',
            url: '',
            format: '',
            mimetype: '',
            upload: null,
          }}
          enableReinitialize="true"
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={(values) => {
            if (curDatasetId) {
              Api.createResource(curDatasetId, values, apiUrl, apiKey)
                .then((res) => {
                  if (res.status === 200) {
                    // Redirect to datast page
                    let domain;
                    try {
                      const apiUrlObject = new URL(apiUrl);
                      domain = apiUrlObject.origin;
                    } catch {
                      domain = window.location.host;
                    }
                    const datasetPageUrl = `${domain}/dataset/${curDatasetId}`;
                    window.location(datasetPageUrl);
                  }
                })
                .catch((error) => {
                  const message = JSON.stringify(error);
                  setAlert(
                    <AlertBox type="error" heading="Error saving resource(s)" message={message} />
                  );
                  console.error('CREATE RESOURCE ERROR', error); // eslint-disable-line
                });
            } else {
              setAlert(
                <AlertBox
                  type="error"
                  heading="No valid metadata saved in previous steps."
                  message="Please complete previous steps before submitting resource(s)."
                />
              );
            }
          }}
          validationSchema={ResourceUploadSchema}
          render={({ values, errors, handleSubmit, setFieldValue }) => (
            <div className="">
              {errors && Object.keys(errors).length > 0 && (
                <div>
                  <AlertBox
                    type="error"
                    heading="This form contains invalid entries"
                    errors={formatErrors(errors)}
                  />
                </div>
              )}
              <Form onSubmit={handleSubmit}>
                <ResourceUpload values={values} setFieldValue={setFieldValue} />

                <div className="row">
                  <div className="col-sm-12">
                    <br />
                    <br />
                  </div>
                </div>
              </Form>
            </div>
          )}
        />
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
