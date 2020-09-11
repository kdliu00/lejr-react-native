import {StyleSheet, Dimensions} from 'react-native';

const FormStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column-reverse',
  },
  fieldStyle: {
    flex: 5,
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
  dynamicButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    margin: 10,
    width: 100,
  },
});
export default FormStyles;
