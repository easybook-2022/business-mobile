import React, { useEffect, useState } from 'react'
import { SafeAreaView, ActivityIndicator, Dimensions, ScrollView, View, Text, TextInput, Image, Keyboard, TouchableOpacity, TouchableWithoutFeedback, StyleSheet } from 'react-native'
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
const wsize = p => {
  return width * (p / 100)
}
const hsize = p => {
  return height * (p / 100)
}
const steps = ['name', 'photo', 'price', 'duration']

export default function Addservice(props) {
	const params = props.route.params
	const { parentMenuid, serviceid, refetch } = params

	const [setupType, setSetuptype] = useState('name')
	const [cameraPermission, setCamerapermission] = useState(null);
	const [pickingPermission, setPickingpermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
	const [name, setName] = useState('')
	const [image, setImage] = useState({ uri: '', name: '' })
	const [price, setPrice] = useState('')
	const [duration, setDuration] = useState('')
	const [loaded, setLoaded] = useState(serviceid ? false : true)
	const [loading, setLoading] = useState(false)

	const [errorMsg, setErrormsg] = useState('')

	const addTheNewService = async() => {
		const locationid = await AsyncStorage.getItem("locationid")

		if (name && (price && !isNaN(price)) && duration) {
			const data = { locationid, menuid: parentMenuid ? parentMenuid : "", name, image, price, duration, permission: cameraPermission || pickingPermission }

			setLoading(true)

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
						setLoading(false)
					} else {
            alert("add service")
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
			const data = { locationid, menuid: parentMenuid ? parentMenuid : "", serviceid, name, image, price, duration, permission: cameraPermission || pickingPermission }

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
						const { errormsg, status } = err.response.data

						setErrormsg(errormsg)
						setLoading(false)
					} else {
            alert("update service")
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
		let msg = ""

		setLoading(true)

		switch (index) {
			case 0:
				if (!name) {
					msg = "Please provide a name for the service"
				}

				break
			case 2:
				if (!image.uri && Platform.OS == 'ios') {
					msg = "Please provide a photo for the service"
				}

				break
			case 3:
				if (!price) {
					msg = "Please provide a price for the service"
				}

				break
			case 4:
				if (!duration) {
					msg = "Please provide the duration of the service"
				}

				break
			default:
		}

		if (msg == "") {
			const nextStep = index == 3 ? "done" : steps[index + 1]

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
					setImage({ uri: logo_url + serviceInfo.image, name: serviceInfo.image })
					setPrice(serviceInfo.price.toString())
					setDuration(serviceInfo.duration)
					setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
          alert("get service info")
				}
			})
	}

	useEffect(() => {
		if (serviceid) getTheServiceInfo()
	}, [])

	return (
		<SafeAreaView style={[styles.addservice, { opacity: loading ? 0.5 : 1 }]}>
			<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
				{loaded ? 
					<View style={styles.box}>
						{setupType == "name" && (
							<View style={styles.inputContainer}>
								<Text style={styles.addHeader}>What is this service call ?</Text>

								<TextInput 
									style={styles.addInput} placeholderTextColor="rgba(127, 127, 127, 0.5)" 
									placeholder="example: Men hair cut" onChangeText={(name) => setName(name)} 
									value={name} autoCorrect={false} autoCompleteType="off" autoCapitalize="none"
								/>
							</View>
						)}
            
						{setupType == "photo" && (
							<View style={styles.cameraContainer}>
								<Text style={styles.cameraHeader}>Provide a photo for {name}</Text>

								{image.uri ? (
									<>
										<Image style={styles.camera} source={{ uri: image.uri }}/>

										<TouchableOpacity style={styles.cameraAction} onPress={() => setImage({ uri: '', name: '' })}>
											<Text style={styles.cameraActionHeader}>Cancel</Text>
										</TouchableOpacity>
									</>
								) : (
									<>
										<Camera 
											style={styles.camera} 
											type={Camera.Constants.Type.back} ref={r => {setCamcomp(r)}}
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

						{setupType == "price" && (
							<View style={styles.inputContainer}>
								<Text style={styles.addHeader}>{serviceid ? "Update" : "Enter"} {name} price</Text>
								<TextInput style={styles.addInput} placeholderTextColor="rgba(0, 0, 0, 0.5)" placeholder="example: 4.99" onChangeText={(price) => {
									let newPrice = price.toString()

									if (newPrice.includes(".") && newPrice.split(".")[1].length == 2) {
										Keyboard.dismiss()
									}

									setPrice(price.toString())
								}} value={price} keyboardType="numeric" autoCorrect={false} autoCapitalize="none"/>
							</View>
						)}

						{setupType == "duration" && (
							<View style={styles.inputContainer}>
								<Text style={styles.addHeader}>How long is the {'\n' + name} service</Text>
								<TextInput 
									style={styles.addInput} placeholderTextColor="rgba(0, 0, 0, 0.5)" placeholder="example: 4 hours" 
									onChangeText={(duration) => setDuration(duration)} value={duration} autoCapitalize="none"
								/>
							</View>
						)}

						<Text style={styles.errorMsg}>{errorMsg}</Text>

						<View style={styles.addActions}>
							<TouchableOpacity style={styles.addAction} disabled={loading} onPress={() => props.navigation.goBack()}>
								<Text style={styles.addActionHeader}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.addAction} disabled={loading} onPress={() => {
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
								<Text style={styles.addActionHeader}>{
									!serviceid ? 
										setupType == 'duration' ? "Done" : "Next"
										: 
										setupType == 'duration' ? "Save" : "Next"
								}</Text>
							</TouchableOpacity>
						</View>
					</View>
					:
					<View style={styles.loading}>
						<ActivityIndicator color="black" size="large"/>
					</View>
				}
			</TouchableWithoutFeedback>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	addservice: { height: '100%', width: '100%' },
	box: { alignItems: 'center', height: '100%', width: '100%' },
	inputContainer: { alignItems: 'center', width: '100%' },
	addHeader: { fontSize: wsize(5), fontWeight: 'bold', paddingVertical: 5, textAlign: 'center' },
	addInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, fontSize: wsize(5), padding: 10, width: '90%' },
	infoInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, fontSize: wsize(5), height: 100, marginVertical: 5, padding: 10, textAlignVertical: 'top', width: '90%' },
	cameraContainer: { alignItems: 'center', width: '100%' },
	cameraHeader: { fontSize: wsize(5), fontWeight: 'bold', paddingVertical: 5 },
	camera: { height: wsize(70), width: wsize(70) },
	cameraActions: { flexDirection: 'row' },
	cameraAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginBottom: 50, margin: 5, padding: 5, width: wsize(30) },
	cameraActionHeader: { fontSize: wsize(3), textAlign: 'center' },
	
	addActions: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  addAction: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(6), padding: 5, width: wsize(30) },
  addActionHeader: { fontSize: wsize(5) },

  loading: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  errorMsg: { color: 'darkred', fontSize: wsize(4), textAlign: 'center' },
})
