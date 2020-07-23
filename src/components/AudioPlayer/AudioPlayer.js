import React, { Component } from 'react'
import TrackPlayer from 'react-native-track-player'
import { v4 as uuid } from 'uuid'
import ProgressBar from './ProgressBar'

class AudioPlayerSub extends Component {
  constructor(props) {
    super(props)
    // Sets up everything on react-native-track-player's end
    this.setup()
  }

  setup = async () => {
    await TrackPlayer.setupPlayer()
    TrackPlayer.updateOptions({
      // Whether the player should stop running when the app is closed on Android
      stopWithApp: true,
      // An array of media controls capabilities
      // Can contain CAPABILITY_PLAY, CAPABILITY_PAUSE, CAPABILITY_STOP, CAPABILITY_SEEK_TO,
      // CAPABILITY_SKIP_TO_NEXT, CAPABILITY_SKIP_TO_PREVIOUS, CAPABILITY_SET_RATING
      capabilities: [
        TrackPlayer.CAPABILITY_PLAY,
        TrackPlayer.CAPABILITY_PAUSE,
        TrackPlayer.CAPABILITY_SEEK_TO,
      ],
      // An array of capabilities that will show up when the notification is in the compact form on Android
      compactCapabilities: [
        TrackPlayer.CAPABILITY_PLAY,
        TrackPlayer.CAPABILITY_PAUSE,
      ],
    })
    const { track, playing } = this.props
    // Adds the specified song to the track player to be ready to play
    await TrackPlayer.add({
      // Every track needs a unique id, not really used anywhere here though
      id: uuid(),
      url: track.url,
      title: track.title,
      artist: track.subtitle,
      artwork: track.artwork,
    })
    // If player was already set to play, start playing
    if (playing) {
      await TrackPlayer.play()
    }
    let state = await TrackPlayer.getState()
    if (state == 'playing' && !playing) {
      const { updatePlaying } = this.props
      updatePlaying(true)
    }
  }

  // Generic seeking function used by index to handle skip and rewind.
  // Custom seeking is handled by ProgressBar on mobile
  seek = newProgress => {
    const { duration } = this.props
    const seekTime = newProgress * duration
    TrackPlayer.seekTo(seekTime)
  }

  // When props change
  componentDidUpdate(prevProps) {
    // Check if the play/pause controls have changed
    if (prevProps.playing != this.props.playing) {
      this.props.playing ? TrackPlayer.play() : TrackPlayer.pause()
    }
    // Check if the track has changed
    //let oldTrack = TrackPlayer.getTrack(TrackPlayer.getCurrentTrack())
    let oldTrack = ''
    TrackPlayer.getCurrentTrack().then(id => {
      TrackPlayer.getTrack(id).then(oldTrack => {
        console.log('oldTrack: ', oldTrack)
        if (oldTrack.url != this.props.track.url) {
          const id = uuid()
          const { track } = this.props
          TrackPlayer.add({
            id,
            url: track.url,
            title: track.title,
            artist: track.subtitle,
            artwork: track.artwork,
          }).then(() => {
            TrackPlayer.skip(id)
          })
        }
      })
    })
  }

  // Render Progress Bar
  render() {
    return <ProgressBar {...this.props} />
  }
}

export default AudioPlayerSub
