import React, { Component } from 'react'
import { View } from 'react-native'
import { IconToggle } from '@protonapp/react-native-material-ui'

class ControlIcon extends Component {
  render() {
    const { name, color, enabled, onPress, iconSize } = this.props
    if (enabled && name) {
      return (
        <IconToggle
          key={`${name}${color}${iconSize}`}
          name={name}
          color={color}
          onPress={onPress}
          size={iconSize}
        />
      )
    } else
      return (
        <IconToggle
          name={name ? name : 'pause'}
          color={'#FFFFFF00'}
          size={iconSize}
        />
      )
  }
}

export default ControlIcon
