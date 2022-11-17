import React, { Component } from 'react'
import { Text, View, Image, StyleSheet } from 'react-native'
import AudioPlayerSub from './AudioPlayer'
import ControlScheme from './ControlScheme'

Number.prototype.round = function(places) {
  return +(Math.round(this + 'e+' + places) + 'e-' + places)
}

class AudioPlayer extends Component {
  constructor(props) {
    super(props)
    const { url, title, subtitle, artwork } = props
    this.state = {
      // Controls play/pause buttons, as well as playback
      playing: false,
      // Validity of url being played
      playable: true,
      // Proportion of song played (from 0 to 1)
      progress: 0,
      // Proportion of previous song played (0 if no previous song)
      prevProgress: 0,
      // Duration of song
      duration: 0,
      // Time played of song (in seconds)
      played: 0,
      // Info for the specific song currently playing.
      track: {
        url,
        title,
        subtitle,
        artwork: artwork.artworkURL,
      },
      width: null,
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { track } = prevState
    const { url, title, subtitle, artwork, topScreen } = nextProps
    const nextTrack = {
      url,
      title,
      subtitle,
      artwork: artwork.artworkURL,
    }

    if (JSON.stringify(track) !== JSON.stringify(nextTrack) && topScreen) {
      return { ...prevState, track: nextTrack }
    } else {
      return null
    }
  }

  // Taken from range-slider code Jeremy wrote to dynamically change width
  handleLayout = ({ nativeEvent }) => {
    const { width } = (nativeEvent && nativeEvent.layout) || {}
    const { width: prevWidth } = this.state

    if (width !== prevWidth) {
      this.setState({ width })
    }
  }

  // Changes state to playing, and calls any additional actions
  start = () => {
    const {
      playPauseButtons: { playAction },
    } = this.props
    const { playable } = this.state
    if (!playable) return
    if (playAction) {
      const { played, duration, progress } = this.state
      playAction(played.round(2), duration.round(2), progress.round(3))
    }
    this.setState({
      playing: true,
    })
    return
  }

  // Changes state to not playing, and calls any additional actions
  pause = () => {
    const {
      playPauseButtons: { pauseAction },
    } = this.props
    const { playable } = this.state
    if (!playable) return
    if (pauseAction) {
      const { played, duration, progress } = this.state
      pauseAction(played.round(2), duration.round(2), progress.round(3))
    }
    this.setState({
      playing: false,
    })
  }

  // Callback for rewind button. Rewind amount is preprogrammed by the customer
  rewind = () => {
    const {
      forwardBackButtons: { backAction, backAmount },
    } = this.props
    const { playable } = this.state
    if (!playable) return
    // Call additional actions
    if (backAction) backAction()
    // Seek in the audio player
    const { played, duration } = this.state
    // If rewinding would go negative or rewind is set to the beginning,
    // seek to 0. Else seek to the rewind
    if (played - backAmount > 0 && backAmount != 0) {
      const newProgress = (played - backAmount) / duration
      // Uses refs to tell the audio player to seek
      this.audioPlayer.seek(newProgress)
    } else {
      this.audioPlayer.seek(0)
    }
  }

  // Similar logic to rewind, except for skipping forward
  skip = () => {
    const {
      forwardBackButtons: { forwardAction, forwardAmount },
    } = this.props
    const { playable } = this.state
    if (!playable) return
    if (forwardAction) forwardAction()
    const { duration, played } = this.state
    if (played + forwardAmount < duration) {
      const newProgress = (played + forwardAmount) / duration
      this.audioPlayer.seek(newProgress)
    } else {
      this.audioPlayer.seek(1)
      this.setState({ playing: false })
    }
  }

  // Generalized seek method. Used by progressbar to seek to any place
  seek = newProgress => {
    // Uses refs to tell audio player to seek
    this.audioPlayer.seek(newProgress)
    // Update progress and played
    const { duration } = this.state
    const newPlayed = duration * newProgress
    this.setState({ played: newPlayed, progress: newProgress })
  }

  updateDuration = duration => {
    this.setState({ duration })
  }
  updateProgress = newProgress => {
    this.setState({ progress: newProgress })
  }
  updatePlayed = played => {
    this.setState({ played })
  }

  updatePlaying = bool => {
    this.setState({ playing: bool })
  }
  updatePlayable = bool => {
    this.setState({ playable: bool })
  }
  updatePrevProgress = newProgress => {
    this.setState({ prevProgress: newProgress })
  }

  endSong = () => {
    const { endAction } = this.props
    if (endAction) endAction()
  }

  // Declares ref to audio player component. Enables index.js to do playback
  // control on the audio player subcomponent
  ref = audioPlayer => {
    this.audioPlayer = audioPlayer
  }

  render() {
    const {
      artwork,
      title,
      titleColor,
      titleSize,
      subtitle,
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
    } = this.props
    const { width, track } = this.state

    // If the track URL isn't available, the audio player will crash native apps.
    // Display a simple message notifying the user of the problem, and prevent the
    // player from loading and crashing the app.
    // The URL is usually unavailable in the editor, which doesn't cause any harm, so
    // allow the audio player to load in that context.
    if (!editor && !track?.url) {
      return <Text>Unable to load audio player, audio track URL unavailable.</Text>
    }

    const artworkWidth = (width * artwork.artworkPercent) / 100
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
    if (this.props.styles) {
      dynamicStyles.title = {
        ...dynamicStyles.title,
        ...this.props.styles.title,
      }
      dynamicStyles.subtitle = {
        ...dynamicStyles.subtitle,
        ...this.props.styles.subtitle,
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
        onPress: this.start,
        iconSize: playPauseButtons.iconSize,
      },
      pauseButton: {
        name: playPauseButtons.pauseIconName,
        enabled: playPauseButtons.enabled,
        color: playPauseButtons.pauseColor,
        onPress: this.pause,
        iconSize: playPauseButtons.iconSize,
      },
      forwardButton: {
        name: forwardBackButtons.forwardIconName,
        enabled: forwardBackButtons.enableForward && forwardBackButtons.enabled,
        color: forwardBackButtons.forwardColor,
        onPress: this.skip,
        iconSize: forwardBackButtons.iconSize,
      },
      backButton: {
        name: forwardBackButtons.backIconName,
        enabled: forwardBackButtons.enableBack && forwardBackButtons.enabled,
        color: forwardBackButtons.backColor,
        onPress: this.rewind,
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
    const placeholderAlbumArt =
      'https://img.buzzfeed.com/buzzfeed-static/static/2020-03/5/23/enhanced/25a67c968a0a/enhanced-262-1583449224-1.png?downsize=900:*&output-format=auto&output-quality=auto'
    const showArtwork = artwork.showArtwork && artwork.enabled
    // A little redundant, but various if statements control for positioning
    // options chosen by customer.
    if (progressBar.position === 'aboveButtons') {
      return (
        <View onLayout={this.handleLayout}>
          {width !== null && (
            <View style={styles.wrapper}>
              {showArtwork ? (
                <Image
                  source={{ uri: artwork.artworkURL }}
                  style={dynamicStyles.artwork}
                  defaultSource={placeholderAlbumArt}
                />
              ) : null}
              {title != '' ? (
                <Text style={dynamicStyles.title}>{title}</Text>
              ) : null}
              {subtitle != '' ? (
                <Text style={dynamicStyles.subtitle}>{subtitle}</Text>
              ) : null}
              <AudioPlayerSub
                {...progressBar}
                played={this.state.played}
                duration={this.state.duration}
                progress={this.state.progress}
                prevProgress={this.state.prevProgress}
                playing={this.state.playing}
                track={this.state.track}
                seek={this.seek}
                ref={this.ref}
                updateProgress={this.updateProgress}
                updateDuration={this.updateDuration}
                updatePlayed={this.updatePlayed}
                updatePlaying={this.updatePlaying}
                updatePlayable={this.updatePlayable}
                updatePrevProgress={this.updatePrevProgress}
                width={width}
                autoplay={autoplay}
                editor={editor}
                endSong={this.endSong}
                _fonts={_fonts}
                active={active}
                topScreen={topScreen}
                keepPlaying={
                  typeof keepPlaying !== 'undefined' ? keepPlaying : true
                }
                key={`key.${JSON.stringify(track)}`}
              />
              <ControlScheme {...buttonConfig} {...this.state} />
            </View>
          )}
        </View>
      )
    } else if (progressBar.position === 'aboveTitle') {
      return (
        <View onLayout={this.handleLayout}>
          {width !== null && (
            <View style={styles.wrapper}>
              {showArtwork ? (
                <Image
                  source={{ uri: artwork.artworkURL }}
                  style={dynamicStyles.artwork}
                  defaultSource={placeholderAlbumArt}
                />
              ) : null}
              <AudioPlayerSub
                {...progressBar}
                played={this.state.played}
                duration={this.state.duration}
                progress={this.state.progress}
                prevProgress={this.state.prevProgress}
                playing={this.state.playing}
                track={this.state.track}
                seek={this.seek}
                ref={this.ref}
                updateProgress={this.updateProgress}
                updateDuration={this.updateDuration}
                updatePlayed={this.updatePlayed}
                updatePlaying={this.updatePlaying}
                updatePlayable={this.updatePlayable}
                updatePrevProgress={this.updatePrevProgress}
                width={width}
                autoplay={autoplay}
                editor={editor}
                endSong={this.endSong}
                _fonts={_fonts}
                active={active}
                topScreen={topScreen}
                keepPlaying={
                  typeof keepPlaying !== 'undefined' ? keepPlaying : true
                }
                key={`key.${JSON.stringify(track)}`}
              />
              {title != '' ? (
                <Text style={dynamicStyles.title}>{title}</Text>
              ) : null}
              {subtitle != '' ? (
                <Text style={dynamicStyles.subtitle}>{subtitle}</Text>
              ) : null}
              <ControlScheme {...buttonConfig} {...this.state} />
            </View>
          )}
        </View>
      )
    } else {
      return (
        <View onLayout={this.handleLayout}>
          {width !== null && (
            <View style={styles.wrapper}>
              {showArtwork ? (
                <Image
                  source={{ uri: artwork.artworkURL }}
                  style={dynamicStyles.artwork}
                  defaultSource={placeholderAlbumArt}
                />
              ) : null}
              {title != '' ? (
                <Text style={dynamicStyles.title}>{title}</Text>
              ) : null}
              {subtitle != '' ? (
                <Text style={dynamicStyles.subtitle}>{subtitle}</Text>
              ) : null}
              <ControlScheme {...buttonConfig} {...this.state} />
              <AudioPlayerSub
                {...progressBar}
                played={this.state.played}
                duration={this.state.duration}
                progress={this.state.progress}
                prevProgress={this.state.prevProgress}
                playing={this.state.playing}
                track={this.state.track}
                seek={this.seek}
                ref={this.ref}
                updateProgress={this.updateProgress}
                updateDuration={this.updateDuration}
                updatePlayed={this.updatePlayed}
                updatePlaying={this.updatePlaying}
                updatePlayable={this.updatePlayable}
                updatePrevProgress={this.updatePrevProgress}
                width={width}
                autoplay={autoplay}
                editor={editor}
                endSong={this.endSong}
                _fonts={_fonts}
                active={active}
                topScreen={topScreen}
                keepPlaying={
                  typeof keepPlaying !== 'undefined' ? keepPlaying : true
                }
                key={`key.${JSON.stringify(track)}`}
              />
            </View>
          )}
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default AudioPlayer
