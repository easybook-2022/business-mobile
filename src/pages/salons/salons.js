import React, { useEffect, useState } from 'react'
import { AsyncStorage, SafeAreaView, ActivityIndicator, Dimensions, View, FlatList, Image, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import { CommonActions } from '@react-navigation/native';
import { logo_url } from '../../../assets/info'
import { getInfo } from '../../apis/locations'
import { getMenus, removeMenu, getRequests, getAppointments, acceptRequest, addNewMenu } from '../../apis/menus'
import { getProducts, removeProduct } from '../../apis/products'

import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')

export default function main(props) {
	const [storeIcon, setStoreicon] = useState('')
	const [storeName, setStorename] = useState('')
	const [storeAddress, setStoreaddress] = useState('')
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
	const [requests, setRequests] = useState([
		{ // client requested time
			key: "request-0", id: "10d0df0cidod-0", username: 'good girl 0', time: 1624540847504, name: "Foot Care", 
			serviceimage: { image: require("../../../assets/nailsalon/footcare.jpeg"), width: 0, height: 0 }
		},
		{ // client requested time
			key: "request-1", id: "10d0df0cidod-1", username: 'good girl 1', time: 1624540848604, name: "Foot Care", 
			serviceimage: { image: require("../../../assets/nailsalon/footcare.jpeg"), width: 0, height: 0 }
		},
		{ // client requested time
			key: "request-2", id: "10d0df0cidod-2", username: 'good girl 2', time: 1624540849704, name: "Foot Care", 
			serviceimage: { image: require("../../../assets/nailsalon/footcare.jpeg"), width: 0, height: 0 }
		},
		{ // client requested time
			key: "request-3", id: "10d0df0cidod-3", username: 'good girl 3', time: 1624571850804, name: "Foot Care", 
			serviceimage: { image: require("../../../assets/nailsalon/footcare.jpeg"), width: 0, height: 0 }
		}
	])
	const [appointments, setAppointments] = useState([
		{
			key: "appointment-0", id: "19c9d9f9d9f-0", username: "good girl 0", time: 1624541947504, name: "Foot Care",
			serviceimage: { image: require("../../../assets/nailsalon/footcare.jpeg"), width: 0, height: 0 }
		},
		{
			key: "appointment-1", id: "19c9d9f9d9f-1", username: "good girl 1", time: 1624542047504, name: "Foot Care",
			serviceimage: { image: require("../../../assets/nailsalon/footcare.jpeg"), width: 0, height: 0 }
		},
		{
			key: "appointment-2", id: "19c9d9f9d9f-2", username: "good girl 2", time: 1624542147504, name: "Foot Care",
			serviceimage: { image: require("../../../assets/nailsalon/footcare.jpeg"), width: 0, height: 0 }
		},
		{
			key: "appointment-3", id: "19c9d9f9d9f-3", username: "good girl 3", time: 1624542447504, name: "Foot Care",
			serviceimage: { image: require("../../../assets/nailsalon/footcare.jpeg"), width: 0, height: 0 }
		}
	])
	const [viewType, setViewtype] = useState("menus")
	const [addMenu, setAddmenu] = useState({ show: false, info: '', image: '', errormsg: '' })
	const displayDateStr = (unixtime) => {
		let weekdays = { "Mon": "Monday", "Tue": "Tuesday", "Wed": "Wednesday", "Thu": "Thursday", "Fri": "Friday", "Sat": "Saturday", "Sun": "Sunday" }
		let months = { 
			"Jan": "January", "Feb": "February", "Mar": "March", "Apr": "April", "May": "May", "Jun": "June", 
			"Jul": "July", "Aug": "August", "Sep": "September", "Oct": "October", "Nov": "November", "Dec": "December" 
		}
		let d = new Date(unixtime).toString().split(" ")
		let day = weekdays[d[0]]
		let month = months[d[1]]
		let date = d[2]
		let year = d[3]

		let time = d[4].split(":")
		let hour = parseInt(time[0])
		let minute = time[1]
		let period = hour > 11 ? "pm" : "am"

		hour = hour > 11 ? hour - 11 : hour

		let datestr = day + ", " + month + " " + date + ", " + year + " at " + hour + ":" + minute + " " + period;

		return datestr
	}
	const getTheInfo = async() => {
		const userid = await AsyncStorage.getItem("userid")
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { userid, locationid, menuid: 0, categories: '[]' }

		getInfo(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { msg, storeName, storeAddress, storeLogo } = res

					setShowedit(msg)
					setStorename(storeName)
					setStoreaddress(storeAddress)
					setStoreicon(storeLogo)

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
		const data = { userid, locationid, categories: '[]' }

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
		const data = { userid, locationid, menuid: 0 }

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
	const getAllRequests = () => {
		getRequests()
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {

				}
			})
	}
	const getAllAppointments = () => {
		getAppointments()
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {

				}
			})
	}
	const acceptTheRequest = () => {
		acceptRequest()
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					
				}
			})
	}
	const addTheNewMenu = async() => {
		const userid = await AsyncStorage.getItem("userid")
		const locationid = await AsyncStorage.getItem("locationid")
		const { info, image } = addMenu
		const data = { userid, locationid, categories: '[]', info: info, image }

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

					props.navigation.push("services", { name: info, map: [info] })
				}
			})
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
	const removeTheProduct = (id, productindex) => {
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
				<View style={style.headers}>
					<View style={style.storeIconHolder}>
						<Image source={{ uri: logo_url + storeIcon }} style={style.image}/>
					</View>
					<Text style={style.locationName}>{storeName}</Text>
					<Text style={style.locationAddress}>{storeAddress}</Text>
				</View>

				<View style={style.body}>
					<View style={style.navs}>
						{showEdit == 'menus' ? 
							<TouchableOpacity style={style.nav} onPress={() => getAllMenus()}>
								<Text style={style.navHeader}>Edit Menu(s)</Text>
							</TouchableOpacity>
						: null }

						<View style={{ flexDirection: 'row' }}>
							<TouchableOpacity style={style.nav} onPress={() => getAllRequests()}>
								<Text style={style.navHeader}>Request(s)</Text>
							</TouchableOpacity>
							<TouchableOpacity style={style.nav} onPress={() => getAllAppointments()}>
								<Text style={style.navHeader}>Appointment(s)</Text>
							</TouchableOpacity>
						</View>
					</View>

					<View style={style.actionsContainer}>
						<View style={style.actions}>
							{(showEdit == '' || showEdit == 'menus') && (
								<TouchableOpacity style={style.action} onPress={() => setAddmenu({ ...addMenu, show: true })}>
									<Text>Add Menu</Text>
								</TouchableOpacity>
							)}
								
							{(showEdit == '' || showEdit == 'products') && (
								<TouchableOpacity style={style.action} onPress={() => props.navigation.navigate("addproduct", { menuid: 0 })}>
									<Text>Add Product</Text>
								</TouchableOpacity>
							)}
						</View>
					</View>

					{showEdit == "menus" ? (
						<FlatList
							data={menus}
							renderItem={({ item, index }) => 
								<TouchableOpacity key={item.key} style={style.menu} onPress={() => {
									const map = [item.name]

									props.navigation.navigate("services", { id: item.id, name: item.name, map })
								}}>
									<Text style={style.menuHeader}>{item.name}</Text>
									{item.image ? <Image source={{ uri: item.image }} style={style.menuImage}/> : <View style={style.menuImage}></View>}
									<TouchableOpacity style={style.menuRemove} onPress={() => removeTheMenu(item.id, index)}>
										<Text style={style.menuRemoveHeader}>Remove</Text>
									</TouchableOpacity>
								</TouchableOpacity>
							}
						/>
					) : (
						<FlatList
							data={products}
							renderItem={({ item, index }) => 
								<View key={item.key} style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
									{item.row.map((info, infoindex) => (
										info.name ? 
											<View key={info.key} style={style.product}>
												<Text style={style.productHeader}>{info.name}</Text>
												{info.image ? <Image source={{ uri: logo_url + info.image }} style={style.productImage}/> : <View style={style.productImage}></View>}
												<Text style={style.productPrice}>$ {info.price}</Text>
												<TouchableOpacity style={style.productRemove} onPress={() => removeTheProduct(info.id, index)}>
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

					{viewType == "requests" && (
						<FlatList
							data={requests}
							renderItem={({ item }) => 
								<View key={item.key} style={style.request}>
									<View style={style.imageHolder}>
										<Image source={item.serviceimage.image} style={{ height: 80, width: 80 }}/>
									</View>
									<View style={style.requestInfo}>
										<Text>
											<Text style={{ fontWeight: 'bold' }}>{item.username + ' requested'}</Text> 
											<Text style={{ fontWeight: 'bold' }}>{' ' + item.name}</Text> at 
											<Text style={{ fontWeight: 'bold' }}>{' ' + displayDateStr(item.time)}</Text>
										</Text>

										<View style={style.requestActions}>
											<View style={{ flexDirection: 'row' }}>
												<TouchableOpacity style={style.requestAction} onPress={() => props.navigation.navigate("booktime", { name: item.name })}>
													<Text style={style.requestActionHeader}>Another time</Text>
												</TouchableOpacity>
												<TouchableOpacity style={style.requestAction} onPress={() => acceptTheRequest(item.id)}>
													<Text style={style.requestActionHeader}>Accept</Text>
												</TouchableOpacity>
											</View>
										</View>
									</View>
								</View>
							}
						/>
					)}

					{viewType == "appointments" && (
						<FlatList
							data={appointments}
							renderItem={({ item }) => 
								<View key={item.key} style={style.appointment}>

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
			</View>

			{addMenu.show && (
				<Modal transparent={true}>
					<SafeAreaView>
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
					</SafeAreaView>
				</Modal>
			)}
		</SafeAreaView>
	)
}

const style = StyleSheet.create({
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },

	headers: { alignItems: 'center', paddingVertical: 5 },
	storeIconHolder: { borderRadius: 35, height: 70, overflow: 'hidden', width: 70 },
	image: { height: 70, width: 70 },
	locationName: { fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
	locationAddress: { fontSize: 10, fontWeight: 'bold', textAlign: 'center' },

	body: { height: height - 164 },
	navs: { alignItems: 'center', backgroundColor: 'rgba(127, 127, 127, 0.1)' },
	nav: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: 13, marginHorizontal: 2, marginVertical: 3, padding: 3, width: 110 },
	navHeader: { fontSize: 13 },

	actionsContainer: { backgroundColor: 'rgba(127, 127, 127, 0.2)', flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 },
	actions: { flexDirection: 'row', justifyContent: 'space-between' },
	action: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 3, width: 100 },

	// menus
	menu: { flexDirection: 'row', padding: 20 },
	menuHeader: { fontSize: 20, fontWeight: 'bold', paddingVertical: 10 },
	menuImage: { backgroundColor: 'black', borderRadius: 25, height: 50, marginLeft: 10, width: 50 },
	menuRemove: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 8, padding: 2 },
	menuRemoveHeader: { textAlign: 'center' },

	// products
	product: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, margin: 5, padding: 5, width: (width / 3) - 10 },
	productEmpty: { borderRadius: 5, margin: 5, padding: 5, width: (width / 3) - 10 },
	productHeader: { fontSize: 10, fontWeight: 'bold', paddingVertical: 10 },
	productImage: { backgroundColor: 'black', borderRadius: 25, height: 50, width: 50 },
	productRemove: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 8, padding: 2 },
	productRemoveHeader: { fontSize: 10, textAlign: 'center' },

	// client appointment requests
	request: { borderRadius: 5, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 5, marginVertical: 2.5 },
	imageHolder: { borderRadius: 40, height: 80, margin: 5, overflow: 'hidden', width: 80 },
	requestInfo: { fontFamily: 'appFont', fontSize: 20, padding: 10, width: width - 100 },
	requestActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
	requestAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: 80 },
	requestActionHeader: { fontSize: 10 },

	// client's appointments

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', height: 30, marginVertical: 5, marginHorizontal: 20 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },

	// hidden boxes
	// add box
	addBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '100%', justifyContent: 'space-around', paddingVertical: 10, width: '100%' },
	addHeader: { fontSize: 20, fontWeight: 'bold' },
	addInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, fontSize: 13, padding: 2, width: '90%' },
	cameraContainer: { alignItems: 'center', marginVertical: 10, width: '100%' },
	cameraHeader: { fontWeight: 'bold', paddingVertical: 5 },
	addOption: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 2 },
	addOptionHeader: { fontSize: 13 },
	options: {  },
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
	camera: { height: width * 0.3, width: width * 0.3 },
	errorMsg: { color: 'red', fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
	addActions: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	addAction: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 100 },
})
