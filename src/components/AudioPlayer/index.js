import React, { Component } from 'react'
import { Text, View, Image, StyleSheet } from 'react-native'
import AudioPlayerSub from './AudioPlayer'
import ControlScheme from './ControlScheme'
import ProgressBar from './ProgressBar'

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
      playing: false,
      seeking: false,
      progress: 0,
      duration: 0,
      played: 0,
      playButton: {
        name: playPauseButtons.playIconName,
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
      track: {
        url,
        position: 0,
        duration: -1,
        title,
        subtitle,
        artwork: artwork.url,
      },
    }
  }

  start = () => {
    const {
      playPauseButtons: { playAction },
    } = this.props
    if (playAction) {
      playAction('test')
    }
    this.setState({
      playing: true,
    })
  }
  pause = () => {
    const {
      playPauseButtons: { pauseAction },
    } = this.props
    if (pauseAction) pauseAction()
    this.setState({
      playing: false,
    })
  }
  rewind = () => {
    const {
      forwardBackButtons: { backAction, backAmount },
    } = this.props
    // Call additional actions
    if (backAction) backAction()
    // Seek in the audio player
    const { played, duration } = this.state
    if (played - backAmount > 0 && backAmount != 0) {
      const newProgress = (played - backAmount) / duration
      this.audioPlayer.seek(newProgress)
    } else {
      this.audioPlayer.seek(0)
    }
  }
  skip = () => {
    const {
      forwardBackButtons: { forwardAction, forwardAmount },
    } = this.props
    if (forwardAction) forwardAction()
    const { duration, played } = this.state
    if (played + forwardAmount < duration) {
      const newProgress = (played + forwardAmount) / duration
      this.audioPlayer.seek(newProgress)
    }
  }
  seek = newProgress => {
    this.audioPlayer.seek(newProgress)
    const { duration } = this.state
    const newPlayed = duration * newProgress
    this.setState({ played: newPlayed, progress: newProgress })
  }
  updateDuration = duration => {
    this.setState({ duration })
  }
  updateProgress = progress => {
    this.setState({ played: progress.playedSeconds, progress: progress.played })
  }

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
          <ProgressBar
            {...progressBar}
            played={this.state.played}
            duration={this.state.duration}
            progress={this.state.progress}
            seek={this.seek}
          />
          <ControlScheme {...this.state} />
          <AudioPlayerSub
            ref={this.ref}
            track={this.state.track}
            playing={this.state.playing}
            updateProgress={this.updateProgress}
            updateDuration={this.updateDuration}
            duration={this.state.duration}
            played={this.state.played}
          />
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
          <ProgressBar
            {...progressBar}
            played={this.state.played}
            duration={this.state.duration}
            progress={this.state.progress}
            seek={this.seek}
          />
          {title != '' ? (
            <Text style={dynamicStyles.title}>{title}</Text>
          ) : null}
          {subtitle != '' ? (
            <Text style={dynamicStyles.subtitle}>{subtitle}</Text>
          ) : null}
          <ControlScheme {...this.state} />
          <AudioPlayerSub
            ref={this.ref}
            track={this.state.track}
            playing={this.state.playing}
            updateProgress={this.updateProgress}
            updateDuration={this.updateDuration}
            duration={this.state.duration}
            played={this.state.played}
          />
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
          <ProgressBar
            {...progressBar}
            played={this.state.played}
            duration={this.state.duration}
            progress={this.state.progress}
            seek={this.seek}
          />
          <AudioPlayerSub
            ref={this.ref}
            track={this.state.track}
            playing={this.state.playing}
            updateProgress={this.updateProgress}
            updateDuration={this.updateDuration}
            duration={this.state.duration}
            played={this.state.played}
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
