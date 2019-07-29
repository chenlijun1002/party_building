
// 计算两个日期差
export function dateGenJin(sDate1, sDate2) {
  let dateSpan, iDays, newDate1, newDate2
  // let ii = sDate1.charAt(sDate1.length - 2)
  if (sDate2 === undefined) { // 未定义就是计算到今天的时间差
    let date = (new Date()) // 当前时间
    let today = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() // 今天凌晨
    newDate1 = Date.parse(sDate1.split(' ')[0].replace(/-/g, '/')) // 计算日期差不要带后面的小时分钟秒
    dateSpan = newDate1 - today
  } else {
    newDate1 = Date.parse(sDate1.replace(/-/g, '/'))
    newDate2 = Date.parse(sDate2.replace(/-/g, '/'))
    // console.log(sDate1.replace(/-/g, '/'), sDate2.replace(/-/g, '/'))
    dateSpan = newDate1 - newDate2
  }
  dateSpan = Math.abs(dateSpan)
  iDays = Math.floor(dateSpan / (24 * 3600 * 1000))
  return iDays
}
let timeSign = 0
export function getTimeList(list, type) { //type 如果type为1就把timeSign置为0
  if (type === 1) {
    timeSign = 0
  }
  let handleListed = []
  if (list.length === 0) {
    return handleListed
  }
  for (let i = 0; i < list.length; i++) {
    // let time = Date.parse(list[i].create_date.split('.')[0].replace(/-/g, '/'))
    // let s = Math.abs((time - timeSign) / (1000 * 60))
    // if (s > 5) {
    //   let type = isYestdayOrbefore(new Date(list[i].create_date.split('.')[0].replace(/-/g, '/')))
    //   let params = {
    //     time: handlerDate(list[i].create_date.split('.')[0].replace(/-/g, '/'), type),
    //     sign: 2, // 2 中间时间类型
    //     date: list[i].create_date.split('.')[0].replace(/-/g, '/')
    //   }
    //   handleListed.push(params)
    //   timeSign = Date.parse(list[i].create_date.split('.')[0].replace(/-/g, '/'))
    // }
    Object.assign(list[i], {
      sign: 1
    }) // 普通类型
    handleListed.push(list[i])
  }
  return handleListed
}

function isYestdayOrbefore(theDate) {
  let date = (new Date()) // 当前时间
  let today = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() // 今天凌晨
  let yestday = new Date(today - 24 * 3600 * 1000).getTime()
  // let yestodaybefore = new Date(today - 24 * 3600 * 1000).getTime()
  if (theDate.getTime() < today && yestday <= theDate.getTime()) {
    return 1 // 昨天
  } else if (theDate.getTime() < yestday) {
    return 2 // 以前
  } else if ((date.getTime() - theDate.getTime()) / (1000 * 60) < 5) {
    return 3 // 刚刚
  } else {
    return 4 // 今天
  }
}

function handlerDate(date, type) {
  if (type === 4) {
    return date.substr(11, 5)
  } else if (type === 1) {
    return `昨天 ${date.substr(11, 5)}`
  } else if (type === 2) {
    return date.substr(0, 16)
  } else {
    return `刚刚`
  }
}

function handlerDate2(date, type) {
  if (type === 4) {
    return date.substr(11, 5)
  } else if (type === 1) {
    return `昨天 ${date.substr(11, 5)}`
  } else if (type === 2) {
    return date.substr(0, 16)
  } else {
    return date.substr(11, 5)
  }
}

/**
 * 处理历史消息时间方法
 * @param list 原始数据
 */
export function handlerHistoryNews(list) {
  let lastTime = 0
  for (let i = 0; i < list.length; i++) {
    let time = new Date(list[i].create_date.split('.')[0].replace(/-/g, '/')).getTime()
    if (time - lastTime > 60 * 1000 * 5) {
      lastTime = time

      let type = isYestdayOrbefore(new Date(list[i].create_date.split('.')[0].replace(/-/g, '/')))
      list[i].create_date = handlerDate2(list[i].create_date, type)
    } else {
      list[i].create_date = ''
    }
  }

  return list
}

export function perSortList(list) {
  let arr = []
  let hasarr = []
  for (let i = 0; i < list.length; i++) {
    if (list[i].deal_rate === undefined) {
      arr.push(list[i])
    } else {
      hasarr.push(list[i])
    }
  }

  hasarr.sort(function (a, b) {
    return b.deal_rate * 1 - a.deal_rate * 1
  })
  hasarr = hasarr.concat(arr)
  // console.log(list)
  return hasarr
}

export function dateSortList(list) {
  list.sort(function (a, b) {
    let last = Date.parse(new Date(a.last_see_date.split('.')[0].replace(/-/g, '/')))
    let now = Date.parse(new Date(b.last_see_date.split('.')[0].replace(/-/g, '/')))
    return now - last
  })
  // console.log(list)
  return list
}

export function newgenjinTime(list) {
  let arr = []
  let hasarr = []
  var day = 1000 * 60 * 60 * 24
  var nowTime = new Date().getTime();
  for (let i = 0; i < list.length; i++) {
    if (list[i].follow_up_date === undefined) {
      arr.push(list[i])
    } else {
      hasarr.push(list[i])
    }
  }

  hasarr.sort(function (a, b) {
    let last = Date.parse(new Date(a.follow_up_date.split('.')[0].replace(/-/g, '/')))
    let now = Date.parse(new Date(b.follow_up_date.split('.')[0].replace(/-/g, '/')))
    return now - last
  })
  hasarr = hasarr.concat(arr)
  return hasarr
}

export function genjinSortList(list) {
  let arr = []
  let hasarr = []
  for (let i = 0; i < list.length; i++) {
    if (list[i].follow_up_date === undefined) {
      arr.push(list[i])
    } else {
      hasarr.push(list[i])
    }
  }

  hasarr.sort(function (a, b) {
    let last = Date.parse(new Date(a.follow_up_date.split('.')[0].replace(/-/g, '/')))
    let now = Date.parse(new Date(b.follow_up_date.split('.')[0].replace(/-/g, '/')))
    return now - last
  })
  hasarr = hasarr.concat(arr)
  return hasarr
}

export function cloneObj(obj) {
  let str, newobj = obj.constructor === Array ? [] : {}
  if (typeof obj !== 'object') {
    return
  } else if (window.JSON) {
    str = JSON.stringify(obj) //序列化对象
    newobj = JSON.parse(str) //还原
  } else {
    for (let i in obj) {
      newobj[i] = typeof obj[i] === 'object' ? cloneObj(obj[i]) : obj[i]
    }
  }
  return newobj
}

export function setCookie(c_name, value, expiredays) {
  var exdate = new Date()
  exdate.setDate(exdate.getDate() + expiredays)
  document.cookie = c_name + "=" + escape(value) +
    ((expiredays === null) ? "" : ";expires=" + exdate.toGMTString())
}

//取回cookie
export function getCookie(c_name) {
  if (document.cookie.length > 0) {
    c_start = document.cookie.indexOf(c_name + "=")
    if (c_start != -1) {
      c_start = c_start + c_name.length + 1
      c_end = document.cookie.indexOf(";", c_start)
      if (c_end === -1) c_end = document.cookie.length
      return unescape(document.cookie.substring(c_start, c_end))
    }
  }
  return ""
}

export function getCommonCookie(sName) {
  var aCookie = document.cookie.split("; ");
  for (var i = 0; i < aCookie.length; i++) {
    var aCrumb = aCookie[i].split("=");
    if (sName == aCrumb[0])
      return unescape(aCrumb[1]);
  }
  return null;
}

export function checkImgType(value) {
  if (!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(value)) {
    return true;
  } else {
    return false;
  }
}

export function getDate(index) {
  let date = new Date(); //当前日期
  let newDate = new Date();
  newDate.setDate(date.getDate() + index); //官方文档上虽然说setDate参数是1-31,其实是可以设置负数的
  let month = newDate.getMonth() + 1 + ''
  if (month.length === 1) {
    month = '0' + month
  }
  let date2 = newDate.getDate() + ''
  if (date2.length === 1) {
    date2 = '0' + date2
  }
  let time = newDate.getFullYear() + "-" + month + "-" + date2;
  return time;
}

export function getVideoTime(t) {
  let tt = Math.ceil(t);
  let minute = 0
  let hour = 0
  let second = 0
  if (tt > 60) {
    minute = parseInt(tt / 60);
    second = parseInt(tt % 60);
    if (minute > 60) {
      hour = parseInt(minute / 60)
      minute = parseInt(minute % 60);
    }
  } else {
    second = tt
  }
  let newhour = hour
  if (hour < 10) hour = `0${hour}`
  if (minute < 10) minute = `0${minute}`
  if (second < 10) second = `0${second}`
  if (newhour !== 0) {
    return `${hour}:${minute}:${second}`
  } else {
    return `${minute}:${second}`
  }
}


export function showSelectDate(selectDateDom, minYear, minMonth, minDate, handler) {
  var selectDateDom = selectDateDom
  // var showDateDom = showDateDom
  var now = new Date();
  var nowYear = now.getFullYear();
  var nowMonth = now.getMonth() + 1;
  var nowDate = now.getDate();

  function formatYear(minYear) {
    var arr = [];
    for (var i = minYear; i <= minYear + 10; i++) {
      arr.push({
        id: i + '',
        value: i + '年'
      });
    }
    return arr;
  }

  function formatMonth(year) {
    var arr = [];
    if (year === nowYear + '') {
      for (let i = 1; i <= nowMonth; i++) {
        arr.push({
          id: i + '',
          value: i + '月'
        });
      }
      return arr
    }
    for (var i = 1; i <= 12; i++) {
      arr.push({
        id: i + '',
        value: i + '月'
      });
    }
    return arr;
  }

  function formatDate(year, month, count) {
    let arr = [];
    if (year === nowYear + '' && month === nowMonth + '') {
      for (let i = 1; i <= nowDate; i++) {
        arr.push({
          id: i + '',
          value: i + '日'
        });
      }
      return arr;
    }

    for (let i = 1; i <= count; i++) {
      arr.push({
        id: i + '',
        value: i + '日'
      });
    }
    return arr;
  }

  let yearData = function (callback) {
    callback(formatYear(nowYear - 10))
  }
  let monthData = function (year, callback) {
    callback(formatMonth(year));
  };
  let dateData = function (year, month, callback) {
    if (/^(1|3|5|7|8|10|12)$/.test(month)) {
      callback(formatDate(year, month, 31));
    } else if (/^(4|6|9|11)$/.test(month)) {
      callback(formatDate(year, month, 30));
    } else if (/^2$/.test(month)) {
      if (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0) {
        callback(formatDate(year, month, 29));
      } else {
        callback(formatDate(year, month, 28));
      }
    } else {
      throw new Error('month is illegal');
    }
  };
  selectDateDom.bind('click', function () {
    //        var oneLevelId = showDateDom.attr('data-year');
    //        var twoLevelId = showDateDom.attr('data-month');
    //        var threeLevelId = showDateDom.attr('data-date');
    var iosSelect = new IosSelect(3,
      [yearData, monthData, dateData], {
        title: '选择日期',
        itemHeight: 35,
        oneLevelId: new Date().getFullYear() + '',
        twoLevelId: new Date().getMonth() + 1 + '',
        threeLevelId: new Date().getDate() + '',
        showLoading: true,
        callback: function (selectOneObj, selectTwoObj, selectThreeObj) {
          // showDateDom.attr('data-year', selectOneObj.id);
          // showDateDom.attr('data-month', selectTwoObj.id);
          // showDateDom.attr('data-date', selectThreeObj.id);
          let month = selectTwoObj.value.split('月')[0]
          if (month.length === 1) {
            month = '0' + month
          }
          let date = selectThreeObj.value.split('日')[0]
          if (date.length === 1) {
            date = '0' + date
          }
          let obj = {
            year: selectOneObj.value.split('年')[0],
            month: month,
            date: date
          }
          // handler && handler(`${selectOneObj.value.split('年')[0]}-${month}-${date}`)
          handler && handler(obj)
        }
      });
  });
}
export function showYearMonth(selectDateDom, minYear, minMonth, minDate, handler) {
  var selectDateDom = selectDateDom
  var now = new Date();
  var nowYear = now.getFullYear();
  var nowMonth = now.getMonth() + 1;

  function formatYear(minYear) {
    var arr = [];
    for (var i = minYear; i <= minYear + 10; i++) {
      arr.push({
        id: i + '',
        value: i + '年'
      });
    }
    return arr;
  }

  function formatMonth(year) {
    var arr = []
    if (year === nowYear + '') {
      for (let i = 1; i <= nowMonth; i++) {
        arr.push({
          id: i + '',
          value: i + '月'
        })
      }
      return arr
    }
    for (var i = 1; i <= 12; i++) {
      arr.push({
        id: i + '',
        value: i + '月'
      })
    }
    return arr
  }
  let yearData = function (callback) {
    callback(formatYear(nowYear - 10))
  }
  let monthData = function (year, callback) {
    callback(formatMonth(year))
  }
  selectDateDom.bind('click', function () {
    //        var oneLevelId = showDateDom.attr('data-year');
    //        var twoLevelId = showDateDom.attr('data-month');
    //        var threeLevelId = showDateDom.attr('data-date');
    var iosSelect = new IosSelect(2,
      [yearData, monthData], {
        title: '选择日期',
        itemHeight: 35,
        oneLevelId: new Date().getFullYear() + '',
        twoLevelId: new Date().getMonth() + 1 + '',
        showLoading: true,
        callback: function (selectOneObj, selectTwoObj) {
          let month = selectTwoObj.value.split('月')[0]
          if (month.length === 1) {
            month = '0' + month
          }
          let obj = {
            year: selectOneObj.value.split('年')[0],
            month: month
          }
          // handler && handler(`${selectOneObj.value.split('年')[0]}-${month}-${date}`)
          handler && handler(obj)
        }
      })
  })
}
const HOST_URL = 'http://lr7api.hnyonyou.net/api'  // 线上站点域名
let URL = HOST_URL

if (process.env.NODE_ENV === 'development') {
  URL = '/api'
}
export { HOST_URL, URL }
export const BASE_URL = URL + '/r/radar'
export const BASE_URL2 = URL;

export const identify = getCommonCookie('Himall-ShopBranch') || 'SVcydkpqQjVVYXVzcUpCV0JiZ1I0UXZyNk5YWWZzcTB3QjlNVVhMbXVXZkZpM2I1S2wrbU9IYXcxTk80M3NveUs2ZlFNVXpLZSt1RzNUd1BiZ3pWdWc9PQ=='


