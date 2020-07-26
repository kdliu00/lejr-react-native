import React from 'react';
import {Keyboard, TouchableWithoutFeedback, SafeAreaView} from 'react-native';
import {Layout, Text, Button} from '@ui-kitten/components';
import FormStyles from '../../util/FormStyles';
import {
  onValidationError,
  InputField,
  ButtonSpinner,
} from '../../util/TextInputUI';
import * as yup from 'yup';
import {Screen, ErrorCode} from '../../util/Constants';
import {StyleSheet} from 'react-native';
import {pushInvite, LocalData} from '../../util/LocalData';

export default function InviteToGroup({route, navigation}) {
  console.log('Arrived at InviteToGroup');

  const {GroupName} = route.params;

  const [IsInviting, SetIsInviting] = React.useState(false);
  const [Message, SetMessage] = React.useState('');
  const [TextStatus, SetTextStatus] = React.useState('success');

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

  const MessageText = () => (
    <Text style={Styles.text} status={TextStatus}>
      {Message}
    </Text>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Layout style={Styles.container}>
        <SafeAreaView style={Styles.container}>
          <Layout style={FormStyles.loginButtons}>
            <Layout style={FormStyles.dynamicButton}>
              {IsInviting ? (
                <Button
                  style={FormStyles.button}
                  accessoryLeft={ButtonSpinner}
                  appearance="ghost"
                />
              ) : (
                <Button
                  style={FormStyles.button}
                  onPress={() => {
                    ValidationSchema.validate({email: Email})
                      .catch(error =>
                        onValidationError(error, [[EmailRef, Email]]),
                      )
                      .then(valid => {
                        if (valid) {
                          SetIsInviting(true);
                          pushInvite(LocalData.user.name, Email)
                            .then(
                              () => {
                                SetTextStatus('success');
                                SetMessage('Invite sent!');
                                EmailRef.current.clear();
                              },
                              error => {
                                console.warn(error.message);
                                switch (error.message) {
                                  case ErrorCode.UserDuplicate:
                                    SetTextStatus('warning');
                                    SetMessage('User already in group!');
                                    break;

                                  case ErrorCode.UserNotFound:
                                    SetTextStatus('warning');
                                    SetMessage('User not found!');
                                    break;

                                  default:
                                    SetTextStatus('danger');
                                    SetMessage('Invite failed!');
                                    break;
                                }
                              },
                            )
                            .finally(() => SetIsInviting(false));
                        }
                      });
                  }}>
                  Invite to group
                </Button>
              )}
            </Layout>
            <Button
              style={FormStyles.button}
              onPress={() => navigation.navigate(Screen.Home)}
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
            <MessageText />
            <Text style={Styles.text}>
              You can invite others to {GroupName} using their email.
            </Text>
          </Layout>
        </SafeAreaView>
      </Layout>
    </TouchableWithoutFeedback>
  );
}

const Styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'column-reverse',
  },
  text: {
    textAlign: 'center',
    marginTop: 5,
    marginLeft: 20,
    marginRight: 20,
  },
});
