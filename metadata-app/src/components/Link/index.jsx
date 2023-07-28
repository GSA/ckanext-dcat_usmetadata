import React from 'react';
import PropTypes from 'prop-types';

const Link = (props) => {
  // TODO this should test against the app's base url instead of just a
  // protocol, or possibly non-.gov URLs depending on the requirement.
  // Assume any non-relative URL is an external URL.
  const { children, href, rel, target } = props;

  const isExternal = /^https?:\/\//.test(href) || target === '_blank';
  let classes = ['usa-link'];
  let newRel = rel ? [rel] : [];

  if (isExternal) {
    classes = classes.concat(['usa-link--external']);
    newRel = newRel.concat(['noopener', 'noreferrer']);
  }

  return (
    <a
      href={href}
      className={classes.join(' ')}
      rel={newRel.length ? newRel.join(' ') : undefined}
      {...props}
    >
      {children}
    </a>
  );
};

Link.propTypes = {
  children: PropTypes.any, // eslint-disable-line
  href: PropTypes.string,
  rel: PropTypes.string,
  target: PropTypes.string,
};

Link.defaultValues = {
  rel: null,
};

export default Link;
