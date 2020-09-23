import {StyleSheet} from 'react-native';

const FormStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column-reverse',
  },
  fieldStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  buttonStyle: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 50,
  },
  button: {
    margin: 10,
    width: 100,
  },
});
export default FormStyles;
