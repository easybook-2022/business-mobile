import React, { useEffect, useState } from 'react'
import { AsyncStorage, Dimensions, ScrollView, View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { CommonActions } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import { logo_url } from '../../assets/info'
import { getProductInfo, addNewProduct, updateProduct } from '../apis/products'

import FontAwesome from 'react-native-vector-icons/FontAwesome'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { width } = Dimensions.get('window')

export default function addproduct(props) {
	const params = props.route.params
	const { menuid, refetch } = params
	const productid = params.id ? params.id : ""

	const [permission, setPermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
	const [camType, setCamtype] = useState(Camera.Constants.Type.back);
	const [name, setName] = useState('')
	const [info, setInfo] = useState('')
	const [image, setImage] = useState({ uri: '', name: '' })
	const [options, setOptions] = useState([])
	const [others, setOthers] = useState([])
	const [sizes, setSizes] = useState([])
	const [price, setPrice] = useState('')
	const [errorMsg, setErrormsg] = useState('')
	
	const addTheNewProduct = async() => {
		const locationid = await AsyncStorage.getItem("locationid")
		const sizenames = { "small": false, "medium": false, "large": false, "extra large": false }

		setErrormsg("")

		for (let k = 0; k < options.length; k++) {
			if (!options[k].text) {
				setErrormsg("One of the options has empty values")

				return
			}

			if (!options[k].option) {
				setErrormsg("One of the options has empty values")

				return
			}
		}

		for (let k = 0; k < others.length; k++) {
			if (!others[k].name) {
				setErrormsg("One of the options has empty values")

				return
			}

			if (!others[k].input) {
				setErrormsg("One of the options has empty values")

				return
			}

			if (!others[k].price) {
				setErrormsg("One of the options has empty prices")

				return
			}
		}

		for (let k = 0; k < sizes.length; k++) {
			if (!sizes[k].name) {
				setErrormsg("One of the size is not named")

				return
			}

			if (!sizes[k].price) {
				setErrormsg("One of the size's price is not provided")

				return
			}

			if (!sizenames[sizes[k].name]) {
				sizenames[sizes[k].name] = true
			} else {
				setErrormsg("There are two or more similar sizes")

				return
			}
		}

		if (name && image.uri && (sizes.length > 0 || price)) {
			options.forEach(function (option) {
				delete option['key']
			})

			others.forEach(function (other) {
				delete other['key']
			})

			sizes.forEach(function (size) {
				delete size['key']
			})

			const data = { locationid, menuid, name, info, image, options, others, sizes, price: sizes.length > 0 ? "" : price }

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

			if (sizes.length == 0 && !price) {
				setErrormsg("Please enter the price of the product")

				return
			}
		}
	}
	const updateTheProduct = async() => {
		const locationid = await AsyncStorage.getItem("locationid")
		const sizenames = { "small": false, "medium": false, "large": false, "extra large": false }

		setErrormsg("")

		for (let k = 0; k < options.length; k++) {
			if (!options[k].text) {
				setErrormsg("One of the options has empty values")

				return
			}

			if (!options[k].option) {
				setErrormsg("One of the options has empty values")

				return
			}
		}

		for (let k = 0; k < others.length; k++) {
			if (!others[k].name) {
				setErrormsg("One of the options has empty values")

				return
			}

			if (!others[k].input) {
				setErrormsg("One of the options has empty values")

				return
			}

			if (!others[k].price) {
				setErrormsg("One of the options has empty prices")

				return
			}
		}

		for (let k = 0; k < sizes.length; k++) {
			if (!sizes[k].name) {
				setErrormsg("One of the size is not named")

				return
			}

			if (!sizes[k].price) {
				setErrormsg("One of the size's price is not provided")

				return
			}

			if (!sizenames[sizes[k].name]) {
				sizenames[sizes[k].name] = true
			} else {
				setErrormsg("There are two or more similar sizes")

				return
			}
		}

		if (name && image.uri && (sizes.length > 0 || price)) {
			options.forEach(function (option) {
				delete option['key']
			})

			others.forEach(function (other) {
				delete other['key']
			})

			sizes.forEach(function (size) {
				delete size['key']
			})

			const data = { locationid, menuid, productid, name, info, image, options, others, sizes, price: sizes.length > 0 ? "" : price }

			updateProduct(data)
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

			if (sizes.length == 0 && !price) {
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

	const getTheProductInfo = async() => {
		getProductInfo(productid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { image, info, name, options, others, sizes, price } = res.productInfo
					const newOptions = [], newOthers = [], newSizes = []

					setName(name)
					setInfo(info)
					setImage({ uri: logo_url + image, name: image })
					setPrice(price)

					options.forEach(function (option, index) {
						newOptions.push({
							key: "option-" + index.toString(),
							text: option.header,
							option: option.type
						})
					})

					others.forEach(function (other, index) {
						newOthers.push({
							key: "other-" + index.toString(),
							name: other.name,
							input: other.input,
							price: other.price
						})
					})

					sizes.forEach(function (size, index) {
						newSizes.push({
							key: "size-" + index.toString(),
							name: size.name,
							price: size.price
						})
					})

					setOptions(newOptions)
					setOthers(newOthers)
					setSizes(newSizes)
				}
			})
	}

	useEffect(() => {
		(async() => openCamera())()

		if (productid) {
			getTheProductInfo()
		}
	}, [])

	if (permission === null) return <View/>

	return (
		<ScrollView showsVerticalScrollIndicator={false}>
			<View style={style.box}>
				<Text style={style.addHeader}>Enter product info</Text>

				<TextInput style={style.addInput} placeholder="Product name" placeholderTextColor="rgba(127, 127, 127, 0.5)" onChangeText={(name) => setName(name)} value={name} autoCorrect={false}/>
				<TextInput style={style.infoInput} multiline={true} placeholder="Anything you want to say about this product (optional)" placeholderTextColor="rgba(127, 127, 127, 0.5)" onChangeText={(info) => setInfo(info)} value={info} autoCorrect={false}/>

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

						new_key = parseInt(last_option.key.split("-")[1]) + 1
					} else {
						new_key = 0
					}

					setOptions([...options, { key: "option-" + new_key.toString(), text: '', option: '' }])
				}}>
					<Text style={style.addOptionHeader}>Add percentage/amount option</Text>
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
							<TextInput style={style.optionInput} placeholder="eg. Sugar" value={option.text} onChangeText={(text) => {
								let newOptions = [...options]

								newOptions[index].text = text

								setOptions(newOptions)
							}} autoCorrect={false}/>
							<View style={style.optionTypesBox}>
								<Text style={style.optionTypesHeader}>Type:</Text>
								<View style={style.optionTypes}>
									<TouchableOpacity style={option.option == 'percentage' ? style.optionTypeSelected : style.optionType} onPress={() => {
										let newOptions = [...options]

										newOptions[index].option = 'percentage'

										setOptions(newOptions)
									}}>
										<Text style={option.option == 'percentage' ? style.optionTypeHeaderSelected : style.optionTypeHeader}>Percentage</Text>
									</TouchableOpacity>
									<TouchableOpacity style={option.option == 'amount' ? style.optionTypeSelected : style.optionType} onPress={() => {
										let newOptions = [...options]
										
										newOptions[index].option = 'amount'

										setOptions(newOptions)
									}}>
										<Text style={option.option == 'amount' ? style.optionTypeHeaderSelected : style.optionTypeHeader}>Amount</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					))}
				</View>

				<TouchableOpacity style={style.addOption} onPress={() => {
					let new_key

					if (others.length > 0) {
						let last_other = others[others.length - 1]

						new_key = parseInt(last_other.key.split("-")[1]) + 1
					} else {
						new_key = 0
					}

					setOthers([...others, { key: "other-" + new_key.toString(), name: '', input: '' }])
				}}>
					<Text style={style.addOptionHeader}>Add Other Option</Text>
				</TouchableOpacity>

				<View style={style.options}>
					{others.map((other, index) => (
						<View key={other.key} style={style.other}>
							<TouchableOpacity style={style.otherRemove} onPress={() => {
								let newOthers = [...others]

								newOthers.splice(index, 1)

								setOthers(newOthers)
							}}>
								<FontAwesome name="close" size={20}/>
							</TouchableOpacity>
							<TextInput style={style.otherName} placeholder="eg. Topping" value={other.name} onChangeText={(name) => {
								let newOthers = [...others]

								newOthers[index].name = name.toString()

								setOthers(newOthers)
							}} autoCorrect={false}/>
							<TextInput style={style.otherInput} placeholder="eg. Tapioca" value={other.input} onChangeText={(input) => {
								let newOthers = [...others]

								newOthers[index].input = input.toString()

								setOthers(newOthers)
							}} autoCorrect={false}/>
							<TextInput style={style.otherPrice} placeholder="eg. 0.50" value={other.price} onChangeText={(price) => {
								let newOthers = [...others]

								newOthers[index].price = price.toString()

								setOthers(newOthers)
							}} autoCorrect={false}/>
						</View>
					))}
				</View>

				<TouchableOpacity style={style.addOption} onPress={() => {
					let new_key

					if (sizes.length > 0) {
						let last_size = sizes[sizes.length - 1]

						new_key = parseInt(last_size.key.split("-")[1]) + 1
					} else {
						new_key = 0
					}

					setSizes([...sizes, { key: "size-" + new_key.toString(), name: '', price: "0.00" }])
				}}>
					<Text style={style.addOptionHeader}>Add Size</Text>
				</TouchableOpacity>

				<View style={style.options}>
					{sizes.map((size, index) => (
						<View key={size.key} style={style.size}>
							<TouchableOpacity style={style.sizeRemove} onPress={() => {
								let newSizes = [...sizes]

								newSizes.splice(index, 1)

								setSizes(newSizes)
							}}>
								<FontAwesome name="close" size={20}/>
							</TouchableOpacity>
							<TextInput style={style.sizeInput} placeholder="eg. 4.99" value={size.price} onChangeText={(price) => {
								let newSizes = [...sizes]

								newSizes[index].price = price.toString()

								setSizes(newSizes)
							}} autoCorrect={false}/>
							<View style={style.sizeTypesBox}>
								<Text style={style.sizeTypesHeader}>Size:</Text>
								<View style={style.sizeTypes}>
									{["Small", "Medium", "Large", "Extra large"].map((sizeopt, sizeindex) => (
										<TouchableOpacity key={sizeindex.toString()} style={size.name == sizeopt.toLowerCase() ? style.sizeTypeSelected : style.sizeType} onPress={() => {
											let newSizes = [...sizes]

											newSizes[index].name = sizeopt.toLowerCase()

											setSizes(newSizes)
										}}>
											<Text style={size.name == sizeopt.toLowerCase() ? style.sizeTypeHeaderSelected : style.sizeTypeHeader}>{sizeopt}</Text>
										</TouchableOpacity>
									))}
								</View>
							</View>
						</View>
					))}
				</View>

				{sizes.length == 0 && (
					<View style={style.priceBox}>
						<Text style={style.priceHeader}>Product price</Text>
						<TextInput style={style.priceInput} placeholder="4.99" onChangeText={(price) => setPrice(price.toString())} value={price.toString()} autoCorrect={false}/>
					</View>
				)}

				<Text style={style.errorMsg}>{errorMsg}</Text>

				<View style={style.addActions}>
					<TouchableOpacity style={style.addAction} onPress={() => {
						if (!productid) {
							addTheNewProduct()
						} else {
							updateTheProduct()
						}
					}}>
						<Text>{!productid ? "Done" : "Save"}</Text>
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
	options: { marginBottom: 30 },

	option: { flexDirection: 'row', justifyContent: 'space-between' },
	optionRemove: { alignItems: 'center', borderRadius: 12.5, borderStyle: 'solid', borderWidth: 2, height: 25, marginRight: 5, marginVertical: 20, width: 25 },
	optionInput: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, height: 30, marginVertical: 19, padding: 3, width: 100 }, 
	optionTypesBox: { alignItems: 'center' },
	optionTypesHeader: { fontSize: 10, fontWeight: 'bold', margin: 5 },
	optionTypes: { flexDirection: 'row' },
	optionType: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 2, padding: 5 },
	optionTypeSelected: { alignItems: 'center', backgroundColor: 'black', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 2, padding: 5 },
	optionTypeHeader: { fontSize: 10 },
	optionTypeHeaderSelected: { color: 'white', fontSize: 10 },

	other: { flexDirection: 'row', justifyContent: 'space-between' },
	otherRemove: { alignItems: 'center', borderRadius: 12.5, borderStyle: 'solid', borderWidth: 2, height: 25, marginRight: 5, marginVertical: 20, width: 25 },
	otherName: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, height: 30, marginVertical: 19, padding: 3, width: 100 }, 
	otherInput: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, height: 30, marginVertical: 19, marginLeft: 10, padding: 3, width: 100 }, 
	otherPrice: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, height: 30, marginVertical: 19, marginLeft: 10, padding: 3, width: 100 }, 

	size: { flexDirection: 'row', justifyContent: 'space-between' },
	sizeRemove: { alignItems: 'center', borderRadius: 12.5, borderStyle: 'solid', borderWidth: 2, height: 25, marginRight: 5, marginVertical: 20, width: 25 },
	sizeInput: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, height: 30, marginVertical: 19, padding: 3, width: 100 }, 
	sizeTypesBox: { alignItems: 'center' },
	sizeTypesHeader: { fontSize: 10, fontWeight: 'bold', margin: 5 },
	sizeTypes: { flexDirection: 'row' },
	sizeType: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 2, padding: 5 },
	sizeTypeSelected: { alignItems: 'center', backgroundColor: 'black', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 2, padding: 5 },
	sizeTypeHeader: { fontSize: 10 },
	sizeTypeHeaderSelected: { color: 'white', fontSize: 10 },
	
	priceBox: { flexDirection: 'row', marginBottom: 30 },
	priceHeader: { fontSize: 15, fontWeight: 'bold', padding: 5 },
	priceInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: '40%' },
	errorMsg: { color: 'red', fontWeight: 'bold', marginBottom: 50, textAlign: 'center' },
	addActions: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 50, width: '100%' },
	addAction: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 100 },
})
