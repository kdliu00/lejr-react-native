import React from 'react';
import {StyleSheet, TouchableWithoutFeedback, Keyboard} from 'react-native';
import * as yup from 'yup';
import {Layout, Button} from '@ui-kitten/components';
import {onValidationError, InputField} from '../util/TextInputUI';
import UserData from '../util/LocalData';
import {User} from '../util/DataObjects';

export default function EmailLogin({route, navigation}) {
  const [FirstName, SetFirstName] = React.useState('');
  const [LastName, SetLastName] = React.useState('');

  const ValidationSchema = yup.object().shape({
    first: yup
      .string()
      .label('First name')
      .required(),
    last: yup
      .string()
      .label('Last name')
      .required(),
  });

  const [FirstNameError, SetFirstNameError] = React.useState('');
  const [LastNameError, SetLastNameError] = React.useState('');

  const FirstNameRef = React.createRef();
  const LastNameRef = React.createRef();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Layout style={Styles.container}>
        <Layout style={Styles.bottomContainer}>
          <Button
            onPress={() => navigation.navigate('Login')}
            appearance="outline">
            Go Back
          </Button>
          <Button
            onPress={() => {
              console.log('Signing up with email!');
              ValidationSchema.validate({
                first: FirstName,
                last: LastName,
              })
                .catch(error =>
                  onValidationError(error, [
                    [FirstNameRef, FirstName],
                    [LastNameRef, LastName],
                  ]),
                )
                .then(valid => {
                  if (valid) {
                    UserData.userObject = new User(
                      '',
                      '',
                      '',
                      {first: FirstName.trim(), last: LastName.trim()},
                      null,
                    );
                    navigation.navigate('EmailLogin', {showConfirm: true});
                  }
                });
            }}>
            Next
          </Button>
        </Layout>
        <Layout style={Styles.loginFields}>
          <InputField
            fieldError={FirstNameError}
            refToPass={FirstNameRef}
            validationSchema={ValidationSchema}
            fieldKey="first"
            fieldParams={text => ({first: text})}
            setField={SetFirstName}
            setFieldError={SetFirstNameError}
            placeholder="First name"
            onSubmitEditing={() => {
              LastNameRef.current.focus();
            }}
            value={FirstName}
            autoFocus
          />
          <InputField
            fieldError={LastNameError}
            refToPass={LastNameRef}
            validationSchema={ValidationSchema}
            fieldKey="last"
            fieldParams={text => ({last: text})}
            setField={SetLastName}
            setFieldError={SetLastNameError}
            placeholder="Last name"
            onSubmitEditing={() => {
              Keyboard.dismiss();
            }}
            value={LastName}
          />
        </Layout>
      </Layout>
    </TouchableWithoutFeedback>
  );
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column-reverse',
  },
  loginFields: {
    alignItems: 'center',
    flexDirection: 'column',
  },
  bottomContainer: {
    height: '25%',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'column-reverse',
    margin: 30,
  },
});
