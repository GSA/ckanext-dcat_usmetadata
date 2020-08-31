import React from 'react';
import { render } from '@testing-library/react';
import RequiredMetadataLabels from '../RequiredMetadata/validationLabels';
import AlertBox from '.';

// TODO this should get moved to a helpers file
const formatErrors = (errors) =>
  Object.keys(errors).map((name) => {
    return {
      name,
      label: RequiredMetadataLabels[name],
      message: errors[name],
    };
  });

// eslint-disable-next-line
console.log('------------ Run AlertBox Tests ------------');
const errors = formatErrors({
  contact_name: 'Contact is required',
  unique_id: 'Unique ID is required',
  contact_email: 'Contact email is required',
  publisher: 'Publisher is required',
  public_access_level: 'Access level is required',
});

test('Renders AlertBox component', () => {
  window.scrollTo = jest.fn();
  const { getByText } = render(
    <AlertBox message="Validation errors:" errors={errors} apiKey="123" apiUrl="123" />
  );
  const errorMessage = getByText('Validation errors:');
  const errorFirst = getByText('Contact is required');
  const errorLast = getByText('Access level is required');

  expect(errorMessage).toBeInTheDocument();
  expect(errorFirst).toBeInTheDocument();
  expect(errorLast).toBeInTheDocument();
});
