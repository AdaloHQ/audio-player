import React, { useState, useEffect } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import TrackPlayer, { useProgress } from 'react-native-track-player'
import MultiSlider from '@ptomasroos/react-native-multi-slider'

const ProgressBar = props => {
  const { position, duration } = useProgress()
  const [seeking, setSeeking] = useState(false)
  const [seekingValue, setSeekingValue] = useState(0)
  const [ending, setEnding] = useState(false)
  const [recentlySeeked, setRecentlySeeked] = useState(false)
  const [endActionRan, setEndActionRan] = useState(false)

  const [currentTrack, updateCurrentTrack] = useState(props.track)

  useEffect(() => {
    const { updatePlayed, updateProgress, updatePlaying, autoplay } = props

    updateDuration(duration)
    updatePlaying(false)
    updateProgress(0)
    updatePlayed(0)
    const seek = async () => {
      await TrackPlayer.seekTo(0)
    }
    seek()

    if (autoplay) {
      updatePlaying(true)
    }
  }, [currentTrack, duration])

  useEffect(() => {
    if (
      Math.floor(position) / Math.floor(duration) === 1 &&
      !ending &&
      !endActionRan
    ) {
      endTrack()
    }
  }, [position, duration])

  // When the user clicks and holds on the slider

  const startSeek = () => {
    setSeeking(true)
    setSeekingValue(position)
  }
  // When the user changes the value but hasn't let go of the slider yet
  const seek = values => {
    setSeekingValue(values[0])
  }
  // User has let go of the slider
  const endSeek = () => {
    setSeeking(false)
    // Recently seeked is for logic concerning the value of the slider.
    // Used to address issue where the slider would randomly jump back to
    // where it was before the user seeked for a brief moment in time.
    setRecentlySeeked(true)
    const { updateProgress, updatePlayed } = props
    let seekValueSec = seekingValue * duration
    updatePlayed(seekValueSec)
    updateProgress(seekingValue)
    TrackPlayer.seekTo(seekValueSec)
  }

  // resets progress to zero and calls on the action for the end of a song
  const endTrack = async () => {
    const {
      updatePlayed,
      updateProgress,
      topScreen,
      endSong,
      updatePlaying,
    } = props
    setEnding(true)
    setEndActionRan(true)
    updatePlaying(false)
    updateProgress(0)
    updatePlayed(0)
    await TrackPlayer.seekTo(0)
    if (topScreen) endSong()
    setEnding(false)
  }

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
    _fonts,
  } = props
  let progress = isNaN(position / duration) ? 0 : position / duration

  const {
    updateDuration,
    updateProgress,
    updatePlayed,
    duration: propDuration,
    played: propPlayed,
  } = props

  // If track has changed, update the duration
  if (propDuration !== duration) {
    updateDuration(duration)
  }

  // Update the progress in index if it's changed
  if (propPlayed !== position) {
    updateProgress(progress)
    updatePlayed(position)

    if (progress < 1 && endActionRan) {
      setEndActionRan(false)
    }
  }

  // Boolean flag used to test if the player's position has properly changed
  // after a seek has happened. This is used to keep the slider from awkwardly
  // jumping back to its previous value for a brief moment
  // Logic: if recently seeked and the current played value is within a few
  // seconds of the seeked value, then the player has properly updated
  const playerUpdatedAfterSeek =
    Math.abs(position - seekingValue * duration) < 3 && recentlySeeked
  if (playerUpdatedAfterSeek) setRecentlySeeked(false)

  // Number used to keep the duration from changing awkwardly
  // represents the played value using the seeked value, if the user has
  // recently seeked and the progress has not updated.
  // Logic "(this.state.seeking || !playerUpdatedAfterSeek) && recentlySeeked"
  // is used several times throughout the next few lines.
  // The "&& recentlySeeked" is used to allow the player to properly update
  // if the user has skipped or rewinded using buttons, because that logic
  // is housed in index, not here.
  const playedIfSeeked =
    (seeking || !playerUpdatedAfterSeek) && recentlySeeked
      ? seekingValue * duration
      : position

  // Formats duration and played using "hhmmss", padding the numbers and
  // presenting it as a string.
  let durationFormatted = hhmmss(
    endTimeFormat === 1 ? duration : duration - playedIfSeeked
  )
  if (durationFormatted === '-1:-1:-1') durationFormatted = '0:00'
  const playedFormatted =
    (seeking || !playerUpdatedAfterSeek) && recentlySeeked
      ? hhmmss(seekingValue * duration)
      : hhmmss(position)

  // The value that shows up in the slider
  const sliderValue =
    (seeking || !playerUpdatedAfterSeek) && recentlySeeked
      ? seekingValue
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
  const timeFontStyles = {
    fontFamily: _fonts.body,
  }

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
              onValuesChangeStart={startSeek}
              onValuesChange={seek}
              onValuesChangeFinish={endSeek}
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
            <Text style={timeFontStyles}>{playedFormatted}</Text>
            <Text style={timeFontStyles}>{durationFormatted}</Text>
          </View>
        </View>
      )}
    </View>
  )
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
  if (hours !== 0) return `${hours}:${pad(minutes)}:${pad(secs)}`
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
