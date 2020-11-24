import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ToolTip from '.';

test('Renders Tooltip component', () => {
  const { container } = render(
    <ToolTip>
      <h1>Tooltip title</h1>
      <p>Tooltip paragraph</p>
    </ToolTip>
  );
  const svg = container.querySelector('svg');
  expect(svg).toBeInTheDocument();
});

test('Tooltip opens on click and closes double click', () => {
  const { container, getByText } = render(
    <ToolTip>
      <h1>Tooltip title</h1>
      <p>Tooltip paragraph</p>
    </ToolTip>
  );

  fireEvent.click(container.querySelector('svg'));

  const title = getByText('Tooltip title');
  const paragraph = getByText('Tooltip paragraph');
  expect(title).toBeInTheDocument();
  expect(paragraph).toBeInTheDocument();

  fireEvent.click(container.querySelector('svg'));
  expect(paragraph).not.toBeInTheDocument();
});
