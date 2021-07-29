import React, { Component } from 'react'
import TrackPlayer, { getCurrentTrack } from 'react-native-track-player'
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

    TrackPlayer.registerPlaybackService(() => require('./service'))

    TrackPlayer.updateOptions({
      // Whether the player should stop running when the app is closed on Android
      stopWithApp: true,
      // An array of media controls capabilities
      // Can contain CAPABILITY_PLAY, CAPABILITY_PAUSE, CAPABILITY_STOP, CAPABILITY_SEEK_TO,
      // CAPABILITY_SKIP_TO_NEXT, CAPABILITY_SKIP_TO_PREVIOUS, CAPABILITY_SET_RATING
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

    const id = uuid()

    // Adds the specified song to the track player to be ready to play
    await TrackPlayer.add({
      // Every track needs a unique id, not really used anywhere here though
      id,
      url: track.url,
      title: track.title,
      artist: track.subtitle,
      artwork: track.artwork,
    })

    let isReady = (await TrackPlayer.getState()) === TrackPlayer.STATE_READY
    while (!isReady) {
      isReady = (await TrackPlayer.getState()) === TrackPlayer.STATE_READY
    }

    // If player was already set to play or set to autoplay, start playing
    if (playing || autoplay) {
      await TrackPlayer.play()
      this.setState({ startSwitch: false })
      updatePlaying(true)
    }

    // ensure play/pause button matches playing prop
    let state = await TrackPlayer.getState()
    if (state === TrackPlayer.STATE_PLAYING && !playing) {
      const { updatePlaying } = this.props
      updatePlaying(true)
    }

    // clean out unnecessary tracks in TrackPlayer queue
    await TrackPlayer.getQueue().then(queue => {
      if (queue.length > 1) {
        TrackPlayer.remove(queue[0].id)
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
    // checkTrack = async (prevProps) => {
    /*
    Check if the current track in TrackPlayer (oldTrack) is different
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
    } = this.props

    const id = await TrackPlayer.getCurrentTrack()
    const oldTrack = await TrackPlayer.getTrack(id)

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

      await TrackPlayer.skip(id)

      //check that new track is ready before playing
      let isReady = (await TrackPlayer.getState()) == TrackPlayer.STATE_READY
      while (!isReady) {
        isReady = (await TrackPlayer.getState()) == TrackPlayer.STATE_READY
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
        const abc = await TrackPlayer.seekTo(newPlayed)
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
    }

    // clean out unnecessary tracks in TrackPlayer queue
    await TrackPlayer.getQueue().then(queue => {
      if (queue.length > 1) {
        TrackPlayer.remove(queue[0].id)
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

    // pauses track when changing screens
    if (!nextProps.active && active !== nextProps.active && playing) {
      TrackPlayer.pause()
      updatePlaying(false)
      this.setState({ startSwitch: true })
      updatePrevProgress(progress)
    }

    return true
  }

  // When props change
  componentDidUpdate(prevProps) {
    const { playing } = this.props

    this.checkTrack(prevProps)

    // Update play/pause if it changed
    if (prevProps.playing != playing) {
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
