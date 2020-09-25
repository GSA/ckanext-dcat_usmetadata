import React from 'react';
import { render } from '@testing-library/react';
import Autocomplete from '.';

// eslint-disable-next-line
test('Renders Autocomplete component', () => {
  const { getByPlaceholderText } = render(<Autocomplete name="foo" apiUrl="123" apiKey="123" />);
  const text = getByPlaceholderText('Add new tag');
  expect(text).toBeInTheDocument();
});
