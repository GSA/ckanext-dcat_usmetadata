import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'formik';
import ReactTags from 'react-tag-autocomplete';
import './index.css';

const Autocomplete = (props) => {
  const { tags, name, helptext, placeholder, apiUrl, apiKey, errors, fetchOpts, maxTags } = props;
  const [suggestions, setSuggestions] = useState([]);

  const [tagsState, setTagsState] = useState([]);

  // when the tags array is already available
  useEffect(() => {
    if (tags) setTagsState([...tags]);
  }, [tags]);

  // This updates the tags array without losing it's reference
  useEffect(() => {
    if (!tags) return;
    tags.splice(0, tags.length);
    tags.push(...tagsState);
  }, [tagsState]);

  const handleOnAddition = (tag) => {
    if (maxTags === tagsState.length) return;
    setTagsState([...tagsState, tag]);
  };

  const handleOnDelete = (i) => {
    const updatedTags = tagsState.slice(0);
    updatedTags.splice(i, 1);
    setTagsState(updatedTags);
  };

  return (
    <FieldArray
      name={name}
      render={() => (
        <div className={`react-tags-input grid-col-12 ${errors && errors[name] && 'field-error'}`}>
          {errors && errors[name] && (
            <span className="error-msg">
              {errors[name]}
              <br />
            </span>
          )}
          {helptext}
          <ReactTags
            tags={tagsState}
            suggestions={suggestions}
            allowNew
            ref={React.createRef()}
            className="usa-input"
            placeholderText={placeholder}
            onAddition={handleOnAddition}
            onDelete={handleOnDelete}
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
  maxTags: PropTypes.number,
};

export default Autocomplete;
