// Used by mobile audio player for play/pause through the lock screen.

import TrackPlayer, { Capability } from 'react-native-track-player'

const preparePlayer = async () => {
  await TrackPlayer.setupPlayer()

  TrackPlayer.registerPlaybackService(() => {
    TrackPlayer.addEventListener('remote-play', () => TrackPlayer.play())
    TrackPlayer.addEventListener('remote-pause', () => TrackPlayer.pause())
    TrackPlayer.addEventListener('remote-stop', () => TrackPlayer.destroy())
  })

  TrackPlayer.updateOptions({
    // should the player stop running when the app is closed on Android
    stopWithApp: true,
    // Media control capabilities
    capabilities: [Capability.Play, Capability.Pause, Capability.SeekTo],
    // Capabilities that will show up when the notification is in the compact form on Android
    compactCapabilities: [Capability.Play, Capability.Pause],
  })
}

module.exports = preparePlayer