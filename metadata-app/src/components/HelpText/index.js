import React from 'react';
import PropTypes from 'prop-types';

const HelpText = (props) => {
  const { children } = props;
  return <p className="usa-helptext">{children}</p>;
};

HelpText.propTypes = {
  children: PropTypes.any, // eslint-disable-line
};

export default HelpText;
