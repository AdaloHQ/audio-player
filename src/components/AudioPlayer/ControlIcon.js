import React, { Component } from 'react'
import { View } from 'react-native'
import { IconToggle } from '@protonapp/react-native-material-ui'

class ControlIcon extends Component {
  render() {
    const { name, color, enabled, onPress, playable } = this.props
    if (enabled && name) {
      return (
        <IconToggle
          key={`${name}${color}`}
          name={name}
          color={color}
          onPress={onPress}
          size={28}
        />
      )
    } else
      return (
        <IconToggle
          name={name ? name : 'pause'}
          color={'#FFFFFF00'}
          size={28}
        />
      )
  }
}

export default ControlIcon
