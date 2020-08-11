import React from 'react';
import PropTypes from 'prop-types';

const Radio = ({ label, selected, value, styleClass, id, name, handleRadio }) => {
  return (
    <div className={`form-group ${styleClass}`}>
      <input
        type="radio"
        className="usa-radio__input"
        value={value}
        defaultChecked={selected}
        onChange={handleRadio}
        name={name}
        id={id}
      />

      <label className="usa-radio__label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
};

Radio.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  handleRadio: PropTypes.func.isRequired,
  styleClass: PropTypes.string,
  value: PropTypes.string,
};

Radio.defaultProps = {
  styleClass: '',
};

export default Radio;
