import * as yup from 'yup';

export default yup.object().shape({
  resource: {
    name: yup.string(),
    description: yup.string(),
    mimetype: yup.string(),
    format: yup.string(),
    url: yup.string().url(),
    upload: yup.mixed(),
  },
});
