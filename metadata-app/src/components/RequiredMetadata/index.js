import React, { useState } from 'react';
import PropTypes from 'prop-types';
import WrappedField from '../WrappedField';
import TagsAutocomplete from '../TagsAutocomplete';
import { ReactComponent as Info } from '../../img/info.svg';
import HelpText from '../HelpText';
import Radio from '../Radio';

const RequiredMetadata = (props) => {
  const { values, errors, apiUrl, apiKey } = props;

  // RADIO / SELECT Values
  const [urlDisabled, setUrlDisabled] = useState(true);
  const [toolTipShown, setToolTipShown] = useState(false);
  // eslint-disable-next-line
  const toggleToolTip = () => setToolTipShown(toolTipShown ? false : true);

  const urlify = (text) => {
    return text ? text.replace(/\s+/g, '-').toLowerCase() : '';
  };

  const helpTextify = (text) => {
    return <HelpText>{text}</HelpText>;
  };
  const baseUrl = `${window.location.origin}/dataset/`;

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
            errors={errors}
            required
          />

          <div>
            <WrappedField
              name="url"
              type="string"
              style={{ display: urlDisabled ? 'none' : 'inline' }}
              value={values.url || `${baseUrl}${urlify(values.title)}`}
              errors={errors}
            />
            <span className="dataset_url" style={{ display: urlDisabled ? 'inline' : 'none' }}>
              {`${baseUrl}${urlify(values.title)}`}
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
          errors={errors}
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
          errors={errors}
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
          errors={errors}
        />
      </div>
      <div className="row">
        <WrappedField
          label="Sub Agency"
          name="subagency"
          type="select"
          choices={['Sub Agency 1 ', 'Sub Agency 2', 'Sub Agency 3', 'Sub-Agency 4']}
          className="error-msg"
          errors={errors}
        />
      </div>
      <div className="row">
        <WrappedField
          label="Contact Name"
          name="contactPoint"
          type="string"
          required
          infoText="This should be the person who can best answer or triage questions about this dataset, either on the metadata or the substance of the data resources."
          errors={errors}
        />
      </div>
      <div className="row">
        <WrappedField
          label="Contact Email"
          name="contactEmail"
          type="string"
          required
          errors={errors}
        />
      </div>
      <div className="row">
        <WrappedField label="Unique ID" name="identifier" type="string" required errors={errors} />
      </div>
      <div className="row">
        <WrappedField
          label="Public Access level"
          name="accessLevel"
          type="select"
          choices={['public', 'restricted public', 'non-public']}
          className="error-msg"
          errors={errors}
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
          errors={errors}
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
          errors={errors}
          required
        />
        <WrappedField
          name="license_others"
          type="string"
          helptext={helpTextify(
            `If you selected “Other”, please specify the name of your License*'`
          )}
          disabled={values.license !== 'Others'}
          errors={errors}
          required
        />
      </div>
      <div className="row">
        <span className="usa-label">Rights</span> <br />
        {errors && errors.rights && <span className="error-msg">{errors.rights}</span>}
        <Radio
          label="My dataset is public"
          name="rights"
          errors={errors}
          value="true"
          id="rights_option_1"
        />
        <Radio label="My dataset is not public" name="rights" value="false" id="rights_option_2" />
        <WrappedField
          name="rights_desc"
          type="string"
          value={values.rights_desc}
          errors={errors}
          helptext={helpTextify(
            'If your dataset is not public, please add an explanation of rights and feel free to include any instructions on restrictions, or how to access a restricted file (max 255 characters)*'
          )}
          disabled={values.rights === 'true'}
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
          value={values.temporal}
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
            'If your dataset has a temporal component, please provide start date for applicability of data above*'
          )}
          disabled={values.temporal === 'false'}
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
  errors: PropTypes.any, // eslint-disable-line
};

export default RequiredMetadata;
