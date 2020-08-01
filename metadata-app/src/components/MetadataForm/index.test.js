import React from 'react';
import { render } from '@testing-library/react';
import MetadataForm from '.';

console.log('------------ Run MetadataForm Tests ------------');
test('renders learn stubbed MetadataForm', () => {
  const { getByText } = render(
    <MetadataForm apiUrl="https://testing/api" apiKey="123" ownerOrg="123" />
  );
  const apiUrl = getByText(/apiUrl/i);
  const apiKey = getByText(/apiKey/i);
  const ownerOrg = getByText(/apiUrl/i);
  expect(apiUrl).toBeInTheDocument();
  expect(apiKey).toBeInTheDocument();
  expect(ownerOrg).toBeInTheDocument();
});
