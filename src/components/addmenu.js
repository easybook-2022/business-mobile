import React, { useEffect, useState, useRef } from 'react'
import { Platform, ActivityIndicator, Dimensions, ScrollView, View, Text, TextInput, Image, Keyboard, TouchableOpacity, TouchableWithoutFeedback, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker';
import { logo_url } from '../../assets/info'
import { addNewMenu, getMenuInfo, saveMenu } from '../apis/menus'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight

const steps = ['name', 'info', 'photo']

const fsize = p => {
	return width * p
}

export default function addmenu(props) {
	const params = props.route.params
	const { parentMenuid, menuid, refetch } = params

	const [setupType, setSetuptype] = useState('name')
	const [cameraPermission, setCamerapermission] = useState(null);
	const [pickingPermission, setPickingpermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
	const [name, setName] = useState('')
	const [info, setInfo] = useState('')
	const [image, setImage] = useState({ uri: '', name: '' })

	const [loaded, setLoaded] = useState(menuid ? false : true)
	const [loading, setLoading] = useState(false)

	const [errorMsg, setErrormsg] = useState('')

	const isMounted = useRef(null)

	const addTheNewMenu = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { locationid, parentMenuid, name, info, image, permission: cameraPermission || pickingPermission }

		setLoading(true)

		addNewMenu(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					refetch()
					props.navigation.goBack()
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data

					setMenuform({
						...menuForm,
						errormsg
					})
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}
	const saveTheMenu = () => {
		const data = { menuid, name, info, image, permission: cameraPermission && pickingPermission }

		setLoading(true)
		
		saveMenu(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					refetch()
					props.navigation.goBack()
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {

				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}
	const saveInfo = () => {
		const index = steps.indexOf(setupType)
		let msg = ""

		setLoading(true)

		switch (index) {
			case 0:
				if (!name) {
					msg = "Please provide a name for the menu"
				}

				break
			case 2:
				if (!image.uri && Platform.OS == 'ios') {
					msg = "Please provide a photo for the menu"
				}

				break
			default:
		} 

		if (msg == "") {
			const nextStep = index == 2 ? "done" : steps[index + 1]

			if (nextStep == "photo") {
				allowCamera()
				allowChoosing()
			}

			setSetuptype(nextStep)
			setErrormsg('')
		} else {
			setErrormsg(msg)
		}

		setLoading(false)
	}

	const getTheMenuInfo = async() => {
		getMenuInfo(menuid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res && isMounted.current == true) {
					const { name, info, image } = res.info

					setName(name)
					setInfo(info)
					setImage({ uri: logo_url + image, name: image })
					setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
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
				setImage({ uri: `${FileSystem.documentDirectory}/${char}.jpg`, name: `${char}.jpg` })
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
				setImage({ uri: `${FileSystem.documentDirectory}/${char}.jpg`, name: `${char}.jpg` })
				setErrormsg('')
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
		isMounted.current = true

		getTheMenuInfo()

		return () => isMounted.current = false
	}, [])

	return (
		<View style={[style.addmenu, { opacity: loading ? 0.5 : 1 }]}>
			<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
				{loaded ? 
					<View style={style.box}>
						{setupType == 'name' && (
							<View style={style.inputContainer}>
								<Text style={style.addHeader}>What is this menu call</Text>

								<TextInput 
									style={style.addInput} placeholder="example: Beverages" placeholderTextColor="rgba(127, 127, 127, 0.5)" 
									onChangeText={(name) => setName(name)} value={name} autoCorrect={false} autoCompleteType="off" 
									autoCapitalize="none"
								/>
							</View>
						)}

						{setupType == 'info' && (
							<View style={style.inputContainer}>
								<Text style={style.addHeader}>Anything you want to say about {'\n' + name} (Optional)</Text>

								<TextInput 
									style={style.infoInput} multiline textAlignVertical="top"
									placeholder={"example: " + name + " will be 20% off this week (Optional)"} placeholderTextColor="rgba(127, 127, 127, 0.5)" 
									onChangeText={(info) => setInfo(info)} value={info} autoCorrect={false} autoCompleteType="off" 
									autoCapitalize="none"
								/>
							</View>
						)}

						{setupType == 'photo' && (
							<View style={style.cameraContainer}>
								<Text style={style.cameraHeader}>Provide a photo for {name}</Text>

								{image.uri ? (
									<>
										<Image style={style.camera} source={{ uri: image.uri }}/>

										<TouchableOpacity style={style.cameraAction} onPress={() => setImage({ uri: '', name: '' })}>
											<Text style={style.cameraActionHeader}>Cancel</Text>
										</TouchableOpacity>
									</>
								) : (
									<>
										<Camera 
											style={style.camera} 
											type={Camera.Constants.Type.back} ref={r => { setCamcomp(r) }}
											ratio="1:1"
										/>

										{image.loading && <ActivityIndicator color="black" size="small"/>}

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

						<View style={style.addActions}>
							<TouchableOpacity style={style.addAction} disabled={loading} onPress={() => props.navigation.goBack()}>
								<Text style={style.addActionHeader}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity style={style.addAction} disabled={loading} onPress={() => {
								if (!menuid) {
									if (setupType == "photo") {
										addTheNewMenu()
									} else {
										saveInfo()
									}
								} else {
									if (setupType == "photo") {
										saveTheMenu()
									} else {
										saveInfo()
									}
								}
							}}>
								<Text style={style.addActionHeader}>{
									!menuid ? 
										setupType == "photo" ? "Done" : "Next"
										:
										setupType == "photo" ? "Save" : "Next"
								}</Text>
							</TouchableOpacity>
						</View>
					</View>
					:
					<View style={{ alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' }}>
						<ActivityIndicator size="large"/>
					</View>
				}
			</TouchableWithoutFeedback>
		</View>
	)
}

const style = StyleSheet.create({
	addmenu: { height: '100%', paddingBottom: offsetPadding, width: '100%' },
	box: { alignItems: 'center', height: '100%', width: '100%' },
	inputContainer: { alignItems: 'center', width: '100%' },
	addHeader: { fontSize: fsize(0.05), fontWeight: 'bold', paddingVertical: 5, textAlign: 'center' },
	addInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, fontSize: fsize(0.05), padding: 10, width: '90%' },
	infoInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, fontSize: fsize(0.05), height: 100, marginVertical: 5, padding: 10, width: '90%' },
	
	cameraContainer: { alignItems: 'center', width: '100%' },
	cameraHeader: { fontSize: fsize(0.05), fontWeight: 'bold', paddingVertical: 5 },
	camera: { height: fsize(0.7), width: fsize(0.7) },
	cameraActions: { flexDirection: 'row' },
	cameraAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginBottom: 50, margin: 5, padding: 5, width: fsize(0.3) },
	cameraActionHeader: { fontSize: fsize(0.03), textAlign: 'center' },
	
	errorMsg: { color: 'red', fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
	
	addActions: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 50, width: '100%' },
	addAction: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: fsize(0.07), padding: 5, width: 100 },
	addActionHeader: { fontSize: fsize(0.05) },
})
