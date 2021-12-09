import React, { useEffect, useState, useRef } from 'react'
import { ActivityIndicator, Dimensions, ScrollView, View, Text, TextInput, Image, Keyboard, TouchableOpacity, KeyboardAvoidingView, StyleSheet } from 'react-native'
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
const screenHeight = height - (offsetPadding * 2)
const frameSize = width * 0.9

export default function addmenu(props) {
	const params = props.route.params
	const { menuid, refetch } = params

	const [cameraPermission, setCamerapermission] = useState(null);
	const [pickingPermission, setPickingpermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
	const [name, setName] = useState('')
	const [info, setInfo] = useState('')
	const [image, setImage] = useState({ uri: '', name: '' })

	const [loaded, setLoaded] = useState(menuid ? false : true)

	const [errorMsg, setErrormsg] = useState('')

	const isMounted = useRef(null)

	const addTheNewMenu = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { locationid, parentMenuid: menuid, name, info, image, permission: cameraPermission || pickingPermission }

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
				}
			})
	}
	const saveTheMenu = () => {
		const data = { menuid, name, info, image, permission: cameraPermission && pickingPermission }
		
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

				}
			})
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
			let options = { quality: 0 };
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

		allowCamera()
		allowChoosing()

		if (menuid) {
			getTheMenuInfo()
		}

		return () => isMounted.current = false
	}, [])

	if (cameraPermission === null || pickingPermission === null) return <View/>

	return (
		<View style={style.addmenu}>
			<View style={{ paddingBottom: offsetPadding }}>
				<KeyboardAvoidingView behavior="padding">
					{loaded ? 
						<ScrollView style={{ backgroundColor: '#EAEAEA' }} showsVerticalScrollIndicator={false}>
							<View style={style.box}>
								<Text style={style.addHeader}>Enter menu info</Text>

								<TextInput style={style.addInput} placeholder="Menu name" placeholderTextColor="rgba(127, 127, 127, 0.5)" onChangeText={(name) => setName(name)} value={name} autoCorrect={false} autoCompleteType="off" autoCapitalize="none"/>
								<TextInput style={style.infoInput} onSubmitEditing={() => Keyboard.dismiss()} multiline={true} placeholder="Anything you want to say about this menu" placeholderTextColor="rgba(127, 127, 127, 0.5)" onChangeText={(info) => setInfo(info)} value={info} autoCorrect={false} autoCompleteType="off" autoCapitalize="none"/>

								<View style={style.cameraContainer}>
									<Text style={style.cameraHeader}>Menu photo</Text>

									{image.uri ? (
										<>
											<Image style={{ height: frameSize, width: frameSize }} source={{ uri: image.uri }}/>

											<TouchableOpacity style={style.cameraAction} onPress={() => setImage({ uri: '', name: '' })}>
												<Text style={style.cameraActionHeader}>Cancel</Text>
											</TouchableOpacity>
										</>
									) : (
										<>
											<Camera style={style.camera} type={Camera.Constants.Type.back} ref={r => { setCamcomp(r) }}/>

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

								<Text style={style.errorMsg}>{errorMsg}</Text>

								<View style={style.addActions}>
									<TouchableOpacity style={style.addAction} onPress={() => props.navigation.goBack()}>
										<Text>Cancel</Text>
									</TouchableOpacity>
									<TouchableOpacity style={style.addAction} onPress={() => {
										if (!menuid) {
											addTheNewMenu()
										} else {
											saveTheMenu()
										}
									}}>
										<Text>Done</Text>
									</TouchableOpacity>
								</View>
							</View>
						</ScrollView>
						:
						<ActivityIndicator size="large" marginTop={screenHeight / 2}/>
					}
				</KeyboardAvoidingView>
			</View>
		</View>
	)
}

const style = StyleSheet.create({
	addmenu: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', paddingVertical: 10, width: '100%' },
	addHeader: { fontSize: 20, fontWeight: 'bold', paddingVertical: 5 },
	addInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, fontSize: 20, padding: 10, width: '90%' },
	infoInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, fontSize: 20, height: 100, marginVertical: 5, padding: 10, textAlignVertical: 'top', width: '90%' },
	cameraContainer: { alignItems: 'center', width: '100%' },
	cameraHeader: { fontSize: 20, fontWeight: 'bold', paddingVertical: 5 },
	camera: { height: frameSize, width: frameSize },
	cameraActions: { flexDirection: 'row' },
	cameraAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginBottom: 50, margin: 5, padding: 5, width: 100 },
	cameraActionHeader: { fontSize: 15, textAlign: 'center' },
	errorMsg: { color: 'red', fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
	addActions: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	addAction: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: 20, padding: 5, width: 100 },
})
