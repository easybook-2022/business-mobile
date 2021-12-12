import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, View, Text, TextInput, Image, TouchableOpacity, TouchableWithoutFeedback, Keyboard, PermissionsAndroid, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker';
import { CommonActions } from '@react-navigation/native';
import { registerUser } from '../apis/owners'
import { ownerRegisterInfo, registerInfo } from '../../assets/info'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const steps = ['nickname', 'password', 'profile', 'workinghours']

export default function register(props) {
	const offsetPadding = Constants.statusBarHeight
	const screenHeight = height - (offsetPadding * 2)
	const cellnumber = props.route.params.cellnumber

	const [setupType, setSetuptype] = useState('nickname')
	const [cameraPermission, setCamerapermission] = useState(null);
	const [pickingPermission, setPickingpermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
	const [username, setUsername] = useState(ownerRegisterInfo.username)
	const [password, setPassword] = useState(ownerRegisterInfo.password)
	const [confirmPassword, setConfirmpassword] = useState(ownerRegisterInfo.password)
	const [profile, setProfile] = useState({ uri: '', name: '' })
	const [workerHours, setWorkerhours] = useState([
		{ key: "0", header: "Sunday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: null },
		{ key: "1", header: "Monday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: null },
		{ key: "2", header: "Tuesday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: null },
		{ key: "3", header: "Wednesday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: null },
		{ key: "4", header: "Thursday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: null },
		{ key: "5", header: "Friday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: null },
		{ key: "6", header: "Saturday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: null }
	])

	const [loading, setLoading] = useState(false)
	const [errorMsg, setErrormsg] = useState('')

	const register = () => {
		const hours = {}

		setLoading(true)

		workerHours.forEach(function (workerHour) {
			let { opentime, closetime, working } = workerHour
			let newOpentime = {...opentime}, newClosetime = {...closetime}
			let openhour = parseInt(newOpentime.hour), closehour = parseInt(newClosetime.hour)
			let openperiod = newOpentime.period, closeperiod = newClosetime.period

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

			hours[workerHour.header.substr(0, 3)] = { opentime: newOpentime, closetime: newClosetime, working }
		})

		const data = { cellnumber, username, password, confirmPassword, profile, hours, permission: cameraPermission || pickingPermission }
		
		registerUser(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { id } = res

					AsyncStorage.setItem("ownerid", id.toString())
					AsyncStorage.setItem("phase", "setup")

					props.navigation.navigate("setup")
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data

					setLoading(false)
					setErrormsg(errormsg)
				}
			})
	}

	const saveInfo = () => {
		const index = steps.indexOf(setupType)
		const nextStep = index == 3 ? "done" : steps[index + 1]

		setSetuptype(nextStep)
	}

	const snapPhoto = async() => {
		let letters = [
			"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", 
			"n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
		]
		let photo_name_length = Math.floor(Math.random() * (15 - 10)) + 10
		let char = "", captured, self = this

		if (camComp) {
			let options = { quality: 0 };
			let photo = await camComp.takePictureAsync(options)
			let photo_option = [
				{ resize: { width: width, height: width }},
				{ flip: ImageManipulator.FlipType.Horizontal }
			]
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
				setProfile({
					uri: `${FileSystem.documentDirectory}/${char}.jpg`,
					name: `${char}.jpg`
				})
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
				setProfile({
					uri: `${FileSystem.documentDirectory}/${char}.jpg`,
					name: `${char}.jpg`
				})
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
	const working = index => {
		const newWorkerhours = [...workerHours]

		newWorkerhours[index].working = !newWorkerhours[index].working

		setWorkerhours(newWorkerhours)
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

	useEffect(() => {
		(async() => {
			allowCamera()
			allowChoosing()
		})()
	}, [])

	if (cameraPermission === null || pickingPermission === null) return <View/>

	return (
		<View style={style.register}>
			<View style={{ paddingVertical: offsetPadding, opacity: loading ? 0.5 : 1 }}>
				<View style={style.box}>
					<Text style={style.boxHeader}>Setup ({steps.indexOf(setupType) + 1} of 4)</Text>

					<View style={style.inputsBox}>
						{setupType == "nickname" && (
							<View style={style.inputContainer}>
								<Text style={style.inputHeader}>Enter a nickname you like (example: therock):</Text>
								<TextInput style={style.input} onChangeText={(username) => setUsername(username)} value={username} autoCorrect={false} autoCapitalize="none"/>
							</View>
						)}

						{setupType == "password" && (
							<>
								<View style={style.inputContainer}>
									<Text style={style.inputHeader}>Enter a password:</Text>
									<TextInput style={style.input} secureTextEntry={true} onChangeText={(password) => setPassword(password)} value={password} autoCorrect={false}/>
								</View>

								<View style={style.inputContainer}>
									<Text style={style.inputHeader}>Confirm your password:</Text>
									<TextInput style={style.input} secureTextEntry={true} onChangeText={(password) => setConfirmpassword(password)} value={confirmPassword} autoCorrect={false}/>
								</View>
							</>
						)}

						{setupType == "profile" && (
							<View style={style.cameraContainer}>
								<Text style={style.inputHeader}>Profile Picture</Text>

								{profile.uri ? (
									<>
										<Image style={style.camera} source={{ uri: profile.uri }}/>

										<TouchableOpacity style={style.cameraAction} onPress={() => setProfile({ uri: '', name: '' })}>
											<Text style={style.cameraActionHeader}>Cancel</Text>
										</TouchableOpacity>
									</>
								) : (
									<>
										<Camera style={style.camera} type={Camera.Constants.Type.front} ref={r => {setCamcomp(r)}}/>

										<View style={style.cameraActions}>
											<TouchableOpacity style={style.cameraAction} onPress={snapPhoto.bind(this)}>
												<Text style={style.cameraActionHeader}>Take this photo</Text>
											</TouchableOpacity>
											<TouchableOpacity style={style.cameraAction} onPress={() => choosePhoto()}>
												<Text style={style.cameraActionHeader}>Choose from phone</Text>
											</TouchableOpacity>
										</View>
									</>
								)}	
							</View>
						)}

						{setupType == "workinghours" && (
							<ScrollView style={{ height: screenHeight - 250, width: '100%' }}>
								<View style={style.workerHours}>
									<Text style={style.inputHeader}>Set your working days and hours</Text>

									{workerHours.map((info, index) => (
										<View key={index} style={style.workerHour}>
											{info.working == null ? 
												<View style={style.workerHourAnswer}>
													<Text style={style.workerHourHeader}>Are you working on {info.header}?</Text>

													<View style={style.workerHourAnswerActions}>
														<TouchableOpacity style={style.workerHourAnswerAction} onPress={() => {
															const newWorkerhours = [...workerHours]

															newWorkerhours[index].working = false

															setWorkerhours(newWorkerhours)
														}}>
															<Text>No</Text>
														</TouchableOpacity>
														<TouchableOpacity style={style.workerHourAnswerAction} onPress={() => {
															const newWorkerhours = [...workerHours]

															newWorkerhours[index].working = true

															setWorkerhours(newWorkerhours)
														}}>
															<Text>Yes</Text>
														</TouchableOpacity>
													</View>
												</View>
												:
												<>
													{info.working == true ? 
														<>
															<View style={{ opacity: info.working ? 1 : 0.1 }}>
																<Text style={style.workerHourHeader}>You are working on {info.header}</Text>
																<Text style={style.workerHourHeader}>Set the time</Text>
																<View style={style.timeSelectionContainer}>
																	<View style={style.timeSelection}>
																		<View style={style.selection}>
																			<TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "up", true)}>
																				<AntDesign name="up" size={30}/>
																			</TouchableOpacity>
																			<Text style={style.selectionHeader}>{info.opentime.hour}</Text>
																			<TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "down", true)}>
																				<AntDesign name="down" size={30}/>
																			</TouchableOpacity>
																		</View>
																		<Text style={style.selectionDiv}>:</Text>
																		<View style={style.selection}>
																			<TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "up", true)}>
																				<AntDesign name="up" size={30}/>
																			</TouchableOpacity>
																			<Text style={style.selectionHeader}>{info.opentime.minute}</Text>
																			<TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "down", true)}>
																				<AntDesign name="down" size={30}/>
																			</TouchableOpacity>
																		</View>
																		<View style={style.selection}>
																			<TouchableOpacity onPress={() => updateWorkingHour(index, "period", "up", true)}>
																				<AntDesign name="up" size={30}/>
																			</TouchableOpacity>
																			<Text style={style.selectionHeader}>{info.opentime.period}</Text>
																			<TouchableOpacity onPress={() => updateWorkingHour(index, "period", "down", true)}>
																				<AntDesign name="down" size={30}/>
																			</TouchableOpacity>
																		</View>
																	</View>
																	<Text style={style.timeSelectionHeader}>To</Text>
																	<View style={style.timeSelection}>
																		<View style={style.selection}>
																			<TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "up", false)}>
																				<AntDesign name="up" size={30}/>
																			</TouchableOpacity>
																			<Text style={style.selectionHeader}>{info.closetime.hour}</Text>
																			<TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "down", false)}>
																				<AntDesign name="down" size={30}/>
																			</TouchableOpacity>
																		</View>
																		<Text style={style.selectionDiv}>:</Text>
																		<View style={style.selection}>
																			<TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "up", false)}>
																				<AntDesign name="up" size={30}/>
																			</TouchableOpacity>
																			<Text style={style.selectionHeader}>{info.closetime.minute}</Text>
																			<TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "down", false)}>
																				<AntDesign name="down" size={30}/>
																			</TouchableOpacity>
																		</View>
																		<View style={style.selection}>
																			<TouchableOpacity onPress={() => updateWorkingHour(index, "period", "up", false)}>
																				<AntDesign name="up" size={30}/>
																			</TouchableOpacity>
																			<Text style={style.selectionHeader}>{info.closetime.period}</Text>
																			<TouchableOpacity onPress={() => updateWorkingHour(index, "period", "down", false)}>
																				<AntDesign name="down" size={30}/>
																			</TouchableOpacity>
																		</View>
																	</View>
																</View>
															</View>
															<TouchableOpacity style={style.workerHourTouch} onPress={() => {
																const newWorkerhours = [...workerHours]

																newWorkerhours[index].working = null

																setWorkerhours(newWorkerhours)
															}}>
																<Text style={style.workerHourTouchHeader}>Cancel</Text>
															</TouchableOpacity>
														</>
														:
														<>
															<Text style={style.workerHourHeader}>Not working on {info.header}</Text>

															<TouchableOpacity style={style.workerHourTouch} onPress={() => {
																const newWorkerhours = [...workerHours]

																newWorkerhours[index].working = null

																setWorkerhours(newWorkerhours)
															}}>
																<Text style={style.workerHourTouchHeader}>Change</Text>
															</TouchableOpacity>
														</>
													}
												</>
											}
										</View>
									))}
								</View>
							</ScrollView>
						)}

						<Text style={style.errorMsg}>{errorMsg}</Text>

						{loading ? <ActivityIndicator color="black" size="small"/> : null}

						<TouchableOpacity style={style.submit} onPress={() => setupType == "workinghours" ? register() : saveInfo()}>
							<Text style={style.submitHeader}>{setupType == "workinghours" ? "Done" : "Next"}</Text>
						</TouchableOpacity>
					</View>

					<View style={style.bottomNavs}>
						<TouchableOpacity style={style.bottomNav} onPress={() => {
							AsyncStorage.clear()

							props.navigation.dispatch(
								CommonActions.reset({
									index: 1,
									routes: [{ name: 'login' }]
								})
							);
						}}>
							<Text style={style.bottomNavHeader}>Log-Out</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</View>
	);
}

const style = StyleSheet.create({
	register: { backgroundColor: 'white' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	boxHeader: { fontFamily: 'appFont', fontSize: 40, fontWeight: 'bold', paddingVertical: 30 },

	inputsBox: { alignItems: 'center', width: '100%' },
	inputContainer: { marginBottom: 50, width: '80%' },
	inputHeader: { fontFamily: 'appFont', fontSize: 25, textAlign: 'center' },
	input: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: 25, padding: 5, width: '100%' },

	cameraContainer: { alignItems: 'center', marginVertical: 50, width: '100%' },
	camera: { height: width * 0.8, width: width * 0.8 },
	cameraActions: { flexDirection: 'row' },
	cameraAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: 120 },
	cameraActionHeader: { fontSize: 20, textAlign: 'center' },

	workerHours: { marginVertical: 50 },
	workerHour: { alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 10, marginVertical: 40, padding: 5 },
	workerHourHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginHorizontal: 10, textAlign: 'center' },
	workerHourAnswer: { alignItems: 'center' },
	workerHourAnswerActions: { flexDirection: 'row', justifyContent: 'space-around', width: 210 },
	workerHourAnswerAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 10, width: 100 },
	workerHourAnswerActionHeader: {  },
	timeSelectionContainer: { flexDirection: 'row' },
	timeSelection: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, flexDirection: 'row', marginHorizontal: 5 },
	timeSelectionHeader: { fontSize: 20, fontWeight: 'bold', paddingVertical: 38 },
	selection: { alignItems: 'center', margin: 5 },
	selectionHeader: { fontSize: 20, textAlign: 'center' },
	selectionDiv: { fontSize: 25, marginVertical: 27 },
	workerHourTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5 },
	workerHourTouchHeader: { fontSize: 15, textAlign: 'center' },

	errorMsg: { color: 'darkred', fontWeight: 'bold', textAlign: 'center' },
	submit: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginBottom: 50, marginTop: 5, padding: 10, width: 100 },
	submitHeader: { fontSize: 25 },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', height: 40, justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', height: 30, marginVertical: 5, marginHorizontal: 20 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },
})
