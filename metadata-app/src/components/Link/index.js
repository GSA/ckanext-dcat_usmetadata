import React from 'react';
import PropTypes from 'prop-types';

const Link = (props) => {
  // TODO this should test against the app's base url instead of just a
  // protocol, or possibly non-.gov URLs depending on the requirement.
  // Assume any non-relative URL is an external URL.
  const isExternal = /^https?:\/\//.test(props.href) || props.target === '_blank';
  let classes = ['usa-link'];
  let rel = props.rel ? [props.rel] : [];

  if (isExternal) {
    classes = classes.concat(['usa-link--external']);
    rel = rel.concat(['noopener', 'noreferrer']);
  }

  return (
    <a
      href={props.href}
      className={classes.join(' ')}
      rel={rel.length ? rel.join(' ') : undefined}
      {...props}
    >
      {props.children}
    </a>
  );
};

Link.propTypes = {
  href: PropTypes.string,
  target: PropTypes.string,
  children: PropTypes.any, // eslint-disable-line
};

Link.defaultValues = {
  rel: null,
}

export default Link;
