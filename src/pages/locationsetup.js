import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, ActivityIndicator, Platform, Dimensions, ScrollView, View, Text, TextInput, 
  Image, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Modal, StyleSheet, PermissionsAndroid, 
  KeyboardAvoidingView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { CommonActions } from '@react-navigation/native';
import { setupLocation } from '../apis/locations'
import { registerLocationInfo, timeControl } from '../../assets/info'
import { tr } from '../../assets/translate'
import { getId, displayPhonenumber, resizePhoto } from 'geottuse-tools'

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import Ionicons from 'react-native-vector-icons/Ionicons'

// widgets
import Loadingprogress from '../widgets/loadingprogress';

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}
const hsize = p => {return height * (p / 100)}

const steps = ['name', 'location', 'phonenumber', 'logo', 'hours']
const daysArr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function Locationsetup({ navigation }) {
  const [language, setLanguage] = useState('')
	const [setupType, setSetuptype] = useState('')
	const [cameraPermission, setCamerapermission] = useState(null);
	const [pickingPermission, setPickingpermission] = useState(null);
	const [locationPermission, setLocationpermission] = useState(null)
  const [newBusiness, setNewbusiness] = useState(null)

  const [region, setRegion] = useState({
    latitude: null,
    longitude: null,
    latitudeDelta: null,
    longitudeDelta: null
  })
	const [camComp, setCamcomp] = useState(null)
  const [camType, setCamtype] = useState('back')
  const [choosing, setChoosing] = useState(false)
	const [locationCoords, setLocationcoords] = useState({ longitude: null, latitude: null, address: '' })

	const [storeName, setStorename] = useState(registerLocationInfo.storeName)
	const [phonenumber, setPhonenumber] = useState(registerLocationInfo.phonenumber)

	const [type, setType] = useState('restaurant')

	const [logo, setLogo] = useState({ uri: '', name: '', size: { width: 0, height: 0 }})

  const [daysInfo, setDaysinfo] = useState({ working: ['', '', '', '', '', '', ''], done: false, sameHours: null, step: 0 })
  const [days, setDays] = useState([])
  const [daySamehours, setDaysamehours] = useState({})

	const [loading, setLoading] = useState(false)
	const [errorMsg, setErrormsg] = useState('')

	const setupYourLocation = async() => {
    setLoading(true)

		const ownerid = await AsyncStorage.getItem("ownerid")
    const hours = {}, { sameHours } = daysInfo, { longitude, latitude } = region
		let invalid = false

		if (storeName && phonenumber) {
      days.forEach(function (day) {
        let { opentime, closetime, close } = sameHours == true && !day.close ? daySamehours : day
        let newOpentime = {...opentime}, newClosetime = {...closetime}
        let openhour = parseInt(newOpentime.hour), closehour = parseInt(newClosetime.hour)
        let openperiod = newOpentime.period, closeperiod = newClosetime.period

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

          delete newOpentime.period
          delete newClosetime.period

          hours[day.header.substr(0, 3)] = { opentime: newOpentime, closetime: newClosetime, close }
        } else {
          invalid = true
        }
      })

			const data = {
				storeName, phonenumber, logo, hours, type, 
				longitude, latitude, ownerid
			}

			if (!invalid) {
        setupLocation(data)
          .then((res) => {
            if (res.status == 200) {
              return res.data
            }
          })
          .then((res) => {
            if (res) {
              const { id, ownerProfile } = res

              AsyncStorage.setItem("locationid", id.toString())
              AsyncStorage.setItem("locationtype", type)

              setLoading(false)

              if (type == "restaurant" || type == "store") {
                AsyncStorage.setItem("phase", "main")

                navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "main", params: { firstTime: !newBusiness ? true : false }}]}));
              } else {
                if (ownerProfile["name"] != undefined) {
                  AsyncStorage.setItem("phase", "main")

                  navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "main" }]}));
                } else {
                  AsyncStorage.setItem("phase", "register")

                  navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "register" }]}));
                }
              }
            }
          })
          .catch((err) => {
            if (err.response && err.response.status == 400) {
              const { errormsg, status } = err.response.data

              setErrormsg(errormsg)
              setLoading(false)
            }
          })
			} else {
        setLoading(false)
				setErrormsg("Please choose an option for all the days")
			}
		} else {
      setLoading(false)

			if (!storeName) {
				setErrormsg("Please enter your business name")

				return
			}

			if (!phonenumber) {
				setErrormsg("Please enter your business phone number")

				return
			}
		}
	}
	const saveInfo = async() => {
		const index = steps.indexOf(setupType)
		let msg = "", skip = false

		switch (index) {
			case 0:
				if (!storeName) {
          msg = "Please enter the name of your " + type
        }

        break
			case 2:
				if (!phonenumber) {
					msg = "Please provide the " + type + " phone number"
				}

				break
      case 4:
        if (!daysInfo.done) {
          const newDays = []
          const newDaysamehours = {}

          daysArr.forEach(function (day, index) {
            newDays.push({ 
              key: "day-" + newDays.length.toString(), 
              header: day, 
              opentime: { hour: "06", minute: "00", period: "AM" }, 
              closetime: { hour: "09", minute: "00", period: "PM" }, 
              close: daysInfo.working[index] ? false : true
            })
          })

          newDaysamehours["opentime"] = { hour: "06", minute: "00", period: "AM" }
          newDaysamehours["closetime"] = { hour: "09", minute: "00", period: "PM" }
          newDaysamehours["close"] = false

          if (JSON.stringify(newDays).includes("\"close\":false")) {
            setDaysinfo({ ...daysInfo, done: true, step: 1 })
            setDays(newDays)
            setDaysamehours(newDaysamehours)

            skip = true
          } else {
            msg = "You didn't select any opening day"
          }
        }

        break
			default:
		}

		if (!skip) {
			if (msg == "") {
				const nextStep = index == 4 ? "done" : steps[index + 1]

				if (nextStep == "logo") {
					allowCamera()
					allowChoosing()
				}

				setSetuptype(nextStep)
				setErrormsg('')
			} else {
				setErrormsg(msg)
			}
		} else {
			setErrormsg('')
		}

		setLoading(false) 
	}

	const snapPhoto = async() => {
    setLoading(true)

		let char = getId()

		if (camComp) {
			let options = { quality: 0, skipProcessing: true };
			let photo = await camComp.takePictureAsync(options)
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
				setLogo({
					uri: `${FileSystem.documentDirectory}/${char}.jpg`,
					name: `${char}.jpg`,
          size: { width, height: width }
				})
				setErrormsg('')
        setLoading(false)
			})
		}
	}
	const choosePhoto = async() => {
    setChoosing(true)

		let char = getId(), photo = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
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
				setLogo({
          ...logo, 
					uri: `${FileSystem.documentDirectory}/${char}.jpg`,
					name: `${char}.jpg`,
          size: { width: photo.width, height: photo.height }
				})
				setErrormsg('')
			})
		}

    setChoosing(false)
	}

  const getCoords = (info) => {
    const { lat, lng } = info

    setRegion({ 
      ...region, 
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.001,
      longitudeDelta: 0.001
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
  const updateSameTime = (timetype, dir, open) => {
    const newDaysamehours = {...daySamehours}
    let value, { opentime, closetime } = {...newDaysamehours}

    value = open ? opentime : closetime
    
    let { hour, minute, period } = timeControl(timetype, value, dir, open)

    value.hour = hour < 10 ? "0" + hour : hour.toString()
    value.minute = minute < 10 ? "0" + minute : minute.toString()
    value.period = period

    if (open) {
      newDaysamehours.opentime = value
    } else {
      newDaysamehours.closetime = value
    }

    setDaysamehours(newDaysamehours)
  }
  const dayTouch = index => {
    const newDays = [...days]

    newDays[index].close = !newDays[index].close

    setDays(newDays)
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
            message: "EasyBook Business allows you to take a photo for your business",
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

  const initialize = async() => {
    setNewbusiness(await AsyncStorage.getItem("newBusiness"))

    tr.locale = await AsyncStorage.getItem("language")

    setLanguage(await AsyncStorage.getItem("language"))
  }

  useEffect(() => {
    initialize()
  }, [])

  useEffect(() => {
    if (setupType == "type" && type) saveInfo()
  }, [type])

  const header = type == 'hair' || type == 'nail' ? type + " salon" : type

  if (!language) return <View></View>
  
	return (
		<SafeAreaView style={[styles.locationsetup, { opacity: loading ? 0.5 : 1 }]}>
      <View style={styles.box}>
        <View style={{ height: '90%' }}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            {setupType == "location" || setupType == "hours" ? 
              <>
                {setupType == "location" && (
                  <View style={styles.locationContainer}>
                    <Text style={styles.locationHeader}>{tr.t("locationsetup.location.addressHeader")}</Text>

                    <View style={{ flex: 1, width: '90%' }}>
                      <GooglePlacesAutocomplete
                        placeholder="Type in address"
                        minLength={2} 
                        fetchDetails={true}
                        onPress={(data, details = null) => getCoords(details.geometry.location)}
                        query={{ key: 'AIzaSyAKftYxd_CLjHhk0gAKppqB3LxgR6aYFjE', language: 'en' }}
                        nearbyPlacesAPI='GooglePlacesSearch'
                        debounce={100}
                      />

                      {region.longitude && (
                        <MapView
                          style={{ flex: 1 }}
                          region={region}
                          showsUserLocation={true}
                          onRegionChange={(reg) => setRegion({ ...region, reg })}>
                          <Marker coordinate={region} />
                        </MapView>
                      )}
                    </View>

                    <View style={styles.actionContainer}>
                      <Text style={styles.errorMsg}>{errorMsg}</Text>

                      <View style={styles.actions}>
                        {steps.indexOf(setupType) > 0 && (
                          <TouchableOpacity style={styles.action} onPress={() => {
                            let index = steps.indexOf(setupType)

                            switch (setupType) {
                              case "hours":
                                setDaysinfo({ ...daysInfo, done: false, sameHours: null, step: 0 })

                                break;
                              default:
                                index--

                                setSetuptype(steps[index])
                                setErrormsg('')
                            }
                          }}>
                            <Text style={styles.actionHeader}>{tr.t("buttons.back")}</Text>
                          </TouchableOpacity>
                        )}

                        {!(region.longitude == null || (daysInfo.done && daysInfo.sameHours == null)) && (
                          <TouchableOpacity style={styles.action} disabled={loading} onPress={() => setupType == "hours" && daysInfo.step == 1 ? setupYourLocation() : saveInfo()}>
                            <Text style={styles.actionHeader}>{setupType == "" ? tr.t("buttons.begin") : tr.t("buttons.next")}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                )}

                {setupType == "hours" && (
                  <ScrollView style={{ height: '100%', width: '100%' }}>
                    <KeyboardAvoidingView style={{ height: '100%' }} behavior={Platform.OS == "ios" ? "padding" : "position"}>
                      <View style={styles.days}>
                        {!daysInfo.done ?
                          <>
                            <Text style={[styles.inputHeader, { marginBottom: 20, textAlign: 'center' }]}>{tr.t("locationsetup.openDays.header")}</Text>

                            <View style={{ alignItems: 'center', width: '100%' }}>
                              {daysArr.map((day, index) => (
                                <TouchableOpacity key={index} style={[styles.openingDayTouch, { backgroundColor: daysInfo.working.indexOf(day) > -1 ? 'rgba(0, 0, 0, 0.6)' : 'transparent' }]} onPress={() => {
                                  const newWorking = [...daysInfo.working]

                                  if (newWorking[index] == '') {
                                    newWorking[index] = day
                                  } else {
                                    newWorking[index] = ''
                                  }

                                  setDaysinfo({ ...daysInfo, working: newWorking })
                                }}>
                                  <Text style={[styles.openingDayTouchHeader, { color: daysInfo.working.indexOf(day) > -1 ? 'white' : 'black' }]}>{tr.t("days." + day)}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </>
                          :
                          <View style={styles.daysContainer}>
                            {daysInfo.sameHours == null ? 
                              <>
                                <Text style={[styles.inputHeader, { marginBottom: 20, textAlign: 'center' }]}>{
                                  tr.t("locationsetup.location.sameOpen." + (
                                    JSON.stringify(days).split("\"close\":false").length - 1 == 7 ? "all" : "some"
                                  ))
                                }</Text>

                                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                  {days.map((info, index) => (
                                    !info.close && (
                                      <View key={index} style={styles.openDay}>
                                        <Text style={styles.openDayHeader}>{tr.t("days." + info.header)}</Text>
                                      </View>
                                    )
                                  ))}
                                </View>

                                <View style={styles.actions}>
                                  <TouchableOpacity style={styles.action} onPress={() => setDaysinfo({ ...daysInfo, sameHours: false })}>
                                    <Text style={styles.actionHeader}>{tr.t("buttons.no")}</Text>
                                  </TouchableOpacity>

                                  <TouchableOpacity style={styles.action} onPress={() => setDaysinfo({ ...daysInfo, sameHours: true })}>
                                    <Text style={styles.actionHeader}>{tr.t("buttons.yes")}</Text>
                                  </TouchableOpacity>
                                </View>
                              </>
                              :
                              <>
                                <TouchableOpacity style={styles.daysBack} disabled={loading} onPress={() => setDaysinfo({ ...daysInfo, done: false, sameHours: null, step: 0 })}>
                                  <Text style={styles.daysBackHeader}>{tr.t("buttons.changeDays")}</Text>
                                </TouchableOpacity>

                                {daysInfo.sameHours == false ? 
                                  days.map((info, index) => (
                                    !info.close &&
                                      <View key={index} style={styles.day}>
                                        <Text style={styles.dayHeader}>{
                                          language == "chinese" ? 
                                            tr.t("locationsetup.openDays.time." + info.header)
                                            :
                                            tr.t("locationsetup.openDays.time").replace("{day}", tr.t("days." + info.header))
                                        }</Text>

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
                                  ))
                                  :
                                  <>
                                    <Text style={styles.dayHeader}>{
                                      tr.t("locationsetup.openDays.sameTime." + (
                                        JSON.stringify(days).split("\"close\":false").length - 1 == 7 ? "all" : "some"
                                      ))
                                    }</Text>

                                    {JSON.stringify(days).split("\"close\":false").length - 1 < 7 && (
                                      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                        {days.map((day, index) => (
                                          !day.close && (
                                            <View key={index} style={styles.openDay}>
                                              <Text style={styles.openDayHeader}>{day.header}</Text>
                                            </View>
                                          )
                                        ))}
                                      </View>
                                    )}
                                      
                                    <View style={styles.day}>
                                      <View style={styles.timeSelectionContainer}>
                                        <View style={styles.timeSelection}>
                                          <View style={styles.selection}>
                                            <TouchableOpacity onPress={() => updateSameTime("hour", "up", true)}>
                                              <AntDesign name="up" size={wsize(7)}/>
                                            </TouchableOpacity>
                                            <TextInput style={styles.selectionHeader} onChangeText={(hour) => {
                                              const newDaysamehours = {...daySamehours}

                                              newDaysamehours.opentime["hour"] = hour.toString()

                                              setDays(newDays)
                                            }} keyboardType="numeric" maxLength={2} value={daySamehours.opentime.hour}/>
                                            <TouchableOpacity onPress={() => updateSameTime("hour", "down", true)}>
                                              <AntDesign name="down" size={wsize(7)}/>
                                            </TouchableOpacity>
                                          </View>
                                          <View style={styles.selectionDivHolder}>
                                            <Text style={styles.selectionDiv}>:</Text>
                                          </View>
                                          <View style={styles.selection}>
                                            <TouchableOpacity onPress={() => updateSameTime("minute", "up", true)}>
                                              <AntDesign name="up" size={wsize(7)}/>
                                            </TouchableOpacity>
                                            <TextInput style={styles.selectionHeader} onChangeText={(minute) => {
                                              const newDaysamehours = {...daySamehours}

                                              newDaysamehours.opentime["minute"] = minute.toString()

                                              setDays(newDays)
                                            }} keyboardType="numeric" maxLength={2} value={daySamehours.opentime.minute}/>
                                            <TouchableOpacity onPress={() => updateSameTime("minute", "down", true)}>
                                              <AntDesign name="down" size={wsize(7)}/>
                                            </TouchableOpacity>
                                          </View>
                                          <View style={styles.selection}>
                                            <TouchableOpacity onPress={() => updateSameTime("period", "up", true)}>
                                              <AntDesign name="up" size={wsize(7)}/>
                                            </TouchableOpacity>
                                            <Text style={styles.selectionHeader}>{daySamehours.opentime.period}</Text>
                                            <TouchableOpacity onPress={() => updateSameTime("period", "down", true)}>
                                              <AntDesign name="down" size={wsize(7)}/>
                                            </TouchableOpacity>
                                          </View>
                                        </View>
                                        <View style={styles.timeSelectionHeaderHolder}>
                                          <Text style={styles.timeSelectionHeader}>To</Text>
                                        </View>
                                        <View style={styles.timeSelection}>
                                          <View style={styles.selection}>
                                            <TouchableOpacity onPress={() => updateSameTime("hour", "up", false)}>
                                              <AntDesign name="up" size={wsize(7)}/>
                                            </TouchableOpacity>
                                            <TextInput style={styles.selectionHeader} onChangeText={(hour) => {
                                              const newDaysamehours = {...daySamehours}

                                              newDaysamehours.closetime["hour"] = hour.toString()

                                              setDays(newDays)
                                            }} keyboardType="numeric" maxLength={2} value={daySamehours.closetime.hour}/>
                                            <TouchableOpacity onPress={() => updateSameTime("hour", "down", false)}>
                                              <AntDesign name="down" size={wsize(7)}/>
                                            </TouchableOpacity>
                                          </View>
                                          <View style={styles.selectionDivHolder}>
                                            <Text style={styles.selectionDiv}>:</Text>
                                          </View>
                                          <View style={styles.selection}>
                                            <TouchableOpacity onPress={() => updateSameTime("minute", "up", false)}>
                                              <AntDesign name="up" size={wsize(7)}/>
                                            </TouchableOpacity>
                                            <TextInput style={styles.selectionHeader} onChangeText={(minute) => {
                                              const newDaysamehours = {...daySamehours}

                                              newDaysamehours.closetime["minute"] = minute.toString()

                                              setDays(newDays)
                                            }} keyboardType="numeric" maxLength={2} value={daySamehours.closetime.minute}/>

                                            <TouchableOpacity onPress={() => updateSameTime("minute", "down", false)}>
                                              <AntDesign name="down" size={wsize(7)}/>
                                            </TouchableOpacity>
                                          </View>
                                          <View style={styles.selection}>
                                            <TouchableOpacity onPress={() => updateSameTime("period", "up", false)}>
                                              <AntDesign name="up" size={wsize(7)}/>
                                            </TouchableOpacity>
                                            <Text style={styles.selectionHeader}>{daySamehours.closetime.period}</Text>
                                            <TouchableOpacity onPress={() => updateSameTime("period", "down", false)}>
                                              <AntDesign name="down" size={wsize(7)}/>
                                            </TouchableOpacity>
                                          </View>
                                        </View>
                                      </View>
                                    </View>
                                  </>
                                }
                              </>
                            }
                          </View>
                        }
                      </View>

                      <View style={styles.actionContainer}>
                        <Text style={styles.errorMsg}>{errorMsg}</Text>

                        <View style={styles.actions}>
                          {steps.indexOf(setupType) > 0 && (
                            <TouchableOpacity style={styles.action} onPress={() => {
                              let index = steps.indexOf(setupType)

                              switch (setupType) {
                                case "hours":
                                  if (daysInfo.done) {
                                    setDaysinfo({ ...daysInfo, done: false, sameHours: null, step: 0 })
                                  } else {
                                    index--

                                    setSetuptype(steps[index])
                                    setErrormsg('')
                                  }

                                  break;
                                default:
                                  index--

                                  setSetuptype(steps[index])
                                  setErrormsg('')
                              }
                            }}>
                              <Text style={styles.actionHeader}>{tr.t("buttons.back")}</Text>
                            </TouchableOpacity>
                          )}

                          {!(daysInfo.done && daysInfo.sameHours == null) && (
                            <TouchableOpacity style={styles.action} disabled={loading} onPress={() => setupType == "hours" && daysInfo.step == 1 ? setupYourLocation() : saveInfo()}>
                              <Text style={styles.actionHeader}>{
                                setupType == "" ? 
                                  tr.t("buttons.begin") 
                                  : 
                                  setupType == "hours" && daysInfo.step == 1 ? tr.t("buttons.done") : tr.t("buttons.next")
                              }</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </KeyboardAvoidingView>
                  </ScrollView>
                )}
              </>
              :
              <View style={styles.inputsBox}>
                {setupType == "" && (
                  <View style={{ flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                    <Text style={styles.introHeader}>{tr.t("locationsetup.intro.welcome")}EasyBook Business</Text>
                    <Text style={styles.introHeader}>{tr.t("locationsetup.intro.message")}</Text>
                    <Text style={styles.introHeader}>{tr.t("locationsetup.intro.begin")}</Text>
                  </View>
                )}

                {setupType == "name" && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputHeader}>{tr.t("locationsetup.name." + header)}</Text>
                    <TextInput style={styles.input} onChangeText={(storeName) => setStorename(storeName)} value={storeName} autoCorrect={false} autoCapitalize="none"/>
                  </View>
                )}

                {setupType == "phonenumber" && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputHeader}>{tr.t("locationsetup.phonenumber")}</Text>
                    <TextInput style={styles.input} onChangeText={(num) => setPhonenumber(displayPhonenumber(phonenumber, num, () => Keyboard.dismiss()))} value={phonenumber} keyboardType="numeric" autoCorrect={false} autoCapitalize="none"/>
                  </View>
                )}

                {(setupType == "logo" && (cameraPermission || pickingPermission)) && (
                  <View style={styles.cameraContainer}>
                    <Text style={[styles.inputHeader, { textAlign: 'center' }]}>{tr.t("locationsetup.photo." + header)} (Optional)</Text>

                    {logo.uri ? (
                      <>
                        <Image style={styles.camera} source={{ uri: logo.uri }}/>

                        <TouchableOpacity style={styles.cameraAction} onPress={() => setLogo({ ...logo, uri: '' })}>
                          <Text style={styles.cameraActionHeader}>{tr.t("buttons.cancel")}</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <Camera 
                          style={styles.camera} 
                          type={camType} 
                          ref={r => {setCamcomp(r)}}
                          ratio="1:1"
                        />

                        <View style={{ alignItems: 'center', marginTop: -wsize(7) }}>
                          <Ionicons color="black" name="camera-reverse-outline" size={wsize(7)} onPress={() => setCamtype(camType == 'back' ? 'front' : 'back')}/>
                        </View>

                        <View style={styles.cameraActions}>
                          <TouchableOpacity style={styles.cameraAction} onPress={snapPhoto.bind(this)}>
                            <Text style={styles.cameraActionHeader}>{tr.t("buttons.takePhoto")}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.cameraAction, { opacity: loading ? 0.3 : 1 }]} disabled={loading} onPress={() => {
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

                <View style={styles.actionContainer}>
                  <Text style={styles.errorMsg}>{errorMsg}</Text>

                  <View style={styles.actions}>
                    {steps.indexOf(setupType) > 0 && (
                      <TouchableOpacity style={styles.action} onPress={() => {
                        let index = steps.indexOf(setupType)

                        index--

                        setSetuptype(steps[index])
                        setErrormsg('')
                      }}>
                        <Text style={styles.actionHeader}>{tr.t("buttons.back")}</Text>
                      </TouchableOpacity>
                    )}

                    {setupType != "type" && (
                      <TouchableOpacity style={styles.action} disabled={loading} onPress={() => setupType == "hours" && daysInfo.step == 1 ? setupYourLocation() : saveInfo()}>
                        <Text style={styles.actionHeader}>{
                          setupType == "" ? 
                            tr.t("buttons.begin") 
                            : 
                            setupType == "logo" ? 
                              logo.uri ? tr.t("buttons.next") : tr.t("buttons.skip")
                              :
                              tr.t("buttons.next")
                        }</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            }
          
          </TouchableWithoutFeedback>
        </View>

        <View style={styles.bottomNavs}>
          <View style={styles.bottomNavsRow}>
            {newBusiness && <TouchableOpacity style={styles.bottomNav} onPress={() => {
              AsyncStorage.removeItem("newBusiness")

              navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "list" }]}));
            }}><Text style={styles.bottomNavHeader}>{tr.t("buttons.cancel")}</Text></TouchableOpacity>}

            <TouchableOpacity style={styles.bottomNav} onPress={() => {
              AsyncStorage.clear()

              navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "auth" }]}));
            }}>
              <Text style={styles.bottomNavHeader}>Log-Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading && <Modal transparent={true}><Loadingprogress/></Modal>}
      </View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
  locationsetup: { backgroundColor: 'white', height: '100%', width: '100%' },
  box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
  header: { backgroundColor: 'red', flexDirection: 'column', height: '20%', justifyContent: 'space-around', width: '100%' },
  boxHeader: { fontFamily: 'Chilanka_400Regular', fontSize: wsize(7), textAlign: 'center' },

  inputsBox: { alignItems: 'center', height: '80%', width: '100%' },
  introHeader: { fontSize: wsize(6), fontWeight: 'bold', paddingHorizontal: 30, textAlign: 'center' },

  inputContainer: { width: '80%' },
  inputHeader: { fontSize: wsize(5), fontWeight: 'bold', marginTop: 20 },
  input: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), padding: 5, width: '100%' },

  locationContainer: { alignItems: 'center', height: '100%', width: '100%' },
  locationHeader: { fontSize: wsize(5), fontWeight: 'bold', marginHorizontal: 20, textAlign: 'center' },

  cameraContainer: { alignItems: 'center', width: '100%' },
  cameraHeader: { fontFamily: 'Chilanka_400Regular', fontWeight: 'bold', paddingVertical: 5 },
  camera: { height: width, width },
  cameraActions: { flexDirection: 'row' },
  cameraAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: wsize(30) },
  cameraActionHeader: { fontSize: wsize(4), textAlign: 'center' },

  days: { width: '100%' },
  daysContainer: { alignItems: 'center' },

  openDay: { backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 10, margin: 5, padding: 10 },
  openDayHeader: { fontSize: wsize(6), textAlign: 'center' },

  // select opening days
  openingDayTouch: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: '90%' },
  openingDayTouchHeader: { fontSize: wsize(5), textAlign: 'center' },

  daysBack: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginTop: 20, padding: 10 },
  daysBackHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },

  nextDay: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, padding: 10 },
  nextDayHeader: { fontFamily: 'Chilanka_400Regular', fontSize: wsize(5), textAlign: 'center' },

  // adjust working time for each day
  day: { alignItems: 'center', backgroundColor: 'white', borderRadius: 10, marginTop: 30, padding: 5, width: '95%' },
  dayHeader: { fontSize: wsize(5), fontWeight: 'bold', marginBottom: 10, marginHorizontal: 10, textAlign: 'center' },
  timeSelectionContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  timeSelection: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, flexDirection: 'row', justifyContent: 'space-between', width: '45%' },
  timeSelectionHeaderHolder: { flexDirection: 'column', justifyContent: 'space-around', width: '10%' },
  timeSelectionHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
  selection: { alignItems: 'center', margin: 5 },
  selectionHeader: { fontSize: wsize(6), textAlign: 'center' },
  selectionDivHolder: { flexDirection: 'column', justifyContent: 'space-around' },
  selectionDiv: { fontSize: wsize(6) },

  actionContainer: { flexDirection: 'column', justifyContent: 'space-around' },
  actions: { flexDirection: 'row', justifyContent: 'space-around' },
  action: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: wsize(30) },
  actionHeader: { fontFamily: 'Chilanka_400Regular', fontSize: wsize(5), textAlign: 'center' },

  bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
  bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
  bottomNavHeader: { fontSize: wsize(4), fontWeight: 'bold' },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
  errorMsg: { color: 'darkred', fontSize: wsize(4), textAlign: 'center' }
})
