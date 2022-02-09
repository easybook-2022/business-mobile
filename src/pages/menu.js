import React, { useState, useEffect } from 'react'
import { SafeAreaView, ActivityIndicator, Platform, Dimensions, View, FlatList, Text, TextInput, Image, TouchableOpacity, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, ScrollView, StyleSheet, Modal } from 'react-native'
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
const wsize = p => {
  return width * (p / 100)
}
const hsize = p => {
  return height * (p / 100)
}

export default function Menu(props) {
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
					<View style={styles.menu}>
						<View style={{ flexDirection: 'row' }}>
							<View style={styles.menuImageHolder}>
								<Image style={styles.menuImage} source={{ uri: logo_url + image }}/>
							</View>
              <View style={styles.column}>
							 <Text style={styles.menuName}>{name} (Menu)</Text>
              </View>
              <View style={styles.column}>
  							<View style={styles.menuActions}>
  								<TouchableOpacity style={styles.menuAction} onPress={() => props.navigation.navigate("addmenu", { parentMenuid: id, menuid: id, refetch: () => getAllMenus() })}>
  									<Text style={styles.menuActionHeader}>Change</Text>
  								</TouchableOpacity>
  								<TouchableOpacity style={styles.menuAction} onPress={() => removeTheMenu(info.id)}>
  									<Text style={styles.menuActionHeader}>Delete</Text>
  								</TouchableOpacity>
  							</View>
              </View>
						</View>
						{info.info ? <Text style={[styles.itemInfo, { marginLeft: left }]}><Text style={{ fontWeight: 'bold' }}>More Info</Text>: {info.info}</Text> : null}
						{list.length == 0 ?
							<View style={{ alignItems: 'center', marginTop: 10 }}>
								<TouchableOpacity onPress={() => setCreateoptionbox({ show: true, id, allow: "both" })}>
									<AntDesign name="pluscircleo" size={wsize(7)}/>
								</TouchableOpacity>
							</View>
							:
							list.map((info, index) => (
								<View key={"list-" + index}>
									{info.listType == "list" ? 
										displayList({ id: info.id, name: info.name, image: info.image, list: info.list, listType: info.listType, left: left + 10 })
										:
										<View style={styles.item}>
											<View style={{ flexDirection: 'row' }}>
												<View style={styles.itemImageHolder}>
													<Image style={styles.itemImage} source={{ uri: logo_url + info.image }}/>
												</View>
                        <View style={styles.column}>
												  <Text style={styles.itemHeader}>{info.name}</Text>
                        </View>
                        <View style={styles.column}>
												  <Text style={styles.itemHeader}>{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</Text>
                        </View>
                        <View style={styles.column}>
												  {info.listType == "service" && <Text style={styles.itemHeader}>{info.duration}</Text>}
                        </View>
											</View>
											{info.info ? <Text style={[styles.itemInfo, { marginLeft: left }]}><Text style={{ fontWeight: 'bold' }}>More Info</Text>: {info.info}</Text> : null}
											<View style={styles.itemActions}>
												<TouchableOpacity style={styles.itemAction} onPress={() => {
													if (locationType == "salon") {
														props.navigation.navigate("addservice", { parentMenuid: id, serviceid: info.id, refetch: () => getAllMenus() })
													} else {
														props.navigation.navigate("addproduct", { parentMenuid: id, productid: info.id, refetch: () => getAllMenus() })
													}
												}}>
													<Text style={styles.itemActionHeader}>Change</Text>
												</TouchableOpacity>
												<TouchableOpacity style={styles.itemAction} onPress={() => {
													if (locationType == "salon") {
														removeTheService(info.id)
													} else {
														removeTheProduct(info.id)
													}
												}}>
													<Text style={styles.itemActionHeader}>Delete</Text>
												</TouchableOpacity>
											</View>
										</View>
									}

									{(list.length - 1 == index && info.listType != "list") && (
										<View style={{ alignItems: 'center', backgroundColor: 'white' }}>
											<TouchableOpacity onPress={() => setCreateoptionbox({ show: true, id, allow: "one" })}>
												<AntDesign name="pluscircleo" size={wsize(7)}/>
											</TouchableOpacity>
										</View>
									)}
								</View>
							))
						}
					</View>
					:
					list.map((info, index) => (
						<View key={"list-" + index}>
							{info.listType == "list" ? 
								displayList({ id: info.id, name: info.name, image: info.image, list: info.list, listType: info.listType, left: left + 10 })
								:
								<View style={styles.item}>
									<View style={{ flexDirection: 'row', }}>
										<View style={styles.itemImageHolder}>
											<Image style={styles.itemImage} source={{ uri: logo_url + info.image }}/>
										</View>
										<Text style={styles.itemHeader}>{info.name}</Text>
										<Text style={styles.itemHeader}>{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</Text>
										{info.listType == "service" && <Text style={styles.itemHeader}>{info.duration}</Text>}
									</View>
									{info.info ? <Text style={[styles.itemInfo, { marginLeft: left }]}><Text style={{ fontWeight: 'bold' }}>More Info</Text>: {info.info}</Text> : null}
									<View style={styles.itemActions}>
										<TouchableOpacity style={styles.itemAction} onPress={() => {
											if (locationType == "salon") {
												props.navigation.navigate("addservice", { parentMenuid: id, serviceid: info.id, refetch: () => getAllMenus() })
											} else {
												props.navigation.navigate("addproduct", { parentMenuid: id, productid: info.id, refetch: () => getAllMenus() })
											}
										}}>
											<Text style={styles.itemActionHeader}>Change</Text>
										</TouchableOpacity>
										<TouchableOpacity style={styles.itemAction} onPress={() => {
											if (locationType == "salon") {
												removeTheService(info.id)
											} else {
												removeTheProduct(info.id)
											}
										}}>
											<Text style={styles.itemActionHeader}>Delete</Text>
										</TouchableOpacity>
									</View>
								</View>
							}

							{(list.length - 1 == index && info.listType != "list") && (
								<View style={{ alignItems: 'center', backgroundColor: 'white', paddingVertical: 10 }}>
									<TouchableOpacity onPress={() => setCreateoptionbox({ show: true, id, allow: "one" })}>
										<AntDesign name="pluscircleo" size={wsize(7)}/>
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
			let photo_option = [{ resize: { height, width }}]
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
				} else {
          alert("server error")
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
		<SafeAreaView style={styles.menuBox}>
			{loaded ? 
				<View style={styles.box}>
					<ScrollView style={{ height: '90%', width: '100%' }}>
						<View style={{ paddingVertical: 10 }}>
							{menuInfo.type ? 
								menuInfo.type == "photos" ? 
									<ScrollView style={{ width: '100%' }}>
										{menuInfo.items.map(info => (
											<View key={info.key} style={styles.menuRow}>
												{info.row.map(item => (
													<View key={item.key} style={styles.menuPhoto}>
														<Image style={{ height: '100%', width: '100%' }} source={{ uri: logo_url + item.photo }}/>

														{item.photo && (
															<View style={styles.menuPhotoActions}>
																<TouchableOpacity style={styles.menuPhotoAction} onPress={() => setMenuphotooption({ ...menuPhotooption, show: true, action: 'delete', photo: item.photo })}>
																	<Text style={styles.menuPhotoActionHeader}>Delete</Text>
																</TouchableOpacity>
																<TouchableOpacity style={styles.menuPhotoAction} onPress={() => setMenuphotooption({ ...menuPhotooption, show: true, action: '', photo: item.photo })}>
																	<Text style={styles.menuPhotoActionHeader}>See</Text>
																</TouchableOpacity>
															</View>
														)}
													</View>
												))}
											</View>
										))}
									</ScrollView>
									:
									displayList({ name: "", image: "", list: menuInfo.items, listType: "list", left: 0 })
							: null }
						</View>

						<View style={{ alignItems: 'center', marginVertical: 20 }}>
							{!menuInfo.type ? 
								<>
									<TouchableOpacity style={styles.menuStart} onPress={() => setCreateoptionbox({ show: true, id: "", allow: "both" })}>
										<Text style={styles.menuStartHeader}>Click to add menu/{locationType == "salon" ? "service" : "food"}</Text>
									</TouchableOpacity>
									<Text style={styles.menuStartDiv}>Or</Text>
									<TouchableOpacity style={styles.menuStart} onPress={() => setUploadmenubox({ show: true, uri: '', name: '' })}>
										<Text style={styles.menuStartHeader}>Upload menu photo</Text>
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

					<View style={styles.bottomNavs}>
						<View style={styles.bottomNavsRow}>
							<TouchableOpacity style={styles.bottomNav} onPress={() => props.navigation.navigate("settings", { refetch: () => getTheLocationProfile() })}>
								<AntDesign name="setting" size={wsize(7)}/>
							</TouchableOpacity>

							<TouchableOpacity style={styles.bottomNav} onPress={() => {
								props.navigation.dispatch(
									CommonActions.reset({
										index: 1,
										routes: [{ name: 'main' }]
									})
								);
							}}>
								<Entypo name="home" size={wsize(7)}/>
							</TouchableOpacity>

							<TouchableOpacity style={styles.bottomNav} onPress={() => {
								AsyncStorage.clear()

								props.navigation.dispatch(
									CommonActions.reset({
										index: 1,
										routes: [{ name: 'auth' }]
									})
								);
							}}>
								<Text style={styles.bottomNavHeader}>Log-Out</Text>
							</TouchableOpacity>
						</View>
					</View>

					{createOptionbox.show && (
						<Modal transparent={true}>
							<SafeAreaView style={styles.createOptionContainer}>
								<View style={styles.createOptionBox}>
									<TouchableOpacity style={styles.createOptionClose} onPress={() => setCreateoptionbox({ show: false, id: -1 })}>
										<AntDesign name="close" size={wsize(7)}/>
									</TouchableOpacity>
									<View style={styles.createOptionActions}>
										{createOptionbox.allow == "both" && (
											<TouchableOpacity style={styles.createOptionAction} onPress={() => {
												setCreateoptionbox({ show: false, id: -1 })

												props.navigation.navigate(
													"addmenu", 
													{ parentMenuid: createOptionbox.id, menuid: null, refetch: () => getAllMenus() }
												)
											}}>
												<Text style={styles.createOptionActionHeader}>Add menu</Text>
											</TouchableOpacity>
										)}
											
										<TouchableOpacity style={styles.createOptionAction} onPress={() => {
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
											<Text style={styles.createOptionActionHeader}>Add {locationType == "salon" ? "service" : "food"}</Text>
										</TouchableOpacity>
									</View>
								</View>
							</SafeAreaView>
						</Modal>
					)}
					{uploadMenubox.show && (
						<Modal transparent={true}>
							<SafeAreaView style={styles.uploadMenuContainer}>
								{!uploadMenubox.action ? 
									<View style={styles.uploadMenuBox}>
										<TouchableOpacity style={styles.uploadMenuClose} onPress={() => setUploadmenubox({ show: false, uri: '', name: '' })}>
											<AntDesign name="close" size={wsize(7)}/>
										</TouchableOpacity>
										<View style={styles.uploadMenuActions}>
											<TouchableOpacity style={styles.uploadMenuAction} onPress={() => setUploadmenubox({ ...uploadMenubox, action: 'camera' })}>
												<Text style={styles.uploadMenuActionHeader}>Take a photo</Text>
											</TouchableOpacity>
											<TouchableOpacity style={styles.uploadMenuAction} onPress={() => choosePhoto()}>
												<Text style={styles.uploadMenuActionHeader}>Choose from phone</Text>
											</TouchableOpacity>
										</View>
									</View>
									:
									uploadMenubox.action == 'camera' ? 
										<View style={styles.uploadMenuCameraContainer}>
											{!uploadMenubox.uri ? 
												<Camera 
													style={styles.uploadMenuCamera} 
													type={Camera.Constants.Type.back} ref={r => { setCamcomp(r) }}
													ratio={Platform.OS === 'ios' ? "4:3" : "1:1"}
												/>
												:
												<View style={styles.uploadMenuCamera}>
													<Image style={{ height: '100%', width: '100%' }} source={{ uri: uploadMenubox.uri }}/>
												</View>
											}

											{!uploadMenubox.uri ? 
												<View style={styles.uploadMenuCameraActions}>
                          <TouchableOpacity style={styles.uploadMenuCameraAction} onPress={() => setUploadmenubox({ ...uploadMenubox, action: '' })}>
                            <Text style={styles.uploadMenuCameraActionHeader}>Cancel</Text>
                          </TouchableOpacity>
													<TouchableOpacity style={styles.uploadMenuCameraAction} onPress={() => choosePhoto()}>
														<Text style={styles.uploadMenuCameraActionHeader}>Choose instead</Text>
													</TouchableOpacity>
													<TouchableOpacity style={styles.uploadMenuCameraAction} onPress={snapPhoto.bind(this)}>
														<Text style={styles.uploadMenuCameraActionHeader}>Take photo</Text>
													</TouchableOpacity>
												</View>
												:
												<View style={styles.uploadMenuCameraActions}>
													<TouchableOpacity style={styles.uploadMenuCameraAction} onPress={() => setUploadmenubox({ ...uploadMenubox, action: '', uri: '', name: '' })}>
														<Text style={styles.uploadMenuCameraActionHeader}>Cancel</Text>
													</TouchableOpacity>
													<TouchableOpacity style={styles.uploadMenuCameraAction} onPress={() => setUploadmenubox({ ...uploadMenubox, uri: '', name: '' })}>
														<Text style={styles.uploadMenuCameraActionHeader}>Retake</Text>
													</TouchableOpacity>
													<TouchableOpacity style={styles.uploadMenuCameraAction} onPress={() => uploadMenuphoto()}>
														<Text style={styles.uploadMenuCameraActionHeader}>Done</Text>
													</TouchableOpacity>
												</View>
											}
										</View>
									: null
								}
							</SafeAreaView>
						</Modal>
					)}
					{menuPhotooption.show && (
						<Modal transparent={true}>
							<SafeAreaView style={styles.menuPhotoOptionContainer}>
								<View style={styles.menuPhotoOptionPhoto}>
									<Image style={{ height: '100%', width: '100%' }} source={{ uri: logo_url + menuPhotooption.photo }}/>
								</View>

								{menuPhotooption.action == "delete" ? 
									<View style={styles.menuPhotoOptionBottomContainer}>
										<Text style={styles.menuPhotoOptionActionsHeader}>
											Are you sure you want to delete{'\n'}this menu ?
										</Text>
										<View style={styles.menuPhotoOptionActions}>
											<TouchableOpacity style={styles.menuPhotoOptionAction} onPress={() => setMenuphotooption({ ...menuPhotooption, show: false, action: '', photo: '' })}>
												<Text style={styles.menuPhotoOptionActionHeader}>No</Text>
											</TouchableOpacity>
											<TouchableOpacity style={styles.menuPhotoOptionAction} onPress={() => deleteTheMenu()}>
												<Text style={styles.menuPhotoOptionActionHeader}>Yes</Text>
											</TouchableOpacity>
										</View>
									</View>
									:
									<View style={styles.menuPhotoOptionBottomContainer}>
										<TouchableOpacity style={styles.menuPhotoOptionAction} onPress={() => setMenuphotooption({ ...menuPhotooption, show: false, action: '', photo: '' })}>
											<Text style={styles.menuPhotoOptionActionHeader}>Close</Text>
										</TouchableOpacity>
									</View>
								}
							</SafeAreaView>
						</Modal>
					)}
					{removeMenuinfo.show && (
						<Modal transparent={true}>
							<SafeAreaView style={styles.menuInfoContainer}>
								<View style={styles.menuInfoBox}>
									<Text style={styles.menuInfoBoxHeader}>Delete menu confirmation</Text>

									<View style={{ alignItems: 'center' }}>
										<View style={styles.menuInfoImageHolder}>
											<Image source={{ uri: logo_url + removeMenuinfo.image }} style={styles.menuInfoImage}/>
										</View>
										<Text style={styles.menuInfoName}>{removeMenuinfo.name}</Text>
										<Text style={styles.menuInfoInfo}>{removeMenuinfo.info}</Text>
									</View>

									<Text style={styles.menuInfoHeader}>Are you sure you want to delete{'\n'}this menu and its items</Text>

									<View style={styles.menuInfoActions}>
										<TouchableOpacity style={styles.menuInfoAction} onPress={() => setRemovemenuinfo({ ...removeMenuinfo, show: false })}>
											<Text style={styles.menuInfoActionHeader}>Cancel</Text>
										</TouchableOpacity>
										<TouchableOpacity style={styles.menuInfoAction} onPress={() => removeTheMenu(removeMenuinfo.id)}>
											<Text style={styles.menuInfoActionHeader}>Yes</Text>
										</TouchableOpacity>
									</View>
								</View>
							</SafeAreaView>
						</Modal>
					)}
					{removeProductinfo.show && (
						<Modal transparent={true}>
							<SafeAreaView style={styles.productInfoContainer}>
								<View style={styles.productInfoBox}>
									<Text style={styles.productInfoBoxHeader}>Delete product confirmation</Text>

									<View style={styles.productInfoImageHolder}>
										<Image source={{ uri: logo_url + removeProductinfo.image }} style={styles.productInfoImage}/>
									</View>
									<Text style={styles.productInfoName}>{removeProductinfo.name}</Text>

									<View>
										{removeProductinfo.options.map((option, infoindex) => (
											<Text key={option.key} style={styles.itemInfo}>
												<Text style={{ fontWeight: 'bold' }}>{option.header}: </Text> 
												{option.type == 'percentage' && '%'}
											</Text>
										))}

										{removeProductinfo.others.map((other, otherindex) => (
											<Text key={other.key} style={styles.itemInfo}>
												<Text style={{ fontWeight: 'bold' }}>{other.name}: </Text>
												<Text>{other.input}</Text>
												<Text> ($ {other.price.toFixed(2)})</Text>
											</Text>
										))}

										{removeProductinfo.sizes.map((size, sizeindex) => (
											<Text key={size.key} style={styles.itemInfo}>
												<Text style={{ fontWeight: 'bold' }}>Size #{sizeindex + 1}: </Text>
												<Text>{size.name} ($ {size.price.toFixed(2)})</Text>
											</Text>
										))}
									</View>

									{removeProductinfo.price ? 
										<Text style={styles.productInfoPrice}><Text style={{ fontWeight: 'bold' }}>Price: </Text>$ {(removeProductinfo.price).toFixed(2)}</Text>
									: null }

									{removeProductinfo.numorderers > 0 && (
										<View>
											<Text style={styles.productInfoOrderers}>Calling for {removeProductinfo.numorderers} {removeProductinfo.numorderers == 1 ? 'person' : 'people'}</Text>
										</View>
									)}

									<Text style={styles.productInfoHeader}>Are you sure you want to delete this product</Text>

									<View style={styles.productInfoActions}>
										<TouchableOpacity style={styles.productInfoAction} onPress={() => setRemoveproductinfo({ ...removeProductinfo, show: false })}>
											<Text style={styles.productInfoActionHeader}>Cancel</Text>
										</TouchableOpacity>
										<TouchableOpacity style={styles.productInfoAction} onPress={() => removeTheProduct(removeProductinfo.id)}>
											<Text style={styles.productInfoActionHeader}>Yes</Text>
										</TouchableOpacity>
									</View>
								</View>
							</SafeAreaView>
						</Modal>
					)}
					{removeServiceinfo.show && (
						<Modal transparent={true}>
							<SafeAreaView style={styles.serviceInfoContainer}>
								<View style={styles.serviceInfoBox}>
									<Text style={styles.serviceInfoBoxHeader}>Delete service confirmation</Text>

									<View style={styles.serviceInfoImageHolder}>
										<Image source={{ uri: logo_url + removeServiceinfo.image }} style={styles.serviceInfoImage}/>
									</View>
									<Text style={styles.serviceInfoName}>{removeServiceinfo.name}</Text>
									<Text style={styles.serviceInfoPrice}><Text style={{ fontWeight: 'bold' }}>Price: </Text>$ {(removeServiceinfo.price).toFixed(2)}</Text>
									<Text style={styles.serviceInfoHeader}>Are you sure you want to delete this service</Text>

									<View style={styles.serviceInfoActions}>
										<TouchableOpacity style={styles.serviceInfoAction} onPress={() => setRemoveserviceinfo({ ...removeServiceinfo, show: false })}>
											<Text style={styles.serviceInfoActionHeader}>Cancel</Text>
										</TouchableOpacity>
										<TouchableOpacity style={styles.serviceInfoAction} onPress={() => removeTheService(removeServiceinfo.id)}>
											<Text style={styles.serviceInfoActionHeader}>Yes</Text>
										</TouchableOpacity>
									</View>
								</View>
							</SafeAreaView>
						</Modal>
					)}
				</View>
				:
				<View style={styles.loading}>
					<ActivityIndicator color="black" size="large"/>
				</View>
			}
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	menuBox: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

	menuRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 5 },
	menuPhoto: { height: height * 0.3, width: width * 0.3 },
	menuPhotoActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: -30 },
	menuPhotoAction: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 3 },
	menuPhotoActionHeader: { textAlign: 'center' },
	menuStart: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
	menuStartHeader: { fontSize: wsize(7), textAlign: 'center' },
  menuStartDiv: { fontSize: wsize(7), fontWeight: 'bold', marginVertical: 20 },

	menu: { backgroundColor: 'white', padding: 3, width: '98%' },
	menuImageHolder: { borderRadius: wsize(10) / 2, height: wsize(10), overflow: 'hidden', width: wsize(10) },
	menuImage: { height: wsize(10), width: wsize(10) },
  column: { flexDirection: 'column', justifyContent: 'space-around' },
	menuName: { fontSize: wsize(5), fontWeight: 'bold', marginLeft: 5, textDecorationLine: 'underline' },
	menuActions: { flexDirection: 'row' },
	menuAction: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginLeft: 10, padding: 3 },
	menuActionHeader: { fontSize: wsize(4), textAlign: 'center' },
	item: { backgroundColor: 'white', paddingHorizontal: 3, paddingVertical: 10, width: '98%' },
	itemImageHolder: { borderRadius: wsize(10) / 2, height: wsize(10), margin: 5, overflow: 'hidden', width: wsize(10) },
	itemImage: { height: wsize(10), width: wsize(10) },
	itemHeader: { fontSize: wsize(5), fontWeight: 'bold', marginHorizontal: 10, textDecorationStyle: 'solid' },
	itemActions: { flexDirection: 'row' },
	itemAction: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginLeft: 10, padding: 3 },
	itemActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	actionsHolder: { flexDirection: 'column', height: '100%', justifyContent: 'space-around' },
	actions: { alignItems: 'center', width: '100%' },
	action: { alignItems: 'center', backgroundColor: 'white', borderRadius: 15, borderStyle: 'solid', borderWidth: 1, marginHorizontal: 5, marginVertical: 30, padding: 10, width: 200 },
	actionHeader: { color: 'black', fontFamily: 'appFont', fontSize: wsize(15) },

	addTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, padding: 5, width: 200 },
	addTouchHeader: { fontSize: wsize(5), textAlign: 'center' },
	row: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5, width: wsize(30) },
	bottomNavHeader: { fontSize: wsize(5), fontWeight: 'bold' },

	// hidden boxes

	// create options
	createOptionContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	createOptionBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', padding: 10, width: '80%' },
	createOptionClose: { borderRadius: 18, borderStyle: 'solid', borderWidth: 2 },
	createOptionActions: { flexDirection: 'column', height: '50%', justifyContent: 'space-around' },
	createOptionAction: { borderRadius: 3, borderStyle: 'solid', borderWidth: 1, padding: 10 },
	createOptionActionHeader: { fontSize: wsize(7), textAlign: 'center' },

	// menu photo option
	menuPhotoOptionContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	menuPhotoOptionPhoto: { height: '80%', width: '80%' },
	menuPhotoOptionBottomContainer: { alignItems: 'center', backgroundColor: 'white', width: '90%' },
	menuPhotoOptionActionsHeader: { color: 'black', fontSize: wsize(4), textAlign: 'center' },
	menuPhotoOptionActions: { flexDirection: 'row', justifyContent: 'space-around' },
	menuPhotoOptionAction: { borderColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 3, width: wsize(30) },
	menuPhotoOptionActionHeader: { color: 'black', fontSize: wsize(4), textAlign: 'center' },

	// upload menu
	uploadMenuContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	uploadMenuBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', padding: 10, width: '80%' },
	uploadMenuClose: { borderRadius: 18, borderStyle: 'solid', borderWidth: 2 },
	uploadMenuActions: { flexDirection: 'column', height: '50%', justifyContent: 'space-around' },
	uploadMenuAction: { borderRadius: 3, borderStyle: 'solid', borderWidth: 1, padding: 5 },
	uploadMenuActionHeader: { fontSize: wsize(4), textAlign: 'center' },
	uploadMenuCameraContainer: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	uploadMenuCamera: { height: '80%', width: '80%' },
	uploadMenuCameraActions: { bottom: 0, flexDirection: 'row', justifyContent: 'space-around', position: 'absolute' },
	uploadMenuCameraAction: { borderColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: wsize(30) },
	uploadMenuCameraActionHeader: { color: 'black', fontSize: wsize(4), textAlign: 'center' },

	// remove menu confirmation
	menuInfoContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	menuInfoBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-between', padding: 10, width: '80%' },
	menuInfoBoxHeader: { fontSize: wsize(6), textAlign: 'center' },
	menuInfoImageHolder: { borderRadius: wsize(50) / 2, height: wsize(50), overflow: 'hidden', width: wsize(50) },
	menuInfoImage: { height: wsize(50), width: wsize(50) },
	menuInfoName: { fontSize: wsize(5), fontWeight: 'bold' },
	menuInfoInfo: { fontSize: wsize(5), textAlign: 'center' },
	menuInfoHeader: { fontSize: wsize(4), fontWeight: 'bold', paddingHorizontal: 10, textAlign: 'center' },
	menuInfoActions: { flexDirection: 'row', justifyContent: 'space-around' },
	menuInfoAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 10, padding: 5, width: wsize(30) },
	menuInfoActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	// remove product confirmation
	productInfoContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	productInfoBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-between', padding: 10, width: '80%' },
	productInfoBoxHeader: { fontSize: wsize(6), textAlign: 'center' },
	productInfoImageHolder: { borderRadius: wsize(50) / 2, height: wsize(50), overflow: 'hidden', width: wsize(50) },
	productInfoImage: { height: wsize(50), width: wsize(50) },
	productInfoName: { fontSize: wsize(5), fontWeight: 'bold' },
	productInfoQuantity: {  },
	productInfoPrice: { fontSize: wsize(5) },
	productInfoOrderers: { fontWeight: 'bold' },
	productInfoHeader: { fontSize: wsize(5), fontWeight: 'bold', paddingHorizontal: 10, textAlign: 'center' },
	productInfoActions: { flexDirection: 'row', justifyContent: 'space-around' },
	productInfoAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 10, padding: 5, width: wsize(30) },
	productInfoActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	// remove service confirmation
	serviceInfoContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	serviceInfoBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-between', padding: 10, width: '80%' },
	serviceInfoBoxHeader: { fontSize: wsize(6), textAlign: 'center' },
	serviceInfoImageHolder: { borderRadius: wsize(50) / 2, height: wsize(50), overflow: 'hidden', width: wsize(50) },
	serviceInfoImage: { height: wsize(50), width: wsize(50) },
	serviceInfoName: { fontSize: wsize(5), fontWeight: 'bold' },
	serviceInfoQuantity: { fontSize: wsize(5) },
	serviceInfoPrice: { fontSize: wsize(5) },
	serviceInfoOrderers: { fontWeight: 'bold' },
	serviceInfoHeader: { fontSize: wsize(5), fontWeight: 'bold', paddingHorizontal: 10, textAlign: 'center' },
	serviceInfoActions: { flexDirection: 'row', justifyContent: 'space-around' },
	serviceInfoAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 10, padding: 5, width: wsize(30) },
	serviceInfoActionHeader: { fontSize: wsize(4), textAlign: 'center' },

  loading: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
})
