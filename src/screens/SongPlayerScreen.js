import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, Platform, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaroonBackground from "../components/MaroonBackground";
import { getMediaUrl } from "../api/client";

function formatTime(ms) {
  if (!ms || Number.isNaN(ms)) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function SongPlayerScreen({
  song,
  isPlaying,
  progress,
  positionMillis,
  durationMillis,
  onBack,
  onTogglePlayback,
  onPrevious,
  onNext,
  onSeek,
  onRewind10,
  onForward10
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const topSafePadding = Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 8 : 8;

  const safeProgress = Math.max(0, Math.min(1, Number(progress) || 0));

  function seekFromTouch(event) {
    if (!trackWidth || !onSeek) return;
    const x = event?.nativeEvent?.locationX || 0;
    const nextRatio = x / trackWidth;
    onSeek(nextRatio);
  }

  return (
    <MaroonBackground>
      <SafeAreaView style={[styles.safeArea, { paddingTop: topSafePadding }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.8}>
            <Text style={styles.back}>{"< Back"}</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Now Playing</Text>
            <Text style={styles.headerSubtitle}>Frishta Player</Text>
          </View>
          <View style={styles.backSpacer} />
        </View>

        <View style={styles.content}>
          {song?.thumbnailPath ? (
            <Image source={{ uri: getMediaUrl(song.thumbnailPath) }} style={styles.cover} />
          ) : (
            <View style={[styles.cover, styles.coverFallback]} />
          )}
          <Text style={styles.title} numberOfLines={1}>
            {song?.title || "Unknown Song"}
          </Text>
          <Text style={styles.artist}>{song?.artist || "Frishta Artist"}</Text>
          <Text style={styles.category}>{song?.category || "Uncategorized"}</Text>

          <View
            style={styles.progressTouchArea}
            onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
          >
            <TouchableOpacity
              style={styles.progressTrack}
              onPress={seekFromTouch}
              activeOpacity={0.9}
            >
              <View style={[styles.progressFill, { width: `${safeProgress * 100}%` }]} />
              <View style={[styles.progressThumb, { left: `${safeProgress * 100}%` }]} />
            </TouchableOpacity>
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.time}>{formatTime(positionMillis)}</Text>
            <Text style={styles.time}>{formatTime(durationMillis)}</Text>
          </View>

          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.iconButtonGhost} onPress={onRewind10} activeOpacity={0.8}>
              <Ionicons name="play-back" size={22} color="#F6D6DE" />
              <Text style={styles.ghostText}>10s</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={onPrevious} activeOpacity={0.8}>
              <Ionicons name="play-skip-back" size={26} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButtonMain} onPress={onTogglePlayback} activeOpacity={0.8}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={30} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={onNext} activeOpacity={0.8}>
              <Ionicons name="play-skip-forward" size={26} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButtonGhost} onPress={onForward10} activeOpacity={0.8}>
              <Ionicons name="play-forward" size={22} color="#F6D6DE" />
              <Text style={styles.ghostText}>10s</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </MaroonBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  backButton: {
    minWidth: 74,
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(122, 31, 52, 0.92)",
    borderWidth: 1,
    borderColor: "#A13A54"
  },
  back: { color: "#F8D7DF", fontWeight: "700", fontSize: 14 },
  backSpacer: { width: 74, height: 36 },
  headerCenter: { alignItems: "center" },
  headerTitle: { color: "#FFF", fontWeight: "800", fontSize: 17 },
  headerSubtitle: { color: "#EBC8D1", fontSize: 11, marginTop: 1 },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cover: {
    width: 280,
    height: 280,
    borderRadius: 22,
    backgroundColor: "#5A1A2A",
    borderWidth: 1,
    borderColor: "#A13A54"
  },
  coverFallback: {
    borderWidth: 1,
    borderColor: "#B2677B"
  },
  title: {
    marginTop: 22,
    color: "#FFF",
    fontSize: 24,
    fontWeight: "800"
  },
  artist: {
    color: "#F0CCD5",
    marginTop: 6,
    marginBottom: 4
  },
  category: {
    color: "#FFD9E3",
    marginBottom: 18,
    fontSize: 12,
    fontWeight: "700"
  },
  progressTouchArea: {
    width: "100%",
    paddingVertical: 8
  },
  progressTrack: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6D2539",
    overflow: "visible"
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFD0DB"
  },
  progressThumb: {
    position: "absolute",
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: -8,
    backgroundColor: "#FFDDE6",
    borderWidth: 1,
    borderColor: "#B13D58"
  },
  timeRow: {
    width: "100%",
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  time: {
    color: "#E6C5CF",
    fontSize: 12
  },
  controlRow: {
    marginTop: 28,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12
  },
  iconButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7D2A3E",
    borderWidth: 1,
    borderColor: "#A13A54"
  },
  iconButtonGhost: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(88, 26, 42, 0.85)",
    borderWidth: 1,
    borderColor: "#8D334A"
  },
  ghostText: {
    color: "#F6D6DE",
    fontSize: 10,
    marginTop: -2,
    fontWeight: "700"
  },
  iconButtonMain: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B13D58",
    borderWidth: 1,
    borderColor: "#D76883"
  }
});
