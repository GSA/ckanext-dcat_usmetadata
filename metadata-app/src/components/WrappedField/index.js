import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'formik';
import { ReactComponent as Info } from '../../img/info.svg';
import '../../css/custom.css';

const WrappedField = (props) => {
  const [toolTipShown, setToolTipShown] = useState(false);
  // eslint-disable-next-line
  const toggleToolTip = () => setToolTipShown(toolTipShown ? false : true);

  const {
    name,
    label,
    children,
    helptext,
    required,
    id,
    disabled,
    infoText,
    onClick,
    ...rest
  } = props;

  const choices = rest.choices || [];
  const type = rest.type || 'string';

  let disabledClass = '';
  if (disabled) {
    disabledClass = 'disabled';
  } else {
    disabledClass = '';
  }

  return (
    <div>
      <label className="usa-label" htmlFor={id}>
        {label}
        {label && required && <span>*</span>}

        {/* Tooltip */}
        {infoText && (
          <div className={`tooltip ${toolTipShown ? 'show' : ''}`}>
            <Info
              height="20px"
              width="20px"
              style={{ marginLeft: '.5em' }}
              tabIndex={0}
              onClick={() => toggleToolTip()}
              onKeyUp={(event) => {
                if (event.keyCode === 13) {
                  toggleToolTip();
                }
              }}
            />
            <span className="tooltiptext">
              <span
                tabIndex={0}
                className="close"
                onClick={() => setToolTipShown(false)}
                role="button"
                onKeyUp={(event) => {
                  if (event.keyCode === 13) {
                    setToolTipShown(false);
                  }
                }}
              >
                <span className="close-tag">&times;</span>
              </span>
              <h3>{label}</h3>
              <p>{infoText}</p>
            </span>
          </div>
        )}
      </label>

      <div className={`usa-helptext ${disabledClass}`}>{helptext}</div>
      {onClick ? (
        <button className="clear-button" onClick={onClick} type="button">
          Remove
        </button>
      ) : (
        ''
      )}
      {
        {
          string: (
            <Field
              className={`usa-input ${disabledClass}`}
              disabled={disabled}
              id={id}
              name={name}
              {...rest}
            />
          ),
          url: (
            <Field
              className={`usa-input ${disabledClass}`}
              disabled={disabled}
              id={id}
              name={name}
              {...rest}
            />
          ),
          select: (
            <Field
              {...rest}
              id={id}
              name={name}
              className={`usa-select ${disabledClass}`}
              component="select"
              defaultValue=""
            >
              <option value="">-Select-</option>
              {choices.map((choice) => (
                <option value={choice} key={choice}>
                  {choice}
                </option>
              ))}
            </Field>
          ),
          radio: (
            <div>
              <Field {...rest} id={id} name={name} className="usa-radio__input" component="radio" />
              <label className="usa-radio__label" htmlFor={id}>
                {label}
              </label>
            </div>
          ),
          date: (
            <div>
              <input
                {...rest}
                id={id}
                name={name}
                className={`usa-input ${disabledClass}`}
                disabled={disabled}
              />
            </div>
          ),
        }[type]
      }

      {children}
    </div>
  );
};

WrappedField.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired, // TODO should be array of possible types'
  required: PropTypes.bool,
  label: PropTypes.string,
  id: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.arrayOf(PropTypes.element), // TODO array of els
  helptext: PropTypes.oneOfType([PropTypes.element, PropTypes.string]), // TODO can be string, HelpText, <p>, etc
  infoText: PropTypes.oneOfType([PropTypes.element, PropTypes.string]), // TODO can be string, el, etc
};

export default WrappedField;
