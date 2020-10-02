import React from 'react';
import Outbound from '../../img/outbound.svg';

const LinkIcon = (props) => (
  <img
    src={Outbound}
    height="20px"
    position="relative"
    display="inline-block"
    alt="Link opens in new tab"
    {...props}
  />
);

export default LinkIcon;
