import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, ActivityIndicator, Platform, Dimensions, ScrollView, View, Text, TextInput, 
  Image, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Modal, StyleSheet, PermissionsAndroid
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { CommonActions } from '@react-navigation/native';
import { setupLocation } from '../apis/locations'
import { registerInfo, timeControl } from '../../assets/info'
import { displayPhonenumber } from 'geottuse-tools'

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import Ionicons from 'react-native-vector-icons/Ionicons'

// components
import Loadingprogress from '../components/loadingprogress';

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}
const hsize = p => {return height * (p / 100)}

const steps = ['type', 'name', 'location', 'phonenumber', 'logo', 'hours']
const daysArr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function Locationsetup({ navigation }) {
	const [setupType, setSetuptype] = useState('')
	const [cameraPermission, setCamerapermission] = useState(null);
	const [pickingPermission, setPickingpermission] = useState(null);
	const [locationPermission, setLocationpermission] = useState(null)

	const [locationInfo, setLocationinfo] = useState('')
	const [camComp, setCamcomp] = useState(null)
  const [camType, setCamtype] = useState('back')
  const [choosing, setChoosing] = useState(false)
	const [locationCoords, setLocationcoords] = useState({ longitude: null, latitude: null, address: '' })

	const [storeName, setStorename] = useState(registerInfo.storeName)
	const [addressOne, setAddressone] = useState(registerInfo.addressOne)
	const [addressTwo, setAddresstwo] = useState(registerInfo.addressTwo)
	const [city, setCity] = useState(registerInfo.city)
	const [province, setProvince] = useState(registerInfo.province)
	const [postalcode, setPostalcode] = useState(registerInfo.postalcode)
  
	const [phonenumber, setPhonenumber] = useState(registerInfo.phonenumber)

	const [type, setType] = useState(registerInfo.storeType)

	const [logo, setLogo] = useState({ uri: '', name: '', size: { width: 0, height: 0 }})

	const [daysInfo, setDaysinfo] = useState({ working: ['', '', '', '', '', '', ''], done: false, step: 0, dayIndex: 0, numOpen: 0 })
	const [days, setDays] = useState([])

	const [loading, setLoading] = useState(false)
	const [errorMsg, setErrormsg] = useState('')

	const setupYourLocation = async() => {
    setLoading(true)

		const ownerid = await AsyncStorage.getItem("ownerid")
		const hours = {}
		let longitude, latitude, invalid = false

		if (storeName && phonenumber && addressOne && city && province && postalcode) {
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

			if (locationInfo == "destination") {
				longitude = locationCoords.longitude
				latitude = locationCoords.latitude
			} else {
				if (!locationPermission) {
					longitude = registerInfo.longitude
					latitude = registerInfo.latitude
				} else {
          longitude = locationCoords.longitude
          latitude = locationCoords.latitude
        }
			}

			const time = (Date.now() / 1000).toString().split(".")[0]
			const data = {
				storeName, phonenumber, addressOne, addressTwo, city, province, postalcode, logo, hours, type, 
				longitude, latitude, ownerid, permission: cameraPermission
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
              const { id } = res

              AsyncStorage.setItem("locationid", id.toString())
              AsyncStorage.setItem("locationtype", type)

              setLoading(false)

              if (type == "restaurant" || type == "store") {
                AsyncStorage.setItem("phase", "main")

                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: "main", params: { firstTime: true } }]
                  })
                )
              } else {
                AsyncStorage.setItem("phase", "register")

                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: "register" }]
                  })
                )
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
				setErrormsg("Please choose an option for all the days")
			}
		} else {
      setLoading(false)

			if (!storeName) {
				setErrormsg("Please enter your location name")

				return
			}

			if (!phonenumber) {
				setErrormsg("Please enter your location phone number")

				return
			}

			if (!addressOne) {
				setErrormsg("Please enter the Address # 1")

				return
			}

			if (!city) {
				setErrormsg("Please enter the city")

				return
			}

			if (!province) {
				setErrormsg("Please enter the province")

				return
			}

			if (!postalcode) {
				setErrormsg("Please enter the postal code")

				return
			}
		}
	}
	const saveInfo = async() => {
		const index = steps.indexOf(setupType)
		let msg = "", skip = false

		switch (index) {
      case 0:
        if (!type) {
          msg = "Please tell what service you are"
        }

        break
			case 1:
				if (!storeName) {
          msg = "Please enter the name of your " + type
        }

        break
			case 2:
				if (locationInfo != "") {
					if (locationInfo == "destination") {
						if (!addressOne || !city || !province || !postalcode) {
							msg = "There are some missing address info"
						} else {
              let info = await Location.geocodeAsync(`${addressOne} ${addressTwo}, ${city} ${province}, ${postalcode}`)

              longitude = info[0].longitude
              latitude = info[0].latitude

              setLocationcoords({ ...locationCoords, longitude, latitude })
            }
					}
				} else {
					msg = "Please choose an option"
				}

				break
			case 3:
				if (!phonenumber) {
					msg = "Please provide the " + type + " phone number"
				}

				break
			case 4:
				if (!logo.uri && Platform.OS == 'ios') {
					msg = "Please provide a photo of the " + type
				}

				break
			case 5:
				if (!daysInfo.done) {
					const newDays = []
          let numOpendays = 0

					daysArr.forEach(function (day, index) {
						newDays.push({ 
							key: newDays.length.toString(), 
							header: day, 
							opentime: { hour: "06", minute: "00", period: "AM" }, 
							closetime: { hour: "09", minute: "00", period: "PM" }, 
							close: daysInfo.working[index] ? false : true
						})

            if (daysInfo.working[index]) {
              numOpendays += 1
            }
					})

					if (JSON.stringify(newDays).includes("\"close\":false")) {
						setDaysinfo({ ...daysInfo, done: true, step: 1, numOpen: numOpendays })
						setDays(newDays)

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
				const nextStep = index == 5 ? "done" : steps[index + 1]

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
			setErrormsg()
		}

		setLoading(false)
	}

	const snapPhoto = async() => {
    setLoading(true)

		let letters = [
			"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", 
			"n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
		]
		let photo_name_length = Math.floor(Math.random() * (15 - 10)) + 10
		let char = ""

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

			for (let k = 0; k <= photo_name_length - 1; k++) {
				char += "" + (
          k % 2 == 0 ? 
            letters[Math.floor(Math.random() * letters.length)].toUpperCase()
            :
            Math.floor(Math.random() * 9) + 0
        )
			}

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
    setLoading(true)
    setChoosing(true)

		let letters = [
			"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", 
			"n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
		]
		let photo_name_length = Math.floor(Math.random() * (15 - 10)) + 10
		let char = "", photo = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			aspect: [1, 1],
			quality: 0.1,
			base64: true
		});

		for (let k = 0; k <= photo_name_length - 1; k++) {
      char += "" + (
        k % 2 == 0 ? 
          letters[Math.floor(Math.random() * letters.length)].toUpperCase()
          :
          Math.floor(Math.random() * 9) + 0
      )
		}

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
        setLoading(false)
			})
		}

    setChoosing(false)
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

  const markLocation = async() => {
    const { status } = await Location.getForegroundPermissionsAsync()
    let realStatus = false

    if (status == 'granted') {
      setLocationinfo('destination')
      realStatus = true
    } else {
      const info = await Location.requestForegroundPermissionsAsync()

      if (info.status == 'granted') {
        setLocationinfo('destination')
        realStatus = true
      }
    }

    if (realStatus == true) {
      const location = await Location.getCurrentPositionAsync({});
      const { longitude, latitude } = location.coords
      let address = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      for (let item of address) {
        setLocationcoords({ 
          longitude, 
          latitude,
          address: `${item.name}, ${item.subregion} ${item.region}, ${item.postalCode}`
        })
        setAddressone(item.name)
        setCity(item.subregion)
        setProvince(item.region)
        setPostalcode(item.postalCode)
      }

      setErrormsg('')
    }
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
            message: "EasyGO Business allows you to take a photo for your business",
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

	return (
		<SafeAreaView style={[styles.locationsetup, { opacity: loading ? 0.5 : 1 }]}>
      <View style={styles.box}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.inputsBox}>
            {setupType == "location" || setupType == "hours" ? 
              <ScrollView style={{ height: '100%', width: '100%' }}>
                {setupType == "location" && (
                  <View style={styles.locationContainer}>

                    {locationInfo === '' && (
                      <View style={{ alignItems: 'center', height: '100%' }}>
                        <Text style={styles.locationHeader}>If you are at the {(type == 'hair' || type == 'nail') ? type + ' salon' : type} right now,</Text>

                        <TouchableOpacity style={[styles.locationActionOption, { width: width * 0.5 }]} disabled={loading} onPress={() => markLocation()}>
                          <Text style={styles.locationActionOptionHeader}>Mark your location</Text>
                        </TouchableOpacity>

                        <Text style={[styles.locationHeader, { marginVertical: 20 }]}>Or</Text>

                        <TouchableOpacity style={[styles.locationAction, { width: width * 0.6 }]} disabled={loading} onPress={() => {
                          setLocationinfo('away')
                          setErrormsg()
                        }}>
                          <Text style={styles.locationActionHeader}>Enter address instead</Text>
                        </TouchableOpacity>

                        {loading && (
                          <View style={{ marginVertical: 10 }}>
                            <Text style={styles.locationFetchingHeader}>getting your location</Text>
                          </View>
                        )}
                      </View>
                    )}

                    {locationInfo === 'destination' && (
                      <View style={{ alignItems: 'center', height: '100%', width: '100%' }}>
                        <Text style={styles.locationHeader}>Your {(type == 'hair' || type == 'nail') ? type + ' salon' : type} is located at</Text>
                        {(locationCoords.longitude && locationCoords.latitude) ? 
                          <>
                            <MapView
                              region={{
                                longitude: locationCoords.longitude,
                                latitude: locationCoords.latitude,
                                latitudeDelta: 0.003,
                                longitudeDelta: 0.003
                              }}
                              scrollEnabled={false}
                              zoomEnabled={false}
                              style={{ borderRadius: width * 0.4 / 2, height: width * 0.4, width: width * 0.4 }}
                            >
                              <Marker coordinate={{ longitude: locationCoords.longitude, latitude: locationCoords.latitude }}/>
                            </MapView>
                            <Text style={styles.locationAddressHeader}>{locationCoords.address}</Text>
                          </>
                          :
                          <ActivityIndicator color="black" size="small"/>
                        }

                        <Text style={[styles.locationHeader, { marginVertical: 10 }]}>Or</Text>

                        <TouchableOpacity style={styles.locationActionOption} onPress={() => {
                          setLocationcoords({ longitude: null, latitude: null })
                          setLocationinfo('away')
                        }}>
                          <Text style={styles.locationActionOptionHeader}>Enter address instead</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {locationInfo === 'away' && (
                      <View style={styles.locationInfos}>
                        <Text style={styles.locationHeader}>If you are at the {(type == 'hair' || type == 'nail') ? type + ' salon' : type} right now,</Text>
                        <TouchableOpacity style={[styles.locationActionOption, { width: width * 0.5 }]} disabled={loading} onPress={() => markLocation()}>
                          <Text style={styles.locationActionOptionHeader}>Mark your location</Text>
                        </TouchableOpacity>

                        <Text style={{ fontSize: 20, fontWeight: 'bold', marginVertical: 30 }}>Or</Text>

                        <Text style={styles.locationHeader}>Enter your {(type == 'hair' || type == 'nail') ? type + ' salon' : type} information</Text>

                        <View style={styles.inputContainer}>
                          <Text style={styles.inputHeader}>Enter address #1:</Text>
                          <TextInput style={styles.input} onChangeText={(addressOne) => setAddressone(addressOne)} value={addressOne} autoCorrect={false} autoCapitalize="none"/>
                        </View>
                        <View style={styles.inputContainer}>
                          <Text style={styles.inputHeader}>Enter address #2: (Optional)</Text>
                          <TextInput style={styles.input} onChangeText={(addressTwo) => setAddresstwo(addressTwo)} value={addressTwo} autoCorrect={false} autoCapitalize="none"/>
                        </View>
                        <View style={styles.inputContainer}>
                          <Text style={styles.inputHeader}>Enter city:</Text>
                          <TextInput style={styles.input} onChangeText={(city) => setCity(city)} value={city} placeholder="example: Toronto" autoCorrect={false} autoCapitalize="none"/>
                        </View>
                        <View style={styles.inputContainer}>
                          <Text style={styles.inputHeader}>Enter province:</Text>
                          <TextInput style={styles.input} onChangeText={(province) => setProvince(province)} value={province} placeholder="example: ON" autoCorrect={false} autoCapitalize="none"/>
                        </View>
                        <View style={styles.inputContainer}>
                          <Text style={styles.inputHeader}>Enter postal code:</Text>
                          <TextInput style={styles.input} onChangeText={(postalcode) => setPostalcode(postalcode)} value={postalcode} autoCorrect={false} autoCapitalize="none"/>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {setupType == "hours" && (
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
                )}
              </ScrollView>
              :
              <>
                {setupType == "" && (
                  <>
                    <Text style={styles.introHeader}>Welcome to EasyGO Business</Text>
                    <Text style={styles.introHeader}>We will bring the nearest customers to your door<br/>VERY FAST</Text>
                    <Text style={styles.introHeader}>Let's setup your business information</Text>
                  </>
                )}

                {setupType == "type" && (
                  <>
                    <Text style={styles.introHeader}>What business are you ?</Text>

                    <View style={styles.typeSelections}>
                      <TouchableOpacity style={[styles.typeSelection, { backgroundColor: type == 'hair' ? 'rgba(0, 0, 0, 0.5)' : null }]} onPress={() => setType('hair')}>
                        <View style={styles.typeSelectionRow}>
                          <View style={styles.column}>
                            <Text style={styles.typeSelectionHeader}>Hair<br/>Salon</Text>
                          </View>
                          <View style={styles.column}>
                            <Image source={require("../../assets/hairsalon.png")} style={styles.typeSelectionIcon}/>
                          </View>
                          <View style={styles.column}>
                            <Text style={styles.typeSelectionAction}>Tap<br/>to choose</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.typeSelection, { backgroundColor: type == 'nail' ? 'rgba(0, 0, 0, 0.5)' : null }]} onPress={() => setType('nail')}>
                        <View style={styles.typeSelectionRow}>
                          <View style={styles.column}>
                            <Text style={styles.typeSelectionHeader}>Nail<br/>Salon</Text>
                          </View>
                          <View style={styles.column}>
                            <Image source={require("../../assets/nailsalon.png")} style={styles.typeSelectionIcon}/>
                          </View>
                          <View style={styles.column}>
                            <Text style={styles.typeSelectionAction}>Tap<br/>to choose</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.typeSelection, { backgroundColor: type == 'restaurant' ? 'rgba(0, 0, 0, 0.5)' : null }]} onPress={() => setType('restaurant')}>
                        <View style={styles.typeSelectionRow}>
                          <View style={styles.column}>
                            <Text style={styles.typeSelectionHeader}>Restaurant</Text>
                          </View>
                          <View style={styles.column}>
                            <Image source={require("../../assets/food.png")} style={styles.typeSelectionIcon}/>
                          </View>
                          <View style={styles.column}>
                            <Text style={styles.typeSelectionAction}>Tap<br/>to choose</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.typeSelection, { backgroundColor: type == 'store' ? 'rgba(0, 0, 0, 0.5)' : null }]} onPress={() => setType('store')}>
                        <View style={styles.typeSelectionRow}>
                          <View style={styles.column}>
                            <Text style={styles.typeSelectionHeader}>Store</Text>
                          </View>
                          <View style={styles.column}>
                            <Image source={require("../../assets/shopping-cart.png")} style={styles.typeSelectionIcon}/>
                          </View>
                          <View style={styles.column}>
                            <Text style={styles.typeSelectionAction}>Tap<br/>to choose</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {setupType == "name" && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputHeader}>Enter {(type == 'hair' || type == 'nail') ? type + ' salon' : type} name:</Text>
                    <TextInput style={styles.input} onChangeText={(storeName) => setStorename(storeName)} value={storeName} autoCorrect={false} autoCapitalize="none"/>
                  </View>
                )}   

                {setupType == "phonenumber" && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputHeader}>Enter {(type == 'hair' || type == 'nail') ? type + ' salon' : type}'s phone number:</Text>
                    <TextInput style={styles.input} onChangeText={(num) => setPhonenumber(displayPhonenumber(phonenumber, num, () => Keyboard.dismiss()))} value={phonenumber} keyboardType="numeric" autoCorrect={false} autoCapitalize="none"/>
                  </View>
                )}

                {(setupType == "logo" && (cameraPermission || pickingPermission)) && (
                  <View style={styles.cameraContainer}>
                    <Text style={styles.inputHeader}>Provide a photo for {(type == 'hair' || type == 'nail') ? type + ' salon' : type}</Text>

                    {logo.uri ? (
                      <>
                        <Image style={styles.camera} source={{ uri: logo.uri }}/>

                        <TouchableOpacity style={styles.cameraAction} onPress={() => setLogo({ ...logo, uri: '' })}>
                          <Text style={styles.cameraActionHeader}>Cancel</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <View style={styles.cameraActions}>
                        <TouchableOpacity style={[styles.cameraAction, { opacity: loading ? 0.3 : 1 }]} disabled={loading} onPress={() => choosePhoto()}>
                          <Text style={styles.cameraActionHeader}>Choose<br/>from phone</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </>
            }   
          </View>
        </TouchableWithoutFeedback>

        <View style={styles.actionContainer}>
          <Text style={styles.errorMsg}>{errorMsg}</Text>

          <View style={styles.actions}>
            {steps.indexOf(setupType) > 0 && (
              <TouchableOpacity style={styles.action} onPress={() => {
                let index = steps.indexOf(setupType)

                index--

                setSetuptype(steps[index])
              }}>
                <Text style={styles.actionHeader}>Back</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.action} disabled={loading} onPress={() => setupType == "hours" && daysInfo.step == 1 ? setupYourLocation() : saveInfo()}>
              <Text style={styles.actionHeader}>{setupType == "" ? "Let's go" : "Next"}</Text>
            </TouchableOpacity>
          </View>
        </View>

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
      </View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
  locationsetup: { backgroundColor: 'white', height: '100%', width: '100%' },
  box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
  header: { backgroundColor: 'red', flexDirection: 'column', height: '20%', justifyContent: 'space-around', width: '100%' },
  boxHeader: { fontFamily: 'appFont', fontSize: wsize(7), textAlign: 'center' },

  inputsBox: { alignItems: 'center', flexDirection: 'column', height: '80%', justifyContent: 'space-around', width: '100%' },
  introHeader: { fontSize: wsize(6), fontWeight: 'bold', paddingHorizontal: 30, textAlign: 'center' },

  typeSelections: { flexDirection: 'column', justifyContent: 'space-between', width: '90%' },
  typeSelection: { backgroundColor: 'rgba(127, 127, 127, 0.05)', borderStyle: 'solid', borderWidth: 2, flexDirection: 'column', height: hsize(10), justifyContent: 'space-around', marginBottom: 10, padding: 5, width: '100%' },
  typeSelectionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  typeSelectionHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
  typeSelectionIcon: { height: wsize(15), width: wsize(15) },
  typeSelectionAction: { fontSize: wsize(5), textAlign: 'center' },

  inputContainer: { width: '80%' },
  inputHeader: { fontSize: wsize(5), fontWeight: 'bold', marginTop: 20 },
  input: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), padding: 5, width: '100%' },

  locationContainer: { height: '100%', width: '100%' },
  locationHeader: { fontSize: wsize(5), fontWeight: 'bold', marginHorizontal: 20, textAlign: 'center' },
  locationAddressHeader: { fontSize: wsize(5), fontWeight: 'bold', margin: 20, textAlign: 'center' },
  locationActions: { flexDirection: 'row', justifyContent: 'space-around' },
  locationAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 10, width: 100 },
  locationActionHeader: { fontSize: wsize(5), textAlign: 'center' },
  locationFetchingHeader: { color: 'grey', fontSize: wsize(5), textAlign: 'center' },
  locationActionOption: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 10, width: wsize(50) },
  locationActionOptionHeader: { fontSize: wsize(5), textAlign: 'center' },
  locationInfos: { alignItems: 'center', paddingBottom: 100 },

  cameraContainer: { alignItems: 'center', height: '100%', width: '100%' },
  cameraHeader: { fontFamily: 'appFont', fontWeight: 'bold', paddingVertical: 5 },
  camera: { height: width * 0.7, width: width * 0.7 },
  cameraActions: { flexDirection: 'row' },
  cameraAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: wsize(30) },
  cameraActionHeader: { fontSize: wsize(4), textAlign: 'center' },

  days: { height: '100%', width: '100%' },
  daysContainer: { alignItems: 'center', paddingBottom: 100 },

  // select opening days
  openingDayHeader: { fontSize: wsize(5) },
  openingDayTouch: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: '90%' },
  openingDayTouchSelected: { backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: '90%' },
  openingDayTouchHeader: { fontSize: wsize(5), textAlign: 'center' },

  daysBack: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginBottom: 20, padding: 10 },
  daysBackHeader: { fontFamily: 'appFont', fontSize: wsize(5), textAlign: 'center' },

  nextDay: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, padding: 10 },
  nextDayHeader: { fontFamily: 'appFont', fontSize: wsize(5), textAlign: 'center' },

  // adjust working time for each day
  day: { alignItems: 'center', backgroundColor: '#EAEAEA', borderRadius: 10, marginTop: 30, padding: 5, width: '95%' },
  dayHeader: { fontSize: wsize(5), fontWeight: 'bold', marginBottom: 10, marginHorizontal: 10, textAlign: 'center' },
  timeSelectionContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  timeSelection: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, flexDirection: 'row', justifyContent: 'space-between', width: '45%' },
  timeSelectionHeaderHolder: { flexDirection: 'column', justifyContent: 'space-around', width: '10%' },
  timeSelectionHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
  selection: { alignItems: 'center', margin: 5 },
  selectionHeader: { fontSize: wsize(6), textAlign: 'center' },
  selectionDivHolder: { flexDirection: 'column', justifyContent: 'space-around' },
  selectionDiv: { fontSize: wsize(6) },

  actionContainer: { flexDirection: 'column', height: '10%', justifyContent: 'space-around' },
  actions: { flexDirection: 'row', justifyContent: 'space-around' },
  action: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: wsize(30) },
  actionHeader: { fontFamily: 'appFont', fontSize: wsize(5), textAlign: 'center' },

  bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
  bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
  bottomNavHeader: { fontSize: wsize(4), fontWeight: 'bold' },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
  errorMsg: { color: 'darkred', fontSize: wsize(4), textAlign: 'center' }
})
