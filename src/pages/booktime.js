import React, { useEffect, useState } from 'react';
import { 
  SafeAreaView, ActivityIndicator, Platform, Dimensions, ScrollView, View, FlatList, Text, Image, TextInput, 
  TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet, Modal 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackActions } from '@react-navigation/native';
import { socket, logo_url } from '../../assets/info'
import { displayTime, resizePhoto } from 'geottuse-tools'

import { getLocationHours } from '../apis/locations'
import { getWorkers, getStylistInfo, getAllWorkersTime, logoutUser } from '../apis/owners'
import { getAppointmentInfo, salonChangeAppointment } from '../apis/schedules'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}

export default function Booktime(props) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const pushtime = 1000 * (60 * 15)

  const { scheduleid, serviceid, serviceinfo } = props.route.params

  const [clientInfo, setClientinfo] = useState({ id: -1, name: "" })
  const [name, setName] = useState()
  const [allStylists, setAllstylists] = useState({})
  const [hoursInfo, setHoursinfo] = useState({})
  const [oldTime, setOldtime] = useState(0)
  const [openTime, setOpentime] = useState({ hour: 0, minute: 0 })
  const [closeTime, setClosetime] = useState({ hour: 0, minute: 0 })
  const [selectedDateinfo, setSelecteddateinfo] = useState({ month: '', year: 0, day: '', date: 0, time: 0 })
  const [calendar, setCalendar] = useState({ firstDay: 0, numDays: 30, data: [
    { key: "day-row-0", row: [
        { key: "day-0-0", num: 0, passed: false }, { key: "day-0-1", num: 0, passed: false }, { key: "day-0-2", num: 0, passed: false }, 
        { key: "day-0-3", num: 0, passed: false }, { key: "day-0-4", num: 0, passed: false }, { key: "day-0-5", num: 0, passed: false }, 
        { key: "day-0-6", num: 0, passed: false }
      ]}, 
      { key: "day-row-1", row: [
        { key: "day-1-0", num: 0, passed: false }, { key: "day-1-1", num: 0, passed: false }, { key: "day-1-2", num: 0, passed: false }, 
        { key: "day-1-3", num: 0, passed: false }, { key: "day-1-4", num: 0, passed: false }, { key: "day-1-5", num: 0, passed: false }, 
        { key: "day-1-6", num: 0, passed: false }
      ]}, 
      { key: "day-row-2", row: [
        { key: "day-2-0", num: 0, passed: false }, { key: "day-2-1", num: 0, passed: false }, { key: "day-2-2", num: 0, passed: false }, 
        { key: "day-2-3", num: 0, passed: false }, { key: "day-2-4", num: 0, passed: false }, { key: "day-2-5", num: 0, passed: false }, 
        { key: "day-2-6", num: 0, passed: false }
      ]}, 
      { key: "day-row-3", row: [
        { key: "day-3-0", num: 0, passed: false }, { key: "day-3-1", num: 0, passed: false }, { key: "day-3-2", num: 0, passed: false }, 
        { key: "day-3-3", num: 0, passed: false }, { key: "day-3-4", num: 0, passed: false }, { key: "day-3-5", num: 0, passed: false }, 
        { key: "day-3-6", num: 0, passed: false }
      ]}, 
      { key: "day-row-4", row: [
        { key: "day-4-0", num: 0, passed: false }, { key: "day-4-1", num: 0, passed: false }, { key: "day-4-2", num: 0, passed: false }, 
        { key: "day-4-3", num: 0, passed: false }, { key: "day-4-4", num: 0, passed: false }, { key: "day-4-5", num: 0, passed: false }, 
        { key: "day-4-6", num: 0, passed: false }
      ]}, 
      { key: "day-row-5", row: [
        { key: "day-5-0", num: 0, passed: false }, { key: "day-5-1", num: 0, passed: false }, { key: "day-5-2", num: 0, passed: false }, 
        { key: "day-5-3", num: 0, passed: false }, { key: "day-5-4", num: 0, passed: false }, { key: "day-5-5", num: 0, passed: false }, 
        { key: "day-5-6", num: 0, passed: false }
      ]}
  ], loading: false, errorMsg: "" })
  const [times, setTimes] = useState([])
  const [selectedStylistinfo, setSelectedstylistinfo] = useState({ worker: null, workers: [], numWorkers: 0, loading: false })
  const [scheduledInfo, setScheduledinfo] = useState({ scheduledIds: {}, scheduledWorkers: {} })
  const [loaded, setLoaded] = useState(false)
  const [step, setStep] = useState(0)

  const [confirm, setConfirm] = useState({ show: false, service: "", time: 0, workerIds: [], note: "", requested: false, errormsg: "" })

  const getTheAppointmentInfo = () => {
    getAppointmentInfo(scheduleid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { client, locationId, name, time, worker } = res

          const { day, month, date, year, hour, minute } = time
          const unixtime = Date.parse(day + " " + month + " " + date + " " + year + " " + hour + ":" + minute)

          setClientinfo({ ...clientInfo, ...client })
          setName(name)
          setOldtime(unixtime)
          setSelectedstylistinfo(prev => ({ ...prev, worker }))
          getTheLocationHours(unixtime)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getCalendar = (month, year) => {
    setCalendar({ ...calendar, loading: true })

    let currTime = new Date(), currDate = 0, currDay = ''
    let datenow = Date.parse(days[currTime.getDay()] + " " + months[currTime.getMonth()] + " " + currTime.getDate() + " " + year)
    let firstDay = (new Date(year, month)).getDay(), numDays = 32 - new Date(year, month, 32).getDate(), daynum = 1
    let data = calendar.data, datetime = 0, hourInfo, timeNow, hourNow = currTime.getHours(), minuteNow = currTime.getMinutes()
    let current, now

    data.forEach(function (info, rowindex) {
      info.row.forEach(function (day, dayindex) {
        day.num = 0
        day.noservice = false

        if (rowindex == 0) {
          if (dayindex >= firstDay) {
            datetime = Date.parse(days[dayindex] + " " + months[month] + " " + daynum + " " + year)

            day.passed = datenow > datetime

            day.noservice = selectedStylistinfo.worker != null ? 
              !(days[dayindex].substr(0, 3) in selectedStylistinfo.worker.days)
              :
              !(days[dayindex].substr(0, 3) in allStylists)
            
            day.num = daynum
            daynum++
          }
        } else if (daynum <= numDays) {
          datetime = Date.parse(days[dayindex] + " " + months[month] + " " + daynum + " " + year)

          day.passed = datenow > datetime

          day.noservice = selectedStylistinfo.worker != null ? 
            !(days[dayindex].substr(0, 3) in selectedStylistinfo.worker.days)
            :
            !(days[dayindex].substr(0, 3) in allStylists)
          
          day.num = daynum
          daynum++
        }

        if (day.num > 0 && (!day.passed && !day.noservice) && currDate == 0) {
          currDay = days[dayindex].substr(0, 3)

          if (currDay in hoursInfo) {
            hourInfo = hoursInfo[currDay]

            current = Date.parse(days[dayindex] + " " + months[month] + ", " + day.num + " " + year + " " + hourInfo["closeHour"] + ":" + hourInfo["closeMinute"])
            now = Date.parse(days[currTime.getDay()] + " " + months[currTime.getMonth()] + ", " + currTime.getDate() + " " + currTime.getFullYear() + " " + currTime.getHours() + ":" + currTime.getMinutes())

            if (now < current) {
              currDate = day.num
            } else {
              day.passed = true
            }
          } else {
            day.noservice = true
          }
        }
      })
    })

    setCalendar({ ...calendar, firstDay, numDays, data, loading: false })

    return { currDate, currDay }
  }
  const getTimes = () => {
    const { month, day, date, year } = selectedDateinfo
    let start = day in allStylists ? allStylists[day][0]["start"] : openTime.hour + ":" + openTime.minute
    let end = day in allStylists ? allStylists[day][0]["end"] : closeTime.hour + ":" + closeTime.minute
    let openStr = month + " " + date + ", " + year + " " + start
    let closeStr = month + " " + date + ", " + year + " " + end
    let openDateStr = Date.parse(openStr), closeDateStr = Date.parse(closeStr), calcDateStr = openDateStr
    let currenttime = Date.now(), newTimes = [], timesRow = [], timesNum = 0, firstTime = true

    while (calcDateStr < (closeDateStr - pushtime)) {
      calcDateStr += pushtime

      let timestr = new Date(calcDateStr)
      let hour = timestr.getHours()
      let minute = timestr.getMinutes()
      let period = hour < 12 ? "am" : "pm"

      let timedisplay = (
        hour <= 12 ? 
          (hour == 0 ? 12 : hour) 
          : 
          hour - 12
        ) 
        + ":" + 
        (minute < 10 ? '0' + minute : minute) + " " + period

      let timepassed = currenttime > calcDateStr
      let timetaken = JSON.stringify(scheduledInfo.scheduledIds).includes(calcDateStr.toString())
      let availableService = false, workerIds = []

      if (selectedStylistinfo.worker != null && day.substr(0, 3) in selectedStylistinfo.worker.days) {
        let startTime = selectedStylistinfo.worker.days[day.substr(0, 3)]["start"]
        let endTime = selectedStylistinfo.worker.days[day.substr(0, 3)]["end"]

        if (
          calcDateStr >= Date.parse(openStr.substring(0, openStr.length - 5) + startTime) 
          && 
          calcDateStr <= Date.parse(closeStr.substring(0, closeStr.length - 5) + endTime)
        ) {
          availableService = true
          workerIds = [selectedStylistinfo.worker.days[day.substr(0, 3)]["workerId"]]
        }
      } else {
        if (day.substr(0, 3) in allStylists) {
          let times = allStylists[day.substr(0, 3)]
          let startTime = "", endTime = ""

          times.forEach(function (info) {
            startTime = info.start
            endTime = info.end

            if (
              calcDateStr >= Date.parse(openStr.substring(0, openStr.length - 5) + startTime) 
              && 
              calcDateStr <= Date.parse(closeStr.substring(0, closeStr.length - 5) + endTime)
            ) {              
              availableService = true
              workerIds.push(info.workerId)
            }
          })
        }
      }

      if (!timepassed && !timetaken && availableService == true) {
        timesRow.push({
          key: timesNum.toString(), header: timedisplay, 
          time: calcDateStr, workerIds
        })
        timesNum++

        if (timesRow.length == 3) {
          newTimes.push({ key: newTimes.length, row: timesRow })
          timesRow = []
        }
      }
    }

    if (timesRow.length > 0) {
      for (let k = 0; k < (3 - timesRow.length); k++) {
        timesRow.push({ key: timesNum.toString() })
      }

      newTimes.push({ key: newTimes.length, row: timesRow })
    }

    setTimes(newTimes)
  }
  const getTheLocationHours = async(time) => {
    const locationid = await AsyncStorage.getItem("locationid")
    const day = selectedDateinfo.day ? selectedDateinfo.day : new Date(Date.now()).toString().split(" ")[0]

    getLocationHours(locationid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { hours } = res
          const timeInfo = hours[day.substr(0, 3)]

          let openHour = timeInfo["openHour"], openMinute = timeInfo["openMinute"], openPeriod = timeInfo["openPeriod"]
          let closeHour = timeInfo["closeHour"], closeMinute = timeInfo["closeMinute"], closePeriod = timeInfo["closePeriod"]

          let selectedTime = new Date(time)
          let selectedDay = null, selectedDate = null, selectedMonth = null

          selectedDay = days[selectedTime.getDay()]
          selectedDate = selectedTime.getDate()
          selectedMonth = months[selectedTime.getMonth()]

          getCalendar(selectedTime.getMonth(), selectedTime.getFullYear())
          setSelecteddateinfo({ ...selectedDateinfo, month: selectedMonth, year: selectedTime.getFullYear(), day: selectedDay.substr(0, 3), date: selectedDate, time })
          setHoursinfo(hours)
          setOpentime({ ...openTime, hour: openHour, minute: openMinute })
          setClosetime({ ...closeTime, hour: closeHour, minute: closeMinute })
          setLoaded(true)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getTheWorkers = async() => {
    const locationid = await AsyncStorage.getItem("locationid")

    getWorkers(locationid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setSelectedstylistinfo(prev => ({ ...prev, workers: res.owners, numWorkers: res.numWorkers, loading: false }))
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getAllTheWorkersTime = async() => {
    const locationid = await AsyncStorage.getItem("locationid")

    getAllWorkersTime(locationid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setAllstylists(res.workers)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getScheduledAppointments = async() => {
    const locationid = await AsyncStorage.getItem("locationid")
    const { day, month, date, year } = selectedDateinfo
    let jsonDate = { day, month, date, year }
    const data = { locationid, jsonDate }

    getDayHours(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .thne((res) => {
        if (res) {

        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const selectStylist = id => {
    setSelectedstylistinfo({ ...selectedStylistinfo, loading: true })

    getStylistInfo(id)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          selectedStylistinfo.workers.forEach(function (item) {
            item.row.forEach(function (worker) {
              if (worker.id == id) {
                let workerinfo = {...worker, days: res.days }

                setSelectedstylistinfo({ ...selectedStylistinfo, show: false, worker: workerinfo, loading: false })
              }
            })
          })
        }
      })
  }
  const dateNavigate = (dir) => {
    setLoaded(false)

    const currTime = new Date(Date.now())
    const currDay = days[currTime.getDay()]
    const currMonth = months[currTime.getMonth()]

    let month = months.indexOf(selectedDateinfo.month), year = selectedDateinfo.year

    month = dir == 'left' ? month - 1 : month + 1

    if (month < 0) {
      month = 11
      year--
    } else if (month > 11) {
      month = 0
      year++
    }

    let { currDate } = getCalendar(month, year)

    setSelecteddateinfo({ ...selectedDateinfo, month: months[month], date: currDate, year })
    setLoaded(true)
  }
  const selectDate = async(date) => {
    const { month, year } = selectedDateinfo

    let openStr = month + " " + date + ", " + year + " " + openTime.hour + ":" + openTime.minute
    let closeStr = month + " " + date + ", " + year + " " + closeTime.hour + ":" + closeTime.minute
    let openDateStr = Date.parse(openStr), day = new Date(openDateStr).toString().split(" ")[0]

    setSelecteddateinfo({ ...selectedDateinfo, date, day: day.substr(0, 3) })
    getAllTheWorkersTime()
  }
  const selectTime = (name, timeheader, time, workerIds) => {
    const { month, date, year } = selectedDateinfo

    setSelecteddateinfo({ ...selectedDateinfo, name, time })
    setConfirm({ ...confirm, show: true, service: name ? name : serviceinfo, time, workerIds })
  }
  const salonChangeTheAppointment = async() => {
    const locationid = await AsyncStorage.getItem("locationid")

    setConfirm({ ...confirm, loading: true })

    const { time } = selectedDateinfo
    const { worker } = selectedStylistinfo
    const { note, workerIds } = confirm
    const selectedinfo = new Date(time)
    const day = days[selectedinfo.getDay()], month = months[selectedinfo.getMonth()], date = selectedinfo.getDate(), year = selectedinfo.getFullYear()
    const hour = selectedinfo.getHours(), minute = selectedinfo.getMinutes()
    const selecteddate = JSON.stringify({ day, month, date, year, hour, minute })
    let data = { 
      id: scheduleid, // id for socket purpose (updating)
      clientid: clientInfo.id, 
      workerid: worker != null ? worker.id : workerIds[Math.floor(Math.random() * (workerIds.length - 1)) + 0], 
      locationid, 
      serviceid: serviceid ? serviceid : -1, 
      serviceinfo: serviceinfo ? serviceinfo : "",
      time: selecteddate, note: note ? note : "", 
      type: "salonChangeAppointment",
      timeDisplay: displayTime({ day, month, date, year, hour, minute })
    }

    salonChangeAppointment(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          data = { ...data, receiver: res.receiver, time }
          socket.emit("socket/salonChangeAppointment", data, () => {
            setConfirm({ ...confirm, requested: true, loading: false })

            setTimeout(function () {
              setConfirm({ ...confirm, show: false, requested: false })

              setTimeout(function () {
                props.navigation.dispatch(StackActions.replace("main"))
              }, 1000)
            }, 2000)
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data

          setConfirm({ ...confirm, errorMsg: errormsg })
        }
    })
  }

  const logout = async() => {
    const ownerid = await AsyncStorage.getItem("ownerid")

    logoutUser(ownerid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          socket.emit("socket/business/logout", ownerid, () => {
            AsyncStorage.clear()

            props.navigation.dispatch(StackActions.replace('auth'))
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })  
  }

  useEffect(() => {
    getTheWorkers()
    getAllTheWorkersTime()
    getTheAppointmentInfo()
  }, [])

  return (
    <SafeAreaView style={styles.booktime}>
      <View style={styles.box}>
        <View style={styles.header}>
          <Text style={styles.serviceHeader}>
            <Text style={{ fontSize: wsize(5) }}>for </Text>
            {name ? name : serviceinfo}
          </Text>
        </View>

        {loaded ? 
          <>
            {step == 0 && (
              <View style={styles.workerSelection}>
                <Text style={styles.workerSelectionHeader}>Pick a stylist (Optional)</Text>

                <View style={styles.workersList}>
                  <FlatList
                    data={selectedStylistinfo.workers}
                    renderItem={({ item, index }) => 
                      <View key={item.key} style={styles.workersRow}>
                        {item.row.map(info => (
                          info.id ? 
                            <TouchableOpacity key={info.key} style={[styles.worker, { backgroundColor: (selectedStylistinfo.worker && selectedStylistinfo.worker.id == info.id) ? 'rgba(0, 0, 0, 0.3)' : null }]} disabled={selectedStylistinfo.loading} onPress={() => selectStylist(info.id)}>
                              <View style={styles.workerProfile}>
                                <Image 
                                  source={info.profile.name ? { uri: logo_url + info.profile.name } : require("../../assets/profilepicture.jpeg")} 
                                  style={resizePhoto(info.profile, wsize(20))}
                                />
                              </View>

                              <Text style={styles.workerHeader}>{info.username}</Text>
                            </TouchableOpacity>
                            :
                            <View key={info.key} style={styles.worker}></View>
                        ))}
                      </View>
                    }
                  />
                </View>
                {selectedStylistinfo.worker != null && (
                  <View style={styles.chooseWorkerActions}>
                    <TouchableOpacity style={styles.chooseWorkerAction} onPress={() => {
                      setSelectedstylistinfo({ ...selectedStylistinfo, worker: null })
                      getAllTheWorkersTime()
                    }}>
                       <Text style={styles.chooseWorkerActionHeader}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {step == 1 && (
              <View style={styles.dateSelection}>
                <Text style={styles.dateSelectionHeader}>Tap a date below</Text>

                {!calendar.loading && (
                  <>
                    <View style={styles.dateHeaders}>
                      <View style={styles.column}>
                       <TouchableOpacity onPress={() => dateNavigate('left')}><AntDesign name="left" size={wsize(7)}/></TouchableOpacity>
                      </View>
                      <View style={styles.column}>
                       <Text style={styles.dateHeader}>{selectedDateinfo.month}, {selectedDateinfo.year}</Text>
                      </View>
                      <View style={styles.column}>
                       <TouchableOpacity onPress={() => dateNavigate('right')}><AntDesign name="right" size={wsize(7)}/></TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.days}>
                      <View style={styles.daysHeaderRow}>
                        {days.map((day, index) => <Text key={"day-header-" + index} style={styles.daysHeader}>{day.substr(0, 3)}</Text>)}
                      </View>
                      {calendar.data.map((info, rowindex) => (
                        <View key={info.key} style={styles.daysDataRow}>
                          {info.row.map((day, dayindex) => (
                            day.num > 0 ?
                              day.passed || day.noservice ? 
                                day.passed ? 
                                  <TouchableOpacity key={day.key} disabled={true} style={[styles.dayTouch, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
                                    <Text style={styles.dayTouchHeader}>{day.num}</Text>
                                  </TouchableOpacity>
                                  :
                                  <TouchableOpacity key={day.key} disabled={true} style={[styles.dayTouch, { backgroundColor: 'rgba(0, 0, 0, 0.1)' }]}>
                                    <Text style={styles.dayTouchHeader}>{day.num}</Text>
                                  </TouchableOpacity>
                                :
                                selectedDateinfo.date == day.num ?
                                  <TouchableOpacity key={day.key} style={[styles.dayTouch, { backgroundColor: 'black' }]} onPress={() => {
                                    if (selectedStylistinfo.worker != null) {
                                      selectStylist(selectedStylistinfo.worker.id)
                                    } else {
                                      getAllTheWorkersTime()
                                    }

                                    selectDate(day.num)
                                  }}>
                                    <Text style={[styles.dayTouchHeader, { color: 'white' }]}>{day.num}</Text>
                                  </TouchableOpacity>
                                  :
                                  <TouchableOpacity key={day.key} style={styles.dayTouch} onPress={() => {
                                    if (selectedStylistinfo.worker != null) {
                                      selectStylist(selectedStylistinfo.worker.id)
                                    } else {
                                      getAllTheWorkersTime()
                                    }

                                    selectDate(day.num)
                                  }}>
                                    <Text style={styles.dayTouchHeader}>{day.num}</Text>
                                  </TouchableOpacity>
                              :
                              <View key={"calender-header-" + rowindex + "-" + dayindex} style={styles.dayTouchDisabled}></View>
                          ))}
                        </View>
                      ))}
                    </View>
                    <Text style={styles.errorMsg}>{calendar.errorMsg}</Text>
                  </>
                )}
              </View>
            )}

            {step == 2 && (
              <View style={styles.timesSelection}>
                <ScrollView style={{ width: '100%' }}>
                  <Text style={styles.timesHeader}>Tap a time below</Text>

                  <View style={{ alignItems: 'center' }}>
                    <View style={styles.times}>
                      {times.map(info => (
                        <View key={info.key} style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                          {info.row.map(item => (
                            item.header ? 
                              <TouchableOpacity key={item.key} style={styles.unselect} onPress={() => selectTime(name, item.header, item.time, item.workerIds)}>
                                <Text style={styles.unselectHeader}>{item.header}</Text>
                              </TouchableOpacity>
                              :
                              <View key={item.key} style={[styles.unselect, { borderColor: 'transparent' }]}></View>
                          ))}
                        </View>
                      ))}
                    </View>
                  </View>
                </ScrollView>
              </View>
            )}

            <View style={styles.actions}>
              {step > 0 && (
                <TouchableOpacity style={styles.action} onPress={() => {
                  if (selectedStylistinfo.worker != null) {
                    selectStylist(selectedStylistinfo.worker.id)
                  } else {
                    getAllTheWorkersTime()
                  }

                  setStep(step - 1)
                }}>
                  <Text style={styles.actionHeader}>Back</Text>
                </TouchableOpacity>
              )}

              {step < 2 && (
                <TouchableOpacity style={styles.action} onPress={() => {
                  switch (step) {
                    case 0:
                      if (selectedStylistinfo.worker != null) {
                        selectStylist(selectedStylistinfo.worker.id)
                      }

                      getTheLocationHours(oldTime)

                      setStep(1)

                      break;
                    case 1:
                      if (selectedDateinfo.date > 0) {
                        setStep(2)
                        getTimes()
                      } else {
                        setCalendar({ ...calendar, errorMsg: "Please tap on a day" })
                      }

                      break
                    default:
                      setStep(step + 1)
                  }
                }}>
                  <Text style={styles.actionHeader}>Next</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
          :
          <View style={{ alignItems: 'center', flexDirection: 'column', height: '80%', justifyContent: 'space-around' }}>
            <ActivityIndicator color="black" size="small"/>
          </View>
        }

        <View style={styles.bottomNavs}>
          <View style={styles.bottomNavsRow}>
            <View style={styles.column}>
              <TouchableOpacity style={styles.bottomNav} onPress={() => props.navigation.navigate("settings", { refetch: () => getTheLocationProfile()})}>
                <AntDesign name="setting" size={wsize(7)}/>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.bottomNavButton} onPress={() => {
              AsyncStorage.clearItem("locationid")
              AsyncStorage.clearItem("locationtype")
              AsyncStorage.setItem("phase", "list")

              props.navigation.dispatch(StackActions.replace('list'));
            }}>
              <Text style={styles.bottomNavButtonHeader}>Switch Business</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.bottomNavButton} onPress={() => props.navigation.navigate("menu", { refetch: () => getTheLocationProfile()})}>
              <Text style={styles.bottomNavButtonHeader}>Edit Menu</Text>
            </TouchableOpacity>

            <View style={styles.column}>
              <TouchableOpacity style={styles.bottomNav} onPress={() => logout()}>
                <Text style={styles.bottomNavHeader}>Log-Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {confirm.show && (
        <Modal transparent={true}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <SafeAreaView style={styles.confirmBox}>
              <View style={styles.confirmContainer}>
                {!confirm.requested ? 
                  <>
                    <Text style={styles.confirmHeader}>
                      Change Appointment for
                      {'\nService: ' + confirm.service}
                      {'\nfor client: ' + clientInfo.name + '\nfrom\n'}
                      {displayTime(oldTime) + '\nto'}
                      {'\n' + displayTime(confirm.time) + '\n'}
                    </Text>

                    <View style={styles.note}>
                      <TextInput 
                        style={styles.noteInput} multiline textAlignVertical="top" 
                        placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Leave a note if you want" 
                        maxLength={100} onChangeText={(note) => setConfirm({...confirm, note })} autoCorrect={false}
                      />
                    </View>

                    {confirm.errormsg ? <Text style={styles.errorMsg}>{confirm.errormsg}</Text> : null}

                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                      <View style={styles.confirmOptions}>
                        <TouchableOpacity style={[styles.confirmOption, { opacity: confirm.loading ? 0.3 : 1 }]} disabled={confirm.loading} onPress={() => setConfirm({ ...confirm, show: false, service: "", time: 0, note: "", requested: false, errormsg: "" })}>
                          <Text style={styles.confirmOptionHeader}>No</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.confirmOption, { opacity: confirm.loading ? 0.3 : 1 }]} disabled={confirm.loading} onPress={() => salonChangeTheAppointment()}>
                          <Text style={styles.confirmOptionHeader}>Yes</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {confirm.loading && (
                      <View style={{ alignItems: 'center' }}>
                        <ActivityIndicator color="black" size="small"/>
                      </View>
                    )}
                  </>
                  :
                  <View style={styles.requestedHeaders}>
                    <Text style={styles.requestedHeader}>Appointment changed for{'\n'}</Text>
                    <Text style={styles.requestedHeaderInfo}>
                      {confirm.service + '\n' + displayTime(confirm.time)}
                    </Text>
                  </View>
                }
              </View>
            </SafeAreaView>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  booktime: { backgroundColor: 'white', height: '100%', width: '100%' },
  box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

  headers: { height: '10%' },
  serviceHeader: { fontSize: wsize(8), fontWeight: 'bold', paddingVertical: 10, textAlign: 'center' },

  workerSelection: { alignItems: 'center', marginTop: 20 },
  workerSelectionHeader: { fontSize: wsize(8), fontWeight: 'bold', textAlign: 'center' },
  workersList: { height: '60%' },
  workersRow: { flexDirection: 'row', justifyContent: 'space-between' },
  worker: { alignItems: 'center', borderRadius: 10, marginHorizontal: 5, padding: 5, width: (width / 3) - 30 },
  workerProfile: { borderRadius: wsize(20) / 2, flexDirection: 'column', height: wsize(20), justifyContent: 'space-around', overflow: 'hidden', width: wsize(20) },
  workerHeader: { fontSize: wsize(4), fontWeight: 'bold'  },
  chooseWorkerActions: { flexDirection: 'row', justifyContent: 'space-around' },
  chooseWorkerAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, margin: 2, padding: 5, width: wsize(40) },
  chooseWorkerActionHeader: { fontSize: wsize(5), textAlign: 'center' },
  selectedWorker: { marginVertical: 10 },
  selectedWorkerImage: { borderRadius: wsize(20) / 2, height: wsize(20), width: wsize(20) },
  selectedWorkerHeader: { fontSize: wsize(4), fontWeight: 'bold', textAlign: 'center' },

  dateSelection: { alignItems: 'center', width: '100%' },
  dateSelectionHeader: { fontSize: wsize(8), fontWeight: 'bold', textAlign: 'center' },
  dateHeaders: { flexDirection: 'row', justifyContent: 'space-between', width: '70%' },
  dateHeader: { fontSize: wsize(6), marginVertical: 5, textAlign: 'center', width: wsize(50) },
  
  days: { alignItems: 'center', width: '100%' },
  daysHeaderRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  daysHeader: { fontSize: wsize(12) * 0.3, fontWeight: 'bold', marginVertical: 1, textAlign: 'center', width: wsize(12) },

  daysDataRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  dayTouch: { borderStyle: 'solid', borderWidth: 2, marginVertical: 1, paddingVertical: 10, width: wsize(12) },
  dayTouchHeader: { color: 'black', fontSize: wsize(12) * 0.4, textAlign: 'center' },

  dayTouchDisabled: { paddingVertical: 10, width: wsize(12) },
  dayTouchDisabledHeader: { fontSize: wsize(12) * 0.4, fontWeight: 'bold' },

  timesSelection: { alignItems: 'center', height: '60%' },
  timesHeader: { fontSize: wsize(8), fontWeight: 'bold', textAlign: 'center' },
  times: { alignItems: 'center', paddingBottom: 50, width: '100%' },
  
  unselect: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, paddingVertical: 10, width: wsize(30) },
  unselectHeader: { color: 'black', fontSize: wsize(5) },

  actions: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  action: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: wsize(30) },
  actionHeader: { color: 'black', fontSize: wsize(5), textAlign: 'center' },

  bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
  bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  bottomNav: { flexDirection: 'row' },
  bottomNavHeader: { color: 'black', fontSize: wsize(4), fontWeight: 'bold', paddingVertical: 5 },
  bottomNavButton: { backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
  bottomNavButtonHeader: { color: 'white', fontSize: wsize(4), fontWeight: 'bold', textAlign: 'center' },
  
  // confirm & requested box
  confirmBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  confirmContainer: { backgroundColor: 'white', flexDirection: 'column', justifyContent: 'space-around', padding: 10, width: '80%' },
  confirmHeader: { fontSize: wsize(6), fontWeight: 'bold', textAlign: 'center' },
  note: { alignItems: 'center', marginBottom: 20 },
  noteInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(4), height: 100, padding: 5, width: '80%' },
  confirmOptions: { flexDirection: 'row' },
  confirmOption: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: wsize(20) },
  confirmOptionHeader: { fontSize: wsize(4) },
  requestedHeaders: { alignItems: 'center', paddingHorizontal: 20 },
  requestedClose: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, marginVertical: 10, padding: 5, width: 100 },
  requestedCloseHeader: { fontFamily: 'Chilanka_400Regular', fontSize: wsize(5), textAlign: 'center' },
  requestedHeader: { fontFamily: 'Chilanka_400Regular', fontSize: wsize(5), textAlign: 'center' },
  requestedHeaderInfo: { fontSize: wsize(5), textAlign: 'center' },

  column: { flexDirection: 'column', justifyContent: 'space-around' }
})
