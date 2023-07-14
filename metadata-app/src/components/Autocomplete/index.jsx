import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useField } from 'formik';

import Autosuggest from 'react-autosuggest';

import './index.css';

const getSuggestionValue = (suggestion) => suggestion.name;

const renderSuggestion = (suggestion, { query }) => {
  const suggested = suggestion.name;
  const tail = suggested.substring(query.length, suggested.length);
  return (
    <div>
      <mark>{query}</mark>
      {tail}
    </div>
  );
};

const Autocomplete = (props) => {
  const {
    name,
    helptext,
    inputValue,
    value,
    placeholder,
    apiUrl,
    apiKey,
    errors,
    fetchOpts,
  } = props;
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [field, meta, helpers] = useField(name); // eslint-disable-line
  const { setValue } = helpers;

  const [typedText, setTypedText] = useState('');

  const onChange = (event) => {
    const typed = event.target.value;
    if (!typed) {
      setValue('');
      setSelected(null);
    }
    setTypedText(typed || '');
  };

  useEffect(() => {
    // TODO - Second condition is kinda a hack, due to
    // the incompleteness of the backend forParent Dataset autcomplete
    if (!inputValue || (value === inputValue && typedText)) {
      setTypedText(inputValue || '');
      return;
    }
    setTypedText(inputValue || '');
    setSelected({ id: value, name: inputValue });
  }, [inputValue]);

  const getSuggestions = async (typed) => {
    const currentInputValue = (typed || '').trim().toLowerCase();
    const inputLength = currentInputValue.length;

    if (inputLength === 0) return [];
    try {
      return (await fetchOpts(currentInputValue, apiUrl, apiKey)).filter(
        (item) => item.name.toLowerCase().slice(0, inputLength) === currentInputValue
      );
    } catch (e) {
      console.warn('Unable to fetch autocomplete options', e); // eslint-disable-line no-console
      return [];
    }
  };

  // Autosuggest will call this function every time you need to update suggestions.
  // eslint-disable-next-line
  const onSuggestionsFetchRequested = async ({ value }) => {
    setSuggestions(await getSuggestions(value));
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const onSuggestionSelected = (event, { suggestion }) => {
    // update name, id based selected option
    setSelected(suggestion);
    // update the input
    setTypedText(suggestion.name);
    // saves the value in form
    setValue(suggestion.id);
  };

  const onBlur = () => {
    // Make sure that input value reflects to selected option
    if (selected) {
      setTypedText(selected.name);
    } else setTypedText('');
  };

  return (
    <div className={`react-tags-input grid-col-12 ${errors && errors[name] && 'field-error'}`}>
      <div className="usa-helptext">{helptext}</div>
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        onSuggestionSelected={onSuggestionSelected}
        theme={{
          container: 'react-autosuggest__container',
          containerOpen: 'react-autosuggest__container--open',
          input: 'usa-input',
          inputOpen: 'react-autosuggest__input--open',
          inputFocused: 'react-autosuggest__input--focused',
          suggestionsContainer: 'react-autosuggest__suggestions-container',
          suggestionsContainerOpen: 'react-autosuggest__suggestions-container--open',
          suggestionsList: 'react-autosuggest__suggestions-list',
          suggestion: 'react-autosuggest__suggestion',
          suggestionFirst: 'react-autosuggest__suggestion--first',
          suggestionHighlighted: 'react-autosuggest__suggestion--highlighted',
          sectionContainer: 'react-autosuggest__section-container',
          sectionContainerFirst: 'react-autosuggest__section-container--first',
          sectionTitle: 'react-autosuggest__section-title',
        }}
        inputProps={{
          placeholder,
          value: typedText,
          onChange,
          onBlur,
        }}
      />
    </div>
  );
};

Autocomplete.propTypes = {
  apiUrl: PropTypes.string.isRequired,
  apiKey: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.any, // eslint-disable-line
  inputValue: PropTypes.string,
  helptext: PropTypes.any, // eslint-disable-line
  errors: PropTypes.any, // eslint-disable-line
  fetchOpts: PropTypes.any, // eslint-disable-line
};

export default Autocomplete;
