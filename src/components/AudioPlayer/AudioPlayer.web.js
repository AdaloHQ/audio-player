import React, { Component } from 'react'
import MultiSlider from '@ptomasroos/react-native-multi-slider'
import { Text, View, StyleSheet } from 'react-native'

export default class AudioPlayerSub extends Component {
  state = {
    seeking: false,
    seekingValue: 0,
  }

  componentDidMount() {
    this.player.addEventListener('timeupdate', e => {
      const { updatePlayed, updateProgress } = this.props
      const { duration, currentTime } = e.target
      updatePlayed(currentTime)
      const progress = currentTime / duration
      updateProgress(progress)
    })
    this.player.addEventListener('durationchange', e => {
      const { duration } = e.target
      const { updateDuration } = this.props
      updateDuration(duration)
    })
    this.player.addEventListener('error', e => {
      console.log('Audio player error!!! ', e.target.error)
      this.player.src = ''
    })
    const {
      track: { url },
    } = this.props
    this.addUrl(url)
  }

  componentWillUnmount() {
    this.player.removeEventListener('timeupdate', () => {})
    this.player.removeEventListener('durationchange', () => {})
    this.player.removeEventListener('error', () => {})
  }

  componentDidUpdate(prevProps) {
    const {
      track: { url },
      playing,
    } = this.props
    const {
      track: { url: prevUrl },
      playing: prevPlaying,
    } = prevProps
    if (url !== prevUrl) {
      this.addUrl(url)
    }
    if (playing !== prevPlaying) {
      if (playing && this.player.src) this.player.play()
      else if (!playing && this.player.src) this.player.pause()
    }
  }

  addUrl = url => {
    const { updatePlayable } = this.props
    updatePlayable(false)
    let testSound = new Audio(url)
    testSound.addEventListener('canplay', () => {
      this.player.src = url
      testSound.removeEventListener('canplay', () => {})
      updatePlayable(true)
    })
  }

  // When the user clicks and holds on the slider
  startSeek = () => {
    const { progress } = this.props
    this.setState({ seeking: true, seekingValue: progress })
  }
  // When the user changes the value but hasn't let go of the slider yet
  seekChange = values => {
    this.setState({ seekingValue: values[0] })
  }
  // User has let go of the slider
  endSeek = () => {
    this.setState({ seeking: false })
    // Calls on seek function within AudioPlayer.web.js to seek
    const { seekingValue } = this.state
    const { duration, updatePlayed, updateProgress } = this.props
    const newTime = seekingValue * duration
    updateProgress(seekingValue)
    updatePlayed(newTime)
    this.player.currentTime = newTime
  }

  seek = newProgress => {
    const { duration } = this.props
    const newTime = newProgress * duration
    this.player.currentTime = newTime
  }

  render() {
    const {
      played,
      duration,
      progress,
      filledColor,
      height,
      unfilledColor,
      progressRounding,
      markerSize,
      border,
      borderColor,
      borderSize,
      borderShadow,
      endTimeFormat,
    } = this.props
    // Formats duration and played using "hhmmss", padding the numbers and
    // presenting it as a string.
    const durationFormatted = hhmmss(
      endTimeFormat == 1 ? duration : duration - played
    )
    const playedFormatted = this.state.seeking
      ? hhmmss(this.state.seekingValue * duration)
      : hhmmss(played)
    // The value that shows up in the slider
    let sliderValue = this.state.seeking ? this.state.seekingValue : progress
    if (isNaN(sliderValue)) sliderValue = 0
    const markerStyle = {
      width: markerSize,
      height: markerSize,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      //Makes sure the marker is properly centered on the slider
      marginTop: height - 2,
    }
    if (border) {
      markerStyle.borderWidth = borderSize
      markerStyle.borderColor = borderColor
    }
    // Sets shadow size relative to the size of the marker.
    // 3 is completely arbitrary
    if (borderShadow) {
      markerStyle.shadowOffset.height = markerSize / 3
    }
    return (
      <View style={styles.wrapper}>
        <audio ref={ref => (this.player = ref)} />
        <Text style={styles.text}>{playedFormatted}</Text>
        <MultiSlider
          enabledOne
          min={0}
          max={1}
          values={[sliderValue]}
          step={0.01}
          sliderLength={100}
          enableLabel={false}
          onValuesChangeStart={this.startSeek}
          onValuesChange={this.seekChange}
          onValuesChangeFinish={this.endSeek}
          trackStyle={{
            backgroundColor: unfilledColor,
            height: height,
            borderRadius: progressRounding,
          }}
          selectedStyle={{
            backgroundColor: filledColor,
            height: height,
            borderRadius: progressRounding,
          }}
          markerStyle={markerStyle}
        />
        <Text style={styles.text}>{durationFormatted}</Text>
      </View>
    )
  }
}

// Taken from stackoverflow: https://stackoverflow.com/questions/31337370/how-to-convert-seconds-to-hhmmss-in-moment-js
function pad(num) {
  return ('0' + num).slice(-2)
}
function hhmmss(secs) {
  secs = Math.floor(secs)
  var minutes = Math.floor(secs / 60)
  secs = secs % 60
  var hours = Math.floor(minutes / 60)
  minutes = minutes % 60
  if (hours != 0) return `${hours}:${pad(minutes)}:${pad(secs)}`
  else return `${minutes}:${pad(secs)}`
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
  },
  text: {
    padding: 3,
  },
})
