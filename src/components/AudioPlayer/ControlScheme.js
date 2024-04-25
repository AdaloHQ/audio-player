import React, { Component } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import ControlIcon from './ControlIcon'

class ControlScheme extends Component {
  renderPlayPause = () => {
    const {
      playing,
      pauseButton,
      playButton,
      editor = false,
      durationSet = false
    } = this.props

    if (durationSet === false && editor === false) {
      const { color } = playButton

      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={color} />
        </View>
      )
    }

    if (playing) {
      return <ControlIcon {...pauseButton} />
    }

    return <ControlIcon {...playButton} />
  }

  render() {
    const {
      forwardButton,
      backButton,
      leftButton,
      rightButton,
    } = this.props

    return (
      <View style={styles.icons}>
        <ControlIcon {...leftButton} />
        <ControlIcon {...backButton} />
        {this.renderPlayPause()}
        <ControlIcon {...forwardButton} />
        <ControlIcon {...rightButton} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  icons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default ControlScheme
