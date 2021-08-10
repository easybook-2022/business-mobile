import React, { useEffect, useState } from 'react'
import { AsyncStorage, Dimensions, View, FlatList, Image, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import { getInfo } from '../../apis/locations'
import { getMenus, removeMenu, addNewMenu } from '../../apis/menus'
import { getProducts, addNewProduct } from '../../apis/products'

import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function services(props) {
	const { menuid, name, map, refetch } = props.route.params

	const [permission, setPermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
	const [camType, setCamtype] = useState(Camera.Constants.Type.back);
	const [showEdit, setShowedit] = useState('')
	const [menus, setMenus] = useState([])
	const [products, setProducts] = useState([])
	const [addMenu, setAddmenu] = useState({ show: false, name: '', info: '', image: { uri: '', name: '' }, errormsg: '' })
	const getTheInfo = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { ownerid, locationid, parentmenuid: menuid }

		getInfo(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { msg } = res

					setShowedit(msg)

					if (msg == "menus") {
						getAllMenus()
					} else if (msg == "products") {
						getAllProducts()
					} else if (msg == "services") {
						getAllServices()
					}
				}
			})
	}
	const getAllMenus = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { ownerid, locationid, parentmenuid: menuid }

		getMenus(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setMenus(res.menus)
				}
			})
	}
	const getAllProducts = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { ownerid, locationid, menuid }

		getProducts(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setProducts(res.products)
				}
			})
	}
	const addTheNewMenu = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const locationid = await AsyncStorage.getItem("locationid")
		const { name, info, image } = addMenu
		const data = { ownerid, locationid, parentmenuid: menuid, name, info, image }

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

					setShowedit('menus')
					setAddmenu({ show: false, name: '', info: '', image: '', errormsg: '' })
					setMenus([...menus, { key: "menu-" + id, id: id, name: name, info: info, image: image }])

					map.push(name)
					props.navigation.push("services", { name: name, map })
				}
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
			let photo = await camera.takePictureAsync(options)
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
	const removeTheMenu = (id, menuindex) => {
		const data = { id }

		removeMenu(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setMenus(menus.filter((item, index) => index != menuindex))
					getTheInfo()
				}
			})
	}
	const removeTheProduct = (id, index) => {
		const data = { id }

		removeProduct(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					if (res) getTheInfo()
				}
			})
	}

	useEffect(() => {
		openCamera()
		getTheInfo()
	}, [])

	return (
		<View style={{ paddingVertical: offsetPadding }}>
			<View style={style.box}>
				<View style={style.actionsContainer}>
					<View style={style.actions}>
						{(showEdit == '' || showEdit == 'menus') && (
							<TouchableOpacity style={style.action} onPress={() => setAddmenu({ ...addMenu, show: true })}>
								<Text style={style.actionHeader}>Add Menu</Text>
							</TouchableOpacity>
						)}
							
						{(showEdit == '' || showEdit == 'products') && (
							<TouchableOpacity style={style.action} onPress={() => setAddproduct({ ...addProduct, show: true })}>
								<Text style={style.actionHeader}>Add Product</Text>
							</TouchableOpacity>
						)}

						{(showEdit == '' || showEdit == 'services') && (
							<TouchableOpacity style={style.action} onPress={() => setAddproduct({ ...addProduct, show: true })}>
								<Text style={style.actionHeader}>Add Product</Text>
							</TouchableOpacity>
						)}
					</View>
				</View>
					
				{showEdit == 'menus' && (
					<FlatList
						data={menus}
						renderItem={({ item, index }) => 
							<TouchableOpacity key={item.key} style={style.menu} onPress={() => {
								map.push(item.name)

								props.navigation.push("services", { menuid: item.id, name: item.name, map })
							}}>
								<Text style={style.menuHeader}>{item.name}</Text>
								{item.image ? <Image source={{ uri: item.image }} style={style.menuImage}/> : null}
								<TouchableOpacity style={style.menuRemove} onPress={() => removeTheMenu(item.id, index)}>
									<Text style={style.menuRemoveHeader}>Remove</Text>
								</TouchableOpacity>
							</TouchableOpacity>
						}
					/>
				)}

				{showEdit == 'products' && (
					<FlatList
						data={products}
						renderItem={({ item, index }) => 
							<View key={item.key} style={style.product}>
								<Text style={style.productHeader}>{item.name}</Text>
								{item.image ? <Image source={{ uri: item.image }} style={style.productImage}/> : null}
								<TouchableOpacity style={style.productRemove} onPress={() => removeTheProduct(item.id, index)}>
									<Text style={style.productRemoveHeader}>Remove</Text>
								</TouchableOpacity>
							</View>
						}
					/>
				)}
			</View>

			{addMenu.show && (
				<Modal transparent={true}>
					<View style={style.hiddenBox}>
						{addMenu.show && (
							<View style={style.addBox}>
								<Text style={style.addHeader}>Enter menu name</Text>

								<TextInput style={style.addInput} placeholder="Menu name" placeholderTextColor="rgba(127, 127, 127, 0.5)" onChangeText={(name) => setAddmenu({...addMenu, name: name })} value={addMenu.name}/>
								<TextInput style={style.infoInput} multiline={true} placeholder="Anything you want to say about this menu" placeholderTextColor="rgba(127, 127, 127, 0.5)" onChangeText={(info) => setAddmenu({...addMenu, info: info })} value={addMenu.info}/>

								<View style={style.cameraContainer}>
									<Text style={style.cameraHeader}>Menu photo</Text>

									{addMenu.image.uri ? (
										<Image style={{ height: width * 0.5, width: width * 0.5 }} source={{ uri: addMenu.image.uri }}/>
									) : (
										<Camera style={style.camera} type={camType} ref={r => {setCamcomp(r)}}/>
									)}

									<TouchableOpacity onPress={snapPhoto.bind(this)}>
										<Entypo name="camera" size={30}/>
									</TouchableOpacity>
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
						)}
					</View>
				</Modal>
			)}
		</View>
	)
}

const style = StyleSheet.create({
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

	actionsContainer: { backgroundColor: 'rgba(127, 127, 127, 0.2)', flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 },
	actions: { flexDirection: 'row', justifyContent: 'space-between' },
	action: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: 100 },
	actionHeader: { fontSize: 13 },

	// menus
	menu: { flexDirection: 'row', padding: 20 },
	menuHeader: { fontSize: 20, fontWeight: 'bold', paddingVertical: 10 },
	menuImage: { backgroundColor: 'black', borderRadius: 25, height: 50, marginLeft: 10, width: 50 },
	menuRemove: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 8, padding: 5 },
	menuRemoveHeader: { textAlign: 'center' },

	// products
	product: { flexDirection: 'row', padding: 20 },
	productHeader: { fontSize: 20, fontWeight: 'bold', paddingVertical: 10 },
	productImage: { backgroundColor: 'black', borderRadius: 25, height: 50, marginLeft: 10, width: 50 },
	productRemove: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 8, padding: 5 },
	productRemoveHeader: { textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', height: 30, margin: 5 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },

	// hidden boxes
	hiddenBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flex: 1, flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },

	// add box
	addBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '100%', justifyContent: 'space-around', paddingVertical: 10, width: '100%' },
	addHeader: { fontSize: 20, fontWeight: 'bold' },
	addInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, fontSize: 20, padding: 10, width: '90%' },
	cameraContainer: { alignItems: 'center', marginVertical: 10, width: '100%' },
	cameraHeader: { fontWeight: 'bold', paddingVertical: 5 },
	addOption: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
	photoView: { height: width * 0.5, width: width * 0.5 },
	camera: { height: width * 0.5, width: width * 0.5 },
	errorMsg: { color: 'red', fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
	addActions: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	addAction: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 100 },
})
