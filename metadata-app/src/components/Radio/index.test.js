import React from 'react';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import Radio from '.';

const Radios = () => {
  return (
    <Formik>
      <form>
        <Radio
          label="My dataset is public"
          name="rights"
          value="true"
          selected="true"
          id="rights_option_1"
        />
        <Radio label="My dataset is not public" name="rights" value="false" id="rights_option_2" />
      </form>
    </Formik>
  );
};

// eslint-disable-next-line
console.log('------------ Run Radio Tests ------------');
test('Renders Radio component', () => {
  const { getByLabelText } = render(<Radios />);
  const radio1 = getByLabelText('My dataset is public');
  const radio2 = getByLabelText('My dataset is not public');
  expect(radio1).toBeInTheDocument();
  expect(radio2).toBeInTheDocument();
});
