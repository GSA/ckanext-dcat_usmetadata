import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Dialog } from '@cmsgov/design-system';
import Link from '../Link';
import Radio from '../Radio';
import WrappedField from '../WrappedField';
import resourceFormats from './resource_formats.json';
import { RESOURCE_URL_TYPES } from '../../api';

import '@cmsgov/design-system/dist/css/index.css';

const sortedResourceFormats = resourceFormats.sort((a, b) => {
  const labelA = a.label.toUpperCase();
  const labelB = b.label.toUpperCase();
  if (labelA < labelB) {
    return -1;
  }
  if (labelA > labelB) {
    return 1;
  }

  return 0;
});

const ResourceUpload = (props) => {
  const {
    values,
    errors,
    setFieldValue,
    submitForm,
    draftSaved,
    isSubmitting,
    handleSteps,
  } = props; // eslint-disable-line
  const { resourceAction } = values;
  const resource = values.resource || {};
  const resources = values.resources || [];
  const { url, name, description, mimetype, format } = resource;

  const [uploadDataFileIsActive, setUploadDataFileActive] = useState(false);
  const [shouldShowModal, setShowModal] = useState(false);

  // Detect when url type changes
  useEffect(() => {
    // If it's selected Link to an API radio option then
    // set format value to API
    if (!resource.format && resource.urlType === RESOURCE_URL_TYPES.LINK_TO_API) {
      setFieldValue('resource.format', 'API');
    }
  }, [resource.urlType]);

  const handleFileChange = (event) => {
    setUploadDataFileActive(!uploadDataFileIsActive);
    setFieldValue('resource.fileName', event.currentTarget.files[0].name);
    if (!name) {
      setFieldValue('resource.name', event.currentTarget.files[0].name);
    }
    if (!mimetype) {
      setFieldValue('resource.mimetype', event.currentTarget.files[0].type);
    }
    if (!format) {
      const detectedFormat =
        event.currentTarget.files[0].name &&
        event.currentTarget.files[0].name.split('.').slice(-1)[0];
      setFieldValue('resource.format', detectedFormat || '');
    }
    setFieldValue('resource.upload', event.currentTarget.files[0]);
  };

  const hideModal = () => {
    setShowModal(false);
  };

  const showModal = (resourceName) => {
    setShowModal(resourceName);
  };

  const editResource = (res) => {
    setFieldValue('resourceAction', 'edit');
    setUploadDataFileActive(false);
    setFieldValue('resource', res);
    setFieldValue('resource.size', '');
    setFieldValue('resource.webstore_last_updated', '');
    setFieldValue('resource.cache_last_updated', '');
  };

  const deleteResource = (res) => {
    setFieldValue('resource', { id: res.id });
    setFieldValue('resourceAction', 'delete');
    setFieldValue('publish', false);
    setFieldValue('saveDraft', false);
    setUploadDataFileActive(false);
    submitForm();
  };

  return (
    <div className="usa-form-custom" id="resource-upload">
      <section id="section-basic-mega-menu" className="site-component-section">
        <h1 className="usite-page-title" id="basic-mega-menu">
          Resource Upload
        </h1>
        <p className="site-text-intro">
          You can add the URL of the dataset where it is available on the agency website. If you are
          uploading the dataset itself, please notify the Data.gov team at{' '}
          <Link target="_blank" href="mailto:inventory-help@gsa.gov">
            inventory-help@gsa.gov
          </Link>
          . You can also add a URL or file of information related to the dataset such as a data
          dictionary.
        </p>
      </section>
      {!resources.length ? (
        ''
      ) : (
        <div className="margin-top-10 padding-bottom-8 border-gray-10 border-bottom-2px">
          <div className="grid-row margin-top-3">
            <div className="grid-col-12 text-custom-green">
              <i>Resource saved: ({resources.length} resources saved in total)</i>
            </div>
          </div>
          {resources.map((res) => {
            return (
              <div key={res.id} className="grid-row margin-top-2">
                <div className="grid-col-12 bg-base-lightest padding-x-1">
                  <div className="resource-item-name">{res.name}</div>
                  <button
                    id={`delete-${res.name}`}
                    onClick={() => showModal(res.name)}
                    type="button"
                    className="usa-button--unstyled resource-action-button"
                  >
                    Delete
                  </button>
                  {shouldShowModal === res.name && (
                    <Dialog
                      onExit={() => hideModal()}
                      getApplicationNode={() => document.getElementById('resource-upload')}
                      heading="Please Confirm Action"
                      underlayClickExits
                      actions={[
                        <button
                          type="button"
                          className="ds-c-button ds-c-button--primary"
                          key="primary"
                          onClick={() => {
                            deleteResource(res);
                            hideModal();
                          }}
                        >
                          Delete
                        </button>,
                        <button
                          type="button"
                          className="ds-c-button ds-c-button--transparent"
                          key="cancel"
                          onClick={() => hideModal()}
                        >
                          Cancel
                        </button>,
                      ]}
                    >
                      Are you sure you want to delete this resource?
                    </Dialog>
                  )}
                  <button
                    id={`edit-${res.name}`}
                    onClick={() => {
                      editResource(res);
                    }}
                    type="button"
                    className="usa-button--unstyled resource-action-button"
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {
        <div className="grid-row margin-top-3">
          <div className="grid-col-12">
            <span className="usa-label">Resource</span>
            <Radio
              label={
                // eslint-disable-next-line react/jsx-wrap-multilines
                <>
                  <b>Link to a file:</b> Provide a direct download link to a file
                </>
              }
              name="resource.urlType"
              value={RESOURCE_URL_TYPES.LINK_TO_FILE}
              id="resource-option-link-to-file"
            />
            <Radio
              label={
                // eslint-disable-next-line react/jsx-wrap-multilines
                <>
                  <b>Upload a file:</b> Upload a file from your computer
                </>
              }
              name="resource.urlType"
              value={RESOURCE_URL_TYPES.UPLOAD_FILE}
              id="resource-option-upload-file"
            />
            <Radio
              label={
                // eslint-disable-next-line react/jsx-wrap-multilines
                <>
                  <b>Link to an API:</b> Provide a link to access a dataset via API
                </>
              }
              name="resource.urlType"
              value={RESOURCE_URL_TYPES.LINK_TO_API}
              id="resource-option-link-to-api"
            />
            <Radio
              label={
                // eslint-disable-next-line react/jsx-wrap-multilines
                <>
                  <b>Access URL:</b> Provide a link to a resource that is not directly downloadable,
                  like an html website
                </>
              }
              name="resource.urlType"
              value={RESOURCE_URL_TYPES.ACCESS_URL}
              id="resource-option-access-url"
            />
          </div>
          <div className="grid-col-12">
            {resource.urlType && (
              // eslint-disable-next-line jsx-a11y/label-has-associated-control
              <label className="usa-label">
                {resource.urlType === RESOURCE_URL_TYPES.UPLOAD_FILE ? 'File' : 'URL'}
              </label>
            )}
            {/* Do not show URL field unless it's url type or url already exists (edit mode) */}
            {/* eslint-disable-next-line */}
            {(resource.urlType && resource.urlType !== RESOURCE_URL_TYPES.UPLOAD_FILE) || url ? (
              <div>
                <p className="usa-helptext">
                  {`If you are linking to a dataset, please include "https://" at the beginning
                of your URL.`}
                </p>
                <WrappedField
                  id="url"
                  name="resource.url"
                  type="url"
                  value={url}
                  onClick={() => {
                    setFieldValue('resource.url', '');
                  }}
                  errors={errors}
                />
              </div>
            ) : uploadDataFileIsActive ? (
              // If the file is uploaded
              <WrappedField
                name="resource.fileName"
                type="label"
                value={resource.fileName}
                onClick={() => {
                  setFieldValue('resource.upload', null);
                  setFieldValue('resource.fileName', '');
                  setFieldValue('resource.name', '');
                  setFieldValue('resource.description', '');
                  setFieldValue('resource.format', '');
                  setFieldValue('resource.mimetype', '');
                  setUploadDataFileActive(false);
                }}
              />
            ) : (
              // If the file is not uploaded and the radio button is chosen local file
              resource.urlType === RESOURCE_URL_TYPES.UPLOAD_FILE && (
                <>
                  <br />
                  {/* eslint-disable-next-line */}
                  <label tabIndex="0" htmlFor="upload" className="usa-button usa-button--base">
                    <i className="fa fa-cloud-upload" aria-hidden="true" /> Upload data
                  </label>
                  <input
                    id="upload"
                    name="resource.upload"
                    type="file"
                    onChange={handleFileChange}
                  />

                  <p className="usa-helptext">
                    Formats accepted include the following: TXT, HTML, TSV, CSV, ODT, XML, Perl.
                  </p>
                </>
              )
            )}
          </div>
        </div>
      }
      <div className="grid-row margin-top-3">
        <div className="grid-col-12">
          <WrappedField
            label="Name"
            name="resource.name"
            type="string"
            placeholder=""
            helptext=""
            value={name}
          />
        </div>
      </div>
      <div className="grid-row margin-top-3">
        <div className="grid-col-12">
          <WrappedField
            label="Description"
            name="resource.description"
            type="string"
            component="textarea"
            rows="6"
            helptext="You can use Markdown Formatting here."
            value={description}
          />
        </div>
      </div>
      <div className="grid-row margin-top-3">
        <div className="grid-col-12">
          <WrappedField
            label="Media Type"
            name="resource.mimetype"
            type="select"
            choices={sortedResourceFormats}
            value={mimetype}
          />
        </div>
      </div>
      <div className="grid-row margin-top-3">
        <div className="grid-col-12">
          <WrappedField
            label="Format"
            name="resource.format"
            type="string"
            helptext="Examples include: csv, xml, json.  This will be guessed automatically.  Leave blank if you wish."
            value={format}
          />
        </div>
      </div>

      <div className="grid-row margin-top-3">
        <div className="grid-col-12">
          <button
            type="button"
            className="usa-button usa-button--outline"
            onClick={() => {
              setFieldValue('publish', false);
              setFieldValue('saveDraft', false);
              setUploadDataFileActive(false);
              submitForm();
            }}
            disabled={isSubmitting}
          >
            {resourceAction === 'edit' ? 'Save' : 'Save and add another resource'}
          </button>
        </div>
      </div>
      {values.lastSavedResource && resources.length ? (
        <div className="grid-row margin-top-3">
          <div className="grid-col-12">
            <div className="usa-alert usa-alert--success usa-alert--slim usa-alert--no-icon">
              <div className="usa-alert__body">
                <p className="usa-alert__text">
                  <i>
                    Resource saved: [{values.lastSavedResource}] ({resources.length} resources saved
                    in total).
                  </i>
                  <br />
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ''
      )}
      {isSubmitting ? (
        <div className="usa-alert usa-alert--info usa-alert--slim usa-alert--no-icon">
          <div className="usa-alert__body">
            <p className="usa-alert__text">
              Your submission is in progress, this may take a few minutes for large dataset files.
            </p>
          </div>
        </div>
      ) : (
        ''
      )}

      <div className="margin-top-6 clearfix">
        {values.publishing_status === 'Published' ? (
          ''
        ) : (
          <button
            className="usa-button usa-button--outline"
            type="button"
            onClick={async () => {
              await setFieldValue('publish', false);
              await setFieldValue('saveDraft', true);
              submitForm();
            }}
          >
            Save draft
          </button>
        )}
        <div className="float-right">
          <button
            className="usa-button usa-button--outline"
            type="button"
            onClick={() => handleSteps(1)}
            onKeyUp={(e) => {
              if (e.keyCode === 13) {
                handleSteps(1);
              }
            }}
          >
            Back to previous page
          </button>
          <button
            className="usa-button margin-right-0"
            type="button"
            onClick={() => {
              setFieldValue('publish', true);
              submitForm();
            }}
            disabled={isSubmitting}
          >
            Finish and publish
          </button>
        </div>
      </div>

      {draftSaved && (
        <div style={{ marginTop: '1rem' }}>
          <div className="grid-col-12 text-custom-green">
            <i>
              Draft saved:
              <br />[{draftSaved}]
            </i>
          </div>
        </div>
      )}
    </div>
  );
};

ResourceUpload.propTypes = {
  handleSteps: PropTypes.func,
  setFieldValue: PropTypes.func,
  submitForm: PropTypes.func,
  isSubmitting: PropTypes.bool,
  draftSaved: PropTypes.string,
  errors: PropTypes.any, // eslint-disable-line
  values: PropTypes.shape({
    resources: PropTypes.array, // eslint-disable-line
    resource: PropTypes.shape({
      url: PropTypes.string,
      upload: PropTypes.any, // eslint-disable-line
      name: PropTypes.string,
      description: PropTypes.string,
      mimetype: PropTypes.string,
      format: PropTypes.string,
    }),
    resourceAction: PropTypes.string,
    publish: PropTypes.bool,
    savedResources: PropTypes.number,
    lastSavedResource: PropTypes.string,
    publishing_status: PropTypes.string,
  }),
};

export default ResourceUpload;
