import React from 'react';
import { Formik } from 'formik';
import Autocomplete from '.';
import '../../css/custom.css';

const apiUrl = 'http://localhost:5000/api/3/action/';
const apiKey = '6556b77b-b96b-4352-999c-bde4a0d86cce';

export default (
  <div style={{ margin: '1em' }}>
    <Formik
      initialValues={{ fooField: 'foo-id' }}
      render={(opts) => (
        <form>
          <Autocomplete
            id="tags-autocomplete-input"
            formValues={opts}
            apiUrl={apiUrl}
            apiKey={apiKey}
            inputValue="Foo Name"
            name="fooField"
            required="true"
            placeholderText="Start typing to search"
            helptext="A help text for autocomplete"
          />
        </form>
      )}
    />
  </div>
);
