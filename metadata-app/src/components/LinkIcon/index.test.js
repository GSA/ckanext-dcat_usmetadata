import React from 'react';
import { render } from '@testing-library/react';
import LinkIcon from '.';

// eslint-disable-next-line
console.log('------------ Run LinkIcon Tests ------------');
test('Renders HelpText component', () => {
  const { getByAltText } = render(
    <a href="http://google.com">
      Link text here <LinkIcon />
    </a>
  );
  const icon = getByAltText('Link opens in new tab');
  expect(icon).toBeInTheDocument();
  expect(icon).toBeVisible();
});
