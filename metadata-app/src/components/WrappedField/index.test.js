import React from 'react';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import WrappedField from '.';

// eslint-disable-next-line
console.log('------------ Run WrappedField Tests ------------');
test('renders learn stubbed MetadataForm', () => {
  const { getByLabelText, getByPlaceholderText } = render(
    <Formik
      initialValues={{}}
      render={({ values }) => (
        <div className="">
          <form>
            <WrappedField
              label="Test wrapped field"
              name="testing"
              id="testing"
              type="string"
              placeholder="Test placeholder"
              value={values.testing}
              required={false}
            />
          </form>
        </div>
      )}
    />
  );
  const placeholderText = getByPlaceholderText('Test placeholder');
  const labelText = getByLabelText('Test wrapped field');
  expect(placeholderText).toBeInTheDocument();
  expect(labelText).toBeInTheDocument();
});
