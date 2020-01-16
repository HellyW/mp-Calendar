// components/calendar.js
import { Calendar } from './utils/calendar'
Component({
  lifetimes:{
    attached(){
      this.initCalendar()
    }
  },
  attached(){
    this.initCalendar()
  },
  /**
   * 组件的属性列表
   */
  properties: {
    value:{
      type:Array,
      optionalTypes:[String,Object,Array]
    },
    format:{
      type: String,
      value: 'YYYY-mm-dd'
    },
    range:{
      type: Boolean,
      value: false
    },
    placeholder:{
      type: String,
      value:""
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    weeks:["日","一","二","三","四","五","六"],
    previewYear: 2019,
    previewMonth: 11,
    currentYear: 2019,
    currentMonth: 11,
    currentDay: 12,
    days:[],
    time: [],
    touchPosition:[],
    fadeInLeft:false,
    fadeInRight:false
  },

  observers:{
    // "time":function(){
    //   this.refreshCalendarDay()
    // }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _isSameDay(day,date){
      // 是否同一天
      if(!date || !day) return false
      date = new Date(date).toDateString()
      return new Date(this.data.previewYear,this.data.previewMonth,day).toDateString() === date
    },
    _isBetween(day,date1,date2){
      if(day===0) return false
      const date = new Date(new Date(this.data.previewYear,this.data.previewMonth,day).toDateString())
      date1 = new Date(new Date(date1).toDateString())
      date2 = new Date(new Date(date2).toDateString())
      return (date1<date&&date2>date) || (date2<date&&date1>date)
    },
    refreshCalendarDay(year=this.data.previewYear,month=this.data.previewMonth){
      // 根据年月  整理 days 数据
      // 更新当前显示日历年月信息
      this.setPreviewCalendar(year,month)
      // 本月天数
      const DAYS = this.calendar.getMonthDays(this.data.previewYear,this.data.previewMonth)
      const WEEK = this.calendar.getDayWeek(this.data.previewYear,this.data.previewMonth,1)
      let _days = []
      for(let i = 0 ; i < DAYS + WEEK; i++) _days.push({
        day: i < WEEK ? 0 : i - WEEK + 1,
        start: this._isSameDay(i < WEEK ? 0 : i - WEEK + 1, this.data.time[0]),
        end: this._isSameDay(i < WEEK ? 0 : i - WEEK + 1, this.data.time[1]),
        between: this._isBetween(i < WEEK ? 0 : i - WEEK + 1,this.data.time[0],this.data.time[1])
      })
      this.setData({
        days: _days
      })
    },
    setPreviewCalendar(year,month){
      // 设置当前显示的月份信息
      let self = this
      this.setData({
        previewYear: year || self.data.currentYear,
        previewMonth: month || self.data.currentMonth
      })
    },
    initCalendar(){
      // 初始化日历
      if(!this.calendar){
        this.calendar = new Calendar()
      }
      
      if(this.data.value && !(this.data.value instanceof Array)) this.data.value = [this.data.value]
      this.setData({
        currentYear: this.calendar.year,
        currentMonth: this.calendar.month,
        currentDay: this.calendar.day,
        time: this.data.value || (this.data.range ? [new Date(),new Date()] : [new Date()])
      })
      this.refreshCalendarDay(this.data.currentYear,this.data.currentMonth)
    },
    // 处理touch事件   判断左滑、右滑操作
    touchStartEvent(event){
      this.data.touchPosition = [event.touches[0]]
    },
    touchEndEvent(event){
      // console.log(event)
      let self = this
      this.data.touchPosition.push(event.changedTouches[0])
      let touchPosition = this.data.touchPosition
      // 只判断横向   即左滑还是右滑
      if(touchPosition[1].pageX - touchPosition[0].pageX > 30){
        // 向右滑   执行 月份 - 
        this.data.previewYear = this.data.previewMonth === 0 ? this.data.previewYear - 1 : this.data.previewYear
        this.data.previewMonth = this.data.previewMonth === 0 ? 11 : this.data.previewMonth - 1 
        this.setData({
          fadeInLeft: true,
          fadeInRight: false
        })
        this.refreshCalendarDay(this.data.previewYear,this.data.previewMonth)
      }else if(touchPosition[0].pageX - touchPosition[1].pageX > 30){
        // 向左滑   执行 月份 +
        this.data.previewYear = this.data.previewMonth === 11 ? this.data.previewYear + 1 : this.data.previewYear
        this.data.previewMonth = this.data.previewMonth === 11 ? 0 : this.data.previewMonth + 1 
        this.setData({
          fadeInLeft: false,
          fadeInRight: true
        })
        this.refreshCalendarDay(this.data.previewYear,this.data.previewMonth)
      }
      // 其余不管
      setTimeout(() => {
        self.setData({
          fadeInLeft: false,
          fadeInRight: false
        })
      }, 500);
      
    },
    // 点击单个事件
    tapDayEvent(event){
      let self = this
      if(!this.data.range || this.data.time.length >=2 ) this.data.time = []
      let dataset = event.currentTarget.dataset
      const _date = new Date(dataset.year,dataset.month,dataset.day)
      this.data.time.push(_date)
      this.setData({
        time: self.data.time
      })
      this.refreshCalendarDay()
    },
    confirmEvent(){
      if(this.data.time.length===0) return this.triggerEvent('error','请选择时间')
      if(this.data.range && this.data.time.length!==2) return this.triggerEvent('error','请选择一个时间段')
      if(this.data.range && (new Date(this.data.time[0])>new Date(this.data.time[1]))) this.data.time = [this.data.time[1],this.data.time[0]]
      let self = this
      this.triggerEvent('confirm',this.data.time.map(v=>{
        return self.calendar.dateFormat(self.data.format, v)
      }))
      // 
    },
    setThisWeek(){
      if(!this.data.range) return
      let self = this
      this.setData({
        time: self.calendar.getThisWeek()
      })
      this.refreshCalendarDay(this.data.currentYear,this.data.currentMonth)
    },
    setThisMonth(){
      if(!this.data.range) return
      let self = this
      this.setData({
        time:self.calendar.getThisMonth()
      })
      this.refreshCalendarDay(this.data.currentYear,this.data.currentMonth)
    }
  }
})
