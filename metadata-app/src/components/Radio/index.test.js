import React from 'react';
import { render } from '@testing-library/react';
import Radio from '.';

const Radios = () => (
  <div>
    <Radio
      label="My dataset is public"
      name="rights"
      value="true"
      selected="true"
      handleRadio={() => {
        // noop
      }}
      id="rights_option_1"
    />
    <Radio
      label="My dataset is not public"
      name="rights"
      value="false"
      selected="false"
      handleRadio={() => {
        // noop
      }}
      id="rights_option_2"
    />
  </div>
);

// eslint-disable-next-line
console.log('------------ Run Radio Tests ------------');
test('Renders Radio component', () => {
  const { getByLabelText } = render(<Radios />);
  const radio1 = getByLabelText('My dataset is public');
  const radio2 = getByLabelText('My dataset is not public');
  expect(radio1).toBeInTheDocument();
  expect(radio2).toBeInTheDocument();
});
