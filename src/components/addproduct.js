import React, { useEffect, useState } from 'react'
import { AsyncStorage, Dimensions, ScrollView, View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { CommonActions } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import { addNewProduct } from '../apis/products'

import FontAwesome from 'react-native-vector-icons/FontAwesome'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { width } = Dimensions.get('window')

export default function addproduct(props) {
	const { menuid, refetch } = props.route.params

	const [permission, setPermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
	const [camType, setCamtype] = useState(Camera.Constants.Type.back);
	const [name, setName] = useState('')
	const [info, setInfo] = useState('')
	const [image, setImage] = useState({ uri: '', name: '' })
	const [options, setOptions] = useState([])
	const [price, setPrice] = useState('')
	const [errorMsg, setErrormsg] = useState('')

	const addTheNewProduct = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const locationid = await AsyncStorage.getItem("locationid")

		for (let k = 0; k < options.length; k++) {
			if (!options[k].text) {
				setErrormsg("One of the customer options has empty values")

				return
			}

			if (!options[k].option) {
				setErrormsg("One of the customer options has empty values")

				return
			}
		}

		if (name && image.uri && price) {
			options.forEach(function (option) {
				delete option['key']
			})

			const data = { ownerid, locationid, menuid, name, info, image, options, price }

			addNewProduct(data)
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
				setErrormsg("Please enter the product name")

				return
			}

			if (!image.uri) {
				setErrormsg("Please take a good photo")

				return
			}

			if (!price) {
				setErrormsg("Please enter the price of the product")

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

	useEffect(() => {
		(async() => openCamera())()
	}, [])

	if (permission === null) return <View/>

	return (
		<ScrollView showsVerticalScrollIndicator={false}>
			<View style={style.box}>
				<Text style={style.addHeader}>Enter product info</Text>

				<TextInput style={style.addInput} placeholder="Product name" placeholderTextColor="rgba(127, 127, 127, 0.5)" onChangeText={(name) => setName(name)}/>
				<TextInput style={style.infoInput} multiline={true} placeholder="Anything you want to say about this product (optional)" placeholderTextColor="rgba(127, 127, 127, 0.5)" onChangeText={(info) => setInfo(info)}/>

				<View style={style.cameraContainer}>
					<Text style={style.cameraHeader}>Product photo</Text>

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

				<TouchableOpacity style={style.addOption} onPress={() => {
					let new_key

					if (options.length > 0) {
						let last_option = options[options.length - 1]
						new_key = parseInt(last_option.key) + 1
					} else {
						new_key = 0
					}

					setOptions([...options, { key: new_key.toString(), text: '', option: '' }])
				}}>
					<Text style={style.addOptionHeader}>Add Customer Option</Text>
				</TouchableOpacity>

				<View style={style.options}>
					{options.map((option, index) => (
						<View key={option.key} style={style.option}>
							<TouchableOpacity style={style.optionRemove} onPress={() => {
								let newOptions = [...options]

								newOptions.splice(index, 1)

								setOptions(newOptions)
							}}>
								<FontAwesome name="close" size={20}/>
							</TouchableOpacity>
							<TextInput style={style.optionInput} placeholder="eg. Size" value={option.text} onChangeText={(text) => {
								let newOptions = [...options]

								newOptions[index].text = text

								setOptions(newOptions)
							}}/>
							<View style={style.types}>
								<Text style={style.typesHeader}>Type:</Text>
								<View style={style.optionTypes}>
									<TouchableOpacity style={option.option == 'percentage' ? style.optionTypeSelected : style.optionType} onPress={() => {
										let newOptions = [...options]

										newOptions[index].option = 'percentage'

										setOptions(newOptions)
									}}>
										<Text style={option.option == 'percentage' ? style.optionTypeHeaderSelected : style.optionTypeHeader}>Percentage</Text>
									</TouchableOpacity>
									<TouchableOpacity style={option.option == 'quantity' ? style.optionTypeSelected : style.optionType} onPress={() => {
										let newOptions = [...options]
										
										newOptions[index].option = 'quantity'

										setOptions(newOptions)
									}}>
										<Text style={option.option == 'quantity' ? style.optionTypeHeaderSelected : style.optionTypeHeader}>Quantity</Text>
									</TouchableOpacity>
									<TouchableOpacity style={option.option == 'size' ? style.optionTypeSelected : style.optionType} onPress={() => {
										let newOptions = [...options]
										
										newOptions[index].option = 'size'

										setOptions(newOptions)
									}}>
										<Text style={option.option == 'size' ? style.optionTypeHeaderSelected : style.optionTypeHeader}>Size</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					))}
				</View>

				<View style={style.priceBox}>
					<Text style={style.priceHeader}>Product price</Text>
					<TextInput style={style.priceInput} placeholder="4.99" onChangeText={(price) => setPrice(price)}/>
				</View>

				<Text style={style.errorMsg}>{errorMsg}</Text>

				<View style={style.addActions}>
					<TouchableOpacity style={style.addAction} onPress={() => addTheNewProduct()}>
						<Text>Done</Text>
					</TouchableOpacity>
				</View>
			</View>
		</ScrollView>
	)
}

const style = StyleSheet.create({
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', paddingVertical: 10, width: '100%' },
	addHeader: { fontWeight: 'bold', paddingVertical: 5 },
	addInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, fontSize: 13, marginBottom: 5, padding: 5, width: '80%' },
	infoInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, fontSize: 13, height: 100, marginBottom: 50, padding: 10, width: '80%' },
	cameraContainer: { alignItems: 'center', marginBottom: 50, width: '100%' },
	cameraHeader: { fontWeight: 'bold', paddingVertical: 5 },
	camera: { height: width * 0.8, width: width * 0.8 },
	cameraAction: { margin: 10 },
	addOption: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 2 },
	addOptionHeader: { fontSize: 13 },
	options: { marginBottom: 50 },
	option: { flexDirection: 'row', justifyContent: 'space-between' },
	optionRemove: { alignItems: 'center', borderRadius: 12.5, borderStyle: 'solid', borderWidth: 2, height: 25, marginRight: 5, marginVertical: 20, width: 25 },
	optionInput: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, height: 30, marginVertical: 19, padding: 3, width: 100 }, 
	types: { alignItems: 'center' },
	typesHeader: { fontSize: 10, fontWeight: 'bold', margin: 5 },
	optionTypes: { flexDirection: 'row' },
	optionType: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 2, padding: 5 },
	optionTypeSelected: { alignItems: 'center', backgroundColor: 'black', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 2, padding: 5 },
	optionTypeHeader: { fontSize: 10 },
	optionTypeHeaderSelected: { color: 'white', fontSize: 10 },
	priceBox: { flexDirection: 'row', marginBottom: 30 },
	priceHeader: { fontSize: 15, fontWeight: 'bold', padding: 5 },
	priceInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: '40%' },
	errorMsg: { color: 'red', fontWeight: 'bold', marginBottom: 50, textAlign: 'center' },
	addActions: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 50, width: '100%' },
	addAction: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 100 },
})
