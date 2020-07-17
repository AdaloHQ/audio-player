import React, { Component } from 'react'
import { View } from 'react-native'
import { IconToggle } from '@protonapp/react-native-material-ui'

class ControlIcon extends Component {
  render() {
    const { name, color, enabled, onPress, playable } = this.props
    if (enabled && name) {
      return <IconToggle name={name} color={color} onPress={onPress} />
    } else return <View />
  }
}

export default ControlIcon
