import * as yup from 'yup';

export default yup.object().shape({
  resource: yup.object().shape({
    name: yup.string(),
    description: yup.string(),
    mimetype: yup.string(),
    format: yup.string(),
    url: yup
      .string()
      .url(
        'If you are linking to a dataset, please include "https://" at the beginning of your URL.'
      ),
    upload: yup.mixed(),
  }),
});
