import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView
} from "react-native";
import { api } from "../api/client";
import RoleToggle from "../components/RoleToggle";
import MaroonBackground from "../components/MaroonBackground";

const MUSIC_CATEGORIES = [
  "HINDI FILM MUSIC",
  "DEVOTIONAL MUSIC",
  "SPIRITUAL MUSIC",
  "INDIAN FOLK MUSIC",
  "SUFI POETRY",
  "GHAZAL",
  "HINDUSTANI CLASSICAL VOCAL",
  "HINDUSTANI CLASSICAL INSTRUMENTAL",
  "CARNATIC CLASSICAL VOCAL",
  "CARNATIC CLASSICAL INSTRUMENTAL",
  "HINDI POP",
  "ENGLISH POP",
  "GLOBAL-WORLD MUSIC",
  "ROCK N ROLL",
  "JAZZ"
];

const GENDERS = ["male", "female", "other"];

export default function RegisterScreen({ onOtpSent, onGoLogin }) {
  const [role, setRole] = useState("artist");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [country, setCountry] = useState("");
  const [stateName, setStateName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [categories, setCategories] = useState([]);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function toggleCategory(category) {
    const selected = categories.includes(category);
    if (selected) {
      setCategories(categories.filter((item) => item !== category));
      return;
    }

    if (categories.length >= 3) {
      Alert.alert("Limit reached", "You can select only 3 categories.");
      return;
    }

    setCategories([...categories, category]);
  }

  async function submit() {
    if (submitting) return;

    if (categories.length !== 3) {
      Alert.alert("Select categories", "Please select exactly 3 categories.");
      return;
    }

    try {
      setSubmitting(true);
      const result = await api("/auth/register/start", {
        method: "POST",
        body: {
          fullName,
          email,
          phoneNo,
          country,
          state: stateName,
          gender,
          age: Number(age),
          categories,
          password,
          role
        }
      });
      onOtpSent({ email, password });

      if (result?.emailSent === false) {
        Alert.alert(
          "OTP delayed",
          "Your account was created but OTP email could not be delivered right now. Check spam or tap Register again to regenerate OTP."
        );
      }
    } catch (e) {
      const message = e?.message || "Request failed";
      if (message.toLowerCase().includes("timed out")) {
        Alert.alert(
          "Request timed out",
          "Your details may still be saved. Proceeding to OTP screen. If OTP is not received, tap Register again."
        );
        onOtpSent({ email, password });
        return;
      }
      Alert.alert("Error", message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <MaroonBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Frishta</Text>
          <Text style={styles.subtitle}>Create your account</Text>
          <RoleToggle value={role} onChange={setRole} />

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#CAA5AF"
            value={fullName}
            onChangeText={setFullName}
          />
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
            placeholder="Phone No."
            placeholderTextColor="#CAA5AF"
            value={phoneNo}
            onChangeText={setPhoneNo}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Country"
            placeholderTextColor="#CAA5AF"
            value={country}
            onChangeText={setCountry}
          />
          <TextInput
            style={styles.input}
            placeholder="State"
            placeholderTextColor="#CAA5AF"
            value={stateName}
            onChangeText={setStateName}
          />

          <Text style={styles.sectionLabel}>Gender</Text>
          <View style={styles.genderRow}>
            {GENDERS.map((item) => {
              const selected = gender === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.genderChip, selected && styles.genderChipSelected]}
                  onPress={() => setGender(item)}
                >
                  <Text style={[styles.genderText, selected && styles.genderTextSelected]}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Age"
            placeholderTextColor="#CAA5AF"
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
          />

          <Text style={styles.sectionLabel}>Select 3 Categories</Text>
          <Text style={styles.sectionHint}>Selected: {categories.length}/3</Text>
          <View style={styles.categoryWrap}>
            {MUSIC_CATEGORIES.map((category) => {
              const selected = categories.includes(category);
              return (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryChip, selected && styles.categoryChipSelected]}
                  onPress={() => toggleCategory(category)}
                >
                  <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>{category}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#CAA5AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={submit}
            disabled={submitting}
          >
            <Text style={styles.buttonText}>{submitting ? "Please wait..." : "Register and Send OTP"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onGoLogin}>
            <Text style={styles.link}>Already have account? Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </MaroonBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  scrollContent: { paddingVertical: 20 },
  title: { color: "#FFF", fontSize: 34, fontWeight: "800", marginBottom: 4 },
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
  sectionLabel: { color: "#F2D8DE", fontSize: 14, fontWeight: "700", marginBottom: 8, marginTop: 4 },
  sectionHint: { color: "#D8B3BD", fontSize: 12, marginBottom: 8 },
  genderRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  genderChip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#7A2B3E",
    backgroundColor: "#3A1220"
  },
  genderChipSelected: {
    backgroundColor: "#B13D58",
    borderColor: "#B13D58"
  },
  genderText: { color: "#E8C5CD", fontWeight: "600" },
  genderTextSelected: { color: "#FFF" },
  categoryWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  categoryChip: {
    borderWidth: 1,
    borderColor: "#7A2B3E",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#3A1220"
  },
  categoryChipSelected: {
    borderColor: "#B13D58",
    backgroundColor: "#B13D58"
  },
  categoryText: { color: "#E8C5CD", fontSize: 11, fontWeight: "600" },
  categoryTextSelected: { color: "#FFF" },
  button: {
    backgroundColor: "#B13D58",
    padding: 14,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 12,
    alignItems: "center"
  },
  buttonDisabled: {
    opacity: 0.7
  },
  buttonText: { color: "#FFF", fontWeight: "700" },
  link: { color: "#F0C6D1", textAlign: "center" }
});
