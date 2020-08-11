import React from 'react';
import { render } from '@testing-library/react';
import TagsAutocomplete from '.';

// eslint-disable-next-line
test('Renders HelpText component', () => {
  const { getByPlaceholderText } = render(<TagsAutocomplete name="foo" />);
  const text = getByPlaceholderText('Add new tag');
  expect(text).toBeInTheDocument();
});
