import React, { useCallback, useEffect, useRef, useState } from "react";
import { Audio } from "expo-av";
import { BackHandler } from "react-native";
import * as Linking from "expo-linking";
import { AuthProvider, useAuth } from "./context/AuthContext";
import RegisterScreen from "./screens/RegisterScreen";
import VerifyOtpScreen from "./screens/VerifyOtpScreen";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import SongPlayerScreen from "./screens/SongPlayerScreen";
import MiniPlayer from "./components/MiniPlayer";
import { api, getMediaUrl } from "./api/client";

function extractSongIdFromUrl(url) {
  if (!url) return "";

  let parsed;
  try {
    parsed = Linking.parse(url);
  } catch {
    return "";
  }

  const querySongId = parsed?.queryParams?.songId || parsed?.queryParams?.id;
  if (typeof querySongId === "string" && querySongId.trim()) {
    return decodeURIComponent(querySongId.trim());
  }

  const segments = [];
  if (parsed?.hostname) segments.push(String(parsed.hostname));
  if (parsed?.path) segments.push(String(parsed.path));
  const normalized = segments.join("/").replace(/^\/+|\/+$/g, "");
  if (!normalized) return "";

  const parts = normalized.split("/").filter(Boolean);
  if ((parts[0] === "song" || parts[0] === "songs") && parts[1]) {
    return decodeURIComponent(parts[1]);
  }

  return "";
}

function Router() {
  const { user, token, logout } = useAuth();
  const [screen, setScreen] = useState("login");
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingPassword, setPendingPassword] = useState("");
  const [pendingDeepLinkSongId, setPendingDeepLinkSongId] = useState("");
  const [songs, setSongs] = useState([]);
  const [songsLoading, setSongsLoading] = useState(false);
  const [songsError, setSongsError] = useState("");
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [activeView, setActiveView] = useState("dashboard");
  const soundRef = useRef(null);

  const handlePlaybackStatus = useCallback((status) => {
    if (!status.isLoaded) return;
    setIsPlaying(status.isPlaying);
    setPositionMillis(status.positionMillis || 0);
    setDurationMillis(status.durationMillis || 0);
    if (status.didJustFinish) {
      setIsPlaying(false);
    }
  }, []);

  const unloadCurrentTrack = useCallback(async () => {
    if (!soundRef.current) return;
    const sound = soundRef.current;
    soundRef.current = null;
    await sound.unloadAsync();
    setIsPlaying(false);
    setPositionMillis(0);
    setDurationMillis(0);
  }, []);

  const fetchSongs = useCallback(async () => {
    if (!token) return;
    try {
      setSongsLoading(true);
      setSongsError("");
      const data = await api("/songs", { token });
      setSongs(Array.isArray(data.songs) ? data.songs : []);
    } catch (error) {
      setSongsError(error.message || "Failed to load songs");
    } finally {
      setSongsLoading(false);
    }
  }, [token]);

  const playSong = useCallback(
    async (song, options = {}) => {
      const openPlayer = options.openPlayer !== false;
      try {
        await unloadCurrentTrack();
        const source = { uri: getMediaUrl(song.audioPath) };
        const { sound, status } = await Audio.Sound.createAsync(source, { shouldPlay: true }, handlePlaybackStatus);
        soundRef.current = sound;
        setCurrentSong(song);
        if (openPlayer) {
          setActiveView("player");
        }
        setIsPlaying(status.isPlaying || false);
        setPositionMillis(status.positionMillis || 0);
        setDurationMillis(status.durationMillis || 0);
      } catch (error) {
        setSongsError(error.message || "Unable to play song");
      }
    },
    [handlePlaybackStatus, unloadCurrentTrack]
  );

  const togglePlayback = useCallback(async () => {
    const sound = soundRef.current;
    if (!sound) return;

    const status = await sound.getStatusAsync();
    if (!status.isLoaded) return;

    if (status.isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  }, []);

  const seekToRatio = useCallback(async (ratio) => {
    const sound = soundRef.current;
    if (!sound || !durationMillis) return;

    const status = await sound.getStatusAsync();
    if (!status.isLoaded) return;

    const clampedRatio = Math.max(0, Math.min(1, Number(ratio) || 0));
    const nextPosition = Math.floor(durationMillis * clampedRatio);
    await sound.setPositionAsync(nextPosition);
    setPositionMillis(nextPosition);
  }, [durationMillis]);

  const skipBySeconds = useCallback(async (seconds) => {
    const sound = soundRef.current;
    if (!sound) return;

    const status = await sound.getStatusAsync();
    if (!status.isLoaded) return;

    const nextPosition = Math.max(0, Math.min(
      status.durationMillis || durationMillis || 0,
      (status.positionMillis || 0) + seconds * 1000
    ));
    await sound.setPositionAsync(nextPosition);
    setPositionMillis(nextPosition);
  }, [durationMillis]);

  const handleLogout = useCallback(async () => {
    await unloadCurrentTrack();
    setCurrentSong(null);
    setSongs([]);
    setActiveView("dashboard");
    await logout();
  }, [logout, unloadCurrentTrack]);

  const playPreviousSong = useCallback(async () => {
    if (!currentSong || songs.length === 0) return;
    const currentIndex = songs.findIndex((song) => song.id === currentSong.id);
    if (currentIndex < 0) return;
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    await playSong(songs[prevIndex], { openPlayer: activeView === "player" });
  }, [activeView, currentSong, playSong, songs]);

  const playNextSong = useCallback(async () => {
    if (!currentSong || songs.length === 0) return;
    const currentIndex = songs.findIndex((song) => song.id === currentSong.id);
    if (currentIndex < 0) return;
    const nextIndex = (currentIndex + 1) % songs.length;
    await playSong(songs[nextIndex], { openPlayer: activeView === "player" });
  }, [activeView, currentSong, playSong, songs]);

  const handleIncomingUrl = useCallback((url) => {
    const songId = extractSongIdFromUrl(url);
    if (!songId) return;
    setPendingDeepLinkSongId(songId);
  }, []);

  useEffect(() => {
    Linking.getInitialURL()
      .then((initialUrl) => {
        if (initialUrl) handleIncomingUrl(initialUrl);
      })
      .catch(() => {});

    const subscription = Linking.addEventListener("url", (event) => {
      handleIncomingUrl(event?.url);
    });

    return () => {
      subscription.remove();
    };
  }, [handleIncomingUrl]);

  useEffect(() => {
    if (user && token) {
      fetchSongs();
      return;
    }

    setSongs([]);
    setSongsError("");
    setSongsLoading(false);
    setCurrentSong(null);
    setActiveView("dashboard");
    setPositionMillis(0);
    setDurationMillis(0);
    setIsPlaying(false);
  }, [fetchSongs, token, user]);

  useEffect(() => {
    if (pendingDeepLinkSongId && !user) {
      setScreen("login");
    }
  }, [pendingDeepLinkSongId, user]);

  useEffect(() => {
    if (!user || !pendingDeepLinkSongId || songsLoading) return;

    const match = songs.find((song) => String(song.id) === String(pendingDeepLinkSongId));
    if (match) {
      playSong(match);
      setPendingDeepLinkSongId("");
      return;
    }

    if (songs.length > 0) {
      setSongsError("Song from email link was not found in your current library.");
      setPendingDeepLinkSongId("");
    }
  }, [pendingDeepLinkSongId, playSong, songs, songsLoading, user]);

  useEffect(() => {
    return () => {
      unloadCurrentTrack();
    };
  }, [unloadCurrentTrack]);

  useEffect(() => {
    const onHardwareBack = () => {
      if (activeView === "player") {
        setActiveView("dashboard");
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", onHardwareBack);
    return () => subscription.remove();
  }, [activeView]);

  if (!user) {
    if (screen === "register") {
      return (
        <RegisterScreen
          onOtpSent={({ email, password }) => {
            setPendingEmail(email);
            setPendingPassword(password);
            setScreen("verify");
          }}
          onGoLogin={() => setScreen("login")}
        />
      );
    }

    if (screen === "verify") {
      return (
        <VerifyOtpScreen
          email={pendingEmail}
          password={pendingPassword}
          onVerified={() => {
            setPendingPassword("");
            setScreen("login");
          }}
        />
      );
    }

    return <LoginScreen onGoRegister={() => setScreen("register")} />;
  }

  if (activeView === "player" && currentSong) {
    return (
      <SongPlayerScreen
        song={currentSong}
        isPlaying={isPlaying}
        progress={durationMillis > 0 ? positionMillis / durationMillis : 0}
        positionMillis={positionMillis}
        durationMillis={durationMillis}
        onBack={() => setActiveView("dashboard")}
        onTogglePlayback={togglePlayback}
        onPrevious={playPreviousSong}
        onNext={playNextSong}
        onSeek={seekToRatio}
        onRewind10={() => skipBySeconds(-10)}
        onForward10={() => skipBySeconds(10)}
      />
    );
  }

  return (
    <HomeScreen
      user={user}
      songs={songs}
      songsLoading={songsLoading}
      songsError={songsError}
      onSongPress={playSong}
      onRefreshSongs={fetchSongs}
      onLogout={handleLogout}
      miniPlayer={
        <MiniPlayer
          song={currentSong}
          isPlaying={isPlaying}
          progress={durationMillis > 0 ? positionMillis / durationMillis : 0}
          positionMillis={positionMillis}
          durationMillis={durationMillis}
          onOpenPlayer={() => setActiveView("player")}
          onTogglePlayback={togglePlayback}
          onPrevious={playPreviousSong}
          onNext={playNextSong}
        />
      }
    />
  );
}

export default function AppRoot() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
