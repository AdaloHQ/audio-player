import React, { useState } from 'react'
import { Text, View, Image, StyleSheet } from 'react-native'
import TrackPlayer from 'react-native-track-player'
import { v4 as uuid } from 'uuid'

class AudioPlayerSub extends Component {
  constructor(props) {
    super(props)
    setup()
  }

  setup = async () => {
    await TrackPlayer.setupPlayer()
    await TrackPlayer.registerPlaybackService(() => require('./service.js'))
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
    const { track, playing, updateProgress, updateDuration } = this.props
    await TrackPlayer.add({
      id: uuid(),
      url: track.url,
      title: track.title,
      artist: track.subtitle,
      artwork: track.artwork,
    })
    if (this.state.playing) {
      TrackPlayer.play()
    }
    let duration = await TrackPlayer.getDuration()
    updateDuration(duration)
    this.progress = setInterval(async () => {
      const position = await TrackPlayer.getPosition()
      const progress = position / duration
      updateProgress({ playedSeconds: position, played: progress })
    }, 100)
  }

  seek = newProgress => {
    const { duration } = this.props
    const seekTime = newProgress * duration
    TrackPlayer.seekTo(seekTime)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.playing != this.props.playing) {
      this.props.playing ? TrackPlayer.play() : TrackPlayer.pause()
    }
    if (prevProps.track.url != this.props.track.url) {
      TrackPlayer.add({
        id: uuid(),
        url: track.url,
        title: track.title,
        artist: track.subtitle,
        artwork: track.artwork,
      }).then(() => {
        TrackPlayer.play()
        TrackPlayer.getDuration().then(duration => {
          const { updateDuration } = this.props
          updateDuration(duration)
        })
      })
    }
  }

  componentWillUnmount() {
    clearInterval(this.progress)
  }

  render() {
    return <View></View>
  }
}

export default AudioPlayerSub
