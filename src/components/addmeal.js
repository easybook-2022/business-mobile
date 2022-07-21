import React, { useEffect, useState } from 'react'
import { 
  SafeAreaView, Platform, ActivityIndicator, Dimensions, ScrollView, Modal, View, Text, 
  TextInput, Image, Keyboard, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, PermissionsAndroid
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker';
import { getId, resizePhoto } from 'geottuse-tools';
import { tr } from '../../assets/translate'
import { logo_url } from '../../assets/info'
import { getProductInfo, addNewProduct, updateProduct } from '../apis/products'

import FontAwesome from 'react-native-vector-icons/FontAwesome'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import Ionicons from 'react-native-vector-icons/Ionicons'

// widgets
import Loadingprogress from '../widgets/loadingprogress';

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}
const steps = ['name', 'photo', 'sizes']

export default function Addmeal(props) {
  const params = props.route.params
  const { parentMenuid, productid } = params
  
  const [setupType, setSetuptype] = useState('name')
  const [cameraPermission, setCamerapermission] = useState(null);
  const [pickingPermission, setPickingpermission] = useState(null);
  const [camComp, setCamcomp] = useState(null)
  const [camType, setCamtype] = useState('back')
  const [choosing, setChoosing] = useState(false)
  const [name, setName] = useState('')
  const [image, setImage] = useState({ uri: '', name: '', size: { height: 0, width: 0 }, loading: false })
  const [sizes, setSizes] = useState([])
  const [newSizeinfo, setNewsizeinfo] = useState({ show: false, sizes: ['Small', 'Medium', 'Large', 'Extra Large'], selected: '', price: '' })
  const [price, setPrice] = useState('')
  const [loaded, setLoaded] = useState(productid ? false : true)
  const [loading, setLoading] = useState(false)
  
  const [errorMsg, setErrormsg] = useState('')

  const addTheNewMeal = async() => {
    const locationid = await AsyncStorage.getItem("locationid")
    const sizenames = { "small": false, "medium": false, "large": false, "extra large": false }
    const newSize = [...sizes]

    setErrormsg("")

    for (let k = 0; k < newSize.length; k++) {
      if (!newSize[k].name) {
        setErrormsg("One of the size is not selected")

        return
      }

      if (!newSize[k].price) {
        setErrormsg("One of the size's price is not provided")

        return
      } else if (isNaN(newSize[k].price)) {
        setErrormsg("One of the size's price is invalid")

        return
      }

      if (!sizenames[newSize[k].name]) {
        sizenames[newSize[k].name] = true
      } else {
        setErrormsg("There are two or more similar sizes")

        return
      }
    }

    if (name && (newSize.length > 0 || (price && !isNaN(price)))) {
      newSize.forEach(function (size) {
        delete size['key']
      })

      const data = { locationid, menuid: parentMenuid > -1 ? parentMenuid : "", name, image, sizes: newSize, price: sizes.length > 0 ? "" : price }

      setLoading(true)

      addNewProduct(data)
        .then((res) => {
          if (res.status == 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            setLoading(false)

            props.navigation.goBack()
          }
        })
        .catch((err) => {
          if (err.response && err.response.status == 400) {
            const { errormsg, status } = err.response.data

            setErrormsg(errormsg)
          }

          setLoading(false)
        })
    } else {
      if (!name) {
        setErrormsg("Please enter the product name")

        return
      }

      if (sizes.length == 0 && !price) {
        setErrormsg("Please enter the price of the product")

        return
      } else if (isNaN(price)) {
        setErrormsg("The price you entered is invalid")

        return
      }
    }
  }
  const updateTheMeal = async() => {
    const locationid = await AsyncStorage.getItem("locationid")
    const sizenames = { "small": false, "medium": false, "large": false, "extra large": false }

    setErrormsg("")

    for (let k = 0; k < sizes.length; k++) {
      if (!sizes[k].name) {
        setErrormsg("One of the size is not named")

        return
      }

      if (!sizes[k].price) {
        setErrormsg("One of the size's price is not provided")

        return
      } else if (isNaN(sizes[k].price)) {
        setErrormsg("One of the size's price is invalid")

        return
      }

      if (!sizenames[sizes[k].name]) {
        sizenames[sizes[k].name] = true
      } else {
        setErrormsg("There are two or more similar sizes")

        return
      }
    }

    if (name && (sizes.length > 0 || (price && !isNaN(price)))) {
      sizes.forEach(function (size) {
        delete size['key']
      })

      const data = { locationid, menuid: parentMenuid > -1 ? parentMenuid : "", productid, name, image, sizes, price: sizes.length > 0 ? "" : price }

      setLoading(true)

      updateProduct(data)
        .then((res) => {
          if (res.status == 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            setLoading(false)
            
            props.navigation.goBack()
          }
        })
        .catch((err) => {
          if (err.response && err.response.status == 400) {
            const { errormsg, status } = err.response.data

            setErrormsg(errormsg)
          }

          setLoading(false)
        })
    } else {
      if (!name) {
        setErrormsg("Please enter the product name")

        return
      }

      if (sizes.length == 0 && !price) {
        setErrormsg("Please enter the price of the product")

        return
      } else if (isNaN(price)) {
        setErrormsg("The price you entered is invalid")

        return
      }
    }
  }
  const saveInfo = () => {
    const index = steps.indexOf(setupType)
    let msg = ""

    setLoading(true)

    switch (index) {
      case 0:
        if (!name) {
          msg = "Please enter meal name"
        }

        break
      default:

    }

    if (msg == "") {
      const nextStep = index == 2 ? "done" : steps[index + 1]

      if (nextStep == "photo") {
        allowCamera()
        allowChoosing()
      }

      setSetuptype(nextStep)
      setErrormsg('')
    } else {
      setErrormsg(msg)
    }

    setLoading(false)
  }
  const snapPhoto = async() => {
    setImage({ ...image, loading: true })

    if (camComp) {
      let options = { quality: 0, skipProcessing: true };
      let char = getId(), photo = await camComp.takePictureAsync(options)
      let photo_option = [{ resize: { width, height: width }}]
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
        setImage({ 
          ...image, 
          uri: `${FileSystem.documentDirectory}/${char}.jpg`, name: `${char}.jpg`, loading: false, 
          size: { width, height: width }
        })
        setErrormsg('')
      })
    }
  }
  const choosePhoto = async() => {
    setChoosing(true)

    let char = getId(), photo = await ImagePicker.launchImageLibraryAsync({
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
        setImage({ 
          ...image, uri: `${FileSystem.documentDirectory}/${char}.jpg`, name: `${char}.jpg`, loading: false, 
          size: { width: photo.width, height: photo.height }
        })
        setErrormsg('')
      })
    }

    setChoosing(false)
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
            message: "EasyBook Business allows you to take a photo for product",
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
  const getTheMealInfo = async() => {
    getProductInfo(productid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { productImage, name, sizes, price } = res.productInfo
          const newOptions = [], newOthers = [], newSizes = []

          setName(name)
          setImage({ ...image, uri: productImage.name ? logo_url + productImage.name : "" })
          setPrice(price)

          sizes.forEach(function (size, index) {
            newSizes.push({
              key: "size-" + index.toString(),
              name: size.name,
              price: size.price
            })
          })

          setSizes(newSizes)
          setLoaded(true)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }

  useEffect(() => {
    if (productid) getTheMealInfo()
  }, [])

  return (
    <SafeAreaView style={[styles.addmeal, { opacity: loading ? 0.5 : 1 }]}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        {loaded ? 
          <View style={styles.box}>
            {setupType == "name" && (
              <View style={styles.inputContainer}>
                <Text style={styles.addHeader}>{tr.t("addmeal.name")}</Text>

                <TextInput 
                  style={styles.addInput} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="example: pencil" 
                  onChangeText={(name) => setName(name)} value={name} autoCorrect={false} autoCompleteType="off" 
                  autoCapitalize="none"
                />
              </View>
            )}

            {setupType == "photo" && (
              <View style={styles.cameraContainer}>
                <Text style={styles.cameraHeader}>{tr.t("addmeal.photo")}</Text>

                {image.uri ? (
                  <>
                    <Image style={styles.camera} source={{ uri: image.uri }}/>

                    <TouchableOpacity style={styles.cameraAction} onPress={() => setImage({ ...image, uri: '', name: '' })}>
                      <Text style={styles.cameraActionHeader}>{tr.t("buttons.cancel")}</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {!choosing && (
                      <>
                        <Camera 
                          style={styles.camera} 
                          type={camType} 
                          ref={r => {setCamcomp(r)}}
                          ratio="1:1"
                        />

                        <View style={{ alignItems: 'center', marginTop: -wsize(7) }}>
                          <Ionicons name="camera-reverse-outline" size={wsize(7)} onPress={() => setCamtype(camType == 'back' ? 'front' : 'back')}/>
                        </View>
                      </>
                    )}

                    <View style={styles.cameraActions}>
                      <TouchableOpacity style={[styles.cameraAction, { opacity: image.loading ? 0.5 : 1 }]} disabled={image.loading} onPress={snapPhoto.bind(this)}>
                        <Text style={styles.cameraActionHeader}>{tr.t("buttons.takePhoto")}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.cameraAction, { opacity: image.loading ? 0.5 : 1 }]} disabled={image.loading} onPress={() => {
                        allowChoosing()
                        choosePhoto()
                      }}>
                        <Text style={styles.cameraActionHeader}>{tr.t("buttons.choosePhoto")}</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}  
              </View>
            )}

            {setupType == "sizes" && (
              sizes.length > 0 ?
                <ScrollView style={{ height: '80%', width: '100%' }}>
                  <View style={{ alignItems: 'center', width: '100%' }}>
                    <TouchableOpacity style={styles.addOption} onPress={() => setNewsizeinfo({ ...newSizeinfo, show: true })}>
                      <Text style={styles.addOptionHeader}>{tr.t("addmeal.price.sizes")}</Text>
                    </TouchableOpacity>

                    <View style={styles.sizes}>
                      {sizes.map((size, index) => (
                        <View key={size.key} style={styles.size}>
                          <TouchableOpacity style={styles.sizeRemove} onPress={() => {
                            let newSizes = [...sizes]

                            newSizes.splice(index, 1)

                            setSizes(newSizes)
                          }}>
                            <FontAwesome name="close" size={40}/>
                          </TouchableOpacity>
                          <View style={styles.sizeTypesBox}>
                            <View style={styles.sizeTypes}>
                              {["Small", "Medium", "Large", "Extra large"].map((sizeopt, sizeindex) => (
                                <TouchableOpacity key={sizeindex.toString()} style={size.name == sizeopt.toLowerCase() ? styles.sizeTypeSelected : styles.sizeType} onPress={() => {
                                  let newSizes = [...sizes]

                                  newSizes[index].name = sizeopt.toLowerCase()

                                  setSizes(newSizes)
                                }}>
                                  <Text style={size.name == sizeopt.toLowerCase() ? styles.sizeTypeHeaderSelected : styles.sizeTypeHeader}>{sizeopt}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                            <Text style={styles.sizeTypesHeader}>$ {size.price}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </ScrollView>
                :
                <View style={{ alignItems: 'center', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
                  <TouchableOpacity style={styles.addOption} onPress={() => setNewsizeinfo({ ...newSizeinfo, show: true })}>
                    <Text style={styles.addOptionHeader}>{tr.t("addmeal.price.sizes")}</Text>
                  </TouchableOpacity>

                  <Text style={{ fontSize: wsize(6), fontWeight: 'bold', marginVertical: 20 }}>or</Text>

                  <View style={styles.priceBox}>
                    <Text style={styles.priceHeader}>{tr.t("addmeal.price.size")}</Text>
                    <TextInput style={styles.priceInput} placeholderTextColor="rgba(0, 0, 0, 0.5)" placeholder="4.99" onChangeText={(price) => {
                      let newPrice = price.toString()

                      if (newPrice.includes(".") && newPrice.split(".")[1].length == 2) {
                        Keyboard.dismiss()
                      }

                      setPrice(price.toString())
                    }} value={price.toString()} keyboardType="numeric" autoCorrect={false} autoCapitalize="none"/>
                  </View>
                </View>
            )}

            <Text style={styles.errorMsg}>{errorMsg}</Text>

            <View style={{ flexDirection: 'row' }}>
              <View style={styles.addActions}>
                <TouchableOpacity style={styles.addAction} disabled={loading} onPress={() => props.navigation.goBack()}>
                  <Text style={styles.addActionHeader}>{tr.t("buttons.cancel")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addAction} disabled={loading} onPress={() => {
                  if (!productid) {
                    if (setupType == "sizes") {
                      addTheNewMeal()
                    } else {
                      saveInfo()
                    }
                  } else {
                    if (setupType == "sizes") {
                      updateTheMeal()
                    } else {
                      saveInfo()
                    }
                  }
                }}>
                  <Text style={styles.addActionHeader}>{
                    !productid ? // new meal
                      steps.indexOf(setupType) < steps.length - 1 ? 
                        setupType == "photo" ?
                          image.uri ? 
                            tr.t("buttons.next")
                            :
                            tr.t("buttons.skip")
                          : 
                          tr.t("buttons.next") 
                        : 
                        tr.t("buttons.done") 
                      : // editing meal
                      steps.indexOf(setupType) < steps.length - 1 ? 
                        setupType == "photo" ? 
                          image.uri ? 
                            tr.t("buttons.next") 
                            : 
                            tr.t("buttons.skip") 
                          : 
                          tr.t("buttons.next") 
                        :
                        tr.t("buttons.done")
                  }</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          :
          <View style={styles.loading}>
            <ActivityIndicator color="black" size="large"/>
          </View>
        }
      </TouchableWithoutFeedback>

      {(image.loading || loading) && <Modal transparent={true}><Loadingprogress/></Modal>}
      {newSizeinfo.show && (
        <Modal transparent={true}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.newSizeBox}>
              <View style={styles.newSizeContainer}>
                <Text style={styles.newSizeHeader}>New size info</Text>

                <View style={styles.sizeTypesBox}>
                  <View style={{ marginVertical: 20 }}>
                    <Text style={styles.sizeTypesHeader}>Select size:</Text>
                    <View style={styles.sizeTypes}>
                      {["Small", "Medium"].map((sizeopt, sizeindex) => (
                        <TouchableOpacity key={sizeindex.toString()} style={newSizeinfo.selected == sizeopt.toLowerCase() ? styles.sizeTypeSelected : styles.sizeType} onPress={() => setNewsizeinfo({ ...newSizeinfo, selected: sizeopt.toLowerCase() })}>
                          <Text style={newSizeinfo.selected == sizeopt.toLowerCase() ? styles.sizeTypeHeaderSelected : styles.sizeTypeHeader}>{sizeopt}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View style={styles.sizeTypes}>
                      {["Large", "Extra large"].map((sizeopt, sizeindex) => (
                        <TouchableOpacity key={sizeindex.toString()} style={newSizeinfo.selected == sizeopt.toLowerCase() ? styles.sizeTypeSelected : styles.sizeType} onPress={() => setNewsizeinfo({ ...newSizeinfo, selected: sizeopt.toLowerCase() })}>
                          <Text style={newSizeinfo.selected == sizeopt.toLowerCase() ? styles.sizeTypeHeaderSelected : styles.sizeTypeHeader}>{sizeopt}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <TextInput style={styles.newSizeInput} placeholderTextColor="rgba(0, 0, 0, 0.5)" placeholder="4.99" value={newSizeinfo.price.toString()} onChangeText={(price) => setNewsizeinfo({ ...newSizeinfo, price: price.toString() })} keyboardType="numeric" autoCorrect={false} autoCapitalize="none"/>
                  <TouchableOpacity style={styles.newSizeDone} onPress={() => {
                    let new_key

                    if (sizes.length > 0) {
                      let last_size = sizes[sizes.length - 1]

                      new_key = parseInt(last_size.key.split("-")[1]) + 1
                    } else {
                      new_key = 0
                    }

                    setSizes([...sizes, { key: "size-" + new_key.toString(), name: newSizeinfo.selected, price: newSizeinfo.price }])
                    setNewsizeinfo({ ...newSizeinfo, show: false, selected: "", price: "" })
                  }}>
                    <Text style={styles.newSizeDoneHeader}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  addmeal: { height: '100%', paddingTop: Platform.OS == "ios" ? 0 : Constants.statusBarHeight, width: '100%' },
  box: { alignItems: 'center', paddingTop: 10, width: '100%' },
  inputContainer: { alignItems: 'center', width: '100%' },
  addHeader: { fontSize: wsize(5), fontWeight: 'bold', paddingVertical: 5, textAlign: 'center' },
  addInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, fontSize: wsize(5), padding: 10, width: '90%' },
  
  cameraContainer: { alignItems: 'center', width: '100%' },
  cameraHeader: { fontSize: wsize(5), fontWeight: 'bold', paddingVertical: 5 },
  camera: { height: width, width },
  cameraActions: { flexDirection: 'row' },
  cameraAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginBottom: 50, margin: 5, padding: 5, width: wsize(30) },
  cameraActionHeader: { fontSize: wsize(3), textAlign: 'center' },

  addOption: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 10 },
  addOptionHeader: { fontSize: wsize(6) }, 

  sizes: { marginBottom: 10, width: '95%' },
  size: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 5, marginVertical: 10, paddingVertical: 10 },
  sizeRemove: { alignItems: 'center', borderRadius: 27.5, borderStyle: 'solid', borderWidth: 2, height: 45, width: 45 },
  sizeTypesBox: { alignItems: 'center' },
  sizeTypesHeader: { fontSize: wsize(7), fontWeight: 'bold', margin: 5 },
  sizeTypes: { flexDirection: 'row' },
  sizeType: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 10 },
  sizeTypeSelected: { alignItems: 'center', backgroundColor: 'black', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 10 },
  sizeTypeHeader: { fontSize: wsize(4) },
  sizeTypeHeaderSelected: { color: 'white', fontSize: wsize(4) },
  
  priceBox: { alignItems: 'center', marginBottom: 30 },
  priceHeader: { fontSize: wsize(6), fontWeight: 'bold', padding: 5 },
  priceInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(9), padding: 5, textAlign: 'center', width: wsize(50) },
  
  addActions: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  addAction: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(6), padding: 5, width: wsize(30) },
  addActionHeader: { fontSize: wsize(4) },

  // hidden boxes
  // new size
  newSizeBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  newSizeContainer: { backgroundColor: 'white', height: '80%', width: '80%' },
  newSizeHeader: { fontSize: wsize(6), fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
  newSizeInput: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(9), height: 50, padding: 3, textAlign: 'center', width: 150 }, 
  newSizeDone: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 20, padding: 5, width: '50%' },
  newSizeDoneHeader: { fontSize: wsize(6), textAlign: 'center' },

  loading: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  errorMsg: { color: 'darkred', fontSize: wsize(4), textAlign: 'center' },
})
