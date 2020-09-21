import React from 'react';
import { Formik } from 'formik';
import { render } from '@testing-library/react';
import RequiredMetadata from '.';
import '../../css/custom.css';

const Form = () => (
  <Formik initialValues={{}}>
    {(values) => (
      <form>
        <RequiredMetadata
          apiUrl="http://localhost:5000/api/3/action"
          apiKey="123"
          currentStep={1}
          fetchDatasetsOpts="false"
          values={values}
        />
      </form>
    )}
  </Formik>
);

test('Renders RequiredMetadata component', () => {
  const { getByText } = render(<Form />);
  const text1 = getByText('Contact Email');
  const text2 = getByText(
    'The publishing entity (e.g. your agency) and optionally their parent organization(s).'
  );
  expect(text1).toBeInTheDocument();
  expect(text2).toBeInTheDocument();
});
