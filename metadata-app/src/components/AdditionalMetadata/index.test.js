import React from 'react';
import { Formik } from 'formik';
import { render } from '@testing-library/react';
import AdditionalMetadata from '.';
import '../../css/custom.css';

const Form = () => (
  <Formik initialValues={{}}>
    {(values) => (
      <form>
        <AdditionalMetadata
          apiUrl="http://localhost:5000/api/3/action"
          apiKey="123"
          currentStep={2}
          fetchDatasetsOpts="false"
          values={values}
        />
      </form>
    )}
  </Formik>
);

test('Renders RequiredMetadata component', () => {
  const { getByText } = render(<Form />);
  const text1 = getByText('Meets Agency Data Quality');
  const text2 = getByText('Data Dictionary Type');
  const text3 = getByText('Select Parent Dataset');
  expect(text1).toBeInTheDocument();
  expect(text2).toBeInTheDocument();
  expect(text3).toBeInTheDocument();
});
