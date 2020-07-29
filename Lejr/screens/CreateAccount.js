import React from 'react';
import {TouchableWithoutFeedback, Keyboard} from 'react-native';
import * as yup from 'yup';
import {Layout, Button} from '@ui-kitten/components';
import {onValidationError, InputField} from '../util/TextInputUI';
import {LocalData} from '../util/LocalData';
import {User} from '../util/DataObjects';
import FormStyles from '../util/FormStyles';
import {Screen} from '../util/Constants';
import {MergeState} from '../util/UtilityMethods';
import {Component} from 'react';

export default class CreateAccount extends Component {
  constructor() {
    super();
    this.state = {
      firstName: '',
      lastName: '',
      firstNameError: '',
      lastNameError: '',
    };
    this.firstNameRef = React.createRef();
    this.lastNameRef = React.createRef();
    this.validationSchema = yup.object().shape({
      first: yup
        .string()
        .label('First name')
        .required(),
      last: yup
        .string()
        .label('Last name')
        .required(),
    });
  }

  componentDidMount() {
    console.log('Arrived at CreateAccount');
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Layout style={FormStyles.container}>
          <Layout style={FormStyles.loginButtons}>
            <Button
              style={FormStyles.button}
              onPress={() => {
                console.log('Signing up with email');
                this.validationSchema
                  .validate({
                    first: this.state.firstName,
                    last: this.state.lastName,
                  })
                  .catch(error =>
                    onValidationError(error, [
                      [this.firstNameRef, this.state.firstName],
                      [this.lastNameRef, this.state.lastName],
                    ]),
                  )
                  .then(valid => {
                    if (valid) {
                      LocalData.user = new User(
                        '',
                        '',
                        '',
                        this.state.firstName.trim() +
                          ' ' +
                          this.state.lastName.trim(),
                        [],
                        [],
                      );
                      this.props.navigation.navigate(Screen.EmailLogin, {
                        showConfirm: true,
                      });
                    }
                  });
              }}>
              Next
            </Button>
            <Button
              style={FormStyles.button}
              onPress={() => this.props.navigation.navigate(Screen.Login)}
              appearance="outline">
              Go back
            </Button>
          </Layout>
          <Layout style={FormStyles.loginFields}>
            <InputField
              fieldError={this.state.lastNameError}
              refToPass={this.lastNameRef}
              validationSchema={this.validationSchema}
              fieldKey="last"
              fieldParams={text => ({last: text})}
              setField={value => MergeState(this, {lastName: value})}
              setFieldError={value => MergeState(this, {lastNameError: value})}
              placeholder="last name"
              onSubmitEditing={() => {
                Keyboard.dismiss();
              }}
              value={this.state.lastName}
            />
            <InputField
              fieldError={this.state.firstNameError}
              refToPass={this.firstNameRef}
              validationSchema={this.validationSchema}
              fieldKey="first"
              fieldParams={text => ({first: text})}
              setField={value => MergeState(this, {firstName: value})}
              setFieldError={value => MergeState(this, {firstNameError: value})}
              placeholder="first name"
              onSubmitEditing={() => {
                this.lastNameRef.current.focus();
              }}
              value={this.state.firstName}
              autoFocus
            />
          </Layout>
        </Layout>
      </TouchableWithoutFeedback>
    );
  }
}
