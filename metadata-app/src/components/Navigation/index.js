import React from 'react';
import PropTypes from 'prop-types';

// Navigation block for moving between form pages (steps)
// Step 1 -- Required metadata
// Step 2 -- Additional metadata
// Step 3 -- Resource uploads / links
const Navigation = (props) => {
  const { currentStep, handleSteps } = props;
  return (
    <div className="app_navigation" id="app_navigation">
      <div
        tabIndex="0"
        role="button"
        className={`navsec ${currentStep === 0 ? 'active' : ''}`}
        onClick={() => handleSteps(0)}
        onKeyUp={(e) => {
          if (e.keyCode === 13) {
            handleSteps(0);
          }
        }}
        id="nav-item-first"
      >
        <span>Required Metadata</span>
      </div>
      <div
        tabIndex="0"
        role="link"
        className={`navsec ${currentStep === 1 ? 'active' : ''}`}
        onKeyUp={(e) => {
          if (e.keyCode === 13) {
            handleSteps(1);
          }
        }}
        onClick={() => {
          handleSteps(1);
        }}
      >
        <span>Additional Metadata</span>
      </div>
      <div
        tabIndex="0"
        role="button"
        className={`navsec ${currentStep === 2 ? 'active' : ''}`}
        onKeyUp={(e) => {
          if (e.keyCode === 13) {
            handleSteps(2);
          }
        }}
        onClick={() => {
          handleSteps(2);
        }}
      >
        <span>Resource Upload</span>
      </div>
    </div>
  );
};

Navigation.propTypes = {
  currentStep: PropTypes.number.isRequired,
  handleSteps: PropTypes.func.isRequired,
};

export default Navigation;
