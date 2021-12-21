import React, { useState, useEffect } from 'react'
import { ActivityIndicator, Dimensions, View, FlatList, Text, TextInput, Image, TouchableOpacity, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, ScrollView, StyleSheet, Modal } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { logo_url } from '../../assets/info'
import { getInfo } from '../apis/locations'
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
	const { menuid, refetch } = props.route.params

	const [menuName, setMenuname] = useState('')
	const [menuInfo, setMenuinfo] = useState('')
	const [locationType, setLocationtype] = useState('')

	const [showMenus, setShowmenus] = useState(false)
	const [menus, setMenus] = useState([])
	const [numMenus, setNummenus] = useState(0)

	const [showProducts, setShowproducts] = useState(false)
	const [products, setProducts] = useState([])
	const [numProducts, setNumproducts] = useState(0)

	const [showServices, setShowservices] = useState(false)
	const [services, setServices] = useState([])
	const [numServices, setNumservices] = useState(0)
	const [noDisplay, setNodisplay] = useState(false)

	const [loaded, setLoaded] = useState(false)

	const [menuForm, setMenuform] = useState({ 
		show: false, type: '', id: '', 
		index: -1, name: '', info: '', 
		image: { uri: '', name: '' }, errormsg: '' 
	})
	const [removeMenuinfo, setRemovemenuinfo] = useState({ show: false, id: "", name: "" })
	const [removeServiceinfo, setRemoveserviceinfo] = useState({ show: false, id: "", name: "", info: "", image: "", price: 0 })
	const [removeProductinfo, setRemoveproductinfo] = useState({ show: false, id: "", name: "", info: "", image: "", sizes: [], others: [], options: [], price: 0 })

	const getTheInfo = async() => {
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { locationid, menuid }

		setLoaded(false)
		setNodisplay(false)
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
					} else {
						setNodisplay(true)
						setLoaded(true)
					}
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
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
					setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				}
			})
	}
	const addTheNewMenu = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const locationid = await AsyncStorage.getItem("locationid")
		const { name, info, image } = menuForm
		const data = { ownerid, locationid, parentMenuid: menuid, name, info, image, permission: cameraPermission || pickingPermission }

		addNewMenu(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
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
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data

					setMenuform({
						...menuForm,
						errormsg
					})
				}
			})
	}
	const removeTheMenu = (id) => {
		if (!removeMenuinfo.show) {
			const data = { parentMenuid: menuid, menuid: id }

			getMenuInfo(data)
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
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						
					}
				})
		}
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
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				}
			})
	}

	// products
	const getAllProducts = async() => {
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { locationid, menuid }

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
					setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
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
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						
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
					if (res) getTheInfo()
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {

					}
				})
		}
	}

	// services
	const getAllServices = async() => {
		const userid = await AsyncStorage.getItem("userid")
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { userid, locationid, menuid }

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
					setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
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
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						
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
						getTheInfo()
						setRemoveserviceinfo({ show: false, id: "", name: "", info: "", price: 0, image: "", duration: "" })
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						
					}
				})
		}
	}
	
	useEffect(() => {
		getTheInfo()
	}, [])

	return (
		<View style={style.boxContainer}>
			{loaded ? 
				<View style={style.box}>
					<View style={style.menuBox}>
						{noDisplay ? 
							<View style={style.headers}>
								<Text style={style.header}>Nothing is here ):</Text>
							</View>
							:
							<View style={style.headers}>
								<Text style={[style.header, { fontFamily: 'appFont' }]}>{menuName}</Text>
								<Text style={style.header}>{menuInfo}</Text>
							</View>
						}
					</View>

					<View style={style.body}>
						{noDisplay ? 
							<View style={style.actionsHolder}>
								<View style={style.actions}>
									<TouchableOpacity style={style.action} onPress={() => props.navigation.navigate("addmenu", { parentMenuid: menuid, menuid: null, refetch: () => getTheInfo() })}>
										<Text style={style.actionHeader}>Add a Menu</Text>
									</TouchableOpacity>
										
									<TouchableOpacity style={style.action} onPress={() => props.navigation.navigate("addproduct", { parentMenuid: menuid, productid: null, refetch: () => getTheInfo() })}>
										<Text style={style.actionHeader}>Add a Product</Text>
									</TouchableOpacity>

									<TouchableOpacity style={style.action} onPress={() => props.navigation.navigate("addservice", { parentMenuid: menuid, serviceid: null, refetch: () => getTheInfo() })}>
										<Text style={style.actionHeader}>Add a Service</Text>
									</TouchableOpacity>
								</View>
							</View>
							:
							<>
								{showMenus && (
									<View style={{ alignItems: 'center' }}>
										<TouchableOpacity style={style.addTouch} onPress={() => props.navigation.navigate("addmenu", { parentMenuid: menuid, menuid: null, refetch: () => getTheInfo() })}>
											<Text style={style.addTouchHeader}>Add a new menu</Text>
										</TouchableOpacity>

										<FlatList
											data={menus}
											style={{ height: screenHeight - 170, width: '100%' }}
											renderItem={({ item, index }) =>
												<View style={style.row} key={item.key}>
													{item.row.map(info => (
														info.id ?
															<View key={info.key} style={style.menu}>
																<Text style={style.menuHeader}>{info.name}</Text>
																<Text style={style.menuInfo}>{info.info ? info.info : ''}</Text>
																<Image source={{ uri: logo_url + info.image }} style={style.menuImage}/>
																<View>
																	<TouchableOpacity style={style.menuAction} onPress={() => removeTheMenu(info.id)}>
																		<Text style={style.menuActionHeader}>Delete</Text>
																	</TouchableOpacity>
																	<TouchableOpacity style={style.menuAction} onPress={() => props.navigation.navigate("addmenu", { parentMenuid: menuid, menuid: info.id, refetch: () => getTheInfo() })}>
																		<Text style={style.menuActionHeader}>Change</Text>
																	</TouchableOpacity>
																	<TouchableOpacity style={style.menuAction} onPress={() => props.navigation.push("menu", { menuid: info.id, name: info.name, refetch: () => getTheInfo() })}>
																		<Text style={style.menuActionHeader}>Add to menu</Text>
																	</TouchableOpacity>
																</View>
															</View>
															:
															<View key={info.key} style={style.menu}>
															</View>
													))}
												</View>
											}
										/>
									</View>
								)}
								
								{showProducts && (
									<View style={{ alignItems: 'center' }}>
										<TouchableOpacity style={style.addTouch} onPress={() => props.navigation.navigate("addproduct", { parentMenuid: menuid, productid: null, refetch: () => getTheInfo() })}>
											<Text style={style.addTouchHeader}>Add a new product</Text>
										</TouchableOpacity>

										<FlatList
											data={products}
											style={{ height: screenHeight - 170, width: '100%' }}
											renderItem={({ item, index }) => 
												<View style={style.row} key={item.key}>
													{item.row.map(info => (
														info.id ? 
															<View key={info.key} style={style.product}>
																<Text style={style.productHeader}>{info.name}</Text>
																<Image source={{ uri: logo_url + info.image }} style={style.productImage}/>
																{info.price ? 
																	<Text style={style.productPrice}>$ {info.price}</Text>
																	:
																	<Text style={style.productPrice}>{info.sizes} size{info.sizes == 1 ? '' : 's'}</Text>
																}
																<View>
																	<TouchableOpacity style={style.productAction} onPress={() => removeTheProduct(info.id)}>
																		<Text style={style.productActionHeader}>Delete</Text>
																	</TouchableOpacity>
																	<TouchableOpacity style={style.productAction} onPress={() => props.navigation.navigate("addproduct", { parentMenuid: menuid, productid: info.id, refetch: () => getAllProducts() })}>
																		<Text style={style.productActionHeader}>Change</Text>
																	</TouchableOpacity>
																</View>
															</View>
															:
															<View key={info.key} style={style.product}></View>
													))}
												</View>
											}
										/>
									</View>
								)}

								{showServices && (
									<View style={{ alignItems: 'center' }}>
										<TouchableOpacity style={style.addTouch} onPress={() => props.navigation.navigate("addservice", { parentMenuid: menuid, serviceid: null, refetch: () => getTheInfo() })}>
											<Text style={style.addTouchHeader}>Add a new service</Text>
										</TouchableOpacity>

										<FlatList
											data={services}
											style={{ height: screenHeight - 170, width: '100%' }}
											renderItem={({ item, index }) => 
												<View key={item.key} style={style.service}>
													<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
														<View style={{ alignItems: 'center' }}>
															<Text style={style.serviceHeader}>{item.name}</Text>
															<Image source={{ uri: logo_url + item.image }} style={style.serviceImage}/>
														</View>

														<View>
															<Text style={style.serviceInfo}>Price: <Text style={{ fontWeight: '400' }}>$ {item.price}</Text></Text>
															<Text style={style.serviceInfo}>Time: <Text style={{ fontWeight: '400' }}>{item.duration}</Text></Text>
														</View>
													</View>

													{item.info ? <Text style={style.serviceInfo}>Information: <Text style={{ fontWeight: '400' }}>{item.info}</Text></Text> : null}

													<View style={{ alignItems: 'center' }}>
														<View style={style.serviceActions}>
															<TouchableOpacity style={style.serviceAction} onPress={() => removeTheService(item.id)}>
																<Text style={style.serviceActionHeader}>Delete</Text>
															</TouchableOpacity>
															<TouchableOpacity style={style.serviceAction} onPress={() => props.navigation.navigate("addservice", { parentMenuid: menuid, serviceid: item.id, refetch: () => getAllServices() })}>
																<Text style={style.serviceActionHeader}>Change</Text>
															</TouchableOpacity>
														</View>
													</View>
												</View>
											}
										/>
									</View>
								)}
							</>
						}
					</View>

					<View style={style.bottomNavs}>
						<View style={style.bottomNavsRow}>
							<TouchableOpacity style={style.bottomNav} onPress={() => props.navigation.navigate("settings", { refetch: () => getTheInfo() })}>
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
				:
				<ActivityIndicator size="large" marginTop={(height / 2) - offsetPadding}/>
			}
		</View>
	)
}

const style = StyleSheet.create({
	boxContainer: { height: '100%', paddingBottom: offsetPadding, width: '100%' },
	box: { backgroundColor: 'white', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

	body: { height: screenHeight - 176 },

	menuBox: { height: 60 },

	headers: { paddingVertical: 5 },
	header: { fontWeight: 'bold', fontSize: fsize(0.05), textAlign: 'center' },

	actionsHolder: { flexDirection: 'column', height: '100%', justifyContent: 'space-around' },
	actions: { alignItems: 'center', width: '100%' },
	action: { alignItems: 'center', backgroundColor: 'white', borderRadius: 15, borderStyle: 'solid', borderWidth: 1, marginHorizontal: 5, marginVertical: 30, padding: 10, width: 200 },
	actionHeader: { color: 'black', fontFamily: 'appFont', fontSize: fsize(0.06) },

	addTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, padding: 5, width: 200 },
	addTouchHeader: { fontSize: fsize(0.05), textAlign: 'center' },
	row: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },

	menu: { alignItems: 'center', marginHorizontal: 20, marginBottom: 15, width: width / 2 },
	menuHeader: { fontSize: fsize(0.06), fontWeight: 'bold', paddingVertical: 15 },
	menuImage: { backgroundColor: 'black', borderRadius: 50, height: 100, width: 100 },
	menuAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 5, padding: 5 },
	menuActionHeader: { fontSize: fsize(0.05), textAlign: 'center' },

	product: { alignItems: 'center', marginHorizontal: 20, marginBottom: 15, width: width / 2 },
	productHeader: { fontSize: fsize(0.06), fontWeight: 'bold', paddingVertical: 15 },
	productImage: { backgroundColor: 'black', borderRadius: 50, height: 100, width: 100 },
	productPrice: { fontSize: fsize(0.05), fontWeight: 'bold' },
	productAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 5, padding: 5 },
	productActionHeader: { fontSize: fsize(0.05), textAlign: 'center' },

	service: { backgroundColor: 'white', marginHorizontal: 10, marginTop: 10, padding: 20 },
	serviceHeader: { fontSize: fsize(0.05), fontWeight: 'bold', paddingVertical: 10, textAlign: 'center' },
	serviceImage: { backgroundColor: 'black', borderRadius: 50, height: 100, marginLeft: 10, width: 100 },
	serviceInfo: { fontSize: fsize(0.05), fontWeight: 'bold', marginVertical: 10 },
	serviceActions: { flexDirection: 'row', justifyContent: 'space-between', width: 180 },
	serviceAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 8, padding: 5 },
	serviceActionHeader: { fontSize: fsize(0.05), textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', height: 40, justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },

	// hidden boxes

	// remove menu confirmation
	menuInfoContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', paddingVertical: offsetPadding, width: '100%' },
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
	productInfoContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', paddingVertical: offsetPadding, width: '100%' },
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
	serviceInfoContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', paddingVertical: offsetPadding, width: '100%' },
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
