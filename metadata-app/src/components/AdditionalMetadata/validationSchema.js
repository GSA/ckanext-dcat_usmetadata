import * as yup from 'yup';

export default yup.object().shape({
  dataQualityUSG: yup.string(),
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
});
