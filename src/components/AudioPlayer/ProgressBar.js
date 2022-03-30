import React, { useState } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import TrackPlayer, { useProgress } from 'react-native-track-player'
import MultiSlider from '@ptomasroos/react-native-multi-slider'

const ProgressBar = React.memo(
  props => {
    const { position, buffered, duration } = useProgress()
    const [seeking, setSeeking] = useState(false)
    const [seekingValue, setSeekingValue] = useState(0)
    const [ending, setEnding] = useState(false)
    const [recentlySeeked, setRecentlySeeked] = useState(false)

    const startSeek = () => {
      // const { position } = useProgress()
      setSeeking(true)
      setSeekingValue(position)
    }

    const seek = values => {
      setSeekingValue(values[0])
    }

    const endSeek = () => {
      setSeeking(false)
      setRecentlySeeked(true)
      const { updateProgress, updatePlayed } = props
      let seekValueSec = seekingValue * duration
      updatePlayed(seekValueSec)
      updateProgress(seekingValue)
      TrackPlayer.seekTo(seekValueSec)
    }

    const endTrack = async () => {
      const { updatePlayed, updateProgress, topScreen, endSong } = props
      setEnding(true)

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

    const {
      updateDuration,
      updateProgress,
      updatePlayed,
      duration: propDuration,
      played: propPlayed,
    } = props

    if (propDuration !== duration) {
      updateDuration(duration)
    }

    //TODO: look into this function futher
    if (propPlayed !== position) {
      updateProgress(position)
      updatePlayed(position)
    }

    const playerUpdatedAfterSeek =
      Math.abs(position - seekingValue * duration) < 3 && recentlySeeked
    if (playerUpdatedAfterSeek) setRecentlySeeked(false)

    const playedIfSeeked =
      (seeking || !playerUpdatedAfterSeek) && recentlySeeked
        ? seekingValue * duration
        : position

    let durationFormatted = hhmmss(
      endTimeFormat === 1 ? duration : duration - playedIfSeeked
    )
    if (durationFormatted === '-1:-1:-1') durationFormatted = '0:00'
    const playedFormatted =
      (seeking || !playerUpdatedAfterSeek) && recentlySeeked
        ? hhmmss(seekingValue * duration)
        : hhmmss(position)

    const sliderValue =
      (seeking || !playerUpdatedAfterSeek) && recentlySeeked
        ? seekingValue
        : position //changed from progress in old version
    const markerStyle = {
      width: markerSize,
      height: markerSize,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      marginTop: height - 2,
      borderWidth: 0,
      backgroundColor: markerColor,
    }
    if (border) {
      markerStyle.borderWidth = borderSize
      markerStyle.borderColor = borderColor
    }

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
  },
  (prevProps, nextProps) => {
    const { played, duration, progress, topScreen, startSwitch } = prevProps //TODO: should this be props or prevpropts?

    if (Math.round(progress * 100) / 100 === 1 && !ending) {
      endTrack()
    }

    if (
      nextProps.played !== played ||
      nextProps.duration !== duration ||
      nextProps.progress !== progress ||
      !topScreen ||
      startSwitch
    ) {
      return false
    }
    return true
  }
)

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
