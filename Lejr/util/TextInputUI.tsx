import React from 'react';
import {StyleSheet} from 'react-native';
import {Layout, Input, Text, Spinner} from '@ui-kitten/components';

export {ButtonSpinner, onValidationError, InputField, InputFieldWrapper};

const ButtonSpinner = props => (
  <Layout style={[props.style, Styles.indicator]}>
    <Spinner size="small" />
  </Layout>
);

function onValidationError(error, fieldRefs) {
  console.warn(error.message);
  fieldRefs.forEach(ref => ref[0].current.props.onChangeText(ref[1]));
}

const InputFieldWrapper = ({fieldError, children}) => (
  <Layout style={Styles.textInputWrapper}>
    <Text style={Styles.errorText}>{fieldError}</Text>
    {children}
  </Layout>
);

const InputField = ({
  refToPass,
  isSubmitting,
  fieldError,
  validationSchema,
  fieldKey,
  fieldParams,
  setField,
  setFieldError,
  value,
  ...rest
}) => {
  function validateField(text: string) {
    setField(text);
    validationSchema
      .validateAt(fieldKey, fieldParams(text))
      .catch(error => {
        setFieldError(error.message);
      })
      .then((valid: boolean) => {
        if (valid) {
          setFieldError('');
        }
      });
  }

  return (
    <InputFieldWrapper fieldError={fieldError}>
      <Input
        ref={refToPass}
        style={Styles.textInput}
        clearButtonMode="always"
        autoCorrect={false}
        autoCapitalize="none"
        enablesReturnKeyAutomatically={true}
        status={fieldError ? 'danger' : value ? 'success' : 'basic'}
        onChangeText={text => validateField(text)}
        {...rest}
      />
    </InputFieldWrapper>
  );
};

const Styles = StyleSheet.create({
  textInput: {
    width: '100%',
    height: 40,
    marginTop: 3,
  },
  textInputWrapper: {
    width: '65%',
    marginTop: 15,
  },
  errorText: {
    color: 'red',
  },
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
