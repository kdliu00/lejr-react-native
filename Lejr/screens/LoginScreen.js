import React, { Component } from "react";
import { View, Text, StyleSheet, Button } from "react-native";

class LoginScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>LoginScreen</Text>
        <Button
          title="Sign in with Google"
          onPress={() => alert("button")}
        ></Button>
      </View>
    );
  }
}
export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
