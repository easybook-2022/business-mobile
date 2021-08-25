import React, { useState, useEffect } from 'react';
import { AsyncStorage, ActivityIndicator, Dimensions, ScrollView, View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { NetworkInfo } from 'react-native-network-info';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import * as Location from 'expo-location';
import { CommonActions } from '@react-navigation/native';
import { setupLocation } from '../apis/locations'
import { userInfo } from '../../assets/info'

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function setup({ navigation }) {
	const [permission, setPermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
	const [camType, setCamtype] = useState(Camera.Constants.Type.back);
	const [storeName, setStorename] = useState(userInfo.storeName)
	const [phonenumber, setPhonenumber] = useState(userInfo.phonenumber)
	const [addressOne, setAddressone] = useState(userInfo.addressOne)
	const [addressTwo, setAddresstwo] = useState(userInfo.addressTwo)
	const [city, setCity] = useState(userInfo.city)
	const [province, setProvice] = useState(userInfo.province)
	const [postalcode, setPostalcode] = useState(userInfo.postalcode)
	const [logo, setLogo] = useState({ uri: '', name: '' })
	const [loading, setLoading] = useState(false)
	const [errorMsg, setErrormsg] = useState('')

	const setupYourLocation = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const ipAddress = await NetworkInfo.getIPAddress()

		if (storeName && phonenumber, addressOne && city && province && postalcode && logo.name) {
			const [{ latitude, longitude }] = await Location.geocodeAsync(`${addressOne} ${addressTwo}, ${city} ${province}, ${postalcode}`)
			const time = (Date.now() / 1000).toString().split(".")[0]
			const data = {
				storeName, phonenumber, addressOne, addressTwo, city, province, postalcode, logo,
				longitude, latitude, ownerid, time, ipAddress
			}

			setLoading(true)

			setupLocation(data)
				.then((res) => {
					if (res.status == 200) {
						if (!res.data.errormsg) {
							return res.data
						} else {
							setErrormsg(res.data.errormsg)
							setLoading(false)
						}
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

			if (!logo.name) {
				setErrormsg("Please take a good photo of your store")

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
				setLogo({
					uri: `${FileSystem.documentDirectory}/${char}.jpg`,
					name: `${char}.jpg`
				})
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

	useEffect(() => {
		(async() => openCamera())()
	}, [])

	if (permission === null) return <View/>
		
	return (
		<View style={style.setup}>
			<View style={{ paddingVertical: offsetPadding }}>
				<ScrollView style={{ backgroundColor: '#EAEAEA', height: screenHeight - 40, width: '100%' }}>
					<View style={[style.box, { opacity: loading ? 0.6 : 1 }]}>
						<Text style={style.boxHeader}>Setup</Text>
						<Text style={style.boxMiniheader}>Enter your location information</Text>

						<View style={style.inputsBox}>
							<View style={style.inputContainer}>
								<Text style={style.inputHeader}>Store Name:</Text>
								<TextInput style={style.input} onChangeText={(storeName) => setStorename(storeName)} value={storeName} autoCorrect={false}/>
							</View>
							<View style={style.inputContainer}>
								<Text style={style.inputHeader}>Store Phone number:</Text>
								<TextInput style={style.input} onChangeText={(phonenumber) => setPhonenumber(phonenumber)} value={phonenumber} keyboardType="numeric" autoCorrect={false}/>
							</View>
							<View style={style.inputContainer}>
								<Text style={style.inputHeader}>Address #1:</Text>
								<TextInput style={style.input} onChangeText={(addressOne) => setPhonenumber(addressOne)} value={addressOne} keyboardType="numeric" autoCorrect={false}/>
							</View>
							<View style={style.inputContainer}>
								<Text style={style.inputHeader}>Address #2:</Text>
								<TextInput style={style.input} onChangeText={(addressTwo) => setPhonenumber(addressTwo)} value={addressTwo} keyboardType="numeric" autoCorrect={false}/>
							</View>
							<View style={style.inputContainer}>
								<Text style={style.inputHeader}>City:</Text>
								<TextInput style={style.input} onChangeText={(city) => setPhonenumber(city)} value={city} keyboardType="numeric" autoCorrect={false}/>
							</View>
							<View style={style.inputContainer}>
								<Text style={style.inputHeader}>Province:</Text>
								<TextInput style={style.input} onChangeText={(province) => setPhonenumber(province)} value={province} keyboardType="numeric" autoCorrect={false}/>
							</View>
							<View style={style.inputContainer}>
								<Text style={style.inputHeader}>Postal Code:</Text>
								<TextInput style={style.input} onChangeText={(postalcode) => setPhonenumber(postalcode)} value={postalcode} keyboardType="numeric" autoCorrect={false}/>
							</View>

							<View style={style.cameraContainer}>
								<Text style={style.inputHeader}>Store Logo</Text>

								{logo.uri ? (
									<>
										<Image style={style.camera} source={{ uri: logo.uri }}/>

										<TouchableOpacity style={style.cameraAction} onPress={() => setLogo({ uri: '', name: '' })}>
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
						</View>

						{errorMsg ? <Text style={style.errorMsg}>{errorMsg}</Text> : null }

						{loading && <ActivityIndicator size="large"/>}

						<TouchableOpacity style={style.setupButton} disabled={loading} onPress={() => setupYourLocation()}>
							<Text>Done</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>

				<View style={style.bottomNavs}>
					<View style={{ flexDirection: 'row' }}>
						<TouchableOpacity style={style.bottomNav} onPress={() => navigation.navigate("settings")}>
							<AntDesign name="setting" size={30}/>
						</TouchableOpacity>
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
	)
}

const style = StyleSheet.create({
	setup: { backgroundColor: 'white' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	boxHeader: { fontFamily: 'appFont', fontSize: 50, fontWeight: 'bold', paddingVertical: 30 },
	boxMiniheader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold' },

	inputsBox: { paddingHorizontal: 20, width: '80%' },
	inputContainer: { marginVertical: 30 },
	inputHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold' },
	input: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: 20, padding: 5 },
	cameraContainer: { alignItems: 'center', marginBottom: 50, width: '100%' },
	cameraHeader: { fontFamily: 'appFont', fontWeight: 'bold', paddingVertical: 5 },
	camera: { height: width * 0.8, width: width * 0.8 },
	cameraAction: { margin: 10 },
	errorMsg: { color: 'red', fontWeight: 'bold', marginVertical: 0, textAlign: 'center' },
	setupButton: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 10, padding: 10 },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', height: 40, justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', height: 30, marginVertical: 5, marginHorizontal: 20 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },
})
