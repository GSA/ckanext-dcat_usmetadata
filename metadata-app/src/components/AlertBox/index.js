import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import '../../css/uswds.css';

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
        const messageParts = Object.values(error.message)[0].split(' ');
        return {
          label: Object.keys(error.message)[0],
          name: messageParts[0],
          message: messageParts.slice(1).join(' '),
        };
      }
      return null;
    });
  const formErrors =
    parsedErrors &&
    parsedErrors.map((error) => (
      <p key={error.name}>
        <b>{error.label}</b> {error.message}
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
