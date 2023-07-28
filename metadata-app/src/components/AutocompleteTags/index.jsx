import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FieldArray, useField } from 'formik';
import ReactTags from 'react-tag-autocomplete';
import './index.css';

const AutocompleteTags = (props) => {
  const { tags, name, helptext, placeholder, apiUrl, apiKey, errors, fetchOpts, type } = props;
  const [suggestions, setSuggestions] = useState([]);
  const [field, meta, helpers] = useField(name); // eslint-disable-line
  const { setValue } = helpers;

  if (type === 'string') {
    const onAddition = (tag) => {
      setValue(tag.id);
    };

    const onDelete = () => {
      setValue('');
    };

    const currentParent = props.value ? [{ name: props.value }] : [];

    return (
      <div className={`react-tags-input grid-col-12 ${errors && errors[name] && 'field-error'}`}>
        <div className="usa-helptext">{helptext}</div>
        <ReactTags
          tags={currentParent}
          suggestions={suggestions}
          allowNew
          addOnBlur
          ref={React.createRef()}
          onAddition={onAddition}
          onDelete={onDelete}
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
    );
  }

  return (
    <FieldArray
      name={name}
      render={(arrayHelpers) => (
        <div className={`react-tags-input grid-col-12 ${errors && errors[name] && 'field-error'}`}>
          {errors && errors[name] && (
            <span className="error-msg">
              {errors[name].constructor.name === 'String'
                ? errors[name]
                : JSON.stringify(errors[name])}
              <br />
            </span>
          )}
          {helptext}
          <ReactTags
            tags={tags}
            suggestions={suggestions}
            allowNew
            addOnBlur
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

AutocompleteTags.propTypes = {
  apiUrl: PropTypes.string.isRequired,
  apiKey: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.any, // eslint-disable-line
  value: PropTypes.any, // eslint-disable-line
  tags: PropTypes.any, // eslint-disable-line
  helptext: PropTypes.any, // eslint-disable-line
  errors: PropTypes.any, // eslint-disable-line
  fetchOpts: PropTypes.any, // eslint-disable-line
};

export default AutocompleteTags;
