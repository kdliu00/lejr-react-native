import {StyleSheet} from 'react-native';

const FormStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column-reverse',
  },
  loginFields: {
    flex: 5,
    alignItems: 'center',
    flexDirection: 'column-reverse',
  },
  loginButtons: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: 15,
    marginBottom: 40,
  },
  dynamicButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    margin: 10,
  },
});
export default FormStyles;
