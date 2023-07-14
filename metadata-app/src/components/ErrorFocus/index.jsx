import React from 'react';
import PropTypes from 'prop-types';

// Helper component to scroll/focus the first error on submit.
// Note that this is based on https://gist.github.com/dphrag/4db3b453e02567a0bb52592679554a5b
class ErrorFocus extends React.Component {
  componentDidUpdate(prevProps) {
    const { isSubmitting, isValidating, errors } = prevProps;
    const keys = Object.keys(errors);

    if (keys.length > 0 && isSubmitting && !isValidating) {
      const selector = `[name="${keys[0]}"]`;
      const errorElement = document.querySelector(selector);
      errorElement.focus();
    }
  }

  render() {
    return null;
  }
}

ErrorFocus.propTypes = {
  isSubmitting: PropTypes.bool.isRequired,
  isValidating: PropTypes.bool,
  errors: PropTypes.any, // eslint-disable-line
};

export default ErrorFocus;
