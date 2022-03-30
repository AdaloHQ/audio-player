import React, { Component } from 'react'
import TrackPlayer from 'react-native-track-player'
import { v4 as uuid } from 'uuid'
import ProgressBar from './ProgressBar'

class AudioPlayerSub extends Component {
  constructor(props) {
    super(props)
    this.state = { switching: false, startSwitch: false }

    // Sets up everything on react-native-track-player's end
    this.setup()
  }

  setup = async () => {
    await TrackPlayer.setupPlayer()

    console.log('TrackPlayer:', TrackPlayer)

    TrackPlayer.registerPlaybackService(() => require('./service'))

    TrackPlayer.updateOptions({
      // Whether the player should stop running when the app is closed on Android
      stopWithApp: true,
      // An array of media controls capabilities
      capabilities: [
        TrackPlayer.CAPABILITY_PLAY,
        TrackPlayer.CAPABILITY_PAUSE,
        TrackPlayer.CAPABILITY_SEEK_TO,
      ],
      // An array of capabilities that will show up when the notification is in the compact form on Android
      compactCapabilities: [
        TrackPlayer.CAPABILITY_PLAY,
        TrackPlayer.CAPABILITY_PAUSE,
      ],
    })

    const { track, playing, autoplay, updatePlaying } = this.props

    if (
      (await TrackPlayer.getState()) === TrackPlayer.STATE_PAUSED &&
      autoplay
    ) {
      await TrackPlayer.reset()
    }

    // Adds the specified song to the track player to be ready to play
    const id = uuid()

    await TrackPlayer.add({
      id,
      url: track.url,
      title: track.title,
      artist: track.subtitle,
      artwork: track.artwork,
    })

    // only play when track is ready
    let isReady = (await TrackPlayer.getState()) === TrackPlayer.STATE_READY
    while (!isReady) {
      isReady = (await TrackPlayer.getState()) === TrackPlayer.STATE_READY
    }

    // If player was already set to play or set to autoplay, start playing
    if (playing || autoplay) {
      await TrackPlayer.play()
      updatePlaying(true)
    }

    // ensure play/pause button matches playing prop
    let state = await TrackPlayer.getState()
    if (state === TrackPlayer.STATE_PLAYING && !playing) {
      updatePlaying(true)
    } else if (state === TrackPlayer.STATE_PAUSED && playing) {
      updatePlaying(false)
    }

    // clean out unnecessary tracks in TrackPlayer queue
    await TrackPlayer.getQueue().then(queue => {
      if (queue.length > 1) {
        TrackPlayer.remove(0)
      }
    })
  }

  // Generic seeking function used by index to handle skip and rewind.
  // Custom seeking is handled by ProgressBar on mobile
  seek = newProgress => {
    const { duration } = this.props
    const seekTime = newProgress * duration
    TrackPlayer.seekTo(seekTime)
  }

  checkTrack = async () => {
    /*
    Check if the track in TrackPlayer (oldTrack) is different
    than the track in props. This handles the case where a user
    switches to a screen where the component is already rendered
    (example: using the back button)
    */
    const {
      topScreen,
      track,
      playing,
      updatePlaying,
      prevProgress,
      duration,
      autoplay,
      keepPlaying,
    } = this.props

    const oldTrack = await TrackPlayer.getTrack(0)

    if (topScreen && !this.state.switching && oldTrack?.url !== track.url) {
      this.setState({ switching: true })

      const id = uuid()
      await TrackPlayer.add({
        id,
        url: track.url,
        title: track.title,
        artist: track.subtitle,
        artwork: track.artwork,
      })

      await TrackPlayer.skip(0)

      // prevents previous screen's audio playing on new screens' audio player
      if (keepPlaying) {
        await TrackPlayer.pause()
        this.setState({ playing: false })
      }

      //check that new track is ready before playing
      let isReady = (await TrackPlayer.getState()) === TrackPlayer.STATE_READY
      while (!isReady) {
        isReady = (await TrackPlayer.getState()) === TrackPlayer.STATE_READY
      }

      // reset prevProgress if already
      // else, revert to previous progress if returning to a previous screen
      if (Math.round(prevProgress * 100) / 100 === 1) {
        this.props.updatePrevProgress(0)
      } else if (prevProgress !== 0) {
        const { updatePlayed, updateProgress, updatePrevProgress } = this.props
        const newPlayed = duration * prevProgress
        updatePlayed(newPlayed)
        updateProgress(prevProgress)
        updatePrevProgress(0)
        await TrackPlayer.seekTo(newPlayed)
      }

      // If player was already set to play, start playing
      if (playing || autoplay) {
        await TrackPlayer.play()
        updatePlaying(true)
      }

      this.setState({ switching: false, startSwitch: false })
    }

    // ensure play/pause button matches playing prop
    let playerState = await TrackPlayer.getState()
    if (playerState === TrackPlayer.STATE_PLAYING && !playing) {
      updatePlaying(true)
    } else if (playerState === TrackPlayer.STATE_PAUSED && playing) {
      updatePlaying(false)
    }

    // clean out unnecessary tracks in TrackPlayer queue
    await TrackPlayer.getQueue().then(queue => {
      if (queue.length > 1) {
        TrackPlayer.remove(0)
      }
    })
  }

  shouldComponentUpdate(nextProps) {
    const {
      active,
      progress,
      playing,
      updatePrevProgress,
      updatePlaying,
    } = this.props

    // when changing screens
    if (active && !nextProps.active) {
      // pause track if needed
      if (playing && !nextProps.keepPlaying) {
        TrackPlayer.pause()
        updatePlaying(false)
        this.setState({ startSwitch: true })
      }
      updatePrevProgress(progress)
    }

    return true
  }

  // When props change
  componentDidUpdate(prevProps) {
    const { playing } = this.props

    this.checkTrack(prevProps)

    // Update play/pause if it changed
    if (prevProps.playing !== playing) {
      playing ? TrackPlayer.play() : TrackPlayer.pause()
    }
  }

  // Render Progress Bar
  render() {
    return (
      <ProgressBar
        {...this.props}
        switching={this.state.switching}
        startSwitch={this.state.startSwitch}
      />
    )
  }
}

export default AudioPlayerSub
