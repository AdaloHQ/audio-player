import React, { Component } from 'react'
import { Text, View, Image, StyleSheet } from 'react-native'
import ReactPlayer from 'react-player'

class AudioPlayerSub extends Component {
  ref = player => {
    this.player = player
  }
  seek = newProgress => {
    if (newProgress >= 0 && newProgress <= 1) {
      this.player.seekTo(newProgress)
    }
  }

  render() {
    const { track, playing, updateProgress, updateDuration } = this.props
    return (
      <ReactPlayer
        ref={this.ref}
        url={track.url}
        playing={playing}
        onProgress={updateProgress}
        onDuration={updateDuration}
      />
    )
  }
}

export default AudioPlayerSub
