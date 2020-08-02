import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import TrackPlayer from 'react-native-track-player'
import MultiSlider from '@ptomasroos/react-native-multi-slider'

// Based off of the web version, with a few major differences
class ProgressBar extends TrackPlayer.ProgressComponent {
  state = {
    seeking: false,
    seekingValue: 0,
  }

  // When the user clicks and holds on the slider
  startSeek = () => {
    const { progress } = this.props
    this.setState({ seeking: true, seekingValue: progress })
  }
  // When the user changes the value but hasn't let go of the slider yet
  seek = values => {
    this.setState({ seekingValue: values[0] })
  }
  // User has let go of the slider
  endSeek = () => {
    this.setState({
      seeking: false,
      progress: seekingValue,
      // Recently seeked is for logic concerning the value of the slider.
      // Used to address issue where the slider would randomly jump back to
      // where it was before the user seeked for a brief moment in time.
      recentlySeeked: true,
    })
    const { updateProgress, updatePlayed } = this.props
    const { duration, seekingValue } = this.state
    let seekValueSec = seekingValue * duration
    updatePlayed(seekValueSec)
    updateProgress(seekingValue)
    TrackPlayer.seekTo(seekValueSec)
  }

  // In the mobile version, played, duration, and progress are all updated by
  // the progress bar, not the AudioPlayerSub, so if there are differences
  // between the new props and the old props, don't rerender.
  // Prevents an infinite loop.
  shouldComponentUpdate(nextProps) {
    //played, duration, progress
    const { played, duration, progress } = this.props
    if (
      nextProps.played != played ||
      nextProps.duration != duration ||
      nextProps.progress != progress
    )
      return false
    return true
  }

  render() {
    const {
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
      markerColor,
      width,
    } = this.props
    let {
      position: played,
      duration,
      seekingValue,
      recentlySeeked,
    } = this.state
    let progress = this.getProgress()
    const {
      updateDuration,
      updateProgress,
      updatePlayed,
      duration: propDuration,
      played: propPlayed,
    } = this.props
    // If track has changed, update the duration
    if (propDuration != duration) updateDuration(duration)
    // Update the progress in index if it's changed
    if (propPlayed != played) {
      updateProgress(progress)
      updatePlayed(played)
    }
    // Boolean flag used to test if the player's position has properly changed
    // after a seek has happened. This is used to keep the slider from awkwardly
    // jumping back to its previous value for a brief moment
    // Logic: if recently seeked and the current played value is within a few
    // seconds of the seeked value, then the player has properly updated
    const playerUpdatedAfterSeek =
      Math.abs(played - seekingValue * duration) < 3 && recentlySeeked
    if (playerUpdatedAfterSeek) this.setState({ recentlySeeked: false })
    // Number used to keep the duration from changing awkwardly
    // representes the played value using the seeked value, if the user has
    // recently seeked and the progress has not updated.
    // Logic "(this.state.seeking || !playerUpdatedAfterSeek) && recentlySeeked"
    // is used several times throughout the next few lines.
    // The "&& recentlySeeked" is used to allow the player to properly update
    // if the user has skipped or rewinded using buttons, because that logic
    // is housed in index, not here.
    const playedIfSeeked =
      (this.state.seeking || !playerUpdatedAfterSeek) && recentlySeeked
        ? seekingValue * duration
        : played
    // Formats duration and played using "hhmmss", padding the numbers and
    // presenting it as a string.
    const durationFormatted = hhmmss(
      endTimeFormat == 1 ? duration : duration - playedIfSeeked
    )
    const playedFormatted =
      (this.state.seeking || !playerUpdatedAfterSeek) && recentlySeeked
        ? hhmmss(this.state.seekingValue * duration)
        : hhmmss(played)
    // The value that shows up in the slider
    const sliderValue =
      (this.state.seeking || !playerUpdatedAfterSeek) && recentlySeeked
        ? this.state.seekingValue
        : progress
    const markerStyle = {
      width: markerSize,
      height: markerSize,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      //Makes sure the marker is properly centered on the slider
      marginTop: height - 2,
      borderWidth: 0,
      backgroundColor: markerColor,
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
    const padding = Math.ceil(markerSize / 2)
    const paddingStyles = { paddingLeft: padding, paddingRight: padding }
    const trackLength = width - padding * 2
    return (
      <View style={(styles.wrapper, paddingStyles)}>
        {width !== null && (
          <View>
            <View style={styles.seekBar}>
              <MultiSlider
                enabledOne
                min={0}
                max={1}
                values={[sliderValue]}
                step={0.01}
                sliderLength={trackLength}
                enableLabel={false}
                onValuesChangeStart={this.startSeek}
                onValuesChange={this.seek}
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
            </View>
            <View style={styles.timeText}>
              <Text>{playedFormatted}</Text>
              <Text>{durationFormatted}</Text>
            </View>
          </View>
        )}
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
    flexDirection: 'column',
  },
  seekBar: {
    height: 35,
  },
  timeText: {
    margin: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

export default ProgressBar
