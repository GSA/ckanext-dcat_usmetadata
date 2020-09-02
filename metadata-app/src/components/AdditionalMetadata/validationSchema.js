import * as yup from 'yup';

export default yup.object().shape({
  dataQualityUSG: yup.string(),
  themes: yup.string(),
  describedBy: yup.string(),
  describedByType: yup.string(),
  accrualPeriodicity: yup.string(),
  landingPage: yup.string(),
  language: yup.string(),
  primaryITInvestmentUIIUSG: yup.string(),
  references: yup.string(),
  issued: yup.string(),
  systemOfRecordsUSG: yup.string(),
  isPartOf: yup.string(),
});
