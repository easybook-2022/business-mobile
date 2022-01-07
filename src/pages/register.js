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
const screenRatio = width / height

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
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
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
				if (!profile.uri && Platform.OS == 'ios') {
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

			if (nextStep == "profile") {
				allowCamera()
				allowChoosing()
			}

			setSetuptype(nextStep)
		} else {
			setErrormsg(msg)
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

	return (
		<View style={style.register}>
			<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
				<View style={[style.box, { opacity: loading ? 0.5 : 1 }]}>
					<Text style={style.boxHeader}>Setup</Text>

					<View style={style.inputsBox}>
						{setupType == "nickname" && (
							<View style={style.inputContainer}>
								<Text style={style.inputHeader}>Enter your name:</Text>
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

						{(setupType == "profile" && (cameraPermission !== null || pickingPermission !== null)) && (
							<View style={style.cameraContainer}>
								<Text style={style.inputHeader}>Provide a photo of yourself</Text>

								{profile.uri ? (
									<>
										<Image style={style.camera} source={{ uri: profile.uri }}/>

										<TouchableOpacity style={style.cameraAction} onPress={() => setProfile({ uri: '', name: '' })}>
											<Text style={style.cameraActionHeader}>Cancel</Text>
										</TouchableOpacity>
									</>
								) : (
									<>
										<Camera 
											style={style.camera} 
											type={Camera.Constants.Type.front} ref={r => {setCamcomp(r)}}
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
							</View>
						)}

						<Text style={style.errorMsg}>{errorMsg}</Text>

						{loading ? <ActivityIndicator color="black" size="small"/> : null}

						<View style={style.actions}>
							{setupType != 'nickname' && (
								<TouchableOpacity style={style.action} onPress={() => {
									let index = steps.indexOf(setupType)

									index--

									setSetuptype(steps[index])
								}}>
									<Text style={style.actionHeader}>Back</Text>
								</TouchableOpacity>
							)}

							<TouchableOpacity style={style.action} disabled={loading} onPress={() => setupType == "profile" ? register() : saveInfo()}>
								<Text style={style.actionHeader}>{setupType == "profile" ? "Done" : "Next"}</Text>
							</TouchableOpacity>
						</View>
					</View>

					<View style={style.bottomNavs}>
						<View style={style.bottomNavsRow}>
							<TouchableOpacity style={style.bottomNav} onPress={() => {
								AsyncStorage.clear()

								props.navigation.dispatch(
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
			</TouchableWithoutFeedback>
		</View>
	);
}

const style = StyleSheet.create({
	register: { backgroundColor: 'white', height: '100%', paddingVertical: offsetPadding, width: '100%' },
	box: { alignItems: 'center', backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	boxHeader: { color: 'black', fontFamily: 'appFont', fontSize: fsize(0.1), fontWeight: 'bold', marginTop: 20 },

	inputsBox: { alignItems: 'center', width: '100%' },
	inputContainer: { width: '80%' },
	inputHeader: { fontFamily: 'appFont', fontSize: fsize(0.06) },
	input: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: fsize(0.07), padding: 5, width: '100%' },

	cameraContainer: { alignItems: 'center', width: '100%' },
	camera: { height: fsize(0.7), width: fsize(0.7) },
	cameraActions: { flexDirection: 'row' },
	cameraAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: fsize(0.3) },
	cameraActionHeader: { fontSize: fsize(0.03), textAlign: 'center' },

	errorMsg: { color: 'darkred', fontSize: fsize(0.05), fontWeight: 'bold', textAlign: 'center' },

	actions: { flexDirection: 'row', justifyContent: 'space-around' },
	action: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 10, width: fsize(0.3) },
	actionHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },
})
