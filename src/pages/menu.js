import React, { useState, useEffect } from 'react'
import { ActivityIndicator, Dimensions, View, FlatList, Text, TextInput, Image, TouchableOpacity, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, ScrollView, StyleSheet, Modal } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { logo_url } from '../../assets/info'
import { getLocationProfile } from '../apis/locations'
import { getMenus, addNewMenu, removeMenu, getMenuInfo, saveMenu } from '../apis/menus'
import { getProducts, getProductInfo, removeProduct } from '../apis/products'
import { getServices, getServiceInfo, removeService } from '../apis/services'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - offsetPadding
const frameSize = width * 0.9

const fsize = p => {
	return width * p
}

export default function menu(props) {
	const { refetch } = props.route.params

	const [locationType, setLocationtype] = useState('')

	const [menus, setMenus] = useState([
		{
			key: "menu-0",
			id: 0,
			name: "Menu #1",
			info: "this is the info for hair",
			listType: "list",
			list: [
				{ id: 1, name: "Service 1", info: "this is the info", listType: "info", price: 4.99, duration: "5 hours" },
				{ id: 2, name: "Service 2", info: "this is the info", listType: "info", price: 4.99, duration: "5 hours" },
				{ id: 3, name: "Service 3", info: "this is the info", listType: "info", price: 4.99, duration: "5 hours" }
			]
		},
		{
			key: "menu-1",
			id: 4,
			name: "Menu #2",
			info: "this is the info for wash",
			listType: "list",
			list: [
				{ id: 5, name: "Service 1", info: "this is the info", listType: "info", price: 4.99, duration: "5 hours" },
				{ id: 6, name: "Service 1", info: "this is the info", listType: "info", price: 4.99, duration: "5 hours" },
				{ id: 7, name: "Service 1", info: "this is the info", listType: "info", price: 4.99, duration: "5 hours" }
			]
		}
	])

	const [loaded, setLoaded] = useState(false)

	const [menuForm, setMenuform] = useState({ 
		show: false, type: '', id: '', 
		index: -1, name: '', info: '', 
		image: { uri: '', name: '' }, errormsg: '' 
	})

	const [createOptionbox, setCreateoptionbox] = useState({ show: false, id: -1, allow: null })
	const [removeMenuinfo, setRemovemenuinfo] = useState({ show: false, id: "", name: "" })
	const [removeServiceinfo, setRemoveserviceinfo] = useState({ show: false, id: "", name: "", info: "", image: "", price: 0 })
	const [removeProductinfo, setRemoveproductinfo] = useState({ show: false, id: "", name: "", info: "", image: "", sizes: [], others: [], options: [], price: 0 })

	const getTheLocationProfile = async() => {
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { locationid }

		setLoaded(false)
		setMenus([])

		getLocationProfile(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { type } = res.info

					setLocationtype(type)
					getAllMenus()
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					alert("an error has occurred in server")
				}
			})
	}

	// menus
	const getAllMenus = async() => {
		const locationid = await AsyncStorage.getItem("locationid")

		getMenus(locationid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					if (res.menus.length > 0) {
						setMenus(res.menus)
					}

					setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					alert("an error has occurred in server")
				}
			})
	}
	const displayList = info => {
		let { id, image, name, list, listType, left } = info
		let add = name ? true : false

		return (
			<View style={{ marginLeft: left }}>
				{name ? 
					<View style={style.menu}>
						<View style={{ flexDirection: 'row' }}>
							<View style={style.menuImageHolder}>
								<Image style={style.menuImage} source={{ uri: logo_url + image }}/>
							</View>
							<Text style={style.menuName}>{name} (Menu)</Text>
							<View style={style.menuActions}>
								<TouchableOpacity style={style.menuAction} onPress={() => props.navigation.navigate("addmenu", { parentMenuid: id, menuid: id, refetch: () => getAllMenus() })}>
									<Text style={style.menuActionHeader}>Change</Text>
								</TouchableOpacity>
								<TouchableOpacity style={style.menuAction} onPress={() => removeTheMenu(info.id)}>
									<Text style={style.menuActionHeader}>Delete</Text>
								</TouchableOpacity>
							</View>
						</View>
						{info.info ? <Text style={style.itemInfo}><Text style={{ fontWeight: 'bold' }}>More Info</Text>: {info.info}</Text> : null}
						{list.length == 0 ?
							<View style={{ alignItems: 'center', marginTop: 10 }}>
								<TouchableOpacity onPress={() => setCreateoptionbox({ show: true, id, allow: "both" })}>
									<AntDesign name="pluscircleo" size={30}/>
								</TouchableOpacity>
							</View>
							:
							list.map((info, index) => (
								<View key={"list-" + index} style={{ marginBottom: (list.length - 1 == index && info.listType != "list") ? 50 : 0 }}>
									{info.listType == "list" ? 
										displayList({ id: info.id, name: info.name, image: info.image, list: info.list, listType: info.listType, left: left + 10 })
										:
										<View style={style.item}>
											<View style={{ flexDirection: 'row', }}>
												<View style={style.itemImageHolder}>
													<Image style={style.itemImage} source={{ uri: logo_url + info.image }}/>
												</View>
												<Text style={style.itemHeader}>{info.name}</Text>
												<Text style={style.itemHeader}>{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</Text>
												{info.listType == "service" && <Text style={style.itemHeader}>{info.duration}</Text>}
											</View>
											{info.info ? <Text style={style.itemInfo}><Text style={{ fontWeight: 'bold' }}>More Info</Text>: {info.info}</Text> : null}
											<View style={style.itemActions}>
												<TouchableOpacity style={style.itemAction} onPress={() => {
													if (locationType == "salon") {
														props.navigation.navigate("addservice", { parentMenuid: id, serviceid: info.id, refetch: () => getAllMenus() })
													} else {
														props.navigation.navigate("addproduct", { parentMenuid: id, productid: info.id, refetch: () => getAllMenus() })
													}
												}}>
													<Text style={style.itemActionHeader}>Change</Text>
												</TouchableOpacity>
												<TouchableOpacity style={style.itemAction} onPress={() => {
													if (locationType == "salon") {
														removeTheService(info.id)
													} else {
														removeTheProduct(info.id)
													}
												}}>
													<Text style={style.itemActionHeader}>Delete</Text>
												</TouchableOpacity>
											</View>
										</View>
									}

									{(list.length - 1 == index && info.listType != "list") && (
										<View style={{ alignItems: 'center', backgroundColor: 'white', paddingVertical: 10 }}>
											<TouchableOpacity onPress={() => setCreateoptionbox({ show: true, id, allow: "one" })}>
												<AntDesign name="pluscircleo" size={30}/>
											</TouchableOpacity>
										</View>
									)}
								</View>
							))
						}
					</View>
					:
					list.map((info, index) => (
						<View key={"list-" + index} style={{ marginBottom: (list.length - 1 == index && info.listType != "list") ? 50 : 0 }}>
							{info.listType == "list" ? 
								displayList({ id: info.id, name: info.name, image: info.image, list: info.list, listType: info.listType, left: left + 10 })
								:
								<View style={style.item}>
									<View style={{ flexDirection: 'row', }}>
										<View style={style.itemImageHolder}>
											<Image style={style.itemImage} source={{ uri: logo_url + info.image }}/>
										</View>
										<Text style={style.itemHeader}>{info.name}</Text>
										<Text style={style.itemHeader}>{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</Text>
										{info.listType == "service" && <Text style={style.itemHeader}>{info.duration}</Text>}
									</View>
									{info.info ? <Text style={style.itemInfo}><Text style={{ fontWeight: 'bold' }}>More Info</Text>: {info.info}</Text> : null}
									<View style={style.itemActions}>
										<TouchableOpacity style={style.itemAction} onPress={() => {
											if (locationType == "salon") {
												props.navigation.navigate("addservice", { parentMenuid: id, serviceid: info.id, refetch: () => getAllMenus() })
											} else {
												props.navigation.navigate("addproduct", { parentMenuid: id, productid: info.id, refetch: () => getAllMenus() })
											}
										}}>
											<Text style={style.itemActionHeader}>Change</Text>
										</TouchableOpacity>
										<TouchableOpacity style={style.itemAction} onPress={() => {
											if (locationType == "salon") {
												removeTheService(info.id)
											} else {
												removeTheProduct(info.id)
											}
										}}>
											<Text style={style.itemActionHeader}>Delete</Text>
										</TouchableOpacity>
									</View>
								</View>
							}

							{(list.length - 1 == index && info.listType != "list") && (
								<View style={{ alignItems: 'center', backgroundColor: 'white', paddingVertical: 10 }}>
									<TouchableOpacity onPress={() => setCreateoptionbox({ show: true, id, allow: "one" })}>
										<AntDesign name="pluscircleo" size={30}/>
									</TouchableOpacity>
								</View>
							)}
						</View>
					))
				}
			</View>
		)
	}

	const removeTheMenu = id => {
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
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						
					} else {
						alert("an error has occurred in server")
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
						getTheLocationProfile()
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						
					} else {
						alert("an error has occurred in server")
					}
				})
		}
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
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						
					} else {
						alert("an error has occurred in server")
					}
				})
		} else {
			removeProduct(id)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) getTheLocationProfile()
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {

					} else {
						alert("an error has occurred in server")
					}
				})
		}
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
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						
					} else {
						alert("an error has occurred in server")
					}
				})
		} else {
			removeService(id)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						getTheLocationProfile()
						setRemoveserviceinfo({ show: false, id: "", name: "", info: "", price: 0, image: "", duration: "" })
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						
					} else {
						alert("an error has occurred in server")
					}
				})
		}
	}
	
	useEffect(() => getTheLocationProfile(), [])
	
	return (
		<View style={style.menuBox}>
			{loaded ? 
				<View style={style.box}>
					<ScrollView style={{ height: '90%', width: '100%' }}>
						<View style={{ paddingVertical: 10 }}>
							{displayList({ name: "", image: "", list: menus, listType: "list", left: 0 })}
						</View>

						<View style={{ alignItems: 'center', marginVertical: 50 }}>
							<TouchableOpacity onPress={() => setCreateoptionbox({ show: true, id: "", allow: "both" })}>
								<AntDesign name="pluscircleo" size={40}/>
							</TouchableOpacity>
						</View>
					</ScrollView>

					<View style={style.bottomNavs}>
						<View style={style.bottomNavsRow}>
							<TouchableOpacity style={style.bottomNav} onPress={() => props.navigation.navigate("settings", { refetch: () => getTheLocationProfile() })}>
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
										routes: [{ name: 'auth' }]
									})
								);
							}}>
								<Text style={style.bottomNavHeader}>Log-Out</Text>
							</TouchableOpacity>
						</View>
					</View>

					{createOptionbox.show && (
						<Modal transparent={true}>
							<View style={style.createOptionContainer}>
								<View style={style.createOptionBox}>
									<TouchableOpacity style={style.createOptionClose} onPress={() => setCreateoptionbox({ show: false, id: -1 })}>
										<AntDesign name="close" size={30}/>
									</TouchableOpacity>
									<View style={style.createOptionActions}>
										{createOptionbox.allow == "both" && (
											<TouchableOpacity style={style.createOptionAction} onPress={() => {
												setCreateoptionbox({ show: false, id: -1 })

												props.navigation.navigate(
													"addmenu", 
													{ parentMenuid: createOptionbox.id, menuid: null, refetch: () => getAllMenus() }
												)
											}}>
												<Text style={style.createOptionActionHeader}>Add menu</Text>
											</TouchableOpacity>
										)}
											
										<TouchableOpacity style={style.createOptionAction} onPress={() => {
											setCreateoptionbox({ show: false, id: -1 })

											if (locationType == "salon") {
												props.navigation.navigate(
													"addservice", 
													{ parentMenuid: createOptionbox.id, serviceid: null, refetch: () => getAllMenus() }
												)
											} else {
												props.navigation.navigate(
													"addproduct", 
													{ parentMenuid: createOptionbox.id, productid: null, refetch: () => getAllMenus() }
												)
											}
										}}>
											<Text style={style.createOptionActionHeader}>Add {locationType == "salon" ? "service" : "product"}</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
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

									<Text style={style.menuInfoHeader}>Are you sure you want to delete this menu and its items</Text>

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
									<Text style={style.serviceInfoPrice}><Text style={{ fontWeight: 'bold' }}>Price: </Text>$ {(removeServiceinfo.price).toFixed(2)}</Text>
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
				:
				<ActivityIndicator size="large" marginTop={(height / 2) - offsetPadding}/>
			}
		</View>
	)
}

const style = StyleSheet.create({
	menuBox: { backgroundColor: 'white', height: '100%', paddingBottom: offsetPadding, width: '100%' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	
	menu: { backgroundColor: 'white', padding: 3, width: '98%' },
	menuImageHolder: { borderRadius: fsize(0.1) / 2, height: fsize(0.1), overflow: 'hidden', width: fsize(0.1) },
	menuImage: { height: fsize(0.1), width: fsize(0.1) },
	menuName: { fontSize: fsize(0.04), fontWeight: 'bold', marginLeft: 5, textDecorationLine: 'underline' },
	menuActions: { flexDirection: 'row' },
	menuAction: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginLeft: 10, padding: 3 },
	menuActionHeader: { fontSize: fsize(0.04), textAlign: 'center' },
	item: { backgroundColor: 'white', paddingHorizontal: 3, paddingVertical: 10, width: '98%' },
	itemImageHolder: { borderRadius: fsize(0.1) / 2, height: fsize(0.1), margin: 5, overflow: 'hidden', width: fsize(0.1) },
	itemImage: { height: fsize(0.1), width: fsize(0.1) },
	itemHeader: { fontSize: fsize(0.04), fontWeight: 'bold', marginRight: 20, paddingTop: fsize(0.04), textDecorationStyle: 'solid' },
	itemInfo: { marginLeft: 10, marginVertical: 10 },
	itemActions: { flexDirection: 'row' },
	itemAction: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginLeft: 10, padding: 3 },
	itemActionHeader: { fontSize: fsize(0.04), textAlign: 'center' },

	actionsHolder: { flexDirection: 'column', height: '100%', justifyContent: 'space-around' },
	actions: { alignItems: 'center', width: '100%' },
	action: { alignItems: 'center', backgroundColor: 'white', borderRadius: 15, borderStyle: 'solid', borderWidth: 1, marginHorizontal: 5, marginVertical: 30, padding: 10, width: 200 },
	actionHeader: { color: 'black', fontFamily: 'appFont', fontSize: fsize(0.06) },

	addTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, padding: 5, width: 200 },
	addTouchHeader: { fontSize: fsize(0.05), textAlign: 'center' },
	row: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },

	// hidden boxes

	// create options
	createOptionContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	createOptionBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', padding: 10, width: '80%' },
	createOptionClose: { borderRadius: 18, borderStyle: 'solid', borderWidth: 2 },
	createOptionActions: { flexDirection: 'column', height: '50%', justifyContent: 'space-around' },
	createOptionAction: { borderRadius: 3, borderStyle: 'solid', borderWidth: 1, padding: 10 },
	createOptionActionHeader: { textAlign: 'center' },

	// remove menu confirmation
	menuInfoContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	menuInfoBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-between', padding: 10, width: '80%' },
	menuInfoBoxHeader: { fontSize: fsize(0.05), textAlign: 'center' },
	menuInfoImageHolder: { borderRadius: 100, height: fsize(0.5), overflow: 'hidden', width: fsize(0.5) },
	menuInfoImage: { height: fsize(0.5), width: fsize(0.5) },
	menuInfoName: { fontSize: fsize(0.07), fontWeight: 'bold' },
	menuInfoInfo: { fontSize: fsize(0.05) },
	menuInfoHeader: { fontSize: fsize(0.04), fontWeight: 'bold', paddingHorizontal: 10, textAlign: 'center' },
	menuInfoActions: { flexDirection: 'row', justifyContent: 'space-around' },
	menuInfoAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 10, padding: 5, width: fsize(0.2) },
	menuInfoActionHeader: { textAlign: 'center' },

	// remove product confirmation
	productInfoContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	productInfoBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-between', padding: 10, width: '80%' },
	productInfoBoxHeader: { fontSize: fsize(0.05), textAlign: 'center' },
	productInfoImageHolder: { borderRadius: 100, height: 200, overflow: 'hidden', width: 200 },
	productInfoImage: { height: 200, width: 200 },
	productInfoName: { fontSize: fsize(0.06), fontWeight: 'bold' },
	productInfoQuantity: {  },
	productInfoPrice: { fontSize: fsize(0.06) },
	productInfoOrderers: { fontWeight: 'bold' },
	productInfoHeader: { fontSize: fsize(0.04), fontWeight: 'bold', paddingHorizontal: 10, textAlign: 'center' },
	productInfoActions: { flexDirection: 'row', justifyContent: 'space-around' },
	productInfoAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 10, padding: 5, width: 70 },
	productInfoActionHeader: { textAlign: 'center' },

	// remove service confirmation
	serviceInfoContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	serviceInfoBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-between', padding: 10, width: '80%' },
	serviceInfoBoxHeader: { fontSize: fsize(0.05), textAlign: 'center' },
	serviceInfoImageHolder: { borderRadius: 100, height: 200, overflow: 'hidden', width: 200 },
	serviceInfoImage: { height: 200, width: 200 },
	serviceInfoName: { fontSize: fsize(0.06), fontWeight: 'bold' },
	serviceInfoQuantity: { fontSize: fsize(0.06) },
	serviceInfoPrice: { fontSize: fsize(0.06) },
	serviceInfoOrderers: { fontWeight: 'bold' },
	serviceInfoHeader: { fontSize: fsize(0.04), fontWeight: 'bold', paddingHorizontal: 10, textAlign: 'center' },
	serviceInfoActions: { flexDirection: 'row', justifyContent: 'space-around' },
	serviceInfoAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 10, padding: 5, width: 70 },
	serviceInfoActionHeader: { textAlign: 'center' },
})
