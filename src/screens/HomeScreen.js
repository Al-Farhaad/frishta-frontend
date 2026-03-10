import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView
} from "react-native";
import { getMediaUrl } from "../api/client";
import MaroonBackground from "../components/MaroonBackground";

function SongCard({ song, onPress }) {
  return (
    <TouchableOpacity style={styles.songCard} onPress={() => onPress(song)} activeOpacity={0.85}>
      {song.thumbnailPath ? (
        <Image source={{ uri: getMediaUrl(song.thumbnailPath) }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbFallback]} />
      )}
      <View style={styles.songMeta}>
        <Text style={styles.songTitle} numberOfLines={2}>
          {song.title}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {song.artist}
        </Text>
        <Text style={styles.songCategory} numberOfLines={1}>
          {song.category || "Uncategorized"}
        </Text>
      </View>
      <Text style={styles.playLabel}>Play</Text>
    </TouchableOpacity>
  );
}

function SongSection({ title, subtitle, songs, onSongPress, emptyMessage }) {
  return (
    <View style={styles.sectionWrap}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}

      {songs.length === 0 ? (
        <Text style={styles.infoText}>{emptyMessage}</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContent}>
          {songs.map((song) => (
            <SongCard key={song.id} song={song} onPress={onSongPress} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function SongListItem({ song, onPress }) {
  return (
    <TouchableOpacity style={styles.listItem} onPress={() => onPress(song)} activeOpacity={0.85}>
      {song.thumbnailPath ? (
        <Image source={{ uri: getMediaUrl(song.thumbnailPath) }} style={styles.listThumb} />
      ) : (
        <View style={[styles.listThumb, styles.thumbFallback]} />
      )}
      <View style={styles.listMeta}>
        <Text style={styles.listTitle} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.listSubtitle} numberOfLines={1}>
          {song.artist} | {song.category || "Uncategorized"}
        </Text>
      </View>
      <Text style={styles.playLabel}>Play</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({
  user,
  songs,
  songsLoading,
  songsError,
  onSongPress,
  onRefreshSongs,
  onLogout,
  miniPlayer
}) {
  const selectedCategories = new Set(Array.isArray(user?.categories) ? user.categories : []);
  const recommendedSongs = songs.filter((song) => selectedCategories.has(song.category));
  const trendingSongsSource = songs.filter((song) => !selectedCategories.has(song.category));
  const trendingSongs = (trendingSongsSource.length > 0 ? trendingSongsSource : songs).slice(0, 5);

  return (
    <MaroonBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <Image source={require("../../assets/logo.jpeg")} style={styles.logo} />
          <View style={styles.topRow}>
            <View style={styles.topUserWrap}>
              <Text style={styles.welcome}>Welcome</Text>
              <Text style={styles.name} numberOfLines={1}>
                {user?.fullName || "Frishta User"}
              </Text>
            </View>
            <View style={styles.topActionRow}>
              <TouchableOpacity onPress={onRefreshSongs} style={styles.secondaryActionButton}>
                <Text style={styles.secondaryActionText}>Refresh</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={onLogout}>
                <Text style={styles.actionText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>

          {songsLoading ? <Text style={styles.infoText}>Loading songs...</Text> : null}
          {songsError ? <Text style={styles.errorText}>{songsError}</Text> : null}

          <SongSection
            title="Recommendations"
            subtitle="Based on your selected categories"
            songs={recommendedSongs}
            onSongPress={onSongPress}
            emptyMessage="No recommendations yet for your selected categories."
          />

          <SongSection
            title="Trending Songs"
            subtitle="Popular tracks to explore"
            songs={trendingSongs}
            onSongPress={onSongPress}
            emptyMessage="No trending songs available right now."
          />

          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>All Songs</Text>
            <Text style={styles.sectionSubtitle}>Browse the full library</Text>
            {songs.length === 0 ? (
              <Text style={styles.infoText}>No songs found in backend public/songs folder.</Text>
            ) : (
              <View style={styles.listWrap}>
                {songs.map((song) => (
                  <SongListItem key={`all-${song.id}`} song={song} onPress={onSongPress} />
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {miniPlayer}
      </SafeAreaView>
    </MaroonBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 120
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 14
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  topUserWrap: {
    flex: 1,
    marginRight: 10
  },
  topActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  welcome: { color: "#F1CDD5", fontSize: 14 },
  name: { color: "#FFF", fontSize: 28, fontWeight: "800", marginTop: 2 },
  actionButton: {
    backgroundColor: "rgba(122, 31, 52, 0.9)",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A13A54"
  },
  actionText: { color: "#FFF", fontWeight: "700" },
  secondaryActionButton: {
    backgroundColor: "rgba(82, 22, 38, 0.82)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#8B3149"
  },
  secondaryActionText: { color: "#F1CDD5", fontWeight: "700", fontSize: 12 },
  sectionWrap: { marginTop: 16 },
  sectionTitle: { color: "#FFF", fontSize: 22, fontWeight: "800" },
  sectionSubtitle: { color: "#E6BCC8", marginTop: 2, marginBottom: 10 },
  carouselContent: { paddingRight: 6 },
  songCard: {
    width: 190,
    backgroundColor: "rgba(123, 34, 54, 0.55)",
    borderWidth: 1,
    borderColor: "#A13A54",
    borderRadius: 14,
    padding: 10,
    marginRight: 10
  },
  thumb: { width: "100%", height: 120, borderRadius: 10, backgroundColor: "#5A1A2A" },
  thumbFallback: { borderWidth: 1, borderColor: "#B05B72" },
  songMeta: { marginTop: 10 },
  songTitle: { color: "#FFF", fontSize: 15, fontWeight: "700", minHeight: 38 },
  songArtist: { color: "#E4C1CB", marginTop: 2, fontSize: 12 },
  songCategory: { color: "#F6C3D2", marginTop: 1, fontSize: 11, fontWeight: "700" },
  playLabel: { color: "#FFD9E3", fontWeight: "700", fontSize: 13, marginTop: 8 },
  listWrap: { gap: 10 },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(123, 34, 54, 0.55)",
    borderWidth: 1,
    borderColor: "#A13A54",
    borderRadius: 14,
    padding: 10
  },
  listThumb: {
    width: 58,
    height: 58,
    borderRadius: 10,
    backgroundColor: "#5A1A2A"
  },
  listMeta: { flex: 1, marginHorizontal: 10 },
  listTitle: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  listSubtitle: { color: "#E4C1CB", marginTop: 3, fontSize: 12 },
  infoText: { color: "#F0CFD7", marginTop: 8 },
  errorText: { color: "#FFB1C2", marginTop: 8 }
});
