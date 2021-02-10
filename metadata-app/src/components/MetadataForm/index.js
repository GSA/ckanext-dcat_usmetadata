import React, { useState, useEffect } from 'react';
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
import 'uswds/dist/css/uswds.css';

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
    publishing_status: 'Draft',
    private: true,
    saveDraft: false,
  });
  const [updatedResources, setUpdatedResources] = useState(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [alert, setAlert] = useState();
  const [draftSaved, setDraftSaved] = useState();
  const [dashboardUrl, setDashboardUrl] = useState('/dataset');

  // Whenever the step changes update the resources array if there has been any changes
  useEffect(() => {
    setFormValues({ ...formValues, resources: updatedResources || formValues.resources });
  }, [currentStep]);

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
        apiRes.description = result.notes; // TODO: move this to api helpers
        setCurDatasetId(apiRes.id);
        // Fetch parent dataset's human-readable title:
        if (apiRes.parentDataset) {
          Api.fetchDataset(apiRes.parentDataset, apiUrl, apiKey)
            .then((parent) => {
              setFormValues(
                Object.assign({}, formValues, apiRes, {
                  parentDatasetTitle: parent.title,
                })
              );
            })
            .catch(handleError);
        } else {
          setFormValues(Object.assign({}, formValues, apiRes));
        }
      })
      .catch(handleError);
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orgId = urlParams.get('group');
    if (orgId) setDashboardUrl(`/organization/${orgId}`);
  }, []);

  // render metadata form
  return (
    <div className="grid-container">
      <Navigation currentStep={currentStep} handleSteps={setCurrentStep} />
      <a href={dashboardUrl}>{'< Back to dashboard'}</a>
      <Heading currentStep={currentStep} />
      {alert}

      {/* ---------- PAGE 1 -- REQUIRED METADATA ---------- */}
      {currentStep === 0 && (
        <Formik
          initialValues={formValues}
          enableReinitialize
          validateOnChange={false}
          validateOnBlur={false}
          validateOnMount={false}
          onSubmit={(values) => {
            // Clear alert box:
            setAlert();
            // update or create dataset:
            if (curDatasetId) {
              Api.updateDataset(curDatasetId, values, apiUrl, apiKey)
                .then(() => {
                  setFormValues(Object.assign({}, values));
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
                  setFormValues(Object.assign({}, values));
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
          validate={() => {
            // Note this isn't validating anything. We use "validationSchema"
            // property to validate form values against "yup" schema. This
            // method is needed to make sure that alert box is cleared on
            // validation so we don't confuse users with multiple alert boxes.
            setAlert();
          }}
          validationSchema={RequiredMetadataSchema}
        >
          {({ values, handleSubmit, errors, setFieldValue, submitForm, handleChange }) => {
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
                      handleChange={handleChange}
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
          enableReinitialize
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={(values) => {
            // Clear alert box:
            setAlert();
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
          validate={() => {
            // Note this isn't validating anything. We use "validationSchema"
            // property to validate form values against "yup" schema. This
            // method is needed to make sure that alert box is cleared on
            // validation so we don't confuse users with multiple alert boxes.
            setAlert();
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
                      handleSteps={setCurrentStep}
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
            resources: formValues.resources,
            publish: true,
            savedResources: 0,
            lastSavedResource: null,
            saveDraft: false,
            publishing_status: formValues.publishing_status,
          }}
          enableReinitialize
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={(values, { setFieldValue, setSubmitting }) => {
            // Clear alert box:
            setAlert();
            // Check if resource should be created, eg, user added any metadata:
            const resourceMetadataChanged =
              JSON.stringify(ResourceObject) !== JSON.stringify(values.resource);
            if (curDatasetId) {
              const apiUrlObject = new URL(apiUrl);
              const datasetPageUrl = `${apiUrlObject.origin}/dataset/${curDatasetId}`;

              let action;
              switch (values.resourceAction) {
                case 'edit':
                  action = Api.updateResource(values.resource, apiUrl, apiKey);
                  break;
                case 'delete':
                  action = Api.deleteResource(values.resource.id, apiUrl, apiKey);
                  break;
                default:
                  if (resourceMetadataChanged)
                    action = Api.createResource(curDatasetId, values.resource, apiUrl, apiKey);
              }

              // If there is any action (e.g. edit, delete or create) to do with resource
              if (action) {
                action
                  .then(async (res) => {
                    if (res.status === 200) {
                      // Make a dataset non private if user uploaded a file into
                      // filestore so that it can be accessed without restriction
                      if (values.resource.upload) {
                        await Api.patchDataset(curDatasetId, { private: false }, apiUrl, apiKey);
                      }

                      if (values.publish) {
                        // Update dataset state: 'publishing_status' => 'published'
                        Api.patchDataset(
                          curDatasetId,
                          { publishing_status: 'Published' },
                          apiUrl,
                          apiKey
                        ).then((response) => {
                          if (response.status === 200) {
                            // Redirect to dataset page
                            window.location.replace(datasetPageUrl);
                          }
                        });
                      } else if (values.saveDraft) {
                        setDraftSaved(new Date());
                        setSubmitting(false);
                      } else {
                        setDraftSaved(new Date());

                        // Update resources array
                        const newResources = values.resources.filter((r) => {
                          return r.id !== values.resource.id;
                        });
                        if (values.resourceAction !== 'delete') {
                          newResources.push(res.data.result);
                          setFieldValue('savedResources', values.savedResources + 1);
                          setFieldValue(
                            'lastSavedResource',
                            values.resource.name || values.resource.url
                          );
                        }

                        setFieldValue('resources', newResources);
                        setUpdatedResources(newResources);
                        setFieldValue('resource', JSON.parse(JSON.stringify(ResourceObject)));
                        setSubmitting(false);
                      }
                    }
                    // Reset resourceAction
                    setFieldValue('resourceAction', undefined);
                  })
                  .catch((error) => {
                    handleError(error);
                    setSubmitting(false);
                  });
              } else if (values.publish) {
                // Update dataset state: 'publishing_status' => 'published'
                Api.patchDataset(curDatasetId, { publishing_status: 'Published' }, apiUrl, apiKey)
                  .then((res) => {
                    if (res.status === 200) {
                      // Redirect to dataset page
                      window.location.replace(datasetPageUrl);
                    }
                  })
                  .catch((error) => {
                    handleError(error);
                    setSubmitting(false);
                  });
              } else if (values.saveDraft) {
                setDraftSaved(new Date());
                setSubmitting(false);
              } else {
                // This happens when non of resource metadata is provided and
                // user clicks "Save and add another" button. Should we display
                // an error message here?
                setSubmitting(false);
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
          validate={() => {
            // Note this isn't validating anything. We use "validationSchema"
            // property to validate form values against "yup" schema. This
            // method is needed to make sure that alert box is cleared on
            // validation so we don't confuse users with multiple alert boxes.
            setAlert();
          }}
          validationSchema={ResourceUploadSchema}
          render={({ values, errors, handleSubmit, setFieldValue, submitForm, isSubmitting }) => (
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
                  isSubmitting={isSubmitting}
                  handleSteps={setCurrentStep}
                />
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
