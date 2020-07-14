import React from 'react';
import {TouchableWithoutFeedback, Keyboard} from 'react-native';
import * as yup from 'yup';
import {Layout, Button} from '@ui-kitten/components';
import {onValidationError, InputField} from '../util/TextInputUI';
import {LocalData} from '../util/LocalData';
import {User} from '../util/DataObjects';
import FormStyles from '../util/FormStyles';
import {Screens} from '../util/Constants';

export default function EmailLogin({navigation}) {
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
      <Layout style={FormStyles.container}>
        <Layout style={FormStyles.loginButtons}>
          <Button
            style={FormStyles.button}
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
                    LocalData.userObject = new User(
                      '',
                      '',
                      '',
                      FirstName.trim() + ' ' + LastName.trim(),
                      new Map(),
                    );
                    navigation.navigate(Screens.EmailLogin, {
                      showConfirm: true,
                    });
                  }
                });
            }}>
            Next
          </Button>
          <Button
            style={FormStyles.button}
            onPress={() => navigation.navigate(Screens.Login)}
            appearance="outline">
            Go back
          </Button>
        </Layout>
        <Layout style={FormStyles.loginFields}>
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
        </Layout>
      </Layout>
    </TouchableWithoutFeedback>
  );
}
