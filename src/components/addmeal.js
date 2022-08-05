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
const steps = ['name', 'photo', 'options']

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
  const [quantities, setQuantities] = useState([])
  const [percents, setPercents] = useState([])
  const [sizeInfo, setSizeinfo] = useState({ show: false, sizes: ['Small', 'Medium', 'Large', 'Extra Large'], selected: '', price: '', errorMsg: '' })
  const [quantityInfo, setQuantityinfo] = useState({ show: false, input: '', price: '', errorMsg: '' })
  const [percentInfo, setPercentinfo] = useState({ show: false, input: '', price: '', errorMsg: '' })
  const [price, setPrice] = useState('')
  const [loaded, setLoaded] = useState(productid ? false : true)
  const [changeInfo, setChangeinfo] = useState({ 
    show: false, type: '', errorMsg: '', loading: false, optionsEdit: '', 
    name: '', price: '', optionInfo: { selected: '', input: '', price: '' },
    image: { uri: '', name: '', size: { height: 0, width: 0 }, remove: false }, 
    sizes: [], quantities: [], percents: [], 
    loading: false
  })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrormsg] = useState('')

  const addTheNewMeal = async() => {
    const locationid = await AsyncStorage.getItem("locationid")
    const sizenames = { "small": false, "medium": false, "large": false, "extra large": false }
    const newSizes = [...sizes], newQuantities = [...quantities], newPercents = [...percents]

    setErrormsg("")

    for (let k = 0; k < newSizes.length; k++) {
      if (!sizenames[newSizes[k].name]) {
        sizenames[newSizes[k].name] = true
      } else {
        setErrormsg("There are two or more similar sizes")

        return
      }
    }

    if (name && ((sizes.length > 0 || quantities.length > 0) || (price && !isNaN(price)))) {
      newSizes.forEach(function (info) {
        delete info['key']
      })
      newQuantities.forEach(function (info) {
        delete info['key']
      })
      newPercents.forEach(function (info) {
        delete info['key']
      })

      const data = { 
        locationid, menuid: parentMenuid > -1 ? parentMenuid : "", name, image, 
        options: {"sizes": newSizes, "quantities": newQuantities, "percents": newPercents}, price: sizes.length > 0 ? "" : price 
      }

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
    const { type, optionsEdit, optionInfo } = changeInfo
    let data = { locationid, type, menuid: parentMenuid > -1 ? parentMenuid : "", productid }

    switch (type) {
      case "name":
        if (name) {
          data = { ...data, name: changeInfo.name }
        } else {
          setChangeinfo({ ...changeInfo, errorMsg: "Please enter the product name" })

          return
        }

        break;
      case "photo":
        data = { ...data, image: changeInfo.image }

        break;
      case "price":
        data = { ...data, price: changeInfo.price ? changeInfo.price : optionInfo.price }

        break;
      case "options":
        const sizenames = { "small": false, "medium": false, "large": false, "extra large": false }
        const newSizes = [...changeInfo.sizes], newQuantities = [...changeInfo.quantities], newPercents = [...changeInfo.percents]

        for (let k = 0; k < sizes.length; k++) {
          if (!sizenames[sizes[k].name]) {
            sizenames[sizes[k].name] = true
          } else {
            setChangeinfo({ ...changeInfo, errorMsg: "There are two or more similar sizes" })

            return
          }
        }

        if (sizes.length > 0 || quantities.length > 0 || (price && !isNaN(price))) {
          newSizes.forEach(function (info) {
            delete info['key']
          })
          newQuantities.forEach(function (info) {
            delete info['key']
          })
          newPercents.forEach(function (info) {
            delete info['key']
          })

          data = {
            ...data, 
            options: {"sizes": newSizes, "quantities": newQuantities, "percents": newPercents}
          }
        } else {
          if (sizes.length == 0 && !price) {
            setChangeinfo({ ...changeInfo, errorMsg: "Please enter the price of the product" })

            return
          } else if (isNaN(price)) {
            setChangeinfo({ ...changeInfo, errorMsg: "The price you entered is invalid" })

            return
          }
        }

        break;
      default:
    }
        
    setChangeinfo({ ...changeInfo, errorMsg: "", loading: true })

    updateProduct(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          switch (type) {
            case "name":
              setName(changeInfo.name)

              break;
            case "photo":
              const { uri, name, size } = changeInfo.image

              setImage({ ...image, uri, name, size })

              break;
            case "price":
              setPrice(changeInfo.price)

              break;
            case "options":
              setSizes(changeInfo.sizes)
              setQuantities(changeInfo.quantities)
              setPercents(changeInfo.percents)

              break;
          }

          setChangeinfo({ 
            ...changeInfo, show: false, type: '', image: {...changeInfo.image, remove: false },
            errorMsg: "", loading: false 
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data

          setChangeinfo({ ...changeInfo, errorMsg: errormsg })
        }

        setChangeinfo({ ...changeInfo, loading: false })
      })
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
      const nextStep = index == steps.length - 1 ? "done" : steps[index + 1]

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
    if (!productid) {
      setImage({ ...image, loading: true })
    } else {
      setChangeinfo({ ...changeInfo, loading: true })
    }

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
        if (!productid) {
          setImage({ 
            ...image, 
            uri: `${FileSystem.documentDirectory}/${char}.jpg`, name: `${char}.jpg`, loading: false, 
            size: { width, height: width }
          })
          setErrormsg('')
        } else {
          setChangeinfo({ 
            ...changeInfo, 
            image: { 
              ...changeInfo.image, uri: `${FileSystem.documentDirectory}/${char}.jpg`, 
              name: `${char}.jpg`, 
              size: { width, height: width }
            },
            loading: false
          })
        }
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
          const { productImage, name, sizes, quantities, percents, price } = res.productInfo

          setName(name)
          setImage({ ...image, uri: productImage.name ? logo_url + productImage.name : "" })
          setPrice(price)
          setSizes(sizes)
          setQuantities(quantities)
          setPercents(percents)
          setChangeinfo({ ...changeInfo, price })
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

  useEffect(() => {
    if (changeInfo.image.remove == true) updateTheMeal()
  }, [changeInfo.image.remove])

  return (
    <SafeAreaView style={[styles.addmeal, { opacity: loading ? 0.5 : 1 }]}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        {loaded ? 
          !productid ? 
            setupType == "name" || setupType == "photo" ? 
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
              <ScrollView style={{ height: '100%', width: '100%' }}>
                <View style={{ alignItems: 'center', width: '100%' }}>
                  <View style={[styles.addOptionBox, { flexDirection: 'row' }]}>
                    <View style={styles.column}>
                      <TouchableOpacity style={styles.addOption} onPress={() => setSizeinfo({ ...sizeInfo, show: true })}>
                        <Text style={styles.addOptionHeader}>{tr.t("addmeal.price.sizes")}</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.column}><Text style={{ fontSize: wsize(6), fontWeight: 'bold', marginHorizontal: 10 }}>or</Text></View>
                    <View style={styles.column}>
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
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 50 }}>
                    <TouchableOpacity style={[styles.addOption, { margin: 10 }]} onPress={() => setQuantityinfo({ ...quantityInfo, show: true })}>
                      <Text style={styles.addOptionHeader}>{tr.t("addmeal.price.quantity")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.addOption, { margin: 10 }]} onPress={() => setPercentinfo({ ...percentInfo, show: true })}>
                      <Text style={styles.addOptionHeader}>{tr.t("addmeal.price.percent")}</Text>
                    </TouchableOpacity>
                  </View>

                  {(sizes.length > 0 || quantities.length > 0 || percents.length > 0) && (
                    <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)', width: '100%' }}>
                      <Text style={styles.optionsHeader}>Selected option(s)</Text>
                      <View style={{ alignItems: 'center', width: '100%' }}>
                        <View style={styles.options}>
                          {sizes.map((size, index) => (
                            <View key={size.key} style={styles.option}>
                              <TouchableOpacity style={styles.optionRemove} onPress={() => {
                                let newOptions = [...sizes]

                                newOptions.splice(index, 1)

                                setSizes(newOptions)
                              }}>
                                <FontAwesome name="close" size={25}/>
                              </TouchableOpacity>
                              <View style={styles.optionTypeSelected}>
                                <Text style={styles.optionTypeSelectedHeader}>{size.name}</Text>
                              </View>
                              <Text style={styles.optionTypesHeader}>$ {size.price}</Text>
                            </View>
                          ))}
                          {quantities.map((quantity, index) => (
                            <View key={quantity.key} style={styles.option}>
                              <TouchableOpacity style={styles.optionRemove} onPress={() => {
                                let newOptions = [...quantities]

                                newOptions.splice(index, 1)

                                setQuantities(newOptions)
                              }}>
                                <FontAwesome name="close" size={25}/>
                              </TouchableOpacity>
                              <View style={styles.optionTypeSelected}>
                                <Text style={styles.optionTypeSelectedHeader}>{quantity.input}</Text>
                              </View>
                              <Text style={styles.optionTypesHeader}>$ {quantity.price}</Text>
                            </View>
                          ))}
                          {percents.map((percent, index) => (
                            <View key={percent.key} style={styles.option}>
                              <TouchableOpacity style={styles.optionRemove} onPress={() => {
                                let newOptions = [...percents]

                                newOptions.splice(index, 1)

                                setPercents(newOptions)
                              }}>
                                <FontAwesome name="close" size={25}/>
                              </TouchableOpacity>
                              <View style={styles.optionTypeSelected}>
                                <Text style={styles.optionTypeSelectedHeader}>{percent.input}</Text>
                              </View>
                              <Text style={styles.optionTypesHeader}>$ {percent.price}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  )}
                </View>

                <Text style={styles.errorMsg}>{errorMsg}</Text>

                <View style={{ flexDirection: 'row' }}>
                  <View style={styles.addActions}>
                    <TouchableOpacity style={styles.addAction} disabled={loading} onPress={() => props.navigation.goBack()}>
                      <Text style={styles.addActionHeader}>{tr.t("buttons.cancel")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addAction} disabled={loading} onPress={() => {
                      if (!productid) {
                        if (setupType == steps[steps.length - 1]) {
                          addTheNewMeal()
                        } else {
                          saveInfo()
                        }
                      } else {
                        if (setupType == steps[steps.length - 1]) {
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
              </ScrollView>
            :
            <View style={styles.updateInfoContainer}>
              <View style={styles.updateInfoBox}>
                 <Text style={styles.updateHeader}>{name}</Text>
                <View style={{ flexDirection: 'row' }}>
                  <View>
                    <View style={styles.updateInfoPhotoHolder}>
                      <Image style={{ height: '100%', width: '100%' }} source={image.uri ? { uri: image.uri } : require("../../assets/noimage.jpeg")}/>
                    </View>
                  </View>
                  <View>
                    {price ? 
                      <Text style={styles.updateInfoOption}>$ {price}</Text>
                      :
                      <>
                        {sizes.map(size => <Text key={size.key} style={styles.updateInfoOption}>{size.name}: ${size.price}</Text>)}
                        {quantities.map(quantity => <Text key={quantity.key} style={styles.updateInfoOption}>{quantity.input}: ${quantity.price}</Text>)}
                      </>
                    }
                        
                    {percents.map(percent => <Text key={percent.key} style={styles.updateInfoOption}>{percent.input}: ${percent.price}</Text>)}
                  </View>
                </View>
              </View>

              <View style={styles.updateInfoActions}>
                <TouchableOpacity style={styles.updateInfoAction} onPress={() => setChangeinfo({ ...changeInfo, show: true, type: 'name', name })}>
                  <Text style={styles.updateInfoActionHeader}>Change <Text style={{ fontWeight: 'bold' }}>Name</Text></Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.updateInfoAction} onPress={() => setChangeinfo({ ...changeInfo, show: true, type: 'price', price })}>
                  <Text style={styles.updateInfoActionHeader}>Change <Text style={{ fontWeight: 'bold' }}>ONE Price ($)</Text></Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.updateInfoAction} onPress={() => setChangeinfo({ ...changeInfo, show: true, type: 'photo', image: {...changeInfo.image, uri: '', name: '', size: { width: 0, height: 0 }}})}>
                  <Text style={styles.updateInfoActionHeader}>Change <Text style={{ fontWeight: 'bold' }}>Photo</Text></Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.updateInfoAction} onPress={() => setChangeinfo({ ...changeInfo, show: true, type: 'options', sizes: [...sizes], quantities: [...quantities], percents: [...percents] })}>
                  <Text style={styles.updateInfoActionHeader}>Change{'\n'}<Text style={{ fontWeight: 'bold' }}>(Size, Quantity, Percentage)</Text></Text>
                </TouchableOpacity>
              </View>
            </View>
          :
          <View style={styles.loading}>
            <ActivityIndicator color="black" size="large"/>
          </View>
        }
      </TouchableWithoutFeedback>

      {(image.loading || loading) && <Modal transparent={true}><Loadingprogress/></Modal>}
      {sizeInfo.show && (
        <Modal transparent={true}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.newSizeBox}>
              <View style={styles.newSizeContainer}>
                <TouchableOpacity style={styles.newSizeClose} onPress={() => setSizeinfo({ ...sizeInfo, show: false })}>
                  <AntDesign name="close" size={30}/>
                </TouchableOpacity>

                <Text style={styles.newSizeHeader}>New size info</Text>

                <View style={styles.newSizesBox}>
                  <View style={{ marginVertical: 20 }}>
                    <Text style={styles.newSizesHeader}>Select size:</Text>
                    <View style={styles.newSizes}>
                      {["Small", "Medium"].map((sizeopt, sizeindex) => (
                        <TouchableOpacity key={sizeindex.toString()} style={sizeInfo.selected == sizeopt ? styles.newSizeSelected : styles.newSize} onPress={() => setSizeinfo({ ...sizeInfo, selected: sizeopt })}>
                          <Text style={sizeInfo.selected == sizeopt ? styles.newSizeSelectedHeader : styles.newSizeHeader}>{sizeopt}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View style={styles.newSizes}>
                      {["Large", "Extra large"].map((sizeopt, sizeindex) => (
                        <TouchableOpacity key={sizeindex.toString()} style={sizeInfo.selected == sizeopt ? styles.newSizeSelected : styles.newSize} onPress={() => setSizeinfo({ ...sizeInfo, selected: sizeopt })}>
                          <Text style={sizeInfo.selected == sizeopt ? styles.newSizeSelectedHeader : styles.newSizeHeader}>{sizeopt}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <TextInput style={styles.newSizeInput} placeholderTextColor="rgba(0, 0, 0, 0.5)" placeholder="4.99" value={sizeInfo.price.toString()} onChangeText={(price) => setSizeinfo({ ...sizeInfo, price: price.toString() })} keyboardType="numeric" autoCorrect={false} autoCapitalize="none"/>
                  <TouchableOpacity style={styles.newSizeDone} onPress={() => {
                    const { selected, price } = sizeInfo

                    if (selected && price) {
                      let new_key

                      if (sizes.length > 0) {
                        let last_size = sizes[sizes.length - 1]

                        new_key = parseInt(last_size.key.split("-")[1]) + 1
                      } else {
                        new_key = 0
                      }

                      setSizes([...sizes, { key: "size-" + new_key.toString(), name: sizeInfo.selected, price: sizeInfo.price }])
                      setSizeinfo({ ...sizeInfo, show: false, selected: "", price: "" })
                    } else {
                      setSizeinfo({ ...sizeInfo, errorMsg: "Size or price is empty" })
                    }
                  }}>
                    <Text style={styles.newSizeDoneHeader}>Add</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.errorMsg}>{sizeInfo.errorMsg}</Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
      {quantityInfo.show && (
        <Modal transparent={true}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.newQuantityBox}>
              <View style={styles.newQuantityContainer}>
                <TouchableOpacity style={styles.newQuantityClose} onPress={() => setQuantityinfo({ ...quantityInfo, show: false })}>
                  <AntDesign name="close" size={30}/>
                </TouchableOpacity>

                <Text style={styles.newQuantityHeader}>New quantity info</Text>

                <TextInput style={styles.newQuantityInput} placeholderTextColor="rgba(0, 0, 0, 0.5)" placeholder="Cream" onChangeText={quantity => setQuantityinfo({ ...quantityInfo, input: quantity })}/>
                <TextInput style={styles.newQuantityInput} placeholderTextColor="rgba(0, 0, 0, 0.5)" placeholder="4.99" value={quantityInfo.price.toString()} onChangeText={(price) => setQuantityinfo({ ...quantityInfo, price: price.toString() })} keyboardType="numeric" autoCorrect={false} autoCapitalize="none"/>

                <TouchableOpacity style={styles.newQuantityDone} onPress={() => {
                  const { input, price } = quantityInfo

                  if (input && price) {
                    let new_key

                    if (quantities.length > 0) {
                      let last_quantity = quantities[quantities.length - 1]

                      new_key = parseInt(last_quantity.key.split("-")[1]) + 1
                    } else {
                      new_key = 0
                    }

                    setQuantities([...quantities, { key: "quantity-" + new_key.toString(), input: quantityInfo.input, price: quantityInfo.price }])
                    setQuantityinfo({ ...quantityInfo, show: false, input: "", price: "" })
                  } else {
                    setQuantityinfo({ ...quantityInfo, errorMsg: "Name or price is empty" })
                  }
                }}>
                  <Text style={styles.newQuantityDoneHeader}>Add</Text>
                </TouchableOpacity>

                <Text style={styles.errorMsg}>{quantityInfo.errorMsg}</Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
      {percentInfo.show && (
        <Modal transparent={true}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.newPercentBox}>
              <View style={styles.newPercentContainer}>
                <TouchableOpacity style={styles.newPercentClose} onPress={() => setPercentinfo({ ...percentInfo, show: false })}>
                  <AntDesign name="close" size={30}/>
                </TouchableOpacity>

                <Text style={styles.newPercentHeader}>New percentage info</Text>

                <TextInput style={styles.newPercentInput} placeholderTextColor="rgba(0, 0, 0, 0.5)" placeholder="Sugar" onChangeText={input => setPercentinfo({ ...percentInfo, input })}/>
                <TextInput style={styles.newPercentInput} placeholderTextColor="rgba(0, 0, 0, 0.5)" placeholder="4.99" value={percentInfo.price.toString()} onChangeText={price => setPercentinfo({ ...percentInfo, price: price.toString() })} keyboardType="numeric" autoCorrect={false} autoCapitalize="none"/>

                <TouchableOpacity style={styles.newPercentDone} onPress={() => {
                  const { input, price } = percentInfo

                  if (input && price) {
                    let new_key

                    if (percents.length > 0) {
                      let last_percent = percents[percents.length - 1]

                      new_key = parseInt(last_percent.key.split("-")[1]) + 1
                    } else {
                      new_key = 0
                    }

                    setPercents([...percents, { key: "percent-" + new_key.toString(), input: percentInfo.input, price: percentInfo.price }])
                    setPercentinfo({ ...percentInfo, show: false, input: "", price: "" })
                  } else {
                    setPercentinfo({ ...percentInfo, errorMsg: "Name or price is empty" })
                  }
                }}>
                  <Text style={styles.newPercentDoneHeader}>Add</Text>
                </TouchableOpacity>

                <Text style={styles.errorMsg}>{percentInfo.errorMsg}</Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
      {changeInfo.show && (
        <Modal trasparent={true}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.changeInfoBox}>
              <View style={styles.changeInfoContainer}>
                {!changeInfo.optionsEdit ? 
                  <>
                    {changeInfo.type == 'name' && (
                      <View style={styles.inputContainer}>
                        <Text style={styles.addHeader}>{tr.t("addmeal.name")}</Text>

                        <TextInput 
                          style={styles.addInput} placeholderTextColor="rgba(127, 127, 127, 0.5)" 
                          onChangeText={(name) => setChangeinfo({ ...changeInfo, name })} value={name} autoCorrect={false} autoCompleteType="off" 
                          autoCapitalize="none"
                        />
                      </View>
                    )}

                    {changeInfo.type == "price" && (
                      <View style={styles.priceBox}>
                        <Text style={styles.priceHeader}>{tr.t("addmeal.price.size")}</Text>
                        <TextInput style={styles.priceInput} placeholderTextColor="rgba(0, 0, 0, 0.5)" placeholder="4.99" onChangeText={(price) => {
                          let newPrice = price.toString()

                          if (newPrice.includes(".") && newPrice.split(".")[1].length == 2) {
                            Keyboard.dismiss()
                          }

                          setChangeinfo({ ...changeInfo, type: 'price', price: price.toString() })
                        }} value={changeInfo.price.toString()} keyboardType="numeric" autoCorrect={false} autoCapitalize="none"/>
                      </View>
                    )}

                    {changeInfo.type == 'photo' && (
                      <View style={styles.cameraContainer}>
                        {changeInfo.image.uri ? (
                          <>
                            <Image style={styles.camera} source={{ uri: changeInfo.image.uri }}/>

                            <TouchableOpacity style={styles.cameraAction} onPress={() => setChangeinfo({ ...changeInfo, image: {...changeInfo.image, uri: '', name: '' }})}>
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
                              <TouchableOpacity style={[styles.cameraAction, { opacity: changeInfo.loading ? 0.5 : 1 }]} disabled={changeInfo.loading} onPress={snapPhoto.bind(this)}>
                                <Text style={styles.cameraActionHeader}>{tr.t("buttons.takePhoto")}</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={[styles.cameraAction, { opacity: changeInfo.loading ? 0.5 : 1 }]} disabled={changeInfo.loading} onPress={() => {
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

                    {changeInfo.type == 'options' && (
                      (sizes.length > 0 || quantities.length > 0 || percents.length > 0) && (
                        <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)', width: '100%' }}>
                          <View style={styles.addOptionBox}>
                            <View style={styles.column}>
                              <TouchableOpacity style={styles.addOption} onPress={() => setChangeinfo({ ...changeInfo, optionsEdit: 'size' })}>
                                <Text style={styles.addOptionHeader}>{tr.t("addmeal.price.sizes")}</Text>
                              </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                              <TouchableOpacity style={[styles.addOption, { margin: 10 }]} onPress={() => setChangeinfo({ ...changeInfo, optionsEdit: 'quantity' })}>
                                <Text style={styles.addOptionHeader}>{tr.t("addmeal.price.quantity")}</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={[styles.addOption, { margin: 10 }]} onPress={() => setChangeinfo({ ...changeInfo, optionsEdit: 'percent' })}>
                                <Text style={styles.addOptionHeader}>{tr.t("addmeal.price.percent")}</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                          <Text style={styles.optionsHeader}>Selected option(s)</Text>
                          <View style={{ alignItems: 'center', width: '100%' }}>
                            <View style={styles.options}>
                              {changeInfo.sizes.map((size, index) => (
                                <View key={size.key} style={styles.option}>
                                  <TouchableOpacity style={styles.optionRemove} onPress={() => {
                                    let newOptions = [...changeInfo.sizes]

                                    newOptions.splice(index, 1)

                                    setChangeinfo({ ...changeInfo, sizes: newOptions })
                                  }}>
                                    <FontAwesome name="close" size={25}/>
                                  </TouchableOpacity>
                                  <View style={styles.optionTypeSelected}>
                                    <Text style={styles.optionTypeSelectedHeader}>{size.name}</Text>
                                  </View>
                                  <Text style={styles.optionTypesHeader}>$ {size.price}</Text>
                                </View>
                              ))}
                              {changeInfo.quantities.map((quantity, index) => (
                                <View key={quantity.key} style={styles.option}>
                                  <TouchableOpacity style={styles.optionRemove} onPress={() => {
                                    let newOptions = [...changeInfo.quantities]

                                    newOptions.splice(index, 1)

                                    setChangeinfo({ ...changeInfo, quantities: newOptions })
                                  }}>
                                    <FontAwesome name="close" size={25}/>
                                  </TouchableOpacity>
                                  <View style={styles.optionTypeSelected}>
                                    <Text style={styles.optionTypeSelectedHeader}>{quantity.input}</Text>
                                  </View>
                                  <Text style={styles.optionTypesHeader}>$ {quantity.price}</Text>
                                </View>
                              ))}
                              {changeInfo.percents.map((percent, index) => (
                                <View key={percent.key} style={styles.option}>
                                  <TouchableOpacity style={styles.optionRemove} onPress={() => {
                                    let newOptions = [...changeInfo.percents]

                                    newOptions.splice(index, 1)

                                    setChangeinfo({ ...changeInfo, percents: newOptions })
                                  }}>
                                    <FontAwesome name="close" size={25}/>
                                  </TouchableOpacity>
                                  <View style={styles.optionTypeSelected}>
                                    <Text style={styles.optionTypeSelectedHeader}>{percent.input}</Text>
                                  </View>
                                  <Text style={styles.optionTypesHeader}>$ {percent.price}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        </View>
                      )
                    )}

                    <View style={styles.changeInfoActions}>
                      <TouchableOpacity style={styles.changeInfoAction} onPress={() => setChangeinfo({ 
                        ...changeInfo, show: false, type: '', optionsEdit: '', 
                        image: { ...changeInfo.image, remove: false }
                      })}>
                        <Text style={styles.changeInfoActionHeader}>Cancel</Text>
                      </TouchableOpacity>

                      {changeInfo.type == 'photo' ? 
                        changeInfo.image.uri ? 
                          <TouchableOpacity style={styles.changeInfoAction} onPress={() => updateTheMeal()}>
                            <Text style={styles.changeInfoActionHeader}>Done</Text>
                          </TouchableOpacity>
                          :
                          <TouchableOpacity style={styles.changeInfoAction} onPress={() => setChangeinfo({ ...changeInfo, image: { ...changeInfo.image, remove: true }})}>
                            <Text style={styles.changeInfoActionHeader}>Remove</Text>
                          </TouchableOpacity>
                        :
                        <TouchableOpacity style={styles.changeInfoAction} onPress={() => updateTheMeal()}>
                          <Text style={styles.changeInfoActionHeader}>Done</Text>
                        </TouchableOpacity>
                      } 
                    </View>
                  </>
                  :
                  <View style={styles.changeInfoOptionBox}>
                    <View style={styles.changeInfoOptionContainer}>
                      <TouchableOpacity style={styles.changeInfoOptionClose} onPress={() => setChangeinfo({ ...changeInfo, optionsEdit: '' })}>
                        <AntDesign name="close" size={30}/>
                      </TouchableOpacity>

                      <Text style={styles.changeInfoOptionHeader}>New {changeInfo.optionsEdit} info</Text>

                      {(changeInfo.optionsEdit == 'quantity' || changeInfo.optionsEdit == 'percent') ? 
                        <>
                          <TextInput style={styles.changeInfoOptionInput} placeholderTextColor="rgba(0, 0, 0, 0.5)" placeholder="Cream" value={changeInfo.optionInfo.input} onChangeText={input => setChangeinfo({ ...changeInfo, optionInfo: { ...changeInfo.optionInfo, input }})}/>
                          <TextInput style={styles.changeInfoOptionInput} placeholderTextColor="rgba(0, 0, 0, 0.5)" placeholder="4.99" value={changeInfo.optionInfo.price} onChangeText={(price) => setChangeinfo({ ...changeInfo, optionInfo: { ...changeInfo.optionInfo, price }})} keyboardType="numeric" autoCorrect={false} autoCapitalize="none"/>
                        </>
                        :
                        <>
                          <View style={{ marginVertical: 20 }}>
                            <Text style={styles.newSizesHeader}>Select size:</Text>
                            <View style={styles.newSizes}>
                              {["Small", "Medium"].map((sizeopt, sizeindex) => (
                                <TouchableOpacity key={sizeindex.toString()} style={changeInfo.optionInfo.selected == sizeopt ? styles.newSizeSelected : styles.newSize} onPress={() => setChangeinfo({ ...changeInfo, optionInfo: { ...changeInfo.optionInfo, selected: sizeopt }})}>
                                  <Text style={changeInfo.optionInfo.selected == sizeopt ? styles.newSizeSelectedHeader : styles.newSizeHeader}>{sizeopt}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                            <View style={styles.newSizes}>
                              {["Large", "Extra large"].map((sizeopt, sizeindex) => (
                                <TouchableOpacity key={sizeindex.toString()} style={changeInfo.optionInfo.selected == sizeopt ? styles.newSizeSelected : styles.newSize} onPress={() => setChangeinfo({ ...changeInfo, optionInfo: { ...changeInfo.optionInfo, selected: sizeopt }})}>
                                  <Text style={changeInfo.optionInfo.selected == sizeopt ? styles.newSizeSelectedHeader : styles.newSizeHeader}>{sizeopt}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </View>
                          <TextInput style={styles.newSizeInput} placeholderTextColor="rgba(0, 0, 0, 0.5)" placeholder="4.99" value={changeInfo.optionInfo.price.toString()} onChangeText={(price) => setChangeinfo({ ...changeInfo, optionInfo: { ...changeInfo.optionInfo, price: price.toString() }})} keyboardType="numeric" autoCorrect={false} autoCapitalize="none"/>
                        </>
                      }

                      <TouchableOpacity style={styles.changeInfoOptionDone} onPress={() => {
                        const { selected, input, price } = changeInfo.optionInfo

                        if ((selected || input) && price) {
                          let new_key, options

                          switch (changeInfo.optionsEdit) {
                            case "quantity":
                              options = [...changeInfo.quantities]

                              break;
                            case "percent":
                              options = [...changeInfo.percents]

                              break;
                            case "size":
                              options = [...changeInfo.sizes]

                              break;
                            default:
                          }

                          if (options.length > 0) {
                            let last_option = options[options.length - 1]

                            new_key = parseInt(last_option.key.split("-")[1]) + 1
                          } else {
                            new_key = 0
                          }

                          if (changeInfo.optionsEdit == 'quantity') {
                            setChangeinfo({ 
                              ...changeInfo, 
                              quantities: [...changeInfo.quantities, { key: "quantity-" + new_key.toString(), input, price }],
                              optionsEdit: '', optionInfo: { selected: '', input: '', price: '' }
                            })
                          } else if (changeInfo.optionsEdit == 'percent') {
                            setChangeinfo({ 
                              ...changeInfo, 
                              percents: [...changeInfo.percents, { key: "percent-" + new_key.toString(), input, price }],
                              optionsEdit: '', optionInfo: { selected: '', input: '', price: '' }
                            })
                          } else {
                            setChangeinfo({ 
                              ...changeInfo, 
                              sizes: [...changeInfo.sizes, { key: "size-" + new_key.toString(), name: selected, price }],
                              optionsEdit: '', optionInfo: { selected: '', input: '', price: '' }
                            })
                          }
                        } else {
                          setChangeinfo({ ...changeInfo, errorMsg: "Name or price is empty" })
                        }
                      }}>
                        <Text style={styles.changeInfoOptionDoneHeader}>Add</Text>
                      </TouchableOpacity>

                      <Text style={styles.errorMsg}>{quantityInfo.errorMsg}</Text>
                    </View>
                  </View>
                }
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
  
  // add
  inputContainer: { alignItems: 'center', width: '100%' },
  addHeader: { fontSize: wsize(5), fontWeight: 'bold', paddingVertical: 5, textAlign: 'center' },
  addInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, fontSize: wsize(5), padding: 10, width: '90%' },
  
  cameraContainer: { alignItems: 'center', width: '100%' },
  cameraHeader: { fontSize: wsize(5), fontWeight: 'bold', paddingVertical: 5 },
  camera: { height: width * 0.8, width: width * 0.8 },
  cameraActions: { flexDirection: 'row' },
  cameraAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginBottom: 50, margin: 5, padding: 5, width: wsize(30) },
  cameraActionHeader: { fontSize: wsize(3), textAlign: 'center' },

  addOptionBox: { backgroundColor: 'rgba(0, 0, 0, 0.1)', margin: '1%', padding: 5, width: '98%' },
  addOption: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 10 },
  addOptionHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' }, 

  optionsHeader: { fontSize: wsize(6), fontWeight: 'bold', textAlign: 'center' },
  options: { marginBottom: 10, width: '95%' },
  option: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, flexDirection: 'row', justifyContent: 'space-around', marginVertical: 5, paddingVertical: 5 },
  optionRemove: { alignItems: 'center', borderRadius: 15, borderStyle: 'solid', borderWidth: 2, height: 30, width: 30 },
  optionTypesBox: { alignItems: 'center' },
  optionTypesHeader: { fontSize: wsize(5), fontWeight: 'bold', margin: 5 },
  optionTypes: { flexDirection: 'row' },
  optionType: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 5 },
  optionTypeSelected: { alignItems: 'center', backgroundColor: 'black', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 5 },
  optionTypeHeader: { color: 'black', fontSize: wsize(4) },
  optionTypeSelectedHeader: { color: 'white', fontSize: wsize(4) },
  
  priceBox: { alignItems: 'center' },
  priceHeader: { fontSize: wsize(6), fontWeight: 'bold', padding: 5 },
  priceInput: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(9), padding: 5, textAlign: 'center', width: wsize(50) },
  
  addActions: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  addAction: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(6), padding: 5, width: wsize(30) },
  addActionHeader: { fontSize: wsize(4) },

  // update
  updateInfoContainer: { alignItems: 'center', height: '100%', width: '100%' },
  updateHeader: { fontSize: wsize(6), fontWeight: 'bold', textAlign: 'center' },
  updateInfoBox: { borderStyle: 'solid', borderBottomWidth: 1, borderTopWidth: 1, flexDirection: 'column', height: '30%', justifyContent: 'space-around', padding: 5, width: '100%' },
  updateInfoPhotoHolder: { borderRadius: wsize(20) / 2, height: wsize(20), overflow: 'hidden', width: wsize(20) },
  updateInfoOption: { fontSize: wsize(5), fontWeight: 'bold' },
  updateInfoActions: { flexDirection: 'column', height: '70%', justifyContent: 'space-around' },
  updateInfoAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 10 },
  updateInfoActionHeader: { fontSize: wsize(6), textAlign: 'center' },

  // change info box
  changeInfoBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  changeInfoContainer: { backgroundColor: 'white', height: '80%', width: '80%' },
  changeInfoActions: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 50, width: '100%' },
  changeInfoAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 10, width: '30%' },
  changeInfoActionHeader: { textAlign: 'center' },

  changeInfoOptionBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  changeInfoOptionContainer: { alignItems: 'center', backgroundColor: 'white', height: '80%', width: '80%' },
  changeInfoOptionClose: { borderRadius: 20, borderStyle: 'solid', borderWidth: 2, marginVertical: 20 },
  changeInfoOptionHeader: { fontSize: wsize(6), fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
  changeInfoOptionInput: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(9), height: 50, marginVertical: 3, padding: 3, textAlign: 'center', width: 150 }, 
  changeInfoOptionDone: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 20, padding: 5 },
  changeInfoOptionDoneHeader: { fontSize: wsize(6), textAlign: 'center' },

  // hidden boxes
  // new size
  newSizeBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  newSizeContainer: { alignItems: 'center', backgroundColor: 'white', height: '80%', width: '80%' },
  newSizeClose: { borderRadius: 20, borderStyle: 'solid', borderWidth: 2, marginVertical: 20 },
  newSizeHeader: { fontSize: wsize(6), fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
  newSizeInput: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(9), height: 50, padding: 3, textAlign: 'center', width: 150 }, 
  newSizesBox: { alignItems: 'center' },
  newSizesHeader: { fontSize: wsize(5), fontWeight: 'bold', margin: 5 },
  newSizes: { flexDirection: 'row' },
  newSize: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 5 },
  newSizeSelected: { alignItems: 'center', backgroundColor: 'black', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 5 },
  newSizeHeader: { color: 'black', fontSize: wsize(6) },
  newSizeSelectedHeader: { color: 'white', fontSize: wsize(6) },
  newSizeDone: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 20, padding: 5 },
  newSizeDoneHeader: { fontSize: wsize(6), textAlign: 'center' },

  // new quantity
  newQuantityBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  newQuantityContainer: { alignItems: 'center', backgroundColor: 'white', height: '80%', width: '80%' },
  newQuantityClose: { borderRadius: 20, borderStyle: 'solid', borderWidth: 2, marginVertical: 20 },
  newQuantityHeader: { fontSize: wsize(6), fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
  newQuantityInput: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(9), height: 50, marginVertical: 3, padding: 3, textAlign: 'center', width: 150 }, 
  newQuantityDone: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 20, padding: 5 },
  newQuantityDoneHeader: { fontSize: wsize(6), textAlign: 'center' },

  // new quantity
  newPercentBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  newPercentContainer: { alignItems: 'center', backgroundColor: 'white', height: '80%', width: '80%' },
  newPercentClose: { borderRadius: 20, borderStyle: 'solid', borderWidth: 2, marginVertical: 20 },
  newPercentHeader: { fontSize: wsize(6), fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
  newPercentInput: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(9), height: 50, marginVertical: 3, padding: 3, textAlign: 'center', width: 150 }, 
  newPercentDone: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 20, padding: 5 },
  newPercentDoneHeader: { fontSize: wsize(6), textAlign: 'center' },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
  loading: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  errorMsg: { color: 'darkred', fontSize: wsize(4), textAlign: 'center' },
})
