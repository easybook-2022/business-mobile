import React, { useState, useEffect } from 'react';
import { Platform, ActivityIndicator, Dimensions, ScrollView, View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { CommonActions } from '@react-navigation/native';
import { setupLocation } from '../apis/locations'
import { registerInfo } from '../../assets/info'

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const steps = ['type', 'location', 'phonenumber', 'logo', 'hours']
const daysArr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const fsize = p => {
	return width * p
}

export default function locationsetup({ navigation }) {
	const [setupType, setSetuptype] = useState('')
	const [cameraPermission, setCamerapermission] = useState(null);
	const [pickingPermission, setPickingpermission] = useState(null);
	const [locationPermission, setLocationpermission] = useState(null)

	const [locationInfo, setLocationinfo] = useState('')
	const [camComp, setCamcomp] = useState(null)
	const [locationCoords, setLocationcoords] = useState({ longitude: null, latitude: null, address: '' })

	const [storeName, setStorename] = useState(registerInfo.storeName)
	const [addressOne, setAddressone] = useState(registerInfo.addressOne)
	const [addressTwo, setAddresstwo] = useState(registerInfo.addressTwo)
	const [city, setCity] = useState(registerInfo.city)
	const [province, setProvince] = useState(registerInfo.province)
	const [postalcode, setPostalcode] = useState(registerInfo.postalcode)

	const [phonenumber, setPhonenumber] = useState(registerInfo.phonenumber)

	const [type, setType] = useState(registerInfo.storeType)

	const [logo, setLogo] = useState({ uri: '', name: '' })

	const [daysInfo, setDaysinfo] = useState({ working: ['', '', '', '', '', '', ''], done: false, step: 0 })
	const [days, setDays] = useState([])

	const [loading, setLoading] = useState(false)
	const [errorMsg, setErrormsg] = useState('')

	const setupYourLocation = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const { details } = await NetInfo.fetch()
		const ipAddress = details.ipAddress, hours = {}
		let longitude, latitude, invalid = false

		if (storeName && phonenumber, addressOne && city && province && postalcode) {
			days.forEach(function (day) {
				let { opentime, closetime, close } = day
				let newOpentime = {...opentime}, newClosetime = {...closetime}
				let openhour = parseInt(newOpentime.hour), closehour = parseInt(newClosetime.hour)
				let openperiod = newOpentime.period, closeperiod = newClosetime.period

				delete newOpentime.period
				delete newClosetime.period

				if (close == false) {
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
				} else if (close == true) {
					hours[day.header.substr(0, 3)] = { opentime: newOpentime, closetime: newClosetime, close }
				} else {
					invalid = true
				}
			})

			if (locationInfo == "destination") {
				longitude = locationCoords.longitude
				latitude = locationCoords.latitude
			} else {
				if (locationPermission) {
					let info = await Location.geocodeAsync(`${addressOne} ${addressTwo}, ${city} ${province}, ${postalcode}`)

					longitude = info[0].longitude
					latitude = info[0].latitude
				} else {
					longitude = registerInfo.longitude
					latitude = registerInfo.latitude
				}
			}
				
			const time = (Date.now() / 1000).toString().split(".")[0]
			const data = {
				storeName, phonenumber, addressOne, addressTwo, city, province, postalcode, logo, hours, type, 
				longitude, latitude, ownerid, time, ipAddress, permission: cameraPermission, trialtime: Date.now()
			}

			setLoading(true)

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
							AsyncStorage.setItem("phase", "workinghours")

							navigation.dispatch(
								CommonActions.reset({
									index: 0,
									routes: [{ name: "workinghours" }]
								})
							)
						}
					})
					.catch((err) => {
						if (err.response && err.response.status == 400) {
							const { errormsg, status } = err.response.data

							setErrormsg(errormsg)
							setLoading(false)
						} else {
							setErrormsg("an error has occurred in server")
						}
					})
			} else {
				setLoading(false)
				setErrormsg("Please choose an option for all the days")
			}
		} else {
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
	const saveInfo = () => {
		const index = steps.indexOf(setupType)
		let msg = "", skip = false

		setLoading(true)

		switch (index) {
			case 0:
				if (!addressOne || !city || !province || !postalcode) {
					msg = "There are some missing address info"
				}

				break
			case 1:
				if (!phonenumber) {
					msg = "Please provide the " + (type == 'restaurant' ? 'restaurant' : type + ' salon') + " phone number"
				}

				break
			case 2:
				if (!type) {
					msg = "Please tell what service you are"
				}

				break
			case 3:
				if (!logo.uri && Platform.OS == 'ios') {
					msg = "Please provide a photo of the " + (type == 'restaurant' ? 'restaurant' : type + ' salon')
				}

				break
			case 4:
				if (!daysInfo.done) {
					const newDays = []

					daysArr.forEach(function (day, index) {
						newDays.push({ 
							key: newDays.length.toString(), 
							header: day, 
							opentime: { hour: "12", minute: "00", period: "AM" }, 
							closetime: { hour: "11", minute: "59", period: "PM" }, 
							close: daysInfo.working[index] ? false : true
						})
					})

					if (JSON.stringify(newDays).includes("\"close\":false")) {
						setDaysinfo({ ...daysInfo, done: true, step: 1 })

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
				const nextStep = index == 4 ? "done" : steps[index + 1]

				if (nextStep == "location") {
					openLocation()
				} else if (nextStep == "logo") {
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
		let letters = [
			"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", 
			"n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
		]
		let photo_name_length = Math.floor(Math.random() * (15 - 10)) + 10
		let char = "", captured, self = this

		if (camComp) {
			let options = { quality: 0, skipProcessing: true };
			let photo = await camComp.takePictureAsync(options)
			let photo_option = [{ resize: { width: width, height: width }}]
			let photo_save_option = { format: ImageManipulator.SaveFormat.JPEG, base64: true }

			photo = await ImageManipulator.manipulateAsync(
				photo.localUri || photo.uri,
				photo_option,
				photo_save_option
			)

			for (let k = 0; k <= photo_name_length - 1; k++) {
				if (k % 2 == 0) {
	                char += "" + letters[Math.floor(Math.random() * letters.length)].toUpperCase();
	            } else {
	                char += "" + (Math.floor(Math.random() * 9) + 0);
	            }
			}

			FileSystem.moveAsync({
				from: photo.uri,
				to: `${FileSystem.documentDirectory}/${char}.jpg`
			})
			.then(() => {
				setLogo({
					uri: `${FileSystem.documentDirectory}/${char}.jpg`,
					name: `${char}.jpg`
				})
				setErrormsg('')
			})
		}
	}
	const choosePhoto = async() => {
		let letters = [
			"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", 
			"n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
		]
		let photo_name_length = Math.floor(Math.random() * (15 - 10)) + 10
		let char = "", captured, self = this
		let photo = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			aspect: [4, 3],
			quality: 0.1,
			base64: true
		});

		for (let k = 0; k <= photo_name_length - 1; k++) {
			if (k % 2 == 0) {
                char += "" + letters[Math.floor(Math.random() * letters.length)].toUpperCase();
            } else {
                char += "" + (Math.floor(Math.random() * 9) + 0);
            }
		}

		if (!photo.cancelled) {
			FileSystem.moveAsync({
				from: photo.uri,
				to: `${FileSystem.documentDirectory}/${char}.jpg`
			})
			.then(() => {
				setLogo({
					uri: `${FileSystem.documentDirectory}/${char}.jpg`,
					name: `${char}.jpg`
				})
				setErrormsg('')
			})
		}
	}
	const updateWorkingHour = (index, timetype, dir, open) => {
		const newWorkerhours = [...days]
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

		setWorkerhours(newWorkingHours)
	}

	const updateTime = (index, timetype, dir, open) => {
		const newDays = [...days]
		let value, period

		value = open ? 
			newDays[index].opentime[timetype]
			:
			newDays[index].closetime[timetype]

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
				}

				break
			case "period":
				value = value == "AM" ? "PM" : "AM"

				break
			default:
		}

		if (open) {
			newDays[index].opentime[timetype] = value
		} else {
			newDays[index].closetime[timetype] = value
		}

		setDays(newDays)
	}
	const dayTouch = index => {
		const newDays = [...days]

		newDays[index].close = !newDays[index].close

		setDays(newDays)
	}

	const allowCamera = async() => {
		const { status } = await Camera.getCameraPermissionsAsync()

		if (status == 'granted') {
			setCamerapermission(status === 'granted')
		} else {
			const { status } = await Camera.requestCameraPermissionsAsync()

			setCamerapermission(status === 'granted')
		}
	}
	const allowChoosing = async() => {
		const { status } = await ImagePicker.getMediaLibraryPermissionsAsync()
        
        if (status == 'granted') {
        	setPickingpermission(status === 'granted')
        } else {
        	const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        	setPickingpermission(status === 'granted')
        }
	}
	const openLocation = async() => {
		const { status } = await Location.getForegroundPermissionsAsync()

		if (status == 'granted') {
			setLocationpermission(status === 'granted')
		} else {
			const { status } = await Location.requestForegroundPermissionsAsync()

			setLocationpermission(status === 'granted')
		}
	}
		
	return (
		<View style={[style.locationsetup, { opacity: loading ? 0.5 : 1 }]}>
			<View style={style.box}>
				<View style={style.inputsBox}>
					{setupType ? <Text style={style.boxHeader}>Setup</Text> : null}

					{setupType == "" && (
						<View style={style.introBox}>
							<Text style={style.introHeader}>Welcome to EasyGO Business</Text>
							<Text style={style.introHeader}>We will bring the nearest customers to your door</Text>
							<Text style={style.introHeader}>Let's setup your business information</Text>

							<TouchableOpacity style={style.submit} disabled={loading} onPress={() => setupType == "hours" ? setupYourLocation() : saveInfo()}>
								<Text style={style.submitHeader}>{setupType == "" ? "Let's go" : "Next"}</Text>
							</TouchableOpacity>
						</View>
					)}

					{setupType == "type" && (
						<View style={style.typeContainer}>
							<Text style={style.inputHeader}>What business are you ?</Text>

							<View style={style.selections}>
								<TouchableOpacity style={type == 'hair' ? style.typeSelectionSelected : style.typeSelection} onPress={() => setType('hair')}>
									<View style={style.typeSelectionRow}>
										<Text style={style.typeSelectionHeader}>Hair{'\n'}Salon</Text>
										<Image source={require("../../assets/hairsalon.png")} style={style.typeSelectionIcon}/>
										<Text style={style.typeSelectionAction}>Tap{'\n'}to choose</Text>
									</View>
								</TouchableOpacity>
								<TouchableOpacity style={type == 'nail' ? style.typeSelectionSelected : style.typeSelection} onPress={() => setType('nail')}>
									<View style={style.typeSelectionRow}>
										<Text style={style.typeSelectionHeader}>Nail{'\n'}Salon</Text>
										<Image source={require("../../assets/nailsalon.png")} style={style.typeSelectionIcon}/>
										<Text style={style.typeSelectionAction}>Tap{'\n'}to choose</Text>
									</View>
								</TouchableOpacity>
								<TouchableOpacity style={type == 'restaurant' ? style.typeSelectionSelected : style.typeSelection} onPress={() => setType('restaurant')}>
									<View style={style.typeSelectionRow}>
										<Text style={style.typeSelectionHeader}>Restaurant</Text>
										<Image source={require("../../assets/food.png")} style={style.typeSelectionIcon}/>
										<Text style={style.typeSelectionAction}>Tap{'\n'}to choose</Text>
									</View>
								</TouchableOpacity>
							</View>

							{errorMsg ? <Text style={style.errorMsg}>{errorMsg}</Text> : null }

							{loading && <ActivityIndicator size="large"/>}

							<TouchableOpacity style={style.submit} disabled={loading} onPress={() => setupType == "hours" ? setupYourLocation() : saveInfo()}>
								<Text style={style.submitHeader}>{setupType == "" ? "Let's go" : "Next"}</Text>
							</TouchableOpacity>
						</View>
					)}

					{(setupType == "location" && locationPermission) && (
						<View style={style.locationContainer}>
							{locationInfo == '' ?
								<View style={{ height: '100%' }}>
									<Text style={style.locationHeader}>Are you at the {type == 'restaurant' ? 'restaurant' : type + ' salon'} right now ?</Text>
									<View style={style.locationActions}>
										<TouchableOpacity style={style.locationAction} disabled={loading} onPress={() => setLocationinfo('away')}>
											<Text style={style.locationActionHeader}>No</Text>
										</TouchableOpacity>
										<TouchableOpacity style={style.locationAction} disabled={loading} onPress={async() => {
											setLoading(true)

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
											
											setLocationinfo('destination')
											setLoading(false)
										}}>
											<Text style={style.locationActionHeader}>Yes</Text>
										</TouchableOpacity>
									</View>

									{loading && (
										<View style={{ marginVertical: 20 }}>
											<Text style={style.locationFetchingHeader}>getting your location</Text>
											<ActivityIndicator size="small"/>
										</View>
									)}
								</View>
								:
								locationInfo != 'destination' ? 
									<ScrollView style={{ height: '100%', width: '100%' }}>
										<View style={style.locationInfos}>
											<View style={{ alignItems: 'center', marginVertical: 50 }}>
												<Text style={style.locationHeader}>Are you at the restaurant/salon right now ?</Text>
												<TouchableOpacity style={style.locationActionOption} disabled={loading} onPress={async() => {
													setLoading(true)

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

													setLocationinfo('destination')
													setLoading(false)
												}}>
													<Text style={style.locationActionOptionHeader}>Mark location instead</Text>
												</TouchableOpacity>
											</View>

											<Text style={{ fontSize: 20, fontWeight: 'bold', marginVertical: 20 }}>Or</Text>

											<Text style={style.boxMiniheader}>Enter your location information</Text>

											<View style={style.inputContainer}>
												<Text style={style.inputHeader}>Enter location name:</Text>
												<TextInput style={style.input} onChangeText={(storeName) => setStorename(storeName)} value={storeName} autoCorrect={false} autoCapitalize="none"/>
											</View>
											<View style={style.inputContainer}>
												<Text style={style.inputHeader}>Enter location address #1:</Text>
												<TextInput style={style.input} onChangeText={(addressOne) => setAddressone(addressOne)} value={addressOne} autoCorrect={false} autoCapitalize="none"/>
											</View>
											<View style={style.inputContainer}>
												<Text style={style.inputHeader}>Enter location address #2: (Optional)</Text>
												<TextInput style={style.input} onChangeText={(addressTwo) => setAddresstwo(addressTwo)} value={addressTwo} autoCorrect={false} autoCapitalize="none"/>
											</View>
											<View style={style.inputContainer}>
												<Text style={style.inputHeader}>Enter city:</Text>
												<TextInput style={style.input} onChangeText={(city) => setCity(city)} value={city} autoCorrect={false} autoCapitalize="none"/>
											</View>
											<View style={style.inputContainer}>
												<Text style={style.inputHeader}>Enter province:</Text>
												<TextInput style={style.input} onChangeText={(province) => setProvince(province)} value={province} autoCorrect={false} autoCapitalize="none"/>
											</View>
											<View style={style.inputContainer}>
												<Text style={style.inputHeader}>Enter postal code:</Text>
												<TextInput style={style.input} onChangeText={(postalcode) => setPostalcode(postalcode)} value={postalcode} autoCorrect={false} autoCapitalize="none"/>
											</View>

											{errorMsg ? <Text style={style.errorMsg}>{errorMsg}</Text> : null }

											{loading && <ActivityIndicator size="large"/>}

											<TouchableOpacity style={style.submit} disabled={loading} onPress={() => setupType == "hours" ? setupYourLocation() : saveInfo()}>
												<Text style={style.submitHeader}>{setupType == "" ? "Let's go" : "Next"}</Text>
											</TouchableOpacity>
										</View>
									</ScrollView>
									:
									<View style={{ height: '100%', width: '100%' }}>
										<Text style={style.locationHeader}>Your location is located at</Text>
										<MapView
											region={{
												longitude: locationCoords.longitude,
												latitude: locationCoords.latitude,
												latitudeDelta: 0.003,
												longitudeDelta: 0.003
											}}
											scrollEnabled={false}
											zoomEnabled={false}
											style={{ borderRadius: fsize(0.5) / 2, height: fsize(0.5), width: fsize(0.5) }}
										>
											<Marker coordinate={{ longitude: locationCoords.longitude, latitude: locationCoords.latitude }}/>
										</MapView>
										<Text style={style.locationAddressHeader}>{locationCoords.address}</Text>
										{errorMsg ? <Text style={style.errorMsg}>{errorMsg}</Text> : null }

										<TouchableOpacity style={style.submit} disabled={loading} onPress={() => setupType == "hours" ? setupYourLocation() : saveInfo()}>
											<Text style={style.submitHeader}>{setupType == "" ? "Let's go" : "Next"}</Text>
										</TouchableOpacity>
										<TouchableOpacity style={style.locationActionOption} onPress={() => {
											setLocationcoords({ longitude: null, latitude: null })
											setLocationinfo('away')
										}}>
											<Text style={style.locationActionOptionHeader}>Enter full address instead</Text>
										</TouchableOpacity>

										{loading && <ActivityIndicator size="large"/>}
									</View>
							}
						</View>
					)}

					{setupType == "phonenumber" && (
						<View style={{ alignItems: 'center', height: '100%', width: '100%' }}>
							<View style={style.inputContainer}>
								<Text style={style.inputHeader}>Enter {type == 'restaurant' ? 'restaurant' : type + ' salon'}'s phone number:</Text>
								<TextInput style={style.input} onChangeText={(phonenumber) => setPhonenumber(phonenumber)} value={phonenumber} keyboardType="numeric" autoCorrect={false} autoCapitalize="none"/>
							</View>

							{errorMsg ? <Text style={style.errorMsg}>{errorMsg}</Text> : null }

							{loading && <ActivityIndicator size="large"/>}

							<TouchableOpacity style={style.submit} disabled={loading} onPress={() => setupType == "hours" ? setupYourLocation() : saveInfo()}>
								<Text style={style.submitHeader}>{setupType == "" ? "Let's go" : "Next"}</Text>
							</TouchableOpacity>
						</View>
					)}
					
					{(setupType == "logo" && (cameraPermission || pickingPermission)) && (
						<View style={style.cameraContainer}>
							<Text style={style.inputHeader}>Provide a photo for {type == 'restaurant' ? 'restaurant' : type + ' salon'}</Text>

							{logo.uri ? (
								<>
									<Image style={style.camera} source={{ uri: logo.uri }}/>

									<TouchableOpacity style={style.cameraAction} onPress={() => setLogo({ uri: '', name: '' })}>
										<Text style={style.cameraActionHeader}>Cancel</Text>
									</TouchableOpacity>
								</>
							) : (
								<>
									<Camera 
										style={style.camera} 
										type={Camera.Constants.Type.back} ref={r => {setCamcomp(r)}}
										ratio="1:1"
									/>

									<View style={style.cameraActions}>
										<TouchableOpacity style={style.cameraAction} onPress={snapPhoto.bind(this)}>
											<Text style={style.cameraActionHeader}>Take{'\n'}this photo</Text>
										</TouchableOpacity>
										<TouchableOpacity style={style.cameraAction} onPress={() => choosePhoto()}>
											<Text style={style.cameraActionHeader}>Choose{'\n'}from phone</Text>
										</TouchableOpacity>
									</View>
								</>
							)}

							{errorMsg ? <Text style={style.errorMsg}>{errorMsg}</Text> : null }

							{loading && <ActivityIndicator size="large"/>}

							<TouchableOpacity style={style.submit} disabled={loading} onPress={() => setupType == "hours" ? setupYourLocation() : saveInfo()}>
								<Text style={style.submitHeader}>{setupType == "" ? "Let's go" : "Next"}</Text>
							</TouchableOpacity>
						</View>
					)}

					{setupType == "hours" && (
						<ScrollView style={{ height: '100%', width: '100%' }}>
							<View style={{ alignItems: 'center' }}>
								<View style={style.days}>
									<Text style={[style.inputHeader, { marginBottom: 20, textAlign: 'center' }]}>Set the {type == 'restaurant' ? 'restaurant' : type + ' salon'}'s opening hours</Text>

									{!daysInfo.done ?
										<View style={{ alignItems: 'center', width: '100%' }}>
											<Text style={style.workingDayHeader}>What day is business open ?</Text>

											{daysArr.map((day, index) => (
												<TouchableOpacity key={index} style={daysInfo.working.indexOf(day) > -1 ? style.workingDayTouchSelected : style.workingDayTouch} onPress={() => {
													const newWorking = [...daysInfo.working]

													if (newWorking[index] == '') {
														newWorking[index] = day
													} else {
														newWorking[index] = ''
													}

													setDaysinfo({ ...daysInfo, working: newWorking })
												}}>
													<Text style={style.workingDayTouchHeader}>{day}</Text>
												</TouchableOpacity>
											))}
										</View>
										:
										<View style={{ alignItems: 'center', opacity: loading ? 0.5 : 1, width: '100%' }}>
											<TouchableOpacity style={style.daysBack} disabled={loading} onPress={() => setDaysinfo({ working: ['', '', '', '', '', '', ''], done: false, step: 0 })}>
												<Text style={style.daysBackHeader}>Go Back</Text>
											</TouchableOpacity>

											{days.map((info, index) => (
												!info.close ?
													<View key={index} style={style.day}>
														<Text style={style.dayHeader}>Set the opening time for {info.header}</Text>
														
														<Text style={[style.dayHeader, { marginTop: 30 }]}>Use the arrow to set the time</Text>

														<View style={style.timeSelectionContainer}>
															<View style={style.timeSelection}>
																<View style={style.selection}>
																	<TouchableOpacity onPress={() => updateTime(index, "hour", "up", true)}>
																		<AntDesign name="up" size={fsize(0.08)}/>
																	</TouchableOpacity>
																	<Text style={style.selectionHeader}>{info.opentime.hour}</Text>
																	<TouchableOpacity onPress={() => updateTime(index, "hour", "down", true)}>
																		<AntDesign name="down" size={fsize(0.08)}/>
																	</TouchableOpacity>
																</View>
																<Text style={style.selectionDiv}>:</Text>
																<View style={style.selection}>
																	<TouchableOpacity onPress={() => updateTime(index, "minute", "up", true)}>
																		<AntDesign name="up" size={fsize(0.08)}/>
																	</TouchableOpacity>
																	<Text style={style.selectionHeader}>{info.opentime.minute}</Text>
																	<TouchableOpacity onPress={() => updateTime(index, "minute", "down", true)}>
																		<AntDesign name="down" size={fsize(0.08)}/>
																	</TouchableOpacity>
																</View>
																<View style={style.selection}>
																	<TouchableOpacity onPress={() => updateTime(index, "period", "up", true)}>
																		<AntDesign name="up" size={fsize(0.08)}/>
																	</TouchableOpacity>
																	<Text style={style.selectionHeader}>{info.opentime.period}</Text>
																	<TouchableOpacity onPress={() => updateTime(index, "period", "down", true)}>
																		<AntDesign name="down" size={fsize(0.08)}/>
																	</TouchableOpacity>
																</View>
															</View>
															<Text style={style.timeSelectionHeader}>To</Text>
															<View style={style.timeSelection}>
																<View style={style.selection}>
																	<TouchableOpacity onPress={() => updateTime(index, "hour", "up", false)}>
																		<AntDesign name="up" size={fsize(0.08)}/>
																	</TouchableOpacity>
																	<Text style={style.selectionHeader}>{info.closetime.hour}</Text>
																	<TouchableOpacity onPress={() => updateTime(index, "hour", "down", false)}>
																		<AntDesign name="down" size={fsize(0.08)}/>
																	</TouchableOpacity>
																</View>
																<Text style={style.selectionDiv}>:</Text>
																<View style={style.selection}>
																	<TouchableOpacity onPress={() => updateTime(index, "minute", "up", false)}>
																		<AntDesign name="up" size={fsize(0.08)}/>
																	</TouchableOpacity>
																	<Text style={style.selectionHeader}>{info.closetime.minute}</Text>
																	<TouchableOpacity onPress={() => updateTime(index, "minute", "down", false)}>
																		<AntDesign name="down" size={fsize(0.08)}/>
																	</TouchableOpacity>
																</View>
																<View style={style.selection}>
																	<TouchableOpacity onPress={() => updateTime(index, "period", "up", false)}>
																		<AntDesign name="up" size={fsize(0.08)}/>
																	</TouchableOpacity>
																	<Text style={style.selectionHeader}>{info.closetime.period}</Text>
																	<TouchableOpacity onPress={() => updateTime(index, "period", "down", false)}>
																		<AntDesign name="down" size={fsize(0.08)}/>
																	</TouchableOpacity>
																</View>
															</View>
														</View>
													</View>
												: null
											))}
										</View>
									}
								</View>

								{errorMsg ? <Text style={style.errorMsg}>{errorMsg}</Text> : null }

								{loading && <ActivityIndicator size="large"/>}

								<TouchableOpacity style={style.submit} disabled={loading} onPress={() => setupType == "hours" && daysInfo.step == 1 ? setupYourLocation() : saveInfo()}>
									<Text style={style.submitHeader}>{setupType == "" ? "Let's go" : "Next"}</Text>
								</TouchableOpacity>
							</View>
						</ScrollView>
					)}
				</View>

				<View style={style.bottomNavs}>
					<View style={style.bottomNavsRow}>
						<TouchableOpacity style={style.bottomNav} onPress={() => {
							AsyncStorage.clear()

							navigation.dispatch(
								CommonActions.reset({
									index: 1,
									routes: [{ name: 'auth' }]
								})
							);
						}}>
							<Text style={style.bottomNavHeader}>Log-Out</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</View>
	)
}

const style = StyleSheet.create({
	locationsetup: { backgroundColor: 'white', height: '100%', paddingVertical: offsetPadding, width: '100%' },
	box: { alignItems: 'center', backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	inputsBox: { alignItems: 'center', height: '90%', width: '100%' },

	boxHeader: { fontFamily: 'appFont', fontSize: fsize(0.06), marginTop: 30, marginHorizontal: 20, textAlign: 'center' },

	introBox: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	introHeader: { fontSize: fsize(0.05), fontWeight: 'bold', paddingHorizontal: 30, textAlign: 'center' },

	boxMiniheader: { fontFamily: 'appFont', fontSize: fsize(0.05), fontWeight: 'bold', marginBottom: 10, marginTop: 30 },

	inputContainer: { marginBottom: 50, width: '80%' },
	inputHeader: { fontFamily: 'appFont', fontSize: fsize(0.05),  },
	input: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: fsize(0.07), padding: 5, width: '100%' },

	locationContainer: { height: '100%', width: '100%' },
	locationHeader: { fontFamily: 'appFont', fontSize: fsize(0.07), fontWeight: 'bold', marginHorizontal: 20, textAlign: 'center' },
	locationAddressHeader: { fontSize: fsize(0.05), fontWeight: 'bold', margin: 20 },
	locationActions: { flexDirection: 'row', justifyContent: 'space-around' },
	locationAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 10, width: 100 },
	locationActionHeader: { fontSize: fsize(0.05), textAlign: 'center' },
	locationFetchingHeader: { color: 'grey', fontSize: fsize(0.05), textAlign: 'center' },
	locationActionOption: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 10, width: fsize(0.6) },
	locationActionOptionHeader: { fontSize: fsize(0.05), textAlign: 'center' },
	locationInfos: { alignItems: 'center', paddingBottom: 100 },

	typeContainer: { alignItems: 'center', height: '100%', width: '100%' },
	selections: { flexDirection: 'column', height: fsize(0.80), justifyContent: 'space-between', width: '90%' },
	
	typeSelection: { backgroundColor: 'rgba(127, 127, 127, 0.05)', borderStyle: 'solid', borderWidth: 2, flexDirection: 'column', height: fsize(0.25), justifyContent: 'space-around', padding: 5, width: '100%' },
	typeSelectionSelected: { backgroundColor: 'rgba(127, 127, 127, 0.8)', borderStyle: 'solid', borderWidth: 2, flexDirection: 'column', height: fsize(0.25), justifyContent: 'space-around', padding: 5, width: '100%' },
	typeSelectionRow: { flexDirection: 'row', justifyContent: 'space-between' },
	typeSelectionHeader: { fontSize: fsize(0.05), fontWeight: 'bold' },
	typeSelectionIcon: { height: fsize(0.15), width: fsize(0.15) },
	typeSelectionAction: { fontSize: fsize(0.04), textAlign: 'center' },

	cameraContainer: { alignItems: 'center', height: '100%', width: '100%' },
	cameraHeader: { fontFamily: 'appFont', fontWeight: 'bold', paddingVertical: 5 },
	camera: { height: fsize(0.7), width: fsize(0.7) },
	cameraActions: { flexDirection: 'row' },
	cameraAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: fsize(0.25) },
	cameraActionHeader: { fontSize: fsize(0.03), textAlign: 'center' },

	days: { alignItems: 'center', width: '100%' },

	// select working days
	workingDayHeader: { fontSize: fsize(0.06) },
	workingDayTouch: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: fsize(0.7) },
	workingDayTouchSelected: { backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: fsize(0.7) },
	workingDayTouchHeader: { fontSize: fsize(0.06), textAlign: 'center' },

	daysBack: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginBottom: 20, padding: 10 },
	daysBackHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), textAlign: 'center' },

	// adjust working time for each day
	day: { alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 10, marginTop: 30, padding: 5, width: '95%' },
	dayHeader: { fontSize: fsize(0.05), fontWeight: 'bold', marginBottom: 10, marginHorizontal: 10, textAlign: 'center' },
	dayAnswer: { alignItems: 'center' },
	dayAnswerActions: { flexDirection: 'row', justifyContent: 'space-between' },
	dayAnswerAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 10, width: fsize(0.15) },
	dayAnswerActionHeader: { fontSize: fsize(0.04) },
	timeSelectionContainer: { flexDirection: 'row' },
	timeSelection: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, flexDirection: 'row', marginHorizontal: 5 },
	timeSelectionHeader: { fontSize: fsize(0.05), fontWeight: 'bold', paddingVertical: 38 },
	selection: { alignItems: 'center', margin: 5 },
	selectionHeader: { fontSize: fsize(0.05), textAlign: 'center' },
	selectionDiv: { fontSize: fsize(0.07), marginVertical: fsize(0.07) },

	errorMsg: { color: 'red', fontWeight: 'bold', textAlign: 'center' },

	submit: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginBottom: 10, marginTop: 5, padding: 5, width: fsize(0.3) },
	submitHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },
})
