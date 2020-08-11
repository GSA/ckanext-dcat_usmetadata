import React from 'react';
import { Formik } from 'formik';
import { render } from '@testing-library/react';
import RequiredMetadata from '.';
import '../../css/custom.css';

const Form = () => (
  <Formik
    initialValues={{}}
    render={(values) => (
      <form>
        <RequiredMetadata
          apiUrl="http://localhost:5000/api/3/action"
          currentStep={1}
          fetchDatasetsOpts="false"
          values={values}
        />
      </form>
    )}
  />
);

test('Renders RequiredMetadata component', () => {
  const { getByText } = render(<Form />);
  const text1 = getByText('Contact Name');
  const text2 = getByText('Meets Agency Data Quality');
  const text3 = getByText(
    'The publishing entity (e.g. your agency) and optionally their parent organization(s).'
  );
  expect(text1).toBeInTheDocument();
  expect(text2).toBeInTheDocument();
  expect(text3).toBeInTheDocument();
});
