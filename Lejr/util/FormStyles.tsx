import {StyleSheet} from 'react-native';

const FormStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column-reverse',
  },
  fieldStyle: {
    flex: 2,
    alignItems: 'center',
    flexDirection: 'column-reverse',
  },
  buttonStyle: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 15,
    marginBottom: 40,
  },
  button: {
    margin: 10,
    width: 100,
  },
});
export default FormStyles;
