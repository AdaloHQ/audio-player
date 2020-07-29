import React, { Component } from 'react'
import { Text, View, Image, StyleSheet } from 'react-native'
import ControlIcon from './ControlIcon'

class ControlScheme extends Component {
  render() {
    const {
      playButton,
      pauseButton,
      forwardButton,
      backButton,
      leftButton,
      rightButton,
      playing,
    } = this.props
    return (
      <View style={styles.icons}>
        <ControlIcon {...leftButton} />
        <ControlIcon {...backButton} />
        {playing ? (
          <ControlIcon {...pauseButton} />
        ) : (
          <ControlIcon {...playButton} />
        )}
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
})

export default ControlScheme
