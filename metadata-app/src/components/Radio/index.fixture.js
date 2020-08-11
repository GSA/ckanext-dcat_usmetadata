import React, { useState } from 'react';
import { Formik } from 'formik';
import Radio from '.';
import WrappedField from '../WrappedField';
import HelpText from '../HelpText';

const helptext = (
  <HelpText>
    If your dataset is not public, please add an explanation of rights and feel free to include any
    instructions on restrictions, or how to access a restricted file (max 255 characters)*
  </HelpText>
);

const Radios = (props) => {
  const { rights, rightsDesc } = props; // eslint-disable-line
  const [hasRights, setRights] = useState(rights);
  const [rightsDescription, setRightsDescription] = useState(rightsDesc);
  return (
    <div className="col-md-12">
      <span className="usa-label">Rights*</span> <br />
      <Radio
        label="My dataset is public"
        name="rights"
        value={hasRights}
        selected={hasRights}
        handleRadio={() => {
          setRights(true);
        }}
        id="rights_option_1"
      />
      <Radio
        label="My dataset is not public"
        name="rights"
        value={hasRights}
        selected={!hasRights}
        handleRadio={() => {
          setRights(false);
        }}
        id="rights_option_2"
      />
      <WrappedField
        name="rights_desc"
        type="string"
        value={rightsDescription}
        onChange={(e) => setRightsDescription(e.target.value)}
        helptext={helptext}
        disabled={hasRights}
      />
    </div>
  );
};

export default (
  <Formik
    render={() => (
      <form>
        <Radios rights="true" rights_desc="Description of rights" />
      </form>
    )}
  />
);
