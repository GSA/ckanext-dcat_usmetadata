import React, { useState, useRef, useEffect } from 'react';
import { ReactComponent as Info } from 'uswds/dist/img/alerts/info.svg';

import PropTypes from 'prop-types';

const ToolTip = (props) => {
  const { children } = props;

  const tooltipRef = useRef(null);
  const iconRef = useRef(null);

  const [toolTipShown, setToolTipShown] = useState(false);
  // eslint-disable-next-line
  const toggleToolTip = () => setToolTipShown(toolTipShown ? false : true);

  useEffect(() => {
    // Handles click event
    function handleClickOutside(event) {
      // Check if it outside of the current element
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target) &&
        iconRef.current &&
        !iconRef.current.contains(event.target)
      ) {
        setToolTipShown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [tooltipRef]);

  return (
    <div className="tooltip">
      <Info
        height="20px"
        width="20px"
        ref={iconRef}
        style={{ marginLeft: '.5em' }}
        tabIndex={0}
        onClick={() => toggleToolTip()}
        onKeyUp={(event) => {
          if (event.keyCode === 13) {
            toggleToolTip();
          }
        }}
      />
      {toolTipShown && (
        <div ref={tooltipRef}>
          <span className="tooltiptext">
            <span className="close">
              <span
                tabIndex={0}
                className="close-tag"
                onClick={() => setToolTipShown(false)}
                role="button"
                onKeyUp={(event) => {
                  if (event.keyCode === 13) {
                    setToolTipShown(false);
                  }
                }}
              >
                &times;
              </span>
            </span>
            {children}
          </span>
        </div>
      )}
    </div>
  );
};

ToolTip.propTypes = {
  children: PropTypes.any, // eslint-disable-line
};

export default ToolTip;
