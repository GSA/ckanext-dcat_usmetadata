import * as yup from 'yup';

export default yup.object().shape({
  title: yup.string().required('Title is required'),
  contactPoint: yup.string().required('Contact is required'),
  identifier: yup.string().required('Unique ID is required'),
  contactEmail: yup.string().email('Must be valid email').required('Contact email is required'),
  description: yup.string().required('Description is required'),
  publisher: yup.string().required('Publisher is required'),
  subagency: yup.string(),
  accessLevel: yup.string().required('Access level is required'),
  dataQuality: yup.string().required('Data Quality is required'),
  rights: yup
    .boolean()
    /* eslint-disable-next-line */
    .test('test-rights', 'Must include description if metadata is not public', function (value) {
      const { createError } = this;
      const vals = this.from[0].value;
      if (vals.rights === 'non-public' && vals.rights_desc === undefined) {
        return createError({
          path: 'rights',
          message: 'Must include description if metadata is not public',
        });
      }
    }),
  rights_desc: yup.string(),
  spatial: yup.string(),
  license_others: yup.string(),
  license: yup.string().required('License is required'),
  temporal_start_date: yup.date(),
  temporal_end_date: yup.date(),
});
