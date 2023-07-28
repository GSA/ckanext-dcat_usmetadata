import React from 'react';
import { Formik } from 'formik';
import WrappedField from '.';
import '../../css/custom.css';

export default {
  text: (
    <div style={{ margin: '1em' }}>
      <Formik
        initialValues={{}}
        render={({ values }) => (
          <div className="">
            <form>
              <WrappedField
                label="Test wrapped field"
                name="testing"
                type="string"
                placeholder="Test placeholder"
                value={values.testing}
              />
            </form>
          </div>
        )}
      />
    </div>
  ),
  helpTextString: (
    <div style={{ margin: '1em' }}>
      <Formik
        initialValues={{}}
        render={({ values }) => (
          <div className="">
            <form>
              <WrappedField
                label="Test wrapped field"
                name="testing"
                type="string"
                placeholder="Test placeholder"
                helptext="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                value={values.testing}
              />
            </form>
          </div>
        )}
      />
    </div>
  ),
  infoText: (
    <div style={{ margin: '1em' }}>
      <Formik
        initialValues={{}}
        render={({ values }) => (
          <div className="">
            <form>
              <WrappedField
                label="Test wrapped field"
                name="testing"
                type="string"
                placeholder="Test placeholder"
                infoText="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                value={values.testing}
              />
            </form>
          </div>
        )}
      />
    </div>
  ),
};
