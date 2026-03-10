import React from "react";
import { View, StyleSheet } from "react-native";

export default function MaroonBackground({ children }) {
  return (
    <View style={styles.root}>
      <View style={styles.g1} />
      <View style={styles.g2} />
      <View style={styles.g3} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#2A0B12" },
  g1: {
    position: "absolute",
    top: -80,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#7A1F34",
    opacity: 0.55
  },
  g2: {
    position: "absolute",
    bottom: -120,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "#A2354E",
    opacity: 0.4
  },
  g3: {
    position: "absolute",
    top: "35%",
    left: "20%",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#4A1020",
    opacity: 0.5
  }
});
