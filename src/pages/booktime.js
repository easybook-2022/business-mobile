import React, { useEffect, useState } from 'react';
import { 
  SafeAreaView, ActivityIndicator, Platform, Dimensions, ScrollView, View, FlatList, Text, Image, TextInput, 
  TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet, Modal 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { socket, logo_url } from '../../assets/info'
import { displayTime, resizePhoto } from 'geottuse-tools'

import { getLocationHours } from '../apis/locations'
import { getAllStylists, getStylistInfo, getAllWorkersTime, getWorkersHour, logoutUser } from '../apis/owners'
import { getAppointmentInfo, salonChangeAppointment } from '../apis/schedules'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}

export default function Booktime(props) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const pushtime = 1000 * (60 * 15)

  const { scheduleid, serviceid, serviceinfo } = props.route.params

  const [clientInfo, setClientinfo] = useState({ id: -1, name: "" })
  const [name, setName] = useState()
  const [hoursInfo, setHoursinfo] = useState({})
  const [oldTime, setOldtime] = useState(0)
  const [selectedDateinfo, setSelecteddateinfo] = useState({ month: '', year: 0, day: '', date: 0 })
  const [bookedDateinfo, setBookeddateinfo] = useState({ month: '', year: 0, day: '', date: 0 })
  const [selectedWorkerinfo, setSelectedworkerinfo] = useState({ id: -1, hours: {}, loading: false })
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
  const [allStylists, setAllstylists] = useState({ stylists: [], numStylists: 0 })
  const [allWorkerstime, setAllworkerstime] = useState({})
  const [scheduled, setScheduled] = useState({})
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
          const unix = jsonDateToUnix(time)

          setClientinfo({ ...clientInfo, ...client })
          setName(name)
          setOldtime(unix)
          setSelectedworkerinfo({ ...selectedWorkerinfo, id: worker.id })

          const prevTime = new Date(unix)

          setBookeddateinfo({ 
            ...bookedDateinfo, 
            month: months[prevTime.getMonth()],  
            day: days[prevTime.getDay()].substr(0, 3),
            year: prevTime.getFullYear(),
            date: prevTime.getDate()
          })

          setLoaded(true)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getCalendar = (month, year) => {
    let currTime = new Date(), currDate = 0, currDay = ''
    let firstDay = (new Date(year, month)).getDay(), numDays = 32 - new Date(year, month, 32).getDate(), daynum = 1
    let data = calendar.data, datetime = 0, hourInfo, current, now = Date.parse(
      days[currTime.getDay()] + " " + 
      months[currTime.getMonth()] + " " + 
      currTime.getDate() + " " + 
      currTime.getFullYear()
    )

    data.forEach(function (info, rowindex) {
      info.row.forEach(function (day, dayindex) {
        day.num = 0
        day.noservice = false

        if (rowindex == 0) {
          if (dayindex >= firstDay) {
            datetime = Date.parse(days[dayindex] + " " + months[month] + " " + daynum + " " + year)

            day.passed = now > datetime
            day.noservice = selectedWorkerinfo.id > -1 ? 
              !(days[dayindex].substr(0, 3) in selectedWorkerinfo.hours)
              :
              !(days[dayindex].substr(0, 3) in allWorkerstime)
            
            day.num = daynum
            daynum++
          }
        } else if (daynum <= numDays) {
          datetime = Date.parse(days[dayindex] + " " + months[month] + " " + daynum + " " + year)

          day.passed = now > datetime
          day.noservice = selectedWorkerinfo.id > -1 ? 
            !(days[dayindex].substr(0, 3) in selectedWorkerinfo.hours)
            :
            !(days[dayindex].substr(0, 3) in allWorkerstime)
          
          day.num = daynum
          daynum++
        }

        if (day.num > 0 && (!day.passed && !day.noservice) && currDate == 0) {
          currDay = days[dayindex].substr(0, 3)

          if (currDay in hoursInfo) {
            hourInfo = hoursInfo[currDay]

            current = Date.parse(days[dayindex] + " " + months[month] + ", " + day.num + " " + year + " " + hourInfo["closeHour"] + ":" + hourInfo["closeMinute"])
            now = Date.now()

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

    setSelecteddateinfo({ 
      ...selectedDateinfo, 
      month: months[month], day: currDay, 
      date: bookedDateinfo.date == 0 ? currDate : bookedDateinfo.date, 
      year 
    })
    setCalendar({ ...calendar, firstDay, numDays, data })
  }
  const selectDate = (date, day) => {
    const { month, year } = selectedDateinfo
    const { openHour, openMinute, closeHour, closeMinute } = hoursInfo[day]
    let start = day in allWorkerstime ? allWorkerstime[day][0]["start"] : openHour + ":" + openMinute
    let end = day in allWorkerstime ? allWorkerstime[day][0]["end"] : closeHour + ":" + closeMinute
    let openStr = month + " " + date + ", " + year + " " + start
    let closeStr = month + " " + date + ", " + year + " " + end
    let openDateStr = Date.parse(openStr), closeDateStr = Date.parse(closeStr), calcDateStr = openDateStr
    let currenttime = Date.now(), newTimes = [], timesRow = [], timesNum = 0

    while (calcDateStr < (closeDateStr - pushtime)) {
      calcDateStr += pushtime

      let timestr = new Date(calcDateStr)
      let hour = timestr.getHours()
      let minute = timestr.getMinutes()
      let period = hour < 12 ? "am" : "pm"
      let timedisplay = (
        hour <= 12 ? 
          hour == 0 ? 12 : hour
          : 
          hour - 12
        ) 
        + ":" + 
        (minute < 10 ? '0' + minute : minute) + " " + period
      let timepassed = currenttime > calcDateStr
      let timetaken = false

      if (selectedWorkerinfo.id > -1) { // worker is selected
        const workerid = selectedWorkerinfo.id

        timetaken = JSON.stringify(scheduled).includes("\"" + calcDateStr + "\":" + workerid)
      } else {
        let numWorkers = Object.keys(scheduled).length
        let occur = JSON.stringify(scheduled).split("\"" + calcDateStr + "\":").length - 1

        timetaken = occur == numWorkers
      }

      let availableService = false, workerIds = []

      if (selectedWorkerinfo.id > -1 && day in selectedWorkerinfo.hours) {
        let startTime = selectedWorkerinfo.hours[day]["start"]
        let endTime = selectedWorkerinfo.hours[day]["end"]

        if (
          calcDateStr >= Date.parse(openStr.substring(0, openStr.length - 5) + startTime) 
          && 
          calcDateStr <= Date.parse(closeStr.substring(0, closeStr.length - 5) + endTime)
        ) {
          availableService = true
          workerIds = [selectedWorkerinfo.hours[day]["workerId"]]
        }
      } else {
        if (day in allWorkerstime) {
          let times = allWorkerstime[day]
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

    setSelecteddateinfo({ ...selectedDateinfo, date, day })
    setTimes(newTimes)
    setStep(2)
  }
  const getTheLocationHours = async(time) => {
    const locationid = await AsyncStorage.getItem("locationid")
    
    getLocationHours(locationid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { hours } = res

          setHoursinfo(hours)
          setLoaded(true)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getAllTheStylists = async() => {
    const locationid = await AsyncStorage.getItem("locationid")

    getAllStylists(locationid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setAllstylists({ ...allStylists, stylists: res.owners, numStylists: res.numWorkers })
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
          setAllworkerstime(res.workers)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getAllScheduledTimes = async() => {
    const locationid = await AsyncStorage.getItem("locationid")
    const data = { locationid, ownerid: null }

    getWorkersHour(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { workersHour } = res

          for (let worker in workersHour) {
            for (let info in workersHour[worker]) {
              if (info == "scheduled") {
                const newScheduled = {}

                for (let info in workersHour[worker]["scheduled"]) {
                  let splitTime = info.split("-")
                  let time = splitTime[0]
                  let status = splitTime[1]

                  newScheduled[jsonDateToUnix(JSON.parse(time))] = workersHour[worker]["scheduled"][info]
                }

                workersHour[worker]["scheduled"] = newScheduled
              }
            }
          }

          setScheduled(workersHour)
        }
      })
  }
  const selectWorker = id => {
    const workingDays = {}

    for (let day in allWorkerstime) {
      allWorkerstime[day].forEach(function (workerInfo) {
        const { workerId, start, end } = workerInfo

        if (workerId == id) {
          workingDays[day] = { start, end }
        }
      })
    }

    allStylists.stylists.forEach(function (item) {
      item.row.forEach(function (worker) {
        if (worker.id == id) {
          setSelectedworkerinfo({ ...selectedWorkerinfo, id, hours: workingDays })
          setStep(1)
        }
      })
    })
  }
  const dateNavigate = dir => {
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

    getCalendar(month, year)
  }
  const selectTime = info => {
    const { time, workerIds } = info

    setConfirm({ ...confirm, show: true, service: name ? name : serviceinfo, time, workerIds })
  }
  const salonChangeTheAppointment = async() => {
    setConfirm({ ...confirm, loading: true })

    const locationid = await AsyncStorage.getItem("locationid")
    const workerid = selectedWorkerinfo.id
    const { note, workerIds, time } = confirm
    const selectedinfo = new Date(time)
    const day = days[selectedinfo.getDay()], month = months[selectedinfo.getMonth()], date = selectedinfo.getDate(), year = selectedinfo.getFullYear()
    const hour = selectedinfo.getHours(), minute = selectedinfo.getMinutes()
    const selecteddate = JSON.stringify({ day, month, date, year, hour, minute })
    let data = { 
      id: scheduleid, // id for socket purpose (updating)
      clientid: clientInfo.id, 
      workerid: workerid > -1 ? workerid : workerIds[Math.floor(Math.random() * (workerIds.length - 1)) + 0], 
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
          if (res.receiver) {
            data = { ...data, receiver: res.receiver, time, worker: res.worker }

            socket.emit("socket/salonChangeAppointment", data, () => {
              setConfirm({ ...confirm, requested: true, loading: false })

              setTimeout(function () {
                setConfirm({ ...confirm, show: false, requested: false })

                setTimeout(function () {
                  props.navigation.dispatch(CommonActions.reset({ index: 1, routes: [{ name: "main" }]}));
                }, 1000)
              }, 2000)
            })
          } else {
            setConfirm({ ...confirm, requested: true, loading: false })

            setTimeout(function () {
              setConfirm({ ...confirm, show: false, requested: false })

              setTimeout(function () {
                props.navigation.dispatch(CommonActions.reset({ index: 1, routes: [{ name: "main" }]}));
              }, 1000)
            }, 2000)
          }
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data

          setConfirm({ ...confirm, errorMsg: errormsg })
        }
      })
  }
  const jsonDateToUnix = date => {
    return Date.parse(date["day"] + " " + date["month"] + " " + date["date"] + " " + date["year"] + " " + date["hour"] + ":" + date["minute"])
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

            props.navigation.dispatch(CommonActions.reset({ index: 1, routes: [{ name: "auth" }]}));
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
    getAllTheStylists()
    getTheLocationHours()
    getAllTheWorkersTime()
    getTheAppointmentInfo()
  }, [])

  useEffect(() => {
    const prevTime = new Date(oldTime)
      
    getCalendar(prevTime.getMonth(), prevTime.getFullYear())
  }, [selectedWorkerinfo.hours])

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
                <Text style={styles.workerSelectionHeader}>Pick a {!scheduleid ? '' : '\ndifferent'} stylist (Optional)</Text>

                <View style={styles.workersList}>
                  <FlatList
                    data={allStylists.stylists}
                    renderItem={({ item, index }) => 
                      <View key={item.key} style={styles.workersRow}>
                        {item.row.map(info => (
                          info.id ? 
                            <TouchableOpacity key={info.key} style={[styles.worker, { backgroundColor: (selectedWorkerinfo.id == info.id) ? 'rgba(0, 0, 0, 0.3)' : null }]} disabled={selectedWorkerinfo.loading} onPress={() => selectWorker(info.id)}>
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
              </View>
            )}

            {step == 1 && (
              <View style={styles.dateSelection}>
                <Text style={styles.dateSelectionHeader}>Tap a {'\ndifferent'} date below</Text>

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
                                  <TouchableOpacity key={day.key} style={[styles.dayTouch, { backgroundColor: 'black' }]} onPress={() => selectDate(day.num, days[dayindex].substr(0, 3))}>
                                    <Text style={[styles.dayTouchHeader, { color: 'white' }]}>{day.num}</Text>
                                  </TouchableOpacity>
                                  :
                                  <TouchableOpacity key={day.key} style={styles.dayTouch} onPress={() => selectDate(day.num, days[dayindex].substr(0, 3))}>
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
                  <Text style={[styles.timesHeader, { fontSize: 15 }]}>Current: {displayTime(oldTime)}</Text>
                  <Text style={styles.timesHeader}>Tap a {'\n'}different time below</Text>

                  <View style={{ alignItems: 'center' }}>
                    <View style={styles.times}>
                      {times.map(info => (
                        <View key={info.key} style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                          {info.row.map(item => (
                            item.header ? 
                              <TouchableOpacity key={item.key} style={styles.unselect} onPress={() => selectTime(item)}>
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
              <TouchableOpacity style={styles.action} onPress={() => {
                switch (step) {
                  case 0:
                    props.navigation.goBack()

                    break;
                  default:
                }

                setStep(step - 1)
              }}>
                <Text style={styles.actionHeader}>Back</Text>
              </TouchableOpacity>

              {(step == 0 || step == 1) && (
                step == 0 ? 
                  selectedWorkerinfo.id > -1 ? 
                    <TouchableOpacity style={styles.action} onPress={() => selectWorker(selectedWorkerinfo.id)}>
                      <Text style={styles.actionHeader}>Next</Text>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity style={styles.action} onPress={() => {
                      getTheLocationHours()
                      setSelectedworkerinfo({ ...selectedWorkerinfo, id: -1, hours: {} })
                      setStep(1)
                    }}>
                      <Text style={styles.actionHeader}>Skip</Text>
                    </TouchableOpacity>
                  :
                  <TouchableOpacity style={styles.action} onPress={() => {
                    const { day, date } = selectedDateinfo

                    selectDate(date, day)
                  }}>
                    <Text style={styles.actionHeader}>Pick today</Text>
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
            <TouchableOpacity style={styles.bottomNav} onPress={() => props.navigation.dispatch(CommonActions.reset({ index: 1, routes: [{ name: "main" }]}))}>
              <Entypo name="home" size={wsize(7)}/>
            </TouchableOpacity>

            <View style={styles.column}>
              <TouchableOpacity style={styles.bottomNavButton} onPress={() => {
                AsyncStorage.clear()

                props.navigation.dispatch(CommonActions.reset({ index: 1, routes: [{ name: "auth" }]}));
              }}>
                <Text style={styles.bottomNavButtonHeader}>Log-Out</Text>
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
                      Name: {clientInfo.name}
                      {'\nService: ' + confirm.service + '\n\n'}
                      Change time to
                      {'\n' + displayTime(confirm.time)}
                    </Text>

                    <View style={styles.note}>
                      <TextInput 
                        style={styles.noteInput} multiline textAlignVertical="top" 
                        placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Leave a note if you want" 
                        maxLength={100} onChangeText={(note) => setConfirm({...confirm, note })} autoCorrect={false}
                      />
                    </View>

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
                    <Text style={styles.requestedHeaderInfo}>{confirm.service + '\n' + displayTime(confirm.time)}</Text>
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
  requestedHeader: { fontFamily: 'Chilanka_400Regular', fontSize: wsize(6), textAlign: 'center' },
  requestedHeaderInfo: { fontSize: wsize(7), fontWeight: 'bold', textAlign: 'center' },

  column: { flexDirection: 'column', justifyContent: 'space-around' }
})
