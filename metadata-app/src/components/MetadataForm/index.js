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

  if (curDatasetId && shouldFetch) {
    setShouldFetch(false);
    Api.fetchDataset(curDatasetId, apiUrl, apiKey)
      .then((result) => {
        const apiRes = Object.assign({}, result);
        apiRes.description = result.notes;
        setFormValues(Object.assign({}, formValues, apiRes));
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
                  if (values.saveDraft) {
                    setDraftSaved(new Date());
                  } else {
                    setAlert(<AlertBox type="success" heading="Dataset saved successfully" />);
                    setCurrentStep(1);
                    window.scrollTo(0, 0);
                  }
                })
                .catch((e) => {
                  setAlert(
                    <AlertBox
                      type="error"
                      heading="Error saving metadata"
                      // message="See the console output for more information on this error."
                      message={JSON.stringify(e)}
                    />
                  );
                });
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
                .catch((e) => {
                  setAlert(
                    <AlertBox
                      type="error"
                      heading="Error saving metadata"
                      message={JSON.stringify(e)}
                      // message="See the console output for more information on this error."
                    />
                  );
                });
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
                .catch((error) => {
                  const message = JSON.stringify(error);
                  setAlert(
                    <AlertBox
                      type="error"
                      heading="Error saving additional metadata"
                      message={message}
                    />
                  );
                  window.scrollTo(0, 0);
                });
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
            lastSavedResourceName: null,
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
                        setFieldValue('lastSavedResourceName', values.resource.name);
                        setFieldValue('resource', JSON.parse(JSON.stringify(ResourceObject)));
                      }
                    }
                  })
                  .catch((error) => {
                    const message = JSON.stringify(error);
                    setAlert(
                      <AlertBox type="error" heading="Error saving resource(s)" message={message} />
                    );
                    window.scrollTo(0, 0);
                    console.error('CREATE RESOURCE ERROR', error); // eslint-disable-line
                  });
              } else if (values.publish) {
                // Update dataset state: 'draft' => 'active'
                Api.patchDataset(curDatasetId, { state: 'active' }, apiUrl, apiKey).then((res) => {
                  if (res.status === 200) {
                    // Redirect to dataset page
                    window.location.replace(datasetPageUrl);
                  }
                });
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
