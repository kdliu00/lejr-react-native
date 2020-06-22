import React from "react";
import { StyleSheet, Text, View } from "react-native";
import firebase from "firebase";
import { firebaseConfig } from "./config";

if (firebase.apps.length == 0) {
  firebase.initializeApp(firebaseConfig);
}

export default function App() {
  let x = 1;
  console.log("App started!");
  return (
    <View style={styles.container}>
      <Text>Hello World!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
