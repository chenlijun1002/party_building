var curr_chat_time
var history_chat_time = 0
export function reset() {
  curr_chat_time = new Date().getTime()
  history_chat_time = 0
}

function getShowTimeString(timer) {
  var chat_times = new Date(timer).getTime()
  var today_times = new Date(new Date().toLocaleDateString()).getTime() - 1
  var show_time
  if (
    today_times > chat_times &&
    today_times - chat_times < 24 * 60 * 60 * 1000
  ) {
    show_time =
      '昨天' +
      ' ' +
      timer.split(':')[0].split(' ')[1] +
      ':' +
      timer.split(':')[1]
  } else if (today_times > chat_times) {
    show_time = timer.split(':')[0] + ':' + timer.split(':')[1]
    // show_time = timer.split(" ")[0];
  } else {
    show_time = timer.split(':')[0].split(' ')[1] + ':' + timer.split(':')[1]
  }
  return show_time
}
export function getChatTimer(timer) {
  var chat_times = new Date(timer).getTime()
  var show_time = getShowTimeString(timer)
  if (chat_times > curr_chat_time) {
    if (chat_times - curr_chat_time < 60 * 2000) {
      curr_chat_time = chat_times
      show_time = ''
    }
  }
  curr_chat_time = chat_times
  return show_time
}
export function getHistoryTimer(timer) {
  timer = timer.replace(/-/g, '/')
  timer = timer.split('.')[0]
  var chat_times = new Date(timer).getTime()
  if (history_chat_time == 0) {
    history_chat_time = chat_times
    return getShowTimeString(timer)
  }
  if (history_chat_time - chat_times < 60 * 1000) {
    history_chat_time = chat_times
    return null
  }
  history_chat_time = chat_times
  return getShowTimeString(timer)
}
