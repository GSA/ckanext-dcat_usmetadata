import React from 'react';
import { Formik } from 'formik';
import { render } from '@testing-library/react';
import ResourceUpload from '.';
import '../../css/custom.css';

const Form = () => (
  <Formik initialValues={{}}>
    {(values, setFieldValue) => (
      <form>
        <ResourceUpload values={values} setFieldValue={setFieldValue} />
      </form>
    )}
  </Formik>
);

test('Renders Resource Upload component', () => {
  const { getByText } = render(<Form />);
  expect(getByText('Upload data')).toBeInTheDocument();
  expect(getByText('Link to data')).toBeInTheDocument();
  expect(getByText('Name')).toBeInTheDocument();
  expect(getByText('Description')).toBeInTheDocument();
  expect(getByText('Media Type')).toBeInTheDocument();
  expect(getByText('Format')).toBeInTheDocument();
});
