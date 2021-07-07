import React, { useEffect, useState } from 'react'
import { AsyncStorage, SafeAreaView, Dimensions, View, FlatList, Image, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import { getInfo } from '../../apis/locations'
import { getMenus, removeMenu, addNewMenu } from '../../apis/menus'
import { getProducts, addNewProduct } from '../../apis/products'

import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')

export default function services(props) {
	const { id, name, map } = props.route.params
	const [permission, setPermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
	const [camType, setCamtype] = useState(Camera.Constants.Type.back);
	const [showEdit, setShowedit] = useState('')
	const [menus, setMenus] = useState([
		/*{ key: "menu-0", id: "0", name: "Foot Care", image: require("../../../assets/nailsalon/footcare.jpeg") },
		{ key: "menu-1", id: "1", name: "Foot Massage", image: require("../../../assets/nailsalon/footmassage.jpeg") },
		{ key: "menu-2", id: "2", name: "Nail Enhancement", image: require("../../../assets/nailsalon/nailenhancement.jpeg") },
		{ key: "menu-3", id: "3", name: "Hand Care", image: require("../../../assets/nailsalon/handcare.jpeg") },
		{ key: "menu-4", id: "4", name: "Children 10 years & under", image: require("../../../assets/nailsalon/child.jpeg") },
		{ key: "menu-5", id: "5", name: "Facial", image: require("../../../assets/nailsalon/facial.jpeg") },
		{ key: "menu-6", id: "6", name: "Eyelash Extensions", image: require("../../../assets/nailsalon/eyelashextensions.jpeg") },
		{ key: "menu-7", id: "7", name: "Waxing for women", image: require("../../../assets/nailsalon/womenwaxing.jpeg") },
		{ key: "menu-8", id: "8", name: "Waxing for men", image: require("../../../assets/nailsalon/menwaxing.jpeg") },
		{ key: "menu-9", id: "9", name: "Relaxing Massages", image: require("../../../assets/nailsalon/relaxingmassages.jpeg") }*/
	])
	const [products, setProducts] = useState([
		//{ key: "product-0", id: "0", name: "", image: '' }
	])
	const [addMenu, setAddmenu] = useState({ show: false, info: '', image: '', errormsg: '' })
	const [addProduct, setAddproduct] = useState({ show: false, info: '', image: '', options: [], errormsg: '' })
	const getTheInfo = async() => {
		const userid = await AsyncStorage.getItem("userid")
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { userid, locationid, categories: JSON.stringify(map) }

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
					} else {

					}
				}
			})
	}
	const getAllMenus = async() => {
		const userid = await AsyncStorage.getItem("userid")
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { userid, locationid, categories: JSON.stringify(map) }

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
		const userid = await AsyncStorage.getItem("userid")
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { userid, locationid, menuid: id }

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
		const userid = await AsyncStorage.getItem("userid")
		const locationid = await AsyncStorage.getItem("locationid")
		const { info, image } = addMenu
		const data = { userid, locationid, categories: JSON.stringify(map), info, image }

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
					setAddmenu({ show: false, info: '', image: '', errormsg: '' })
					setMenus([...menus, { key: "menu-" + id, id: id, name: info, image: image }])

					map.push(info)
					props.navigation.push("services", { name: info, map })
				}
			})
	}
	const addTheNewProduct = async() => {
		const userid = await AsyncStorage.getItem("userid")
		const locationid = await AsyncStorage.getItem("locationid")
		const { info, image } = addProduct
		const data = { userid, locationid, menuid: id, info: info, image }

		addNewProduct(data)
			.then((res) => {
				if (res.status == 200) {
					if (!res.data.errormsg) {
						return res.data
					} else {
						setAddproduct({
							...addProduct,
							errormsg: res.data.errormsg
						})
					}
				}
			})
			.then((res) => {
				if (res) {
					const { id } = res

					setShowedit('products')
					setAddproduct({ show: false, info: '', image: '', errormsg: '' })
					setProducts([...products, { key: "product-" + id, id: id, name: info, image: image }])
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
				if (addMenu.show) {
					setAddmenu({
						...addMenu,
						image: `${char}.jpg`

						//`${FileSystem.documentDirectory}/${char}.jpg`
					})
				} else {
					setAddproduct({
						...addProduct,
						image: `${char}.jpg`

						//`${FileSystem.documentDirectory}/${char}.jpg`
					})
				}
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

					if (menus.length > 0) {
						setShowedit('menus')
					} else if (products.length > 0) {
						setShowedit('products')
					} else {
						setShowedit('')
					}
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
					setProducts(products.filter((item, index) => index != productindex))

					if (menus.length > 0) {
						setShowedit('menus')
					} else if (products.length > 0) {
						setShowedit('products')
					} else {
						setShowedit('')
					}
				}
			})
	}

	useEffect(() => {
		getTheInfo()
	}, [])

	return (
		<SafeAreaView style={{ flex: 1 }}>
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
					</View>
				</View>
					
				{showEdit == 'menus' && (
					<FlatList
						data={menus}
						renderItem={({ item, index }) => 
							<TouchableOpacity key={item.key} style={style.menu} onPress={() => {
								map.push(item.name)

								props.navigation.push("services", { id: item.id, name: item.name, map })
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

			{(addMenu.show || addProduct.show) && (
				<Modal transparent={true}>
					<SafeAreaView style={style.hiddenBox}>
						{addMenu.show && (
							<View style={style.addBox}>
								<Text style={style.addHeader}>Enter menu name</Text>

								<TextInput style={style.addInput} placeholder="Menu name" placeholderTextColor="rgba(127, 127, 127, 0.5)" onChangeText={(info) => setAddmenu({...addMenu, info: info })}/>

								<View style={style.cameraContainer}>
									<Text style={style.cameraHeader}>Menu photo</Text>

									{addMenu.image ? (
										<Image style={{ height: width * 0.5, width: width * 0.5 }} source={{ uri: image }}/>
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

						{addProduct.show && (
							<View style={style.addBox}>
								<Text style={style.addHeader}>Enter product name</Text>

								<TextInput style={style.addInput} placeholder="Product name" placeholderTextColor="rgba(127, 127, 127, 0.5)" onChangeText={(info) => setAddproduct({...addProduct, info: info })}/>

								<View style={style.cameraContainer}>
									<Text style={style.cameraHeader}>Product photo</Text>

									{addProduct.image ? (
										<Image style={{ height: width * 0.5, width: width * 0.5 }} source={{ uri: image }}/>
									) : (
										<Camera style={style.camera} type={camType} ref={r => {setCamcomp(r)}}/>
									)}

									<TouchableOpacity onPress={snapPhoto.bind(this)}>
										<Entypo name="camera" size={30}/>
									</TouchableOpacity>
								</View>

								<View style={style.addOptions}>
									<TouchableOpacity style={style.addOption} onPress={() => {}}>
										<Text style={style.addOption}>Add Option</Text>
									</TouchableOpacity>
								</View>

								<Text style={style.errorMsg}>{addProduct.errormsg}</Text>

								<View style={style.addActions}>
									<TouchableOpacity style={style.addAction} onPress={() => setAddproduct({ show: false, info: '', image: '' })}>
										<Text>Cancel</Text>
									</TouchableOpacity>
									<TouchableOpacity style={style.addAction} onPress={() => addTheNewProduct()}>
										<Text>Done</Text>
									</TouchableOpacity>
								</View>
							</View>
						)}
					</SafeAreaView>
				</Modal>
			)}
		</SafeAreaView>
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
