import React, { useEffect, useState } from 'react'
import { AsyncStorage, Dimensions, ScrollView, View, Text, TextInput, Image, Keyboard, TouchableOpacity, KeyboardAvoidingView, StyleSheet } from 'react-native'
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import { logo_url } from '../../assets/info'
import { getServiceInfo, addNewService, updateService } from '../apis/services'

import FontAwesome from 'react-native-vector-icons/FontAwesome'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function addservice(props) {
	const params = props.route.params
	const { menuid, refetch } = params
	const serviceid = params.id ? params.id : ""
	
	const [permission, setPermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
	const [camType, setCamtype] = useState(Camera.Constants.Type.back);
	const [name, setName] = useState('')
	const [info, setInfo] = useState('')
	const [image, setImage] = useState({ uri: '', name: '' })
	const [price, setPrice] = useState('')
	const [duration, setDuration] = useState('')
	const [errorMsg, setErrormsg] = useState('')

	const addTheNewService = async() => {
		const locationid = await AsyncStorage.getItem("locationid")

		if (name && image.uri && (price && !isNaN(price)) && duration) {
			const data = { locationid, menuid, name, info, image, price, duration }

			addNewService(data)
				.then((res) => {
					if (res.status == 200) {
						if (!res.data.errormsg) {
							return res.data
						} else {
							setErrormsg(res.data.errormsg)
						}
					}
				})
				.then((res) => {
					if (res) {
						refetch()
						props.navigation.goBack()
					}
				})
		} else {
			if (!name) {
				setErrormsg("Please enter the service name")

				return
			}

			if (!image.uri) {
				setErrormsg("Please take a good photo")

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

		if (name && image.uri && (price && !isNaN(price)) && duration) {
			const data = { locationid, menuid, serviceid, name, info, image, price, duration }

			updateService(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					} else {
						setErrormsg(res.data.errormsg)
					}
				})
				.then((res) => {
					if (res) {
						refetch()
						props.navigation.goBack()
					}
				})
		} else {
			if (!name) {
				setErrormsg("Please enter the service name")

				return
			}

			if (!image.uri) {
				setErrormsg("Please take a good photo")

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

			if (camType == Camera.Constants.Type.front) {
				photo_option.push({ flip: ImageManipulator.FlipType.Horizontal })
			}

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
	const openCamera = async() => {
		const { status } = await Camera.getPermissionsAsync()

		if (status == 'granted') {
			setPermission(status === 'granted')
		} else {
			const { status } = await Camera.requestPermissionsAsync()

			setPermission(status === 'granted')
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
				if (res) {
					const { serviceInfo } = res

					setName(serviceInfo.name)
					setInfo(serviceInfo.info)
					setImage({ uri: logo_url + serviceInfo.image, name: serviceInfo.image })
					setPrice(serviceInfo.price.toString())
					setDuration(serviceInfo.duration)
				}
			})
	}

	useEffect(() => {
		(async() => openCamera())()

		if (serviceid) {
			getTheServiceInfo()
		}
	}, [])

	if (permission === null) return <View/>

	return (
		<View style={style.addservice}>
			<View style={{ paddingBottom: offsetPadding }}>
				<KeyboardAvoidingView behavior="padding">
					<ScrollView style={{ backgroundColor: '#EAEAEA' }} showsVerticalScrollIndicator={false}>
						<View style={style.box}>
							<Text style={style.addHeader}>Enter service info</Text>
							
							<TextInput style={style.addInput} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Service name" onChangeText={(name) => setName(name)} value={name}/>
							<TextInput style={style.infoInput} multiline={true} onSubmitEditing={() => Keyboard.dismiss()} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Anything you want to say about this service (optional)" onChangeText={(info) => setInfo(info)} value={info}/>

							<View style={style.cameraContainer}>
								<Text style={style.cameraHeader}>Service photo</Text>

								{image.uri ? (
									<>
										<Image style={style.camera} source={{ uri: image.uri }}/>

										<TouchableOpacity style={style.cameraAction} onPress={() => setImage({ uri: '', name: '' })}>
											<AntDesign name="closecircleo" size={30}/>
										</TouchableOpacity>
									</>
								) : (
									<>
										<Camera style={style.camera} type={camType} ref={r => {setCamcomp(r)}}/>

										<TouchableOpacity style={style.cameraAction} onPress={snapPhoto.bind(this)}>
											<Entypo name="camera" size={30}/>
										</TouchableOpacity>
									</>
								)}	
							</View>

							<View style={style.inputBox}>
								<Text style={style.inputHeader}>Service price</Text>
								<TextInput style={style.inputValue} placeholderTextColor="rgba(0, 0, 0, 0.5)" placeholder="4.99" onChangeText={(price) => setPrice(price.toString())} value={price}/>
							</View>

							<View style={style.inputBox}>
								<Text style={style.inputHeader}>Service duration</Text>
								<TextInput style={style.inputValue} placeholderTextColor="rgba(0, 0, 0, 0.5)" placeholder="4 hours" onChangeText={(duration) => setDuration(duration)} value={duration}/>
							</View>

							<Text style={style.errorMsg}>{errorMsg}</Text>

							<View style={style.addActions}>
								<TouchableOpacity style={style.addAction} onPress={() => {
									if (!serviceid) {
										addTheNewService()
									} else {
										updateTheService()
									}
								}}>
									<Text>{!serviceid ? "Done" : "Save"}</Text>
								</TouchableOpacity>
							</View>
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
			</View>
		</View>
	)
}

const style = StyleSheet.create({
	addservice: { backgroundColor: 'white' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', paddingVertical: 10, width: '100%' },
	addHeader: { fontWeight: 'bold', paddingVertical: 5 },
	addInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, fontSize: 13, marginBottom: 5, padding: 5, width: '80%' },
	infoInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, fontSize: 13, height: 100, marginBottom: 50, padding: 10, width: '80%' },
	cameraContainer: { alignItems: 'center', marginBottom: 50, width: '100%' },
	cameraHeader: { fontWeight: 'bold', paddingVertical: 5 },
	camera: { height: width * 0.8, width: width * 0.8 },
	cameraAction: { margin: 10 },
	inputBox: { flexDirection: 'row', marginBottom: 30 },
	inputHeader: { fontSize: 15, fontWeight: 'bold', padding: 5 },
	inputValue: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: '40%' },
	errorMsg: { color: 'red', fontWeight: 'bold', marginBottom: 50, textAlign: 'center' },
	addActions: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 50, width: '100%' },
	addAction: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 100 },
})
