import React from 'react';
import PropTypes from 'prop-types';

const HelpText = (props) => {
  const { currentStep, handleSteps } = props;
  return (
    <div className="app_navigation" id="app_navigation">
      <div
        tabIndex="0"
        role="button"
        className={`navsec ${currentStep === 0 ? 'active' : ''}`}
        onClick={() => handleSteps(0)}
        onKeyDown={() => handleSteps(0)}
        id="nav-item-first"
      >
        <span>Required Metadata</span>
      </div>
      <div
        tabIndex="0"
        role="link"
        className={`navsec ${currentStep === 1 ? 'active' : ''}`}
        onKeyDown={() => {
          handleSteps(1);
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
        onKeyDown={() => {
          handleSteps(2);
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

HelpText.propTypes = {
  currentStep: PropTypes.number.isRequired,
  handleSteps: PropTypes.func.isRequired,
};

export default HelpText;
