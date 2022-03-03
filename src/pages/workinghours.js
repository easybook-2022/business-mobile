import React, { useState } from 'react'
import { SafeAreaView, ActivityIndicator, Dimensions, ScrollView, View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { setOwnerHours } from '../apis/owners'

import AntDesign from 'react-native-vector-icons/AntDesign'

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
  const [workerHours, setWorkerhours] = useState([
    { key: "0", header: "Sunday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: null },
    { key: "1", header: "Monday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: null },
    { key: "2", header: "Tuesday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: null },
    { key: "3", header: "Wednesday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: null },
    { key: "4", header: "Thursday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: null },
    { key: "5", header: "Friday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: null },
    { key: "6", header: "Saturday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: null }
  ])
  const [errorMsg, setErrormsg] = useState('')
  const [loading, setLoading] = useState(false)
  
  const getInfo = async() => setType(await AsyncStorage.getItem("locationtype"))
  const setTime = () => {
    const newWorkerhours = []
    let emptyDays = true

    daysArr.forEach(function (day, index) {
      newWorkerhours.push({ 
        key: newWorkerhours.length.toString(), 
        header: day, 
        opentime: { hour: "12", minute: "00", period: "AM" }, 
        closetime: { hour: "11", minute: "59", period: "PM" }, 
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
            setLoading(false)
          } else {
            alert("done")
          }
        })
    } else {
      setLoading(false)
      setErrormsg("Please choose an option for all the days")
    }
  }
  const updateWorkingHour = (index, timetype, dir, open) => {
    const newWorkerhours = [...workerHours]
    let value, period

    value = open ? 
      newWorkerhours[index].opentime[timetype]
      :
      newWorkerhours[index].closetime[timetype]

    switch (timetype) {
      case "hour":
        value = parseInt(value)
        value = dir == "up" ? value + 1 : value - 1

        if (value > 12) {
          value = 1
        } else if (value < 1) {
          value = 12
        }

        if (value < 10) {
          value = "0" + value
        } else {
          value = value.toString()
        }

        break
      case "minute":
        value = parseInt(value)
        value = dir == "up" ? value + 1 : value - 1

        if (value > 59) {
          value = 0
        } else if (value < 0) {
          value = 59
        }

        if (value < 10) {
          value = "0" + value
        } else {
          value = value.toString()
        }

        break
      case "period":
        value = value == "AM" ? "PM" : "AM"

        break
      default:
    }

    if (open) {
      newWorkerhours[index].opentime[timetype] = value
    } else {
      newWorkerhours[index].closetime[timetype] = value
    }

    setWorkerhours(newWorkerhours)
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
        <ScrollView style={{ height: '90%', width: '100%' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.boxHeader}>Your time</Text>
            <Text style={styles.boxMiniheader}>Set your working days and hours</Text>

            {!daysInfo.done ? 
              <View style={{ alignItems: 'center', width: '100%' }}>
                <Text style={styles.workerDayHeader}>Tap the days you work on</Text>

                {daysArr.map((day, index) => (
                  <TouchableOpacity key={index} style={daysInfo.working.indexOf(day) > -1 ? styles.workerDayTouchSelected : styles.workerDayTouch} onPress={() => {
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
                      <Text style={styles.workerHourHeader}>Set your working time for {info.header}</Text>
                      <Text style={[styles.workerHourHeader, { marginTop: 10 }]}>Use the arrow to set the time</Text>
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
                            }} keyboardType="numeric" maxLength="2" value={info.opentime.hour}/>
                            <TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "down", true)}>
                              <AntDesign name="down" size={wsize(6)}/>
                            </TouchableOpacity>
                          </View>
                          <View style={styles.column}>
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
                            }} keyboardType="numeric" maxLength="2" value={info.opentime.minute}/>
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
                        <View style={styles.column}>
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
                            }} keyboardType="numeric" maxLength="2" value={info.closetime.hour}/>
                            <TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "down", false)}>
                              <AntDesign name="down" size={wsize(6)}/>
                            </TouchableOpacity>
                          </View>
                          <View style={styles.column}>
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
                            }} keyboardType="numeric" maxLength="2" value={info.closetime.minute}/>
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

            {loading && <ActivityIndicator color="black" size="large"/>}
            
            <TouchableOpacity style={styles.submit} disabled={loading} onPress={() => !daysInfo.done ? setTime() : done()}>
              <Text style={styles.submitHeader}>{!daysInfo.done ? "Next" : "Done"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  workinghours: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },
  box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
  boxHeader: { fontFamily: 'appFont', fontSize: wsize(7), paddingVertical: 30 },
  boxMiniheader: { fontFamily: 'appFont', fontSize: wsize(6), marginBottom: 30, marginHorizontal: 20, textAlign: 'center' },

  introBox: { alignItems: 'center', flexDirection: 'column', height: '90%', justifyContent: 'space-around', paddingHorizontal: 10, width: '100%' },
  introHeader: { fontSize: wsize(6), paddingHorizontal: 10, textAlign: 'center' },

  workerHours: { alignItems: 'center', width: '100%' },

  // select working days
  workerDayHeader: { fontSize: wsize(6) },
  workerDayTouch: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: '90%' },
  workerDayTouchSelected: { backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: '90%' },
  workerDayTouchHeader: { fontSize: wsize(6), textAlign: 'center' },

  workerHoursBack: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginBottom: 20, padding: 10 },
  workerHoursBackHeader: { fontFamily: 'appFont', fontSize: wsize(6), textAlign: 'center' },

  // adjust working time for each day
  workerHour: { alignItems: 'center', backgroundColor: 'white', borderRadius: 10, marginTop: 30, padding: 5, width: '95%' },
  workerHourHeader: { fontSize: wsize(6), fontWeight: 'bold', marginBottom: 10, marginHorizontal: 10, textAlign: 'center' },
  workerHourAnswer: { alignItems: 'center' },
  workerHourAnswerActions: { flexDirection: 'row', justifyContent: 'space-between' },
  workerHourAnswerAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 10, width: wsize(10) },
  workerHourAnswerActionHeader: { fontSize: wsize(6) },
  timeSelectionContainer: { flexDirection: 'row' },
  timeSelection: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, flexDirection: 'row', marginHorizontal: 5 },
  timeSelectionHeader: { fontSize: wsize(7), fontWeight: 'bold' },
  selection: { alignItems: 'center', margin: 5 },
  selectionHeader: { fontSize: wsize(7), textAlign: 'center' },
  selectionDivHolder: { flexDirection: 'column', justifyContent: 'space-around' },
  selectionDiv: { fontSize: wsize(7) },

  submit: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 30, padding: 5 },
  submitHeader: { fontFamily: 'appFont', fontSize: wsize(7), textAlign: 'center' },

  bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
  bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
  bottomNavHeader: { fontSize: wsize(5), fontWeight: 'bold' },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
  errorMsg: { color: 'darkred', fontSize: wsize(5), textAlign: 'center' },
})