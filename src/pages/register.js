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
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)
const steps = ['nickname', 'password', 'profile']

const fsize = p => {
	return width * p
}

export default function register(props) {
	const cellnumber = props.route.params.cellnumber

	const [setupType, setSetuptype] = useState('nickname')
	const [cameraPermission, setCamerapermission] = useState(null);
	const [pickingPermission, setPickingpermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
	const [username, setUsername] = useState(ownerRegisterInfo.username)
	const [passwordInfo, setPasswordinfo] = useState({ password: ownerRegisterInfo.password, confirmPassword: ownerRegisterInfo.password, step: 0 })
	const [profile, setProfile] = useState({ uri: '', name: '' })

	const [loading, setLoading] = useState(false)
	const [errorMsg, setErrormsg] = useState('')

	const register = () => {
		setLoading(true)

		const { password, confirmPassword } = passwordInfo
		const data = { cellnumber, username, password, confirmPassword, profile, permission: cameraPermission || pickingPermission }

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

					props.navigation.navigate("locationsetup")
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
		let nextStep, msg = ""

		switch (index) {
			case 0:
				if (!username) {
					msg = "Please provide a name you like"
				}

				break
			case 1:
				if (passwordInfo.step == 0) {
					if (!passwordInfo.password) {
						msg = "Please provide a password"
					}
				} else {
					if (!passwordInfo.confirmPassword) {
						msg = "Please confirm your password"
					}
				}

				break
			case 2:
				if (!profile.uri) {
					msg = "Please provide a profile you like"
				}
		}

		if (msg == "") {
			if (index == 1) {
				if (passwordInfo.step == 0) {
					setPasswordinfo({ ...passwordInfo, step: 1 })
					nextStep = "password"
				} else {
					nextStep = index == 2 ? "done" : steps[index + 1]
				}
			} else {
				nextStep = index == 2 ? "done" : steps[index + 1]
			}

			setSetuptype(nextStep)
		} else {
			setErrormsg(msg)
		}
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
								<Text style={style.inputHeader}>Enter a name you like:</Text>
								<TextInput style={style.input} onChangeText={(username) => setUsername(username)} value={username} autoCorrect={false} autoCapitalize="none"/>
							</View>
						)}

						{setupType == "password" && (
							passwordInfo.step == 0 ? 
								<View style={style.inputContainer}>
									<Text style={style.inputHeader}>Enter a password:</Text>
									<TextInput style={style.input} secureTextEntry={true} onChangeText={(password) => setPasswordinfo({ ...passwordInfo, password })} value={passwordInfo.password} autoCorrect={false}/>
								</View>
								:
								<View style={style.inputContainer}>
									<Text style={style.inputHeader}>Confirm your password:</Text>
									<TextInput style={style.input} secureTextEntry={true} onChangeText={(confirmPassword) => {
										setPasswordinfo({ ...passwordInfo, confirmPassword })

										if (confirmPassword.length == passwordInfo.password.length) {
											Keyboard.dismiss()
										}
									}} value={passwordInfo.confirmPassword} autoCorrect={false}/>
								</View>
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

						<Text style={style.errorMsg}>{errorMsg}</Text>

						{loading ? <ActivityIndicator color="black" size="small"/> : null}

						<TouchableOpacity style={style.submit} onPress={() => setupType == "profile" ? register() : saveInfo()}>
							<Text style={style.submitHeader}>{setupType == "profile" ? "Done" : "Next"}</Text>
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
	register: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	boxHeader: { color: 'black', fontFamily: 'appFont', fontSize: fsize(0.1), fontWeight: 'bold' },

	inputsBox: { alignItems: 'center', width: '100%' },
	inputContainer: { marginTop: 20, width: '80%' },
	inputHeader: { fontFamily: 'appFont', fontSize: fsize(0.07) },
	input: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: fsize(0.07), padding: 5, width: '100%' },

	cameraContainer: { alignItems: 'center', width: '100%' },
	camera: { height: width * 0.7, width: width * 0.7 },
	cameraActions: { flexDirection: 'row' },
	cameraAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: fsize(0.3) },
	cameraActionHeader: { fontSize: fsize(0.04), textAlign: 'center' },

	errorMsg: { color: 'darkred', fontSize: fsize(0.05), fontWeight: 'bold', textAlign: 'center' },

	submit: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 10, width: fsize(0.3) },
	submitHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', height: 40, justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', height: 30, marginVertical: 5, marginHorizontal: 20 },
	bottomNavHeader: { fontSize: fsize(0.04), fontWeight: 'bold', paddingVertical: 5 },
})
