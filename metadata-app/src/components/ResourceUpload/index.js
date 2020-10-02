import React, { useState } from 'react';
import PropTypes from 'prop-types';
import WrappedField from '../WrappedField';
import resourceFormats from './resource_formats.json';
import Outbound from '../../img/outbound.svg';

const OutboundLink = (props) => (
  <img
    src={Outbound}
    height="20px"
    position="relative"
    display="inline-block"
    alt="Link opens in new tab"
    {...props}
  />
);

const ResourceUpload = (props) => {
  const { values, setFieldValue, submitForm, draftSaved } = props; // eslint-disable-line
  const resource = values.resource || {};
  const { url, upload, name, description, mimetype, format } = resource;

  const [linkToDataIsActive, setLinkToDataActive] = useState(false);
  const [uploadDataFileIsActive, setUploadDataFileActive] = useState(false);

  const handleFileChange = (event) => {
    setUploadDataFileActive(!uploadDataFileIsActive);
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

  return (
    <div className="usa-form-custom">
      <section id="section-basic-mega-menu" className="site-component-section">
        <h1 className="usite-page-title" id="basic-mega-menu">
          Resource Upload
        </h1>
        <p className="site-text-intro">
          You can add the URL of the dataset where it is available on the agency website. If you are
          uploading the dataset itself, please notify the Data.gov team at{' '}
          <a target="_blank" rel="noopener noreferrer" href="mailto:inventory-help@gsa.gov">
            inventory-help@gsa.gov
          </a>
          <OutboundLink />. You can also add a URL or file of information related to the dataset
          such as a data dictionary.
        </p>
      </section>
      <div className="row">
        <div className="col-md-12">
          {/* eslint-disable-next-line */}
          <label className="usa-label">Data</label>
          {/* eslint-disable-next-line */}
          {linkToDataIsActive ? (
            <div>
              <p className="usa-helptext">
                {`If you are linking to a dataset, please include "http://" at the beginning
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
              />
            </div>
          ) : uploadDataFileIsActive ? (
            <WrappedField
              disabled
              name="resource.fileName"
              type="string"
              value={upload.name}
              onClick={() => {
                setFieldValue('resource.upload', '');
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
            </>
          )}
          <p className="usa-helptext">
            Formats accepted include the following: TXT, HTML, TSV, CSV, ODT, XML, Perl.
          </p>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
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
      <div className="row">
        <div className="col-md-12">
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
      <div className="row">
        <div className="col-md-12">
          <WrappedField
            label="Media Type"
            name="resource.mimetype"
            type="select"
            choices={resourceFormats}
            value={mimetype}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <WrappedField
            label="Format"
            name="resource.format"
            type="string"
            helptext="Examples include: csv, xml, json.  This will be guessed automatically.  Leave blank if you wish."
            value={format}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
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
          >
            Save and add another resource
          </button>
        </div>
      </div>

      {values.savedResources > 0 ? (
        <div className="row">
          <div className="col-md-12 text-mint">
            <i>
              Resource saved: [{values.lastSavedResourceName}] ({values.savedResources} resources
              saved in total).
            </i>
            <br />
            <i>You can edit any saved resource after clicking &quot;Finish and publish&quot;.</i>
          </div>
        </div>
      ) : (
        ''
      )}

      <div className="col-sm-12">
        <br />
        <br />
        <button
          style={{ display: 'none' }}
          className="usa-button usa-button--outline"
          type="button"
          onClick={() => {
            setFieldValue('publish', false);
            setFieldValue('saveDraft', true);
            submitForm();
          }}
        >
          Save draft
        </button>
        <button
          className="usa-button"
          type="button"
          onClick={() => {
            setFieldValue('publish', true);
            submitForm();
          }}
        >
          Finish and publish
        </button>
      </div>

      {draftSaved && (
        <div style={{ marginTop: '1rem' }}>
          <div className="col-md-12 text-mint">
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
  setFieldValue: PropTypes.func,
  submitForm: PropTypes.func,
  draftSaved: PropTypes.string,
  values: PropTypes.shape({
    resource: {
      url: PropTypes.string,
      upload: PropTypes.any, // eslint-disable-line
      name: PropTypes.string,
      description: PropTypes.string,
      mimetype: PropTypes.string,
      format: PropTypes.string,
    },
    publish: PropTypes.bool,
    savedResources: PropTypes.number,
    lastSavedResourceName: PropTypes.string,
  }),
};

export default ResourceUpload;
