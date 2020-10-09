import React from 'react';
import PropTypes from 'prop-types';
import WrappedField from '../WrappedField';
import HelpText from '../HelpText';
import Autocomplete from '../Autocomplete';

import LinkIcon from '../LinkIcon';
import api from '../../api';

const languages = require('./languages.json');
const dataDictTypes = require('./data-dictionary-types').sort((a, b) => {
  const label1 = (a.label || '').toLowerCase();
  const label2 = (b.label || '').toLowerCase();
  if (label1 < label2) return -1;
  if (label1 > label2) return 1;
  return 0;
});

const helpTexts = {
  theme: <HelpText>Examples include: vegetables, non_starchy, green.</HelpText>,
  describedBy: (
    <HelpText>
      Provide a link to data dictionary or other reference that helps users understand the dataset.
      Example: &quot;https://www.agency.gov/vegetables/vegetables-all.zip&quot;
    </HelpText>
  ),
  landingPage: (
    <HelpText>
      This landing page should contain or be linked to all resources tied to the dataset. Example:
      &quot;https://www.agency.gov/vegetables&quot;
    </HelpText>
  ),
  primaryITInvestmentUIIUSG: (
    <HelpText>
      This can often be found in Exhibit 53 documents, and takes the form ###-#########. Learn more
      about Exhibit 53 documents at{' '}
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://www.whitehouse.gov/wp-content/uploads/2018/06/fy-2020-it-budget-guidance.pdf"
      >
        this pdf <LinkIcon height="15px" />
      </a>
    </HelpText>
  ),
  references: (
    <HelpText>
      Related documents such as technical information about a dataset, developer documentation, etc.
      Format for entry is: https://www.agency.gov/fruits/fruits.csv,
      https://www.agency.gov/legumes/legumes
    </HelpText>
  ),
  systemOfRecordsUSG: (
    <HelpText>
      If the dataset is a designated System of Records under the Privacy Act of 1974, provide the
      URL for the System of Recors Notice
    </HelpText>
  ),
};

const AdditionalMetadata = (props) => {
  const { values, apiUrl, apiKey, draftSaved, setFieldValue, submitForm } = props;

  const getRegionalChoices = (selectedLangValue) => {
    const lang = languages.find((item) => item.value === selectedLangValue) || {};
    return lang.regions;
  };

  return (
    <div className="usa-form-custom">
      <section id="section-basic-mega-menu" className="site-component-section">
        <p className="site-text-intro">
          Please note that the additional metadata that you upload will help public users better
          find and use this dataset. Not all of these criteria will apply to each dataset, so feel
          free to only answer what applies. For more information about the form fields, consult the{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://resources.data.gov/schemas/dcat-us/v1.1/"
          >
            DCAT-US Schema <LinkIcon />
          </a>
        </p>
      </section>
      <div className="row">
        <div className="grid-col-12">
          <WrappedField
            label="Meets Agency Data Quality"
            name="dataQualityUSG"
            type="select"
            choices={['Yes', 'No']}
          />
        </div>
      </div>
      <div className="row">
        <div className="grid-col-12">
          <WrappedField
            label="Themes"
            name="category"
            type="string"
            helptext="Main thematic category of the dataset.  If this dataset should be included in geoplatform.gov, please enter “geospatial” as the theme.  Start typing to add themes."
            infoText={helpTexts.theme}
          />
        </div>
      </div>
      <div className="row">
        <div className="grid-col-12">
          <WrappedField
            label="Data Dictionary URL"
            name="data_dictionary"
            type="string"
            helptext='Please include "https://" at the beginning of your URL.'
            infoText={helpTexts.describedBy}
          />
        </div>
      </div>
      <div className="row">
        <div className="grid-col-12">
          <WrappedField
            label="Data Dictionary Type"
            name="describedByType"
            value={values.describedByType}
            type="select"
            choices={dataDictTypes}
          />
          <WrappedField
            disabled={values.describedByType !== 'other'}
            name="otherDataDictionaryType"
            value={values.otherDataDictionaryType}
            type="string"
            helptext="If you selected “Other”, please specify your Data Dictionary Type"
          />
        </div>
      </div>
      <div className="row">
        <div className="grid-col-12">
          <WrappedField
            label="Data Publishing Frequency"
            name="accrual_periodicity"
            type="select"
            choices={[
              'Decennial',
              'Quadrennial',
              'Annual',
              'Bimonthly',
              'Semiweekly',
              'Daily',
              'Biweekly',
              'Semiannual',
              'Biennial',
              'Triennial',
              'Three times a week',
              'Three times a month',
              'Every five years',
              'Every eight years',
              'Continuously updated',
              'Monthly',
              'Quarterly',
              'Semimonthly',
              'Three times a year',
              'Weekly',
              'Hourly',
              'Irregular',
            ]}
          />
        </div>
      </div>
      <div className="row">
        <div className="grid-col-12">
          <WrappedField
            label="Dataset Landing Page URL"
            name="homepage_url"
            type="string"
            helptext='Please include "https://" at the beginning of your URL.'
            infoText={helpTexts.landingPage}
          />
        </div>
      </div>
      <div className="row">
        <div className="grid-col-12">
          <WrappedField
            label="Language - Language Subtag"
            name="languageSubTag"
            value={values.languageSubTag}
            type="select"
            choices={languages}
          />
        </div>
      </div>
      <div className="row">
        <div className="grid-col-12">
          <WrappedField
            disabled={!values.languageSubTag}
            label="Language - Regional Subtag"
            name="languageRegSubTag"
            value={values.languageRegSubTag}
            type="select"
            choices={getRegionalChoices(values.languageSubTag)}
          />
        </div>
      </div>
      <div className="row">
        <div className="grid-col-12">
          <WrappedField
            label="Dataset's IT Unique Investment Identifier"
            name="primary_it_investment_uii"
            type="string"
            infoText={helpTexts.primaryITInvestmentUIIUSG}
          />
        </div>
      </div>
      <div className="row">
        <div className="grid-col-12">
          <WrappedField
            label="Related Documents"
            name="related_documents"
            type="string"
            infoText={helpTexts.references}
          />
        </div>
      </div>
      <div className="row">
        <div className="grid-col-12">
          <WrappedField
            label="Release Date"
            name="release_date"
            type="date"
            infoText={helpTexts.references}
          />
        </div>
      </div>
      <div className="row">
        <div className="grid-col-12">
          <WrappedField
            label="System of Records Notice URL"
            name="system_of_records"
            type="string"
            infoText={helpTexts.systemOfRecordsUSG}
          />
        </div>
      </div>
      <div className="row">
        <div className="grid-col-12">
          <WrappedField
            label="Is parent dataset"
            name="isParent"
            type="select"
            choices={['Yes', 'No']}
          />
        </div>
      </div>
      {values.isParent === 'No' && (
        <div className="row">
          <div className="grid-col-12">
            <span className="usa-label">Select Parent Dataset</span>
            <Autocomplete
              label="Select Parent Dataset"
              name="parentDataset"
              type="string"
              value={values.parentDataset}
              // TODO - inputValue should be replaced with parent dataset name
              inputValue={values.parentDataset}
              placeholder="Select parent dataset"
              helptext="Start typing to see list of matching datasets by title"
              fetchOpts={api.fetchParentDatasets}
              apiUrl={apiUrl}
              apiKey={apiKey}
            />
          </div>
        </div>
      )}
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

AdditionalMetadata.propTypes = {
  setFieldValue: PropTypes.func,
  submitForm: PropTypes.func,
  draftSaved: PropTypes.string,
  apiUrl: PropTypes.string,
  apiKey: PropTypes.string,
  errors: PropTypes.any, // eslint-disable-line
  values: PropTypes.shape({
    dataQualityUSG: PropTypes.string,
    theme: PropTypes.string,
    describedBy: PropTypes.string,
    describedByType: PropTypes.string,
    otherDataDictionaryType: PropTypes.string,
    accrualPeriodicity: PropTypes.string,
    landingPage: PropTypes.string,
    languageSubTag: PropTypes.string,
    languageRegSubTag: PropTypes.string,
    primaryITInvestmentUIIUSG: PropTypes.string,
    references: PropTypes.string,
    issued: PropTypes.string,
    systemOfRecordsUSG: PropTypes.string,
    isPartOf: PropTypes.string,
    isParent: PropTypes.string,
    parentDataset: PropTypes.string,
  }),
};

export default AdditionalMetadata;
