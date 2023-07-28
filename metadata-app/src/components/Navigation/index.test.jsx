import React from 'react';
import { render } from '@testing-library/react';
import Navigation from '.';

// eslint-disable-next-line
console.log('------------ Run Navigation Tests ------------');
test('renders Navigation', () => {
  const { getByText } = render(
    <Navigation
      currentStep={0}
      formCount={1}
      handleSteps={() => {}} // noop
    />
  );
  const nav1 = getByText('Required Metadata');
  const nav2 = getByText('Additional Metadata');
  const nav3 = getByText('Resource Upload');
  expect(nav1).toBeInTheDocument();
  expect(nav2).toBeInTheDocument();
  expect(nav3).toBeInTheDocument();
});
