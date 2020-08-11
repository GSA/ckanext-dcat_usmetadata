import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  const { getAllByText } = render(
    <App apiUrl="https://api.com/api/3/action" apiKey="foo" ownerOrg="123" />
  );
  const appText = getAllByText(/Required Metadata/i);
  expect(appText.length).toBe(3);
});
