import React, { useEffect, useState, useRef } from 'react'
import { SafeAreaView, ActivityIndicator, Dimensions, ScrollView, View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { getServiceInfo } from '../apis/services'
import { getAppointmentInfo, rescheduleAppointment } from '../apis/schedules'
import { getLocationHours } from '../apis/locations'
import { socket } from '../../assets/info'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const wsize = p => {
  return width * (p / 100)
}
const hsize = p => {
  return height * (p / 100)
}

export default function Booktime(props) {
  const { appointmentid, refetch } = props.route.params

  const months = ['January', 'February', 'March', 'April', 'May', 'Jun', 'July', 'August', 'September', 'October', 'November', 'December']
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const pushtime = 1000 * (60 * 10)

  const [ownerId, setOwnerid] = useState(null)
  const [name, setName] = useState('')
  const [serviceId, setServiceid] = useState(0)

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
  ]})
  const [times, setTimes] = useState([])
  const [scheduledTimes, setScheduledtimes] = useState([])
  const [loaded, setLoaded] = useState(false)

  const [confirm, setConfirm] = useState({ show: false, timeheader: "", loading: false, requested: false })

  const isMounted = useRef(null)
  
  const getTheAppointmentInfo = async() => {
    const ownerid = await AsyncStorage.getItem("ownerid")

    getAppointmentInfo(appointmentid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res && isMounted.current == true) {
          const { locationId, name, time } = res.appointmentInfo

          setOwnerid(ownerid)
          setName(name)
          getTheLocationHours(locationId, time)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {

        } else {
          alert("an error has occurred in server")
        }
      })
  }
  const getTheLocationHours = async(locationid, time) => {
    const day = new Date(Date.now()).toString().split(" ")[0]
    const data = { locationid, day }

    getLocationHours(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { openTime, closeTime, scheduled } = res

          let openHour = openTime.hour, openMinute = openTime.minute, openPeriod = openTime.period
          let closeHour = closeTime.hour, closeMinute = closeTime.minute, closePeriod = closeTime.period

          let currTime = new Date(Date.now())
          let currDay = days[currTime.getDay()]
          let currDate = currTime.getDate()
          let currMonth = months[currTime.getMonth()]

          let selectedTime = time > 0 && time > Date.now() ? new Date(time) : null
          let selectedDay = null, selectedDate = null, selectedMonth = null

          if (selectedTime) {
            selectedDay = days[selectedTime.getDay()]
            selectedDate = selectedTime.getDate()
            selectedMonth = months[selectedTime.getMonth()]
          }

          let openStr = currDay + " " + currMonth + " " + currTime.getDate() + " " + currTime.getFullYear() + " " + openHour + ":" + openMinute
          let closeStr = currDay + " " + currMonth + " " + currTime.getDate() + " " + currTime.getFullYear() + " " + closeHour + ":" + closeMinute
          let openDateStr = Date.parse(openStr), closeDateStr = Date.parse(closeStr)
          let newTimes = [], currenttime = Date.now(), currDateStr = openDateStr
          let firstDay = (new Date(currTime.getFullYear(), currTime.getMonth())).getDay()
          let numDays = 32 - new Date(currTime.getFullYear(), currTime.getMonth(), 32).getDate()
          let daynum = 1, data = calendar.data, datetime = 0, datenow = Date.parse(currDay + " " + currMonth + " " + currTime.getDate() + " " + currTime.getFullYear())

          data.forEach(function (info, rowindex) {
            info.row.forEach(function (day, dayindex) {
              day.num = 0

              if (rowindex == 0) {
                if (dayindex >= firstDay) {
                  datetime = Date.parse(days[dayindex] + " " + currMonth + " " + daynum + " " + currTime.getFullYear())

                  day.passed = datenow > datetime
                  day.num = daynum
                  daynum++
                }
              } else if (daynum <= numDays) {
                datetime = Date.parse(days[dayindex] + " " + currMonth + " " + daynum + " " + currTime.getFullYear())

                day.passed = datenow > datetime
                day.num = daynum
                daynum++
              }
            })
          })

          if (selectedTime) {
            openStr = selectedDay + " " + selectedMonth + " " + selectedTime.getDate() + " " + selectedTime.getFullYear() + " " + openHour + ":" + openMinute
            closeStr = selectedDay + " " + selectedMonth + " " + selectedTime.getDate() + " " + selectedTime.getFullYear() + " " + closeHour + ":" + closeMinute
            openDateStr = Date.parse(openStr)
            closeDateStr = Date.parse(closeStr)

            currDateStr = openDateStr
          }

          while (currDateStr < (closeDateStr - pushtime)) {
            currDateStr += pushtime

            let timestr = new Date(currDateStr)
            let hour = timestr.getHours()
            let minute = timestr.getMinutes()
            let period = hour < 12 ? "am" : "pm"

            let timedisplay = (hour <= 12 ? (hour == 0 ? "12" : hour) : hour - 12) + ":" + (minute < 10 ? '0' + minute : minute) + " " + period
            let timepassed = currenttime > currDateStr
            let timetaken = scheduled.indexOf(currDateStr) > -1

            if (!timepassed) {
              newTimes.push({ 
                key: newTimes.length, header: timedisplay, 
                time: currDateStr, timetaken
              })
            }
          }

          setOpentime({ hour: openHour, minute: openMinute })
          setClosetime({ hour: closeHour, minute: closeMinute })

          if (selectedTime) {
            setSelecteddateinfo({ month: currMonth, year: selectedTime.getFullYear(), day: selectedDay, date: selectedDate, time: 0 })
          } else {
            setSelecteddateinfo({ month: currMonth, year: currTime.getFullYear(), day: currDay, date: currDate, time: 0 })
          }

          setCalendar({ firstDay, numDays, data })
          setTimes(newTimes)
          setScheduledtimes(scheduled)
          setLoaded(true)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          
        } else {
          alert("an error has occurred in server")
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

    let firstDay, numDays, daynum = 1, data = calendar.data, datetime
    let datenow = Date.parse(currDay + " " + currMonth + " " + currTime.getDate() + " " + currTime.getFullYear())

    firstDay = (new Date(year, month)).getDay()
    numDays = 32 - new Date(year, month, 32).getDate()
    data.forEach(function (info, rowindex) {
      info.row.forEach(function (day, dayindex) {
        day.num = 0
        day.passed = false

        if (rowindex == 0) {
          if (dayindex >= firstDay) {
            datetime = Date.parse(days[dayindex] + " " + months[month] + " " + daynum + " " + year)

            day.passed = datenow > datetime
            day.num = daynum
            daynum++
          }
        } else if (daynum <= numDays) {
          datetime = Date.parse(days[dayindex] + " " + months[month] + " " + daynum + " " + year)

          day.passed = datenow > datetime
          day.num = daynum
          daynum++
        }
      })
    })

    let date = month == currTime.getMonth() && year == currTime.getFullYear() ? currTime.getDate() : 1
    let openStr = months[month] + " " + date + ", " + year + " " + openTime.hour + ":" + openTime.minute
    let closeStr = months[month] + " " + date + ", " + year + " " + closeTime.hour + ":" + closeTime.minute
    let openDateStr = Date.parse(openStr), closeDateStr = Date.parse(closeStr), currDateStr = openDateStr
    let currenttime = Date.now(), newTimes = []

    while (currDateStr < (closeDateStr - pushtime)) {
      currDateStr += pushtime

      let timestr = new Date(currDateStr)
      let hour = timestr.getHours()
      let minute = timestr.getMinutes()
      let period = hour < 12 ? "am" : "pm"

      let timedisplay = (hour <= 12 ? (hour == 0 ? "12" : hour) : hour - 12) + ":" + (minute < 10 ? '0' + minute : minute) + " " + period
      let timepassed = currenttime > currDateStr

      newTimes.push({ 
        key: newTimes.length, header: timedisplay, 
        time: currDateStr, timetaken: false, timepassed,
        disable: true
      })
    }

    setSelecteddateinfo({ ...selectedDateinfo, month: months[month], date: null, year })
    setCalendar({ firstDay, numDays, data })
    setTimes(newTimes)
    setLoaded(true)
  }
  const selectDate = (date) => {
    const { month, year } = selectedDateinfo

    let openStr = month + " " + date + ", " + year + " " + openTime.hour + ":" + openTime.minute
    let closeStr = month + " " + date + ", " + year + " " + closeTime.hour + ":" + closeTime.minute
    let openDateStr = Date.parse(openStr), closeDateStr = Date.parse(closeStr), currDateStr = openDateStr
    let currenttime = Date.now(), newTimes = []

    while (currDateStr < (closeDateStr - pushtime)) {
      currDateStr += pushtime

      let timestr = new Date(currDateStr)
      let hour = timestr.getHours()
      let minute = timestr.getMinutes()
      let period = hour < 12 ? "am" : "pm"

      let timedisplay = (hour <= 12 ? (hour == 0 ? "12" : hour) : hour - 12) + ":" + (minute < 10 ? '0' + minute : minute) + " " + period
      let timepassed = currenttime > currDateStr
      let timetaken = scheduledTimes.indexOf(currDateStr) > -1

      if (!timepassed) {
        newTimes.push({ 
          key: newTimes.length, header: timedisplay, 
          time: currDateStr, timetaken
        })
      }
    }

    setSelecteddateinfo({ ...selectedDateinfo, date })
    setTimes(newTimes)
  }
  const selectTime = (name, timeheader, time) => {
    const { month, date, year } = selectedDateinfo
    const currTime = new Date(Date.now())

    const sTime = Date.parse(month + " " + date + " " + year + " " + timeheader)
    const eTime = Date.parse(months[currTime.getMonth()] + " " + currTime.getDate() + ", " + currTime.getFullYear() + " 23:59")
    let timedisplay = "", diff

    setSelecteddateinfo({ ...selectedDateinfo, name, time })

    if (selectedDateinfo.date) {
      if (sTime < eTime) {
        timedisplay = "today at " + timeheader
      } else if (sTime > eTime) {
        if (sTime - eTime > 86400000) { // tomorrow or more
          diff = sTime - eTime

          if (diff <= 604800000) { // this week
            let sDay = new Date(sTime)
            let eDay = new Date(eTime)

            if (sDay.getDay() == eDay.getDay()) {
              timedisplay = " next " + days[sDay.getDay()] + " at " + timeheader
            } else {
              timedisplay = " on " + days[sDay.getDay()] + " at " + timeheader
            }
          } else if (diff > 604800000 && diff <= 1210000000) { // next week
            let sDay = new Date(sTime)
            let eDay = new Date(eTime)

            if (sDay.getDay() != eDay.getDay()) {
              timedisplay = " next " + days[sDay.getDay()] + " at " + timeheader
            } else {
              timedisplay = " on " + days[sDay.getDay()] + ", " + months[sDay.getMonth()] + " " + date + " at " + timeheader
            }
          } else {
            let sDay = new Date(sTime)
            let eDay = new Date(eTime)

            if (sDay.getMonth() != eDay.getMonth()) {
              timedisplay = " on " + days[sDay.getDay()] + ", " + months[sDay.getMonth()] + " " + date + " at " + timeheader
            } else {
              timedisplay = " on " + days[sDay.getDay()] + ", " + date + " at " + timeheader
            }
          }
        } else {
          timedisplay = "tomorrow at " + timeheader
        }
      }

      setConfirm({ ...confirm, show: true, service: name, timeheader: timedisplay, time })
    }
  }
  const rescheduleTheAppointment = async() => {
    const ownerid = await AsyncStorage.getItem("ownerid")
    const { month, date, year, time } = selectedDateinfo
    const { service } = confirm
    const selecteddate = new Date(time)
    const selectedtime = selecteddate.getHours() + ":" + selecteddate.getMinutes()
    const dateInfo = Date.parse(month + " " + date + ", " + year + " " + selectedtime).toString()
    let data = { ownerid, appointmentid, time: dateInfo, type: "rescheduleAppointment" }

    setConfirm({ ...confirm, loading: true })

    rescheduleAppointment(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          data = { ...data, receiver: res.receiver, worker: res.worker }
          socket.emit("socket/rescheduleAppointment", data, () => {
            setConfirm({ ...confirm, requested: true })

            setTimeout(function () {
              setConfirm({ ...confirm, show: false, errormsg: "" })

              refetch()
              props.navigation.goBack()
            }, 3000)
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          
        } else {
          alert("an error has occurred in server")
        }
      })
  }
  
  useEffect(() => {
    isMounted.current = true

    getTheAppointmentInfo()

    return () => isMounted.current = false
  }, [])
  
  return (
    <SafeAreaView style={styles.booktime}>
      {loaded ? 
        <View style={styles.box}>
          <View style={styles.headers}>
            <Text style={styles.serviceHeader}><Text style={{ fontSize: wsize(4) }}>for</Text> client</Text>
            <Text style={styles.serviceHeader}><Text style={{ fontSize: wsize(4) }}>requesting for</Text> {name}</Text>
          </View>
    
          <ScrollView style={styles.body}>
            <View style={styles.dateSelection}>
              <Text style={styles.dateSelectionHeader}>Tap a date below</Text>

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
                  {days.map((day, index) => (
                    <Text key={"day-header-" + index} style={styles.daysHeader}>{day.substr(0, 3)}</Text>
                  ))}
                </View>
                {calendar.data.map((info, rowindex) => (
                  <View key={info.key} style={styles.daysDataRow}>
                    {info.row.map((day, dayindex) => (
                      day.num > 0 ?
                        day.passed ? 
                          <TouchableOpacity key={day.key} disabled={true} style={[styles.dayTouch, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
                            <Text style={styles.dayTouchHeader}>{day.num}</Text>
                          </TouchableOpacity>
                          :
                          selectedDateinfo.date == day.num ?
                            <TouchableOpacity key={day.key} style={[styles.dayTouch, { backgroundColor: 'black' }]} onPress={() => selectDate(day.num)}>
                              <Text style={[styles.dayTouchHeader, { color: 'white' }]}>{day.num}</Text>
                            </TouchableOpacity>
                            :
                            <TouchableOpacity key={day.key} style={styles.dayTouch} onPress={() => selectDate(day.num)}>
                              <Text style={styles.dayTouchHeader}>{day.num}</Text>
                            </TouchableOpacity>
                        :
                        <TouchableOpacity key={"calender-header-" + rowindex + "-" + dayindex} style={styles.dayTouchDisabled}></TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.timesContainer}>
              <Text style={styles.timesHeader}>Tap a time below</Text>

              <View style={styles.times}>
                {times.map(info => (
                  <View key={info.key}>
                    {!info.timetaken ?
                      <TouchableOpacity style={styles.unselect} onPress={() => selectTime(name, info.header, info.time)}>
                        <Text style={styles.unselectHeader}>{info.header}</Text>
                      </TouchableOpacity>
                      :
                      <TouchableOpacity style={[styles.unselect, { backgroundColor: 'black' }]} disabled={true} onPress={() => {}}>
                        <Text style={[styles.unselectHeader, { color: 'white' }]}>{info.header}</Text>
                      </TouchableOpacity>
                    }
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
        :
        <View style={styles.loading}>
          <ActivityIndicator color="black" size="small"/>
        </View>
      }
      
      {confirm.show && (
        <Modal transparent={true}>
          <SafeAreaView style={styles.confirmBox}>
            <View style={styles.confirmContainer}>
              {!confirm.requested ? 
                <>
                  <Text style={styles.confirmHeader}>
                    <Text style={{ fontFamily: 'appFont' }}>Select this time for client</Text>
                    {'\n' + confirm.timeheader}
                    <Text style={{ fontFamily: 'appFont', fontSize: wsize(7) }}>{'\n\n for ' + confirm.service}</Text>
                  </Text>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                    <View style={styles.confirmOptions}>
                      <TouchableOpacity style={[styles.confirmOption, { opacity: confirm.loading ? 0.3 : 1 }]} disabled={confirm.loading} onPress={() => setConfirm({ show: false, timeheader: "" })}>
                        <Text style={styles.confirmOptionHeader}>No</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.confirmOption, { opacity: confirm.loading ? 0.3 : 1 }]} disabled={confirm.loading} onPress={() => rescheduleTheAppointment()}>
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
                  <Text style={styles.requestedHeader}>Time requested {'\n'}</Text>
                  <Text style={styles.requestedHeaderInfo}>
                    at {confirm.timeheader} {'\n'}

                    You will get notify by the client
                  </Text>
                </View>
              }
            </View>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  booktime: { backgroundColor: 'white', height: '100%', width: '100%' },
  box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },

  headers: { flexDirection: 'column', height: '15%', justifyContent: 'space-around', width: '100%' },
  serviceHeader: { fontSize: wsize(6), fontWeight: 'bold', textAlign: 'center' },

  body: { height: '85%' },

  dateSelection: { alignItems: 'center', marginVertical: 50, width: '100%' },
  dateSelectionHeader: { fontSize: wsize(8), fontWeight: 'bold', textAlign: 'center' },
  dateHeaders: { flexDirection: 'row', justifyContent: 'space-between', width: '70%' },
  column: { flexDirection: 'column', justifyContent: 'space-around' },
  dateHeader: { fontSize: wsize(6), marginVertical: 5, textAlign: 'center', width: wsize(50) },
  days: { alignItems: 'center', width: '100%' },

  daysHeaderRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  daysHeader: { fontSize: wsize(12) * 0.4, fontWeight: 'bold', marginVertical: 1, textAlign: 'center', width: wsize(12) },

  daysDataRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  dayTouch: { borderStyle: 'solid', borderWidth: 2, marginVertical: 1, paddingVertical: 10, width: wsize(12) },
  dayTouchHeader: { color: 'black', fontSize: wsize(12) * 0.4, textAlign: 'center' },

  dayTouchDisabled: { paddingVertical: 10, width: wsize(12) },
  dayTouchDisabledHeader: { fontSize: wsize(12) * 0.4, fontWeight: 'bold' },

  timesContainer: { alignItems: 'center', marginVertical: 50 },
  timesHeader: { fontSize: wsize(8), fontWeight: 'bold', textAlign: 'center' },
  times: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', width: wsize(79) },
  
  unselect: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, paddingVertical: 10, width: wsize(25) },
  unselectHeader: { color: 'black', fontSize: wsize(4) },

  // confirm & requeseted box
  confirmBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  confirmContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
  confirmHeader: { fontSize: wsize(5), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
  confirmOptions: { flexDirection: 'row' },
  confirmOption: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: wsize(30) },
  confirmOptionHeader: { fontSize: wsize(4), textAlign: 'center' },
  requestedHeaders: { alignItems: 'center', paddingHorizontal: 10 },
  requestedClose: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, marginVertical: 10, padding: 5, width: 100 },
  requestedCloseHeader: { fontFamily: 'appFont', fontSize: wsize(5), textAlign: 'center' },
  requestedHeader: { fontFamily: 'appFont', fontSize: wsize(6) },
  requestedHeaderInfo: { fontSize: wsize(5), textAlign: 'center' },

  loading: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
})
