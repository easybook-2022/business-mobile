import React, { useState, useEffect } from 'react'
import { ActivityIndicator, Dimensions, View, FlatList, Text, TextInput, Image, TouchableOpacity, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, ScrollView, StyleSheet, Modal } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker';
import { logo_url } from '../../assets/info'
import { getLocationProfile } from '../apis/locations'
import { getMenus, addNewMenu, removeMenu, getMenuInfo, saveMenu, uploadMenu, deleteMenu } from '../apis/menus'
import { getProducts, getProductInfo, removeProduct } from '../apis/products'
import { getServices, getServiceInfo, removeService } from '../apis/services'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight

const fsize = p => {
	return width * p
}

export default function menu(props) {
	const { refetch } = props.route.params

	const [cameraPermission, setCamerapermission] = useState(null);
	const [pickingPermission, setPickingpermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)

	const [locationType, setLocationtype] = useState('')

	const [menuInfo, setMenuinfo] = useState({ type: '', items: [] })

	const [loaded, setLoaded] = useState(false)

	const [menuForm, setMenuform] = useState({ 
		show: false, type: '', id: '', 
		index: -1, name: '', info: '', 
		image: { uri: '', name: '' }, errormsg: '' 
	})

	const [createOptionbox, setCreateoptionbox] = useState({ show: false, id: -1, allow: null })
	const [uploadMenubox, setUploadmenubox] = useState({ show: false, action: '', uri: '', name: '' })
	const [menuPhotooption, setMenuphotooption] = useState({ show: false, action: '', photo: '' })
	const [removeMenuinfo, setRemovemenuinfo] = useState({ show: false, id: "", name: "" })
	const [removeServiceinfo, setRemoveserviceinfo] = useState({ show: false, id: "", name: "", info: "", image: "", price: 0 })
	const [removeProductinfo, setRemoveproductinfo] = useState({ show: false, id: "", name: "", info: "", image: "", sizes: [], others: [], options: [], price: 0 })

	const getTheLocationProfile = async() => {
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { locationid }

		setLoaded(false)

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
					const { type, menus } = res

					setMenuinfo({ type, items: menus })
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

	const snapPhoto = async() => {
		let letters = [
			"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", 
			"n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
		]
		let photo_name_length = Math.floor(Math.random() * (15 - 10)) + 10
		let char = "", captured, self = this

		if (camComp) {
			let options = { quality: 0, skipProcessing: true };
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
				setUploadmenubox({ ...uploadMenubox, uri: `${FileSystem.documentDirectory}/${char}.jpg`, name: `${char}.jpg` })
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
				setUploadmenubox({ ...uploadMenubox, uri: `${FileSystem.documentDirectory}/${char}.jpg`, name: `${char}.jpg` })
			})
		}
	}
	const uploadMenuphoto = async() => {
		const locationid = await AsyncStorage.getItem("locationid")
		const { uri, name } = uploadMenubox
		const image = { uri, name }
		const data = { locationid, image, permission: cameraPermission || pickingPermission }

		uploadMenu(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setMenuinfo({ ...menuInfo, type: "photos", items: res.menus })
					setUploadmenubox({ show: false, action: '', uri: '', name: '' })
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { status, errormsg } = err.response.data


				}
			})
	}
	const deleteTheMenu = async() => {
		const locationid = await AsyncStorage.getItem("locationid")
		const { photo } = menuPhotooption
		const data = { locationid, photo }

		deleteMenu(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setMenuinfo({ ...menuInfo, items: res.menus })
					setMenuphotooption({ show: false, action: '', photo: '' })
				}
			})
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
	
	useEffect(() => {
		getTheLocationProfile()
		allowCamera()
		allowChoosing()
	}, [])

	return (
		<View style={style.menuBox}>
			{loaded ? 
				<View style={style.box}>
					<ScrollView style={{ height: '90%', width: '100%' }}>
						<View style={{ paddingVertical: 10 }}>
							{menuInfo.type ? 
								menuInfo.type == "photos" ? 
									<ScrollView style={{ width: '100%' }}>
										{menuInfo.items.map(info => (
											<View key={info.key} style={style.menuRow}>
												{info.row.map(item => (
													<View key={item.key} style={style.menuPhoto}>
														<Image style={{ height: '100%', width: '100%' }} source={{ uri: logo_url + item.photo }}/>

														{item.photo && (
															<View style={style.menuPhotoActions}>
																<TouchableOpacity style={style.menuPhotoAction} onPress={() => setMenuphotooption({ ...menuPhotooption, show: true, action: 'delete', photo: item.photo })}>
																	<Text style={style.menuPhotoActionHeader}>Delete</Text>
																</TouchableOpacity>
																<TouchableOpacity style={style.menuPhotoAction} onPress={() => setMenuphotooption({ ...menuPhotooption, show: true, action: '', photo: item.photo })}>
																	<Text style={style.menuPhotoActionHeader}>See</Text>
																</TouchableOpacity>
															</View>
														)}
													</View>
												))}
											</View>
										))}
									</ScrollView>
									:
									displayList({ name: "", image: "", list: menuInfo.list, listType: "list", left: 0 })
							: null }
						</View>

						<View style={{ alignItems: 'center', marginVertical: 20 }}>
							{!menuInfo.type ? 
								<>
									<TouchableOpacity style={style.menuStart} onPress={() => setCreateoptionbox({ show: true, id: "", allow: "both" })}>
										<Text style={style.menuStartHeader}>Click to add menu/{locationType == "salon" ? "service" : "food"}</Text>
									</TouchableOpacity>
									<Text style={{ fontSize: fsize(0.07), fontWeight: 'bold', marginVertical: 20 }}>Or</Text>
									<TouchableOpacity style={style.menuStart} onPress={() => setUploadmenubox({ show: true, uri: '', name: '' })}>
										<Text style={style.menuStartHeader}>Upload menu photo</Text>
									</TouchableOpacity>
								</>
								:
								menuInfo.type == "list" ? 
									<TouchableOpacity onPress={() => setCreateoptionbox({ show: true, id: "", allow: "both" })}>
										<AntDesign name="pluscircleo" size={40}/>
									</TouchableOpacity>
									:
									<TouchableOpacity onPress={() => setUploadmenubox({ show: true, uri: '', name: '' })}>
										<AntDesign name="pluscircleo" size={40}/>
									</TouchableOpacity>
							}
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
											<Text style={style.createOptionActionHeader}>Add {locationType == "salon" ? "service" : "food"}</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</Modal>
					)}
					{uploadMenubox.show && (
						<Modal transparent={true}>
							<View style={style.uploadMenuContainer}>
								{!uploadMenubox.action ? 
									<View style={style.uploadMenuBox}>
										<TouchableOpacity style={style.uploadMenuClose} onPress={() => setUploadmenubox({ show: false, uri: '', name: '' })}>
											<AntDesign name="close" size={30}/>
										</TouchableOpacity>
										<View style={style.uploadMenuActions}>
											<TouchableOpacity style={style.uploadMenuAction} onPress={() => setUploadmenubox({ ...uploadMenubox, action: 'camera' })}>
												<Text style={style.uploadMenuActionHeader}>Take a photo</Text>
											</TouchableOpacity>
											<TouchableOpacity style={style.uploadMenuAction} onPress={() => choosePhoto()}>
												<Text style={style.uploadMenuActionHeader}>Choose from phone</Text>
											</TouchableOpacity>
										</View>
									</View>
									:
									uploadMenubox.action == 'camera' ? 
										<View style={style.uploadMenuCameraContainer}>
											{!uploadMenubox.uri ? 
												<Camera 
													style={style.uploadMenuCamera} 
													type={Camera.Constants.Type.back} ref={r => { setCamcomp(r) }}
													ratio="1:1"
												/>
												:
												<View style={style.uploadMenuCamera}>
													<Image style={{ height: '100%', width: '100%' }} source={{ uri: uploadMenubox.uri }}/>
												</View>
											}

											{!uploadMenubox.uri ? 
												<View style={style.uploadMenuCameraActions}>
													<TouchableOpacity style={style.uploadMenuCameraAction} onPress={() => choosePhoto()}>
														<Text style={style.uploadMenuCameraActionHeader}>Choose instead</Text>
													</TouchableOpacity>
													<TouchableOpacity style={style.uploadMenuCameraAction} onPress={snapPhoto.bind(this)}>
														<Text style={style.uploadMenuCameraActionHeader}>Take photo</Text>
													</TouchableOpacity>
												</View>
												:
												<View style={style.uploadMenuCameraActions}>
													<TouchableOpacity style={style.uploadMenuCameraAction} onPress={() => setUploadmenubox({ ...uploadMenubox, action: '', uri: '', name: '' })}>
														<Text style={style.uploadMenuCameraActionHeader}>Cancel</Text>
													</TouchableOpacity>
													<TouchableOpacity style={style.uploadMenuCameraAction} onPress={() => setUploadmenubox({ ...uploadMenubox, uri: '', name: '' })}>
														<Text style={style.uploadMenuCameraActionHeader}>Retake</Text>
													</TouchableOpacity>
													<TouchableOpacity style={style.uploadMenuCameraAction} onPress={() => uploadMenuphoto()}>
														<Text style={style.uploadMenuCameraActionHeader}>Done</Text>
													</TouchableOpacity>
												</View>
											}
										</View>
									: null
								}
							</View>
						</Modal>
					)}
					{menuPhotooption.show && (
						<Modal transparent={true}>
							<View style={style.menuPhotoOptionContainer}>
								<View style={style.menuPhotoOptionPhoto}>
									<Image style={{ height: '100%', width: '100%' }} source={{ uri: logo_url + menuPhotooption.photo }}/>
								</View>

								{menuPhotooption.action == "delete" ? 
									<View style={style.menuPhotoOptionBottomContainer}>
										<Text style={style.menuPhotoOptionActionsHeader}>
											Are you sure you want to delete{'\n'}this menu ?
										</Text>
										<View style={style.menuPhotoOptionActions}>
											<TouchableOpacity style={style.menuPhotoOptionAction} onPress={() => setMenuphotooption({ ...menuPhotooption, show: false, action: '', photo: '' })}>
												<Text style={style.menuPhotoOptionActionHeader}>No</Text>
											</TouchableOpacity>
											<TouchableOpacity style={style.menuPhotoOptionAction} onPress={() => deleteTheMenu()}>
												<Text style={style.menuPhotoOptionActionHeader}>Yes</Text>
											</TouchableOpacity>
										</View>
									</View>
									:
									<View style={style.menuPhotoOptionBottomContainer}>
										<TouchableOpacity style={style.menuPhotoOptionAction} onPress={() => setMenuphotooption({ ...menuPhotooption, show: false, action: '', photo: '' })}>
											<Text style={style.menuPhotoOptionActionHeader}>Close</Text>
										</TouchableOpacity>
									</View>
								}
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
				<View style={{ alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' }}>
					<ActivityIndicator color="black" size="large"/>
				</View>
			}
		</View>
	)
}

const style = StyleSheet.create({
	menuBox: { backgroundColor: 'white', height: '100%', paddingBottom: offsetPadding, width: '100%' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

	menuRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 5 },
	menuPhoto: { height: height * 0.3, width: width * 0.3 },
	menuPhotoActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: -30 },
	menuPhotoAction: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 3 },
	menuPhotoActionHeader: { textAlign: 'center' },
	menuStart: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
	menuStartHeader: { fontSize: fsize(0.05), textAlign: 'center' },

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
	createOptionActionHeader: { fontSize: fsize(0.08), textAlign: 'center' },

	// menu photo option
	menuPhotoOptionContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	menuPhotoOptionPhoto: { height: '80%', width: '80%' },
	menuPhotoOptionBottomContainer: { alignItems: 'center', backgroundColor: 'white', width: '90%' },
	menuPhotoOptionActionsHeader: { color: 'black', fontSize: fsize(0.05), textAlign: 'center' },
	menuPhotoOptionActions: { flexDirection: 'row', justifyContent: 'space-around' },
	menuPhotoOptionAction: { borderColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 3, width: 100 },
	menuPhotoOptionActionHeader: { color: 'black', fontSize: fsize(0.05), textAlign: 'center' },

	// upload menu
	uploadMenuContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	uploadMenuBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', padding: 10, width: '80%' },
	uploadMenuClose: { borderRadius: 18, borderStyle: 'solid', borderWidth: 2 },
	uploadMenuActions: { flexDirection: 'column', height: '50%', justifyContent: 'space-around' },
	uploadMenuAction: { borderRadius: 3, borderStyle: 'solid', borderWidth: 1, padding: 10 },
	uploadMenuActionHeader: { fontSize: fsize(0.08), textAlign: 'center' },
	uploadMenuCameraContainer: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	uploadMenuCamera: { height: '80%', width: '80%' },
	uploadMenuCameraActions: { bottom: 0, flexDirection: 'row', justifyContent: 'space-around', position: 'absolute' },
	uploadMenuCameraAction: { borderColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: fsize(0.2) },
	uploadMenuCameraActionHeader: { color: 'black', textAlign: 'center' },

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
