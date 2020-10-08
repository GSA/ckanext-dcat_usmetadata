import * as yup from 'yup';

export default yup.object().shape({
  resource: yup.object().shape({
    name: yup.string(),
    description: yup.string(),
    mimetype: yup.string(),
    format: yup.string(),
    url: yup.string().url(),
    upload: yup.mixed(),
  }),
});
