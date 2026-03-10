import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getMediaUrl } from "../api/client";

function formatTime(ms) {
  if (!ms || Number.isNaN(ms)) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function MiniPlayer({
  song,
  isPlaying,
  progress,
  positionMillis,
  durationMillis,
  onOpenPlayer,
  onTogglePlayback,
  onPrevious,
  onNext
}) {
  if (!song) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.primaryRow} onPress={onOpenPlayer} activeOpacity={0.9}>
        {song.thumbnailPath ? (
          <Image source={{ uri: getMediaUrl(song.thumbnailPath) }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbFallback]} />
        )}

        <View style={styles.meta}>
          <Text style={styles.title} numberOfLines={1}>
            {song.title}
          </Text>
          <Text style={styles.time}>
            {formatTime(positionMillis)} / {formatTime(durationMillis)}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, progress * 100))}%` }]} />
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.controlRow}>
        <TouchableOpacity style={styles.iconButton} onPress={onPrevious} activeOpacity={0.8}>
          <Ionicons name="play-skip-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButtonMain} onPress={onTogglePlayback} activeOpacity={0.8}>
          <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={onNext} activeOpacity={0.8}>
          <Ionicons name="play-skip-forward" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 10,
    backgroundColor: "#3B1020",
    borderColor: "#9B3A54",
    borderWidth: 1,
    borderRadius: 14,
    padding: 10
  },
  primaryRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  thumb: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#5A1A2A"
  },
  thumbFallback: {
    borderWidth: 1,
    borderColor: "#B2677B"
  },
  meta: {
    flex: 1,
    marginHorizontal: 10
  },
  title: {
    color: "#FFF",
    fontWeight: "700"
  },
  time: {
    color: "#E6C5CF",
    fontSize: 12,
    marginTop: 2,
    marginBottom: 4
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#6D2539",
    overflow: "hidden"
  },
  progressFill: {
    height: 4,
    backgroundColor: "#FFD0DB"
  },
  controlRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 14
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7D2A3E",
    borderWidth: 1,
    borderColor: "#A13A54"
  },
  iconButtonMain: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B13D58",
    borderWidth: 1,
    borderColor: "#D76883"
  }
});
