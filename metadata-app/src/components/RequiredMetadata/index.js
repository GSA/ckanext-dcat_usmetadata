import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import slugify from 'slugify';
import WrappedField from '../WrappedField';
import api from '../../api';
import Autocomplete from '../Autocomplete';
import { ReactComponent as Info } from '../../img/info.svg';
import HelpText from '../HelpText';
import Radio from '../Radio';
import LinkIcon from '../LinkIcon';

const publishersDictionary = require('./publishers.json');
const licenses = require('./licenses.json');

const leafPublishers = publishersDictionary
  .map((item) => {
    return (
      item.publisher_5 ||
      item.publisher_4 ||
      item.publisher_3 ||
      item.publisher_2 ||
      item.publisher_1 ||
      item.publisher
    );
  })
  .sort()
  .concat(['Other']);

const RequiredMetadata = (props) => {
  const { values, errors, apiUrl, apiKey, draftSaved, setFieldValue, submitForm } = props;

  const [organizations, setOrganizations] = useState([]);
  useEffect(() => {
    api.fetchOrganizationsForUser(apiUrl, apiKey).then((data) => {
      setOrganizations(data);
    });
  }, []);

  // RADIO / SELECT Values
  const [urlDisabled, setUrlDisabled] = useState(true);
  const [toolTipShown, setToolTipShown] = useState(false);
  // eslint-disable-next-line
  const toggleToolTip = () => setToolTipShown(toolTipShown ? false : true);

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
    } else if (!values.url) values.url = genUrlFromTitle(values.title);
    setUrlDisabled(!urlDisabled);
  };

  const helpTexts = {
    title: (
      <HelpText>
        Use{' '}
        <a target="_blank" rel="noopener noreferrer" href="https://plainlanguage.gov/">
          everyday language <LinkIcon height="15px" />
        </a>
        to make the dataset easy to find and understand
      </HelpText>
    ),
    description: (
      <HelpText>
        Write a description (like an abstract) with enough detail to help a user quickly decide if
        the asset is of interest. You can use{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.markdownguide.org/basic-syntax/"
        >
          Markdown Formatting <LinkIcon height="15px" />
        </a>
        here.
      </HelpText>
    ),
    select: (
      <HelpText>
        If you do not see the Publisher for your dataset listed, please contact{' '}
        <a target="_blank" rel="noopener noreferrer" href="mailto:inventory-help@gsa.gov">
          inventory-help@gsa.gov <LinkIcon height="15px" />
        </a>
        for further assistance.
      </HelpText>
    ),
  };

  return (
    <div className="usa-form-custom">
      <section id="section-basic-mega-menu" className="site-component-section">
        <p className="site-text-intro">
          The following fields are required metadata for each dataset in an agency’s inventory (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.congress.gov/115/plaws/publ435/PLAW-115publ435.pdf"
          >
            per Section 202 of the OPEN Government Data Act) <LinkIcon />{' '}
          </a>
          For more information about the form fields, consult the
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://resources.data.gov/resources/dcat-us/"
          >
            DCAT-US Schema. <LinkIcon />
          </a>
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
              {values.url || genUrlFromTitle(values.title)}
            </span>

            <button
              // TODO - remove display: 'none' when url feature is ready
              style={{ display: 'none' }}
              type="button"
              className="usa-button dataset_url_edit"
              onClick={editUpdateHandler}
            >
              {urlDisabled ? 'Edit' : 'Update'}
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
          errors={errors}
          required
        />
      </div>
      <div className="row">
        <span className="usa-label">Tags*</span>
        <Autocomplete
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
            'Use both technical and non-technical terms to help users find your dataset.'
          )}
        />
      </div>
      <div className="row">
        <WrappedField
          label="Organization"
          name="owner_org"
          type="select"
          choices={organizations}
          required
          className="error-msg"
          errors={errors}
        />
      </div>
      <div className="row">
        <WrappedField
          label="Publisher"
          name="publisher"
          type="select"
          choices={leafPublishers}
          required
          className="error-msg"
          helptext={helpTexts.select}
          infoText="The publishing entity (e.g. your agency) and optionally their parent organization(s)."
          errors={errors}
        />
        <WrappedField
          name="publisher_other"
          type="string"
          helptext={helpTextify(
            `If you selected “Other”, please specify the name of your Publisher`
          )}
          disabled={values.publisher !== 'Other'}
          errors={errors}
          required
        />
      </div>
      <div className="row">
        <WrappedField label="Sub Agency" name="subagency" type="string" required errors={errors} />
      </div>
      <div className="row">
        <WrappedField
          label="Contact Name"
          name="contact_name"
          type="string"
          required
          infoText="This should be the person who can best answer or triage questions about this dataset, either on the metadata or the substance of the data resources."
          errors={errors}
        />
      </div>
      <div className="row">
        <WrappedField
          label="Contact Email"
          name="contact_email"
          type="string"
          required
          errors={errors}
        />
      </div>
      <div className="row">
        <WrappedField
          label="Unique ID"
          name="unique_id"
          type="string"
          required
          infoText="This is the ID number or code used within your agency to differentiate this dataset from other datasets."
          errors={errors}
        />
      </div>
      <div className="row">
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
          className="error-msg"
          errors={errors}
          required
        />
      </div>
      <div className="row">
        <WrappedField
          label="License"
          name="license"
          type="select"
          choices={licenses}
          className="error-msg"
          errors={errors}
          required
        />
        <WrappedField
          name="licenseOther"
          type="string"
          helptext={helpTextify(
            `If you selected “Other”, please specify the name of your License*'`
          )}
          disabled={values.license !== 'other'}
          errors={errors}
          required
        />
      </div>
      <div className="row">
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

      <div className="row">
        <span className="usa-label">Relevant Location*</span> <br />
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

      <div className="row">
        <span className="usa-label">
          Temporal*
          <div className={`tooltip ${toolTipShown ? 'show' : ''}`}>
            <Info
              tabIndex={0}
              height="20px"
              width="20px"
              style={{ marginLeft: '.5em' }}
              onClick={() => toggleToolTip()}
              onKeyUp={(e) => {
                if (e.keyCode === 13) {
                  toggleToolTip();
                }
              }}
            />
            <span className="tooltiptext">
              <span
                tabIndex={0}
                className="close"
                onClick={() => setToolTipShown(false)}
                role="button"
                onKeyDown={() => setToolTipShown(false)}
              >
                <span className="close-tag">&times;</span>
              </span>
              <h3>Temporal</h3>
              <p>
                For example, for a 2010 Census dataset, the temporal extent would cover a period of
                time beginning 2000-04-02 and ending 2010-04-01.
              </p>
            </span>
          </div>
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
            'If your dataset has a temporal component, please provide start date for applicability of data above*'
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
            'If your dataset has a temporal component, please provide end date for applicability of data above*'
          )}
          disabled={values.temporal === 'false'}
        />
      </div>

      <div className="row">
        <button
          style={{ display: 'none' }}
          className="usa-button usa-button--outline"
          type="button"
          onClick={async () => {
            await setFieldValue('saveDraft', true);
            submitForm();
          }}
        >
          Save draft
        </button>
        <button
          className="usa-button"
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

RequiredMetadata.propTypes = {
  setFieldValue: PropTypes.func,
  submitForm: PropTypes.func,
  draftSaved: PropTypes.string,
  apiUrl: PropTypes.string.isRequired,
  apiKey: PropTypes.string.isRequired,
  values: PropTypes.any, // eslint-disable-line
  errors: PropTypes.any, // eslint-disable-line
};

export default RequiredMetadata;
