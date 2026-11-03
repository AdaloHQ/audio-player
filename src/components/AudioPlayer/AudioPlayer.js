import React, { Component } from 'react'
import TrackPlayer, { AppKilledPlaybackBehavior, State, Capability } from 'react-native-track-player'
import { v4 as uuid } from 'uuid'
import ProgressBar from './ProgressBar'

// How long to wait for a newly loaded track before giving up
const TRACK_READY_TIMEOUT_MS = 15000
const TRACK_READY_POLL_MS = 100

const isAlreadyInitializedError = err =>
  err?.code === 'player_already_initialized' ||
  /already been initialized/i.test(err?.message || '')

class AudioPlayerSub extends Component {
  constructor(props) {
    super(props)
    this.state = { switching: false, startSwitch: false }

    // Sets up everything on react-native-track-player's end
    // this.setup()
  }

  async componentDidMount() {
    await this.setup()
  }

  componentWillUnmount() {
    // Stops any pending load from starting playback after this instance is gone
    this.unmounted = true

    const { playing, keepPlaying, updatePlaying } = this.props

    if (playing && !keepPlaying) {
      TrackPlayer.pause().then(() => {
        updatePlaying(false)
      }).catch(err => {
        console.error('Error pausing track on unmount:', err)
      })
    }
  }

  /**
   *
   * @returns {Promise<import('react-native-track-player').PlaybackState>} The current state of the player
   */
  getPlaybackState = async () => {
    const playbackState = await TrackPlayer.getPlaybackState()

    if (playbackState.error) {
      console.error('playbackState', playbackState.error)
    }

    return playbackState.state
  }

  setup = async () => {
    // Set before the first await so checkTrack (run on every prop update)
    // doesn't load the same track in parallel while this one is in flight
    this.loadingTrack = true

    try {
      let initialized = true

      try {
        await TrackPlayer.setupPlayer()
      } catch (err) {
        // The player is a singleton, so it is already set up when another
        // Audio Player mounted earlier or when this one remounts because its
        // URL changed. Keep going so the new track still gets loaded.
        if (!isAlreadyInitializedError(err)) throw err
        initialized = false
      }

      if (initialized) {
        TrackPlayer.registerPlaybackService(() => require('./service'))

        TrackPlayer.updateOptions({
          // Whether the player should stop running when the app is closed on Android
          android: {
            appKilledPlaybackBehavior:
              AppKilledPlaybackBehavior.ContinuePlayback,
          },
          // An array of media controls capabilities
          capabilities: [Capability.Play, Capability.Pause, Capability.SeekTo],

          // An array of capabilities that will show up when the notification is in the compact form on Android
          compactCapabilities: [Capability.Play, Capability.Pause],
        })
      }

      const { topScreen, autoplay, updatePlaying } = this.props

      // A player on a screen below the top one must not replace the track
      // that is playing; checkTrack loads it once its screen is back on top
      if (topScreen === false) return

      if (!(await this.loadTrack())) return

      // This instance is new for every track, so start from a clean
      // play/pause state and only autoplay once the new track is ready
      if (autoplay) {
        await TrackPlayer.play()
        updatePlaying(true)
      } else {
        updatePlaying(false)
      }
    } finally {
      this.loadingTrack = false
    }
  }

  // Replaces the player's current track with the one in props and waits for
  // it to be ready. Resolves to false if it failed or timed out.
  loadTrack = async () => {
    const { track } = this.props

    // Paused first so load() neither resumes the previous track nor starts
    // the new one before the caller decides whether it should play
    await TrackPlayer.pause()
    await TrackPlayer.load({
      id: uuid(),
      url: track.url,
      title: track.title,
      artist: track.subtitle,
      artwork: track.artwork,
    })

    return this.waitForTrackReady()
  }

  waitForTrackReady = async () => {
    const startedAt = Date.now()

    while (Date.now() - startedAt < TRACK_READY_TIMEOUT_MS) {
      if (this.unmounted) return false

      const state = await this.getPlaybackState()

      if (
        state === State.Ready ||
        state === State.Playing ||
        state === State.Paused
      ) {
        return !this.unmounted
      }

      if (state === State.Error) return false

      await new Promise(resolve => setTimeout(resolve, TRACK_READY_POLL_MS))
    }

    console.error('Audio Player: timed out waiting for the track to load')

    return false
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
    } = this.props

    const oldTrack = await TrackPlayer.getActiveTrack()

    if (topScreen && !this.loadingTrack && oldTrack?.url !== track.url) {
      this.loadingTrack = true
      this.setState({ switching: true })

      try {
        // loadTrack pauses before loading, which also keeps the previous
        // screen's audio from playing on this screen's audio player
        if (await this.loadTrack()) {
          // reset prevProgress if already
          // else, revert to previous progress if returning to a previous screen
          if (Math.round(prevProgress * 100) / 100 === 1) {
            this.props.updatePrevProgress(0)
          } else if (prevProgress !== 0) {
            const {
              updatePlayed,
              updateProgress,
              updatePrevProgress,
            } = this.props
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
        }
      } finally {
        this.loadingTrack = false
        if (!this.unmounted) {
          this.setState({ switching: false, startSwitch: false })
        }
      }
    }

    // ensure play/pause button matches playing prop. Skipped while a track is
    // loading, since the player state is about to change.
    if (this.unmounted || this.loadingTrack) return
    let playerState = await this.getPlaybackState()
    if (this.unmounted || this.loadingTrack) return

    const { playing: isPlaying } = this.props
    if (playerState === State.Playing && !isPlaying) {
      updatePlaying(true)
    } else if (playerState === State.Paused && isPlaying) {
      updatePlaying(false)
    }
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

  updatePlaying = playing => {
    const { updatePlaying: updatePlayingProp } = this.props
    if (playing) {
      TrackPlayer.play()
      updatePlayingProp(true)
    } else {
      TrackPlayer.pause()
      updatePlayingProp(false)
    }
  }

  // Render Progress Bar
  render() {
    return (
      <ProgressBar
        {...this.props}
        switching={this.state.switching}
        startSwitch={this.state.startSwitch}
        updatePlaying={this.updatePlaying}
      />
    )
  }
}

export default AudioPlayerSub
