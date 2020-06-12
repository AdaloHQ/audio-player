//service.js
// Used by the mobile version, might be unecessary but doesn't break anything.
module.exports = async function() {
  TrackPlayer.addEventListener('remote-play', () => TrackPlayer.play())
  TrackPlayer.addEventListener('remote-pause', () => TrackPlayer.pause())
}
