import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'formik';

const Radio = ({ label, value, styleClass, id, name }) => {
  return (
    <div className={`form-group ${styleClass}`}>
      <Field type="radio" className="usa-radio__input" value={value} name={name} id={id} />

      <label className="usa-radio__label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
};

Radio.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.node.isRequired,
  styleClass: PropTypes.string,
  value: PropTypes.string,
};

Radio.defaultProps = {
  styleClass: '',
};

export default Radio;
