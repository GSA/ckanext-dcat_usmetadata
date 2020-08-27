import React from 'react';
import PropTypes from 'prop-types';

const HelpText = (props) => {
  const { children } = props;
  return <span className="usa-helptext">{children}</span>;
};

HelpText.propTypes = {
  children: PropTypes.any, // eslint-disable-line
};

export default HelpText;
