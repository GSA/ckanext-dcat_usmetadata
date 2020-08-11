import React from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'formik';
import ReactTags from 'react-tag-autocomplete';
import './index.css';

const TagsAutocomplete = (props) => {
  const { tags, name } = props;

  return (
    <FieldArray
      name={name}
      render={(arrayHelpers) => (
        <div className="react-tags-input">
          <div id="tags-error" className="error-msg hidden" type="string" placeholder="" value="">
            Tags are required
          </div>
          <ReactTags
            tags={tags}
            suggestions={[]}
            allowNew
            ref={React.createRef()}
            onAddition={arrayHelpers.push}
            onDelete={arrayHelpers.remove}
            className="usa-input"
          />
        </div>
      )}
    />
  );
};

TagsAutocomplete.propTypes = {
  tags: PropTypes.any, // eslint-disable-line
  name: PropTypes.string.isRequired,
};

export default TagsAutocomplete;
