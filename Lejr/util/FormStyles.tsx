import {StyleSheet} from 'react-native';

const FormStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column-reverse',
  },
  loginFields: {
    flex: 2,
    flexDirection: 'column-reverse',
    marginBottom: 20,
  },
  loginButtons: {
    flex: 1,
    marginBottom: 65,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  button: {
    margin: 10,
  },
});
export default FormStyles;
