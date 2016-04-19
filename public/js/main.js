String.prototype.to_leaderboard_time = function () {
  var sec_num = parseInt(this, 10) / 1000;
  var minutes = Math.floor(sec_num / 60);
  var seconds = Math.floor(sec_num - (minutes * 60));
  var ms = Math.floor((sec_num - (minutes * 60) - seconds) * 100);

  if (minutes < 10) { minutes = "0" + minutes; }
  if (seconds < 10) { seconds = "0" + seconds; }
  if (ms < 10) { ms = "0" + ms;}
  var time = minutes + ':' + seconds + ':' + ms;
  return time;
}
