import React from 'react';
import { Formik } from 'formik';
import AdditionalMetadata from '.';
import '../../css/custom.css';

const apiUrl = 'http://localhost:5000/api/3/action/';
const apiKey = '6556b77b-b96b-4352-999c-bde4a0d86cce';

const Form = () => (
  <div className="grid-container">
    <Formik
      initialValues={{}}
      render={(values) => (
        <form>
          <AdditionalMetadata
            apiKey={apiKey}
            apiUrl={apiUrl}
            currentStep={1}
            fetchDatasetsOpts="false"
            values={values}
          />
        </form>
      )}
    />
  </div>
);

export default <Form />;
