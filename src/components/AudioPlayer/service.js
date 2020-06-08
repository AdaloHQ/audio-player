//service.js
module.exports = async function() {
  TrackPlayer.addEventListener('remote-play', () => TrackPlayer.play())
  TrackPlayer.addEventListener('remote-pause', () => TrackPlayer.pause())
}
