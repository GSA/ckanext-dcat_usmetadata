import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'formik';
import ReactTags from 'react-tag-autocomplete';
import './index.css';

const Autocomplete = (props) => {
  const { tags, name, helptext, placeholder, apiUrl, apiKey, errors, fetchOpts } = props;
  const [suggestions, setSuggestions] = useState([]);

  return (
    <FieldArray
      name={name}
      render={(arrayHelpers) => (
        <div className="react-tags-input grid-col-12">
          {errors && errors[name] && (
            <span className="error-msg">
              {errors[name]}
              <br />
            </span>
          )}
          {helptext}
          <ReactTags
            tags={tags}
            suggestions={suggestions}
            allowNew
            ref={React.createRef()}
            onAddition={arrayHelpers.push}
            onDelete={arrayHelpers.remove}
            className="usa-input"
            placeholderText={placeholder}
            onInput={async (q) => {
              try {
                const res = await fetchOpts(q, apiUrl, apiKey);
                setSuggestions(res);
              } catch (e) {
                console.warn('Unable to fetch autocomplete options', e); // eslint-disable-line no-console
              }
            }}
          />
        </div>
      )}
    />
  );
};

Autocomplete.propTypes = {
  apiUrl: PropTypes.string.isRequired,
  apiKey: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  tags: PropTypes.any, // eslint-disable-line
  helptext: PropTypes.any, // eslint-disable-line
  errors: PropTypes.any, // eslint-disable-line
  fetchOpts: PropTypes.any, // eslint-disable-line
};

export default Autocomplete;
