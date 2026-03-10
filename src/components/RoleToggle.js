import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

export default function RoleToggle({ value, onChange }) {
  return (
    <View style={styles.wrap}>
      {["artist", "listener"].map((role) => (
        <TouchableOpacity
          key={role}
          style={[styles.btn, value === role && styles.active]}
          onPress={() => onChange(role)}
        >
          <Text style={[styles.text, value === role && styles.textActive]}>
            {role === "artist" ? "As Artist" : "As Listener"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: "#4B1524",
    borderRadius: 14,
    padding: 4,
    marginBottom: 16
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center"
  },
  active: { backgroundColor: "#A2354E" },
  text: { color: "#E5C8D0", fontWeight: "600" },
  textActive: { color: "#FFF" }
});
