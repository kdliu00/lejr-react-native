import React, { Component } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import firebase from "firebase";
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();

class LoadingScreen extends Component {
  checkIfLoggedIn();

  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
}
export default LoadingScreen;

function checkIfLoggedIn() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      navigation.navigate("DashboardScreen");
    }
    else {
      navigation.navigate("LoginScreen");
    }
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
