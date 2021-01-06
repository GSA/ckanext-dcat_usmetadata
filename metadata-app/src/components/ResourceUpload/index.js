import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Link from '../Link';
import WrappedField from '../WrappedField';
import resourceFormats from './resource_formats.json';

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

  const [linkToDataIsActive, setLinkToDataActive] = useState(false);
  const [uploadDataFileIsActive, setUploadDataFileActive] = useState(false);

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
    setLinkToDataActive(false);
    setUploadDataFileActive(false);
    submitForm();
  };

  return (
    <div className="usa-form-custom">
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
            <div className="grid-col-12 text-green">
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
                    onClick={() => {
                      deleteResource(res);
                    }}
                    type="button"
                    className="usa-button--unstyled resource-action-button"
                  >
                    Delete
                  </button>
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
            {/* eslint-disable-next-line */}
            <label className="usa-label">Data</label>
            {/* eslint-disable-next-line */}
            {linkToDataIsActive || url ? (
              <div>
                <p className="usa-helptext">
                  {`If you are linking to a dataset, please include "https://" at the beginning
                of your URL.`}
                </p>
                <WrappedField
                  hidden={!linkToDataIsActive}
                  id="url"
                  name="resource.url"
                  type="url"
                  value={url}
                  onClick={() => {
                    setFieldValue('resource.url', '');
                    setLinkToDataActive(false);
                  }}
                  errors={errors}
                />
              </div>
            ) : uploadDataFileIsActive ? (
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
              <>
                <br />
                {/* eslint-disable-next-line */}
                <label tabIndex="0" htmlFor="upload" className="usa-button usa-button--base">
                  <i className="fa fa-cloud-upload" aria-hidden="true" /> Upload data
                </label>
                <input id="upload" name="resource.upload" type="file" onChange={handleFileChange} />
                {/* eslint-disable */}
                <label
                  tabIndex="0"
                  htmlFor="url"
                  className="usa-button usa-button--base"
                  onClick={() => {
                    setLinkToDataActive(!linkToDataIsActive);
                  }}
                >
                  <i className="fa fa-link" aria-hidden="true" /> Link to data
                </label>
                {/* eslint-enable */}
                <p className="usa-helptext">
                  Formats accepted include the following: TXT, HTML, TSV, CSV, ODT, XML, Perl.
                </p>
              </>
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
              setLinkToDataActive(false);
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
          <div className="grid-col-12 text-green">
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
