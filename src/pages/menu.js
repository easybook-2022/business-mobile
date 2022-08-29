import React, { useState, useEffect, useCallback } from 'react'
import { 
  SafeAreaView, ActivityIndicator, Platform, Dimensions, View, FlatList, Text, 
  TextInput, Image, TouchableOpacity, KeyboardAvoidingView, TouchableWithoutFeedback, 
  Keyboard, ScrollView, StyleSheet, Modal, PermissionsAndroid
} from 'react-native'
import axios from 'axios';
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
import { getMenus, addNewMenu, removeMenu, getMenuInfo, saveMenu, uploadMenu, deleteMenu } from '../apis/menus'
import { getProductInfo, removeProduct } from '../apis/products'
import { getServiceInfo, removeService } from '../apis/services'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Ionicons from 'react-native-vector-icons/Ionicons'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'

// widgets
import Loadingprogress from '../widgets/loadingprogress';

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}
let source

export default function Menu(props) {
  const [language, setLanguage] = useState('')
	const [cameraPermission, setCamerapermission] = useState(null);
	const [pickingPermission, setPickingpermission] = useState(null);
  const [camType, setCamtype] = useState('back')
	const [camComp, setCamcomp] = useState(null)

	const [locationType, setLocationtype] = useState('')
  const [userType, setUsertype] = useState('')

	const [menus, setMenus] = useState([])

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
	const [removeServiceinfo, setRemoveserviceinfo] = useState({ show: false, id: "", name: "", image: { name: '', width: 0, height: 0 }, price: 0, loading: false })
	const [removeProductinfo, setRemoveproductinfo] = useState({ show: false, id: "", name: "", image: { name: '', width: 0, height: 0 }, sizes: [], quantities: [], percents: [], extras: [], price: 0, loading: false })
  const [changeMenu, setChangemenu] = useState({ show: false, parentMenuid: -1, name: '', image: { uri: '', name: '', width: 0, height: 0 }, list: [] })

	const getTheLocationProfile = async() => {
		const locationid = await AsyncStorage.getItem("locationid")
    const usertype = await AsyncStorage.getItem("userType")
		const data = { locationid, cancelToken: source.token }

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

          setUsertype(usertype)
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
    const data = { locationid, cancelToken: source.token }

		getMenus(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setMenus(res.list)
					setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data
				}
			})
	}
  const displayListItem = (id, info) => {
    return (
      <View style={styles.item}>
        <View style={styles.itemRow}>
          <View style={{ width: '50%' }}>
            {info.image.name && (
              <View style={styles.itemImageHolder}>
                <Image 
                  style={resizePhoto(info.image, wsize(20))} 
                  source={{ uri: logo_url + info.image.name }}
                />
              </View>
            )}
            <View style={styles.column}><Text style={styles.itemHeader}>{info.name}</Text></View>
            <View style={styles.column}><Text style={styles.itemMiniHeader}>{info.description}</Text></View>
          </View>
          <View style={[styles.column, { width: '50%' }]}>
            {userType == "owner" && (
              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.itemAction} onPress={() => {
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
            )}

            {locationType == "restaurant" && (
              <>
                {info.price ? 
                  <View style={styles.column}><Text style={styles.itemHeader}>$ {info.price} (1 size)</Text></View>
                  :
                  <>
                    <Text style={styles.itemHeader}>{info.sizes.length} Size(s)</Text>
                    {info.sizes.map(size => <Text key={size.key} style={styles.itemPrice}><Text style={{ fontWeight: 'bold' }}>{size.name}</Text>: $ {size.price}</Text>)}
                    {info.quantities.map(quantity => <Text key={quantity.key} style={styles.itemPrice}><Text style={{ fontWeight: 'bold' }}>{quantity.input}</Text>: ${quantity.price}</Text>)}
                  </>
                }

                {info.percents.map(percent => <Text key={percent.key} style={styles.itemPrice}><Text style={{ fontWeight: 'bold' }}>{percent.input}</Text>: $ {percent.price}</Text>)}
                {info.extras.map(extra => <Text key={extra.key} style={styles.itemPrice}><Text style={{ fontWeight: 'bold' }}>{extra.input}</Text>: $ {extra.price}</Text>)}
              </>
            )}
          </View>
        </View>
      </View>
    )
  }
	const displayList = info => {
		let { id, image, name, list, show = true, parentId = "" } = info
    const header = ((locationType == "hair" || locationType == "nail") && "service") || 
                  (locationType == "restaurant" && "meal") || 
                  (locationType == "store" && "item")

		return (
			<View>
				{name ? 
					<View style={styles.menu}>
						<View style={styles.menuRow}>
              {image.name && (
                <View style={styles.menuImageHolder}>
                  <Image 
                    style={resizePhoto(image, wsize(20))} 
                    source={{ uri: logo_url + image.name }}
                  />
                </View>
              )}
              <View style={styles.column}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.menuName}>{name} (Menu)</Text>
                  <TouchableOpacity style={styles.menuToggle} onPress={() => {
                    let newList = [...menus]

                    const toggleMenu = (list) => {
                      list.forEach(function (item) {
                        if (item.parentId == parentId) {
                          item.show = false
                        }

                        if (item.id == id) {
                          item.show = show ? false : true
                        } else if (item.list) {
                          toggleMenu(item.list)
                        }
                      })
                    }

                    toggleMenu(newList)

                    setMenus(newList)
                  }}>
                    <SimpleLineIcons name={"arrow-" + (show ? "up" : "down")} size={wsize(7)}/>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.column}>
                <View style={styles.menuActions}>
                  {userType == "owner" && (
                    <>
                      <TouchableOpacity style={styles.menuAction} onPress={() => setChangemenu({ ...changeMenu, show: true, parentMenuid: id, name, image, list })}>
                        <Text style={styles.menuActionHeader}>{tr.t("buttons.change")}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.menuAction} onPress={() => removeTheMenu(id)}>
                        <Text style={styles.menuActionHeader}>{tr.t("buttons.delete")}</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
						</View>

						{list.length > 0 ? 
							list.map((info, index) => (
								<View key={"list-" + index}>
									{show && (
                    info.listType == "list" ? 
                      displayList({ id: info.id, name: info.name, image: info.image, list: info.list, show: info.show, parentId: info.parentId })
                      :
                      displayListItem(id, info)
                  )}

                  {(list.length - 1 == index && info.listType != "list" && show) && (
                    <View style={{ alignItems: 'center' }}>
                      {userType == "owner" && (
                        <TouchableOpacity style={styles.itemAdd} onPress={() => {
                          props.navigation.setParams({ refetch: true })

                          if ((locationType == "hair" || locationType == "nail")) {
                            props.navigation.navigate(
                              "addservice", 
                              { parentMenuid: id, serviceid: null }
                            )
                          } else {
                            props.navigation.navigate(
                              locationType == "store" ? "addproduct" : "addmeal", 
                              { parentMenuid: id, productid: null }
                            )
                          }
                        }}>
                          <View style={styles.column}>
                            <Text style={styles.itemAddHeader}>{tr.t("buttons.add" + header)}</Text>
                          </View>
                          <AntDesign color="black" name="pluscircleo" size={wsize(7)}/>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
								</View>
							))
						  :
              <View style={{ alignItems: 'center' }}>
                {userType == "owner" && (
                  <TouchableOpacity style={styles.itemAdd} onPress={() => {
                    props.navigation.setParams({ refetch: true })

                    if ((locationType == "hair" || locationType == "nail")) {
                      props.navigation.navigate(
                        "addservice", 
                        { parentMenuid: id, serviceid: null }
                      )
                    } else {
                      props.navigation.navigate(
                        locationType == "store" ? "addproduct" : "addmeal", 
                        { parentMenuid: id, productid: null }
                      )
                    }
                  }}>
                    <View style={styles.column}>
                      <Text style={styles.itemAddHeader}>{tr.t("buttons.add" + header)}</Text>
                    </View>
                    <AntDesign color="black" name="pluscircleo" size={wsize(7)}/>
                  </TouchableOpacity>
                )}
              </View>
            }
					</View>
					:
					list.map((info, index) => (
						<View key={"list-" + index}>
              {show && (
                info.listType == "list" ? 
                  displayList({ id: info.id, name: info.name, image: info.image, list: info.list, show: info.show, parentId: info.parentId })
                  :
                  displayListItem(id, info)
              )}
						</View>
					))
				}
			</View>
		)
	}

  const displayListBoxItem = (id, info) => {
    return (
      <TouchableOpacity style={styles.boxItem} onPress={() => {
        if ((locationType == "hair" || locationType == "nail")) {
          props.navigation.navigate("addservice", { parentMenuid: id, serviceid: info.id })
        } else if (locationType == "restaurant") {
          props.navigation.navigate("addmeal", { parentMenuid: id, productid: info.id })
        } else {
          props.navigation.navigate("addproduct", { parentMenuid: id, productid: info.id })
        }
      }}>
        <View style={styles.boxItemRow}>
          <View style={{ width: '50%' }}>
            {info.image.name && (
              <View style={styles.boxItemImageHolder}>
                <Image 
                  style={resizePhoto(info.image, wsize(10))} 
                  source={{ uri: logo_url + info.image.name }}
                />
              </View>
            )}
            <View style={styles.column}><Text style={styles.boxItemHeader}>{info.name}</Text></View>
            <View style={styles.column}><Text style={styles.boxItemMiniHeader}>{info.description}</Text></View>
          </View>
          <View style={[styles.column, { width: '50%' }]}>
            {userType == "owner" && (
              <View style={styles.boxItemActions}>
                <TouchableOpacity style={styles.boxItemAction} onPress={() => {
                  setChangemenu({ ...changeMenu, show: false })

                  if ((locationType == "hair" || locationType == "nail")) {
                    props.navigation.navigate("addservice", { parentMenuid: id, serviceid: info.id })
                  } else if (locationType == "restaurant") {
                    props.navigation.navigate("addmeal", { parentMenuid: id, productid: info.id })
                  } else {
                    props.navigation.navigate("addproduct", { parentMenuid: id, productid: info.id })
                  }
                }}>
                  <Text style={styles.boxItemActionHeader}>{tr.t("buttons.change")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.boxItemAction} onPress={() => (locationType == "hair" || locationType == "nail") ? removeTheService(info.id) : removeTheProduct(info.id)}>
                  <Text style={styles.boxItemActionHeader}>{tr.t("buttons.delete")}</Text>
                </TouchableOpacity>
              </View>
            )}

            {locationType == "restaurant" && (
              <>
                {info.price ? 
                  <View style={styles.column}><Text style={styles.boxItemHeader}>$ {info.price} (1 size)</Text></View>
                  :
                  <>
                    {info.sizes.length > 0 && <Text style={[styles.itemHeader, { fontSize: wsize(3), marginTop: 20 }]}>{info.sizes.length} Size(s)</Text>}
                    {info.sizes.map(size => <Text key={size.key} style={styles.boxItemPrice}><Text style={{ fontWeight: 'bold' }}>{size.name}</Text>: $ {size.price}</Text>)}

                    {info.quantities.length > 0 && <Text style={[styles.itemHeader, { fontSize: wsize(3), marginTop: 20 }]}>{info.quantities.length} Quantity(s)</Text>}
                    {info.quantities.map(quantity => <Text key={quantity.key} style={styles.boxItemPrice}><Text style={{ fontWeight: 'bold' }}>{quantity.input}</Text>: ${quantity.price}</Text>)}
                  </>
                }

                {info.percents.length > 0 && <Text style={[styles.itemHeader, { fontSize: wsize(3), marginTop: 20 }]}>{info.percents.length} Percent(s)</Text>}
                {info.percents.map(percent => <Text key={percent.key} style={styles.boxItemPrice}><Text style={{ fontWeight: 'bold' }}>{percent.input}</Text>: $ {percent.price}</Text>)}

                {info.extras.length > 0 && <Text style={[styles.itemHeader, { fontSize: wsize(3), marginTop: 20 }]}>{info.extras.length} Extra(s)</Text>}
                {info.extras.map(extra => <Text key={extra.key} style={styles.boxItemPrice}><Text style={{ fontWeight: 'bold' }}>{extra.input}</Text>: $ {extra.price}</Text>)}
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  }
  const displayListBox = info => {
    let { id, image, name, list, show = true, parentId = "" } = info
    const header = ((locationType == "hair" || locationType == "nail") && "service") || 
                  (locationType == "restaurant" && "meal") || 
                  (locationType == "store" && "item")

    return (
      <View>
        {name ? 
          <View style={styles.boxMenu}>
            <View style={styles.boxMenuRow}>
              {image.name && (
                <View style={styles.boxMenuImageHolder}>
                  <Image 
                    style={resizePhoto(image, wsize(20))} 
                    source={{ uri: logo_url + image.name }}
                  />
                </View>
              )}
              <View style={styles.column}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.boxMenuName}>{name} (Menu)</Text>
                  <TouchableOpacity style={styles.boxMenuToggle} onPress={() => {
                    let newList = [...newList]

                    const toggleMenu = (list) => {
                      list.forEach(function (item) {
                        if (item.parentId == parentId) {
                          item.show = false
                        }

                        if (item.id == id) {
                          item.show = show ? false : true
                        } else if (item.list) {
                          toggleMenu(item.list)
                        }
                      })
                    }

                    toggleMenu(newList)

                    setMenus(newList)
                  }}>
                    <SimpleLineIcons name={"arrow-" + (show ? "up" : "down")} size={wsize(7)}/>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.column}>
                <View style={styles.boxMenuActions}>
                  {userType == "owner" && (
                    <>
                      <TouchableOpacity style={styles.boxMenuAction} onPress={() => setChangemenu({ ...changeMenu, show: true, parentMenuid: id, name, list })}>
                        <Text style={styles.boxMenuActionHeader}>{tr.t("buttons.change")}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.boxMenuAction} onPress={() => removeTheMenu(id)}>
                        <Text style={styles.boxMenuActionHeader}>{tr.t("buttons.delete")}</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </View>

            {list.length > 0 ? 
              list.map((info, index) => (
                <View key={"list-" + index}>
                  {show && (
                    info.listType == "list" ? 
                      displayListBox({ id: info.id, name: info.name, image: info.image, list: info.list, show: info.show, parentId: info.parentId })
                      :
                      displayListBoxItem(id, info)
                  )}

                  {(list.length - 1 == index && info.listType != "list" && show) && (
                    <View style={{ alignItems: 'center' }}>
                      {userType == "owner" && (
                        <TouchableOpacity style={styles.boxItemAdd} onPress={() => {
                          props.navigation.setParams({ refetch: true })
                          setChangemenu({ ...changeMenu, show: false })

                          if ((locationType == "hair" || locationType == "nail")) {
                            props.navigation.navigate(
                              "addservice", 
                              { parentMenuid: id, serviceid: null }
                            )
                          } else {
                            props.navigation.navigate(
                              locationType == "store" ? "addproduct" : "addmeal", 
                              { parentMenuid: id, productid: null }
                            )
                          }
                        }}>
                          <View style={styles.column}>
                            <Text style={styles.boxItemAddHeader}>{tr.t("buttons.add" + header)}</Text>
                          </View>
                          <AntDesign color="black" name="pluscircleo" size={wsize(7)}/>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              ))
              :
              <View style={{ alignItems: 'center' }}>
                {userType == "owner" && (
                  <TouchableOpacity style={styles.boxItemAdd} onPress={() => {
                    props.navigation.setParams({ refetch: true })
                    setChangemenu({ ...changeMenu, show: false })

                    if ((locationType == "hair" || locationType == "nail")) {
                      props.navigation.navigate(
                        "addservice", 
                        { parentMenuid: id, serviceid: null }
                      )
                    } else {
                      props.navigation.navigate(
                        locationType == "store" ? "addproduct" : "addmeal", 
                        { parentMenuid: id, productid: null }
                      )
                    }
                  }}>
                    <View style={styles.column}>
                      <Text style={styles.boxItemAddHeader}>{tr.t("buttons.add" + header)}</Text>
                    </View>
                    <AntDesign color="black" name="pluscircleo" size={wsize(7)}/>
                  </TouchableOpacity>
                )}
              </View>
            }
          </View>
          :
          list.map((info, index) => (
            <View key={"list-" + index}>
              {show && (
                info.listType == "list" ? 
                  displayListBox({ id: info.id, name: info.name, image: info.image, list: info.list, show: info.show, parentId: info.parentId })
                  :
                  displayListBoxItem(id, info)
              )}
            </View>
          ))
        }
      </View>
    )
  }

  const saveTheMenu = () => {
    const { parentMenuid, name } = changeMenu
    const { uri, size } = uploadMenubox
    const image = { uri, size }
    const data = { menuid: parentMenuid, name, image, cancelToken: source.token }

    saveMenu(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setChangemenu({ ...changeMenu, show: false })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }

	const removeTheMenu = id => {
    setRemovemenuinfo({ ...removeMenuinfo, loading: true })

		if (!removeMenuinfo.show) {
      const data = { menuid: id, cancelToken: source.token }

			getMenuInfo(data)
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
      const data = { menuid: id, cancelToken: source.token }

			removeMenu(data)
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
      const data = { productid: id, cancelToken: source.token }

			getProductInfo(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						const { productImage, name, price, sizes, quantities, percents, extras } = res.productInfo

            setChangemenu({ ...changeMenu, show: false })
            setRemoveproductinfo({ 
              ...removeProductinfo, show: true, 
              id, name, 
              image: productImage, 
              sizes, quantities, percents, extras, 
              price, loading: false 
            })
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						const { errormsg, status } = err.response.data
					}
				})
		} else {
      const data = { productid: id, cancelToken: source.token }

			removeProduct(data)
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
      const data = { serviceid: id, cancelToken: source.token }

			getServiceInfo(data)
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
      const data = { serviceid: id, cancelToken: source.token }

			removeService(data)
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
		const data = { locationid, image, size, cancelToken: source.token }

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
		const data = { locationid, photo: info.name, cancelToken: source.token }

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
    }

    source = axios.CancelToken.source();

    return () => {
      if (source) {
        source.cancel("components got unmounted");
      }
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
              {userType == "owner" && (
                <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around' }}>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={styles.menuStart} onPress={() => {
                      props.navigation.setParams({ refetch: true })
                      props.navigation.navigate(
                        "addmenu", 
                        { parentMenuid: createMenuoptionbox.id, menuid: null }
                      )
                    }}>
                      <Text style={styles.menuStartHeader}>{tr.t("buttons.addmenu")}</Text>
                    </TouchableOpacity>
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
                  </View>
                </View>
              )}
              {displayList({ id: "", name: "", image: "", list: menus })}
						</View>
					</ScrollView>
          
					<View style={styles.bottomNavs}>
						<View style={styles.bottomNavsRow}>
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
                      style={resizePhoto(removeProductinfo.image, wsize(20))}
                    />
                  </View>

									<Text style={styles.productInfoName}>Item: {removeProductinfo.name}</Text>

									<View>
    								{removeProductinfo.sizes.length > 0 && (
                      <View style={{ marginBottom: 20 }}>
                        <Text style={styles.productInfoOptionHeader}>{removeProductinfo.sizes.length} Size(s)</Text>
                        {removeProductinfo.sizes.map(size => <Text key={size.key}>{size.name} ($ {size.price})</Text>)}
                      </View>
                    )}

                    {removeProductinfo.quantities.length > 0 && (
                      <View style={{ marginBottom: 20 }}>
                        <Text style={styles.productInfoOptionHeader}>{removeProductinfo.quantities.length} Quantity(s)</Text>
                        {removeProductinfo.quantities.map(quantity => <Text key={quantity.key}>{quantity.input} ($ {quantity.price})</Text>)}
                      </View>
                    )}

                    {removeProductinfo.percents.length > 0 && (
                      <View style={{ marginBottom: 20 }}>
                        <Text style={styles.productInfoOptionHeader}>{removeProductinfo.percents.length} Percent(s)</Text>
                        {removeProductinfo.percents.map(percent => <Text key={percent.key}>{percent.input} ($ {percent.price})</Text>)}
                      </View>
                    )}

                    {removeProductinfo.extras.length > 0 && (
                      <View style={{ marginBottom: 20 }}>
                        <Text style={styles.productInfoOptionHeader}>{removeProductinfo.extras.length} Extra(s)</Text>
                        {removeProductinfo.extras.map(extra => <Text key={extra.key}>{extra.input} ($ {extra.price})</Text>)}
                      </View>
                    )}
									</View>

									{removeProductinfo.price ? 
										<Text style={styles.productInfoPrice}><Text style={{ fontWeight: 'bold' }}>Price: </Text>$ {removeProductinfo.price}</Text>
									: null }

									<Text style={styles.productInfoHeader}>Are you sure you want to delete this {header}</Text>

									<View style={styles.productInfoActions}>
										<TouchableOpacity style={styles.productInfoAction} onPress={() => {
                      setChangemenu({ ...changeMenu, show: true })
                      setRemoveproductinfo({ ...removeProductinfo, show: false })
                    }}>
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
          {changeMenu.show && (
            <Modal transparent={true}>
              <SafeAreaView style={styles.changeMenuContainer}>
                <View style={styles.changeMenuBox}>
                  <TouchableOpacity style={styles.changeMenuClose} onPress={() => setChangemenu({ ...changeMenu, show: false, list: [] })}>
                    <AntDesign name="close" size={wsize(8)}/>
                  </TouchableOpacity>

                  <Text style={styles.changeMenuHeader}>Edit menu info</Text>

                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={styles.changeMenuPhotoHolder} onPress={() => setUploadmenubox({ ...uploadMenubox, show: true })}>
                      <Image style={resizePhoto(changeMenu.image, wsize(20))} source={changeMenu.image.uri ? { uri: logo_url + changeMenu.image.uri } : require("../../assets/noimage.jpeg")}/>
                    </TouchableOpacity>
                    <View style={{ alignItems: 'center', width: '50%' }}>
                      <TextInput style={styles.changeMenuInput} maxlength={20} value={changeMenu.name} onChangeText={name => setChangemenu({ ...changeMenu, name })}/>
                      <TouchableOpacity style={styles.changeMenuDone} onPress={() => saveTheMenu()}>
                        <Text style={styles.changeMenuDoneHeader}>Save Menu Name</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <ScrollView style={styles.changeMenuListBox} showsVerticalScrollIndicator={false}>
                    {displayListBox({ id: changeMenu.parentMenuid, name: "", image: "", list: changeMenu.list })}
                  </ScrollView>
                </View>

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
                              <TouchableOpacity style={[styles.uploadMenuCameraAction, { opacity: uploadMenubox.loading ? 0.5 : 1 }]} disabled={uploadMenubox.loading} onPress={() => saveTheMenu()}>
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
	menuBox: { backgroundColor: 'rgba(127, 127, 127, 0.1)', height: '100%', width: '100%' },
	box: { flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

	menuStart: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, paddingHorizontal: 10 },
	menuStartHeader: { fontSize: wsize(7), textAlign: 'center' },
  menuStartMessage: { fontSize: wsize(4), textAlign: 'center' },
  menuStartDiv: { fontSize: wsize(7), fontWeight: 'bold', marginVertical: 20 },

  boxMenu: { backgroundColor: 'rgba(0, 0, 0, 0.2)', marginBottom: 30, paddingVertical: 10, width: '100%' },
  boxMenuRow: {  },
  boxMenuImageHolder: { borderRadius: wsize(20) / 2, height: wsize(20), overflow: 'hidden', width: wsize(20) },
  boxMenuName: { color: 'black', fontSize: wsize(5), fontWeight: 'bold', marginLeft: 10, width: '70%' },
  boxMenuToggle: { marginHorizontal: 10 },
  boxMenuActions: { flexDirection: 'row' },
  boxMenuAction: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginLeft: 10, padding: 3 },
  boxMenuActionHeader: { fontSize: wsize(6), textAlign: 'center' },
  boxItemAdd: {  },
  boxItemAddHeader: {  },
  boxItem: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 5, borderStyle: 'solid', marginTop: 10, padding: 10 },
  boxItemRow: { flexDirection: 'row' },
  boxItemImageHolder: { borderRadius: wsize(10) / 2, height: wsize(10), overflow: 'hidden', width: wsize(10) },
  boxItemHeader: { fontSize: wsize(3) },
  boxItemPrice: { fontSize: wsize(3) },
  boxItemMiniHeader: { fontSize: wsize(3) },
  boxItemActions: { flexDirection: 'row' },
  boxItemAction: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5 },
  boxItemActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	menu: { backgroundColor: 'white', marginBottom: 30, paddingVertical: 10, width: '100%' },
  menuRow: {  },
	menuImageHolder: { borderRadius: wsize(20) / 2, height: wsize(20), overflow: 'hidden', width: wsize(20) },
	menuName: { color: 'black', fontSize: wsize(5), fontWeight: 'bold', marginLeft: 10, width: '70%' },
  menuToggle: { marginHorizontal: 10 },
	menuActions: { flexDirection: 'row' },
	menuAction: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginLeft: 10, padding: 3 },
	menuActionHeader: { fontSize: wsize(6), textAlign: 'center' },
  itemAdd: { borderColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, flexDirection: 'row', marginTop: 5, padding: 5 },
	itemAddHeader: { color: 'black', fontWeight: 'bold', marginRight: 5 },
  item: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', marginBottom: 10, paddingVertical: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: '2%' },
	itemImageHolder: { borderRadius: wsize(20) / 2, height: wsize(20), overflow: 'hidden', width: wsize(20) },
	itemHeader: { fontSize: wsize(4), fontWeight: 'bold', marginHorizontal: 10, textDecorationStyle: 'solid' },
  itemPrice: { fontSize: wsize(4.5) },
  itemMiniHeader: { fontSize: wsize(4) },
	itemActions: { flexDirection: 'row' },
	itemAction: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginLeft: 10, padding: 3 },
	itemActionHeader: { fontSize: wsize(6), textAlign: 'center' },

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
	uploadMenuActionHeader: { fontSize: wsize(4), textAlign: 'center' },
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
	productInfoImageHolder: { borderRadius: wsize(20) / 2, flexDirection: 'column', justifyContent: 'space-around', overflow: 'hidden', width: wsize(20) },
	productInfoName: { fontSize: wsize(5), fontWeight: 'bold' },
	productInfoOptionHeader: { fontSize: wsize(3) },
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

  changeMenuContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  changeMenuBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '95%', justifyContent: 'space-between', width: '95%' },
  changeMenuClose: { borderRadius: wsize(8) / 2, borderStyle: 'solid', borderWidth: 5, marginVertical: 20 },
  changeMenuHeader: { fontSize: wsize(5) },
  changeMenuPhotoHolder: { height: wsize(20), width: wsize(20) },
  changeMenuInput: { borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), marginHorizontal: '5%', padding: 5, width: '100%' },
  changeMenuListBox: { paddingHorizontal: '5%', width: '100%' },
  changeMenuDone: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 10, padding: 10, width: '50%' },
  changeMenuDoneHeader: { fontSize: wsize(3), textAlign: 'center' },

  loading: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  column: { flexDirection: 'column', justifyContent: 'space-around' },
})
