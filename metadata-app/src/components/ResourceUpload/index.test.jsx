import React from 'react';
import { Formik } from 'formik';
import { render } from '@testing-library/react';
import ResourceUpload from '.';
import '../../css/custom.css';

const Form = () => (
  <Formik initialValues={{}}>
    {(values, setFieldValue, submitForm) => (
      <form>
        <ResourceUpload values={values} setFieldValue={setFieldValue} submitForm={submitForm} />
      </form>
    )}
  </Formik>
);

test('Renders Resource Upload component', () => {
  const { container } = render(<Form />);
  expect(container).toMatchSnapshot();
});
