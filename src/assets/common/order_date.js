/**
 * 时间加0处理
 * @param n
 * @returns {string}
 */
function dblstring(n) {
  return n * 1 > 9 ? n : '0' + n
}

/**
 *
 * @param interval
 * @param type
 * type==1 全部日期
 * type==2 今日的0时
 * type=3 现在的时间
 * type=4 输出月份和日期
 * type=null 今日的日期
 * @returns {*}
 */
function nowdate(_date, type, interval = '-') {
  let date = new Date(_date)
  let nowdate =
    date.getFullYear() +
    interval +
    dblstring(date.getMonth() + 1) +
    interval +
    dblstring(date.getDate())
  if (type && type == 1) {
    return (
      nowdate +
      ' ' +
      dblstring(date.getHours()) +
      ':' +
      dblstring(date.getMinutes()) +
      ':' +
      dblstring(date.getSeconds())
    )
  } else if (type && type == 2) {
    return nowdate + ' ' + '00:00:00'
  } else if (type && type == 3) {
    return (
      dblstring(date.getHours()) +
      ':' +
      dblstring(date.getMinutes()) +
      ':' +
      dblstring(date.getSeconds())
    )
  } else if (type && type == 4) {
    return dblstring(date.getMonth() + 1) + interval + dblstring(date.getDate())
  } else {
    return nowdate
  }
}

/**
 * 返回星期几
 * @param date
 */
function getWeek(date) {
  let weekstr
  let day = new Date(date).getDay()
  switch (day) {
    case 0:
      weekstr = '周日'
      break
    case 1:
      weekstr = '周一'
      break
    case 2:
      weekstr = '周二'
      break
    case 3:
      weekstr = '周三'
      break
    case 4:
      weekstr = '周四'
      break
    case 5:
      weekstr = '周五'
      break
    case 6:
      weekstr = '周六'
      break
    default:
      weekstr = '^_^'
  }
  return weekstr
}

/**
 * 获取后几天的日期和星期
 * @param date
 * @param display_day
 * @returns {number}
 */

function getFourDay(display_day = 4) {
  let dic = {}
  let time_arr = [] //最后输出时间字符数组
  let nowdate_timer = new Date().getTime()
  let time_interval = 24 * 60 * 60 * 1000
  let date_dic = [4, 1, 1, 1, 1, 1, 4]
  let up = []
  for (var i = 1; i <= display_day; i++) {
    let date = nowdate_timer + time_interval * i
    let obj_time = {
      _date: nowdate(date, 4, '-'),
      date: nowdate(date, 0, '/'),
      week: getWeek(date)
    }
    time_arr.push(obj_time)
    up.push(date_dic['' + new Date(date).getDay()])
  }
  dic.date = time_arr
  dic.up = up
  return dic
}

export default getFourDay
