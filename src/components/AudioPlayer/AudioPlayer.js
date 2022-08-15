import React, { useEffect, useMemo, useRef } from 'react'
import TrackPlayer, { State } from 'react-native-track-player'
import { v4 as uuid } from 'uuid'
import ProgressBar from './ProgressBar'

const MobileAudioPlayer = props => {
  const { active, progress, track, playing, autoplay, updatePlaying: updatePlayingProp, duration, updatePlayed, updateProgress, updatePrevProgress,
    topScreen,
    prevProgress,
    keepPlaying } = props

  const [switching, setSwitching]= useState(false)
  const [startSwitch, setStartSwitch]= useState(false)

  useEffect(async () => {
    await setUp()
  }, [])

  useMemo((nextProps) => {
    const changingScreens = !nextProps.active && active

    if (changingScreens) {
      const pausedTrack = playing && !nextProps.keepPlaying

      if (pausedTrack) {
        TrackPlayer.pause()
        updatePlaying(false)
        setStartSwitch(true)
      }

      updatePrevProgress(progress)
    }

    return true
  }, [active, playing])

  const didMountRef = useRef(false)

  useEffect(() => {
    if (didMountRef.current) {
      checkTrack(prevProps)

      const playerChange = prevProps.playing !== playing

      if (playerChange) {
        playing ? TrackPlayer.play() : TrackPlayer.pause()
      }
    } else {
      didMountRef.current = true
    }
  })

  const setUp = async () => {
    await preparePlayer()

    const playerState = await TrackPlayer.getState()

    if (playerState === State.Paused && autoplay) {
      await TrackPlayer.reset()
    }

    // Adds the specified song to the track player to be ready to play
    await TrackPlayer.add({
      id: uuid(),
      url: track.url,
      title: track.title,
      artist: track.subtitle,
      artwork: track.artwork,
    })

    // only play when track is ready
    let isReady = playerState === State.Ready
    while (!isReady) {
      isReady = playerState === State.Ready
    }

    if (playing || autoplay) {
      await TrackPlayer.play()
      updatePlaying(true)
    }

    // ensure play/pause button matches playing prop
    if (playerState === State.Playing && !playing) {
      updatePlaying(true)
    } else if (playerState === State.Paused && playing) {
      updatePlaying(false)
    }
  }

  // Generic seeking function used by index to handle skip and rewind.
  // Custom seeking is handled by ProgressBar on mobile
  const seek = newProgress => {
    const seekTime = newProgress * duration
    TrackPlayer.seekTo(seekTime)
  }

  /*
  Check if the track in TrackPlayer (oldTrack) is different
  than the track in props. This handles the case where a user
  switches to a screen where the component is already rendered
  (example: using the back button)
  */
  const checkTrack = async () => {
    const oldTrack = await TrackPlayer.getTrack(0)

    if (topScreen && !switching && oldTrack?.url !== track.url) {
      setSwitching(true)

      await TrackPlayer.reset()

      await TrackPlayer.add({
        id: uuid(),
        url: track.url,
        title: track.title,
        artist: track.subtitle,
        artwork: track.artwork,
      })

      await TrackPlayer.skipToNext()

      // prevents previous screen's audio playing on new screens' audio player
      if (keepPlaying) {
        await TrackPlayer.pause()
      }

      const playerState = await TrackPlayer.getState()

      // check that new track is ready before playing
      let isReady = playerState === State.Ready
      while (!isReady) {
        isReady = playerState === State.Ready
      }

      // reset prevProgress if already
      // else, revert to previous progress if returning to a previous screen
      if (Math.round(prevProgress * 100) / 100 === 1) {
        updatePrevProgress(0)
      } else if (prevProgress !== 0) {
        const newPlayedAmount = duration * prevProgress

        updatePlayed(newPlayedAmount)
        updateProgress(prevProgress)
        updatePrevProgress(0)

        await TrackPlayer.seekTo(newPlayedAmount)
      }

      // If player was already set to play, start playing
      if (playing || autoplay) {
        await TrackPlayer.play()
        updatePlaying(true)
      }

      setSwitching(false)
      setStartSwitch(false)
    }

    // ensure play/pause button matches playing prop
    if (!playing && playerState === State.Playing) {
      updatePlaying(true)
    } else if (playing && playerState === State.Paused) {
      updatePlaying(false)
    }
  }

  const updatePlaying = playing => {
    if (playing) {
      TrackPlayer.play()
      updatePlayingProp(true)
    } else {
      TrackPlayer.pause()
      updatePlayingProp(false)
    }
  }

  return (
    <ProgressBar
      {...props}
      switching={switching}
      startSwitch={startSwitch}
      updatePlaying={updatePlaying}
    />
  )
}

export default MobileAudioPlayer
