import React, { useEffect, useState, useRef } from 'react'
import { ActivityIndicator, Dimensions, ScrollView, View, Text, TextInput, Image, Keyboard, TouchableOpacity, TouchableWithoutFeedback, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker';
import { logo_url } from '../../assets/info'
import { getProductInfo, addNewProduct, updateProduct } from '../apis/products'

import FontAwesome from 'react-native-vector-icons/FontAwesome'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)
const frameSize = width * 0.9

const steps = ['name', 'info', 'photo', 'options', 'others', 'sizes']

const fsize = p => {
	return width * p
}

export default function addproduct(props) {
	const params = props.route.params
	const { parentMenuid, productid, refetch } = params
	
	const [setupType, setSetuptype] = useState('name')
	const [cameraPermission, setCamerapermission] = useState(null);
	const [pickingPermission, setPickingpermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
	const [name, setName] = useState('')
	const [info, setInfo] = useState('')
	const [image, setImage] = useState({ uri: '', name: '' })
	const [options, setOptions] = useState([])
	const [others, setOthers] = useState([])
	const [sizes, setSizes] = useState([])
	const [price, setPrice] = useState('')
	const [loaded, setLoaded] = useState(productid ? false : true)

	const [errorMsg, setErrormsg] = useState('')

	const isMounted = useRef(null)

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
				setErrormsg("One of the size is not selected")

				return
			}

			if (!sizes[k].price) {
				setErrormsg("One of the size's price is not provided")

				return
			} else if (isNaN(sizes[k].price)) {
				setErrormsg("One of the size's price is invalid")

				return
			}

			if (!sizenames[sizes[k].name]) {
				sizenames[sizes[k].name] = true
			} else {
				setErrormsg("There are two or more similar sizes")

				return
			}
		}

		if (name && (sizes.length > 0 || (price && !isNaN(price)))) {
			options.forEach(function (option) {
				delete option['key']
			})

			others.forEach(function (other) {
				delete other['key']
			})

			sizes.forEach(function (size) {
				delete size['key']
			})

			const data = { locationid, menuid: parentMenuid, name, info, image, options, others, sizes, price: sizes.length > 0 ? "" : price, permission: cameraPermission || pickingPermission }

			addNewProduct(data)
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
				setErrormsg("Please enter the product name")

				return
			}

			if (sizes.length == 0 && !price) {
				setErrormsg("Please enter the price of the product")

				return
			} else if (isNaN(price)) {
				setErrormsg("The price you entered is invalid")

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
			} else if (isNaN(sizes[k].price)) {
				setErrormsg("One of the size's price is invalid")

				return
			}

			if (!sizenames[sizes[k].name]) {
				sizenames[sizes[k].name] = true
			} else {
				setErrormsg("There are two or more similar sizes")

				return
			}
		}

		if (name && (sizes.length > 0 || (price && !isNaN(price)))) {
			options.forEach(function (option) {
				delete option['key']
			})

			others.forEach(function (other) {
				delete other['key']
			})

			sizes.forEach(function (size) {
				delete size['key']
			})

			const data = { locationid, menuid: parentMenuid, productid, name, info, image, options, others, sizes, price: sizes.length > 0 ? "" : price, permission: cameraPermission || pickingPermission }

			updateProduct(data)
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
				setErrormsg("Please enter the product name")

				return
			}

			if (sizes.length == 0 && !price) {
				setErrormsg("Please enter the price of the product")

				return
			} else if (isNaN(price)) {
				setErrormsg("The price you entered is invalid")

				return
			}
		}
	}
	const saveInfo = () => {
		const index = steps.indexOf(setupType)
		const nextStep = index == 5 ? "done" : steps[index + 1]

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

	const getTheProductInfo = async() => {
		getProductInfo(productid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res && isMounted.current == true) {
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

		if (productid) {
			getTheProductInfo()
		}

		return () => isMounted.current = false
	}, [])

	if (cameraPermission === null || pickingPermission === null) return <View/>

	return (
		<View style={style.addproduct}>
			<View style={{ paddingBottom: offsetPadding }}>
				<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
					{loaded ? 
						<View style={style.box}>
							{setupType == "name" && (
								<View style={style.inputContainer}>
									<Text style={style.addHeader}>{productid ? "Update" : "Enter"} product name</Text>

									<TextInput style={style.addInput} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Product name" onChangeText={(name) => setName(name)} value={name} autoCorrect={false} autoCompleteType="off" autoCapitalize="none"/>
								</View>
							)}

							{setupType == "info" && (
								<View style={style.inputContainer}>
									<Text style={style.addHeader}>{productid ? "Update" : "Enter"} product info (optional)</Text>

									<TextInput style={style.infoInput} multiline={true} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Anything you want to say about this product (optional)" onChangeText={(info) => setInfo(info)} value={info} autoCorrect={false} autoCompleteType="off" autoCapitalize="none"/>
								</View>
							)}

							{setupType == "photo" && (
								<View style={style.cameraContainer}>
									<Text style={style.cameraHeader}>Product photo</Text>

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

							{setupType == "options" && (
								<>
									<ScrollView style={{ height: screenHeight - 250, width: '100%' }}>
										<View style={{ alignItems: 'center', width: '100%' }}>
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
												<Text style={style.addOptionHeader}>Add % or amount option</Text>
											</TouchableOpacity>

											<View style={style.options}>
												{options.map((option, index) => (
													<View key={option.key} style={style.option}>
														<TouchableOpacity style={style.optionRemove} onPress={() => {
															let newOptions = [...options]

															newOptions.splice(index, 1)

															setOptions(newOptions)
														}}>
															<FontAwesome name="close" size={40}/>
														</TouchableOpacity>
														<TextInput style={style.optionInput} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="eg. Sugar" value={option.text} onChangeText={(text) => {
															let newOptions = [...options]

															newOptions[index].text = text

															setOptions(newOptions)
														}} autoCorrect={false} autoCapitalize="none"/>
														<View style={style.optionTypesBox}>
															<Text style={style.optionTypesHeader}>Select type</Text>
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
										</View>
									</ScrollView>
								</>
							)}

							{setupType == "others" && (
								<>
									<ScrollView style={{ height: screenHeight - 250, width: '100%' }}>
										<View style={{ alignItems: 'center', width: '100%' }}>
											<TouchableOpacity style={style.addOption} onPress={() => {
												let new_key

												if (others.length > 0) {
													let last_other = others[others.length - 1]

													new_key = parseInt(last_other.key.split("-")[1]) + 1
												} else {
													new_key = 0
												}

												setOthers([...others, { key: "other-" + new_key.toString(), name: '', price: "0.00" }])
											}}>
												<Text style={style.addOptionHeader}>Add Specific Option</Text>
											</TouchableOpacity>

											<View style={style.options}>
												{others.map((other, index) => (
													<View key={other.key} style={style.other}>
														<TouchableOpacity style={style.otherRemove} onPress={() => {
															let newOthers = [...others]

															newOthers.splice(index, 1)

															setOthers(newOthers)
														}}>
															<FontAwesome name="close" size={40}/>
														</TouchableOpacity>
														<TextInput style={style.otherInput} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Tapioca" value={other.name.toString()} onChangeText={(name) => {
															let newOthers = [...others]

															newOthers[index].name = name.toString()

															setOthers(newOthers)
														}} autoCorrect={false} autoCapitalize="none"/>
														<TextInput style={style.otherPrice} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="eg. 0.50" value={other.price.toString()} onChangeText={(price) => {
															let newOthers = [...others]

															newOthers[index].price = price.toString()

															setOthers(newOthers)
														}} keyboardType="numeric" autoCorrect={false} autoCapitalize="none"/>
													</View>
												))}
											</View>
										</View>
									</ScrollView>
								</>
							)}

							{setupType == "sizes" && (
								sizes.length > 0 ?
									<ScrollView style={{ height: screenHeight - 250, width: '100%' }}>
										<View style={{ alignItems: 'center', width: '100%' }}>
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
															<FontAwesome name="close" size={40}/>
														</TouchableOpacity>
														<View style={style.sizeTypesBox}>
															<Text style={style.sizeTypesHeader}>Select size:</Text>
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
															<TextInput style={style.sizeInput} placeholderTextColor="rgba(0, 0, 0, 0.5)" placeholder="4.99" value={size.price.toString()} onChangeText={(price) => {
																let newSizes = [...sizes]
																let newPrice = price.toString()

																if (newPrice.includes(".") && newPrice.split(".")[1].length == 2) {
																	Keyboard.dismiss()
																}

																newSizes[index].price = price.toString()

																setSizes(newSizes)
															}} keyboardType="numeric" autoCorrect={false} autoCapitalize="none"/>
														</View>
													</View>
												))}
											</View>
										</View>
									</ScrollView>
									:
									<View style={{ alignItems: 'center', flexDirection: 'column', height: '50%', justifyContent: 'space-between', width: '100%' }}>
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

										<Text style={{ fontSize: fsize(0.06), fontWeight: 'bold' }}>or</Text>

										<View style={style.priceBox}>
											<Text style={style.priceHeader}>Enter product (one) price</Text>
											<TextInput style={style.priceInput} placeholderTextColor="rgba(0, 0, 0, 0.5)" placeholder="4.99" onChangeText={(price) => {
												let newPrice = price.toString()

												if (newPrice.includes(".") && newPrice.split(".")[1].length == 2) {
													Keyboard.dismiss()
												}

												setPrice(price.toString())
											}} value={price.toString()} keyboardType="numeric" autoCorrect={false} autoCapitalize="none"/>
										</View>
									</View>
							)}

							<Text style={style.errorMsg}>{errorMsg}</Text>

							<View style={{ flexDirection: 'row' }}>
								<View style={style.addActions}>
									<TouchableOpacity style={style.addAction} onPress={() => props.navigation.goBack()}>
										<Text style={style.addActionHeader}>Cancel</Text>
									</TouchableOpacity>
									<TouchableOpacity style={style.addAction} onPress={() => {
										if (!productid) {
											if (setupType == "sizes") {
												addTheNewProduct()
											} else {
												saveInfo()
											}
										} else {
											if (setupType == "sizes") {
												updateTheProduct()
											} else {
												saveInfo()
											}
										}
									}}>
										<Text style={style.addActionHeader}>{
											!productid ? 
												setupType == "sizes" ? "Done" : "Next" 
												: 
												setupType == "sizes" ? "Save" : "Next"
										}</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
						:
						<ActivityIndicator size="large" marginTop={screenHeight / 2}/>
					}
				</TouchableWithoutFeedback>
			</View>
		</View>
	)
}

const style = StyleSheet.create({
	addproduct: { height: '100%', width: '100%' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', paddingVertical: 10, width: '100%' },
	inputContainer: { alignItems: 'center', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '100%' },
	addHeader: { fontSize: fsize(0.06), fontWeight: 'bold', paddingVertical: 5 },
	addInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, fontSize: fsize(0.06), padding: 10, width: '90%' },
	infoInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, fontSize: fsize(0.06), height: 100, marginVertical: 5, padding: 10, textAlignVertical: 'top', width: '90%' },
	cameraContainer: { alignItems: 'center', width: '100%' },
	cameraHeader: { fontSize: fsize(0.05), fontWeight: 'bold', paddingVertical: 5 },
	camera: { height: frameSize, width: frameSize },
	cameraActions: { flexDirection: 'row' },
	cameraAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginBottom: 50, margin: 5, padding: 5, width: fsize(0.3) },
	cameraActionHeader: { fontSize: fsize(0.04), textAlign: 'center' },

	addOption: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 10 },
	addOptionHeader: { fontSize: fsize(0.06) },
	options: { marginBottom: 30 },

	option: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 40 },
	optionRemove: { alignItems: 'center', borderRadius: 27.5, borderStyle: 'solid', borderWidth: 2, height: 45, marginTop: 30, width: 45 },
	optionInput: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: fsize(0.05), height: 50, marginTop: 30, padding: 3, width: '50%' }, 
	optionTypesBox: { alignItems: 'center' },
	optionTypesHeader: { fontSize: fsize(0.05), fontWeight: 'bold', margin: 5 },
	optionTypes: {  },
	optionType: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 5 },
	optionTypeSelected: { alignItems: 'center', backgroundColor: 'black', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 5 },
	optionTypeHeader: { fontSize: fsize(0.04) },
	optionTypeHeaderSelected: { color: 'white', fontSize: fsize(0.04) },

	other: { flexDirection: 'row', justifyContent: 'space-between' },
	otherRemove: { alignItems: 'center', borderRadius: 27.5, borderStyle: 'solid', borderWidth: 2, height: 45, marginTop: 30, width: 45 },
	otherInput: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: fsize(0.05), height: 50, marginTop: 30, padding: 3, width: '50%' }, 
	otherPrice: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: fsize(0.05), height: 50, marginTop: 30, padding: 3, width: 80 }, 

	size: { alignItems: 'center', marginVertical: 20 },
	sizeRemove: { alignItems: 'center', borderRadius: 27.5, borderStyle: 'solid', borderWidth: 2, height: 45, marginTop: 30, width: 45 },
	sizeTypesBox: { alignItems: 'center' },
	sizeTypesHeader: { fontSize: fsize(0.05), fontWeight: 'bold', margin: 5 },
	sizeTypes: { flexDirection: 'row' },
	sizeType: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 10 },
	sizeTypeSelected: { alignItems: 'center', backgroundColor: 'black', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 10 },
	sizeTypeHeader: { fontSize: fsize(0.04) },
	sizeTypeHeaderSelected: { color: 'white', fontSize: fsize(0.04) },
	sizeInput: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: fsize(0.09), height: 50, padding: 3, textAlign: 'center', width: 150 }, 
	
	priceBox: { alignItems: 'center', marginBottom: 30 },
	priceHeader: { fontSize: fsize(0.06), fontWeight: 'bold', padding: 5 },
	priceInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: fsize(0.09), padding: 5, textAlign: 'center', width: 150 },
	errorMsg: { color: 'red', fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
	addActions: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	addAction: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: fsize(0.06), padding: 5, width: 100 },
	addActionHeader: { fontSize: fsize(0.05) },
})
