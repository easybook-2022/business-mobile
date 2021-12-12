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
import { getServiceInfo, addNewService, updateService } from '../apis/services'

import FontAwesome from 'react-native-vector-icons/FontAwesome'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)
const frameSize = width * 0.9

const steps = ['name', 'info', 'photo', 'price', 'duration']

export default function addservice(props) {
	const params = props.route.params
	const { menuid, refetch } = params
	const serviceid = params.id ? params.id : ""

	const [setupType, setSetuptype] = useState('name')
	const [cameraPermission, setCamerapermission] = useState(null);
	const [pickingPermission, setPickingpermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
	const [name, setName] = useState('')
	const [info, setInfo] = useState('')
	const [image, setImage] = useState({ uri: '', name: '' })
	const [price, setPrice] = useState('')
	const [duration, setDuration] = useState('')
	const [loaded, setLoaded] = useState(serviceid ? false : true)

	const [errorMsg, setErrormsg] = useState('')

	const isMounted = useRef(null)

	const addTheNewService = async() => {
		const locationid = await AsyncStorage.getItem("locationid")

		if (name && (price && !isNaN(price)) && duration) {
			const data = { locationid, menuid, name, info, image, price, duration, permission: cameraPermission || pickingPermission }

			addNewService(data)
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

						setErrormsg(errormsg)
					}
				})
		} else {
			if (!name) {
				setErrormsg("Please enter the service name")

				return
			}

			if (!price) {
				setErrormsg("Please enter the price of the service")

				return
			} else if (isNaN(price)) {
				setErrormsg("The price you entered is invalid")

				return
			}

			if (!duration) {
				setErrormsg("Please enter the duration of this service")

				return
			}
		}
	}
	const updateTheService = async() => {
		const locationid = await AsyncStorage.getItem("locationid")

		if (name && (price && !isNaN(price)) && duration) {
			const data = { locationid, menuid, serviceid, name, info, image, price, duration, permission: cameraPermission || pickingPermission }

			updateService(data)
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
		} else {
			if (!name) {
				setErrormsg("Please enter the service name")

				return
			}

			if (!price) {
				setErrormsg("Please enter the price of the service")

				return
			} else if (isNaN(price)) {
				setErrormsg("The price you entered is invalid")

				return
			}

			if (!duration) {
				setErrormsg("Please enter the duration of this service")

				return
			}
		}
	}
	const saveInfo = () => {
		const index = steps.indexOf(setupType)
		const nextStep = index == 4 ? "done" : steps[index + 1]

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
	
	const getTheServiceInfo = async() => {
		getServiceInfo(serviceid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res && isMounted.current == true) {
					const { serviceInfo } = res

					setName(serviceInfo.name)
					setInfo(serviceInfo.info)
					setImage({ uri: logo_url + serviceInfo.image, name: serviceInfo.image })
					setPrice(serviceInfo.price.toString())
					setDuration(serviceInfo.duration)
					setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				}
			})
	}

	useEffect(() => {
		isMounted.current = true

		allowCamera()
		allowChoosing()

		if (serviceid) {
			getTheServiceInfo()
		}

		return () => isMounted.current = false
	}, [])

	if (cameraPermission === null || pickingPermission === null) return <View/>

	return (
		<View style={style.addservice}>
			<View style={{ paddingBottom: offsetPadding }}>
				<KeyboardAvoidingView behavior="padding">
					{loaded ? 
						<View style={style.box}>
							{setupType == "name" && (
								<View style={style.inputContainer}>
									<Text style={style.addHeader}>Enter service name</Text>

									<TextInput style={style.addInput} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Service name" onChangeText={(name) => setName(name)} value={name} autoCorrect={false} autoCompleteType="off" autoCapitalize="none"/>
								</View>
							)}

							{setupType == "info" && (
								<View style={style.inputContainer}>
									<Text style={style.addHeader}>Enter service info</Text>

									<TextInput style={style.infoInput} multiline={true} onSubmitEditing={() => Keyboard.dismiss()} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Anything you want to say about this service (optional)" onChangeText={(info) => setInfo(info)} value={info} autoCorrect={false} autoCompleteType="off" autoCapitalize="none"/>
								</View>
							)}

							{setupType == "photo" && (
								<View style={style.cameraContainer}>
									<Text style={style.cameraHeader}>Service photo</Text>

									{image.uri ? (
										<>
											<Image style={style.camera} source={{ uri: image.uri }}/>

											<TouchableOpacity style={style.cameraAction} onPress={() => setImage({ uri: '', name: '' })}>
												<Text style={style.cameraActionHeader}>Cancel</Text>
											</TouchableOpacity>
										</>
									) : (
										<>
											<Camera style={style.camera} type={Camera.Constants.Type.back} ref={r => {setCamcomp(r)}}/>

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

							{setupType == "price" && (
								<View style={style.inputContainer}>
									<Text style={style.inputHeader}>Enter service price</Text>
									<TextInput style={style.inputValue} placeholderTextColor="rgba(0, 0, 0, 0.5)" placeholder="4.99" onChangeText={(price) => setPrice(price.toString())} value={price} keyboardType="numeric" autoCorrect={false} autoCapitalize="none"/>
								</View>
							)}

							{setupType == "duration" && (
								<View style={style.inputContainer}>
									<Text style={style.inputHeader}>Enter service duration</Text>
									<TextInput style={style.inputValue} placeholderTextColor="rgba(0, 0, 0, 0.5)" placeholder="4 hours" onChangeText={(duration) => setDuration(duration)} value={duration} autoCapitalize="none"/>
								</View>
							)}

							<Text style={style.errorMsg}>{errorMsg}</Text>

							<View style={style.addActions}>
								<TouchableOpacity style={style.addAction} onPress={() => props.navigation.goBack()}>
									<Text style={style.addActionHeader}>Cancel</Text>
								</TouchableOpacity>
								<TouchableOpacity style={style.addAction} onPress={() => {
									if (!serviceid) {
										if (setupType == "duration") {
											addTheNewService()
										} else {
											saveInfo()
										}
									} else {
										if (setupType == "duration") {
											updateTheService()
										} else {
											saveInfo()
										}
									}
								}}>
									<Text style={style.addActionHeader}>{
										!serviceid ? 
											setupType == 'duration' ? "Done" : "Next"
											: 
											setupType == 'duration' ? "Save" : "Next"
									}</Text>
								</TouchableOpacity>
							</View>
						</View>
						:
						<ActivityIndicator size="large" marginTop={screenHeight / 2}/>
					}
				</KeyboardAvoidingView>
			</View>
		</View>
	)
}

const style = StyleSheet.create({
	addservice: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', paddingVertical: 10, width: '100%' },
	inputContainer: { alignItems: 'center', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '100%' },
	addHeader: { fontSize: 25, fontWeight: 'bold', paddingVertical: 5 },
	addInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, fontSize: 25, padding: 10, width: '90%' },
	infoInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, fontSize: 25, height: 100, marginVertical: 5, padding: 10, textAlignVertical: 'top', width: '90%' },
	cameraContainer: { alignItems: 'center', width: '100%' },
	cameraHeader: { fontSize: 20, fontWeight: 'bold', paddingVertical: 5 },
	camera: { height: frameSize, width: frameSize },
	cameraActions: { flexDirection: 'row' },
	cameraAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginBottom: 50, margin: 5, padding: 5, width: 120 },
	cameraActionHeader: { fontSize: 20, textAlign: 'center' },
	inputHeader: { fontSize: 25, fontWeight: 'bold', padding: 5 },
	inputValue: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: 25, padding: 5, width: 100 },
	errorMsg: { color: 'red', fontWeight: 'bold', marginBottom: 50, textAlign: 'center' },
	addActions: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 50, width: '100%' },
	addAction: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: 25, padding: 5, width: 100 },
	addActionHeader: { fontSize: 20 },
})
