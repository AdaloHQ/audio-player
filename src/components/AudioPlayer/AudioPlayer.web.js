import React, { Component } from 'react'
import { Text, View, Image, StyleSheet } from 'react-native'
import ReactPlayer from 'react-player'

class AudioPlayerSub extends Component {
  // Ref to control the ReactPlayer
  ref = player => {
    this.player = player
  }

  // Seek method, called by ref in index.js
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
        config={{
          file: {
            forceAudio: true,
          },
        }}
      />
    )
  }
}

export default AudioPlayerSub
