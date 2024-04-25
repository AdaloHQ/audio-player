// Used by mobile audio player for play/pause through the lock screen.

import TrackPlayer, { Event } from 'react-native-track-player'

// service.js
module.exports = async function() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play())
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause())
}
