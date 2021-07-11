import React, { useState, useEffect } from 'react'
import { AsyncStorage, Dimensions, View, FlatList, Text, TextInput, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import { logo_url } from '../../assets/info'
import { getInfo } from '../apis/locations'
import { getMenus, removeMenu, addNewMenu } from '../apis/menus'
import { getProducts, removeProduct } from '../apis/products'
import { getServices, removeService } from '../apis/services'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function menu(props) {
	const { menuid, refetch } = props.route.params

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

	const [addMenu, setAddmenu] = useState({ show: false, name: '', info: '', image: { uri: '', name: '' }, errormsg: '' })
	const getTheInfo = async() => {
		const userid = await AsyncStorage.getItem("userid")
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { userid, locationid, menuid }

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
					const { msg, storeName, storeAddress, storeLogo } = res

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
		const userid = await AsyncStorage.getItem("userid")
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { userid, locationid, parentmenuid: menuid }

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
		const userid = await AsyncStorage.getItem("userid")
		const locationid = await AsyncStorage.getItem("locationid")
		const { name, info, image } = addMenu
		const data = { userid, locationid, parentMenuid: menuid, name, info, image }

		addNewMenu(data)
			.then((res) => {
				if (res.status == 200) {
					if (!res.data.errormsg) {
						return res.data
					} else {
						setAddmenu({
							...addMenu,
							errormsg: res.data.errormsg
						})
					}
				}
			})
			.then((res) => {
				if (res) {
					const { id } = res

					setShowmenus(true)
					setAddmenu({ show: false, name: '', info: '', image: '', errormsg: '' })
					setMenus([...menus, { key: "menu-" + id, id: id, name: name, info: info, image: image }])
					getTheInfo()
				}
			})
	}
	const removeTheMenu = (id, menuindex) => {
		removeMenu(id)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) getTheInfo()
			})
	}

	// products
	const getAllProducts = async() => {
		const userid = await AsyncStorage.getItem("userid")
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { userid, locationid, menuid: menuid }

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

	// services
	const getAllServices = async() => {
		const userid = await AsyncStorage.getItem("userid")
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { userid, locationid, menuid: menuid }

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
				if (res) getTheInfo()
			})
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
				setAddmenu({
					...addMenu,
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
		<View style={style.box}>
			<View style={style.actionsContainer}>
				<View style={style.actions}>
					{(numProducts == 0 && numServices == 0) && (
						<TouchableOpacity style={showMenus ? style.actionSelected : style.action} disabled={showMenus} onPress={() => getAllMenus()}>
							<Text>Menu</Text>
						</TouchableOpacity>
					)}

					{(numMenus == 0 && numServices == 0) && (
						<TouchableOpacity style={showProducts ? style.actionSelected : style.action} disabled={showProducts} onPress={() => getAllProducts()}>
							<Text>Product(s)</Text>
						</TouchableOpacity>
					)}

					{(numMenus == 0 && numProducts == 0) && (
						<TouchableOpacity style={showServices ? style.actionSelected : style.action} disabled={showServices} onPress={() => getAllServices()}>
							<Text>Service(s)</Text>
						</TouchableOpacity>
					)}
				</View>
			</View>

			<View style={style.actionsContainer}>
				<View style={style.actions}>
					{(numProducts == 0 && numServices == 0) && (
						<TouchableOpacity style={style.action} onPress={() => setAddmenu({ ...addMenu, show: true })}>
							<Text>Add Menu</Text>
						</TouchableOpacity>
					)}
						
					{(numMenus == 0 && numServices == 0) && (
						<TouchableOpacity style={style.action} onPress={() => props.navigation.navigate("addproduct", { menuid: menuid, refetch: () => getAllProducts() })}>
							<Text>Add Product</Text>
						</TouchableOpacity>
					)}

					{(numMenus == 0 && numProducts == 0) && (
						<TouchableOpacity style={style.action} onPress={() => props.navigation.navigate("addservice", { menuid: menuid, refetch: () => getAllServices() })}>
							<Text>Add Service</Text>
						</TouchableOpacity>
					)}
				</View>
			</View>

			{showMenus && (
				<FlatList
					data={menus}
					renderItem={({ item, index }) => 
						<TouchableOpacity key={item.key} style={style.menu} onPress={() => props.navigation.push("menu", { menuid: item.id, name: item.name, refetch: () => getTheInfo() })}>
							<View style={{ flexDirection: 'row' }}>
								<Text style={style.menuHeader}>{item.name}</Text>
								<Image source={{ uri: logo_url + item.image.uri }} style={style.menuImage}/>
								<TouchableOpacity style={style.menuRemove} onPress={() => removeTheMenu(item.id, index)}>
									<Text style={style.menuRemoveHeader}>Remove</Text>
								</TouchableOpacity>
							</View>
							<Text style={style.menuInfo}>{item.info}</Text>
						</TouchableOpacity>
					}
				/>
			)}

			{showProducts && (
				<FlatList
					data={products}
					renderItem={({ item, index }) => 
						<View key={item.key} style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
							{item.row.map((info, infoindex) => (
								info.name ? 
									<View key={info.key} style={style.product}>
										<Text style={style.productHeader}>{info.name}</Text>
										<Image source={{ uri: logo_url + info.image }} style={style.productImage}/>
										<Text style={style.productPrice}>$ {info.price}</Text>
										<TouchableOpacity style={style.productRemove} onPress={() => removeTheProduct(info.id)}>
											<Text style={style.productRemoveHeader}>Remove</Text>
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
					renderItem={({ item, index }) => 
						<View key={item.key} style={style.service}>
							<View style={{ flexDirection: 'row', marginBottom: 10 }}>
								<Text style={style.serviceHeader}>{item.name}</Text>
								<Image source={{ uri: logo_url + item.image }} style={style.serviceImage}/>
								<TouchableOpacity style={style.serviceRemove} onPress={() => removeTheService(item.id)}>
									<Text style={style.serviceRemoveHeader}>Remove</Text>
								</TouchableOpacity>
							</View>

							<View style={{ flexDirection: 'row', marginBottom: 10 }}>
								<Text style={style.serviceInfo}>Price: <Text style={{ fontWeight: '400' }}>$ {item.price}</Text></Text>
								<Text style={style.serviceInfo}>Time: <Text style={{ fontWeight: '400' }}>{item.duration}</Text></Text>
							</View>

							<Text style={style.serviceInfo}>Information: <Text style={{ fontWeight: '400' }}>{'\n' + item.info}</Text></Text>
						</View>
					}
				/>
			)}

			{addMenu.show && (
				<Modal transparent={true}>
					<View style={style.addBox}>
						<Text style={style.addHeader}>Enter menu info</Text>

						<TextInput style={style.addInput} placeholder="Menu name" placeholderTextColor="rgba(127, 127, 127, 0.5)" onChangeText={(name) => setAddmenu({...addMenu, name: name })} value={addMenu.name}/>
						<TextInput style={style.infoInput} multiline={true} placeholder="Anything you want to say about this menu" placeholderTextColor="rgba(127, 127, 127, 0.5)" onChangeText={(info) => setAddmenu({...addMenu, info: info })} value={addMenu.info}/>

						<View style={style.cameraContainer}>
							<Text style={style.cameraHeader}>Menu photo</Text>

							{addMenu.image.uri ? (
								<>
									<Image style={{ height: width * 0.6, width: width * 0.6 }} source={{ uri: addMenu.image.uri }}/>

									<TouchableOpacity style={style.cameraAction} onPress={() => setAddmenu({...addMenu, image: { uri: '', name: '' }})}>
										<AntDesign name="closecircleo" size={30}/>
									</TouchableOpacity>
								</>
							) : (
								<>
									<Camera style={style.camera} type={camType} ref={r => {setCamcomp(r)}}/>

									<TouchableOpacity onPress={snapPhoto.bind(this)}>
										<Entypo name="camera" size={30}/>
									</TouchableOpacity>
								</>
							)}
						</View>

						<Text style={style.errorMsg}>{addMenu.errormsg}</Text>

						<View style={style.addActions}>
							<TouchableOpacity style={style.addAction} onPress={() => setAddmenu({ show: false, info: '', image: '' })}>
								<Text>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity style={style.addAction} onPress={() => addTheNewMenu()}>
								<Text>Done</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>
			)}
		</View>
	)
}

const style = StyleSheet.create({
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },

	actionsContainer: { backgroundColor: 'rgba(127, 127, 127, 0.2)', flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 },
	actions: { flexDirection: 'row', justifyContent: 'space-between' },
	action: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 3, width: 100 },
	actionHeader: { color: 'black' },
	actionSelected: { alignItems: 'center', backgroundColor: 'grey', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 3, width: 100 },
	actionSelectedHeader: { color: 'white' },

	menu: { padding: 20 },
	menuHeader: { fontSize: 20, fontWeight: 'bold', paddingVertical: 10 },
	menuImage: { backgroundColor: 'black', borderRadius: 25, height: 50, marginLeft: 10, width: 50 },
	menuRemove: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 8, padding: 5 },
	menuRemoveHeader: { textAlign: 'center' },
	menuInfo: { marginVertical: 10 },

	product: { alignItems: 'center', padding: 20 },
	productHeader: { fontSize: 20, fontWeight: 'bold', paddingVertical: 10 },
	productImage: { backgroundColor: 'black', borderRadius: 25, height: 50, marginLeft: 10, width: 50 },
	productPrice: { fontWeight: 'bold' },
	productRemove: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 8, padding: 5 },
	productRemoveHeader: { textAlign: 'center' },

	service: { backgroundColor: 'white', marginHorizontal: 10, marginTop: 10, padding: 20 },
	serviceHeader: { fontSize: 20, fontWeight: 'bold', paddingVertical: 10 },
	serviceImage: { backgroundColor: 'black', borderRadius: 25, height: 50, marginLeft: 10, width: 50 },
	serviceInfo: { fontWeight: 'bold', marginRight: 10 },
	serviceRemove: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 8, padding: 5 },
	serviceRemoveHeader: { textAlign: 'center' },

	// hidden boxes
	// add box
	addBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '100%', justifyContent: 'space-around', paddingVertical: offsetPadding, width: '100%' },
	addHeader: { fontSize: 20, fontWeight: 'bold' },
	addInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, fontSize: 13, padding: 10, width: '90%' },
	infoInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, fontSize: 13, height: 100, padding: 10, width: '90%' },
	cameraContainer: { alignItems: 'center', marginVertical: 10, width: '100%' },
	cameraHeader: { fontWeight: 'bold', paddingVertical: 5 },
	camera: { height: width * 0.6, width: width * 0.6 },
	errorMsg: { color: 'red', fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
	addActions: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	addAction: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 100 },
})
