import React from 'react';
import {Keyboard, Dimensions} from 'react-native';
import {Layout, Text, Button} from '@ui-kitten/components';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import FormStyles from '../../util/FormStyles';
import {onValidationError, InputField} from '../../util/TextInputUI';
import * as yup from 'yup';
import {Screens} from '../../util/Constants';
import {StyleSheet} from 'react-native';

export default function InviteToGroup({route, navigation}) {
  console.log('Arrived at InviteToGroup');

  const {GroupName} = route.params;

  const [Email, SetEmail] = React.useState('');
  const [EmailError, SetEmailError] = React.useState('');
  const EmailRef = React.useRef();

  const ValidationSchema = yup.object().shape({
    email: yup
      .string()
      .label('Email')
      .email()
      .required(),
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Layout style={Styles.container}>
        <Layout style={FormStyles.loginButtons}>
          <Button>Invite to group</Button>
          <Button
            style={FormStyles.button}
            onPress={() => navigation.navigate(Screens.Home)}
            appearance="outline">
            Go back
          </Button>
        </Layout>
        <Layout style={FormStyles.loginFields}>
          <InputField
            fieldError={EmailError}
            refToPass={EmailRef}
            validationSchema={ValidationSchema}
            fieldKey="email"
            fieldParams={text => ({email: text})}
            setField={SetEmail}
            setFieldError={SetEmailError}
            placeholder="username@email.com"
            onSubmitEditing={() => {
              Keyboard.dismiss();
            }}
            value={Email}
            autoFocus
          />
          <Text style={Styles.text}>
            You can invite others to {GroupName} using their email.
          </Text>
        </Layout>
      </Layout>
    </TouchableWithoutFeedback>
  );
}

const Styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    flexDirection: 'column-reverse',
  },
  text: {
    textAlign: 'center',
  },
});
