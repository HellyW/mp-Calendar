export class Calendar {
  constructor(year, month, day) {
    const currentDate = new Date()
    this.year = year || currentDate.getFullYear()
    this.month = month || currentDate.getMonth()
    this.day = day || currentDate.getDate()
  }
  getMonthDays(year, month) {
    // 获取本月的天数
    return (new Date(year || this.year, month || this.month, 0)).getDate()
  }
  getDayWeek(year, month, day) {
    return (new Date(year || this.year, month || this.month, day || this.day)).getDay()
  }
  getDisDate(dis, year, month, day) {
    return new Date(new Date().getTime() + dis * 24 * 60 * 60 * 1000)
  }
  getThisWeek(year, month, day) {
    const WEEK = this.getDayWeek(year, month, day)
    return [this.getDisDate(WEEK - 7 - 1), this.getDisDate(7 - WEEK - 1)]
  }
  getThisMonth(year, month, day) {
    const MONTH = this.getMonthDays(year, month)
    return [this.getDisDate((day || this.day) - MONTH), this.getDisDate(MONTH - (day || this.day))]
  }
  dateFormat(fmt, date = new Date(this.year, this.month, this.day)) {
    date = new Date(date)
    let ret;
    const opt = {
      "Y+": date.getFullYear().toString(), // 年
      "m+": (date.getMonth() + 1).toString(), // 月
      "d+": date.getDate().toString(), // 日
      "H+": date.getHours().toString(), // 时
      "M+": date.getMinutes().toString(), // 分
      "S+": date.getSeconds().toString() // 秒
      // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
      ret = new RegExp("(" + k + ")").exec(fmt);
      if (ret) {
        fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
      };
    };
    return fmt;
  }
}