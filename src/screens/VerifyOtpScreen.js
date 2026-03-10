import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView
} from "react-native";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import MaroonBackground from "../components/MaroonBackground";

export default function VerifyOtpScreen({ email, password, onVerified }) {
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const { login } = useAuth();

  async function verify() {
    if (verifying) return;

    try {
      setVerifying(true);
      await api("/auth/register/verify", {
        method: "POST",
        body: { email, otp }
      });

      if (password) {
        await login(email, password);
        Alert.alert("Success", "Email verified. Welcome to Frishta.");
      } else {
        Alert.alert("Success", "Email verified. Please login.");
        onVerified();
      }
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setVerifying(false);
    }
  }

  async function resendOtp() {
    if (resending) return;

    try {
      setResending(true);
      await api("/auth/register/resend", {
        method: "POST",
        body: { email }
      });
      Alert.alert("OTP sent", "A new OTP was generated. Please check your email.");
    } catch (e) {
      const message = e?.message || "Failed to resend OTP";
      if (message.toLowerCase().includes("timed out")) {
        Alert.alert("Please check email", "Resend request may have been accepted. Check inbox/spam in a moment.");
        return;
      }
      Alert.alert("Error", message);
    } finally {
      setResending(false);
    }
  }

  return (
    <MaroonBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>Sent to {email}</Text>
          <TextInput
            style={styles.input}
            placeholder="6-digit OTP"
            placeholderTextColor="#CAA5AF"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />
          <TouchableOpacity style={[styles.button, verifying && styles.buttonDisabled]} onPress={verify} disabled={verifying}>
            <Text style={styles.buttonText}>{verifying ? "Verifying..." : "Verify Email"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, resending && styles.buttonDisabled]}
            onPress={resendOtp}
            disabled={resending}
          >
            <Text style={styles.secondaryButtonText}>{resending ? "Sending..." : "Resend OTP"}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </MaroonBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  inner: { width: "100%" },
  title: { color: "#FFF", fontSize: 30, fontWeight: "800", marginBottom: 4 },
  subtitle: { color: "#E8D2D8", marginBottom: 20 },
  input: {
    backgroundColor: "#3A1220",
    color: "#FFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#6F2439"
  },
  button: {
    backgroundColor: "#B13D58",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#B13D58",
    padding: 14,
    borderRadius: 12,
    alignItems: "center"
  },
  buttonDisabled: {
    opacity: 0.7
  },
  buttonText: { color: "#FFF", fontWeight: "700" },
  secondaryButtonText: { color: "#F0C6D1", fontWeight: "700" }
});
