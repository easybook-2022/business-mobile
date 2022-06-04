import React, { useEffect, useState } from 'react'
import { 
  SafeAreaView, Platform, ActivityIndicator, Dimensions, ScrollView, Modal, View, Text, 
  TextInput, Image, Keyboard, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, PermissionsAndroid
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker';
import { getId } from 'geottuse-tools';
import { logo_url } from '../../assets/info'
import { getProductInfo, addNewProduct, updateProduct } from '../apis/products'

import FontAwesome from 'react-native-vector-icons/FontAwesome'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import Ionicons from 'react-native-vector-icons/Ionicons'

// widgets
import Loadingprogress from '../widgets/loadingprogress';

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}
const steps = ['name', 'photo', 'options', 'others', 'sizes']

export default function Addproduct(props) {
	const params = props.route.params
	const { parentMenuid, productid, refetch } = params
	
	const [setupType, setSetuptype] = useState('name')
	const [cameraPermission, setCamerapermission] = useState(null);
	const [pickingPermission, setPickingpermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
  const [camType, setCamtype] = useState('back')
  const [choosing, setChoosing] = useState(false)
	const [name, setName] = useState('')
	const [image, setImage] = useState({ uri: '', name: '', size: { height: 0, width: 0 }, loading: false })
	const [options, setOptions] = useState([])
	const [others, setOthers] = useState([])
	const [sizes, setSizes] = useState([])
	const [price, setPrice] = useState('')
	const [loaded, setLoaded] = useState(productid ? false : true)
	const [loading, setLoading] = useState(false)

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

			const data = { locationid, menuid: parentMenuid ? parentMenuid : "", name, image, options, others, sizes, price: sizes.length > 0 ? "" : price }

			setLoading(true)

			addNewProduct(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
            setLoading(false)

						refetch()
						props.navigation.goBack()
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						const { errormsg, status } = err.response.data

						setErrormsg(errormsg)
					}

          setLoading(false)
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

			const data = { locationid, menuid: parentMenuid ? parentMenuid : "", productid, name, image, options, others, sizes, price: sizes.length > 0 ? "" : price }

			setLoading(true)

			updateProduct(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
            setLoading(false)

						refetch()
						props.navigation.goBack()
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						const { errormsg, status } = err.response.data

						setErrormsg(errormsg)
					}

          setLoading(false)
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
		let msg = ""

		setLoading(true)

		switch (index) {
			case 0:
				if (!name) {
					msg = "Please provide a name for the product"
				}

				break
			default:

		}

		if (msg == "") {
			const nextStep = index == 4 ? "done" : steps[index + 1]

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
    setImage({ ...image, loading: true })

		let char = getId()

		if (camComp) {
			let options = { quality: 0, skipProcessing: true };
			let photo = await camComp.takePictureAsync(options)
			let photo_option = [{ resize: { width: width, height: width }}]
			let photo_save_option = { format: ImageManipulator.SaveFormat.JPEG, base64: true }

      if (camType == "front") {
        photo_option.push({ flip: ImageManipulator.FlipType.Horizontal })
      }

			photo = await ImageManipulator.manipulateAsync(
				photo.localUri || photo.uri,
				photo_option,
				photo_save_option
			)

			FileSystem.moveAsync({
				from: photo.uri,
				to: `${FileSystem.documentDirectory}/${char}.jpg`
			})
			.then(() => {
				setImage({ 
          ...image, 
          uri: `${FileSystem.documentDirectory}/${char}.jpg`, name: `${char}.jpg`, loading: false, 
          size: { width, height: width }
        })
				setErrormsg('')
			})
		}
	}
	const choosePhoto = async() => {
    setChoosing(true)

		let char = getId(), captured, self = this
		let photo = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 0
    });

		if (!photo.cancelled) {
			FileSystem.moveAsync({
				from: photo.uri,
				to: `${FileSystem.documentDirectory}/${char}.jpg`
			})
			.then(() => {
				setImage({ 
          ...image, uri: `${FileSystem.documentDirectory}/${char}.jpg`, name: `${char}.jpg`, loading: false, 
          size: { width, height: width }
        })
				setErrormsg('')
			})
		}

    setChoosing(false)
	}
	const allowCamera = async() => {
		if (Platform.OS === "ios") {
      const { status } = await Camera.getCameraPermissionsAsync()

      if (status == 'granted') {
        setCamerapermission(status === 'granted')
      } else {
        const { status } = await Camera.requestCameraPermissionsAsync()

        setCamerapermission(status === 'granted')
      }
    } else {
      const status = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA)

      if (!status) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "EasyGO Business allows you to take a photo for product",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setCamerapermission(true)
        }
      } else {
        setCamerapermission(true)
      }
    }
	}
	const allowChoosing = async() => {
		if (Platform.OS === "ios") {
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync()
          
      if (status == 'granted') {
        setPickingpermission(status === 'granted')
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        setPickingpermission(status === 'granted')
      }
    } else {
      setPickingpermission(true)
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
					const { productImage, name, options, others, sizes, price } = res.productInfo
					const newOptions = [], newOthers = [], newSizes = []

					setName(name)
					setImage({ ...image, uri: productImage.name ? logo_url + productImage.name : "" })
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
				  const { errormsg, status } = err.response.data
				}
			})
	}

	useEffect(() => {
		if (productid) getTheProductInfo()
	}, [])

	return (
		<SafeAreaView style={[styles.addproduct, { opacity: loading ? 0.5 : 1 }]}>
			<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
				{loaded ? 
					<View style={styles.box}>
						{setupType == "name" && (
							<View style={styles.inputContainer}>
								<Text style={styles.addHeader}>What is this product call</Text>

								<TextInput 
									style={styles.addInput} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="example: Iced coffee" 
									onChangeText={(name) => setName(name)} value={name} autoCorrect={false} autoCompleteType="off" 
									autoCapitalize="none"
								/>
							</View>
						)}

						{setupType == "photo" && (
							<View style={styles.cameraContainer}>
								<Text style={styles.cameraHeader}>Provide a photo for {name} (Optional)</Text>

								{image.uri ? (
									<>
										<Image style={styles.camera} source={{ uri: image.uri }}/>

										<TouchableOpacity style={styles.cameraAction} onPress={() => setImage({ ...image, uri: '', name: '' })}>
											<Text style={styles.cameraActionHeader}>Cancel</Text>
										</TouchableOpacity>
									</>
								) : (
									<>
  									{!choosing && (
                      <>
                        <Camera 
                          style={styles.camera} 
                          type={camType} 
                          ref={r => {setCamcomp(r)}}
                          ratio="1:1"
                        />

                        <View style={{ alignItems: 'center', marginVertical: 10 }}>
                          <Ionicons name="camera-reverse-outline" size={wsize(7)} onPress={() => setCamtype(camType == 'back' ? 'front' : 'back')}/>
                        </View>
                      </>
                    )}

										<View style={styles.cameraActions}>
											<TouchableOpacity style={[styles.cameraAction, { opacity: image.loading ? 0.5 : 1 }]} disabled={image.loading} onPress={snapPhoto.bind(this)}>
												<Text style={styles.cameraActionHeader}>Take{'\n'}this photo</Text>
											</TouchableOpacity>
											<TouchableOpacity style={[styles.cameraAction, { opacity: image.loading ? 0.5 : 1 }]} disabled={image.loading} onPress={() => {
                        allowChoosing()
                        choosePhoto()
                      }}>
												<Text style={styles.cameraActionHeader}>Choose{'\n'}from phone</Text>
											</TouchableOpacity>
										</View>
									</>
								)}	
							</View>
						)}

						{setupType == "options" && (
							<>
								<ScrollView style={{ height: '50%', width: '100%' }}>
									<View style={{ alignItems: 'center', width: '100%' }}>
										<TouchableOpacity style={styles.addOption} onPress={() => {
											let new_key

											if (options.length > 0) {
												let last_option = options[options.length - 1]

												new_key = parseInt(last_option.key.split("-")[1]) + 1
											} else {
												new_key = 0
											}

											setOptions([...options, { key: "option-" + new_key.toString(), text: '', option: '' }])
										}}>
											<Text style={styles.addOptionHeader}>Add % or amount option</Text>
										</TouchableOpacity>

										<View style={styles.options}>
											{options.map((option, index) => (
												<View key={option.key} style={styles.option}>
													<TouchableOpacity style={styles.optionRemove} onPress={() => {
														let newOptions = [...options]

														newOptions.splice(index, 1)

														setOptions(newOptions)
													}}>
														<FontAwesome name="close" size={40}/>
													</TouchableOpacity>
													<TextInput style={styles.optionInput} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="eg. Sugar" value={option.text} onChangeText={(text) => {
														let newOptions = [...options]

														newOptions[index].text = text

														setOptions(newOptions)
													}} autoCorrect={false} autoCapitalize="none"/>
													<View style={styles.optionTypesBox}>
														<Text style={styles.optionTypesHeader}>Select type</Text>
														<View style={styles.optionTypes}>
															<TouchableOpacity style={option.option == 'percentage' ? styles.optionTypeSelected : styles.optionType} onPress={() => {
																let newOptions = [...options]

																newOptions[index].option = 'percentage'

																setOptions(newOptions)
															}}>
																<Text>%</Text>
															</TouchableOpacity>
															<TouchableOpacity style={option.option == 'amount' ? styles.optionTypeSelected : styles.optionType} onPress={() => {
																let newOptions = [...options]
																
																newOptions[index].option = 'amount'

																setOptions(newOptions)
															}}>
																<Text>#</Text>
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
								<ScrollView style={{ height: '50%', width: '100%' }}>
									<View style={{ alignItems: 'center', width: '100%' }}>
										<TouchableOpacity style={styles.addOption} onPress={() => {
											let new_key

											if (others.length > 0) {
												let last_other = others[others.length - 1]

												new_key = parseInt(last_other.key.split("-")[1]) + 1
											} else {
												new_key = 0
											}

											setOthers([...others, { key: "other-" + new_key.toString(), name: '', price: "0.00" }])
										}}>
											<Text style={styles.addOptionHeader}>Add Specific Option</Text>
										</TouchableOpacity>

										<View style={styles.options}>
											{others.map((other, index) => (
												<View key={other.key} style={styles.other}>
													<TouchableOpacity style={styles.otherRemove} onPress={() => {
														let newOthers = [...others]

														newOthers.splice(index, 1)

														setOthers(newOthers)
													}}>
														<FontAwesome name="close" size={40}/>
													</TouchableOpacity>
													<TextInput style={styles.otherInput} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Tapioca" value={other.name.toString()} onChangeText={(name) => {
														let newOthers = [...others]

														newOthers[index].name = name.toString()

														setOthers(newOthers)
													}} autoCorrect={false} autoCapitalize="none"/>
													<TextInput style={styles.otherPrice} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="eg. 0.50" value={other.price.toString()} onChangeText={(price) => {
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
								<ScrollView style={{ height: '50%', width: '100%' }}>
									<View style={{ alignItems: 'center', width: '100%' }}>
										<TouchableOpacity style={styles.addOption} onPress={() => {
											let new_key

											if (sizes.length > 0) {
												let last_size = sizes[sizes.length - 1]

												new_key = parseInt(last_size.key.split("-")[1]) + 1
											} else {
												new_key = 0
											}

											setSizes([...sizes, { key: "size-" + new_key.toString(), name: '', price: "0.00" }])
										}}>
											<Text style={styles.addOptionHeader}>Add Size</Text>
										</TouchableOpacity>

										<View style={styles.options}>
											{sizes.map((size, index) => (
												<View key={size.key} style={styles.size}>
													<TouchableOpacity style={styles.sizeRemove} onPress={() => {
														let newSizes = [...sizes]

														newSizes.splice(index, 1)

														setSizes(newSizes)
													}}>
														<FontAwesome name="close" size={40}/>
													</TouchableOpacity>
													<View style={styles.sizeTypesBox}>
														<Text style={styles.sizeTypesHeader}>Select size:</Text>
														<View style={styles.sizeTypes}>
															{["Small", "Medium", "Large", "Extra large"].map((sizeopt, sizeindex) => (
																<TouchableOpacity key={sizeindex.toString()} style={size.name == sizeopt.toLowerCase() ? styles.sizeTypeSelected : styles.sizeType} onPress={() => {
																	let newSizes = [...sizes]

																	newSizes[index].name = sizeopt.toLowerCase()

																	setSizes(newSizes)
																}}>
																	<Text style={size.name == sizeopt.toLowerCase() ? styles.sizeTypeHeaderSelected : styles.sizeTypeHeader}>{sizeopt}</Text>
																</TouchableOpacity>
															))}
														</View>
														<TextInput style={styles.sizeInput} placeholderTextColor="rgba(0, 0, 0, 0.5)" placeholder="4.99" value={size.price.toString()} onChangeText={(price) => {
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
								<View style={{ alignItems: 'center', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
									<TouchableOpacity style={styles.addOption} onPress={() => {
										let new_key

										if (sizes.length > 0) {
											let last_size = sizes[sizes.length - 1]

											new_key = parseInt(last_size.key.split("-")[1]) + 1
										} else {
											new_key = 0
										}

										setSizes([...sizes, { key: "size-" + new_key.toString(), name: '', price: "0.00" }])
									}}>
										<Text style={styles.addOptionHeader}>Add Size</Text>
									</TouchableOpacity>

									<Text style={{ fontSize: wsize(6), fontWeight: 'bold' }}>or</Text>

									<View style={styles.priceBox}>
										<Text style={styles.priceHeader}>Enter product (one) price</Text>
										<TextInput style={styles.priceInput} placeholderTextColor="rgba(0, 0, 0, 0.5)" placeholder="4.99" onChangeText={(price) => {
											let newPrice = price.toString()

											if (newPrice.includes(".") && newPrice.split(".")[1].length == 2) {
												Keyboard.dismiss()
											}

											setPrice(price.toString())
										}} value={price.toString()} keyboardType="numeric" autoCorrect={false} autoCapitalize="none"/>
									</View>
								</View>
						)}

						<Text style={styles.errorMsg}>{errorMsg}</Text>

						<View style={{ flexDirection: 'row' }}>
							<View style={styles.addActions}>
								<TouchableOpacity style={styles.addAction} disabled={loading} onPress={() => props.navigation.goBack()}>
									<Text style={styles.addActionHeader}>Cancel</Text>
								</TouchableOpacity>
								<TouchableOpacity style={styles.addAction} disabled={loading} onPress={() => {
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
									<Text style={styles.addActionHeader}>{
										!productid ? 
											setupType == "sizes" ? "Done" : setupType == "photo" ? "Skip" : "Next" 
											: 
											setupType == "sizes" ? "Save" : setupType == "photo" ? "Skip" : "Next"
									}</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
					:
					<View style={styles.loading}>
						<ActivityIndicator color="black" size="large"/>
					</View>
				}
			</TouchableWithoutFeedback>

      {(image.loading || loading) && <Modal transparent={true}><Loadingprogress/></Modal>}
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	addproduct: { height: '100%', paddingTop: Platform.OS == "ios" ? 0 : Constants.statusBarHeight, width: '100%' },
	box: { alignItems: 'center', paddingTop: 10, width: '100%' },
	inputContainer: { alignItems: 'center', width: '100%' },
	addHeader: { fontSize: wsize(5), fontWeight: 'bold', paddingVertical: 5, textAlign: 'center' },
	addInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, fontSize: wsize(5), padding: 10, width: '90%' },
	
	cameraContainer: { alignItems: 'center', width: '100%' },
	cameraHeader: { fontSize: wsize(5), fontWeight: 'bold', paddingVertical: 5 },
	camera: { height: width, width },
	cameraActions: { flexDirection: 'row' },
	cameraAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginBottom: 50, margin: 5, padding: 5, width: wsize(30) },
	cameraActionHeader: { fontSize: wsize(3), textAlign: 'center' },

	addOption: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 10 },
	addOptionHeader: { fontSize: wsize(6) },

	options: { marginBottom: 10, width: '95%' },
	option: { flexDirection: 'row', justifyContent: 'space-between' },
	optionRemove: { alignItems: 'center', borderRadius: 27.5, borderStyle: 'solid', borderWidth: 2, paddingHorizontal: 8 },
	optionInput: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), padding: 3, width: '50%' }, 
	optionTypesBox: { alignItems: 'center' },
	optionTypesHeader: { fontSize: wsize(4), fontWeight: 'bold' },
	optionTypes: { flexDirection: 'row' },
	optionType: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 2, padding: 8 },
	optionTypeSelected: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 2, padding: 8 },

	other: { flexDirection: 'row', justifyContent: 'space-between' },
	otherRemove: { alignItems: 'center', borderRadius: 27.5, borderStyle: 'solid', borderWidth: 2, height: 45, marginTop: 30, width: 45 },
	otherInput: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), height: 50, marginTop: 30, padding: 3, width: '50%' }, 
	otherPrice: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), height: 50, marginTop: 30, padding: 3, width: 80 }, 

	size: { alignItems: 'center' },
	sizeRemove: { alignItems: 'center', borderRadius: 27.5, borderStyle: 'solid', borderWidth: 2, height: 45, marginTop: 30, width: 45 },
	sizeTypesBox: { alignItems: 'center' },
	sizeTypesHeader: { fontSize: wsize(5), fontWeight: 'bold', margin: 5 },
	sizeTypes: { flexDirection: 'row' },
	sizeType: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 10 },
	sizeTypeSelected: { alignItems: 'center', backgroundColor: 'black', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 10 },
	sizeTypeHeader: { fontSize: wsize(4) },
	sizeTypeHeaderSelected: { color: 'white', fontSize: wsize(4) },
	sizeInput: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(9), height: 50, padding: 3, textAlign: 'center', width: 150 }, 
	
	priceBox: { alignItems: 'center', marginBottom: 30 },
	priceHeader: { fontSize: wsize(6), fontWeight: 'bold', padding: 5 },
	priceInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(9), padding: 5, textAlign: 'center', width: wsize(50) },
	
	addActions: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	addAction: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(6), padding: 5, width: wsize(30) },
	addActionHeader: { fontSize: wsize(4) },

  loading: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  errorMsg: { color: 'darkred', fontSize: wsize(4), textAlign: 'center' },
})
