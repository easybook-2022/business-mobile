import React, { useState } from 'react'
import { SafeAreaView, Platform, ActivityIndicator, Dimensions, ScrollView, Modal, View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { setOwnerHours } from '../apis/owners'
import { getLocationProfile } from '../apis/locations'
import { timeControl } from '../../assets/info'

import AntDesign from 'react-native-vector-icons/AntDesign'

// components
import Loadingprogress from '../components/loadingprogress';

const { height, width } = Dimensions.get('window')
const wsize = p => {
  return width * (p / 100)
}
const hsize = p => {
  return height * (p / 100)
}
const daysArr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function Workinghours({ navigation }) {
  const [type, setType] = useState('')

  const [daysInfo, setDaysinfo] = useState({ working: ['', '', '', '', '', '', ''], done: false })
  const [workerHours, setWorkerhours] = useState([])
  const [hoursRange, setHoursrange] = useState([])
  const [errorMsg, setErrormsg] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const getInfo = async() => {
    const locationid = await AsyncStorage.getItem("locationid")
    const locationtype = await AsyncStorage.getItem("locationtype")
    const data = { locationid }

    getLocationProfile(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const hours = [...res.info.hours]
          let openHour, openMinute, closeHour, closeMinute
          let openInfo, closeInfo, currDate, calcDate, openTime, closeTime

          for (let k = 0; k < 7; k++) {
            openInfo = hours[k].opentime
            closeInfo = hours[k].closetime

            openMinute = parseInt(openInfo.minute)
            openHour = parseInt(openInfo.hour)
            openHour = openInfo.period == "PM" ? openHour + 12 : openHour

            closeMinute = parseInt(closeInfo.minute)
            closeHour = parseInt(closeInfo.hour)
            closeHour = closeInfo.period == "PM" ? closeHour + 12 : closeHour

            currDate = new Date()

            calcDate = new Date(currDate.setDate(currDate.getDate() - currDate.getDay() + k)).toUTCString();
            calcDate = calcDate.split(" ")
            calcDate.pop()
            calcDate.pop()

            calcDate = calcDate.join(" ") + " "

            openTime = (openHour < 10 ? "0" + openHour : openHour)
            openTime += ":"
            openTime += (openMinute < 10 ? "0" + openMinute : openMinute)

            closeTime = (closeHour < 10 ? "0" + closeHour : closeHour)
            closeTime += ":"
            closeTime += (closeMinute < 10 ? "0" + closeMinute : closeMinute)

            hours[k]["calcDate"] = calcDate
            hours[k]["openunix"] = Date.parse(calcDate + openTime)
            hours[k]["closeunix"] = Date.parse(calcDate + closeTime)
          }

          setType(locationtype)
          setWorkerhours(hours)
          setHoursrange(hours)
          setLoaded(true)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const setTime = () => {
    const newWorkerhours = []
    let emptyDays = true

    daysArr.forEach(function (day, index) {
      newWorkerhours.push({ 
        key: newWorkerhours.length.toString(), 
        header: day, 
        opentime: {...hoursRange[index].opentime}, 
        closetime: {...hoursRange[index].closetime}, 
        working: daysInfo.working[index] ? true : false
      })

      if (daysInfo.working[index]) {
        emptyDays = false
      }
    })

    if (!emptyDays) {
      setDaysinfo({ ...daysInfo, done: true })
      setWorkerhours(newWorkerhours)
      setErrormsg('')
    } else {
      setErrormsg('Please select the days you work on')
    }
  }
  const done = async() => {
    const locationid = await AsyncStorage.getItem("locationid")
    const ownerid = await AsyncStorage.getItem("ownerid")
    const hours = {}
    let invalid = false

    setLoading(true)

    workerHours.forEach(function (workerHour) {
      let { opentime, closetime, working } = workerHour
      let newOpentime = {...opentime}, newClosetime = {...closetime}
      let openhour = parseInt(newOpentime.hour), closehour = parseInt(newClosetime.hour)
      let openperiod = newOpentime.period, closeperiod = newClosetime.period

      delete newOpentime.period
      delete newClosetime.period

      if (working == true || working == false) {
        if (openperiod == "PM") {
          if (openhour < 12) {
            openhour += 12
          }

          openhour = openhour < 10 ? 
            "0" + openhour
            :
            openhour.toString()
        } else {
          if (openhour == 12) {
            openhour = "00"
          } else if (openhour < 10) {
            openhour = "0" + openhour
          } else {
            openhour = openhour.toString()
          }
        }

        if (closeperiod == "PM") {
          if (closehour < 12) {
            closehour += 12
          }

          closehour = closehour < 10 ? 
            "0" + closehour
            :
            closehour.toString()
        } else {
          if (closehour == 12) {
            closehour = "00"
          } else if (closehour < 10) {
            closehour = "0" + closehour
          } else {
            closehour = closehour.toString()
          }
        }

        newOpentime.hour = openhour
        newClosetime.hour = closehour

        hours[workerHour.header.substr(0, 3)] = { opentime: newOpentime, closetime: newClosetime, working, takeShift: "" }
      } else {
        invalid = true
      }
    })

    if (!invalid) {
      const data = { ownerid, hours }

      setOwnerHours(data)
        .then((res) => {
          if (res.status == 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            AsyncStorage.setItem("phase", "main")
            setLoading(false)

            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "main", params: { firstTime: true } }]
              })
            )
          }
        })
        .catch((err) => {
          if (err.response && err.response.status == 400) {
            const { errormsg, status } = err.response.data
            
            setLoading(false)
          }
        })
    } else {
      setLoading(false)
      setErrormsg("Please choose an option for all the days")
    }
  }
  const updateWorkingHour = (index, timetype, dir, open) => {
    const newWorkerhours = [...workerHours], hoursRangeInfo = [...hoursRange]
    let value, { openunix, closeunix, calcDate } = hoursRangeInfo[index]
    let { opentime, closetime } = newWorkerhours[index], valid = false

    value = open ? opentime : closetime
    
    let { hour, minute, period } = timeControl(timetype, value, dir, open)

    if (open) {
      valid = (
        Date.parse(calcDate + " " + hour + ":" + minute + " " + period) >= openunix
        &&
        Date.parse(calcDate + " " + hour + ":" + minute + " " + period) <= Date.parse(calcDate + " " + closetime.hour + ":" + closetime.minute + " " + closetime.period)
      )
    } else {
      valid = (
        Date.parse(calcDate + " " + hour + ":" + minute + " " + period) <= closeunix
        &&
        Date.parse(calcDate + " " + hour + ":" + minute + " " + period) >= Date.parse(calcDate + " " + opentime.hour + ":" + opentime.minute + " " + opentime.period)
      )
    }
      
    if (valid) {
      value.hour = hour < 10 ? "0" + hour : hour.toString()
      value.minute = minute < 10 ? "0" + minute : minute.toString()
      value.period = period

      if (open) {
        newWorkerhours[index].opentime = value
      } else {
        newWorkerhours[index].closetime = value
      }

      setWorkerhours(newWorkerhours)
    }
  }

  return (
    <SafeAreaView style={[styles.workinghours, { opacity: loading ? 0.5 : 1 }]}>
      {!type ? 
        <View style={styles.introBox}>
          <Text style={styles.introHeader}>The Final Step</Text>
          <Text style={styles.introHeader}>Let's set your working days and hours</Text>
          <TouchableOpacity style={styles.submit} disabled={loading} onPress={() => getInfo()}>
            <Text style={styles.submitHeader}>Let's go</Text>
          </TouchableOpacity>
        </View>
        :
        loaded ? 
          <ScrollView style={{ height: '90%', width: '100%' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.boxHeader}>Your time</Text>
              <Text style={styles.boxMiniheader}>Set your working days and hours</Text>

              {!daysInfo.done ? 
                <View style={{ alignItems: 'center', width: '100%' }}>
                  <Text style={styles.workerDayHeader}>Tap the days you work on</Text>

                  {daysArr.map((day, index) => (
                    <TouchableOpacity key={index} disabled={hoursRange[index].close} style={
                      !hoursRange[index].close ? 
                        daysInfo.working.indexOf(day) > -1 ? 
                          styles.workerDayTouchSelected : styles.workerDayTouch
                        :
                        styles.workerDayTouchOff
                    } onPress={() => {
                      const newWorking = [...daysInfo.working]

                      if (newWorking[index] == '') {
                        newWorking[index] = day
                      } else {
                        newWorking[index] = ''
                      }

                      setDaysinfo({ ...daysInfo, working: newWorking })
                    }}>
                      <Text style={styles.workerDayTouchHeader}>{day}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                :
                <View style={styles.workerHours}>
                  <TouchableOpacity style={styles.workerHoursBack} onPress={() => setDaysinfo({ working: ['', '', '', '', '', '', ''], done: false })}>
                    <Text style={styles.workerHoursBackHeader}>Go Back</Text>
                  </TouchableOpacity>

                  {workerHours.map((info, index) => (
                    info.working ?
                      <View key={index} style={styles.workerHour}>
                        <Text style={styles.workerHourHeader}><Text style={{ fontWeight: '300' }}>Your working time for</Text> {info.header}</Text>

                        <View style={styles.timeSelectionContainer}>
                          <View style={styles.timeSelection}>
                            <View style={styles.selection}>
                              <TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "up", true)}>
                                <AntDesign name="up" size={wsize(6)}/>
                              </TouchableOpacity>
                              <TextInput style={styles.selectionHeader} onChangeText={(hour) => {
                                const newWorkerhours = [...workerHours]

                                newWorkerhours[index].opentime["hour"] = hour.toString()

                                setWorkerhours(newWorkerhours)
                              }} keyboardType="numeric" maxLength={2} value={info.opentime.hour}/>
                              <TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "down", true)}>
                                <AntDesign name="down" size={wsize(6)}/>
                              </TouchableOpacity>
                            </View>
                            <View style={styles.selectionDivHolder}>
                              <Text style={styles.selectionDiv}>:</Text>
                            </View>
                            <View style={styles.selection}>
                              <TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "up", true)}>
                                <AntDesign name="up" size={wsize(6)}/>
                              </TouchableOpacity>
                              <TextInput style={styles.selectionHeader} onChangeText={(minute) => {
                                const newWorkerhours = [...workerHours]

                                newWorkerhours[index].opentime["minute"] = minute.toString()

                                setWorkerhours(newWorkerhours)
                              }} keyboardType="numeric" maxLength={2} value={info.opentime.minute}/>
                              <TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "down", true)}>
                                <AntDesign name="down" size={wsize(6)}/>
                              </TouchableOpacity>
                            </View>
                            <View style={styles.selection}>
                              <TouchableOpacity onPress={() => updateWorkingHour(index, "period", "up", true)}>
                                <AntDesign name="up" size={wsize(6)}/>
                              </TouchableOpacity>
                              <Text style={styles.selectionHeader}>{info.opentime.period}</Text>
                              <TouchableOpacity onPress={() => updateWorkingHour(index, "period", "down", true)}>
                                <AntDesign name="down" size={wsize(6)}/>
                              </TouchableOpacity>
                            </View>
                          </View>
                          <View style={styles.timeSelectionHeaderHolder}>
                            <Text style={styles.timeSelectionHeader}>To</Text>
                          </View>
                          <View style={styles.timeSelection}>
                            <View style={styles.selection}>
                              <TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "up", false)}>
                                <AntDesign name="up" size={wsize(6)}/>
                              </TouchableOpacity>
                              <TextInput style={styles.selectionHeader} onChangeText={(hour) => {
                                const newWorkerhours = [...workerHours]

                                newWorkerhours[index].closetime["hour"] = hour.toString()

                                setWorkerhours(newWorkerhours)
                              }} keyboardType="numeric" maxLength={2} value={info.closetime.hour}/>
                              <TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "down", false)}>
                                <AntDesign name="down" size={wsize(6)}/>
                              </TouchableOpacity>
                            </View>
                            <View style={styles.selectionDivHolder}>
                              <Text style={styles.selectionDiv}>:</Text>
                            </View>
                            <View style={styles.selection}>
                              <TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "up", false)}>
                                <AntDesign name="up" size={wsize(6)}/>
                              </TouchableOpacity>
                              <TextInput style={styles.selectionHeader} onChangeText={(minute) => {
                                const newWorkerhours = [...workerHours]

                                newWorkerhours[index].closetime["minute"] = minute.toString()

                                setWorkerhours(newWorkerhours)
                              }} keyboardType="numeric" maxLength={2} value={info.closetime.minute}/>
                              <TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "down", false)}>
                                <AntDesign name="down" size={wsize(6)}/>
                              </TouchableOpacity>
                            </View>
                            <View style={styles.selection}>
                              <TouchableOpacity onPress={() => updateWorkingHour(index, "period", "up", false)}>
                                <AntDesign name="up" size={wsize(6)}/>
                              </TouchableOpacity>
                              <Text style={styles.selectionHeader}>{info.closetime.period}</Text>
                              <TouchableOpacity onPress={() => updateWorkingHour(index, "period", "down", false)}>
                                <AntDesign name="down" size={wsize(6)}/>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </View>
                    : null
                  ))}
                </View>
              }

              <Text style={styles.errorMsg}>{errorMsg}</Text>
              
              <TouchableOpacity style={styles.submit} disabled={loading} onPress={() => !daysInfo.done ? setTime() : done()}>
                <Text style={styles.submitHeader}>{!daysInfo.done ? "Next" : "Done"}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          :
          <View style={styles.loading}>
            <ActivityIndicator color="black" size="large"/>
          </View>
      }

      <View style={styles.bottomNavs}>
        <View style={styles.bottomNavsRow}>
          <TouchableOpacity style={styles.bottomNav} onPress={() => {
            AsyncStorage.clear()

            navigation.dispatch(
              CommonActions.reset({
                index: 1,
                routes: [{ name: 'auth' }]
              })
            );
          }}>
            <Text style={styles.bottomNavHeader}>Log-Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && <Modal transparent={true}><Loadingprogress/></Modal>}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  workinghours: { backgroundColor: '#EAEAEA', height: '100%', paddingTop: Platform.OS == "ios" ? 0 : Constants.statusBarHeight, width: '100%' },
  box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
  boxHeader: { fontFamily: 'appFont', fontSize: wsize(7), paddingVertical: 30 },
  boxMiniheader: { fontFamily: 'appFont', fontSize: wsize(6), marginBottom: 30, marginHorizontal: 20, textAlign: 'center' },

  introBox: { alignItems: 'center', flexDirection: 'column', height: '90%', justifyContent: 'space-around', paddingHorizontal: 10, width: '100%' },
  introHeader: { fontSize: wsize(6), paddingHorizontal: 10, textAlign: 'center' },

  workerHours: { alignItems: 'center', marginBottom: 50, width: '100%' },

  // select working days
  workerDayHeader: { fontSize: wsize(6) },
  workerDayTouch: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: '90%' },
  workerDayTouchSelected: { backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: '90%' },
  workerDayTouchOff: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 5, opacity: 0.2, padding: 5, width: '90%' },
  workerDayTouchHeader: { fontSize: wsize(6), textAlign: 'center' },

  workerHoursBack: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginBottom: 20, padding: 10 },
  workerHoursBackHeader: { fontFamily: 'appFont', fontSize: wsize(6), textAlign: 'center' },

  // adjust working time for each day
  workerHour: { alignItems: 'center', backgroundColor: 'white', borderRadius: 10, marginTop: 30, padding: 5, width: '95%' },
  workerHourHeader: { fontSize: wsize(5), fontWeight: 'bold', marginBottom: 10, marginHorizontal: 10, textAlign: 'center' },
  workerHourAnswer: { alignItems: 'center' },
  workerHourAnswerActions: { flexDirection: 'row', justifyContent: 'space-between' },
  workerHourAnswerAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 10, width: wsize(10) },
  workerHourAnswerActionHeader: { fontSize: wsize(6) },
  timeSelectionContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  timeSelection: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, flexDirection: 'row', justifyContent: 'space-between', width: '45%' },
  timeSelectionHeaderHolder: { flexDirection: 'column', justifyContent: 'space-around', width: '10%' },
  timeSelectionHeader: { fontSize: wsize(6), fontWeight: 'bold', textAlign: 'center' },
  selection: { alignItems: 'center', margin: 5 },
  selectionHeader: { fontSize: wsize(6), textAlign: 'center' },
  selectionDivHolder: { flexDirection: 'column', justifyContent: 'space-around' },
  selectionDiv: { fontSize: wsize(6) },

  submit: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 30, padding: 5 },
  submitHeader: { fontFamily: 'appFont', fontSize: wsize(7), textAlign: 'center' },

  bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
  bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
  bottomNavHeader: { fontSize: wsize(5), fontWeight: 'bold' },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
  errorMsg: { color: 'darkred', fontSize: wsize(5), textAlign: 'center' },
})
