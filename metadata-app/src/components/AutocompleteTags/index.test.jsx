import React from 'react';
import { render } from '@testing-library/react';
import { Formik, Form } from 'formik';
import AutocompleteTags from '.';

// eslint-disable-next-line
test('Renders AutocompleteTags component', () => {
  const { getByPlaceholderText } = render(
    <Formik>
      <Form>
        <AutocompleteTags
          id="foo-field"
          name="foo"
          apiUrl="http://127.0.0.1:5000/api/3/action/"
          apiKey="123"
          placeholder="Add new tag"
          errors={{}}
        />
      </Form>
    </Formik>
  );
  const text = getByPlaceholderText('Add new tag');
  expect(text).toBeInTheDocument();
});
