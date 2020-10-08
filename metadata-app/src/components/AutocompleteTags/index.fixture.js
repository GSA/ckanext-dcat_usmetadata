import React from 'react';
import { Formik } from 'formik';
import AutocompleteTags from '.';
import '../../css/custom.css';

const apiUrl = 'http://localhost:5000/api/3/action/';
const apiKey = '6556b77b-b96b-4352-999c-bde4a0d86cce';

export default (
  <div style={{ margin: '1em' }}>
    <Formik
      initialValues={{ tags: [{ id: 1, name: 'foobar' }] }}
      render={(opts) => (
        <form>
          <AutocompleteTags
            id="tags-autocomplete-input"
            formValues={opts}
            apiUrl={apiUrl}
            apiKey={apiKey}
            name="tags"
            titleField="name"
            required="true"
            placeholderText="Start typing to search"
            helptext="Use both technical and non-technical terms to help users find your dataset."
          />
        </form>
      )}
    />
  </div>
);
