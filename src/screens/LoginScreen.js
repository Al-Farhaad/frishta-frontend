import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  SafeAreaView,
} from "react-native";
import MaroonBackground from "../components/MaroonBackground";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ onGoRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit() {
    try {
      await login(email, password);
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  }

  return (
    <MaroonBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          <Image
            source={require("../../assets/logo.jpeg")} 
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Welcome to Frishta</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#CAA5AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#CAA5AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={submit}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onGoRegister}>
            <Text style={styles.link}>New user? Register</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </MaroonBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  inner: { width: "100%" },
  title: { color: "#FFF", fontSize: 30, fontWeight: "800", marginBottom: 20 },
  input: {
    backgroundColor: "#3A1220",
    color: "#FFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#6F2439",
  },
  button: {
    backgroundColor: "#B13D58",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: { color: "#FFF", fontWeight: "700" },
  link: { color: "#F0C6D1", textAlign: "center" },
  logo: { width: "100%", height: 150, marginBottom: 20 },
});
