import React, { useState, useEffect } from 'react';
import { SafeAreaView, Platform, Dimensions, ScrollView, View, Text, TextInput, Image, TouchableOpacity, TouchableWithoutFeedback, Modal, Keyboard, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker';
import { CommonActions } from '@react-navigation/native';
import { saveUserInfo } from '../apis/owners'
import { ownerRegisterInfo, registerInfo } from '../../assets/info'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

// components
import Loadingprogress from '../components/loadingprogress';

const { height, width } = Dimensions.get('window')
const wsize = p => {
  return width * (p / 100)
}
const hsize = p => {
  return height * (p / 100)
}
const steps = ['nickname', 'profile']

export default function Register(props) {
	const [setupType, setSetuptype] = useState('nickname')
	const [cameraPermission, setCamerapermission] = useState(null);
	const [pickingPermission, setPickingpermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
	const [username, setUsername] = useState(ownerRegisterInfo.username)
	const [profile, setProfile] = useState({ uri: '', name: '' })

	const [loading, setLoading] = useState(false)
	const [errorMsg, setErrormsg] = useState('')

	const register = async() => {
    setLoading(true)

    const id = await AsyncStorage.getItem("ownerid")
    const data = { id, username, profile, permission: cameraPermission || pickingPermission }

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
            AsyncStorage.setItem("phase", "workinghours")

            props.navigation.dispatch(
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
          } else {
            alert("register")
          }

          setLoading(false)
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
				if (!profile.uri && Platform.OS == 'ios') {
					msg = "Please provide a profile you like"
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
        setLoading(false)
			})
		}
	}
	const choosePhoto = async() => {
    setLoading(true)

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
        setLoading(false)
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
		<SafeAreaView style={styles.register}>
			<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
				<View style={[styles.box, { opacity: loading ? 0.5 : 1 }]}>
					<View style={styles.header}>
						<Text style={styles.boxHeader}>Setup your stylist info</Text>
					</View>

					<View style={styles.inputsBox}>
						{setupType == "nickname" && (
							<View style={styles.inputContainer}>
								<Text style={styles.inputHeader}>Enter your name:</Text>
								<TextInput style={styles.input} onChangeText={(username) => setUsername(username)} value={username} autoCorrect={false} autoCapitalize="none"/>
							</View>
						)}

            {(setupType == "profile" && (cameraPermission !== null || pickingPermission !== null)) && (
							<View style={styles.cameraContainer}>
								<Text style={styles.inputHeader}>Provide a photo of yourself</Text>
                <Text style={styles.inputInfo}>clients will be able to find and book you easily</Text>

								{profile.uri ? (
									<>
										<Image style={styles.camera} source={{ uri: profile.uri }}/>

										<TouchableOpacity style={styles.cameraAction} onPress={() => setProfile({ uri: '', name: '' })}>
											<Text style={styles.cameraActionHeader}>Cancel</Text>
										</TouchableOpacity>
									</>
								) : (
									<>
										<Camera 
											style={styles.camera} 
											type={Camera.Constants.Type.front} ref={r => {setCamcomp(r)}}
											ratio="1:1"
										/>

										<View style={styles.cameraActions}>
											<TouchableOpacity style={styles.cameraAction} onPress={snapPhoto.bind(this)}>
												<Text style={styles.cameraActionHeader}>Take{'\n'}this photo</Text>
											</TouchableOpacity>
											<TouchableOpacity style={styles.cameraAction} onPress={() => choosePhoto()}>
												<Text style={styles.cameraActionHeader}>Choose{'\n'}from phone</Text>
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
									<Text style={styles.actionHeader}>Back</Text>
								</TouchableOpacity>
							)}

							<TouchableOpacity style={[styles.action, { opacity: loading ? 0.3 : 1 }]} disabled={loading} onPress={() => setupType == "profile" ? register() : saveInfo()}>
								<Text style={styles.actionHeader}>{setupType == "profile" ? "Done" : "Next"}</Text>
							</TouchableOpacity>
						</View>
					</View>

					<View style={styles.bottomNavs}>
						<View style={styles.bottomNavsRow}>
							<TouchableOpacity style={styles.bottomNav} onPress={() => {
								AsyncStorage.clear()

								props.navigation.dispatch(
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
				</View>
			</TouchableWithoutFeedback>

      {loading && (
        <Modal transparent={true}>
          <Loadingprogress/>
        </Modal>
      )}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	register: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { alignItems: 'center', backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	header: { flexDirection: 'column', height: '10%', justifyContent: 'space-around' },
	boxHeader: { color: 'black', fontFamily: 'appFont', fontSize: wsize(7), fontWeight: 'bold' },

	inputsBox: { alignItems: 'center', height: '80%', width: '100%' },
	inputContainer: { width: '80%' },
	inputHeader: { fontFamily: 'appFont', fontSize: wsize(5) },
  inputInfo: { fontSize: wsize(5), margin: 10, textAlign: 'center' },
	input: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), padding: 5, width: '100%' },

	cameraContainer: { alignItems: 'center', width: '100%' },
	camera: { height: width * 0.7, width: width * 0.7 },
	cameraActions: { flexDirection: 'row' },
	cameraAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: wsize(30) },
	cameraActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	actions: { flexDirection: 'row', justifyContent: 'space-around' },
	action: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 10, width: wsize(30) },
	actionHeader: { fontFamily: 'appFont', fontSize: wsize(5), textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
	bottomNavHeader: { fontSize: wsize(4), fontWeight: 'bold' },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
  errorMsg: { color: 'darkred', fontSize: wsize(5), textAlign: 'center' },
})
