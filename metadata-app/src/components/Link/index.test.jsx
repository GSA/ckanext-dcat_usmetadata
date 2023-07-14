import React from 'react';
import { render } from '@testing-library/react';
import Link from '.';

test('Renders Link component', () => {
  const { getByText } = render(<Link href="https://example.com">Example</Link>);

  const link = getByText('Example');
  expect(link).toBeInTheDocument();
  expect(link).toBeVisible();
  expect(link).toHaveAttribute('href', 'https://example.com');
  expect(link).toHaveClass('usa-link');
});

test('Given external href, Link is rendered with the external class', () => {
  const { getByText } = render(<Link href="https://example.com">Example</Link>);

  const link = getByText('Example');
  expect(link).toHaveClass('usa-link usa-link--external');
  expect(link).toHaveAttribute('rel', 'noopener noreferrer');
});

test('Given relative href, Link is rendered without the external class', () => {
  const { getByText } = render(<Link href="/about">Example</Link>);

  const link = getByText('Example');
  expect(link).toHaveClass('usa-link');
  expect(link).not.toHaveClass('usa-link--external');
  expect(link).not.toHaveAttribute('rel');
});

test('Given target attribute, Link is rendered with the target attribute', () => {
  const { getByText } = render(
    <Link target="_blank" href="https://example.com">
      Example
    </Link>
  );

  const link = getByText('Example');
  expect(link).toHaveAttribute('target', '_blank');
});
