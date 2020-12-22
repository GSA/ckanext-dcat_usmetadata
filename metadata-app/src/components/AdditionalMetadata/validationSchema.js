import * as yup from 'yup';

// ISO 8610
// eslint-disable-next-line no-useless-escape
const durationRegex = /^P(?:(\d+(?:[\.,]\d+)?)Y)?(?:(\d+(?:[\.,]\d+)?)M)?(?:(\d+(?:[\.,]\d+)?)D)?(?:T(?:(\d+(?:[\.,]\d+)?)H)?(?:(\d+(?:[\.,]\d+)?)M)?(?:(\d+(?:[\.,]\d+)?)S)?)?$/;

export default yup.object().shape({
  dataQuality: yup.string(),
  category: yup.string(),
  data_dictionary: yup.string().url(),
  data_dictionary_type: yup.string(),
  primary_it_investment_uii: yup
    .string()
    .trim()
    .matches(/^[0-9]{3}-[0-9]{9}$/, 'uii should match format: 000-000000000'),
  homepage_url: yup.string().url(),
  related_documents: yup.string(),
  deribed_by: yup.string().url(),
  described_by_type: yup.string(),
  system_of_records: yup.string(),
  release_date: yup.date().typeError('Please specify a valid release date'),
  accrualPeriodicityOther: yup
    .string()
    .test(
      'accrual-periodicity-other',
      'Data Publishing Frequency should be formatted as a proper ISO 8601 timestamp',
      function validate(value) {
        return value && durationRegex.test(value.replace('R/', ''));
      }
    )
    .when('accrualPeriodicity', (modified, schema) => {
      return modified === 'other' ? schema : yup.string();
    }),
});
