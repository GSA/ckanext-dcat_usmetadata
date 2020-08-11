import React, { useState } from 'react';
import PropTypes from 'prop-types';
import WrappedField from '../WrappedField';
import TagsAutocomplete from '../TagsAutocomplete';
import HelpText from '../HelpText';
import Radio from '../Radio';

const RequiredMetadata = (props) => {
  const { values, currentStep, apiUrl, apiKey } = props;

  // RADIO / SELECT Values
  const [rights, setRights] = useState(values.rights);
  const [license, setLicense] = useState(values.license);
  const [spatial, setSpatial] = useState(values.spatial);
  const [temporal, setTemporal] = useState(values.temporal);

  const [urlDisabled, setUrlDisabled] = useState(true);

  const urlify = (text) => {
    return text ? text.replace(/\s+/g, '-').toLowerCase() : '';
  };

  const helpTextify = (text) => {
    return <HelpText>{text}</HelpText>;
  };

  const baseUrl = () => `${apiUrl.replace('api/3/action/', '')}dataset/`;

  if (currentStep !== 1) {
    // Prop: The current step
    return null;
  }

  const helpTexts = {
    title: (
      <HelpText>
        Use <a href="https://plainlanguage.gov/">everyday language</a> to make the dataset easy to
        find and understand
      </HelpText>
    ),
    description: (
      <HelpText>
        Write a description (like an abstract) with enough detail to help a user quickly decide if
        the asset is of interest. You can use{' '}
        <a href="https://www.markdownguide.org/basic-syntax/">Markdown Formatting</a> here.
      </HelpText>
    ),
    select: (
      <HelpText>
        If you do not see the Publisher for your dataset listed, please contact{' '}
        <a href="mailto:inventory-help@gsa.gov">inventory-help@gsa.gov</a> for further assistance.
        Start typing to add tags.
      </HelpText>
    ),
  };

  return (
    <div className="usa-form-custom">
      <section id="section-basic-mega-menu" className="site-component-section">
        <h1 className="usite-page-title" id="basic-mega-menu">
          Required Metadata
        </h1>
        <p className="site-text-intro">
          The following fields are required metadata for each dataset in an agency’s inventory (
          <a href="https://www.congress.gov/115/plaws/publ435/PLAW-115publ435.pdf">
            per Section 202 of the OPEN Government Data Act)
          </a>{' '}
          For more information about the form fields, consult the
          <a href="https://resources.data.gov/resources/dcat-us/">DCAT-US Schema.</a>
        </p>
      </section>
      <div className="row">
        <div className="grid-col-12">
          <WrappedField
            label="Title"
            name="title"
            type="string"
            placeholder=""
            helptext={helpTexts.title}
            value={values.title}
            required
          />

          <div>
            <WrappedField
              name="url"
              type="string"
              style={{ display: urlDisabled ? 'none' : 'inline' }}
              value={values.url || `${baseUrl()}${urlify(values.title)}`}
            />
            <span className="dataset_url" style={{ display: urlDisabled ? 'inline' : 'none' }}>
              {`${baseUrl()}${urlify(values.title)}`}
            </span>

            <button
              type="button"
              className="usa-button dataset_url_edit"
              style={{ display: urlDisabled ? 'inline' : 'none' }}
              onClick={() => {
                setUrlDisabled(false);
              }}
            >
              Edit
            </button>
          </div>
        </div>
      </div>
      <div className="row">
        <WrappedField
          label="Description"
          name="description"
          type="string"
          component="textarea"
          rows="6"
          helptext={helpTexts.description}
          value={values.description}
          required
        />
      </div>
      <div className="row">
        <span className="usa-label">Tags*</span>
        <TagsAutocomplete
          id="tags-autocomplete-input"
          tags={values.tags}
          apiUrl={apiUrl}
          apiKey={apiKey}
          name="tags"
          titleField="name"
          required
          placeholderText="Start typing to search"
          helptext={helpTextify(
            'Use both technical and non-technical terms to help users find your dataset.'
          )}
        />
      </div>
      <div className="row">
        <WrappedField
          label="Publisher"
          name="publisher"
          type="select"
          choices={['Publisher 1 ', 'Publisher 2', 'Publisher 3', 'Publisher 4']}
          required
          className="error-msg"
          helptext={helpTexts.select}
          infoText="The publishing entity (e.g. your agency) and optionally their parent organization(s)."
        />
      </div>
      <div className="row">
        <WrappedField
          label="Sub Agency"
          name="subagency"
          type="select"
          choices={['Sub Agency 1 ', 'Sub Agency 2', 'Sub Agency 3', 'Sub-Agency 4']}
          className="error-msg"
        />
      </div>
      <div className="row">
        <WrappedField label="Contact Name" name="contactPoint" type="string" required />
      </div>
      <div className="row">
        <WrappedField label="Contact Email" name="contactEmail" type="string" required />
      </div>
      <div className="row">
        <WrappedField label="Unique ID" name="identifier" type="string" required />
      </div>
      <div className="row">
        <WrappedField
          label="Public Access level"
          name="accessLevel"
          type="select"
          choices={['public', 'restricted public', 'non-public']}
          className="error-msg"
          required
        />
      </div>
      <div className="row">
        <WrappedField
          label="Meets Agency Data Quality"
          name="dataQuality"
          type="select"
          choices={['Yes', 'No']}
          className="error-msg"
          required
        />
      </div>
      <div className="row">
        <WrappedField
          label="License"
          name="license"
          type="select"
          choices={['MIT', 'Open Source License', 'Others']}
          className="error-msg"
          value={license}
          onChange={(e) => setLicense(e.target.value)}
          required
        />
        <WrappedField
          name="license_others"
          type="string"
          helptext={helpTextify(
            `If you selected “Other”, please specify the name of your License*'`
          )}
          disabled={license !== 'Others'}
          required
        />
      </div>
      <div className="row">
        <Radio
          label="My dataset is public"
          name="rights"
          value={rights}
          selected={!!rights}
          handleRadio={() => {
            setRights(true);
          }}
          id="rights_option_1"
        />
        <Radio
          label="My dataset is not public"
          name="rights"
          value={rights}
          selected={!rights}
          handleRadio={() => {
            setRights(false);
          }}
          id="rights_option_2"
        />
        <WrappedField
          name="rights_desc"
          type="string"
          value={values.rights_desc}
          helptext={helpTextify(
            'If your dataset is not public, please add an explanation of rights and feel free to include any instructions on restrictions, or how to access a restricted file (max 255 characters)*'
          )}
          disabled={!!rights}
        />
      </div>

      <div className="row">
        <span className="usa-label">Relevant Location*</span> <br />
        <Radio
          label="My dataset does not have a spatial component"
          name="spatial"
          value={spatial}
          selected={!spatial}
          handleRadio={() => setSpatial(false)}
          id="spatial_option_1"
        />
        <Radio
          label="My dataset does have a spatial component"
          name="spatial"
          value={spatial}
          selected={!!spatial}
          handleRadio={() => setSpatial(true)}
          id="spatial_option_2"
        />
        <WrappedField
          name="spatial_location_desc"
          type="string"
          value={values.spatial_location_desc}
          helptext={helpTextify(
            'If your dataset has a spatial component, please provide location such as place name or latitude/longitude pairs above*'
          )}
          disabled={!spatial}
        />
      </div>

      <div className="row">
        <span className="usa-label">Temporal*</span> <br />
        <Radio
          label="My dataset does not have a start and end date for the applicability of data"
          name="temporal"
          value={temporal}
          selected={!temporal}
          handleRadio={() => setTemporal(false)}
          id="temporal_option_1"
        />
        <Radio
          label="My dataset has a start and end date for the applicability of data"
          name="temporal"
          value={temporal}
          selected={!!temporal}
          handleRadio={() => {
            setTemporal(true);
          }}
          id="temporal_option_2"
        />
        <WrappedField
          name="temporal_start_date"
          type="date"
          helptext={helpTextify(
            'If your dataset has a temporal component, please provide start date for applicability of data above*'
          )}
          disabled={!temporal}
        />
        <WrappedField
          name="temporal_end_date"
          type="date"
          helptext={helpTextify(
            'If your dataset has a temporal component, please provide start date for applicability of data above*'
          )}
          disabled={!temporal}
        />
      </div>

      <div className="row">
        <button type="button" className="usa-button usa-button--outline">
          Save as draft
        </button>
        <button className="usa-button" type="submit">
          Save and Continue
        </button>
      </div>
    </div>
  );
};

RequiredMetadata.propTypes = {
  apiUrl: PropTypes.string.isRequired,
  apiKey: PropTypes.string.isRequired,
  values: PropTypes.any, // eslint-disable-line
  currentStep: PropTypes.number,
};

export default RequiredMetadata;
