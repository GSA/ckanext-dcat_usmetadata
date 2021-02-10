import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import slugify from 'slugify';
import WrappedField from '../WrappedField';
import api from '../../api';
import AutocompleteTags from '../AutocompleteTags';
import Autocomplete from '../Autocomplete';
import HelpText from '../HelpText';
import Radio from '../Radio';
import Link from '../Link';
import ToolTip from '../ToolTip';

const licenses = require('./licenses.json');

// Links within the form use target="_blank" to avoid navigating away from the
// from while the user is filling it out. It can be very frustrating to lose
// work when clicking on a link for help.
const RequiredMetadata = (props) => {
  const {
    values,
    errors,
    apiUrl,
    apiKey,
    draftSaved,
    setFieldValue,
    submitForm,
    handleChange,
  } = props;

  const [organizations, setOrganizations] = useState([]);
  // Depending on the given organization the publishers list might be different
  const [publishers, setPublishers] = useState([]);

  useEffect(() => {
    api.fetchOrganizationsForUser(apiUrl, apiKey).then((data) => {
      // if it comes from organization page then pre-select that specific organization
      const urlParams = new URLSearchParams(window.location.search);
      const orgId = urlParams.get('group');
      if (orgId) {
        setFieldValue('owner_org', orgId);
      }

      // check if there is only one organization in the list then pre-select that only one
      if (data.length === 1) {
        setFieldValue('owner_org', data[0].id);
      }
      setOrganizations(data);
    });
  }, []);

  // RADIO / SELECT Values
  const [urlDisabled, setUrlDisabled] = useState(true);

  const helpTextify = (text) => {
    return <HelpText>{text}</HelpText>;
  };
  const baseUrl = `${window.location.origin}/dataset/`;

  const genUrlFromTitle = (title) => {
    return `${baseUrl}${slugify(title || '', {
      lower: true,
      remove: /[*+~.()'"!:@]/g,
    })}`;
  };

  // Handles the event when the user clicks on edit/update button for url
  const editUpdateHandler = () => {
    const { url } = values;
    //  Means in update mode
    if (!urlDisabled) {
      if (url) {
        values.url = `${baseUrl}${slugify(url.substring(baseUrl.length, url.length))}`;
      }
    } else if (!values.url) {
      values.url = genUrlFromTitle(values.title);
    }
    setUrlDisabled(!urlDisabled);
  };

  const getPublishers = async () => {
    const fetchedPublishers = await api.fetchPublishers(values.owner_org, apiUrl, apiKey);

    setPublishers(fetchedPublishers);

    return fetchedPublishers;
  };

  useEffect(() => {
    const publisherId = values.publisher;
    if (!publisherId && publisherId !== 0) {
      return;
    }
    // Find which publisher has been selected and attach it to the
    const selectedPublisher = publishers.find((publisher) => publisher.id === publisherId);
    setFieldValue('selectedPublisher', selectedPublisher);
  }, [values.publisher]);

  const getSelectedPublisherName = () => {
    const { selectedPublisher } = values;
    // If it's not selected from the autocomplete yet
    if (!selectedPublisher) {
      // If the publisher value is not the id, just the name
      if (typeof values.publisher === 'string') {
        return values.publisher;
      }
      return '';
    }
    // If it's already selected from autocomplete then return the name
    return selectedPublisher.name;
  };

  const helpTexts = {
    title: (
      <HelpText>
        Use{' '}
        <Link target="_blank" href="https://plainlanguage.gov/">
          everyday language
        </Link>{' '}
        to make the dataset easy to find and understand.
      </HelpText>
    ),
    description: (
      <HelpText>
        Write a description (like an abstract) with enough detail to help a user quickly decide if
        the asset is of interest. You can use{' '}
        <Link target="_blank" href="https://www.markdownguide.org/basic-syntax/">
          Markdown Formatting
        </Link>{' '}
        here.
      </HelpText>
    ),
    select: (
      <HelpText>
        Start typing to see list of publishers. If you do not see the Publisher for your dataset
        listed, please contact{' '}
        <Link target="_blank" href="mailto:inventory-help@gsa.gov">
          inventory-help@gsa.gov
        </Link>{' '}
        for further assistance.
      </HelpText>
    ),
  };

  return (
    <div className="usa-form-custom">
      <section id="section-basic-mega-menu" className="site-component-section">
        <p className="site-text-intro">
          The following fields are required metadata for each dataset in an agency’s inventory (
          <Link
            target="_blank"
            href="https://www.congress.gov/115/plaws/publ435/PLAW-115publ435.pdf"
          >
            per Section 202 of the OPEN Government Data Act
          </Link>
          ). For more information about the form fields, consult the{' '}
          <Link target="_blank" href="https://resources.data.gov/resources/dcat-us/">
            DCAT-US Schema
          </Link>
          .
        </p>
      </section>
      <div className="grid-row margin-top-3">
        <div className="grid-col-12">
          <WrappedField
            label="Title"
            name="title"
            type="string"
            placeholder=""
            helptext={helpTexts.title}
            value={values.title}
            errors={errors}
            required
          />

          <div className={urlDisabled ? '' : 'dynamic-url'}>
            <WrappedField
              name="url"
              type="url"
              style={{ display: urlDisabled ? 'none' : 'inline' }}
              value={values.url}
              errors={errors}
            />
            <span className="dataset_url" style={{ display: urlDisabled ? 'inline' : 'none' }}>
              {values.url || values.name || genUrlFromTitle(values.title)}
            </span>

            <button
              type="button"
              className="usa-button dataset_url_edit"
              onClick={editUpdateHandler}
            >
              {urlDisabled ? 'Edit' : 'Update'}
            </button>
          </div>
        </div>
      </div>
      <div className="grid-row margin-top-3">
        <WrappedField
          label="Description"
          name="description"
          type="string"
          component="textarea"
          rows="6"
          helptext={helpTexts.description}
          value={values.description}
          errors={errors}
          required
        />
      </div>
      <div className="grid-row margin-top-3">
        <span className="usa-label">Tags</span>
        <AutocompleteTags
          id="tags-autocomplete-input"
          tags={values.tags}
          apiUrl={apiUrl}
          apiKey={apiKey}
          fetchOpts={api.fetchTags}
          name="tags"
          titleField="name"
          required
          placeholder="Start typing to search"
          errors={errors}
          helptext={helpTextify(
            'Use both technical and non-technical terms to help users find your dataset. Press tab or enter to add each new tag.'
          )}
        />
      </div>
      <div className="grid-row margin-top-3">
        <WrappedField
          label="Organization"
          name="owner_org"
          type="select"
          value={values.owner_org}
          choices={organizations}
          onChange={(e) => {
            handleChange(e);
            setFieldValue('publisher', '');
            setFieldValue('selectedPublisher', null);
          }}
          required
          className="error-msg"
          errors={errors}
        />
      </div>
      <div className="grid-row margin-top-3">
        <div className="grid-col-12">
          <span className="usa-label">
            Select Publisher
            <ToolTip>
              <h3>Publisher</h3>
              <p>The publishing entity (e.g. your agency, department, bureau, or office).</p>
            </ToolTip>
          </span>
          <Autocomplete
            name="publisher"
            type="string"
            value={values.publisher}
            inputValue={getSelectedPublisherName()}
            placeholder="Select publisher"
            helptext={helpTexts.select}
            fetchOpts={getPublishers}
            apiUrl={apiUrl}
            apiKey={apiKey}
          />
        </div>
      </div>
      <div className="grid-row margin-top-3">
        <WrappedField
          label="Contact Name"
          name="contact_name"
          type="string"
          required
          infoText="This should be the person who can best answer or triage questions about this dataset, either on the metadata or the substance of the data resources."
          errors={errors}
        />
      </div>
      <div className="grid-row margin-top-3">
        <WrappedField
          label="Contact Email"
          name="contact_email"
          type="string"
          required
          errors={errors}
        />
      </div>
      <div className="grid-row margin-top-3">
        <WrappedField
          label="Unique ID"
          name="unique_id"
          type="string"
          required
          helptext={helpTextify(
            'Every dataset must have a ID number that is unique within the agency.'
          )}
          infoText="This is the ID number or code used within your agency to differentiate this dataset from other datasets."
          errors={errors}
        />
      </div>
      <div className="grid-row margin-top-3">
        <WrappedField
          label="Public Access level"
          name="public_access_level"
          type="select"
          choices={[
            {
              value: 'public',
              id: 'choice-public',
              label:
                'Public - this dataset can be made publicly available to all without restrictions',
            },
            {
              value: 'restricted public',
              id: 'choice-restricted-public',
              label: 'Restricted Public - this dataset is available under certain use restrictions',
            },
            {
              value: 'non-public',
              id: 'choice-non-public',
              label: 'Non-Public - this dataset is not available to members of the public',
            },
          ]}
          value={values.public_access_level}
          className="error-msg"
          errors={errors}
          required
        />
      </div>
      <div className="grid-row margin-top-3">
        <WrappedField
          label="License"
          name="license"
          type="select"
          choices={licenses}
          value={values.license}
          className="error-msg"
          errors={errors}
          required
        />
        <WrappedField
          name="licenseOther"
          type="string"
          helptext={helpTextify(
            `If you selected “Other”, please specify the name of your License in URL format. Please include "https://" at the beginning of your URL.*`
          )}
          value={values.licenseOther}
          disabled={values.license !== 'other'}
          errors={errors}
          required
        />
      </div>
      <div className="grid-row margin-top-3">
        <div className="grid-col-12">
          <span className="usa-label">Rights</span> <br />
          {errors && errors.rights && <span className="error-msg">{errors.rights}</span>}
          <Radio
            label="My dataset is public"
            name="access_level_comment"
            errors={errors}
            value="true"
            id="rights_option_1"
          />
          <Radio
            label="My dataset is not public"
            name="access_level_comment"
            value="false"
            id="rights_option_2"
          />
          <WrappedField
            name="rights_desc"
            type="string"
            value={values.rights_desc}
            errors={errors}
            helptext={helpTextify(
              'If your dataset is not public, please add an explanation of rights and feel free to include any instructions on restrictions, or how to access a restricted file (max 255 characters)*'
            )}
            disabled={values.access_level_comment === 'true'}
          />
        </div>
      </div>

      <div className="grid-row margin-top-3">
        <div className="grid-col-12">
          <span className="usa-label">Relevant Location</span> <br />
          {errors && errors.spatial && <span className="error-msg">{errors.spatial}</span>}
          <Radio
            label="My dataset does not have a spatial component"
            name="spatial"
            value="false"
            errors={errors}
            id="spatial_option_1"
          />
          <Radio
            label="My dataset does have a spatial component"
            name="spatial"
            value="true"
            id="spatial_option_2"
          />
          <WrappedField
            name="spatial_location_desc"
            type="string"
            value={values.spatial_location_desc}
            errors={errors}
            helptext={helpTextify(
              'If your dataset has a spatial component, please provide location such as place name or latitude/longitude pairs above*'
            )}
            disabled={values.spatial === 'false'}
          />
        </div>
      </div>

      <div className="grid-row margin-top-3">
        <div className="grid-col-12">
          <span className="usa-label">
            Temporal
            <ToolTip>
              <h3>Temporal</h3>
              <p>
                For example, for a 2010 Census dataset (which runs for 10 years until April 1st of
                the year of the Census), the temporal extent would cover a period of time beginning
                2000-04-02 and ending 2010-04-01.
              </p>
            </ToolTip>
          </span>{' '}
          <br />
          {errors && errors.temporal && <span className="error-msg">{errors.temporal}</span>}
          <Radio
            label="My dataset does not have a start and end date for the applicability of data"
            name="temporal"
            value="false"
            errors={errors}
            id="temporal_option_1"
          />
          <Radio
            label="My dataset has a start and end date for the applicability of data"
            name="temporal"
            value="true"
            errors={errors}
            id="temporal_option_2"
          />
          <WrappedField
            name="temporal_start_date"
            type="date"
            id="temporal_start_date"
            value={values.temporal_start_date}
            errors={errors}
            helptext={helpTextify(
              'If your dataset has a temporal component, please provide start date for applicability of data above (MM/DD/YYYY)*'
            )}
            disabled={values.temporal === 'false'}
          />
          <WrappedField
            name="temporal_end_date"
            type="date"
            id="temporal_end_date"
            value={values.temporal_end_date}
            errors={errors}
            helptext={helpTextify(
              'If your dataset has a temporal component, please provide end date for applicability of data above (MM/DD/YYYY)*'
            )}
            disabled={values.temporal === 'false'}
          />
        </div>
      </div>

      <div className="margin-top-6 clearfix">
        {values.publishing_status === 'Published' ? (
          ''
        ) : (
          <button
            className="usa-button usa-button--outline"
            type="button"
            onClick={async () => {
              await setFieldValue('saveDraft', true);
              submitForm();
            }}
          >
            Save draft
          </button>
        )}
        <button
          className="usa-button float-right margin-right-0"
          type="button"
          onClick={async () => {
            await setFieldValue('saveDraft', false);
            submitForm();
          }}
        >
          Save and Continue
        </button>
      </div>
      {draftSaved && (
        <div style={{ marginTop: '1rem' }}>
          <div className="grid-col-12 text-mint">
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

RequiredMetadata.propTypes = {
  handleChange: PropTypes.func,
  setFieldValue: PropTypes.func,
  submitForm: PropTypes.func,
  draftSaved: PropTypes.string,
  apiUrl: PropTypes.string.isRequired,
  apiKey: PropTypes.string.isRequired,
  values: PropTypes.any, // eslint-disable-line
  errors: PropTypes.any, // eslint-disable-line
};

export default RequiredMetadata;
