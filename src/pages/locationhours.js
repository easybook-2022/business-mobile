import React, { useState } from 'react'

export default function Locationhours({ navigation }) {
  const [daysInfo, setDaysinfo] = useState({ working: ['', '', '', '', '', '', ''], done: false, step: 0, dayIndex: 0, numOpen: 0 })
  const [days, setDays] = useState([])

  const done = () => {
    const hours = {}

    days.forEach(function (day) {
      let { opentime, closetime, close } = day
      let newOpentime = {...opentime}, newClosetime = {...closetime}
      let openhour = parseInt(newOpentime.hour), closehour = parseInt(newClosetime.hour)
      let openperiod = newOpentime.period, closeperiod = newClosetime.period

      delete newOpentime.period
      delete newClosetime.period

      if (close == false || close == true) {
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

        hours[day.header.substr(0, 3)] = { opentime: newOpentime, closetime: newClosetime, close }
      } else {
        invalid = true
      }
    })
  }

  const updateTime = (index, timetype, dir, open) => {
    const newDays = [...days]
    let value, { opentime, closetime } = newDays[index]

    value = open ? opentime : closetime
    
    let { hour, minute, period } = timeControl(timetype, value, dir, open)

    value.hour = hour < 10 ? "0" + hour : hour.toString()
    value.minute = minute < 10 ? "0" + minute : minute.toString()
    value.period = period

    if (open) {
      newDays[index].opentime = value
    } else {
      newDays[index].closetime = value
    }

    setDays(newDays)
  }
  const dayTouch = index => {
    const newDays = [...days]

    newDays[index].close = !newDays[index].close

    setDays(newDays)
  }
  
  return (
    <SafeAreaView style={styles.locationhours}>
      <View style={styles.box}>
        <View style={styles.days}>
          {!daysInfo.done ?
            <>
              <Text style={[styles.inputHeader, { marginBottom: 20, textAlign: 'center' }]}>Set the {(type == 'hair' || type == 'nail') ? type + ' salon' : type}'s opening hours</Text>

              <View style={{ alignItems: 'center', width: '100%' }}>
                <Text style={styles.openingDayHeader}>Tap on the days {(type == 'hair' || type == 'nail') ? type + ' salon' : type} open ?</Text>

                {daysArr.map((day, index) => (
                  <TouchableOpacity key={index} style={daysInfo.working.indexOf(day) > -1 ? styles.openingDayTouchSelected : styles.openingDayTouch} onPress={() => {
                    const newWorking = [...daysInfo.working]

                    if (newWorking[index] == '') {
                      newWorking[index] = day
                    } else {
                      newWorking[index] = ''
                    }

                    setDaysinfo({ ...daysInfo, working: newWorking })
                  }}>
                    <Text style={styles.openingDayTouchHeader}>{day}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
            :
            <View style={styles.daysContainer}>
              <TouchableOpacity style={styles.daysBack} disabled={loading} onPress={() => setDaysinfo({ ...daysInfo, working: ['', '', '', '', '', '', ''], done: false, step: 0 })}>
                <Text style={styles.daysBackHeader}>Re-select days</Text>
              </TouchableOpacity>

              {days.map((info, index) => (
                !info.close && daysInfo.dayIndex == index &&
                  <View key={index} style={styles.day}>
                    <Text style={styles.dayHeader}><Text style={{ fontWeight: '300' }}>Opening time for</Text> {info.header}</Text>

                    <View style={styles.timeSelectionContainer}>
                      <View style={styles.timeSelection}>
                        <View style={styles.selection}>
                          <TouchableOpacity onPress={() => updateTime(index, "hour", "up", true)}>
                            <AntDesign name="up" size={wsize(7)}/>
                          </TouchableOpacity>
                          <TextInput style={styles.selectionHeader} onChangeText={(hour) => {
                            const newDays = [...days]

                            newDays[index].opentime["hour"] = hour.toString()

                            setDays(newDays)
                          }} keyboardType="numeric" maxLength={2} value={info.opentime.hour}/>
                          <TouchableOpacity onPress={() => updateTime(index, "hour", "down", true)}>
                            <AntDesign name="down" size={wsize(7)}/>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.selectionDivHolder}>
                          <Text style={styles.selectionDiv}>:</Text>
                        </View>
                        <View style={styles.selection}>
                          <TouchableOpacity onPress={() => updateTime(index, "minute", "up", true)}>
                            <AntDesign name="up" size={wsize(7)}/>
                          </TouchableOpacity>
                          <TextInput style={styles.selectionHeader} onChangeText={(minute) => {
                            const newDays = [...days]

                            newDays[index].opentime["minute"] = minute.toString()

                            setDays(newDays)
                          }} keyboardType="numeric" maxLength={2} value={info.opentime.minute}/>
                          <TouchableOpacity onPress={() => updateTime(index, "minute", "down", true)}>
                            <AntDesign name="down" size={wsize(7)}/>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.selection}>
                          <TouchableOpacity onPress={() => updateTime(index, "period", "up", true)}>
                            <AntDesign name="up" size={wsize(7)}/>
                          </TouchableOpacity>
                          <Text style={styles.selectionHeader}>{info.opentime.period}</Text>
                          <TouchableOpacity onPress={() => updateTime(index, "period", "down", true)}>
                            <AntDesign name="down" size={wsize(7)}/>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={styles.timeSelectionHeaderHolder}>
                        <Text style={styles.timeSelectionHeader}>To</Text>
                      </View>
                      <View style={styles.timeSelection}>
                        <View style={styles.selection}>
                          <TouchableOpacity onPress={() => updateTime(index, "hour", "up", false)}>
                            <AntDesign name="up" size={wsize(7)}/>
                          </TouchableOpacity>
                          <TextInput style={styles.selectionHeader} onChangeText={(hour) => {
                            const newDays = [...days]

                            newDays[index].closetime["hour"] = hour.toString()

                            setDays(newDays)
                          }} keyboardType="numeric" maxLength={2} value={info.closetime.hour}/>
                          <TouchableOpacity onPress={() => updateTime(index, "hour", "down", false)}>
                            <AntDesign name="down" size={wsize(7)}/>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.selectionDivHolder}>
                          <Text style={styles.selectionDiv}>:</Text>
                        </View>
                        <View style={styles.selection}>
                          <TouchableOpacity onPress={() => updateTime(index, "minute", "up", false)}>
                            <AntDesign name="up" size={wsize(7)}/>
                          </TouchableOpacity>
                          <TextInput style={styles.selectionHeader} onChangeText={(minute) => {
                            const newDays = [...days]

                            newDays[index].closetime["minute"] = minute.toString()

                            setDays(newDays)
                          }} keyboardType="numeric" maxLength={2} value={info.closetime.minute}/>

                          <TouchableOpacity onPress={() => updateTime(index, "minute", "down", false)}>
                            <AntDesign name="down" size={wsize(7)}/>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.selection}>
                          <TouchableOpacity onPress={() => updateTime(index, "period", "up", false)}>
                            <AntDesign name="up" size={wsize(7)}/>
                          </TouchableOpacity>
                          <Text style={styles.selectionHeader}>{info.closetime.period}</Text>
                          <TouchableOpacity onPress={() => updateTime(index, "period", "down", false)}>
                            <AntDesign name="down" size={wsize(7)}/>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
              ))}

              {daysInfo.dayIndex < (daysInfo.numOpen - 1) && (
                <TouchableOpacity style={styles.nextDay} disabled={loading} onPress={() => setDaysinfo({ ...daysInfo, dayIndex: daysInfo.dayIndex + 1 })}>
                  <Text style={styles.nextDayHeader}>Edit Next day</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        </View>
      </View>
    </SafeAreaView>
  )
}
