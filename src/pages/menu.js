import React, { useState, useEffect } from 'react'
import { AsyncStorage, Dimensions, View, FlatList, Text, TextInput, Image, TouchableOpacity, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, ScrollView, StyleSheet, Modal } from 'react-native'
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import { logo_url } from '../../assets/info'
import { getInfo } from '../apis/locations'
import { getMenus, addNewMenu, removeMenu, getMenuInfo, saveMenu } from '../apis/menus'
import { getProducts, getProductInfo, removeProduct } from '../apis/products'
import { getServices, getServiceInfo, removeService } from '../apis/services'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function menu(props) {
	const { menuid, refetch } = props.route.params

	const [menuName, setMenuname] = useState('')
	const [menuInfo, setMenuinfo] = useState('')
	const [locationType, setLocationtype] = useState('')

	const [permission, setPermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
	const [camType, setCamtype] = useState(Camera.Constants.Type.back);

	const [showMenus, setShowmenus] = useState(false)
	const [menus, setMenus] = useState([])
	const [numMenus, setNummenus] = useState(0)

	const [showProducts, setShowproducts] = useState(false)
	const [products, setProducts] = useState([])
	const [numProducts, setNumproducts] = useState(0)

	const [showServices, setShowservices] = useState(false)
	const [services, setServices] = useState([])
	const [numServices, setNumservices] = useState(0)

	const [menuForm, setMenuform] = useState({ 
		show: false, type: '', id: '', 
		index: -1, name: '', info: '', 
		image: { uri: '', name: '' }, errormsg: '' 
	})
	const [removeMenuinfo, setRemovemenuinfo] = useState({ show: false, id: "", name: "" })
	const [removeServiceinfo, setRemoveserviceinfo] = useState({ show: false, id: "", name: "", info: "", image: "", price: 0 })
	const [removeProductinfo, setRemoveproductinfo] = useState({ show: false, id: "", name: "", info: "", image: "", sizes: [], others: [], options: [], price: 0 })

	const getTheInfo = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { ownerid, locationid, menuid }

		setShowmenus(false)
		setMenus([])
		setNummenus(0)

		setShowproducts(false)
		setProducts([])
		setNumproducts(0)

		setShowservices(false)
		setServices([])
		setNumservices(0)

		getInfo(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { msg, menuName, menuInfo, locationType } = res

					setMenuname(menuName)
					setMenuinfo(menuInfo)
					setLocationtype(locationType)

					if (msg == "menus") {
						getAllMenus()
					} else if (msg == "services") {
						getAllServices()
					} else if (msg == "products") {
						getAllProducts()
					}
				}
			})
	}

	// menus
	const getAllMenus = async() => {
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { locationid, parentmenuid: menuid }

		getMenus(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setMenus(res.menus)
					setNummenus(res.nummenus)
					setShowmenus(true)
				}
			})
	}
	const addTheNewMenu = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const locationid = await AsyncStorage.getItem("locationid")
		const { name, info, image } = menuForm
		const data = { ownerid, locationid, parentMenuid: menuid, name, info, image }

		addNewMenu(data)
			.then((res) => {
				if (res.status == 200) {
					if (!res.data.errormsg) {
						return res.data
					} else {
						setMenuform({
							...menuForm,
							errormsg: res.data.errormsg
						})
					}
				}
			})
			.then((res) => {
				if (res) {
					const { id } = res

					setShowmenus(true)
					setMenuform({ show: false, type: '', index: -1, name: '', info: '', image: { uri: '', name: '' }, errormsg: '' })
					setMenus([...menus, { key: "menu-" + id, id: id, name: name, info: info, image: image }])
					getTheInfo()
				}
			})
	}
	const removeTheMenu = (id) => {
		if (!removeMenuinfo.show) {
			getMenuInfo(id)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						const { name, info, image } = res.info

						setRemovemenuinfo({ show: true, id, name, info, image })
					}
				})
		} else {
			removeMenu(id)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						setRemovemenuinfo({ show: false, id: "", name: "", info: "", image: "" })
						getTheInfo()
					}
				})
		}
	}
	const editTheMenu = (id, index) => {
		getMenuInfo(id)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { name, info, image } = res.info

					setMenuform({
						show: true,
						type: 'edit',
						id, index, name, info, image: {
							uri: logo_url + image,
							name: image
						}
					})
				}
			})
	}
	const saveTheMenu = () => {
		const { id, index, name, info, image } = menuForm
		const data = { id, name, info, image }

		saveMenu(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const newMenus = [...menus]
					const menu = {...newMenus[index], name, info, image: image.name }

					newMenus[index] = menu

					setMenuform({
						show: false,
						type: '',
						id: '', name: '', info: '', image: { uri: '', name: '' },
						errormsg: ''
					})
					
					setMenus(newMenus)
				}
			})	
	}

	// products
	const getAllProducts = async() => {
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { locationid, menuid: menuid }

		getProducts(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setProducts(res.products)
					setNumproducts(res.numproducts)
					setShowproducts(true)
				}
			})
	}
	const removeTheProduct = (id) => {
		if (!removeProductinfo.show) {
			getProductInfo(id)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						const { image, info, name, options, others, price, sizes } = res.productInfo

						setRemoveproductinfo({ show: true, id, name, info, image, sizes, others, options, price })
					}
				})
		} else {
			removeProduct(id)
				.then((res) => {
					if (res.status == 200) {
						if (!res.data.errormsg) {
							return res.data
						} else {
							alert("Error removing product")
						}
					}
				})
				.then((res) => {
					if (res) getTheInfo()
				})
		}
	}

	// services
	const getAllServices = async() => {
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { locationid, menuid: menuid }

		getServices(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setServices(res.services)
					setNumservices(res.numservices)
					setShowservices(true)
				}
			})
	}
	const removeTheService = (id) => {
		if (!removeServiceinfo.show) {
			getServiceInfo(id)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						const { name, info, price, image, duration } = res.serviceInfo

						setRemoveserviceinfo({ show: true, id, name, info, price, image, duration })
					}
				})
		} else {
			removeService(id)
				.then((res) => {
					if (res.status == 200) {
						if (!res.data.errormsg) {
							return res.data
						} else {
							alert("Error removing service")
						}
					}
				})
				.then((res) => {
					if (res) {
						getTheInfo()
						setRemoveserviceinfo({ show: false, id: "", name: "", info: "", price: 0, image: "", duration: "" })
					}
				})
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
				setMenuform({
					...menuForm,
					image: { uri: `${FileSystem.documentDirectory}/${char}.jpg`, name: `${char}.jpg` }
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
		openCamera()
		getTheInfo()
	}, [])

	return (
		<View style={style.boxContainer}>
			<View style={style.box}>
				<View style={style.menuBox}>
					<View style={style.actions}>
						{(numProducts == 0 && numServices == 0) && (
							<TouchableOpacity style={style.action} onPress={() => setMenuform({ ...menuForm, show: true, type: 'add' })}>
								<Text style={style.actionHeader}>Add Menu</Text>
							</TouchableOpacity>
						)}
							
						{(numMenus == 0 && numServices == 0) && (
							<TouchableOpacity style={style.action} onPress={() => props.navigation.navigate("addproduct", { menuid: menuid, refetch: () => getAllProducts() })}>
								<Text style={style.actionHeader}>Add Product</Text>
							</TouchableOpacity>
						)}

						{(numMenus == 0 && numProducts == 0 && locationType != "restaurant") && (
							<TouchableOpacity style={style.action} onPress={() => props.navigation.navigate("addservice", { menuid: menuid, refetch: () => getAllServices() })}>
								<Text style={style.actionHeader}>Add Service</Text>
							</TouchableOpacity>
						)}
					</View>

					{(menuName || menuInfo) ? 
						<View style={style.headers}>
							<Text style={[style.header, { fontFamily: 'appFont' }]}>{menuName}</Text>
							<Text style={style.header}>{menuInfo}</Text>
						</View>
					: null }
				</View>
				
				<View style={{ height: (menuName || menuInfo) ? screenHeight - 195 : screenHeight - 145 }}>
					{showMenus && (
						<View>
							<FlatList
								data={menus}
								renderItem={({ item, index }) => 
									<TouchableOpacity key={item.key} style={style.menu} onPress={() => props.navigation.push("menu", { menuid: item.id, name: item.name, refetch: () => getTheInfo() })}>
										<View style={{ flexDirection: 'row' }}>
											<Text style={style.menuHeader}>{item.name}</Text>
											<Image source={{ uri: logo_url + item.image }} style={style.menuImage}/>
											<TouchableOpacity style={style.menuAction} onPress={() => removeTheMenu(item.id)}>
												<Text style={style.menuActionHeader}>Remove</Text>
											</TouchableOpacity>
											<TouchableOpacity style={style.menuAction} onPress={() => editTheMenu(item.id, index)}>
												<Text style={style.menuActionHeader}>Edit</Text>
											</TouchableOpacity>
										</View>
										{item.info ? <Text style={style.menuInfo}>{item.info}</Text> : null}
									</TouchableOpacity>
								}
							/>
						</View>
					)}
					
					{showProducts && (
						<FlatList
							data={products}
							renderItem={({ item, index }) => 
								<View key={item.key} style={style.row}>
									{item.row.map((info, infoindex) => (
										info.name ? 
											<View key={info.key} style={style.product}>
												<Text style={style.productHeader}>{info.name}</Text>
												<Image source={{ uri: logo_url + info.image }} style={style.productImage}/>
												{info.price ? 
													<Text style={style.productPrice}>$ {info.price}</Text>
													:
													<Text style={style.productPrice}>{info.sizes} size{info.sizes == 1 ? '' : 's'}</Text>
												}
												<TouchableOpacity style={style.productAction} onPress={() => removeTheProduct(info.id)}>
													<Text style={style.productActionHeader}>Remove</Text>
												</TouchableOpacity>
												<TouchableOpacity style={style.productAction} onPress={() => props.navigation.navigate("addproduct", { menuid, id: info.id, refetch: () => getAllProducts() })}>
													<Text style={style.productActionHeader}>Edit</Text>
												</TouchableOpacity>
											</View>
											:
											<View key={info.key} style={style.productEmpty}></View>
									))}
								</View>
							}
						/>
					)}

					{showServices && (
						<FlatList
							data={services}
							style={{ height: height }}
							renderItem={({ item, index }) => 
								<View key={item.key} style={style.service}>
									<View style={{ flexDirection: 'row', marginBottom: 10 }}>
										<Text style={style.serviceHeader}>{item.name}</Text>
										<Image source={{ uri: logo_url + item.image }} style={style.serviceImage}/>
									
									</View>

									<View style={{ flexDirection: 'row', marginBottom: 10 }}>
										<Text style={style.serviceInfo}>Price: <Text style={{ fontWeight: '400' }}>$ {item.price}</Text></Text>
										<Text style={style.serviceInfo}>Time: <Text style={{ fontWeight: '400' }}>{item.duration}</Text></Text>
									</View>

									{item.info ? <Text style={style.serviceInfo}>Information: <Text style={{ fontWeight: '400' }}>{'\n' + item.info}</Text></Text> : null}

									<View style={{ alignItems: 'center' }}>
										<View style={style.serviceActions}>
											<TouchableOpacity style={style.serviceAction} onPress={() => removeTheService(item.id)}>
												<Text style={style.serviceActionHeader}>Remove</Text>
											</TouchableOpacity>
											<TouchableOpacity style={style.serviceAction} onPress={() => props.navigation.navigate("addservice", { menuid, id: item.id, refetch: () => getAllServices() })}>
												<Text style={style.serviceActionHeader}>Edit</Text>
											</TouchableOpacity>
										</View>
									</View>
								</View>
							}
						/>
					)}
				</View>

				<View style={style.bottomNavs}>
					<View style={{ flexDirection: 'row' }}>
						<TouchableOpacity style={style.bottomNav} onPress={() => props.navigation.navigate("settings")}>
							<AntDesign name="setting" size={30}/>
						</TouchableOpacity>

						<TouchableOpacity style={style.bottomNav} onPress={() => {
							props.navigation.dispatch(
								CommonActions.reset({
									index: 1,
									routes: [{ name: 'main' }]
								})
							);
						}}>
							<Entypo name="home" size={30}/>
						</TouchableOpacity>

						<TouchableOpacity style={style.bottomNav} onPress={() => {
							AsyncStorage.clear()

							props.navigation.dispatch(
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

				{menuForm.show && (
					<Modal transparent={true}>
						<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
							<View style={style.addBox}>
								<View style={{ alignItems: 'center', width: '100%' }}>
									<Text style={style.addHeader}>Enter menu info</Text>

									<TextInput style={style.addInput} placeholder="Menu name" placeholderTextColor="rgba(127, 127, 127, 0.5)" onChangeText={(name) => setMenuform({...menuForm, name: name })} value={menuForm.name} autoCorrect={false}/>
									<TextInput style={style.infoInput} onSubmitEditing={() => Keyboard.dismiss()} multiline={true} placeholder="Anything you want to say about this menu" placeholderTextColor="rgba(127, 127, 127, 0.5)" onChangeText={(info) => setMenuform({...menuForm, info: info })} value={menuForm.info} autoCorrect={false} autoCompleteType="off"/>
								</View>

								<View style={style.cameraContainer}>
									<Text style={style.cameraHeader}>Menu photo</Text>

									{menuForm.image.uri ? (
										<>
											<Image style={{ height: width * 0.6, width: width * 0.6 }} source={{ uri: menuForm.image.uri }}/>

											<TouchableOpacity style={style.cameraAction} onPress={() => setMenuform({...menuForm, image: { uri: '', name: '' }})}>
												<AntDesign name="closecircleo" size={30}/>
											</TouchableOpacity>
										</>
									) : (
										<>
											<Camera style={style.camera} type={camType} ref={r => { setCamcomp(r) }}/>

											<TouchableOpacity style={style.cameraAction} onPress={snapPhoto.bind(this)}>
												<Entypo name="camera" size={30}/>
											</TouchableOpacity>
										</>
									)}
								</View>

								<Text style={style.errorMsg}>{menuForm.errormsg}</Text>

								<View style={style.addActions}>
									<TouchableOpacity style={style.addAction} onPress={() => setMenuform({ ...menuForm, show: false, name: '', info: '', image: { uri: '', name: ''} })}>
										<Text>Cancel</Text>
									</TouchableOpacity>
									<TouchableOpacity style={style.addAction} onPress={() => {
										if (menuForm.type == 'add') {
											addTheNewMenu()
										} else {
											saveTheMenu()
										}
									}}>
										<Text>Done</Text>
									</TouchableOpacity>
								</View>
							</View>
						</TouchableWithoutFeedback>
					</Modal>
				)}

				{removeMenuinfo.show && (
					<Modal transparent={true}>
						<View style={style.menuInfoContainer}>
							<View style={style.menuInfoBox}>
								<Text style={style.menuInfoBoxHeader}>Delete menu confirmation</Text>

								<View style={{ alignItems: 'center' }}>
									<View style={style.menuInfoImageHolder}>
										<Image source={{ uri: logo_url + removeMenuinfo.image }} style={style.menuInfoImage}/>
									</View>
									<Text style={style.menuInfoName}>{removeMenuinfo.name}</Text>
									<Text style={style.menuInfoInfo}>{removeMenuinfo.info}</Text>
								</View>

								<Text style={style.menuInfoHeader}>Are you sure you want to delete this menu and its categories</Text>

								<View style={style.menuInfoActions}>
									<TouchableOpacity style={style.menuInfoAction} onPress={() => setRemovemenuinfo({ ...removeMenuinfo, show: false })}>
										<Text style={style.menuInfoActionHeader}>Cancel</Text>
									</TouchableOpacity>
									<TouchableOpacity style={style.menuInfoAction} onPress={() => removeTheMenu(removeMenuinfo.id)}>
										<Text style={style.menuInfoActionHeader}>Yes</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</Modal>
				)}

				{removeProductinfo.show && (
					<Modal transparent={true}>
						<View style={style.productInfoContainer}>
							<View style={style.productInfoBox}>
								<Text style={style.productInfoBoxHeader}>Delete product confirmation</Text>

								<View style={style.productInfoImageHolder}>
									<Image source={{ uri: logo_url + removeProductinfo.image }} style={style.productInfoImage}/>
								</View>
								<Text style={style.productInfoName}>{removeProductinfo.name}</Text>

								<View>
									{removeProductinfo.options.map((option, infoindex) => (
										<Text key={option.key} style={style.itemInfo}>
											<Text style={{ fontWeight: 'bold' }}>{option.header}: </Text> 
											{option.selected}
											{option.type == 'percentage' && '%'}
										</Text>
									))}

									{removeProductinfo.others.map((other, otherindex) => (
										<Text key={other.key} style={style.itemInfo}>
											<Text style={{ fontWeight: 'bold' }}>{other.name}: </Text>
											<Text>{other.input}</Text>
											<Text> ($ {other.price.toFixed(2)})</Text>
										</Text>
									))}

									{removeProductinfo.sizes.map((size, sizeindex) => (
										<Text key={size.key} style={style.itemInfo}>
											<Text style={{ fontWeight: 'bold' }}>Size #{sizeindex + 1}: </Text>
											<Text>{size.name} ($ {size.price.toFixed(2)})</Text>
										</Text>
									))}
								</View>

								{removeProductinfo.price ? 
									<Text style={style.productInfoPrice}><Text style={{ fontWeight: 'bold' }}>Price: </Text>$ {(removeProductinfo.price).toFixed(2)}</Text>
								: null }

								{removeProductinfo.numorderers > 0 && (
									<View>
										<Text style={style.productInfoOrderers}>Calling for {removeProductinfo.numorderers} {removeProductinfo.numorderers == 1 ? 'person' : 'people'}</Text>
									</View>
								)}

								<Text style={style.productInfoHeader}>Are you sure you want to delete this product</Text>

								<View style={style.productInfoActions}>
									<TouchableOpacity style={style.productInfoAction} onPress={() => setRemoveproductinfo({ ...removeProductinfo, show: false })}>
										<Text style={style.productInfoActionHeader}>Cancel</Text>
									</TouchableOpacity>
									<TouchableOpacity style={style.productInfoAction} onPress={() => removeTheProduct(removeProductinfo.id)}>
										<Text style={style.productInfoActionHeader}>Yes</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</Modal>
				)}

				{removeServiceinfo.show && (
					<Modal transparent={true}>
						<View style={style.serviceInfoContainer}>
							<View style={style.serviceInfoBox}>
								<Text style={style.serviceInfoBoxHeader}>Delete service confirmation</Text>

								<View style={style.serviceInfoImageHolder}>
									<Image source={{ uri: logo_url + removeServiceinfo.image }} style={style.serviceInfoImage}/>
								</View>
								<Text style={style.serviceInfoName}>{removeServiceinfo.name}</Text>

								<View>
									<Text style={style.serviceInfoPrice}><Text style={{ fontWeight: 'bold' }}>Price: </Text>$ {(removeServiceinfo.price).toFixed(2)}</Text>
								</View>

								<Text style={style.serviceInfoHeader}>Are you sure you want to delete this service</Text>

								<View style={style.serviceInfoActions}>
									<TouchableOpacity style={style.serviceInfoAction} onPress={() => setRemoveserviceinfo({ ...removeServiceinfo, show: false })}>
										<Text style={style.serviceInfoActionHeader}>Cancel</Text>
									</TouchableOpacity>
									<TouchableOpacity style={style.serviceInfoAction} onPress={() => removeTheService(removeServiceinfo.id)}>
										<Text style={style.serviceInfoActionHeader}>Yes</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</Modal>
				)}
			</View>
		</View>
	)
}

const style = StyleSheet.create({
	boxContainer: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: screenHeight - 44, justifyContent: 'space-between', width: '100%' },

	menuBox: {  },
	actions: { backgroundColor: 'rgba(127, 127, 127, 0.2)', flexDirection: 'row', height: 55, justifyContent: 'space-around' },
	action: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, marginVertical: 10, padding: 10, width: (width / 3) - 20 },
	actionHeader: { color: 'black', fontSize: 10 },

	headers: { marginVertical: 10 },
	header: { fontWeight: 'bold', fontSize: 15, textAlign: 'center' },

	body: {  },
	row: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },

	menu: { marginHorizontal: 20, marginBottom: 15 },
	menuHeader: { fontSize: 15, fontWeight: 'bold', paddingVertical: 15 },
	menuImage: { backgroundColor: 'black', borderRadius: 25, height: 50, marginLeft: 10, width: 50 },
	menuAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, height: 27, marginHorizontal: 2, marginVertical: 12, padding: 5, width: 60 },
	menuActionHeader: { fontSize: 10, textAlign: 'center' },
	menuInfo: { marginVertical: 10 },

	product: { alignItems: 'center', padding: 20, width: (width / 3) - 10 },
	productEmpty: { padding: 20, width: (width / 3) - 10 },
	productHeader: { fontSize: 15, fontWeight: 'bold', paddingVertical: 10, textAlign: 'center' },
	productImage: { backgroundColor: 'black', borderRadius: 25, height: 50, marginBottom: 5, width: 50 },
	productPrice: { fontWeight: 'bold' },
	productAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginBottom: 2, marginHorizontal: 8, padding: 5, width: 60 },
	productActionHeader: { fontSize: 10, textAlign: 'center' },

	service: { backgroundColor: 'white', marginHorizontal: 10, marginTop: 10, padding: 20 },
	serviceHeader: { fontSize: 15, fontWeight: 'bold', paddingVertical: 10 },
	serviceImage: { backgroundColor: 'black', borderRadius: 25, height: 50, marginLeft: 10, width: 50 },
	serviceInfo: { fontWeight: 'bold', marginRight: 10 },
	serviceActions: { flexDirection: 'row', justifyContent: 'space-between', width: 180 },
	serviceAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 8, padding: 5, width: 70 },
	serviceActionHeader: { textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', height: 40, justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', height: 30, marginVertical: 5, marginHorizontal: 20 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },

	// hidden boxes
	// menu add box
	addBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '100%', justifyContent: 'space-between', paddingVertical: offsetPadding, width: '100%' },
	addHeader: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', width: '90%' },
	addInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, fontSize: 13, padding: 10, width: '90%' },
	infoInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, fontSize: 13, height: 100, marginVertical: 5, padding: 10, textAlignVertical: 'top', width: '90%' },
	cameraContainer: { alignItems: 'center', width: '100%' },
	cameraHeader: { fontWeight: 'bold', paddingVertical: 5 },
	camera: { height: width * 0.6, width: width * 0.6 },
	cameraAction: { marginVertical: 10 },
	errorMsg: { color: 'red', fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
	addActions: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	addAction: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 100 },

	// remove menu confirmation
	menuInfoContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', paddingVertical: offsetPadding, width: '100%' },
	menuInfoBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-between', padding: 10, width: '80%' },
	menuInfoBoxHeader: { fontSize: 20, textAlign: 'center' },
	menuInfoImageHolder: { borderRadius: 50, height: 100, overflow: 'hidden', width: 100 },
	menuInfoImage: { height: 100, width: 100 },
	menuInfoName: { fontSize: 25, fontWeight: 'bold' },
	menuInfoInfo: { fontSize: 20, fontWeight: 'bold'},
	menuInfoHeader: { fontSize: 15, paddingHorizontal: 10, textAlign: 'center' },
	menuInfoInfo: { fontSize: 15 },
	menuInfoActions: { flexDirection: 'row', justifyContent: 'space-around' },
	menuInfoAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 10, padding: 5, width: 70 },
	menuInfoActionHeader: { textAlign: 'center' },

	// remove product confirmation
	productInfoContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', paddingVertical: offsetPadding, width: '100%' },
	productInfoBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-between', padding: 10, width: '80%' },
	productInfoBoxHeader: { fontSize: 20, textAlign: 'center' },
	productInfoImageHolder: { borderRadius: 40, height: 80, overflow: 'hidden', width: 80 },
	productInfoImage: { height: 80, width: 80 },
	productInfoName: { fontSize: 25, fontWeight: 'bold' },
	productInfoQuantity: {  },
	productInfoPrice: {  },
	productInfoOrderers: { fontWeight: 'bold' },
	productInfoHeader: { fontSize: 15, paddingHorizontal: 10, textAlign: 'center' },
	productInfoActions: { flexDirection: 'row', justifyContent: 'space-around' },
	productInfoAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 10, padding: 5, width: 70 },
	productInfoActionHeader: { textAlign: 'center' },

	// remove service confirmation
	serviceInfoContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', paddingVertical: offsetPadding, width: '100%' },
	serviceInfoBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-between', padding: 10, width: '80%' },
	serviceInfoBoxHeader: { fontSize: 20, textAlign: 'center' },
	serviceInfoImageHolder: { borderRadius: 40, height: 80, overflow: 'hidden', width: 80 },
	serviceInfoImage: { height: 80, width: 80 },
	serviceInfoName: { fontWeight: 'bold' },
	serviceInfoQuantity: {  },
	serviceInfoPrice: {  },
	serviceInfoOrderers: { fontWeight: 'bold' },
	serviceInfoHeader: { fontSize: 15, paddingHorizontal: 10, textAlign: 'center' },
	serviceInfoActions: { flexDirection: 'row', justifyContent: 'space-around' },
	serviceInfoAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 10, padding: 5, width: 70 },
	serviceInfoActionHeader: { textAlign: 'center' },
})
