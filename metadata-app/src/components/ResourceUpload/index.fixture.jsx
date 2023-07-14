import React from 'react';
import { Formik } from 'formik';
import ResourceUpload from '.';
import '../../css/custom.css';

const Form = () => (
  <div className="grid-container">
    <Formik
      initialValues={{}}
      render={(values, setFieldValue) => (
        <form>
          <ResourceUpload values={values} setFieldValue={setFieldValue} />
        </form>
      )}
    />
  </div>
);

export default <Form />;
