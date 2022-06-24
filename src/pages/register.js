import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, Platform, ActivityIndicator, Dimensions, ScrollView, View, Text, TextInput, 
  Image, TouchableOpacity, TouchableWithoutFeedback, Modal, Keyboard, StyleSheet, PermissionsAndroid, 
  KeyboardAvoidingView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker';
import { CommonActions } from '@react-navigation/native';
import { tr } from '../../assets/translate'
import { getId, resizePhoto } from 'geottuse-tools';
import { saveUserInfo } from '../apis/owners'
import { getLocationProfile } from '../apis/locations'
import { ownerSigninInfo, registerInfo, timeControl } from '../../assets/info'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import Ionicons from 'react-native-vector-icons/Ionicons'

// widgets
import Loadingprogress from '../widgets/loadingprogress';

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}
const steps = ['nickname', 'profile', 'hours']
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function Register(props) {
  const [language, setLanguage] = useState('')
	const [setupType, setSetuptype] = useState('nickname')
	const [cameraPermission, setCamerapermission] = useState(null);
	const [pickingPermission, setPickingpermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
  const [camType, setCamtype] = useState('front')
  const [choosing, setChoosing] = useState(false)
	const [username, setUsername] = useState(ownerSigninInfo.username)
	const [profile, setProfile] = useState({ uri: '', name: '', size: { width: 0, height: 0 }})

  const [type, setType] = useState('')

  const [daysInfo, setDaysinfo] = useState({ working: ['', '', '', '', '', '', ''], done: false })
  const [workerHours, setWorkerhours] = useState([])
  const [hoursRange, setHoursrange] = useState([])

	const [loading, setLoading] = useState(false)
	const [errorMsg, setErrormsg] = useState('')

  const getInfo = async() => {
    const locationid = await AsyncStorage.getItem("locationid")
    const locationtype = await AsyncStorage.getItem("locationtype")
    const newBusiness = await AsyncStorage.getItem("newBusiness")
    const data = { locationid }

    tr.locale = await AsyncStorage.getItem("language")

    setLanguage(await AsyncStorage.getItem("language"))

    getLocationProfile(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const hours = [...res.info.hours]
          let openHour, openMinute, openPeriod, closeHour, closeMinute, closePeriod
          let openInfo, closeInfo, currDate, calcDate, openTime, closeTime

          for (let k = 0; k < 7; k++) {
            openInfo = hours[k].opentime
            closeInfo = hours[k].closetime

            openMinute = parseInt(openInfo.minute)
            openMinute = openMinute < 10 ? "0" + openMinute : openMinute
            openHour = parseInt(openInfo.hour)
            openHour = openHour < 10 ? "0" + openHour : openHour
            openPeriod = openInfo.period

            closeMinute = parseInt(closeInfo.minute)
            closeMinute = closeMinute < 10 ? "0" + closeMinute : closeMinute
            closeHour = parseInt(closeInfo.hour)
            closeHour = closeHour < 10 ? "0" + closeHour : closeHour
            closePeriod = closeInfo.period

            currDate = new Date()
            calcDate = new Date(currDate.setDate(currDate.getDate() - currDate.getDay() + k));

            let day = days[calcDate.getDay()]
            let month = months[calcDate.getMonth()]
            let date = calcDate.getDate()
            let year = calcDate.getFullYear()
            let dateStr = day + " " + month + " " + date + " " + year

            openTime = openHour + ":" + openMinute + " " + openPeriod
            closeTime = closeHour + ":" + closeMinute + " " + closePeriod

            hours[k].opentime.hour = openHour.toString()
            hours[k].opentime.minute = openMinute.toString()
            hours[k].closetime.hour = closeHour.toString()
            hours[k].closetime.minute = closeMinute.toString()

            hours[k]["date"] = dateStr
            hours[k]["openTime"] = Date.parse(dateStr + " " + openTime)
            hours[k]["closeTime"] = Date.parse(dateStr + " " + closeTime)
          }

          setType(locationtype)
          setWorkerhours(hours)
          setHoursrange(hours)
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

    days.forEach(function (day, index) {
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
      setErrormsg('')
    }
  }

	const register = async() => {
    setLoading(true)

    const id = await AsyncStorage.getItem("ownerid")
    const hours = {}
    let invalid = false

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
      const data = { id, username, profile, permission: cameraPermission || pickingPermission, hours }

      saveUserInfo(data)
        .then((res) => {
            if (res.status == 200) {
              return res.data
            }
          })
          .then((res) => {
            if (res) {
              const { msg } = res

              setLoading(false)
              AsyncStorage.setItem("phase", "main")

              props.navigation.dispatch(CommonActions.reset({ index: 1, routes: [{ name: "main", params: { firstTime: true }}]}));
            }
          })
          .catch((err) => {
            if (err.response && err.response.status == 400) {
              const { errormsg, status } = err.response.data

              setErrormsg(tr.t("register.nameErrormsg"))
            }

            setLoading(false)
          })
    } else {
      setErrormsg("Please choose an option for all the days")

      setLoading(false)
    }
	}
	const saveInfo = () => {
		const index = steps.indexOf(setupType)
		let nextStep, msg = ""

		setLoading(true)

		switch (index) {
			case 0:
				if (!username) {
					msg = "Please provide a name you like"
				}

        break
      default:
		}

		if (msg == "") {
			nextStep = index == 2 ? "done" : steps[index + 1]

			if (nextStep == "profile") {
				allowCamera()
				allowChoosing()
			}

			setSetuptype(nextStep)
      setErrormsg("")
		} else {
			setErrormsg(msg)
		}

		setLoading(false)
	}
	const snapPhoto = async() => {
    setLoading(true)

		if (camComp) {
			let options = { quality: 0, skipProcessing: true };
      let char = getId(), photo = await camComp.takePictureAsync(options)
      let photo_option = [{ resize: { width, height: width }}]
      let photo_save_option = { format: ImageManipulator.SaveFormat.JPEG, base64: true }

      if (camType == "front") {
        photo_option.push({ flip: ImageManipulator.FlipType.Horizontal })
      }

      photo = await ImageManipulator.manipulateAsync(
        photo.localUri || photo.uri,
        photo_option,
        photo_save_option
      )

      FileSystem.moveAsync({
        from: photo.uri,
        to: `${FileSystem.documentDirectory}/${char}.jpg`
      })
      .then(() => {
        setProfile({
          uri: `${FileSystem.documentDirectory}/${char}.jpg`,
          name: `${char}.jpg`, size: { width, height: width }
        })
        setLoading(false)
      })	
		}
	}
	const choosePhoto = async() => {
    setChoosing(true)

		let char = getId(), photo = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [1, 1],
      quality: 0
    });

    photo = await ImageManipulator.manipulateAsync(
      photo.localUri || photo.uri,
      [{ resize: resizePhoto(photo, width) }],
      { compress: 0.1 }
    )

		if (!photo.cancelled) {
			FileSystem.moveAsync({
				from: photo.uri,
				to: `${FileSystem.documentDirectory}/${char}.jpg`
			})
			.then(() => {
				setProfile({
					uri: `${FileSystem.documentDirectory}/${char}.jpg`,
					name: `${char}.jpg`, size: { width, height: width }
				})
			})
		}

    setChoosing(false)
	}
	const allowCamera = async() => {
  	if (Platform.OS === "ios") {
      const { status } = await Camera.getCameraPermissionsAsync()

      if (status == 'granted') {
        setCamerapermission(status === 'granted')
      } else {
        const { status } = await Camera.requestCameraPermissionsAsync()

        setCamerapermission(status === 'granted')
      }
    } else {
      const status = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA)

      if (!status) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "EasyGO Business uses camera to allow you to take a photo of yourself",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setCamerapermission(true)
        }
      } else {
        setCamerapermission(true)
      }
    }
	}
	const allowChoosing = async() => {
    if (Platform.OS === "ios") {
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync()
          
      if (status == 'granted') {
        setPickingpermission(status === 'granted')
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        setPickingpermission(status === 'granted')
      }
    } else {
      setPickingpermission(true)
    }
	}

  const updateWorkingHour = (index, timetype, dir, open) => {
    const newWorkerhours = [...workerHours], hoursRangeInfo = [...hoursRange]
    let value, { openTime, closeTime, date } = hoursRangeInfo[index]
    let { opentime, closetime } = newWorkerhours[index], valid = false

    value = open ? opentime : closetime
    
    let { hour, minute, period } = timeControl(timetype, value, dir, open)
    let calcTime = Date.parse(date + " " + hour + ":" + minute + " " + period)

    if (open) {
      valid = (calcTime >= openTime && calcTime <= Date.parse(date + " " + closetime.hour + ":" + closetime.minute + " " + closetime.period))
    } else {
      valid = (calcTime <= closeTime && calcTime >= Date.parse(date + " " + opentime.hour + ":" + opentime.minute + " " + opentime.period))
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

  useEffect(() => {
    getInfo()
  }, [])

	return (
		<SafeAreaView style={styles.register}>
			<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
				<>
          {setupType != "hours" ? 
            <View style={[styles.box, { opacity: loading ? 0.5 : 1 }]}>
    					<View style={styles.inputsBox}>
                <Text style={styles.boxHeader}>{tr.t("register.header")}</Text>

    						{setupType == "nickname" && (
    							<View style={styles.inputContainer}>
    								<Text style={styles.inputHeader}>{tr.t("register.name")}</Text>
    								<TextInput style={styles.input} onChangeText={(username) => setUsername(username)} value={username} autoCorrect={false} autoCapitalize="none"/>
    							</View>
    						)}

                {(setupType == "profile" && (cameraPermission || pickingPermission)) && (
    							<View style={styles.cameraContainer}>
    								<Text style={[styles.inputHeader, { fontSize: wsize(5), textAlign: 'center' }]}>{tr.t("register.photo")}</Text>

    								{profile.uri ? (
    									<>
    										<Image style={styles.camera} source={{ uri: profile.uri }}/>

    										<TouchableOpacity style={styles.cameraAction} onPress={() => setProfile({ uri: '', name: '' })}>
    											<Text style={styles.cameraActionHeader}>{tr.t("buttons.cancel")}</Text>
    										</TouchableOpacity>
    									</>
    								) : (
    									<>
      									{!choosing && (
                          <Camera 
                            style={styles.camera} 
                            type={camType}
                            ref={r => {setCamcomp(r)}}
                            ratio="1:1"
                          />
                        )}

                        <View style={{ alignItems: 'center', marginTop: -wsize(7) }}>
                          <Ionicons color="black" name="camera-reverse-outline" size={wsize(7)} onPress={() => setCamtype(camType == 'back' ? 'front' : 'back')}/>
                        </View>

    										<View style={styles.cameraActions}>
    											<TouchableOpacity style={[styles.cameraAction, { opacity: loading ? 0.5 : 1 }]} disabled={loading} onPress={snapPhoto.bind(this)}>
    												<Text style={styles.cameraActionHeader}>{tr.t("buttons.takePhoto")}</Text>
    											</TouchableOpacity>
    											<TouchableOpacity style={[styles.cameraAction, { opacity: loading ? 0.5 : 1 }]} disabled={loading} onPress={() => {
                            allowChoosing()
                            choosePhoto()
                          }}>
    												<Text style={styles.cameraActionHeader}>{tr.t("buttons.choosePhoto")}</Text>
    											</TouchableOpacity>
    										</View>
    									</>
    								)}
    							</View>
    						)}

                <Text style={styles.errorMsg}>{errorMsg}</Text>

    						<View style={styles.actions}>
    							{setupType != 'nickname' && (
    								<TouchableOpacity style={[styles.action, { opacity: loading ? 0.3 : 1 }]} onPress={() => {
    									let index = steps.indexOf(setupType)
    									
    									index--

    									setSetuptype(steps[index])
    								}}>
    									<Text style={styles.actionHeader}>{tr.t("buttons.back")}</Text>
    								</TouchableOpacity>
    							)}

    							<TouchableOpacity style={[styles.action, { opacity: loading ? 0.3 : 1 }]} disabled={loading} onPress={() => saveInfo()}>
    								<Text style={styles.actionHeader}>{setupType == "profile" ? profile.uri ? tr.t("buttons.next") : tr.t("buttons.skip") : tr.t("buttons.next")}</Text>
    							</TouchableOpacity>
    						</View>
    					</View>
            </View>
            :
            <ScrollView style={{ backgroundColor: '#EAEAEA', height: '90%', width: '100%' }}>
              <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : "position"}>
                {!daysInfo.done ? 
                  <View style={{ alignItems: 'center', width: '100%' }}>
                    <Text style={styles.workerDayHeader}>{tr.t("register.workingDays.header")}</Text>

                    {days.map((day, index) => (
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
                        <Text style={[styles.workerDayTouchHeader, { color: daysInfo.working.indexOf(day) > -1 ? 'white' : 'black' }]}>{tr.t("days." + day)}</Text>
                      </TouchableOpacity>
                    ))}

                    <TouchableOpacity style={styles.submit} disabled={loading} onPress={() => setTime()}>
                      <Text style={styles.submitHeader}>{tr.t("buttons.next")}</Text>
                    </TouchableOpacity>
                  </View>
                  :
                  <>
                    <View style={styles.workerHours}>
                      <TouchableOpacity style={styles.workerHoursBack} onPress={() => setDaysinfo({ ...daysInfo, done: false })}>
                        <Text style={styles.workerHoursBackHeader}>{tr.t("buttons.changeDays")}</Text>
                      </TouchableOpacity>

                      {workerHours.map((info, index) => (
                        info.working ?
                          <View key={index} style={styles.workerHour}>
                            <Text style={styles.workerHourHeader}>{tr.t("register.workingDays.hour").replace("{day}", tr.t("days." + info.header))}</Text>

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

                    <View style={styles.actions}>
                      {setupType != 'nickname' && (
                        <TouchableOpacity style={[styles.action, { opacity: loading ? 0.3 : 1 }]} onPress={() => {
                          let index = steps.indexOf(setupType)
                          
                          index--

                          setSetuptype(steps[index])
                        }}>
                          <Text style={styles.actionHeader}>{tr.t("buttons.back")}</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity style={[styles.action, { opacity: loading ? 0.3 : 1 }]} disabled={loading} onPress={() => register()}>
                        <Text style={styles.actionHeader}>{tr.t("buttons.done")}</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                }
              </KeyboardAvoidingView>
            </ScrollView>
          }

					<View style={styles.bottomNavs}>
						<View style={styles.bottomNavsRow}>
							<TouchableOpacity style={styles.bottomNav} onPress={() => {
								AsyncStorage.clear()

                props.navigation.dispatch(CommonActions.reset({ index: 1, routes: [{ name: "auth" }]}));
							}}>
								<Text style={styles.bottomNavHeader}>Log-Out</Text>
							</TouchableOpacity>
						</View>
					</View>
        </>
			</TouchableWithoutFeedback>

      {loading && <Modal transparent={true}><Loadingprogress/></Modal>}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	register: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { alignItems: 'center', backgroundColor: '#EAEAEA', flexDirection: 'column', height: '90%', justifyContent: 'space-between', width: '100%' },
	boxHeader: { color: 'black', fontFamily: 'Chilanka_400Regular', fontSize: wsize(7), fontWeight: 'bold', textAlign: 'center' },

	inputsBox: { alignItems: 'center', height: '90%', width: '100%' },
	inputContainer: { width: '90%' },
	inputHeader: { fontSize: wsize(10) },
  inputInfo: { fontSize: wsize(4), margin: 10, textAlign: 'center' },
	input: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(10), paddingHorizontal: 5, width: '100%' },

	cameraContainer: { alignItems: 'center', width: '100%' },
	camera: { height: width, width },
	cameraActions: { flexDirection: 'row' },
	cameraAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: wsize(30) },
	cameraActionHeader: { fontSize: wsize(4), textAlign: 'center' },

  workerHours: { alignItems: 'center', width: '100%' },

  // select working days
  workerDayHeader: { fontSize: wsize(6), fontWeight: 'bold', paddingVertical: 10, textAlign: 'center' },
  workerDayTouch: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: '90%' },
  workerDayTouchSelected: { backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: '90%' },
  workerDayTouchOff: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 5, opacity: 0.2, padding: 5, width: '90%' },
  workerDayTouchHeader: { fontSize: wsize(6), textAlign: 'center' },

  workerHoursBack: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, padding: 10 },
  workerHoursBackHeader: { fontSize: wsize(6), textAlign: 'center' },

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
  submitHeader: { fontFamily: 'Chilanka_400Regular', fontSize: wsize(7), textAlign: 'center' },

	actions: { flexDirection: 'row', justifyContent: 'space-around' },
	action: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 10, width: wsize(30) },
	actionHeader: { fontFamily: 'Chilanka_400Regular', fontSize: wsize(5), textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
	bottomNavHeader: { fontSize: wsize(4), fontWeight: 'bold' },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
  errorMsg: { color: 'darkred', fontSize: wsize(5), textAlign: 'center' },
})
