import React, { Component } from 'react'
import { Text, View, Image, StyleSheet } from 'react-native'
import { IconToggle } from '@protonapp/react-native-material-ui'

class ControlIcon extends Component {
  render() {
    const { name, color, enabled, onPress } = this.props
    return (
      <View>
        {enabled || name ? (
          <IconToggle name={name} color={color} onPress={onPress} />
        ) : null}
      </View>
    )
  }
}

export default ControlIcon
