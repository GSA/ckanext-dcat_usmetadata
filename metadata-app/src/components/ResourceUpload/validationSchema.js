import * as yup from 'yup';

export default yup.object().shape({
  name: yup.string(),
  description: yup.string(),
  mimetype: yup.string(),
  format: yup.string(),
  url: yup.string(),
  upload: yup.mixed(),
});
