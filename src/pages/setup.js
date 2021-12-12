import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { CommonActions } from '@react-navigation/native';
import { setupLocation } from '../apis/locations'
import { registerInfo } from '../../assets/info'

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const steps = ['location', 'phonenumber', 'logo']

export default function setup({ navigation }) {
	const offsetPadding = Constants.statusBarHeight
	const screenHeight = height - (offsetPadding * 2)

	const [setupType, setSetuptype] = useState('location')
	const [cameraPermission, setCamerapermission] = useState(null);
	const [pickingPermission, setPickingpermission] = useState(null);
	const [locationPermission, setLocationpermission] = useState(null)

	const [locationInfo, setLocationinfo] = useState('')
	const [camComp, setCamcomp] = useState(null)
	const [locationCoords, setLocationcoords] = useState({ longitude: null, latitude: null })
	const [storeName, setStorename] = useState(registerInfo.storeName)
	const [phonenumber, setPhonenumber] = useState(registerInfo.phonenumber)
	const [addressOne, setAddressone] = useState(registerInfo.addressOne)
	const [addressTwo, setAddresstwo] = useState(registerInfo.addressTwo)
	const [city, setCity] = useState(registerInfo.city)
	const [province, setProvince] = useState(registerInfo.province)
	const [postalcode, setPostalcode] = useState(registerInfo.postalcode)
	const [logo, setLogo] = useState({ uri: '', name: '' })
	const [loading, setLoading] = useState(false)
	const [errorMsg, setErrormsg] = useState('')

	const setupYourLocation = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const { details } = await NetInfo.fetch()
		const ipAddress = details.ipAddress
		let longitude, latitude

		if (storeName && phonenumber, addressOne && city && province && postalcode) {
			if (locationInfo == "destination") {
				longitude = locationCoords.longitude
				latitude = locationCoords.latitude
			} else {
				let [{ latitude, longitude }] = locationPermission ? 
					await Location.geocodeAsync(`${addressOne} ${addressTwo}, ${city} ${province}, ${postalcode}`)
					:
					[{ latitude: registerInfo.latitude, longitude: registerInfo.longitude }]
			}
				
			const time = (Date.now() / 1000).toString().split(".")[0]
			const data = {
				storeName, phonenumber, addressOne, addressTwo, city, province, postalcode, logo,
				longitude, latitude, ownerid, time, ipAddress, permission: cameraPermission, trialtime: Date.now()
			}

			setLoading(true)

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
						AsyncStorage.setItem("phase", "typesetup")

						navigation.dispatch(
							CommonActions.reset({
								index: 0,
								routes: [{ name: "typesetup" }]
							})
						)
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						const { errormsg, status } = err.response.data

						setErrormsg(errormsg)
						setLoading(false)
					}
				})
		} else {
			if (!storeName) {
				setErrormsg("Please enter your store name")

				return
			}

			if (!phonenumber) {
				setErrormsg("Please enter your store phone number")

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
		const nextStep = index == 2 ? "done" : steps[index + 1]

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
				setLogo({
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
				setLogo({
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
	const openLocation = async() => {
		const { status } = await Location.getForegroundPermissionsAsync()

		if (status == 'granted') {
			setLocationpermission(status === 'granted')
		} else {
			const { status } = await Location.requestForegroundPermissionsAsync()

			setLocationpermission(status === 'granted')
		}
	}
	
	useEffect(() => {
		(async() => {
			allowCamera()
			allowChoosing()
			openLocation()
		})()
	}, [])

	if (cameraPermission === null && pickingPermission && locationPermission === null) return <View/>
		
	return (
		<View style={style.setup}>
			<View style={{ paddingVertical: offsetPadding }}>
				<View style={[style.box, { opacity: loading ? 0.6 : 1 }]}>
					<Text style={style.boxHeader}>Setup ({steps.indexOf(setupType) + 1} of 3)</Text>

					<View style={style.inputsBox}>
						{setupType == "location" && (
							locationInfo == '' ?
								<>
									<Text style={style.locationHeader}>Are you at the store right now ?</Text>
									<View style={style.locationActions}>
										<TouchableOpacity style={style.locationAction} onPress={() => setLocationinfo('away')}>
											<Text style={style.locationActionHeader}>No</Text>
										</TouchableOpacity>
										<TouchableOpacity style={style.locationAction} onPress={async() => {
											const location = await Location.getCurrentPositionAsync({});
											const { longitude, latitude } = location.coords

											setLocationcoords({ longitude, latitude })
											setLocationinfo('destination')
										}}>
											<Text style={style.locationActionHeader}>Yes</Text>
										</TouchableOpacity>
									</View>
								</>
								:
								locationInfo != 'destination' ? 
									<ScrollView style={{ height: screenHeight - 250, width: '100%' }}>
										<View style={style.locationInfos}>
											<Text style={style.boxMiniheader}>Enter your location information</Text>

											<View style={{ alignItems: 'center', marginVertical: 50 }}>
												<Text style={style.locationHeader}>Are you at the store right now ?</Text>
												<TouchableOpacity style={style.locationAction} onPress={async() => {
													const location = await Location.getCurrentPositionAsync({});
													const { longitude, latitude } = location.coords

													setLocationcoords({ longitude, latitude })
													setLocationinfo('destination')
												}}>
													<Text style={style.locationActionHeader}>Mark location instead</Text>
												</TouchableOpacity>
											</View>

											<View style={style.inputContainer}>
												<Text style={style.inputHeader}>Enter store name:</Text>
												<TextInput style={style.input} onChangeText={(storeName) => setStorename(storeName)} value={storeName} autoCorrect={false} autoCapitalize="none"/>
											</View>
											<View style={style.inputContainer}>
												<Text style={style.inputHeader}>Enter store address #1:</Text>
												<TextInput style={style.input} onChangeText={(addressOne) => setAddressone(addressOne)} value={addressOne} autoCorrect={false} autoCapitalize="none"/>
											</View>
											<View style={style.inputContainer}>
												<Text style={style.inputHeader}>Enter store address #2:</Text>
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
										</View>
									</ScrollView>
									:
									<>
										<Text style={style.locationHeader}>Your store is located</Text>
										<TouchableOpacity style={style.locationAction} onPress={() => {
											setLocationcoords({ longitude: null, latitude: null })
											setLocationinfo('away')
										}}>
											<Text style={style.locationActionHeader}>Enter address instead</Text>
										</TouchableOpacity>
									</>
						)}

						{setupType == "phonenumber" && (
							<View style={style.inputContainer}>
								<Text style={style.inputHeader}>Enter store phone number:</Text>
								<TextInput style={style.input} onChangeText={(phonenumber) => setPhonenumber(phonenumber)} value={phonenumber} keyboardType="numeric" autoCorrect={false} autoCapitalize="none"/>
							</View>
						)}
						
						{setupType == "logo" && (
							<View style={style.cameraContainer}>
								<Text style={style.inputHeader}>Store Logo</Text>

								{logo.uri ? (
									<>
										<Image style={style.camera} source={{ uri: logo.uri }}/>

										<TouchableOpacity style={style.cameraAction} onPress={() => setLogo({ uri: '', name: '' })}>
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

						{errorMsg ? <Text style={style.errorMsg}>{errorMsg}</Text> : null }

						{loading && <ActivityIndicator size="large"/>}

						<TouchableOpacity style={style.submit} disabled={loading} onPress={() => setupType == "logo" ? setupYourLocation() : saveInfo()}>
							<Text style={style.submitHeader}>{setupType == "logo" ? "Done" : "Next"}</Text>
						</TouchableOpacity>
					</View>

					<View style={style.bottomNavs}>
						<View style={{ flexDirection: 'row' }}>
							<TouchableOpacity style={style.bottomNav} onPress={() => {
								AsyncStorage.clear()

								navigation.dispatch(
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
		</View>
	)
}

const style = StyleSheet.create({
	setup: { backgroundColor: 'white' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	boxHeader: { fontFamily: 'appFont', fontSize: 40, fontWeight: 'bold', paddingVertical: 30 },
	boxMiniheader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', marginBottom: 50 },

	inputsBox: { alignItems: 'center', width: '100%' },
	inputContainer: { marginBottom: 50, width: '80%' },
	inputHeader: { fontFamily: 'appFont', fontSize: 25 },
	input: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: 25, padding: 5, width: '100%' },

	locationHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
	locationActions: { flexDirection: 'row', justifyContent: 'space-around' },
	locationAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 10, width: 100 },
	locationActionHeader: { fontSize: 20, textAlign: 'center' },
	locationInfos: { alignItems: 'center' },

	cameraContainer: { alignItems: 'center', marginVertical: 50, width: '100%' },
	cameraHeader: { fontFamily: 'appFont', fontWeight: 'bold', paddingVertical: 5 },
	camera: { height: width * 0.8, width: width * 0.8 },
	cameraActions: { flexDirection: 'row' },
	cameraAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: 120 },
	cameraActionHeader: { fontSize: 20, textAlign: 'center' },

	errorMsg: { color: 'red', fontWeight: 'bold', marginVertical: 0, textAlign: 'center' },
	submit: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginBottom: 50, marginTop: 5, padding: 10, width: 100 },
	submitHeader: { fontSize: 25 },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', height: 40, justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', height: 30, marginVertical: 5, marginHorizontal: 20 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },
})
