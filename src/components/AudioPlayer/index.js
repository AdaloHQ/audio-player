import React, { useRef, useState } from 'react'
import { Text, View, Image, StyleSheet } from 'react-native'
import AudioPlayerSub from './../AudioPlayer/AudioPlayer'
import ControlScheme from './../AudioPlayer/ControlScheme'

Number.prototype.round = function (places) {
  return +(Math.round(this + 'e+' + places) + 'e-' + places)
}

const placeholderAlbumArt =
  'https://img.buzzfeed.com/buzzfeed-static/static/2020-03/5/23/enhanced/25a67c968a0a/enhanced-262-1583449224-1.png?downsize=900:*&output-format=auto&output-quality=auto'

export function AudioPlayer(props) {
  const ref = useRef(null)
  const { url, title, subtitle, artwork } = props
  // Controls play/pause buttons, as well as playback
  const [playing, setPlaying] = useState(false)
  // Validity of url being played
  const [playable, setPlayable] = useState(true)
  // Proportion of song played (from 0 to 1)
  const [progress, setProgress] = useState(0.0)

  // Proportion of previous song played (0 if no previous song)
  const [prevProgress, setPrevProgress] = useState(0.0)

  // Duration of song
  const [duration, setDuration] = useState(0.0)

  // Time played of song (in seconds)
  const [played, setPlayed] = useState(0.0)

  const [track, setTrack] = useState({
    url,
    title,
    subtitle,
    artwork: artwork.artworkURL,
  })

  const [width, setWidth] = useState(null)

  const state = {
    playing,
    playable,
    progress,
    prevProgress,
    duration,
    played,
    track,
    width,
  }

  const {
    titleColor,
    titleSize,
    subtitleColor,
    subtitleSize,
    progressBar,
    playPauseButtons,
    forwardBackButtons,
    leftRightButtons,
    autoplay,
    editor,
    _fonts,
    active,
    topScreen,
    // whether to pause when changing away from audio player screens
    keepPlaying,
  } = props

  // Taken from range-slider code Jeremy wrote to dynamically change width
  const handleLayout = ({ nativeEvent }) => {
    const { width: currentWidth } = (nativeEvent && nativeEvent.layout) || {}
    if (currentWidth !== width) {
      setWidth(currentWidth)
    }
  }

  // Changes state to playing, and calls any additional actions
  const start = () => {
    const {
      playPauseButtons: { playAction },
    } = props
    if (!playable) return
    if (playAction) {
      playAction(played.round(2), duration.round(2), progress.round(3))
    }
    setPlaying(true)
  }

  // Changes state to not playing, and calls any additional actions
  const pause = () => {
    const {
      playPauseButtons: { pauseAction },
    } = props
    if (!playable) return
    if (pauseAction) {
      pauseAction(played.round(2), duration.round(2), progress.round(3))
    }
    setPlaying(false)
  }

  // Callback for rewind button. Rewind amount is preprogrammed by the customer
  const rewind = () => {
    const {
      forwardBackButtons: { backAction, backAmount },
    } = props
    if (!playable) return
    // Call additional actions
    if (backAction) backAction()
    // If rewinding would go negative or rewind is set to the beginning,
    // seek to 0. Else seek to the rewind
    if (played - backAmount > 0 && backAmount !== 0) {
      const newProgress = (played - backAmount) / duration
      // Uses refs to tell the audio player to seek
      ref.current.seek(newProgress)
    } else {
      ref.current.seek(0)
    }
  }

  // Similar logic to rewind, except for skipping forward
  const skip = () => {
    const {
      forwardBackButtons: { forwardAction, forwardAmount },
    } = props
    if (!playable) return
    if (forwardAction) forwardAction()
    if (played + forwardAmount < duration) {
      const newProgress = (played + forwardAmount) / duration
      ref.current.seek(newProgress)
    } else {
      ref.current.seek(1)
      setPlaying(false)
    }
  }

  // Generalized seek method. Used by progressbar to seek to any place
  const seek = (newProgress) => {
    // Uses refs to tell audio player to seek
    ref.current.seek(newProgress)
    // Update progress and played
    const newPlayed = duration * newProgress
    setPlayed(newPlayed)
    setProgress(newProgress)
  }

  const updateDuration = (duration) => {
    setDuration(duration)
  }

  const updatePlayed = (played) => {
    setPlayed(played)
  }

  const updatePlaying = (bool) => {
    setPlaying(bool)
  }
  const updatePlayable = (bool) => {
    setPlayable(bool)
  }
  const updatePrevProgress = (newProgress) => {
    setPrevProgress(newProgress)
  }

  const endSong = () => {
    const { endAction } = props
    if (endAction) endAction()
  }

  const artworkWidth = (width * artwork.artworkPercent) / 100

  // noinspection JSSuspiciousNameCombination
  const dynamicStyles = {
    artwork: {
      width: artworkWidth,
      height: artworkWidth,
      borderRadius: artwork.artworkRounding,
      alignSelf: 'center',
    },
    title: {
      color: titleColor ? titleColor : '#424242',
      fontSize: titleSize ? titleSize : 16,
      padding: 4,
      textAlign: 'center',
      fontWeight: 'bold',
      paddingTop: 22,
    },
    subtitle: {
      color: subtitleColor ? subtitleColor : '#424242',
      fontSize: subtitleSize ? subtitleSize : 12,
      padding: 4,
      textAlign: 'center',
    },
  }

  //custom fonts
  if (props.styles) {
    dynamicStyles.title = {
      ...dynamicStyles.title,
      ...props.styles.title,
    }
    dynamicStyles.subtitle = {
      ...dynamicStyles.subtitle,
      ...props.styles.subtitle,
    }
  } else if (_fonts) {
    dynamicStyles.title.fontFamily = _fonts.body
    dynamicStyles.subtitle.fontFamily = _fonts.body
  }

  const buttonConfig = {
    playButton: {
      name: playPauseButtons.playIconName,
      // Both the overarching child component must be enabled,
      // as well as the enable for the specific button
      enabled: playPauseButtons.enabled,
      color: playPauseButtons.playColor,
      onPress: start,
      iconSize: playPauseButtons.iconSize,
    },
    pauseButton: {
      name: playPauseButtons.pauseIconName,
      enabled: playPauseButtons.enabled,
      color: playPauseButtons.pauseColor,
      onPress: pause,
      iconSize: playPauseButtons.iconSize,
    },
    forwardButton: {
      name: forwardBackButtons.forwardIconName,
      enabled: forwardBackButtons.enableForward && forwardBackButtons.enabled,
      color: forwardBackButtons.forwardColor,
      onPress: skip,
      iconSize: forwardBackButtons.iconSize,
    },
    backButton: {
      name: forwardBackButtons.backIconName,
      enabled: forwardBackButtons.enableBack && forwardBackButtons.enabled,
      color: forwardBackButtons.backColor,
      onPress: rewind,
      iconSize: forwardBackButtons.iconSize,
    },
    leftButton: {
      name: leftRightButtons.leftIconName,
      enabled: leftRightButtons.enableLeft && leftRightButtons.enabled,
      color: leftRightButtons.leftColor,
      onPress: leftRightButtons.leftAction,
      iconSize: leftRightButtons.iconSize,
    },
    rightButton: {
      name: leftRightButtons.rightIconName,
      enabled: leftRightButtons.enableRight && leftRightButtons.enabled,
      color: leftRightButtons.rightColor,
      onPress: leftRightButtons.rightAction,
      iconSize: leftRightButtons.iconSize,
    },
  }
  const showArtwork = artwork.showArtwork && artwork.enabled
  // A little redundant, but various if statements control for positioning
  // options chosen by customer.

  const AudioPlayerComponent = (
    <AudioPlayerSub
      {...progressBar}
      played={played}
      duration={duration}
      progress={progress}
      prevProgress={prevProgress}
      playing={playing}
      track={track}
      seek={seek}
      ref={ref}
      updateProgress={setProgress}
      updateDuration={updateDuration}
      updatePlayed={updatePlayed}
      updatePlaying={updatePlaying}
      updatePlayable={updatePlayable}
      updatePrevProgress={updatePrevProgress}
      width={width}
      autoplay={autoplay}
      editor={editor}
      endSong={endSong}
      _fonts={_fonts}
      active={active}
      topScreen={topScreen}
      keepPlaying={typeof keepPlaying !== 'undefined' ? keepPlaying : true}
    />
  )

  const ControlSchemeComponent = <ControlScheme {...buttonConfig} {...state} />
  const SongText = (
    <>
      {title !== '' ? <Text style={dynamicStyles.title}>{title}</Text> : null}
      {subtitle !== '' ? (
        <Text style={dynamicStyles.subtitle}>{subtitle}</Text>
      ) : null}
    </>
  )
  return (
    <View onLayout={handleLayout}>
      <View style={styles.wrapper}>
        {showArtwork && (
          <Image
            source={{ uri: artwork.artworkURL }}
            style={dynamicStyles.artwork}
            defaultSource={placeholderAlbumArt}
          />
        )}

        {progressBar.position === 'aboveButtons' ? (
          <>
            {SongText}
            {AudioPlayerComponent}
            {ControlSchemeComponent}
          </>
        ) : progressBar.position === 'aboveTitle' ? (
          <>
            {AudioPlayerComponent}
            {SongText}
            {ControlSchemeComponent}
          </>
        ) : (
          <>
            {SongText}
            {ControlSchemeComponent}
            {AudioPlayerComponent}
          </>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
