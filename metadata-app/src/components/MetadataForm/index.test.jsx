import React from 'react';
import { render } from '@testing-library/react';
import MetadataForm from '.';

// eslint-disable-next-line
console.log('------------ Run MetadataForm Tests ------------');
test('renders MetadataForm component', () => {
  const { container, getAllByText } = render(
    <MetadataForm apiUrl="https://testing/api" apiKey="123" ownerOrg="123" />
  );
  const apiUrl = getAllByText(/Required metadata/i);
  expect(apiUrl.length).toBe(3);

  expect(container).toMatchSnapshot();
});
