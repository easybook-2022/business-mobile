import React, { useState, useEffect, useCallback } from 'react'
import { 
  SafeAreaView, ActivityIndicator, Platform, Dimensions, View, FlatList, Text, 
  TextInput, Image, TouchableOpacity, KeyboardAvoidingView, TouchableWithoutFeedback, 
  Keyboard, ScrollView, StyleSheet, Modal, PermissionsAndroid
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useFocusEffect, useIsFocused, CommonActions } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker';
import { getId } from 'geottuse-tools';
import { logo_url } from '../../assets/info'
import { resizePhoto } from 'geottuse-tools'
import { tr } from '../../assets/translate'
import { getLocationProfile } from '../apis/locations'
import { getOwnerInfo } from '../apis/owners'
import { getMenus, addNewMenu, removeMenu, getMenuInfo, saveMenu, uploadMenu, deleteMenu } from '../apis/menus'
import { getProductInfo, removeProduct } from '../apis/products'
import { getServiceInfo, removeService } from '../apis/services'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Ionicons from 'react-native-vector-icons/Ionicons'

// widgets
import Loadingprogress from '../widgets/loadingprogress';

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}

export default function Menu(props) {
  const [language, setLanguage] = useState('')
	const [cameraPermission, setCamerapermission] = useState(null);
	const [pickingPermission, setPickingpermission] = useState(null);
  const [camType, setCamtype] = useState('back')
	const [camComp, setCamcomp] = useState(null)

	const [locationType, setLocationtype] = useState('')
  const [isOwner, setIsowner] = useState(false)

	const [menuInfo, setMenuinfo] = useState({ list: [], photos: [] })

	const [loaded, setLoaded] = useState(false)

	const [menuForm, setMenuform] = useState({ 
		show: false, type: '', id: '', 
		index: -1, name: '', info: '', 
		image: { uri: '', name: '' }, errormsg: '' 
	})

	const [createMenuoptionbox, setCreatemenuoptionbox] = useState({ show: false, id: -1, allow: null })
	const [uploadMenubox, setUploadmenubox] = useState({ show: false, action: '', uri: '', size: { width: 0, height: 0 }, choosing: false, name: '', loading: false })
	const [menuPhotooption, setMenuphotooption] = useState({ show: false, action: '', photo: '', loading: false })
	const [removeMenuinfo, setRemovemenuinfo] = useState({ show: false, id: "", name: "", loading: false })
	const [removeServiceinfo, setRemoveserviceinfo] = useState({ show: false, id: "", name: "", image: "", price: 0, loading: false })
	const [removeProductinfo, setRemoveproductinfo] = useState({ show: false, id: "", name: "", image: "", sizes: [], others: [], options: [], price: 0, loading: false })

	const getTheLocationProfile = async() => {
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { locationid }

    tr.locale = await AsyncStorage.getItem("language")

    setLanguage(await AsyncStorage.getItem("language"))
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
          const { errormsg, status } = err.response.data
				}
			})
	}
  const getTheOwnerInfo = async() => {
    const ownerid = await AsyncStorage.getItem("ownerid")

    getOwnerInfo(ownerid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setIsowner(res.isOwner)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
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
					setMenuinfo({ ...menuInfo, list: res.list, photos: res.photos })
					setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data
				}
			})
	}
	const displayList = info => {
		let { id, image, name, list } = info
    const header = ((locationType == "hair" || locationType == "nail") && "service") || 
                  (locationType == "restaurant" && "meal") || 
                  (locationType == "store" && "item")

		return (
			<View>
				{name ? 
					<View style={styles.menu}>
						<View style={{ flexDirection: 'row' }}>
              <View style={styles.menuImageHolder}>
                <Image 
                  style={resizePhoto(image, wsize(30))} 
                  source={image.name ? { uri: logo_url + image.name } : require("../../assets/noimage.jpeg")}
                />
              </View>
              <View style={styles.column}><Text style={styles.menuName}>{name} (Menu)</Text></View>
              {isOwner == true && (
                <View style={styles.column}>
                  <View style={styles.menuActions}>
                    <TouchableOpacity style={styles.menuAction} onPress={() => {
                      props.navigation.setParams({ refetch: true })
                      props.navigation.navigate("addmenu", { parentMenuid: id, menuid: id })
                    }}>
                      <Text style={styles.menuActionHeader}>{tr.t("buttons.change")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuAction} onPress={() => removeTheMenu(id)}>
                      <Text style={styles.menuActionHeader}>{tr.t("buttons.delete")}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
						</View>
              
						{list.length > 0 && (
							list.map((info, index) => (
								<View key={"list-" + index}>
									{info.listType == "list" ? 
										displayList({ id: info.id, name: info.name, image: info.image, list: info.list })
										:
										<View style={styles.item}>
											<View style={{ flexDirection: 'row' }}>
                        <View style={styles.itemImageHolder}>
                          <Image 
                            style={resizePhoto(info.image, wsize(30))} 
                            source={info.image.name ? { uri: logo_url + info.image.name } : require("../../assets/noimage.jpeg")}
                          />
                        </View>
  												
                        <View style={styles.column}><Text style={styles.itemHeader}>{info.name}</Text></View>
                        <View style={styles.column}><Text style={styles.itemHeader}>{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</Text></View>
											</View>
                      {isOwner == true && (
                        <View style={styles.column}>
                          <View style={styles.itemActions}>
                            <TouchableOpacity style={styles.itemAction} onPress={() => {
                              props.navigation.setParams({ refetch: true })

                              if ((locationType == "hair" || locationType == "nail")) {
                                props.navigation.navigate("addservice", { parentMenuid: id, serviceid: info.id })
                              } else if (locationType == "restaurant") {
                                props.navigation.navigate("addmeal", { parentMenuid: id, productid: info.id })
                              } else {
                                props.navigation.navigate("addproduct", { parentMenuid: id, productid: info.id })
                              }
                            }}>
                              <Text style={styles.itemActionHeader}>{tr.t("buttons.change")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.itemAction} onPress={() => (locationType == "hair" || locationType == "nail") ? removeTheService(info.id) : removeTheProduct(info.id)}>
                              <Text style={styles.itemActionHeader}>{tr.t("buttons.delete")}</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
										</View>
									}
								</View>
							))
						)}
					</View>
					:
					list.map((info, index) => (
						<View key={"list-" + index}>
							{info.listType == "list" ? 
                displayList({ id: info.id, name: info.name, image: info.image, list: info.list })
								:
                <>
  								<View style={styles.item}>
  									<View style={{ flexDirection: 'row', }}>
    									<View style={styles.itemImageHolder}>
                        <Image 
                          style={resizePhoto(info.image, wsize(30))} 
                          source={info.image.name ? { uri: logo_url + info.image.name } : require("../../assets/noimage.jpeg")}
                        />
                      </View>
  										<View style={styles.column}><Text style={styles.itemHeader}>{info.name}</Text></View>
  										<View style={styles.column}><Text style={styles.itemHeader}>{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</Text></View>
  									</View>
                    {isOwner == true && (
                      <View style={styles.column}>
                        <View style={styles.itemActions}>
                          <TouchableOpacity style={styles.itemAction} onPress={() => {
                            props.navigation.setParams({ refetch: true })

                            if ((locationType == "hair" || locationType == "nail")) {
                              props.navigation.navigate("addservice", { parentMenuid: id, serviceid: info.id })
                            } else if (locationType == "restaurant") {
                              props.navigation.navigate("addmeal", { parentMenuid: id, productid: info.id })
                            } else {
                              props.navigation.navigate("addproduct", { parentMenuid: id, productid: info.id })
                            }
                          }}>
                            <Text style={styles.itemActionHeader}>{tr.t("buttons.change")}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.itemAction} onPress={() => (locationType == "hair" || locationType == "nail") ? removeTheService(info.id) : removeTheProduct(info.id)}>
                            <Text style={styles.itemActionHeader}>{tr.t("buttons.delete")}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
  								</View>
                </>
							}
						</View>
					))
				}
			</View>
		)
	}

	const removeTheMenu = id => {
    setRemovemenuinfo({ ...removeMenuinfo, loading: true })

		if (!removeMenuinfo.show) {
			getMenuInfo(id)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						const { name, menuImage } = res.info

						setRemovemenuinfo({ ...removeMenuinfo, show: true, id, name, image: menuImage, loading: false })
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						const { errormsg, status } = err.response.data
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
						setRemovemenuinfo({ ...removeMenuinfo, show: false, loading: false })
						getTheLocationProfile()
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						const { errormsg, status } = err.response.data
					}
				})
		}
	}
	const removeTheProduct = id => {
    setRemoveproductinfo({ ...removeProductinfo, loading: true })

		if (!removeProductinfo.show) {
			getProductInfo(id)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						const { productImage, name, options, others, price, sizes } = res.productInfo

						setRemoveproductinfo({ ...removeProductinfo, show: true, id, name, image: productImage, sizes, others, options, price, loading: false })
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						const { errormsg, status } = err.response.data
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
					if (res) {
            setRemoveproductinfo({ ...removeProductinfo, show: false, loading: false })
            getTheLocationProfile()
          }
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
            const { errormsg, status } = err.response.data
					}
				})
		}
	}
	const removeTheService = (id) => {
    setRemoveserviceinfo({ ...removeServiceinfo, loading: true })

		if (!removeServiceinfo.show) {
			getServiceInfo(id)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						const { name, price, serviceImage } = res.serviceInfo

						setRemoveserviceinfo({ ...removeServiceinfo, show: true, id, name, price, image: serviceImage, loading: false })
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						const { errormsg, status } = err.response.data
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
            setRemoveserviceinfo({ ...removeServiceinfo, show: false, loading: false })
						getTheLocationProfile()
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						const { errormsg, status } = err.response.data
					}
				})
		}
	}

	const snapPhoto = async() => {
    setUploadmenubox({ ...uploadMenubox, loading: true })

		if (camComp) {
      let options = { quality: 0, skipProcessing: true };
      let char = getId(), photo = await camComp.takePictureAsync(options)
      let photo_option = [{ resize: { height: height * 0.7, width }}]
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
        setUploadmenubox({ 
          ...uploadMenubox, 
          uri: `${FileSystem.documentDirectory}/${char}.jpg`, name: `${char}.jpg`, 
          size: { width, height: height * 0.7 }, 
          loading: false
        })
      })
		}
	}
	const choosePhoto = async() => {
    setUploadmenubox({ ...uploadMenubox, loading: true })

		let char = getId()
		let photo = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 0
    });

    photo = await ImageManipulator.manipulateAsync(
      photo.localUri || photo.uri,
      [{ resize: resizePhoto(photo, width) }],
      { compress: 0.1 }
    )

		if (!photo.cancelled) {
			FileSystem.moveAsync({
				from: photo.uri,
				to: `${FileSystem.documentDirectory}/${char}.jpg`
			})
			.then(() => {
				setUploadmenubox({ 
          ...uploadMenubox, 
          uri: `${FileSystem.documentDirectory}/${char}.jpg`, name: `${char}.jpg`, 
          size: { width: photo.width, height: photo.height }, loading: false,
          action: 'choose'
        })
			})
		} else {
      setUploadmenubox({ ...uploadMenubox, loading: false })
    }
	}
	const uploadMenuphoto = async() => {
    setUploadmenubox({ ...uploadMenubox, loading: true })

		const locationid = await AsyncStorage.getItem("locationid")
		const { uri, name, size } = uploadMenubox
		const image = { uri, name }
		const data = { locationid, image, size }

		uploadMenu(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setUploadmenubox({ ...uploadMenubox, show: false, action: '', uri: '', name: '', loading: false })
          getAllMenus()
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { status, errormsg } = err.response.data
				}
			})
	}
	const deleteTheMenu = async() => {
    setMenuphotooption({ ...menuPhotooption, loading: true })

		const locationid = await AsyncStorage.getItem("locationid")
		const { info } = menuPhotooption
		const data = { locationid, photo: info.name }

		deleteMenu(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setMenuphotooption({ ...menuPhotooption, show: false, action: '', photo: '', loading: false })
          getAllMenus()
				}
			})
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
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
            message: "EasyBook Business allows you to take a photo for menu",
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
	
	useEffect(() => {
    if (!loaded) {
      getTheLocationProfile()
      getTheOwnerInfo()
    }
	}, [])

  useFocusEffect(
    useCallback(() => {
      if (props.route.params) {
        const params = props.route.params

        if (params.refetch) {
          getAllMenus()
        }

        props.navigation.setParams({ refetch: null })
      }
    }, [useIsFocused()])
  );

  const header = ((locationType == "hair" || locationType == "nail") && "service") || 
                  (locationType == "restaurant" && "meal") || 
                  (locationType == "store" && "item")

	return (
		<SafeAreaView style={styles.menuBox}>
			{loaded ? 
				<View style={styles.box}>
					<ScrollView style={{ height: '90%', width: '100%' }}>
						<View style={{ paddingVertical: 10 }}>
              {(locationType == "hair" || locationType == "nail") && (
                <>
    							{menuInfo.photos.length > 0 && (
    								menuInfo.photos[0].row && ( 
    									<ScrollView style={{ width: '100%' }}>
    										{menuInfo.photos.map(info => (
    											<View key={info.key} style={styles.menuRow}>
    												{info.row.map(item => (
    													<View key={item.key} style={{ width: width * 0.3 }}>
    														{item.photo && (
                                  <>
                                    <View style={resizePhoto(item.photo, width * 0.3)}>
                                      <Image style={{ height: '100%', width: '100%' }} source={{ uri: logo_url + item.photo.name }}/>
                                    </View>

                                    <View style={[styles.menuPhotoActions, { marginTop: -30 }]}>
                                      {isOwner == true && (
                                        <TouchableOpacity style={styles.menuPhotoAction} onPress={() => setMenuphotooption({ ...menuPhotooption, show: true, action: 'delete', info: item.photo })}>
                                          <Text style={styles.menuPhotoActionHeader}>{tr.t("buttons.delete")}</Text>
                                        </TouchableOpacity>
                                      )}
                                      <TouchableOpacity style={styles.menuPhotoAction} onPress={() => setMenuphotooption({ ...menuPhotooption, show: true, action: '', info: item.photo })}>
                                        <Text style={styles.menuPhotoActionHeader}>{tr.t("buttons.see")}</Text>
                                      </TouchableOpacity>
                                    </View>
                                  </>
    														)}
    													</View>
    												))}
    											</View>
    										))}
    									</ScrollView>
    								)
    							)}
                  {isOwner == true && (
                    <View style={{ alignItems: 'center' }}>
                      <TouchableOpacity style={styles.menuStart} onPress={() => {
                        allowCamera()
                        setUploadmenubox({ ...uploadMenubox, show: true, uri: '', name: '' })
                      }}>
                        <Text style={styles.menuStartHeader}>{tr.t("menu.photos.upload")}</Text>
                      </TouchableOpacity>
                      <Text>({tr.t("menu.photos.easier")})</Text>
                    </View>
                  )}
                </>
              )}

              {isOwner == true && (
                <View style={{ alignItems: 'center' }}>
                  <TouchableOpacity style={styles.menuStart} onPress={() => {
                    props.navigation.setParams({ refetch: true })

                    if ((locationType == "hair" || locationType == "nail")) {
                      props.navigation.navigate(
                        "addservice", 
                        { parentMenuid: -1, serviceid: null }
                      )
                    } else {
                      props.navigation.navigate(
                        locationType == "store" ? "addproduct" : "addmeal", 
                        { parentMenuid: -1, productid: null }
                      )
                    }
                  }}>
                    <Text style={styles.menuStartHeader}>{
                      locationType == "hair" || locationType == "nail" ? 
                        tr.t("buttons.addservice")
                        :
                        locationType == "store" ? 
                          tr.t("buttons.addproduct")
                          :
                          tr.t("buttons.addmeal")
                    }</Text>
                  </TouchableOpacity>
                  {(locationType == "hair" || locationType == "nail") && <Text>{tr.t("menu.lists.easier." + (header == "service" ? "salon" : "restaurant"))}</Text>}
                </View>
              )}
              {displayList({ id: "", name: "", image: "", list: menuInfo.list })}
						</View>
					</ScrollView>
          
					<View style={styles.bottomNavs}>
						<View style={styles.bottomNavsRow}>
							<TouchableOpacity style={styles.bottomNavButton} onPress={() => props.navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: "main", params: { menu: true }}]
                })
              )}>
                <Text style={styles.bottomNavButtonHeader}>
                  {locationType == "hair" || locationType == "nail" ? tr.t("menu.bottomNavs.back.salon") : tr.t("menu.bottomNavs.back.restaurant")}
                </Text>
							</TouchableOpacity>

  						<View style={styles.column}>
                <TouchableOpacity style={styles.bottomNavButton} onPress={() => {
                  AsyncStorage.clear()

                  props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "auth" }]}));
                }}>
                  <Text style={styles.bottomNavButtonHeader}>Log-Out</Text>
                </TouchableOpacity>
              </View>
						</View>
					</View>

					{createMenuoptionbox.show && (
						<Modal transparent={true}>
							<SafeAreaView style={styles.createOptionContainer}>
								<View style={styles.createOptionBox}>
									<TouchableOpacity style={styles.createOptionClose} onPress={() => setCreatemenuoptionbox({ show: false, id: -1 })}>
										<AntDesign name="close" size={wsize(7)}/>
									</TouchableOpacity>
									<View style={styles.createOptionActions}>
										{createMenuoptionbox.allow == "both" && (
											<TouchableOpacity style={styles.createOptionAction} onPress={() => {
												setCreatemenuoptionbox({ ...createMenuoptionbox, show: false, id: -1 })
                        props.navigation.setParams({ refetch: true })
												props.navigation.navigate(
                          "addmenu", 
                          { parentMenuid: createMenuoptionbox.id, menuid: null }
                        )
											}}>
												<Text style={styles.createOptionActionHeader}>{tr.t("buttons.addmenu")}</Text>
											</TouchableOpacity>
										)}
											
										<TouchableOpacity style={styles.createOptionAction} onPress={() => {
                      setCreatemenuoptionbox({ show: false, id: -1 })
                      props.navigation.setParams({ refetch: true })

											if ((locationType == "hair" || locationType == "nail")) {
												props.navigation.navigate(
													"addservice", 
													{ parentMenuid: createMenuoptionbox.id, serviceid: null }
												)
											} else {
												props.navigation.navigate(
													"addproduct", 
													{ parentMenuid: createMenuoptionbox.id, productid: null }
												)
											}
										}}>
											<Text style={styles.createOptionActionHeader}>{tr.t("buttons.add" + header)}</Text>
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
										<TouchableOpacity style={styles.uploadMenuClose} onPress={() => setUploadmenubox({ ...uploadMenubox, show: false, uri: '', name: '' })}>
											<AntDesign name="close" size={wsize(7)}/>
										</TouchableOpacity>
										<View style={styles.uploadMenuActions}>
											<TouchableOpacity style={styles.uploadMenuAction} onPress={() => setUploadmenubox({ ...uploadMenubox, action: 'camera' })}>
												<Text style={styles.uploadMenuActionHeader}>{tr.t("menu.hidden.uploadMenu.takePhoto")}</Text>
											</TouchableOpacity>
											<TouchableOpacity style={styles.uploadMenuAction} onPress={() => {
                        allowChoosing()
                        choosePhoto()
                      }}>
												<Text style={styles.uploadMenuActionHeader}>{tr.t("buttons.choosePhoto")}</Text>
											</TouchableOpacity>
										</View>
									</View>
									:
									<View style={styles.uploadMenuCameraContainer}>
                    <TouchableOpacity style={styles.uploadMenuClose} onPress={() => setUploadmenubox({ ...uploadMenubox, show: false, uri: '', name: '', action: '' })}>
                      <AntDesign name="close" size={wsize(7)}/>
                    </TouchableOpacity>

                    {!uploadMenubox.uri ? 
                      !uploadMenubox.choosing && (
                        <>
                          <Camera 
                            style={styles.uploadMenuCamera} 
                            ref={r => {setCamcomp(r)}}
                            type={camType}
                          />

                          <View style={{ alignItems: 'center', marginVertical: 10 }}>
                            <Ionicons name="camera-reverse-outline" size={wsize(7)} onPress={() => setCamtype(camType == 'back' ? 'front' : 'back')}/>
                          </View>
                        </>
                      )
                      :
                      <View style={resizePhoto(uploadMenubox.size, width)}>
                        <Image style={{ height: '100%', width: '100%' }} source={{ uri: uploadMenubox.uri }}/>
                      </View>
                    }

                    {!uploadMenubox.uri ? 
                      <View style={styles.uploadMenuCameraActions}>
                        <TouchableOpacity style={[styles.uploadMenuCameraAction, { opacity: uploadMenubox.loading ? 0.5 : 1 }]} disabled={uploadMenubox.loading} onPress={() => setUploadmenubox({ ...uploadMenubox, action: '' })}>
                          <Text style={styles.uploadMenuCameraActionHeader}>{tr.t("buttons.cancel")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.uploadMenuCameraAction, { opacity: uploadMenubox.loading ? 0.5 : 1 }]} disabled={uploadMenubox.loading} onPress={() => {
                          allowChoosing()
                          choosePhoto()
                        }}>
                          <Text style={styles.uploadMenuCameraActionHeader}>{tr.t("buttons.choosePhoto")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.uploadMenuCameraAction, { opacity: uploadMenubox.loading ? 0.5 : 1 }]} disabled={uploadMenubox.loading} onPress={snapPhoto.bind(this)}>
                          <Text style={styles.uploadMenuCameraActionHeader}>{tr.t("buttons.takePhoto")}</Text>
                        </TouchableOpacity>
                      </View>
                      :
                      <View style={styles.uploadMenuCameraActions}>
                        <TouchableOpacity style={[styles.uploadMenuCameraAction, { opacity: uploadMenubox.loading ? 0.5 : 1 }]} disabled={uploadMenubox.loading} onPress={() => setUploadmenubox({ ...uploadMenubox, action: '', uri: '', name: '' })}>
                          <Text style={styles.uploadMenuCameraActionHeader}>{tr.t("buttons.cancel")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.uploadMenuCameraAction, { opacity: uploadMenubox.loading ? 0.5 : 1 }]} disabled={uploadMenubox.loading} onPress={() => setUploadmenubox({ ...uploadMenubox, uri: '', name: '' })}>
                          <Text style={styles.uploadMenuCameraActionHeader}>{tr.t("buttons.takePhoto")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.uploadMenuCameraAction, { opacity: uploadMenubox.loading ? 0.5 : 1 }]} disabled={uploadMenubox.loading} onPress={() => uploadMenuphoto()}>
                          <Text style={styles.uploadMenuCameraActionHeader}>{tr.t("buttons.done")}</Text>
                        </TouchableOpacity>
                      </View>
                    }
                  </View>
								}
							</SafeAreaView>

              {uploadMenubox.loading && <Modal transparent={true}><Loadingprogress/></Modal>}
						</Modal>
					)}
					{menuPhotooption.show && (
						<Modal transparent={true}>
							<SafeAreaView style={styles.menuPhotoOptionContainer}>
  							{menuPhotooption.info.name && (
                  <View style={resizePhoto(menuPhotooption.info, width)}>
                    <Image style={{ height: '100%', width: '100%' }} source={{ uri: logo_url + menuPhotooption.info.name }}/>
                  </View>
                )}

								{menuPhotooption.action == "delete" ? 
									<View style={styles.menuPhotoOptionBottomContainer}>
										<Text style={styles.menuPhotoOptionActionsHeader}>{tr.t("menu.hidden.menuPhotooption.header")}</Text>
										<View style={styles.menuPhotoOptionActions}>
											<TouchableOpacity style={styles.menuPhotoOptionAction} onPress={() => setMenuphotooption({ ...menuPhotooption, show: false, action: '', info: {} })}>
												<Text style={styles.menuPhotoOptionActionHeader}>{tr.t("buttons.no")}</Text>
											</TouchableOpacity>
											<TouchableOpacity style={styles.menuPhotoOptionAction} onPress={() => deleteTheMenu()}>
												<Text style={styles.menuPhotoOptionActionHeader}>{tr.t("buttons.yes")}</Text>
											</TouchableOpacity>
										</View>
									</View>
									:
									<View style={styles.menuPhotoOptionBottomContainer}>
										<TouchableOpacity style={styles.menuPhotoOptionAction} onPress={() => setMenuphotooption({ ...menuPhotooption, show: false, action: '', info: {} })}>
											<Text style={styles.menuPhotoOptionActionHeader}>{tr.t("buttons.close")}</Text>
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

									<View style={styles.menuInfoImageHolder}>
                    <Image 
                      source={removeMenuinfo.image.name ? { uri: logo_url + removeMenuinfo.image.name } : require("../../assets/noimage.jpeg")} 
                      style={resizePhoto(removeMenuinfo.image, wsize(50))}
                    />
                  </View>
                    
                  <Text style={styles.menuInfoName}>Menu: {removeMenuinfo.name}</Text>
									<Text style={styles.menuInfoHeader}>Are you sure you want to delete{'\n'}this menu and its items</Text>

									<View style={styles.menuInfoActions}>
										<TouchableOpacity style={styles.menuInfoAction} onPress={() => setRemovemenuinfo({ ...removeMenuinfo, show: false })}>
											<Text style={styles.menuInfoActionHeader}>{tr.t("buttons.cancel")}</Text>
										</TouchableOpacity>
										<TouchableOpacity style={styles.menuInfoAction} onPress={() => removeTheMenu(removeMenuinfo.id)}>
											<Text style={styles.menuInfoActionHeader}>{tr.t("buttons.yes")}</Text>
										</TouchableOpacity>
									</View>
								</View>
							</SafeAreaView>

              {removeMenuinfo.loading && <Modal transparent={true}><Loadingprogress/></Modal>}
						</Modal>
					)}
					{removeProductinfo.show && (
						<Modal transparent={true}>
							<SafeAreaView style={styles.productInfoContainer}>
								<View style={styles.productInfoBox}>
									<Text style={styles.productInfoBoxHeader}>Delete product confirmation</Text>

                  <View style={styles.productInfoImageHolder}>
                    <Image 
                      source={removeProductinfo.image.name ? { uri: logo_url + removeProductinfo.image.name } : require("../../assets/noimage.jpeg")} 
                      style={resizePhoto(removeProductinfo.image, wsize(50))}
                    />
                  </View>

									<Text style={styles.productInfoName}>Item: {removeProductinfo.name}</Text>

									<View>
										{removeProductinfo.sizes.map((size, sizeindex) => (
											<Text key={size.key}>
												<Text style={{ fontWeight: 'bold' }}>Size #{sizeindex + 1}: </Text>
												<Text>{size.name} ($ {size.price.toFixed(2)})</Text>
											</Text>
										))}
									</View>

									{removeProductinfo.price ? 
										<Text style={styles.productInfoPrice}><Text style={{ fontWeight: 'bold' }}>Price: </Text>$ {(removeProductinfo.price).toFixed(2)}</Text>
									: null }

									<Text style={styles.productInfoHeader}>Are you sure you want to delete this {header}</Text>

									<View style={styles.productInfoActions}>
										<TouchableOpacity style={styles.productInfoAction} onPress={() => setRemoveproductinfo({ ...removeProductinfo, show: false })}>
											<Text style={styles.productInfoActionHeader}>{tr.t("buttons.cancel")}</Text>
										</TouchableOpacity>
										<TouchableOpacity style={styles.productInfoAction} onPress={() => removeTheProduct(removeProductinfo.id)}>
											<Text style={styles.productInfoActionHeader}>{tr.t("buttons.yes")}</Text>
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
                    <Image 
                      source={removeServiceinfo.image.name ? { uri: logo_url + removeServiceinfo.image.name } : require("../../assets/noimage.jpeg")} 
                      style={resizePhoto(removeServiceinfo.image, wsize(50))}
                    />
                  </View>

									<Text style={styles.serviceInfoName}>Service: {removeServiceinfo.name}</Text>
									<Text style={styles.serviceInfoPrice}><Text style={{ fontWeight: 'bold' }}>Price: </Text>$ {(removeServiceinfo.price).toFixed(2)}</Text>
									<Text style={styles.serviceInfoHeader}>Are you sure you want to delete this service</Text>

									<View style={styles.serviceInfoActions}>
										<TouchableOpacity style={styles.serviceInfoAction} onPress={() => setRemoveserviceinfo({ ...removeServiceinfo, show: false })}>
											<Text style={styles.serviceInfoActionHeader}>{tr.t("buttons.cancel")}</Text>
										</TouchableOpacity>
										<TouchableOpacity style={styles.serviceInfoAction} onPress={() => removeTheService(removeServiceinfo.id)}>
											<Text style={styles.serviceInfoActionHeader}>{tr.t("buttons.yes")}</Text>
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
      
      {(menuPhotooption.loading || removeMenuinfo.loading || removeServiceinfo.loading || removeProductinfo.loading) && <Modal transparent={true}><Loadingprogress/></Modal>}
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	menuBox: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

  menusHeader: { fontFamily: 'Chilanka_400Regular', fontSize: wsize(10), fontWeight: 'bold', textAlign: 'center' },
	menuRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 5 },
	menuPhotoActions: { flexDirection: 'row', justifyContent: 'space-around' },
	menuPhotoAction: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 3 },
	menuPhotoActionHeader: { fontSize: wsize(3), textAlign: 'center' },
	menuStart: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
	menuStartHeader: { fontSize: wsize(7), textAlign: 'center' },
  menuStartDiv: { fontSize: wsize(7), fontWeight: 'bold', marginVertical: 20 },

	menu: { backgroundColor: 'black', marginBottom: 30, paddingTop: 3, width: '100%' },
	menuImageHolder: { borderRadius: wsize(30) / 2, height: wsize(30), overflow: 'hidden', width: wsize(30) },
  column: { flexDirection: 'column', justifyContent: 'space-around' },
	menuName: { color: 'white', fontSize: wsize(5), fontWeight: 'bold', marginLeft: 5, textDecorationLine: 'underline' },
	menuActions: { flexDirection: 'row' },
	menuAction: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginLeft: 10, padding: 3 },
	menuActionHeader: { fontSize: wsize(4), textAlign: 'center' },
  itemAdd: { borderColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, flexDirection: 'row', marginVertical: 10, padding: 5 },
	itemAddHeader: { color: 'black', fontWeight: 'bold', marginRight: 5 },
  item: { backgroundColor: 'white', marginBottom: 50 },
	itemImageHolder: { borderRadius: wsize(30) / 2, height: wsize(30), overflow: 'hidden', width: wsize(30) },
	itemHeader: { fontSize: wsize(5), fontWeight: 'bold', marginHorizontal: 10, textDecorationStyle: 'solid' },
	itemActions: { flexDirection: 'row' },
	itemAction: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginLeft: 10, padding: 3 },
	itemActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5, width: wsize(30) },
	bottomNavHeader: { fontSize: wsize(5), fontWeight: 'bold' },
  bottomNavButton: { backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
  bottomNavButtonHeader: { color: 'white', fontSize: wsize(4), fontWeight: 'bold', textAlign: 'center' },

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
	uploadMenuActionHeader: { fontSize: wsize(7), textAlign: 'center' },
	uploadMenuCameraContainer: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	uploadMenuCamera: { height: '70%', width: '100%' },
	uploadMenuCameraActions: { flexDirection: 'row', justifyContent: 'space-around' },
	uploadMenuCameraAction: { borderColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: wsize(30) },
	uploadMenuCameraActionHeader: { color: 'black', fontSize: wsize(4), textAlign: 'center' },

	// remove menu confirmation
	menuInfoContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	menuInfoBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-between', padding: 10, width: '80%' },
	menuInfoBoxHeader: { fontSize: wsize(6), textAlign: 'center' },
	menuInfoImageHolder: { borderRadius: wsize(50) / 2, flexDirection: 'column', justifyContent: 'space-around', overflow: 'hidden', width: wsize(50) },
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
	productInfoImageHolder: { borderRadius: wsize(50) / 2, flexDirection: 'column', justifyContent: 'space-around', overflow: 'hidden', width: wsize(50) },
	productInfoName: { fontSize: wsize(5), fontWeight: 'bold' },
	productInfoQuantity: {  },
	productInfoPrice: { fontSize: wsize(5) },
	productInfoHeader: { fontSize: wsize(5), fontWeight: 'bold', paddingHorizontal: 10, textAlign: 'center' },
	productInfoActions: { flexDirection: 'row', justifyContent: 'space-around' },
	productInfoAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 10, padding: 5, width: wsize(30) },
	productInfoActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	// remove service confirmation
	serviceInfoContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	serviceInfoBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-between', padding: 10, width: '80%' },
	serviceInfoBoxHeader: { fontSize: wsize(6), textAlign: 'center' },
	serviceInfoImageHolder: { borderRadius: wsize(50) / 2, flexDirection: 'column', justifyContent: 'space-around', overflow: 'hidden', width: wsize(50) },
	serviceInfoName: { fontSize: wsize(5), fontWeight: 'bold' },
	serviceInfoQuantity: { fontSize: wsize(5) },
	serviceInfoPrice: { fontSize: wsize(5) },
	serviceInfoHeader: { fontSize: wsize(5), fontWeight: 'bold', paddingHorizontal: 10, textAlign: 'center' },
	serviceInfoActions: { flexDirection: 'row', justifyContent: 'space-around' },
	serviceInfoAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 10, padding: 5, width: wsize(30) },
	serviceInfoActionHeader: { fontSize: wsize(4), textAlign: 'center' },

  loading: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  column: { flexDirection: 'column', justifyContent: 'space-around' },
})
