import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'formik';
import ReactTags from 'react-tag-autocomplete';
import Api from '../../api';
import './index.css';

const TagsAutocomplete = (props) => {
  const { tags, name, helptext, apiUrl, apiKey, errors } = props;
  const [suggestions, setSuggestions] = useState([]);
  const formErrors = errors || {};

  return (
    <FieldArray
      name={name}
      render={(arrayHelpers) => (
        <div className="react-tags-input grid-col-12">
          {formErrors[name] && (
            <span className="error-msg">
              {formErrors[name]}
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
            onInput={async (q) => {
              try {
                const res = await Api.fetchTags(q, apiUrl, apiKey);
                setSuggestions(res);
              } catch (e) {
                console.warn('Unable to fetch tags', e); // eslint-disable-line no-console
              }
            }}
          />
        </div>
      )}
    />
  );
};

TagsAutocomplete.propTypes = {
  apiUrl: PropTypes.string.isRequired,
  apiKey: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  tags: PropTypes.any, // eslint-disable-line
  helptext: PropTypes.any, // eslint-disable-line
  errors: PropTypes.any, // eslint-disable-line
};

export default TagsAutocomplete;
