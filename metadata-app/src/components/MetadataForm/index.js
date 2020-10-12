import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Formik, Form } from 'formik';
import RequiredMetadata from '../RequiredMetadata';
import RequiredMetadataSchema from '../RequiredMetadata/validationSchema';
import RequiredMetadataLabels from '../RequiredMetadata/validationLabels';
import defaultRequiredValues from '../RequiredMetadata/defaultValues';
import defaultAdditionalValues from '../AdditionalMetadata/defaultValues';
import AdditionalMetadata from '../AdditionalMetadata';
import AdditionalMetadataSchema from '../AdditionalMetadata/validationSchema';
import ResourceUpload from '../ResourceUpload';
import ResourceUploadSchema from '../ResourceUpload/validationSchema';
import ResourceObject from '../ResourceUpload/ResourceObject';
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

const formatDate = (date) => {
  return `${[`0${date.getHours()}`.slice(-2), `0${date.getMinutes()}`.slice(-2)].join(':')}, ${[
    `0${date.getMonth() + 1}`.slice(-2),
    `0${date.getDate()}`.slice(-2),
    date.getFullYear().toString().slice(-2),
  ].join('-')}`;
};

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
  const [formValues, setFormValues] = useState({
    ...defaultRequiredValues,
    ...defaultAdditionalValues,
    state: 'draft',
    saveDraft: false,
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [alert, setAlert] = useState();
  const [draftSaved, setDraftSaved] = useState();

  const handleError = (err) => {
    let message = [];
    if (err.response) {
      // client received an error response (5xx, 4xx)
      if (err.response.data && err.response.data.error) {
        message = Object.keys(err.response.data.error).map((item) => {
          if (typeof err.response.data.error[item] === 'object') {
            return err.response.data.error[item].join('; ');
          }
          return err.response.data.error[item];
        });
      } else {
        message = 'Something has failed. Please, try again later or contact site administrator.';
      }
    } else if (err.request) {
      // client never received a response, or request never left. Likely it's a network issue.
      message =
        'Please, check your connection or try again later. If the issue persists, contact site administrator.';
    } else {
      // anything else - not a axios/network issue.
      message = 'Something has failed. Please, try again later or contact site administrator.';
    }

    setAlert(<AlertBox type="error" heading="Error saving metadata" message={message} />);
    window.scrollTo(0, 0);
  };

  if (curDatasetId && shouldFetch) {
    setShouldFetch(false);
    Api.fetchDataset(curDatasetId, apiUrl, apiKey)
      .then((result) => {
        const apiRes = Object.assign({}, result);
        apiRes.description = result.notes;
        setFormValues(Object.assign({}, formValues, apiRes));
        setCurDatasetId(apiRes.id);
      })
      .catch(handleError);
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
                  if (values.saveDraft) {
                    setDraftSaved(new Date());
                  } else {
                    setAlert(<AlertBox type="success" heading="Dataset saved successfully" />);
                    setCurrentStep(1);
                    window.scrollTo(0, 0);
                  }
                })
                .catch(handleError);
            } else {
              Api.createDataset(values, apiUrl, apiKey)
                .then((res) => {
                  setFormValues(res);
                  setCurDatasetId(res.id);
                  if (values.saveDraft) {
                    setDraftSaved(new Date());
                  } else {
                    setAlert(<AlertBox type="success" heading="Dataset saved successfully" />);
                    setCurrentStep(1);
                    window.scrollTo(0, 0);
                  }
                })
                .catch(handleError);
            }
          }}
          validationSchema={RequiredMetadataSchema}
        >
          {({ values, handleSubmit, errors, setFieldValue, submitForm }) => {
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
                      draftSaved={draftSaved ? formatDate(draftSaved) : undefined}
                      setFieldValue={setFieldValue}
                      submitForm={submitForm}
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
              Api.updateDataset(id, values, apiUrl, apiKey)
                .then(() => {
                  if (values.saveDraft) {
                    setDraftSaved(new Date());
                  } else {
                    setAlert(<AlertBox type="success" heading="Dataset saved successfully" />);
                    setCurrentStep(2);
                    window.scrollTo(0, 0);
                  }
                })
                .catch(handleError);
            } else {
              setAlert(
                <AlertBox
                  type="error"
                  heading="No valid metadata saved in step 1."
                  message="Please complete complete step one before submitting step 2."
                />
              );
              window.scrollTo(0, 0);
            }
          }}
          validationSchema={AdditionalMetadataSchema}
        >
          {({ values, handleSubmit, errors, setFieldValue, submitForm }) => {
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
                      draftSaved={draftSaved ? formatDate(draftSaved) : undefined}
                      setFieldValue={setFieldValue}
                      submitForm={submitForm}
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
            resource: JSON.parse(JSON.stringify(ResourceObject)),
            publish: true,
            savedResources: 0,
            lastSavedResource: null,
            saveDraft: false,
          }}
          enableReinitialize="true"
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={(values, { setFieldValue }) => {
            // Check if resource should be created, eg, user added any metadata:
            const resourceMetadataChanged =
              JSON.stringify(ResourceObject) !== JSON.stringify(values.resource);
            if (curDatasetId) {
              const apiUrlObject = new URL(apiUrl);
              const datasetPageUrl = `${apiUrlObject.origin}/dataset/${curDatasetId}`;
              if (resourceMetadataChanged) {
                Api.createResource(curDatasetId, values.resource, apiUrl, apiKey)
                  .then((res) => {
                    if (res.status === 200) {
                      if (values.publish) {
                        // Update dataset state: 'draft' => 'active'
                        Api.patchDataset(curDatasetId, { state: 'active' }, apiUrl, apiKey).then(
                          (response) => {
                            if (response.status === 200) {
                              // Redirect to dataset page
                              window.location.replace(datasetPageUrl);
                            }
                          }
                        );
                      } else if (values.saveDraft) {
                        setDraftSaved(new Date());
                      } else {
                        setDraftSaved(new Date());
                        setFieldValue('savedResources', values.savedResources + 1);
                        setFieldValue(
                          'lastSavedResource',
                          values.resource.url || values.resource.name
                        );
                        setFieldValue('resource', JSON.parse(JSON.stringify(ResourceObject)));
                      }
                    }
                  })
                  .catch(handleError);
              } else if (values.publish) {
                // Update dataset state: 'draft' => 'active'
                Api.patchDataset(curDatasetId, { state: 'active' }, apiUrl, apiKey)
                  .then((res) => {
                    if (res.status === 200) {
                      // Redirect to dataset page
                      window.location.replace(datasetPageUrl);
                    }
                  })
                  .catch(handleError);
              }
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
          render={({ values, errors, handleSubmit, setFieldValue, submitForm }) => (
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
                <ResourceUpload
                  values={values}
                  errors={errors}
                  draftSaved={draftSaved ? formatDate(draftSaved) : undefined}
                  setFieldValue={setFieldValue}
                  submitForm={submitForm}
                />

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
