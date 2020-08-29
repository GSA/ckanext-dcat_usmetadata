import React from 'react';
import PropTypes from 'prop-types';
import '../../css/uswds.css';

const AlertBox = (props) => {
  window.scrollTo(0, 0);
  const { type, errors, message, heading } = props;
  const formErrors =
    errors &&
    errors.map((error) => (
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
              {message}
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
  message: PropTypes.string,
  type: PropTypes.string,
};

export default AlertBox;
