import React from 'react';
import { render } from '@testing-library/react';
import ToolTip from '.';

test('Renders Tooltip component', () => {
  const { getByText } = render(
    <ToolTip>
      <h1>Tooltip title</h1>
      <p>Tooltip paragraph</p>
    </ToolTip>
  );
  const title = getByText('Tooltip title');
  const paragraph = getByText('Tooltip paragraph');
  expect(title).toBeInTheDocument();
  expect(paragraph).toBeInTheDocument();
});
