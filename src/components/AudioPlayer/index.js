import React, { Component } from 'react'
import { Text, View, Image, StyleSheet } from 'react-native'
import AudioPlayerSub from './AudioPlayer'
import ControlScheme from './ControlScheme'

class AudioPlayer extends Component {
  constructor(props) {
    super(props)
    const {
      playPauseButtons,
      forwardBackButtons,
      leftRightButtons,
      url,
      title,
      subtitle,
      artwork,
    } = props
    this.state = {
      // Controls play/pause buttons, as well as playback
      playing: false,
      // Validity of url being played
      playable: true,
      // Proportion of song played (from 0 to 1)
      progress: 0,
      // Duration of song
      duration: 0,
      // Time played of song (in seconds)
      played: 0,
      // Styling options for each button
      playButton: {
        name: playPauseButtons.playIconName,
        // Both the overarching child component must be enabled,
        // as well as the enable for the specific button
        enabled: playPauseButtons.enablePlay && playPauseButtons.enabled,
        color: playPauseButtons.playColor,
        onPress: this.start,
      },
      pauseButton: {
        name: playPauseButtons.pauseIconName,
        enabled: playPauseButtons.enablePause && playPauseButtons.enabled,
        color: playPauseButtons.pauseColor,
        onPress: this.pause,
      },
      forwardButton: {
        name: forwardBackButtons.forwardIconName,
        enabled: forwardBackButtons.enableForward && forwardBackButtons.enabled,
        color: forwardBackButtons.forwardColor,
        onPress: this.skip,
      },
      backButton: {
        name: forwardBackButtons.backIconName,
        enabled: forwardBackButtons.enableBack && forwardBackButtons.enabled,
        color: forwardBackButtons.backColor,
        onPress: this.rewind,
      },
      leftButton: {
        name: leftRightButtons.leftIconName,
        enabled: leftRightButtons.enableLeft && leftRightButtons.enabled,
        color: leftRightButtons.leftColor,
        onPress: leftRightButtons.leftAction,
      },
      rightButton: {
        name: leftRightButtons.rightIconName,
        enabled: leftRightButtons.enableRight && leftRightButtons.enabled,
        color: leftRightButtons.rightColor,
        onPress: leftRightButtons.rightAction,
      },
      // Info for the specific song currently playing.
      track: {
        url,
        title,
        subtitle,
        artwork: artwork.artworkURL,
      },
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
      playAction()
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
    if (pauseAction) pauseAction()
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
    } else this.audioPlayer.seek(1)
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

  // Delcares ref to audio player component. Enables index to do playback
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
    } = this.props
    const dynamicStyles = {
      artwork: {
        width: artwork.width,
        height: artwork.height,
        borderRadius: artwork.artworkRounding,
      },
      title: {
        color: titleColor,
        fontSize: titleSize,
        padding: 4,
        textAlign: 'center',
      },
      subtitle: {
        color: subtitleColor,
        fontSize: subtitleSize,
        padding: 4,
        textAlign: 'center',
      },
    }
    // A little redundent, but various if statements control for positioning
    // options chosen by customer.
    if (progressBar.position == 'aboveButtons') {
      return (
        <View style={styles.wrapper}>
          {artwork.showArtwork ? (
            <Image
              source={{ uri: artwork.artworkURL }}
              style={dynamicStyles.artwork}
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
            playing={this.state.playing}
            track={this.state.track}
            seek={this.seek}
            ref={this.ref}
            updateProgress={this.updateProgress}
            updateDuration={this.updateDuration}
            updatePlayed={this.updatePlayed}
            updatePlaying={this.updatePlaying}
            updatePlayable={this.updatePlayable}
          />
          <ControlScheme {...this.state} />
        </View>
      )
    } else if (progressBar.position == 'aboveTitle') {
      return (
        <View style={styles.wrapper}>
          {artwork.showArtwork ? (
            <Image
              source={{ uri: artwork.artworkURL }}
              style={dynamicStyles.artwork}
            />
          ) : null}
          <AudioPlayerSub
            {...progressBar}
            played={this.state.played}
            duration={this.state.duration}
            progress={this.state.progress}
            playing={this.state.playing}
            track={this.state.track}
            seek={this.seek}
            ref={this.ref}
            updateProgress={this.updateProgress}
            updateDuration={this.updateDuration}
            updatePlayed={this.updatePlayed}
            updatePlaying={this.updatePlaying}
            updatePlayable={this.updatePlayable}
          />
          {title != '' ? (
            <Text style={dynamicStyles.title}>{title}</Text>
          ) : null}
          {subtitle != '' ? (
            <Text style={dynamicStyles.subtitle}>{subtitle}</Text>
          ) : null}
          <ControlScheme {...this.state} />
        </View>
      )
    } else {
      return (
        <View style={styles.wrapper}>
          {artwork.showArtwork ? (
            <Image
              source={{ uri: artwork.artworkURL }}
              style={dynamicStyles.artwork}
            />
          ) : null}
          {title != '' ? (
            <Text style={dynamicStyles.title}>{title}</Text>
          ) : null}
          {subtitle != '' ? (
            <Text style={dynamicStyles.subtitle}>{subtitle}</Text>
          ) : null}
          <ControlScheme {...this.state} />
          <AudioPlayerSub
            {...progressBar}
            played={this.state.played}
            duration={this.state.duration}
            progress={this.state.progress}
            playing={this.state.playing}
            track={this.state.track}
            seek={this.seek}
            ref={this.ref}
            updateProgress={this.updateProgress}
            updateDuration={this.updateDuration}
            updatePlayed={this.updatePlayed}
            updatePlaying={this.updatePlaying}
            updatePlayable={this.updatePlayable}
          />
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
