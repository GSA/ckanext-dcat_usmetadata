import React from 'react';
import { render } from '@testing-library/react';
import HelpText from '.';

// eslint-disable-next-line
console.log('------------ Run HelpText Tests ------------');
test('Renders HelpText component', () => {
  const { getByText } = render(<HelpText>{[<span key="0">Help text goes here!</span>]}</HelpText>);
  const text = getByText('Help text goes here!');
  expect(text).toBeInTheDocument();
});
