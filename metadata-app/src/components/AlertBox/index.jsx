import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const AlertBox = (props) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { type, errors, message, heading } = props;
  const parsedErrors =
    errors &&
    errors.map((error) => {
      if (typeof error.message === 'string') {
        return error;
      }
      if (typeof error.message === 'object') {
        let label = Object.keys(error.message)[0];
        const errorMessage = error.message[label];
        label = label === 'url' ? 'Data:' : label;
        return {
          label,
          name: error.name,
          message: errorMessage,
        };
      }
      return null;
    });
  const formErrors =
    parsedErrors &&
    parsedErrors.map((error) => (
      <p key={error.name}>
        <b>{error.label}</b>{' '}
        {error.message.constructor.name === 'String'
          ? error.message
          : JSON.stringify(error.message)}
      </p>
    ));
  return (
    <div className="usa-prose">
      <div className="usa-alert__body">
        <div className={`usa-alert usa-alert--${type}`}>
          <div className="icon" />
          <div className="usa-alert__body">
            <h3 className="usa-alert__heading">{heading}</h3>
            <div className="usa-alert__text">
              {typeof message === 'string' && message}
              {typeof message === 'object' && message.map((item) => <p key={item}>{item}</p>)}
              {formErrors}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

AlertBox.propTypes = {
  errors: PropTypes.array, // eslint-disable-line
  heading: PropTypes.string,
  message: PropTypes.string || PropTypes.array,
  type: PropTypes.string,
};

export default AlertBox;
