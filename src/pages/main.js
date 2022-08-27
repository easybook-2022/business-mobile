import { useEffect, useState, useCallback } from 'react'
import { 
  SafeAreaView, Platform, ScrollView, ActivityIndicator, Dimensions, 
  View, FlatList, Image, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, 
  Keyboard, StyleSheet, Modal, KeyboardAvoidingView
} from 'react-native'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKeepAwake } from 'expo-keep-awake'
import Constants from 'expo-constants';
import { useFocusEffect, useIsFocused, CommonActions } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system'
import * as ImageManipulator from 'expo-image-manipulator'
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { BarCodeScanner } from 'expo-barcode-scanner';
import QRCode from 'react-native-qrcode-svg';
import { tr } from '../../assets/translate'
import { loginInfo, ownerSigninInfo, socket, logo_url, timeControl, tableUrl } from '../../assets/info'
import { getId, displayTime, resizePhoto, displayPhonenumber } from 'geottuse-tools'
import { 
  verifyUser, updateLogins, addOwner, updateOwner, deleteOwner, getStylistInfo, 
  getOtherWorkers, getAccounts, getOwnerInfo, logoutUser, getWorkersTime, getAllWorkersTime, getWorkersHour
} from '../apis/owners'
import { getLocationProfile, getLocationHours, updateLocationHours, updateInformation, getLogins, updateAddress, updateLogo, setReceiveType } from '../apis/locations'

import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import Fontisto from 'react-native-vector-icons/Fontisto'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import Ionicons from 'react-native-vector-icons/Ionicons'

import Disable from '../widgets/disable'
import Loadingprogress from '../widgets/loadingprogress'

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}

export default function Main(props) {
  let updateWorkersHour
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  useKeepAwake()

  const [language, setLanguage] = useState('')
	const [ownerId, setOwnerid] = useState(null)
  const [userType, setUsertype] = useState('')
	const [locationType, setLocationtype] = useState('')
  const [menuState, setMenustate] = useState('')

	const [appointments, setAppointments] = useState({ list: [], loading: false })
	const [cartOrderers, setCartorderers] = useState([])

  const [tableViewtype, setTableviewtype] = useState('')
  const [tableOrders, setTableorders] = useState([])
  const [numTableorders, setNumtableorders] = useState(0)
  const [table, setTable] = useState({ id: '', name: '' })
  const [tables, setTables] = useState([])
  const [menuInfo, setMenuinfo] = useState({ list: [ ], photos: [] })
  const [tableBills, setTablebills] = useState([])
  const [showAddtable, setShowaddtable] = useState({ show: false, table: "", errorMsg: "" })
  const [showRemovetable, setShowremovetable] = useState({ show: false, table: { id: -1, name: "" } })

  const [loaded, setLoaded] = useState(false)

	const [viewType, setViewtype] = useState('')

	const [showDisabledscreen, setShowdisabledscreen] = useState(false)
  const [showInfo, setShowinfo] = useState({ show: false, workersHours: [], locationHours: [] })

  const [showMoreoptions, setShowmoreoptions] = useState({ loading: false, infoType: '' })
  const [editInfo, setEditinfo] = useState({ 
    show: false, type: '', 
    storeName: "", phonenumber: "", 
    coords: { latitude: null, longitude: null, latitudeDelta: null, longitudeDelta: null }, 
    logo: { uri: '', name: '', size: { width: 0, height: 0 }}, 
    locationHours: [], 
    errorMsg: "", loading: false 
  })
  const [accountForm, setAccountform] = useState({
    show: false,
    type: '', editType: '', addStep: 0, id: -1, self: false,
    username: '', editUsername: false,
    cellnumber: '', verified: false, verifyCode: '', editCellnumber: false,
    currentPassword: '', newPassword: '', confirmPassword: '', editPassword: false,
    profile: { uri: '', name: '', size: { width: 0, height: 0 }, diff: false }, editProfile: false, camType: 'front',
    daysInfo: { working: ['', '', '', '', '', '', ''], done: false, sameHours: null }, workerHours: [], workerHourssameday: null, editHours: false,
    loading: false,
    errorMsg: ''
  })

  const [locationInfo, setLocationinfo] = useState('')
  const [locationCoords, setLocationcoords] = useState({ longitude: null, latitude: null, longitudeDelta: null, latitudeDelta: null })
  const [numBusinesses, setNumbusinesses] = useState(0)
  const [storeName, setStorename] = useState('')
  const [phonenumber, setPhonenumber] = useState('')
  const [logo, setLogo] = useState({ uri: '', name: '', size: { width: 0, height: 0 }, loading: false })
  const [locationReceivetype, setLocationreceivetype] = useState('')

  const [locationHours, setLocationhours] = useState([])
  const [deleteOwnerbox, setDeleteownerbox] = useState({
    show: false,
    id: -1, username: '', 
    profile: { name: "", width: 0, height: 0 }, numWorkingdays: 0
  })
  const [logins, setLogins] = useState({ 
    owners: [], 
    type: '',
    info: { 
      id: -1, noAccount: false, cellnumber: '', verifyCode: "", verified: false, 
      currentPassword: "", newPassword: "", confirmPassword: "", userType: null 
    },
    errorMsg: ""
  })
  const [accountHolders, setAccountholders] = useState([])
  const [cameraPermission, setCamerapermission] = useState(null);
  const [pickingPermission, setPickingpermission] = useState(null);
  const [camComp, setCamcomp] = useState(null)
  const [camType, setCamtype] = useState('back')
  const [choosing, setChoosing] = useState(false)

  const [hoursRange, setHoursrange] = useState([])
  const [hoursRangesameday, setHoursrangesameday] = useState(null)
  const [hoursInfo, setHoursinfo] = useState({})
  const [workersHoursinfo, setWorkershoursinfo] = useState({})

  const [getWorkersbox, setGetworkersbox] = useState({ show: false, day: '', workers: [] })

  const getTheLocationProfile = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
    const usertype = await AsyncStorage.getItem("userType")
		const locationid = await AsyncStorage.getItem("locationid")
    const tableInfo = JSON.parse(await AsyncStorage.getItem("table"))
		const data = { locationid, ownerid }

    setUsertype(usertype)

		getLocationProfile(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { name, logo, type, receiveType, hours, phonenumber } = res.info
          let openInfo, openMinute, openHour, openPeriod, closeInfo, closeMinute, closeHour, closePeriod
          let currDate, calcDate, header, openTime, closeTime, locationHours = []

					socket.emit("socket/business/login", ownerid, () => {
            for (let k = 0; k < 7; k++) {
              header = hours[k].header
              openInfo = hours[k].opentime
              closeInfo = hours[k].closetime

              openMinute = parseInt(openInfo.minute)
              openMinute = openMinute < 10 ? "0" + openMinute : openMinute
              openHour = parseInt(openInfo.hour)
              openHour = openHour < 10 ? "0" + openHour : openHour
              openPeriod = openInfo.period

              closeMinute = parseInt(closeInfo.minute)
              closeMinute = closeMinute < 10 ? "0" + closeMinute : closeMinute
              closeHour = parseInt(closeInfo.hour)
              closeHour = closeHour < 10 ? "0" + closeHour : closeHour
              closePeriod = closeInfo.period

              currDate = new Date()
              calcDate = new Date(currDate.setDate(currDate.getDate() - currDate.getDay() + k));
              
              let day = days[calcDate.getDay()]
              let month = months[calcDate.getMonth()]
              let date = calcDate.getDate()
              let year = calcDate.getFullYear()
              let dateStr = day + " " + month + " " + date + " " + year

              openTime = openHour + ":" + openMinute + " " + openPeriod
              closeTime = closeHour + ":" + closeMinute + " " + closePeriod

              locationHours.push({ key: locationHours.length.toString(), header, opentime: {...hours[k].opentime}, closetime: {...hours[k].closetime}, close: hours[k].close })

              hours[k].opentime.hour = openHour.toString()
              hours[k].opentime.minute = openMinute.toString()
              hours[k].closetime.hour = closeHour.toString()
              hours[k].closetime.minute = closeMinute.toString()

              hours[k]["date"] = dateStr
              hours[k]["openTime"] = Date.parse(dateStr + " " + openTime)
              hours[k]["closeTime"] = Date.parse(dateStr + " " + closeTime)
              hours[k]["working"] = true
            }

						setOwnerid(ownerid)
            setNumbusinesses(res.info.numBusinesses)
						setStorename(name)
            setPhonenumber(phonenumber)
            setLogo({ ...logo, uri: logo.name ? logo_url + logo.name : "", size: { width: logo.width, height: logo.height }})
            setLocationtype(type)
            setLocationreceivetype(receiveType)
            setLocationhours(hours)
            setShowinfo({ ...showInfo, locationHours })
            setHoursrange(hours)
            setLoaded(true)
					})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
				}
			})
	}
  const getTheLocationHours = async() => {
    const locationid = await AsyncStorage.getItem("locationid")

    getLocationHours(locationid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        } 
      })
      .then((res) => {
        if (res) {
          const { hours } = res

          setHoursinfo(hours)
          setLoaded(true)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getTheWorkersTime = async() => {
    const locationid = await AsyncStorage.getItem("locationid")

    getWorkersTime(locationid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setShowinfo({ ...showInfo, show: true, workersHours: res.workers })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getAllTheWorkersTime = async() => {
    const locationid = await AsyncStorage.getItem("locationid")

    getAllWorkersTime(locationid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setWorkershoursinfo(res.workers)
        }
      })
  }

  const logout = async() => {
    const ownerid = await AsyncStorage.getItem("ownerid")

    logoutUser(ownerid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          socket.emit("socket/business/logout", ownerid, () => {
            AsyncStorage.clear()

            props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "auth" }]}));
          })
        }
      })
  }
  
	const initialize = async() => {
    tr.locale = await AsyncStorage.getItem("language")

    setLanguage(await AsyncStorage.getItem("language"))

    getTheLocationProfile()
    getTheLocationHours()
	}
  const pickLanguage = async(language) => {
    AsyncStorage.setItem("language", language)

    tr.locale = await AsyncStorage.getItem("language")

    setLanguage(language)
    setShowmoreoptions({ ...showMoreoptions, infoType: '' })
    setEditinfo({ ...editInfo, show: false, type: '' })
  }
  const getTheLogins = async() => {
    const locationid = await AsyncStorage.getItem("locationid")

    getLogins(locationid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setLogins({ 
            ...logins, 
            owners: res.owners,
            type: '',
            info: { 
              id: -1, noAccount: false, cellnumber: '', verifyCode: "", verified: false, 
              currentPassword: "", newPassword: "", confirmPassword: "", userType: null 
            },
            errorMsg: ""
          })
        }
      })
  }
  const verifyLogin = () => {
    const { cellnumber } = logins.info

    verifyUser(cellnumber)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { verifycode } = res

          setLogins({ ...logins, info: { ...logins.info, noAccount: true, verifyCode: verifycode }})
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg } = err.response.data

          setLogins({ ...logins, errorMsg: errormsg })
        }
      })
  }

  const verify = () => {
    setAccountform({ ...accountForm, loading: true })

    const { cellnumber } = accountForm

    verifyUser(cellnumber)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { verifycode } = res

          setAccountform({ ...accountForm, verifyCode: verifycode, errorMsg: "", loading: false })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg } = err.response.data

          setAccountform({ ...accountForm, errorMsg: errormsg, loading: false })
        }
      })
  }
  const getAllAccounts = async() => {
    const locationid = await AsyncStorage.getItem("locationid")

    getAccounts(locationid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setAccountholders(res.accounts)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const updateTheInformation = async() => {
    const { storeName, phonenumber } = editInfo

    if (storeName && phonenumber) {
      const id = await AsyncStorage.getItem("locationid")
      const data = { id, storeName, phonenumber }

      updateInformation(data)
        .then((res) => {
          if (res.status == 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {

            setStorename(storeName)
            setPhonenumber(phonenumber)
            setShowmoreoptions({ ...showMoreoptions, infoType: '' })
            setEditinfo({ ...editInfo, show: false, type: '', loading: false })
          }
        })
        .catch((err) => {
          if (err.response && err.response.status == 400) {
            const { errormsg, status } = err.response.data

            setEditinfo({ ...editInfo, errorMsg: errormsg, loading: false })
          }
        })
    } else {
      if (!storeName) {
        setEditinfo({ ...editInfo, errorMsg: "Please enter your store name" })

        return
      }

      if (!phonenumber) {
        setEditinfo({ ...editInfo, errorMsg: "Please enter your store phone number" })

        return
      }
    }
  }
  const updateTheAddress = async() => {
    const { longitude, latitude } = locationCoords

    const id = await AsyncStorage.getItem("locationid")
    const data = { id, longitude, latitude }

    updateAddress(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { id } = res

          setShowmoreoptions({ ...showMoreoptions, infoType: '' })
          setEditinfo({ ...editInfo, show: false, type: '', loading: false })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data

          setEditinfo({ ...editInfo, errorMsg: errormsg, loading: false })
        }
      })
  }
  const updateTheLogo = async() => {
    const id = await AsyncStorage.getItem("locationid")
    const data = { id, logo }

    updateLogo(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setShowmoreoptions({ ...showMoreoptions, infoType: '' })
          setEditinfo({ ...editInfo, show: false, type: '', loading: false })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const snapProfile = async() => {
    setAccountform({ ...accountForm, loading: true })

    if (camComp) {
      let options = { quality: 0 };
      let char = getId(), photo = await camComp.takePictureAsync(options)
      let photo_option = [{ resize: { width, height: width }}]
      let photo_save_option = { format: ImageManipulator.SaveFormat.JPEG, base64: true }

      if (accountForm.camType == "front") {
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
        setAccountform({
          ...accountForm,
          profile: {
            uri: `${FileSystem.documentDirectory}/${char}.jpg`,
            name: `${char}.jpg`, size: { width, height: width },
            diff: true
          },
          loading: false
        })
      })
    }
  }
  const chooseProfile = async() => {
    setAccountform({ ...accountForm, loading: true })
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
        setAccountform({
          ...accountForm,
          profile: {
            uri: `${FileSystem.documentDirectory}/${char}.jpg`,
            name: `${char}.jpg`, 
            size: { width, height: width }
          },
          loading: false
        })
      })
    } else {
      setAccountform({ ...accountForm, loading: false })
    }

    setChoosing(false)
  }
  const snapPhoto = async() => {
    setLogo({ ...logo, loading: true })

    let char = getId()

    if (camComp) {
      let options = { quality: 0 };
      let photo = await camComp.takePictureAsync(options)
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
        setEditinfo({
          ...editInfo,
          logo: {
            ...editInfo.logo,
            uri: `${FileSystem.documentDirectory}/${char}.jpg`,
            name: `${char}.jpg`, size: { width, height: width }, 
          }
        })
      })
    }
  }
  const choosePhoto = async() => {
    setLogo({ ...logo, loading: true })
    setChoosing(true)

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
        setLogo({
          uri: `${FileSystem.documentDirectory}/${char}.jpg`,
          name: `${char}.jpg`, size: { width: photo.width, height: photo.height },
          loading: false
        })
      })
    } else {
      setLogo({ ...logo, loading: false })
    }

    setChoosing(false)
  }
  const getCoords = (info) => {
    const { lat, lng } = info

    setLocationcoords({ 
      ...locationCoords, 
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.001,
      longitudeDelta: 0.001
    })
  }
  const addNewOwner = async() => {
    setAccountform({ ...accountForm, loading: true, errorMsg: "" })

    const { workerHours, workerHourssameday, daysInfo } = accountForm
    const hours = {}, { sameHours } = daysInfo

    workerHours.forEach(function (workerHour) {
      let { opentime, closetime, working, takeShift } = sameHours == true && workerHour.working ? workerHourssameday : workerHour
      let openhour = parseInt(opentime.hour), closehour = parseInt(closetime.hour)
      let openperiod = opentime.period, closeperiod = closetime.period, newOpentime, newClosetime

      if (openperiod == "PM") {
        if (openhour < 12) {
          openhour += 12
        }

        openhour = openhour < 10 ? 
          "0" + openhour
          :
          openhour.toString()
      } else {
        if (openhour == 12) {
          openhour = "00"
        } else if (openhour < 10) {
          openhour = "0" + openhour
        } else {
          openhour = openhour.toString()
        }
      }

      if (closeperiod == "PM") {
        if (closehour < 12) {
          closehour += 12
        }

        closehour = closehour < 10 ? 
          "0" + closehour
          :
          closehour.toString()
      } else {
        if (closehour == 12) {
          closehour = "00"
        } else if (closehour < 10) {
          closehour = "0" + closehour
        } else {
          closehour = closehour.toString()
        }
      }

      newOpentime = { hour: openhour, minute: opentime.minute }
      newClosetime = { hour: closehour, minute: closetime.minute }

      hours[workerHour.header.substr(0, 3)] = { 
        opentime: newOpentime, closetime: newClosetime, working, 
        takeShift: takeShift ? takeShift : "" 
      }
    })

    const id = await AsyncStorage.getItem("locationid")
    const { cellnumber, username, newPassword, confirmPassword, profile } = accountForm
    const data = { id, cellnumber, username, password: newPassword, confirmPassword: newPassword, hours, profile }

    addOwner(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setAccountform({
            ...accountForm, 
            show: false, 
            type: '', editType: '', addStep: 0, id: -1, 
            username: '', cellnumber: '', 
            currentPassword: '', newPassword: '', confirmPassword: '', 
            profile: { uri: '', name: '', size: { width: 0, height: 0 } }, 
            daysInfo: { working: ['', '', '', '', '', '', ''], done: false, sameHours: null }, workerHours: [], workerHourssameday: null, editHours: false,
            loading: false, errorMsg: ""
          })
          setEditinfo({ ...editInfo, show: true })
          getAllAccounts()
          getTheWorkersHour(false)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data

          switch (status) {
            case "cellnumber":
              setAccountform({ ...accountForm, addStep: 0, loading: false, errorMsg: errormsg })

              break;
            case "password":
              setAccountform({ ...accountForm, addStep: 3, loading: false, errorMsg: errormsg })

              break;
            default:
          }
        }
      })
  }
  const deleteTheLogin = id => {
    deleteOwner(id)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          getTheLogins()
        }
      })
  }
  const setWorkingTime = () => {
    const newAccountform = {...accountForm}
    const { daysInfo } = newAccountform
    const newWorkerhours = []
    const newWorkerhourssameday = {}
    const newHoursrangesameday = {}
    let emptyDays = true, info, numWorking = 0

    days.forEach(function (day, index) {
      if (index == 0) {
        info = locationHours[0]
      } else {
        if (locationHours[index].openTime > info.openTime && locationHours[index].closeTime < info.closeTime) {
          info = locationHours[index]
        }
      }

      newWorkerhours.push({
        key: newWorkerhours.length.toString(),
        header: day,
        opentime: {...locationHours[index].opentime},
        closetime: {...locationHours[index].closetime},
        working: daysInfo.working[index] ? true : false,
        close: locationHours[index].close
      })

      if (daysInfo.working[index] != '') {
        numWorking++
        emptyDays = false
      }
    })

    newWorkerhourssameday["opentime"] = info.opentime
    newWorkerhourssameday["closetime"] = info.closetime
    newWorkerhourssameday["working"] = true

    newHoursrangesameday["opentime"] = info.opentime
    newHoursrangesameday["openTime"] = info.openTime
    newHoursrangesameday["closetime"] = info.closetime
    newHoursrangesameday["closeTime"] = info.closeTime
    newHoursrangesameday["date"] = info.date
    newHoursrangesameday["working"] = true

    if (!emptyDays) {
      daysInfo.done = true
      daysInfo.sameHours = numWorking == 1 ? false : daysInfo.sameHours,
      daysInfo.workerHours = newWorkerhours
      daysInfo.workerHourssameday = newWorkerhourssameday

      setAccountform({ 
        ...accountForm, 
        daysInfo,
        workerHours: newWorkerhours,
        workerHourssameday: newWorkerhourssameday,
        errorMsg: ''
      })
      setHoursrangesameday(newHoursrangesameday)
    } else {
      setAccountform({ ...accountForm, errorMsg: '' })
    }
  }
  const updateWorkingHour = (index, timetype, dir, open) => {
    const newWorkerhours = [...accountForm.workerHours], newHoursrange = [...hoursRange]
    let value, { openTime, closeTime, date } = newHoursrange[index]
    let { opentime, closetime } = newWorkerhours[index], valid = false

    value = open ? opentime : closetime

    let { hour, minute, period } = timeControl(timetype, value, dir, open)
    let calcTime = Date.parse(date + " " + hour + ":" + minute + " " + period)

    if (open) {
      valid = (calcTime >= openTime && calcTime <= Date.parse(date + " " + closetime.hour + ":" + closetime.minute + " " + closetime.period))
    } else {
      valid = (calcTime <= closeTime && calcTime >= Date.parse(date + " " + opentime.hour + ":" + opentime.minute + " " + opentime.period))
    }
      
    if (valid) {
      value.hour = hour < 10 ? "0" + hour : hour.toString()
      value.minute = minute < 10 ? "0" + minute : minute.toString()
      value.period = period

      if (open) {
        newWorkerhours[index].opentime = value
      } else {
        newWorkerhours[index].closetime = value
      }

      setAccountform({ ...accountForm, workerHours: newWorkerhours })
    }
  }
  const updateWorkingSameHour = (timetype, dir, open) => {
    const newWorkerhourssameday = {...accountForm.workerHourssameday}
    let value, { openTime, closeTime, date } = hoursRangesameday
    let { opentime, closetime } = newWorkerhourssameday, valid = false

    value = open ? opentime : closetime

    let { hour, minute, period } = timeControl(timetype, value, dir, open)
    let calcTime = Date.parse(date + " " + hour + ":" + minute + " " + period)

    if (open) {
      valid = (calcTime >= openTime && calcTime <= Date.parse(date + " " + closetime.hour + ":" + closetime.minute + " " + closetime.period))
    } else {
      valid = (calcTime <= closeTime && calcTime >= Date.parse(date + " " + opentime.hour + ":" + opentime.minute + " " + opentime.period))
    }

    if (valid) {
      value.hour = hour < 10 ? "0" + hour : hour.toString()
      value.minute = minute < 10 ? "0" + minute : minute.toString()
      value.period = period

      if (open) {
        newWorkerhourssameday.opentime = value
      } else {
        newWorkerhourssameday.closetime = value
      }

      setAccountform({ ...accountForm, workerHourssameday: newWorkerhourssameday })
    }
  }
  const updateTime = (index, timetype, dir, open) => {
    const newLocationhours = [...locationHours]
    let value, { opentime, closetime } = newLocationhours[index]

    value = open ? opentime : closetime
    
    let { hour, minute, period } = timeControl(timetype, value, dir, open)

    value.hour = hour < 10 ? "0" + hour : hour.toString()
    value.minute = minute < 10 ? "0" + minute : minute.toString()
    value.period = period

    if (open) {
      newLocationhours[index].opentime = value
    } else {
      newLocationhours[index].closetime = value
    }

    setLocationhours(newLocationhours)
  }
  const working = index => {
    const newWorkerhours = [...accountForm.workerHours]

    newWorkerhours[index].working = !newWorkerhours[index].working

    setAccountform({ ...accountForm, workerHours: newWorkerhours })
  }
  const updateTheOwner = async() => {
    setAccountform({ ...accountForm, loading: true, errorMsg: "" })

    const { cellnumber, username, profile, currentPassword, newPassword, confirmPassword } = accountForm
    let data = { ownerid: accountForm.id, type: accountForm.editType }

    switch (accountForm.editType) {
      case "cellnumber":
        data = { ...data, cellnumber }

        break;
      case "username":
        data = { ...data, username }

        break;
      case "profile":
        data = { ...data, profile }

        break;
      case "password":
        data = { ...data, currentPassword, newPassword, confirmPassword }

        break;
      case "hours":
        const hours = {}

        accountForm.workerHours.forEach(function (workerHour) {
          let { opentime, closetime, working, takeShift } = workerHour
          let newOpentime = {...opentime}, newClosetime = {...closetime}
          let openhour = parseInt(newOpentime.hour), closehour = parseInt(newClosetime.hour)
          let openperiod = newOpentime.period, closeperiod = newClosetime.period

          if (openperiod == "PM") {
            if (openhour < 12) {
              openhour += 12
            }

            openhour = openhour < 10 ? 
              "0" + openhour
              :
              openhour.toString()
          } else {
            if (openhour == 12) {
              openhour = "00"
            } else if (openhour < 10) {
              openhour = "0" + openhour
            } else {
              openhour = openhour.toString()
            }
          }

          if (closeperiod == "PM") {
            if (closehour < 12) {
              closehour += 12
            }

            closehour = closehour < 10 ? 
              "0" + closehour
              :
              closehour.toString()
          } else {
            if (closehour == 12) {
              closehour = "00"
            } else if (closehour < 10) {
              closehour = "0" + closehour
            } else {
              closehour = closehour.toString()
            }
          }

          newOpentime.hour = openhour
          newClosetime.hour = closehour

          delete newOpentime.period
          delete newClosetime.period

          if (takeShift) {
            delete takeShift.key
          }

          hours[workerHour.header.substr(0, 3)] = { 
            opentime: newOpentime, 
            closetime: newClosetime, working, 
            takeShift: takeShift ? takeShift.id : ""
          }
        })

        data = { ...data, hours }

        break;
      default:
    }

    updateOwner(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setAccountform({
            ...accountForm,
            show: false,
            type: '', editType: '', 
            username: "", editUsername: false, 
            cellnumber: "", editCellnumber: false,
            currentPassword: "", newPassword: "", confirmPassword: "", editPassword: false, 
            profile: { uri: '', name: '', size: { width: 0, height: 0 }, diff: false }, editProfile: false, 
            daysInfo: { working: ['', '', '', '', '', '', ''], done: false, sameHours: null }, workerHours: [], workerHourssameday: null, editHours: false,
            loading: false, errorMsg: ""
          })
          setEditinfo({ ...editInfo, show: true })
          getAllAccounts()
          getTheWorkersHour(false)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data

          switch (status) {
            case "cellnumber":
              setAccountform({ ...accountForm, editCellnumber: true, editHours: false, errorMsg: errormsg, loading: false })

              break;
            case "password":
              setAccountform({ ...accountForm, editPassword: true, editHours: false, errorMsg: errormsg, loading: false })

              break;
            default:

          }
        }
      })
  }
  const deleteTheOwner = id => {
    if (!deleteOwnerbox.show) {
      getStylistInfo(id)
        .then((res) => {
          if (res.status == 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            const { username, profile, days } = res

            setDeleteownerbox({
              ...deleteOwnerbox,
              show: true,
              id, username, 
              profile,
              numWorkingdays: Object.keys(days).length
            })
            setEditinfo({ ...editInfo, show: false })
          }
        })
        .catch((err) => {
          if (err.response && err.response.status == 400) {
            const { errormsg, status } = err.response.data
          }
        })
    } else {
      const { id } = deleteOwnerbox

      deleteOwner(id)
        .then((res) => {
          if (res.status == 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            const newAccountholders = [...accountHolders]

            newAccountholders.forEach(function (info, index) {
              if (info.id == id) {
                newAccountholders.splice(index, 1)
              }
            })

            setAccountholders(newAccountholders)
            setEditinfo({ ...editInfo, show: true })
            setDeleteownerbox({ ...deleteOwnerbox, show: false })
          }
        })
        .catch((err) => {
          if (err.response && err.response.status == 400) {
            const { errormsg, status } = err.response.data
          }
        })
    }
  }
  const cancelTheShift = async(day) => {
    const newWorkerhours = [...accountForm.workerHours]

    newWorkerhours.forEach(function (info) {
      if (info.header.substr(0, 3) == day) {
        info.takeShift = ""
      }
    })

    setAccountform({...accountForm, workerHours: newWorkerhours })
  }
  const getTheOtherWorkers = async(day) => {
    const locationid = await AsyncStorage.getItem("locationid")
    const data = { ownerid: accountForm.id, locationid, day }

    getOtherWorkers(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setGetworkersbox({
            ...getWorkersbox,
            show: true,
            workers: res.workers,
            day
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const selectTheOtherWorker = workerInfo => {
    const { day } = getWorkersbox

    const newWorkerhours = [...accountForm.workerHours]

    newWorkerhours.forEach(function (info) {
      if (info.header.substr(0, 3) == day) {
        info.takeShift = workerInfo
      }
    })

    setAccountform({...accountForm, workerHours: newWorkerhours })
    setGetworkersbox({ ...getWorkersbox, show: false })
  }
  const updateTheLocationHours = async() => {
    setEditinfo({ ...editInfo, loading: true })

    const locationid = await AsyncStorage.getItem("locationid")
    const hours = {}

    locationHours.forEach(function (day) {
      let { opentime, closetime, close } = day
      let newOpentime = {...opentime}, newClosetime = {...closetime}
      let openhour = parseInt(newOpentime.hour), closehour = parseInt(newClosetime.hour)
      let openperiod = newOpentime.period, closeperiod = newClosetime.period

      if (openperiod == "PM") {
        if (openhour < 12) {
          openhour += 12
        }

        openhour = openhour < 10 ? 
          "0" + openhour
          :
          openhour.toString()
      } else {
        if (openhour == 12) {
          openhour = "00"
        } else if (openhour < 10) {
          openhour = "0" + openhour
        } else {
          openhour = openhour.toString()
        }
      }

      if (closeperiod == "PM") {
        if (closehour < 12) {
          closehour += 12
        }

        closehour = closehour < 10 ? 
          "0" + closehour
          :
          closehour.toString()
      } else {
        if (closehour == 12) {
          closehour = "00"
        } else if (closehour < 10) {
          closehour = "0" + closehour
        } else {
          closehour = closehour.toString()
        }
      }

      newOpentime.hour = openhour
      newOpentime.minute = newOpentime.minute
      newClosetime.hour = closehour
      newClosetime.minute = newClosetime.minute

      delete newOpentime.period
      delete newClosetime.period

      hours[day.header.substr(0, 3)] = { opentime: newOpentime, closetime: newClosetime, close }
    })

    const data = { locationid, hours: JSON.stringify(hours) }

    updateLocationHours(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setShowmoreoptions({ ...showMoreoptions, infoType: '' })
          setEditinfo({ ...editInfo, show: false, type: '', loading: false })
          getTheLocationProfile()
          getTheLocationHours()
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data

          setEditinfo({ ...editInfo, loading: false })
        }
      })
  }
  const updateTheLogins = async() => {
    const { type, info, owners } = logins
    const { id, cellnumber, verified, noAccount, currentPassword, newPassword, confirmPassword, userType } = info
    let data = { type, id }

    switch (type) {
      case "all":
        const locationid = await AsyncStorage.getItem("locationid")

        data = { ...data, locationid, cellnumber, newPassword, confirmPassword, userType }

        break;
      case "cellnumber":
        data = { ...data, cellnumber }

        break;
      case "password":
        data = { ...data, currentPassword, newPassword, confirmPassword }

        break;
      case "usertype":
        data = { ...data, userType }
      default:
    }

    updateLogins(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          getTheLogins()
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data

          setLogins({ ...logins, errorMsg: errormsg })
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
            message: "EasyBook Business allows you to take a photo of your location and your stylist profile",
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
  const setTheReceiveType = async(type) => {
    const locationid = await AsyncStorage.getItem("locationid")
    const data = { locationid, type }

    setReceiveType(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setLocationreceivetype(type)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const jsonDateToUnix = date => {
    return Date.parse(date["month"] + " " + date["date"] + ", " + date["year"] + " " + date["hour"] + ":" + date["minute"])
  }
  const unixToJsonDate = unix => {
    const info = new Date(unix)

    return { 
      day: days[info.getDay()], month: months[info.getMonth()], 
      date: info.getDate(), year: info.getFullYear(), 
      hour: info.getHours(), minute: info.getMinutes() 
    }
  }
  
	useEffect(() => {
    initialize()
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (props.route.params) {
        const params = props.route.params

        if (params.cartorders) {
          getAllCartOrderers()
        } else if (params.menu || params.initialize) {
          initialize()
        }

        props.navigation.setParams({ cartorders: null, menu: null, initialize: null })
      }
    }, [useIsFocused()])
  )

  const header = (locationType == "hair" || locationType == "nail") && " Salon " || 
                  locationType == "restaurant" && " Restaurant " || 
                  locationType == "store" && " Store "
  const { daysInfo } = accountForm

	return (
		<SafeAreaView style={styles.main}>
      {loaded ?
  			<View style={styles.box}>
  				<View style={styles.body}>
            <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
              <View style={{ alignItems: 'center', width: '100%' }}>
                {!menuState ? 
                  <>
                    <TouchableOpacity style={styles.viewTypeSettingTouch} onPress={() => {
                      setShowmoreoptions({ ...showMoreoptions, show: false })
                      props.navigation.navigate("menu", { userType })
                    }}>
                      <Text style={styles.viewTypeSettingTouchHeader}>{tr.t("main.hidden.showMoreoptions.changeMenu")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.viewTypeSettingTouch} onPress={() => setMenustate('info')}>
                      <Text style={styles.viewTypeSettingTouchHeader}>{tr.t("main.hidden.showMoreoptions.changeInfo")}</Text>
                    </TouchableOpacity>

                    {(locationType == "hair" || locationType == "nail") ? 
                      <TouchableOpacity style={styles.viewTypeSettingTouch} onPress={() => {
                        setEditinfo({ ...editInfo, show: true, type: 'users' })
                        setShowmoreoptions({ ...showMoreoptions, infoType: 'users' })
                        getAllAccounts()
                      }}>
                        <Text style={styles.viewTypeSettingTouchHeader}>{tr.t("main.hidden.showMoreoptions.changeStaffinfo")}</Text>
                      </TouchableOpacity>
                      :
                      <TouchableOpacity style={styles.viewTypeSettingTouch} onPress={() => {
                        getTheLogins()
                        setEditinfo({ ...editInfo, show: true, type: 'login' })
                        setShowmoreoptions({ ...showMoreoptions, infoType: 'login' })
                      }}>
                        <Text style={styles.viewTypeSettingTouchHeader}>{tr.t("main.hidden.showMoreoptions.changeLogininfo")}</Text>
                      </TouchableOpacity>
                    }

                    <TouchableOpacity style={styles.viewTypeSettingTouch} onPress={() => {
                      AsyncStorage.removeItem("locationid")
                      AsyncStorage.removeItem("locationtype")
                      AsyncStorage.setItem("phase", "list")

                      setShowmoreoptions({ ...showMoreoptions, show: false })

                      setTimeout(function () {
                        props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "list" }]}));
                      }, 1000)
                    }}>
                      <Text style={styles.viewTypeSettingTouchHeader}>{tr.t("main.hidden.showMoreoptions.moreBusinesses." + (numBusinesses == 1 ? "none" : "some"))}</Text>
                    </TouchableOpacity>

                    {(locationType == "hair" || locationType == "nail") && (
                      <TouchableOpacity style={styles.viewTypeSettingTouch} onPress={() => {
                        AsyncStorage.setItem("phase", "walkin")

                        setShowmoreoptions({ ...showMoreoptions, show: false })

                        setTimeout(function () {
                          props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "walkin" }]}));
                        }, 1000)
                      }}>
                        <Text style={styles.viewTypeSettingTouchHeader}>{tr.t("main.hidden.showMoreoptions.walkIn")}</Text>
                      </TouchableOpacity>
                    )}

                    {(locationType == "hair" || locationType == "nail") && (
                      <View style={styles.viewTypeSettingsBox}>
                        <Text style={styles.viewTypeSettingsHeader}>{tr.t("main.hidden.showMoreoptions.getAppointmentsby.header")}</Text>

                        <View style={{ alignItems: 'center' }}>
                          <View style={styles.viewTypeSettingsOptions}>
                            <TouchableOpacity style={[styles.viewTypeSettingOption, { backgroundColor: locationReceivetype == 'everyone' ? 'black' : 'white' }]} onPress={() => setTheReceiveType('everyone')}>
                              <Text style={[styles.viewTypeSettingOptionHeader, { color: locationReceivetype == 'everyone' ? 'white' : 'black' }]}>{tr.t("main.hidden.showMoreoptions.getAppointmentsby.both")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.viewTypeSettingOption, { backgroundColor: locationReceivetype == 'owner' ? 'black' : 'white' }]} onPress={() => setTheReceiveType('owner')}>
                              <Text style={[styles.viewTypeSettingOptionHeader, { color: locationReceivetype == 'owner' ? 'white' : 'black' }]}>{tr.t("main.hidden.showMoreoptions.getAppointmentsby.owner")}</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    )}

                    {locationType == "restaurant" && (
                      <TouchableOpacity style={styles.viewTypeSettingTouch} onPress={() => {
                        setShowmoreoptions({ ...showMoreoptions, show: false })
                        props.navigation.navigate("tables")
                      }}>
                        <Text style={styles.viewTypeSettingTouchHeader}>{tr.t("main.hidden.showMoreoptions.editTables")}</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.viewTypeSettingTouch} onPress={() => {
                      setShowmoreoptions({ ...showMoreoptions, show: false })

                      if (locationType == "restaurant") {
                        props.navigation.navigate("restaurantincomerecords")
                      } else {
                        props.navigation.navigate("salonincomerecords")
                      }
                    }}>
                      <Text style={styles.viewTypeSettingTouchHeader}>{tr.t("main.hidden.showMoreoptions.paymentRecords")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.viewTypeSettingTouch} onPress={() => {
                      setShowmoreoptions({ ...showMoreoptions, infoType: 'changelanguage' })
                      setEditinfo({ ...editInfo, show: true, type: 'changelanguage' })
                    }}>
                      <Text style={styles.viewTypeSettingTouchHeader}>{tr.t("main.hidden.showMoreoptions.changeLanguage")}</Text>
                    </TouchableOpacity>
                  </>
                  :
                  <>
                    <TouchableOpacity style={[styles.viewTypeSettingTouch, { flexDirection: 'row', justifyContent: 'space-around', width: '30%' }]} onPress={() => setMenustate('')}>
                      <Entypo name="chevron-left" size={wsize(10)}/>
                      <View style={styles.column}><Text style={styles.viewTypeSettingTouchHeader}>{tr.t("buttons.back")}</Text></View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.viewTypeSettingTouch} onPress={() => {
                      setShowmoreoptions({ ...showMoreoptions, infoType: 'information' })
                      setEditinfo({ ...editInfo, show: true, type: 'information', storeName, phonenumber })
                    }}>
                      <Text style={styles.viewTypeSettingTouchHeader}>{tr.t("main.hidden.showMoreoptions.changeBusinessinformation")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.viewTypeSettingTouch} onPress={() => {
                      setShowmoreoptions({ ...showMoreoptions, infoType: 'location' })
                      setEditinfo({ ...editInfo, show: true, type: 'location' })
                    }}>
                      <Text style={styles.viewTypeSettingTouchHeader}>{tr.t("main.hidden.showMoreoptions.changeBusinesslocation")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.viewTypeSettingTouch} onPress={() => {
                      setShowmoreoptions({ ...showMoreoptions, infoType: 'logo' })
                      setEditinfo({ ...editInfo, show: true, type: 'logo' })
                    }}>
                      <Text style={styles.viewTypeSettingTouchHeader}>{tr.t("main.hidden.showMoreoptions.changeBusinesslogo")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.viewTypeSettingTouch} onPress={() => {
                      setShowmoreoptions({ ...showMoreoptions, infoType: 'hours' })
                      setEditinfo({ ...editInfo, show: true, type: 'hours' })
                    }}>
                      <Text style={styles.viewTypeSettingTouchHeader}>{tr.t("main.hidden.showMoreoptions.changeBusinesshours")}</Text>
                    </TouchableOpacity>
                  </>
                }  
              </View>
            </ScrollView>
  				</View>

  				<View style={styles.bottomNavs}>
  					<View style={styles.bottomNavsRow}>
              <View style={[styles.column, { width: '28%' }]}>
                <TouchableOpacity style={styles.bottomNavButton} onPress={() => {
                  if (locationType == "nail" || locationType == "hair") {
                    getTheWorkersTime()
                  } else {
                    setShowinfo({ ...showInfo, show: true })
                  }
                }}>
                  <Text style={styles.bottomNavButtonHeader}>{tr.t("main.bottomNavs.hours")}</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.column, { width: '28%' }]}>
                <TouchableOpacity style={styles.bottomNavButton} onPress={() => logout()}>
                  <Text style={styles.bottomNavButtonHeader}>Log out</Text>
                </TouchableOpacity>
              </View>
  					</View>
  				</View>
  			</View>
        :
        <View style={styles.loading}>
          <ActivityIndicator color="black" size="small"/>
        </View>
      }
      
      {(
        showInfo.show || showMoreoptions.infoType != '' || showDisabledscreen || 
        showAddtable.show || showRemovetable.show
      ) && (
        <Modal transparent={true}>
          <SafeAreaView style={{ flex: 1 }}>
            {showInfo.show && (
              <View style={styles.showInfoContainer}>
                <View style={styles.showInfoBox}>
                  <ScrollView style={{ width: '100%' }}>
                    <View style={{ alignItems: 'center' }}>
                      <TouchableOpacity style={styles.showInfoClose} onPress={() => setShowinfo({ ...showInfo, show: false })}>
                        <AntDesign name="close" size={wsize(7)}/>
                      </TouchableOpacity>

                      <Text style={styles.showInfoHeader}>{tr.t("main.hidden.showInfo.businessHeader")}</Text>

                      {showInfo.locationHours.map(info => (
                        !info.close && (
                          <View style={styles.workerTimeContainer} key={info.key}>
                            <Text style={styles.dayHeader}>{tr.t("days." + info.header)}: </Text>
                            <View style={styles.timeHeaders}>
                              <Text style={styles.timeHeader}>{info.opentime.hour}</Text>
                              <View style={styles.column}><Text style={styles.timeHeaderSep}>:</Text></View>
                              <Text style={styles.timeHeader}>{info.opentime.minute}</Text>
                              <Text style={styles.timeHeader}>{info.opentime.period}</Text>
                            </View>
                            <View style={styles.column}><Text style={styles.timeHeaderSep}> - </Text></View>
                            <View style={styles.timeHeaders}>
                              <Text style={styles.timeHeader}>{info.closetime.hour}</Text>
                              <View style={styles.column}><Text style={styles.timeHeaderSep}>:</Text></View>
                              <Text style={styles.timeHeader}>{info.closetime.minute}</Text>
                              <Text style={styles.timeHeader}>{info.closetime.period}</Text>
                            </View>
                          </View>
                        )
                      ))}

                      {(locationType == "hair" || locationType == "nail") && (
                        <View style={styles.workerInfoList}>
                          <Text style={styles.showInfoHeader}>{tr.t("main.hidden.showInfo.staffHeader")}</Text>

                          {showInfo.workersHours.map(worker => (
                            <View key={worker.key} style={{ alignItems: 'center', backgroundColor: 'rgba(127, 127, 127, 0.2)', marginBottom: 50, paddingVertical: 10 }}>
                              <View style={styles.workerInfo}>
                                <View style={styles.workerInfoProfile}>
                                  <Image 
                                    source={worker.profile.name ? { uri: logo_url + worker.profile.name } : require("../../assets/noimage.jpeg")}
                                    style={resizePhoto(worker.profile, wsize(30))}
                                  />
                                </View>
                                <Text style={styles.workerInfoName}>{tr.t("main.hidden.showInfo.staffName")} {worker.name}</Text>
                              </View>
                              <View style={styles.workerTime}>
                                {worker.hours.map(info => (
                                  info.working && (
                                    <View style={styles.workerTimeContainer} key={info.key}>
                                      <Text style={styles.dayHeader}>{tr.t("days." + info.header)}: </Text>
                                      <View style={styles.timeHeaders}>
                                        <Text style={styles.timeHeader}>{info.opentime.hour}</Text>
                                        <View style={styles.column}><Text style={styles.timeHeaderSep}>:</Text></View>
                                        <Text style={styles.timeHeader}>{info.opentime.minute}</Text>
                                        <Text style={styles.timeHeader}>{info.opentime.period}</Text>
                                      </View>
                                      <View style={styles.column}><Text style={styles.timeHeaderSep}> - </Text></View>
                                      <View style={styles.timeHeaders}>
                                        <Text style={styles.timeHeader}>{info.closetime.hour}</Text>
                                        <View style={styles.column}><Text style={styles.timeHeaderSep}>:</Text></View>
                                        <Text style={styles.timeHeader}>{info.closetime.minute}</Text>
                                        <Text style={styles.timeHeader}>{info.closetime.period}</Text>
                                      </View>
                                    </View>
                                  )
                                ))}
                              </View>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </ScrollView>
                </View>
              </View>
            )}
            {showMoreoptions.infoType != '' && (
              <View style={styles.moreInfosContainer}>
                <View style={styles.moreInfosBox}>
                  {editInfo.show && (
                    <View style={styles.editInfoBox}>
                      <View style={styles.editInfoContainer}>
                        <TouchableOpacity style={[styles.editInfoClose, { marginVertical: 5 }]} onPress={() => {
                          setShowmoreoptions({ ...showMoreoptions, infoType: '' })

                          if (editInfo.type == 'login') {
                            setLogins({
                              owners: [], newOwner: false, 
                              info: { noAccount: false, cellnumber: '', verifyCode: "", verified: false, currentPassword: "", confirmPassword: "", userType: null },
                              errorMsg: ""
                            })
                          } else {
                            setEditinfo({ ...editInfo, show: false, type: '' })
                          }
                        }}>
                          <AntDesign name="closecircleo" size={wsize(10)}/>
                        </TouchableOpacity>

                        {editInfo.type == 'changelanguage' && (
                          <View style={styles.languages}>
                            {language != "english" && (
                              <TouchableOpacity style={styles.language} onPress={() => pickLanguage('english')}>
                                <Text style={styles.languageHeader}>{tr.t("main.editingLanguage.english")}</Text>
                              </TouchableOpacity>
                            )}
                              
                            {language != "french" && (
                              <TouchableOpacity style={styles.language} onPress={() => pickLanguage('french')}>
                                <Text style={styles.languageHeader}>{tr.t("main.editingLanguage.french")}</Text>
                              </TouchableOpacity>
                            )}

                            {language != "vietnamese" && (
                              <TouchableOpacity style={styles.language} onPress={() => pickLanguage('vietnamese')}>
                                <Text style={styles.languageHeader}>{tr.t("main.editingLanguage.vietnamese")}</Text>
                              </TouchableOpacity>
                            )}

                            {language != "chinese" && (
                              <TouchableOpacity style={styles.language} onPress={() => pickLanguage('chinese')}>
                                <Text style={styles.languageHeader}>{tr.t("main.editingLanguage.chinese")}</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        )}

                        {editInfo.type == 'information' && (
                          <>
                            <View style={styles.inputsBox}>
                              <View style={styles.inputContainer}>
                                <Text style={styles.inputHeader}>{tr.t("main.editingInformation.name")}:</Text>
                                <TextInput style={styles.input} onChangeText={(storeName) => setEditinfo({ ...editInfo, storeName })} value={editInfo.storeName} autoCorrect={false}/>
                              </View>
                              <View style={styles.inputContainer}>
                                <Text style={styles.inputHeader}>{tr.t("main.editingInformation.phonenumber")}:</Text>
                                <TextInput style={styles.input} onChangeText={(num) => setEditinfo({ ...editInfo, phonenumber: displayPhonenumber(phonenumber, num, () => Keyboard.dismiss()) })} value={editInfo.phonenumber} keyboardType="numeric" autoCorrect={false}/>
                              </View>
                            </View>

                            <Text style={styles.errorMsg}>{editInfo.errorMsg}</Text>

                            <TouchableOpacity style={[styles.updateButton, { opacity: editInfo.loading ? 0.3 : 1 }]} disabled={editInfo.loading} onPress={() => updateTheInformation()}>
                              <Text style={styles.updateButtonHeader}>{tr.t("buttons.update")}</Text>
                            </TouchableOpacity>
                          </>
                        )}

                        {editInfo.type == 'location' && (
                          <>
                            <Text style={styles.locationHeader}>{tr.t("main.editingLocation")}</Text>

                            <View style={{ flex: 1, width: '90%' }}>
                              <GooglePlacesAutocomplete
                                listUnderlayColor={"#c8c7cc"}
                                placeholder="Type in address"
                                minLength={2} 
                                fetchDetails={true}
                                onPress={(data, details = null) => {
                                  const { lat, lng } = details.geometry.location

                                  setEditinfo({ 
                                    ...editInfo, 
                                    coords: { 
                                      ...editInfo.coords, 
                                      latitude: lat,
                                      longitude: lng,
                                      latitudeDelta: 0.001,
                                      longitudeDelta: 0.001
                                    }
                                  })
                                }}
                                query={{ key: 'AIzaSyAKftYxd_CLjHhk0gAKppqB3LxgR6aYFjE', language: 'en' }}
                                nearbyPlacesAPI='GooglePlacesSearch'
                                debounce={100}
                              />

                              {locationCoords.longitude && (
                                <MapView
                                  style={{ flex: 1 }}
                                  region={editInfo}
                                  showsUserLocation={true}
                                  onRegionChange={(reg) => setEditinfo({ 
                                    ...editInfo, 
                                    coords: { ...editInfo.coords, reg } 
                                  })}>
                                  <Marker coordinate={locationCoords} />
                                </MapView>
                              )}
                            </View>

                            <Text style={styles.errorMsg}>{editInfo.errorMsg}</Text>

                            <TouchableOpacity style={[styles.updateButton, { opacity: editInfo.loading ? 0.3 : 1 }]} disabled={editInfo.loading} onPress={() => updateTheAddress()}>
                              <Text style={styles.updateButtonHeader}>{tr.t("buttons.update")}</Text>
                            </TouchableOpacity>
                          </>
                        )}

                        {editInfo.type == 'logo' && (
                          <View style={[styles.cameraContainer]}>
                            <Text style={styles.header}>{tr.t("main.editingLogo")}</Text>

                            {editInfo.logo.uri ? (
                              <>
                                <Image style={resizePhoto(editInfo.logo.size, wsize(80))} source={{ uri: editInfo.logo.uri }}/>

                                <TouchableOpacity style={styles.cameraAction} onPress={() => {
                                  allowCamera()
                                  setEditinfo({ ...editInfo, logo: {...editInfo, uri: '' }})
                                }}>
                                  <Text style={styles.cameraActionHeader}>{tr.t("buttons.cancel")}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.updateButton, { opacity: editInfo.loading ? 0.3 : 1 }]} disabled={editInfo.loading} onPress={() => updateTheLogo()}>
                                  <Text style={styles.updateButtonHeader}>{tr.t("buttons.update")}</Text>
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

                                    <View style={{ alignItems: 'center', marginVertical: 10 }}>
                                      <Ionicons name="camera-reverse-outline" size={wsize(7)} onPress={() => setCamtype(camType == 'back' ? 'front' : 'back')}/>
                                    </View>
                                  </>
                                )}

                                <View style={styles.cameraActions}>
                                  <TouchableOpacity style={[styles.cameraAction, { opacity: editInfo.loading ? 0.5 : 1 }]} disabled={editInfo.loading} onPress={snapPhoto.bind(this)}>
                                    <Text style={styles.cameraActionHeader}>{tr.t("buttons.takePhoto")}</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity style={[styles.cameraAction, { opacity: editInfo.loading ? 0.5 : 1 }]} disabled={editInfo.loading} onPress={() => {
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

                        {editInfo.type == 'hours' && (
                          <ScrollView style={{ height: '100%', width: '100%' }}>
                            <Text style={[styles.header, { fontSize: wsize(6), textAlign: 'center' }]}>{tr.t("main.editingHours.header")}</Text>

                            {locationHours.map((info, index) => (
                              <View key={index} style={styles.workerHour}>
                                {info.close == false ? 
                                  <>
                                    <View style={{ opacity: info.close ? 0.1 : 1, width: '100%' }}>
                                      <Text style={styles.workerHourHeader}>{
                                        language == "chinese" ? 
                                          tr.t("main.editingHours.openHeader." + info.header)
                                          :
                                          tr.t("main.editingHours.openHeader").replace("{day}", tr.t("days." + info.header))
                                      }</Text>
                                      <View style={styles.timeSelectionContainer}>
                                        <View style={styles.timeSelection}>
                                          <View style={styles.selection}>
                                            <TouchableOpacity onPress={() => updateTime(index, "hour", "up", true)}>
                                              <AntDesign name="up" size={wsize(7)}/>
                                            </TouchableOpacity>
                                            <TextInput style={styles.selectionHeader} onChangeText={(hour) => {
                                              const newLocationhours = [...locationHours]

                                              newLocationhours[index].opentime["hour"] = hour.toString()

                                              setLocationhours(newLocationhours)
                                            }} keyboardType="numeric" maxLength={2} value={info.opentime.hour}/>
                                            <TouchableOpacity onPress={() => updateTime(index, "hour", "down", true)}>
                                              <AntDesign name="down" size={wsize(7)}/>
                                            </TouchableOpacity>
                                          </View>
                                          <View style={styles.column}>
                                            <Text style={styles.selectionDiv}>:</Text>
                                          </View>
                                          <View style={styles.selection}>
                                            <TouchableOpacity onPress={() => updateTime(index, "minute", "up", true)}>
                                              <AntDesign name="up" size={wsize(7)}/>
                                            </TouchableOpacity>
                                            <TextInput style={styles.selectionHeader} onChangeText={(minute) => {
                                              const newLocationhours = [...locationHours]

                                              newLocationhours[index].opentime["minute"] = minute.toString()

                                              setLocationhours(newLocationhours)
                                            }} keyboardType="numeric" maxLength={2} value={info.opentime.minute}/>
                                            <TouchableOpacity onPress={() => updateTime(index, "minute", "down", true)}>
                                              <AntDesign name="down" size={wsize(7)}/>
                                            </TouchableOpacity>
                                          </View>
                                          <View style={styles.selection}>
                                            <TouchableOpacity onPress={() => updateTime(index, "period", "up", true)}>
                                              <AntDesign name="up" size={wsize(7)}/>
                                            </TouchableOpacity>
                                            <Text style={styles.selectionHeader}>{info.opentime.period}</Text>
                                            <TouchableOpacity onPress={() => updateTime(index, "period", "down", true)}>
                                              <AntDesign name="down" size={wsize(7)}/>
                                            </TouchableOpacity>
                                          </View>
                                        </View>
                                        <View style={styles.timeSelectionColumn}>
                                          <Text style={styles.timeSelectionHeader}>To</Text>
                                        </View>
                                        <View style={styles.timeSelection}>
                                          <View style={styles.selection}>
                                            <TouchableOpacity onPress={() => updateTime(index, "hour", "up", false)}>
                                              <AntDesign name="up" size={wsize(7)}/>
                                            </TouchableOpacity>
                                            <TextInput style={styles.selectionHeader} onChangeText={(hour) => {
                                              const newLocationhours = [...locationHours]

                                              newLocationhours[index].closetime["hour"] = hour.toString()

                                              setLocationhours(newLocationhours)
                                            }} keyboardType="numeric" maxLength={2} value={info.closetime.hour}/>
                                            <TouchableOpacity onPress={() => updateTime(index, "hour", "down", false)}>
                                              <AntDesign name="down" size={wsize(7)}/>
                                            </TouchableOpacity>
                                          </View>
                                          <View style={styles.column}>
                                            <Text style={styles.selectionDiv}>:</Text>
                                          </View>
                                          <View style={styles.selection}>
                                            <TouchableOpacity onPress={() => updateTime(index, "minute", "up", false)}>
                                              <AntDesign name="up" size={wsize(7)}/>
                                            </TouchableOpacity>
                                            <TextInput style={styles.selectionHeader} onChangeText={(minute) => {
                                              const newLocationhours = [...locationHours]

                                              newLocationhours[index].closetime["minute"] = minute.toString()

                                              setLocationhours(newLocationhours)
                                            }} keyboardType="numeric" maxLength={2} value={info.closetime.minute}/>
                                            <TouchableOpacity onPress={() => updateTime(index, "minute", "down", false)}>
                                              <AntDesign name="down" size={wsize(7)}/>
                                            </TouchableOpacity>
                                          </View>
                                          <View style={styles.selection}>
                                            <TouchableOpacity onPress={() => updateTime(index, "period", "up", false)}>
                                              <AntDesign name="up" size={wsize(7)}/>
                                            </TouchableOpacity>
                                            <Text style={styles.selectionHeader}>{info.closetime.period}</Text>
                                            <TouchableOpacity onPress={() => updateTime(index, "period", "down", false)}>
                                              <AntDesign name="down" size={wsize(7)}/>
                                            </TouchableOpacity>
                                          </View>
                                        </View>
                                      </View>
                                    </View>
                                    <TouchableOpacity style={styles.workerTouch} onPress={() => {
                                      const newLocationhours = [...locationHours]

                                      newLocationhours[index].close = true

                                      setLocationhours(newLocationhours)
                                    }}>
                                      <Text style={styles.workerTouchHeader}>{tr.t("main.editingHours.changeToNotOpen")}</Text>
                                    </TouchableOpacity>
                                  </>
                                  :
                                  <>
                                    <Text style={styles.workerHourHeader}>{tr.t("main.editingHours.notOpen").replace("{day}", tr.t("days." + info.header))}</Text>

                                    <TouchableOpacity style={styles.workerTouch} onPress={() => {
                                      const newLocationhours = [...locationHours]

                                      newLocationhours[index].close = false

                                      setLocationhours(newLocationhours)
                                    }}>
                                      <Text style={styles.workerTouchHeader}>{tr.t("main.editingHours.changeToOpen")}</Text>
                                    </TouchableOpacity>
                                  </>
                                }
                              </View>
                            ))}

                            <View style={styles.updateButtons}>
                              <TouchableOpacity style={styles.updateButton} disabled={editInfo.loading} onPress={() => {
                                setShowmoreoptions({ ...showMoreoptions, infoType: '' })
                                setEditinfo({ ...editInfo, show: false, type: '' })
                              }}>
                                <Text style={styles.updateButtonHeader}>{tr.t("buttons.cancel")}</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={styles.updateButton} disabled={editInfo.loading} onPress={() => updateTheLocationHours()}>
                                <Text style={styles.updateButtonHeader}>{tr.t("buttons.update")}</Text>
                              </TouchableOpacity>
                            </View>
                          </ScrollView>
                        )}

                        {editInfo.type == 'users' && (
                          <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.accountHolders}>
                              <Text style={styles.header}>{tr.t("main.editInfo.staff.header")}</Text>

                              {userType == "owner" && (
                                <TouchableOpacity style={styles.accountHoldersAdd} onPress={() => {
                                  setAccountform({
                                    ...accountForm,
                                    show: true,
                                    type: 'add',
                                    username: ownerSigninInfo.username,
                                    cellnumber: ownerSigninInfo.cellnumber,
                                    currentPassword: ownerSigninInfo.password, 
                                    newPassword: ownerSigninInfo.password, 
                                    confirmPassword: ownerSigninInfo.password,
                                    workerHours: [...hoursRange]
                                  })
                                  setEditinfo({ ...editInfo, show: false })
                                }}>
                                  <Text style={styles.accountHoldersAddHeader}>{tr.t("main.editInfo.staff.add")}</Text>
                                </TouchableOpacity>
                              )}
                              
                              {accountHolders.map((info, index) => (
                                <View key={info.key} style={styles.account}>
                                  <View style={styles.row}>
                                    <View style={styles.column}>
                                      <Text style={styles.accountHeader}>#{index + 1}:</Text>
                                    </View>

                                    <View style={styles.accountEdit}>
                                      <View style={styles.column}>
                                        <View style={styles.accountEditProfile}>
                                          <Image 
                                            source={info.profile.name ? { uri: logo_url + info.profile.name } : require("../../assets/profilepicture.jpeg")}
                                            style={resizePhoto(info.profile, wsize(20))}
                                          />
                                        </View>
                                      </View>

                                      <View style={styles.column}><Text style={styles.accountEditHeader}>{info.username}</Text></View>

                                      {(locationType == "hair" || locationType == "nail") && (
                                        userType == "owner" && (
                                          <View style={styles.column}>
                                            <TouchableOpacity onPress={() => deleteTheOwner(info.id)}>
                                              <AntDesign color="black" name="closecircleo" size={wsize(7)}/>
                                            </TouchableOpacity>
                                          </View>
                                        )
                                      )}
                                    </View>
                                  </View>

                                  {(locationType == "hair" || locationType == "nail") && (
                                    <View style={styles.column}>
                                      <TouchableOpacity style={styles.accountEditTouch} onPress={() => {
                                        if (info.id == ownerId) {
                                          setAccountform({
                                            ...accountForm,
                                            show: true, type: 'edit', 
                                            id: info.id, self: true,
                                            username: info.username,
                                            cellnumber: info.cellnumber,
                                            password: '',
                                            confirmPassword: '',
                                            profile: { 
                                              ...accountForm.profile,  
                                              uri: info.profile.name ? logo_url + info.profile.name : "",
                                              name: info.profile.name ? info.profile.name : "",
                                              size: { width: info.profile.width, height: info.profile.height }
                                            },
                                            workerHours: info.hours
                                          })
                                        } else { // others can only edit other's hours
                                          setAccountform({ 
                                            ...accountForm, 
                                            show: true, type: '', editType: 'hours', 
                                            id: info.id, self: false,
                                            workerHours: info.hours, editHours: true
                                          })
                                        }

                                        setEditinfo({ ...editInfo, show: false })
                                      }}>
                                        <Text style={styles.accountEditTouchHeader}>
                                          {tr.t("main.editInfo.staff.change." + (ownerId == info.id ? "self" : "other"))}
                                        </Text>
                                      </TouchableOpacity>
                                    </View>
                                  )}
                                </View>
                              ))}
                            </View>
                          </ScrollView>
                        )}

                        {editInfo.type == 'login' && (
                          <View style={{ alignItems: 'center', width: '100%' }}>
                            {!logins.type ? 
                              <>
                                <TouchableOpacity style={styles.loginsAdd} onPress={() => setLogins({ ...logins, type: "all" })}>
                                  <Text style={styles.loginsAddHeader}>Add new login</Text>
                                </TouchableOpacity>

                                <FlatList
                                  data={logins.owners}
                                  style={{ height: '80%', width: '100%' }}
                                  renderItem={({ item, index }) => 
                                    <View key={item.key} style={styles.login}>
                                      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                        <Text style={styles.loginIndex}>#{index + 1}</Text>
                                        <View style={styles.column}><Text style={styles.loginHeader}>{displayPhonenumber('', item.cellnumber, () => {})}</Text></View>
                                      </View>

                                      <View style={{ alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.2)', width: '100%' }}>
                                        <View style={styles.column}>
                                          <TouchableOpacity style={styles.loginChange} onPress={() => setLogins({ ...logins, type: 'usertype', info: {...logins.info, id: item.id, userType: item.userType }})}>
                                            <Text style={styles.loginChangeHeader}>Change User Type{'\n(' + item.userType + ')'}</Text>
                                          </TouchableOpacity>
                                        </View>

                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                                          <View style={[styles.column, { marginHorizontal: '5%' }]}>
                                            <TouchableOpacity style={styles.loginChange} onPress={() => setLogins({ ...logins, type: 'cellnumber', info: {...logins.info, id: item.id, noAccount: false, verifyCode: "", verified: false }})}>
                                              <Text style={styles.loginChangeHeader}>Change number</Text>
                                            </TouchableOpacity>
                                          </View>

                                          <View style={[styles.column, { marginHorizontal: '5%' }]}>
                                            <TouchableOpacity style={styles.loginChange} onPress={() => setLogins({ ...logins, type: 'password', info: {...logins.info, id: item.id }})}>
                                              <Text style={styles.loginChangeHeader}>Change Password</Text>
                                            </TouchableOpacity>
                                          </View>
                                        </View>

                                        <View style={styles.column}>
                                          <TouchableOpacity style={styles.loginRemove} onPress={() => deleteTheLogin(item.id)}>
                                            <AntDesign name="closecircleo" size={wsize(10)}/>
                                          </TouchableOpacity>
                                        </View>
                                      </View>
                                    </View>
                                  }
                                />
                              </>
                              :
                              logins.type == "all" ? 
                                <>
                                  {!logins.info.noAccount ? 
                                    <View style={styles.inputContainer}>
                                      <Text style={styles.inputHeader}>{tr.t("main.editingInformation.cellnumber").replace(" your", "")}:</Text>
                                      <TextInput style={styles.input} onChangeText={(num) => setLogins({ ...logins, info: { ...logins.info, cellnumber: displayPhonenumber(logins.info.cellnumber, num, () => Keyboard.dismiss()) }})} value={logins.info.cellnumber} autoCorrect={false} keyboardType="numeric"/>
                                    </View>
                                    :
                                    !logins.info.verified ? 
                                      <View style={styles.inputContainer}>
                                        <Text style={styles.inputHeader}>{tr.t("main.editingInformation.verifyCode")}:</Text>
                                        <TextInput style={styles.input} onChangeText={(verifyCode) => {
                                          if (verifyCode.length == 6) {
                                            Keyboard.dismiss()

                                            if (logins.info.verifyCode == verifyCode || verifyCode == '111111') {
                                              setLogins({ ...logins, info: { ...logins.info, verified: true }, errorMsg: "" })
                                            } else {
                                              setLogins({ ...logins, errorMsg: "The code is wrong" })
                                            }
                                          } else {
                                            setLogins({ ...logins, errorMsg: "" })
                                          }
                                        }} autoCorrect={false} keyboardType="numeric"/>
                                      </View>
                                      :
                                      <>
                                        <View style={styles.inputContainer}>
                                          <Text style={styles.inputHeader}>{tr.t("main.editingInformation.newPassword")}:</Text>
                                          <TextInput style={styles.input} onChangeText={(newPassword) => setLogins({ ...logins, info: { ...logins.info, newPassword }})} secureTextEntry value={logins.info.newPassword} autoCorrect={false}/>
                                        </View>
                                        <View style={styles.inputContainer}>
                                          <Text style={styles.inputHeader}>{tr.t("main.editingInformation.confirmPassword").replace(" your", "")}:</Text>
                                          <TextInput style={styles.input} onChangeText={(confirmPassword) => setLogins({ ...logins, info: { ...logins.info, confirmPassword }})} secureTextEntry value={logins.info.confirmPassword} autoCorrect={false}/>
                                        </View>

                                        <View style={styles.userType}>
                                          <Text style={styles.userTypeHeader}>User type</Text>
                                          <View style={styles.userTypeActions}>
                                            <TouchableOpacity style={[styles.userTypeAction, { backgroundColor: logins.info.userType == "owner" ? "black" : "transparent" }]} onPress={() => setLogins({ ...logins, info: { ...logins.info, userType: "owner" }})}>
                                              <Text style={[styles.userTypeActionHeader, { color: logins.info.userType == "owner" ? "white": "black" }]}>Owner</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[styles.userTypeAction, { backgroundColor: logins.info.userType == "kitchen" ? "black" : "transparent" }]} onPress={() => setLogins({ ...logins, info: { ...logins.info, userType: "kitchen" }})}>
                                              <Text style={[styles.userTypeActionHeader, { color: logins.info.userType == "kitchen" ? "white": "black" }]}>Kitchen</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[styles.userTypeAction, { backgroundColor: logins.info.userType == "orderer" ? "black" : "transparent" }]} onPress={() => setLogins({ ...logins, info: { ...logins.info, userType: "orderer" }})}>
                                              <Text style={[styles.userTypeActionHeader, { color: logins.info.userType == "orderer" ? "white": "black" }]}>Orderer</Text>
                                            </TouchableOpacity>
                                          </View>
                                        </View>
                                      </>
                                  }

                                  <Text style={styles.errorMsg}>{logins.errorMsg}</Text>

                                  {!logins.info.noAccount ? 
                                    <TouchableOpacity style={[styles.updateButton, { opacity: editInfo.loading ? 0.3 : 1 }]} onPress={() => verifyLogin()}>
                                      <Text style={styles.updateButtonHeader}>Verify</Text>
                                    </TouchableOpacity>
                                    :
                                    logins.info.verified && (
                                      <TouchableOpacity style={[styles.updateButton, { opacity: editInfo.loading ? 0.3 : 1 }]} onPress={() => updateTheLogins()}>
                                        <Text style={styles.updateButtonHeader}>Done</Text>
                                      </TouchableOpacity>
                                    )
                                  }
                                </>
                                :
                                <>
                                  {logins.type == "password" && (
                                    <>
                                      <View style={styles.inputContainer}>
                                        <Text style={styles.inputHeader}>{tr.t("main.editingInformation.currentPassword")}:</Text>
                                        <TextInput style={styles.input} onChangeText={(currentPassword) => setLogins({ ...logins, info: { ...logins.info, currentPassword }})} secureTextEntry value={logins.info.currentPassword} autoCorrect={false}/>
                                      </View>
                                      <View style={styles.inputContainer}>
                                        <Text style={styles.inputHeader}>{tr.t("main.editingInformation.newPassword")}:</Text>
                                        <TextInput style={styles.input} onChangeText={(newPassword) => setLogins({ ...logins, info: { ...logins.info, newPassword }})} secureTextEntry value={logins.info.newPassword} autoCorrect={false}/>
                                      </View>
                                      <View style={styles.inputContainer}>
                                        <Text style={styles.inputHeader}>{tr.t("main.editingInformation.confirmPassword")}:</Text>
                                        <TextInput style={styles.input} onChangeText={(confirmPassword) => setLogins({ ...logins, info: { ...logins.info, confirmPassword }})} secureTextEntry value={logins.info.confirmPassword} autoCorrect={false}/>
                                      </View>
                                    </>
                                  )}

                                  {logins.type == "cellnumber" && (
                                    !logins.info.noAccount ? 
                                      <View style={styles.inputContainer}>
                                        <Text style={styles.inputHeader}>{tr.t("main.editingInformation.cellnumber").replace(" your", " new")}:</Text>
                                        <TextInput style={styles.input} onChangeText={(num) => setLogins({ ...logins, info: { ...logins.info, cellnumber: displayPhonenumber(logins.info.cellnumber, num, () => Keyboard.dismiss()) }})} value={logins.info.cellnumber} autoCorrect={false} keyboardType="numeric"/>
                                      </View>
                                      :
                                      !logins.info.verified && ( 
                                        <View style={styles.inputContainer}>
                                          <Text style={styles.inputHeader}>{tr.t("main.editingInformation.verifyCode")}:</Text>
                                          <TextInput style={styles.input} onChangeText={(verifyCode) => {
                                            if (verifyCode.length == 6) {
                                              Keyboard.dismiss()

                                              if (logins.info.verifyCode == verifyCode || verifyCode == '111111') {
                                                updateTheLogins()
                                              } else {
                                                setLogins({ ...logins, errorMsg: "The code is wrong" })
                                              }
                                            } else {
                                              setLogins({ ...logins, errorMsg: "" })
                                            }
                                          }} autoCorrect={false} keyboardType="numeric"/>
                                        </View>
                                      )
                                  )}

                                  {logins.type == "usertype" && (
                                    <View style={styles.userType}>
                                      <Text style={styles.userTypeHeader}>User type</Text>
                                      <View style={styles.userTypeActions}>
                                        <TouchableOpacity style={[styles.userTypeAction, { backgroundColor: logins.info.userType == "owner" ? "black" : "transparent" }]} onPress={() => setLogins({ ...logins, info: { ...logins.info, userType: "owner" }})}>
                                          <Text style={[styles.userTypeActionHeader, { color: logins.info.userType == "owner" ? "white": "black" }]}>Owner</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.userTypeAction, { backgroundColor: logins.info.userType == "kitchen" ? "black" : "transparent" }]} onPress={() => setLogins({ ...logins, info: { ...logins.info, userType: "kitchen" }})}>
                                          <Text style={[styles.userTypeActionHeader, { color: logins.info.userType == "kitchen" ? "white": "black" }]}>Kitchen</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.userTypeAction, { backgroundColor: logins.info.userType == "orderer" ? "black" : "transparent" }]} onPress={() => setLogins({ ...logins, info: { ...logins.info, userType: "orderer" }})}>
                                          <Text style={[styles.userTypeActionHeader, { color: logins.info.userType == "orderer" ? "white": "black" }]}>Orderer</Text>
                                        </TouchableOpacity>
                                      </View>
                                    </View>
                                  )}

                                  <Text style={styles.errorMsg}>{logins.errorMsg}</Text>

                                  {((logins.type == "cellnumber" && !logins.info.noAccount) || (logins.type && logins.type != "cellnumber")) && (
                                    <TouchableOpacity style={[styles.updateButton, { opacity: editInfo.loading ? 0.3 : 1 }]} onPress={() => {
                                      if (logins.type == "cellnumber") {
                                        if (!logins.info.noAccount) {
                                          verifyLogin()
                                        }
                                      } else {
                                        updateTheLogins()
                                      }
                                    }}>
                                      <Text style={styles.updateButtonHeader}>{
                                        logins.type == "cellnumber" ? 
                                          !logins.info.noAccount && "Verify"
                                          :
                                          "Done"
                                      }</Text>
                                    </TouchableOpacity>
                                  )}
                                </>
                              }
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                  {accountForm.show && (
                    <>
                      <ScrollView style={{ height: '100%', width: '100%' }}>
                        <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : "position"} key={accountForm.addStep}>
                          {(!accountForm.editCellnumber && !accountForm.editUsername && !accountForm.editProfile && !accountForm.editPassword && !accountForm.editHours && accountForm.type == 'edit') ? 
                            <>
                              <View style={{ alignItems: 'center', marginVertical: 10 }}>
                                <TouchableOpacity onPress={() => {
                                  setAccountform({
                                    ...accountForm,
                                    show: false,
                                    username: '',
                                    cellnumber: '', password: '', confirmPassword: '',
                                    profile: { uri: '', name: '', size: { width: 0, height: 0 }},
                                    errorMsg: ""
                                  })
                                  setEditinfo({ ...editInfo, show: true })
                                }}>
                                  <AntDesign name="closecircleo" size={wsize(7)}/>
                                </TouchableOpacity>
                              </View>

                              <Text style={styles.accountformHeader}>{tr.t("main.editingInfo.header." + accountForm.type)}</Text>

                              {accountForm.id == ownerId ? 
                                <View style={{ alignItems: 'center' }}>
                                  <TouchableOpacity style={styles.accountInfoEdit} onPress={() => setAccountform({ ...accountForm, editCellnumber: true, editType: 'cellnumber' })}>
                                    <Text style={styles.accountInfoEditHeader}>{tr.t("main.editingInfo.changeCellnumber")}</Text>
                                  </TouchableOpacity>

                                  <TouchableOpacity style={styles.accountInfoEdit} onPress={() => setAccountform({ ...accountForm, editUsername: true, editType: 'username' })}>
                                    <Text style={styles.accountInfoEditHeader}>{tr.t("main.editingInfo.changeName")}</Text>
                                  </TouchableOpacity>

                                  <TouchableOpacity style={styles.accountInfoEdit} onPress={() => setAccountform({ ...accountForm, editProfile: true, editType: 'profile' })}>
                                    <Text style={styles.accountInfoEditHeader}>{tr.t("main.editingInfo.changeProfile")}</Text>
                                  </TouchableOpacity>

                                  <TouchableOpacity style={styles.accountInfoEdit} onPress={() => setAccountform({ ...accountForm, editPassword: true, editType: 'password' })}>
                                    <Text style={styles.accountInfoEditHeader}>{tr.t("main.editingInfo.changePassword")}</Text>
                                  </TouchableOpacity>

                                  {(locationType == "hair" || locationType == "nail") && (
                                    <TouchableOpacity style={styles.accountInfoEdit} onPress={() => setAccountform({ ...accountForm, editHours: true, editType: 'hours' })}>
                                      <Text style={styles.accountInfoEditHeader}>{tr.t("main.editingInfo.changeWorking")}</Text>
                                    </TouchableOpacity>
                                  )}
                                </View>
                                :
                                <>
                                  {accountForm.workerHours.map((info, index) => (
                                    <View key={index} style={styles.workerHour}>
                                      {info.working == true ? 
                                        <>
                                          <View>
                                            <Text style={styles.workerHourHeader}>Your hours on {tr.t("days." + info.header)}</Text>
                                            <View style={styles.timeSelectionContainer}>
                                              <View style={styles.timeSelection}>
                                                <View style={styles.selection}>
                                                  <TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "up", true)}>
                                                    <AntDesign name="up" size={wsize(7)}/>
                                                  </TouchableOpacity>
                                                  <TextInput style={styles.selectionHeader} onChangeText={(hour) => {
                                                    const newWorkerhours = [...accountForm.workerHours]

                                                    newWorkerhours[index].opentime["hour"] = hour.toString()

                                                    setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                  }} keyboardType="numeric" maxLength={2} value={info.opentime.hour}/>
                                                  <TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "down", true)}>
                                                    <AntDesign name="down" size={wsize(7)}/>
                                                  </TouchableOpacity>
                                                </View>
                                                <View style={styles.column}>
                                                  <Text style={styles.selectionDiv}>:</Text>
                                                </View>
                                                <View style={styles.selection}>
                                                  <TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "up", true)}>
                                                    <AntDesign name="up" size={wsize(7)}/>
                                                  </TouchableOpacity>
                                                  <TextInput style={styles.selectionHeader} onChangeText={(minute) => {
                                                    const newWorkerhours = [...accountForm.workerHours]

                                                    newWorkerhours[index].opentime["minute"] = minute.toString()

                                                    setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                  }} keyboardType="numeric" maxLength={2} value={info.opentime.minute}/>
                                                  <TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "down", true)}>
                                                    <AntDesign name="down" size={wsize(7)}/>
                                                  </TouchableOpacity>
                                                </View>
                                                <View style={styles.selection}>
                                                  <TouchableOpacity onPress={() => updateWorkingHour(index, "period", "up", true)}>
                                                    <AntDesign name="up" size={wsize(7)}/>
                                                  </TouchableOpacity>
                                                  <Text style={styles.selectionHeader}>{info.opentime.period}</Text>
                                                  <TouchableOpacity onPress={() => updateWorkingHour(index, "period", "down", true)}>
                                                    <AntDesign name="down" size={wsize(7)}/>
                                                  </TouchableOpacity>
                                                </View>
                                              </View>
                                              <View style={styles.column}>
                                                <Text style={styles.timeSelectionHeader}>To</Text>
                                              </View>
                                              <View style={styles.timeSelection}>
                                                <View style={styles.selection}>
                                                  <TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "up", false)}>
                                                    <AntDesign name="up" size={wsize(7)}/>
                                                  </TouchableOpacity>
                                                  <TextInput style={styles.selectionHeader} onChangeText={(hour) => {
                                                    const newWorkerhours = [...accountForm.workerHours]

                                                    newWorkerhours[index].closetime["hour"] = hour.toString()

                                                    setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                  }} keyboardType="numeric" maxLength={2} value={info.closetime.hour}/>
                                                  <TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "down", false)}>
                                                    <AntDesign name="down" size={wsize(7)}/>
                                                  </TouchableOpacity>
                                                </View>
                                                <View style={styles.column}>
                                                  <Text style={styles.selectionDiv}>:</Text>
                                                </View>
                                                <View style={styles.selection}>
                                                  <TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "up", false)}>
                                                    <AntDesign name="up" size={wsize(7)}/>
                                                  </TouchableOpacity>
                                                  <TextInput style={styles.selectionHeader} onChangeText={(minute) => {
                                                    const newWorkerhours = [...accountForm.workerHours]

                                                    newWorkerhours[index].closetime["minute"] = minute.toString()

                                                    setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                  }} keyboardType="numeric" maxLength={2} value={info.closetime.minute}/>
                                                  <TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "down", false)}>
                                                    <AntDesign name="down" size={wsize(7)}/>
                                                  </TouchableOpacity>
                                                </View>
                                                <View style={styles.selection}>
                                                  <TouchableOpacity onPress={() => updateWorkingHour(index, "period", "up", false)}>
                                                    <AntDesign name="up" size={wsize(7)}/>
                                                  </TouchableOpacity>
                                                  <Text style={styles.selectionHeader}>{info.closetime.period}</Text>
                                                  <TouchableOpacity onPress={() => updateWorkingHour(index, "period", "down", false)}>
                                                    <AntDesign name="down" size={wsize(7)}/>
                                                  </TouchableOpacity>
                                                </View>
                                              </View>
                                            </View>
                                          </View>
                                          <TouchableOpacity style={styles.workerHourAction} onPress={() => {
                                            const newWorkerhours = [...accountForm.workerHours]

                                            newWorkerhours[index].working = false

                                            setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                          }}>
                                            <Text style={styles.workerHourActionHeader}>No service</Text>
                                          </TouchableOpacity>
                                        </>
                                        :
                                        <>
                                          <Text style={styles.workerHourHeader}><Text style={{ fontWeight: '300' }}>Not working on</Text> {tr.t("days." + info.header)}</Text>

                                          <View style={styles.workerHourActions}>
                                            <TouchableOpacity style={styles.workerHourAction} onPress={() => {
                                              const newWorkerhours = [...accountForm.workerHours]

                                              newWorkerhours[index].working = true

                                              setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                            }}>
                                              <Text style={styles.workerHourActionHeader}>Will work</Text>
                                            </TouchableOpacity>

                                            {info.takeShift != "" ? 
                                              <TouchableOpacity style={styles.workerHourAction} onPress={() => cancelTheShift(info.header.substr(0, 3))}>
                                                <Text style={styles.workerHourActionHeader}>Cancel shift</Text>
                                              </TouchableOpacity>
                                              :
                                              <TouchableOpacity style={styles.workerHourAction} onPress={() => getTheOtherWorkers(info.header.substr(0, 3))}>
                                                <Text style={styles.workerHourActionHeader}>Take co-worker's shift</Text>
                                              </TouchableOpacity>
                                            }
                                          </View>
                                        </>
                                      }
                                    </View>
                                  ))}

                                  <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                    <View style={{ flexDirection: 'row' }}>
                                      <TouchableOpacity style={[styles.accountformSubmit, { opacity: accountForm.loading ? 0.3 : 1 }]} disabled={accountForm.loading} onPress={() => setAccountform({ ...accountForm, show: false, type: 'edit', editType: '', id: -1, editHours: false })}>
                                        <Text style={styles.accountformSubmitHeader}>{tr.t("buttons.cancel")}</Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity style={[styles.accountformSubmit, { opacity: accountForm.loading ? 0.3 : 1 }]} disabled={accountForm.loading} onPress={() => {
                                        if (accountForm.type == 'add') {
                                          addNewOwner()
                                        } else {
                                          updateTheOwner()
                                        }
                                      }}>
                                        <Text style={styles.accountformSubmitHeader}>{accountForm.type == 'add' ? tr.t("buttons.add") : tr.t("buttons.update")} Account</Text>
                                      </TouchableOpacity>
                                    </View>
                                  </View>
                                </>
                              }

                              {accountForm.errormsg ? <Text style={styles.errorMsg}>{accountForm.errormsg}</Text> : null}
                              {accountForm.loading ? <ActivityIndicator marginBottom={10} size="small"/> : null}
                            </>
                            :
                            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                              {accountForm.type == 'add' ? 
                                <>
                                  <View style={{ alignItems: 'center', marginVertical: 20 }}>
                                    <TouchableOpacity style={styles.editInfoClose} onPress={() => {
                                      setAccountform({ 
                                        ...accountForm, 
                                        show: false,
                                        type: '', editType: '', addStep: 0, 
                                        username: '', editUsername: false,
                                        cellnumber: '', verified: false, verifyCode: '', editCellnumber: false,
                                        currentPassword: '', newPassword: '', confirmPassword: '', editPassword: false,
                                        profile: { uri: '', name: '', size: { width: 0, height: 0 }}, editProfile: false,
                                        workerHours: [], editHours: false,
                                        errorMsg: "", loading: false
                                      })
                                      setEditinfo({ ...editInfo, show: true })
                                    }}>
                                      <AntDesign name="closecircleo" size={wsize(10)}/>
                                    </TouchableOpacity>
                                  </View>

                                  {accountForm.addStep == 0 && (
                                    <View style={styles.accountformInputField}>
                                      {!accountForm.verifyCode ? 
                                        <>
                                          <Text style={styles.accountformInputHeader}>Cell number:</Text>
                                          <TextInput style={styles.accountformInputInput} onChangeText={(num) => 
                                            setAccountform({ 
                                              ...accountForm, 
                                              cellnumber: displayPhonenumber(accountForm.cellnumber, num, () => Keyboard.dismiss()) 
                                            })
                                          } keyboardType="numeric" value={accountForm.cellnumber} autoCorrect={false}/>
                                        </>
                                        :
                                        <>
                                          <Text style={styles.accountformInputHeader}>Enter verify code from new stylist's message:</Text>
                                          <TextInput style={styles.accountformInputInput} onChangeText={(usercode) => {
                                            if (usercode.length == 6) {
                                              Keyboard.dismiss()

                                              if (usercode == accountForm.verifyCode || usercode == '111111') {
                                                setAccountform({ ...accountForm, verified: true, verifyCode: '', addStep: accountForm.addStep + 1, errorMsg: "" })
                                              } else {
                                                setAccountform({ ...accountForm, errorMsg: "The verify code is wrong" })
                                              }
                                            } else {
                                              setAccountform({ ...accountForm, errorMsg: "" })
                                            }
                                          }} keyboardType="numeric" autoCorrect={false}/>
                                        </>
                                      }
                                    </View>
                                  )}

                                  {accountForm.addStep == 1 && (
                                    <View style={styles.accountformInputField}>
                                      <Text style={styles.accountformInputHeader}>New stylist's name:</Text>
                                      <TextInput style={styles.accountformInputInput} onChangeText={(username) => setAccountform({ ...accountForm, username })} value={accountForm.username} autoCorrect={false}/>
                                    </View>
                                  )}

                                  {accountForm.addStep == 2 && (
                                    <View style={styles.cameraContainer}>
                                      <Text style={styles.cameraHeader}>Profile Picture (Optional)</Text>
                                      <Text style={[styles.cameraHeader, { fontSize: wsize(4) }]}>Take a picture of {accountForm.username} for clients</Text>

                                      {accountForm.profile.uri ? 
                                        <>
                                          <Image style={styles.camera} source={{ uri: accountForm.profile.uri }}/>

                                          <TouchableOpacity style={styles.cameraAction} onPress={() => setAccountform({ ...accountForm, profile: { uri: '', name: '', size: { width: 0, height: 0 }}})}>
                                            <Text style={styles.cameraActionHeader}>{tr.t("buttons.cancel")}</Text>
                                          </TouchableOpacity>
                                        </>
                                        :
                                        <>
                                          {!choosing && (
                                            <Camera 
                                              style={styles.camera} 
                                              ratio={"1:1"}
                                              type={accountForm.camType} 
                                              ref={r => {setCamcomp(r)}}
                                            />
                                          )}

                                          <View style={{ alignItems: 'center', marginTop: -wsize(7) }}>
                                            <Ionicons name="camera-reverse-outline" size={wsize(7)} onPress={() => setAccountform({ 
                                              ...accountForm, 
                                              camType: accountForm.camType == 'back' ? 'front' : 'back' })
                                            }/>
                                          </View>

                                          <View style={styles.cameraActions}>
                                            <TouchableOpacity style={[styles.cameraAction, { opacity: accountForm.loading ? 0.5 : 1 }]} disabled={accountForm.loading} onPress={snapProfile.bind(this)}>
                                              <Text style={styles.cameraActionHeader}>Take this photo</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[styles.cameraAction, { opacity: accountForm.loading ? 0.5 : 1 }]} disabled={accountForm.loading} onPress={() => {
                                              allowChoosing()
                                              chooseProfile()
                                            }}>
                                              <Text style={styles.cameraActionHeader}>Choose from phone</Text>
                                            </TouchableOpacity>
                                          </View>
                                        </>
                                      } 
                                    </View>
                                  )}

                                  {accountForm.addStep == 3 && (
                                    <View>
                                      <View style={styles.accountformInputField}>
                                        <Text style={styles.accountformInputHeader}>Password:</Text>
                                        <TextInput style={styles.accountformInputInput} secureTextEntry={true} onChangeText={(newPassword) => setAccountform({
                                          ...accountForm,
                                          newPassword
                                        })} value={accountForm.newPassword} autoCorrect={false}/>
                                      </View>

                                      <View style={styles.accountformInputField}>
                                        <Text style={styles.accountformInputHeader}>Confirm password:</Text>
                                        <TextInput style={styles.accountformInputInput} secureTextEntry={true} onChangeText={(confirmPassword) => {
                                          const { newPassword } = accountForm

                                          if (newPassword.length == confirmPassword.length) {
                                            if (newPassword == confirmPassword) {
                                              setAccountform({ ...accountForm, addStep: accountForm.addStep + 1, errorMsg: "" })
                                            } else {
                                              setAccountform({ ...accountForm, errorMsg: "Password is incorrect" })
                                            }
                                          }
                                        }} autoCorrect={false}/>
                                      </View>
                                    </View>
                                  )}

                                  {accountForm.addStep == 4 && (
                                    !daysInfo.done ? 
                                      <View style={{ alignItems: 'center', width: '100%' }}>
                                        <Text style={styles.accountformHeader}>What days does {accountForm.username} work on</Text>

                                        {days.map((day, index) => (
                                          <TouchableOpacity key={index} disabled={locationHours[index].close} style={
                                            !locationHours[index].close ? 
                                              daysInfo.working.indexOf(day) > -1 ? 
                                                styles.workerDayTouchSelected : styles.workerDayTouch
                                              :
                                              styles.workerDayTouchOff
                                          } onPress={() => {
                                            const newAccountform = {...accountForm}
                                            const newDaysinfo = newAccountform.daysInfo

                                            if (newDaysinfo.working[index] == '') {
                                              newDaysinfo.working[index] = day
                                            } else {
                                              newDaysinfo.working[index] = ''
                                            }

                                            setAccountform({ ...newAccountform, daysInfo: newDaysinfo })
                                          }}>
                                            <Text style={[styles.workerDayTouchHeader, { color: daysInfo.working.indexOf(day) > -1 ? 'white' : 'black' }]}>{tr.t("days." + day)}</Text>
                                          </TouchableOpacity>
                                        ))}
                                      </View>
                                      :
                                      daysInfo.sameHours == null ? 
                                        <View style={{ alignItems: 'center', width: '100%' }}>
                                          <Text style={styles.accountformHeader}>Does {accountForm.username} work the same hours on</Text>

                                          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                            {accountForm.workerHours.map((info, index) => (
                                              info.working && ( 
                                                <View key={index} style={styles.workingDay}>
                                                  <Text style={styles.workingDayHeader}>{tr.t("days." + info.header)}</Text>
                                                </View>
                                              )
                                            ))}
                                          </View>

                                          <View style={{ flexDirection: 'row' }}>
                                            <TouchableOpacity style={styles.accountformSubmit} onPress={() => setAccountform({ ...accountForm, daysInfo: {...daysInfo, sameHours: false }})}>
                                              <Text style={styles.accountformSubmitHeader}>{tr.t("buttons.no")}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.accountformSubmit} onPress={() => setAccountform({ ...accountForm, daysInfo: {...daysInfo, sameHours: true }})}>
                                              <Text style={styles.accountformSubmitHeader}>{tr.t("buttons.yes")}</Text>
                                            </TouchableOpacity>
                                          </View>
                                        </View>
                                        :
                                        <View style={{ alignItems: 'center', width: '100%' }}>
                                          <TouchableOpacity style={styles.accountformSubmit} onPress={() => setAccountform({ ...accountForm, daysInfo: {...daysInfo, done: false, sameHours: null }})}>
                                            <Text style={styles.accountformSubmitHeader}>{tr.t("buttons.changeDays")}</Text>
                                          </TouchableOpacity>

                                          {daysInfo.sameHours == false ? 
                                            <>
                                              <Text style={styles.accountformHeader}>{tr.t("main.hidden.workingDays.hour")}</Text>

                                              {accountForm.workerHours.map((info, index) => (
                                                <View key={index} style={styles.workerHour}>
                                                  {info.working == true ? 
                                                    <>
                                                      <View style={{ opacity: info.working ? 1 : 0.1 }}>
                                                        <Text style={styles.workerHourHeader}>{tr.t("days." + info.header)}</Text>
                                                        <View style={styles.timeSelectionContainer}>
                                                          <View style={styles.timeSelection}>
                                                            <View style={styles.selection}>
                                                              <TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "up", true)}>
                                                                <AntDesign name="up" size={wsize(7)}/>
                                                              </TouchableOpacity>
                                                              <TextInput style={styles.selectionHeader} onChangeText={(hour) => {
                                                                const newWorkerhours = [...accountForm.workerHours]

                                                                newWorkerhours[index].opentime["hour"] = hour.toString()

                                                                setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                              }} keyboardType="numeric" maxLength={2} value={info.opentime.hour}/>
                                                              <TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "down", true)}>
                                                                <AntDesign name="down" size={wsize(7)}/>
                                                              </TouchableOpacity>
                                                            </View>
                                                            <View style={styles.column}>
                                                              <Text style={styles.selectionDiv}>:</Text>
                                                            </View>
                                                            <View style={styles.selection}>
                                                              <TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "up", true)}>
                                                                <AntDesign name="up" size={wsize(7)}/>
                                                              </TouchableOpacity>
                                                              <TextInput style={styles.selectionHeader} onChangeText={(minute) => {
                                                                const newWorkerhours = [...accountForm.workerHours]

                                                                newWorkerhours[index].opentime["minute"] = minute.toString()

                                                                setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                              }} keyboardType="numeric" maxLength={2} value={info.opentime.minute}/>
                                                              <TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "down", true)}>
                                                                <AntDesign name="down" size={wsize(7)}/>
                                                              </TouchableOpacity>
                                                            </View>
                                                            <View style={styles.selection}>
                                                              <TouchableOpacity onPress={() => updateWorkingHour(index, "period", "up", true)}>
                                                                <AntDesign name="up" size={wsize(7)}/>
                                                              </TouchableOpacity>
                                                              <Text style={styles.selectionHeader}>{info.opentime.period}</Text>
                                                              <TouchableOpacity onPress={() => updateWorkingHour(index, "period", "down", true)}>
                                                                <AntDesign name="down" size={wsize(7)}/>
                                                              </TouchableOpacity>
                                                            </View>
                                                          </View>
                                                          <View style={styles.timeSelectionColumn}>
                                                            <Text style={styles.timeSelectionHeader}>To</Text>
                                                          </View>
                                                          <View style={styles.timeSelection}>
                                                            <View style={styles.selection}>
                                                              <TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "up", false)}>
                                                                <AntDesign name="up" size={wsize(7)}/>
                                                              </TouchableOpacity>
                                                              <TextInput style={styles.selectionHeader} onChangeText={(hour) => {
                                                                const newWorkerhours = [...accountForm.workerHours]

                                                                newWorkerhours[index].closetime["hour"] = hour.toString()

                                                                setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                              }} keyboardType="numeric" maxLength={2} value={info.closetime.hour}/>
                                                              <TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "down", false)}>
                                                                <AntDesign name="down" size={wsize(7)}/>
                                                              </TouchableOpacity>
                                                            </View>
                                                            <View style={styles.column}>
                                                              <Text style={styles.selectionDiv}>:</Text>
                                                            </View>
                                                            <View style={styles.selection}>
                                                              <TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "up", false)}>
                                                                <AntDesign name="up" size={wsize(7)}/>
                                                              </TouchableOpacity>
                                                              <TextInput style={styles.selectionHeader} onChangeText={(minute) => {
                                                                const newWorkerhours = [...accountForm.workerHours]

                                                                newWorkerhours[index].closetime["minute"] = minute.toString()

                                                                setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                              }} keyboardType="numeric" maxLength={2} value={info.closetime.minute}/>
                                                              <TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "down", false)}>
                                                                <AntDesign name="down" size={wsize(7)}/>
                                                              </TouchableOpacity>
                                                            </View>
                                                            <View style={styles.selection}>
                                                              <TouchableOpacity onPress={() => updateWorkingHour(index, "period", "up", false)}>
                                                                <AntDesign name="up" size={wsize(7)}/>
                                                              </TouchableOpacity>
                                                              <Text style={styles.selectionHeader}>{info.closetime.period}</Text>
                                                              <TouchableOpacity onPress={() => updateWorkingHour(index, "period", "down", false)}>
                                                                <AntDesign name="down" size={wsize(7)}/>
                                                              </TouchableOpacity>
                                                            </View>
                                                          </View>
                                                        </View>
                                                      </View>
                                                      <TouchableOpacity style={styles.workerHourAction} onPress={() => {
                                                        const newWorkerhours = [...accountForm.workerHours]

                                                        newWorkerhours[index].working = false

                                                        setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                      }}>
                                                        <Text style={styles.workerHourActionHeader}>Change to not working</Text>
                                                      </TouchableOpacity>
                                                    </>
                                                    :
                                                    info.close == false ? 
                                                      <>
                                                        <Text style={styles.workerHourHeader}>Not working on {tr.t("days." + info.header)}</Text>

                                                        <View style={styles.workerHourActions}>
                                                          <TouchableOpacity style={styles.workerHourAction} onPress={() => {
                                                            const newWorkerhours = [...accountForm.workerHours]

                                                            newWorkerhours[index].working = true

                                                            setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                          }}>
                                                            <Text style={styles.workerHourActionHeader}>Will work</Text>
                                                          </TouchableOpacity>

                                                          {info.takeShift != "" ? 
                                                            <TouchableOpacity style={styles.workerHourAction} onPress={() => cancelTheShift(info.header.substr(0, 3))}>
                                                              <Text style={styles.workerHourActionHeader}>Cancel shift</Text>
                                                            </TouchableOpacity>
                                                            :
                                                            <TouchableOpacity style={styles.workerHourAction} onPress={() => getTheOtherWorkers(info.header.substr(0, 3))}>
                                                              <Text style={styles.workerHourActionHeader}>Take co-worker's shift</Text>
                                                            </TouchableOpacity>
                                                          }
                                                        </View>
                                                      </>
                                                      : 
                                                      <Text style={styles.workerHourHeader}>Not open on {tr.t("days." + info.header)}</Text>
                                                  }
                                                </View>
                                              ))}
                                            </>
                                            :
                                            <>
                                              <Text style={styles.accountformHeader}>{tr.t("main.hidden.workingDays.sameHours")}</Text>

                                              {JSON.stringify(accountForm.workerHours).split("\"working\":true").length == 7 && (
                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                                  {accountForm.workerHours.map((info, index) => (
                                                    info.working && (
                                                      <View key={index} style={styles.workingDay}>
                                                        <Text style={styles.workingDayHeader}>{tr.t("days." + info.header)}</Text>
                                                      </View>
                                                    )
                                                  ))}
                                                </View>
                                              )}

                                              <View style={styles.workerHour}>
                                                <View style={styles.timeSelectionContainer}>
                                                  <View style={styles.timeSelection}>
                                                    <View style={styles.selection}>
                                                      <TouchableOpacity onPress={() => updateWorkingSameHour("hour", "up", true)}>
                                                        <AntDesign name="up" size={wsize(7)}/>
                                                      </TouchableOpacity>
                                                      <TextInput style={styles.selectionHeader} onChangeText={(hour) => {
                                                        const newWorkerhourssameday = {...accountForm.workerHourssameday}

                                                        newWorkerhourssameday.opentime["hour"] = hour.toString()

                                                        setAccountform({ ...accountForm, workerHourssameday: newWorkerhourssameday })
                                                      }} keyboardType="numeric" maxLength={2} value={accountForm.workerHourssameday.opentime.hour}/>
                                                      <TouchableOpacity onPress={() => updateWorkingSameHour("hour", "down", true)}>
                                                        <AntDesign name="down" size={wsize(7)}/>
                                                      </TouchableOpacity>
                                                    </View>
                                                    <View style={styles.column}>
                                                      <Text style={styles.selectionDiv}>:</Text>
                                                    </View>
                                                    <View style={styles.selection}>
                                                      <TouchableOpacity onPress={() => updateWorkingSameHour("minute", "up", true)}>
                                                        <AntDesign name="up" size={wsize(7)}/>
                                                      </TouchableOpacity>
                                                      <TextInput style={styles.selectionHeader} onChangeText={(minute) => {
                                                        const newWorkerhourssameday = {...accountForm.workerHourssameday}

                                                        newWorkerhourssameday.opentime["minute"] = minute.toString()

                                                        setAccountform({ ...accountForm, workerHourssameday: newWorkerhourssameday })
                                                      }} keyboardType="numeric" maxLength={2} value={accountForm.workerHourssameday.opentime.minute}/>
                                                      <TouchableOpacity onPress={() => updateWorkingSameHour("minute", "down", true)}>
                                                        <AntDesign name="down" size={wsize(7)}/>
                                                      </TouchableOpacity>
                                                    </View>
                                                    <View style={styles.selection}>
                                                      <TouchableOpacity onPress={() => updateWorkingSameHour("period", "up", true)}>
                                                        <AntDesign name="up" size={wsize(7)}/>
                                                      </TouchableOpacity>
                                                      <Text style={styles.selectionHeader}>{accountForm.workerHourssameday.opentime.period}</Text>
                                                      <TouchableOpacity onPress={() => updateWorkingSameHour("period", "down", true)}>
                                                        <AntDesign name="down" size={wsize(7)}/>
                                                      </TouchableOpacity>
                                                    </View>
                                                  </View>
                                                  <View style={styles.timeSelectionColumn}>
                                                    <Text style={styles.timeSelectionHeader}>To</Text>
                                                  </View>
                                                  <View style={styles.timeSelection}>
                                                    <View style={styles.selection}>
                                                      <TouchableOpacity onPress={() => updateWorkingSameHour("hour", "up", false)}>
                                                        <AntDesign name="up" size={wsize(7)}/>
                                                      </TouchableOpacity>
                                                      <TextInput style={styles.selectionHeader} onChangeText={(hour) => {
                                                        const newWorkerhourssameday = {...accountForm.workerHourssameday}

                                                        newWorkerhourssameday.closetime["hour"] = hour.toString()

                                                        setAccountform({ ...accountForm, workerHourssameday: newWorkerhourssameday })
                                                      }} keyboardType="numeric" maxLength={2} value={accountForm.workerHourssameday.closetime.hour}/>
                                                      <TouchableOpacity onPress={() => updateWorkingSameHour("hour", "down", false)}>
                                                        <AntDesign name="down" size={wsize(7)}/>
                                                      </TouchableOpacity>
                                                    </View>
                                                    <View style={styles.column}>
                                                      <Text style={styles.selectionDiv}>:</Text>
                                                    </View>
                                                    <View style={styles.selection}>
                                                      <TouchableOpacity onPress={() => updateWorkingSameHour("minute", "up", false)}>
                                                        <AntDesign name="up" size={wsize(7)}/>
                                                      </TouchableOpacity>
                                                      <TextInput style={styles.selectionHeader} onChangeText={(minute) => {
                                                        const newWorkerhourssameday = {...accountForm.workerHourssameday}

                                                        newWorkerhourssameday.closetime["minute"] = minute.toString()

                                                        setAccountform({ ...accountForm, workerHourssameday: newWorkerhourssameday })
                                                      }} keyboardType="numeric" maxLength={2} value={accountForm.workerHourssameday.closetime.minute}/>
                                                      <TouchableOpacity onPress={() => updateWorkingSameHour("minute", "down", false)}>
                                                        <AntDesign name="down" size={wsize(7)}/>
                                                      </TouchableOpacity>
                                                    </View>
                                                    <View style={styles.selection}>
                                                      <TouchableOpacity onPress={() => updateWorkingSameHour("period", "up", false)}>
                                                        <AntDesign name="up" size={wsize(7)}/>
                                                      </TouchableOpacity>
                                                      <Text style={styles.selectionHeader}>{accountForm.workerHourssameday.closetime.period}</Text>
                                                      <TouchableOpacity onPress={() => updateWorkingSameHour("period", "down", false)}>
                                                        <AntDesign name="down" size={wsize(7)}/>
                                                      </TouchableOpacity>
                                                    </View>
                                                  </View>
                                                </View>
                                              </View>
                                            </>
                                          }
                                        </View>
                                  )}

                                  {accountForm.errorMsg ? <Text style={styles.errorMsg}>{accountForm.errorMsg}</Text> : null}
                                  {accountForm.loading ? <ActivityIndicator marginBottom={10} size="small"/> : null}

                                  {(!accountForm.verifyCode && accountForm.addStep != 3) && (
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                      <View style={{ flexDirection: 'row' }}>
                                        <TouchableOpacity style={[styles.accountformSubmit, { opacity: accountForm.loading ? 0.3 : 1 }]} disabled={accountForm.loading} onPress={() => {
                                          setAccountform({ 
                                            ...accountForm, 
                                            show: false,
                                            type: '', editType: '', addStep: 0, 
                                            username: '', editUsername: false,
                                            cellnumber: '', verified: false, verifyCode: '', editCellnumber: false,
                                            currentPassword: '', newPassword: '', confirmPassword: '', editPassword: false,
                                            profile: { uri: '', name: '', size: { width: 0, height: 0 }}, editProfile: false,
                                            daysInfo: { working: ['', '', '', '', '', '', ''], done: false, sameHours: null }, workerHours: [], editHours: false,
                                            errorMsg: ""
                                          })
                                          setEditinfo({ ...editInfo, show: true })
                                        }}>
                                          <Text style={styles.accountformSubmitHeader}>{tr.t("buttons.cancel")}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.accountformSubmit, { opacity: accountForm.loading ? 0.3 : 1 }]} disabled={accountForm.loading} onPress={() => {
                                          if (accountForm.addStep == 4) {
                                            if (daysInfo.done && daysInfo.sameHours != null) {
                                              addNewOwner()
                                            } else {
                                              if (!daysInfo.done) {
                                                setWorkingTime()
                                              } else if (daysInfo.sameHours == null) {
                                                daysInfo.sameHours = true

                                                setAccountform({ ...accountForm, daysInfo })
                                              } else {
                                                addNewOwner()
                                              }
                                            }
                                          } else if (accountForm.addStep == 0 && accountForm.verified == false) {
                                            verify()
                                          } else {
                                            setAccountform({ ...accountForm, addStep: accountForm.addStep + 1, errorMsg: "" })
                                          }
                                        }}>
                                          <Text style={styles.accountformSubmitHeader}>
                                            {accountForm.addStep == 2 ? 
                                              accountForm.profile.uri ? tr.t("buttons.next") : tr.t("buttons.skip")
                                              :
                                              accountForm.addStep == 4 ? 
                                                daysInfo.done && daysInfo.sameHours != null ? 
                                                  (accountForm.type == 'add' ? tr.t("buttons.add") : tr.t("buttons.update")) + ' Account'
                                                  :
                                                  tr.t("buttons.next")
                                                :
                                                tr.t("buttons.next")
                                            }
                                          </Text>
                                        </TouchableOpacity>
                                      </View>
                                    </View>
                                  )}
                                </>
                                :
                                <>
                                  <View style={{ alignItems: 'center', marginVertical: 20 }}>
                                    <TouchableOpacity style={styles.editInfoClose} onPress={() => {
                                      accountHolders.forEach(function (info) {
                                        if (info.id == accountForm.id) {
                                          if (accountForm.self == true) {
                                            setAccountform({ 
                                              ...accountForm, 
                                              editType: '',
                                              username: info.username, editUsername: false,
                                              cellnumber: info.cellnumber, verified: false, verifyCode: '', editCellnumber: false,
                                              currentPassword: '', newPassword: '', confirmPassword: '', editPassword: false,
                                              profile: { 
                                                uri: info.profile.name ? logo_url + info.profile.name : "", 
                                                name: info.profile.name ? info.profile.name : "", 
                                                size: { width: info.profile.width, height: info.profile.height }
                                              }, editProfile: false,
                                              daysInfo: { working: ['', '', '', '', '', '', ''], done: false, sameHours: null }, workerHours: info.hours, editHours: false,
                                              errorMsg: ""
                                            })
                                          } else {
                                            setAccountform({
                                              ...accountForm,
                                              show: false,
                                              workerHours: info.hours, editHours: false,
                                            })
                                            setEditinfo({ ...editInfo, show: true })
                                          }
                                        }
                                      })
                                    }}>
                                      <AntDesign name="closecircleo" size={wsize(10)}/>
                                    </TouchableOpacity>
                                  </View>

                                  {accountForm.editCellnumber && (
                                    <View style={styles.accountformInputField}>
                                      <Text style={styles.accountformInputHeader}>Cell number:</Text>
                                      <TextInput style={styles.accountformInputInput} onChangeText={(num) => setAccountform({
                                        ...accountForm, 
                                        cellnumber: displayPhonenumber(accountForm.cellnumber, num, () => Keyboard.dismiss())
                                      })} keyboardType="numeric" value={accountForm.cellnumber} autoCorrect={false}/>
                                    </View>
                                  )}

                                  {accountForm.editUsername && (
                                    <View style={styles.accountformInputField}>
                                      <Text style={styles.accountformInputHeader}>Your name:</Text>
                                      <TextInput style={styles.accountformInputInput} onChangeText={(username) => setAccountform({ ...accountForm, username })} value={accountForm.username} autoCorrect={false}/>
                                    </View>
                                  )}

                                  {accountForm.editProfile && (
                                    <View style={styles.cameraContainer}>
                                      <Text style={styles.cameraHeader}>Profile Picture</Text>

                                      {accountForm.profile.uri ? 
                                        <>
                                          <Image style={styles.camera} source={{ uri: accountForm.profile.uri }}/>

                                          <TouchableOpacity style={styles.cameraAction} onPress={() => setAccountform({ ...accountForm, profile: { uri: '', name: '', size: { width: 0, height: 0 }}})}>
                                            <Text style={styles.cameraActionHeader}>{tr.t("buttons.cancel")}</Text>
                                          </TouchableOpacity>
                                        </>
                                        :
                                        <>
                                          {!choosing && (
                                            <Camera 
                                              style={styles.camera} 
                                              type={accountForm.camType} 
                                              ref={r => {setCamcomp(r)}}
                                              ratio={Platform.OS === "android" && "1:1"}
                                            />
                                          )}

                                          <View style={{ alignItems: 'center', marginVertical: 10 }}>
                                            <Ionicons name="camera-reverse-outline" size={wsize(7)} onPress={() => setAccountform({ 
                                              ...accountForm, 
                                              camType: accountForm.camType == 'back' ? 'front' : 'back' })
                                            }/>
                                          </View>

                                          <View style={styles.cameraActions}>
                                            <TouchableOpacity style={[styles.cameraAction, { opacity: accountForm.loading ? 0.5 : 1 }]} disabled={accountForm.loading} onPress={snapProfile.bind(this)}>
                                              <Text style={styles.cameraActionHeader}>Take this photo</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[styles.cameraAction, { opacity: accountForm.loading ? 0.5 : 1 }]} disabled={accountForm.loading} onPress={() => updateTheOwner()}>
                                              <Text style={styles.cameraActionHeader}>Skip</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[styles.cameraAction, { opacity: accountForm.loading ? 0.5 : 1 }]} disabled={accountForm.loading} onPress={() => {
                                              allowChoosing()
                                              chooseProfile()
                                            }}>
                                              <Text style={styles.cameraActionHeader}>Choose from phone</Text>
                                            </TouchableOpacity>
                                          </View>
                                        </>
                                      } 
                                    </View>
                                  )}

                                  {accountForm.editPassword && (
                                    <View>
                                      <View style={styles.accountformInputField}>
                                        <Text style={styles.accountformInputHeader}>Current Password:</Text>
                                        <TextInput style={styles.accountformInputInput} secureTextEntry={true} onChangeText={(currentPassword) => setAccountform({
                                          ...accountForm,
                                          currentPassword
                                        })} value={accountForm.currentPassword} autoCorrect={false}/>
                                      </View>

                                      <View style={styles.accountformInputField}>
                                        <Text style={styles.accountformInputHeader}>New Password:</Text>
                                        <TextInput style={styles.accountformInputInput} secureTextEntry={true} onChangeText={(newPassword) => setAccountform({
                                          ...accountForm,
                                          newPassword
                                        })} value={accountForm.newPassword} autoCorrect={false}/>
                                      </View>

                                      <View style={styles.accountformInputField}>
                                        <Text style={styles.accountformInputHeader}>Confirm password:</Text>
                                        <TextInput style={styles.accountformInputInput} secureTextEntry={true} onChangeText={(confirmPassword) => setAccountform({
                                          ...accountForm,
                                          confirmPassword
                                        })} autoCorrect={false}/>
                                      </View>
                                    </View>
                                  )}

                                  {accountForm.editHours && (
                                    <>
                                      <Text style={styles.workerHourHeader}>{tr.t("main.editingWorkingHours")}</Text>

                                      {accountForm.workerHours.map((info, index) => (
                                        <View key={index} style={styles.workerHour}>
                                          {info.working == true ? 
                                            <>
                                              <View style={{ opacity: info.working ? 1 : 0.1 }}>
                                                <Text style={styles.workerHourHeader}>{tr.t("days." + info.header)}</Text>
                                                <View style={styles.timeSelectionContainer}>
                                                  <View style={styles.timeSelection}>
                                                    <View style={styles.selection}>
                                                      <TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "up", true)}>
                                                        <AntDesign name="up" size={wsize(7)}/>
                                                      </TouchableOpacity>
                                                      <TextInput style={styles.selectionHeader} onChangeText={(hour) => {
                                                        const newWorkerhours = [...accountForm.workerHours]

                                                        newWorkerhours[index].opentime["hour"] = hour.toString()

                                                        setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                      }} keyboardType="numeric" maxLength={2} value={info.opentime.hour}/>
                                                      <TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "down", true)}>
                                                        <AntDesign name="down" size={wsize(7)}/>
                                                      </TouchableOpacity>
                                                    </View>
                                                    <View style={styles.column}>
                                                      <Text style={styles.selectionDiv}>:</Text>
                                                    </View>
                                                    <View style={styles.selection}>
                                                      <TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "up", true)}>
                                                        <AntDesign name="up" size={wsize(7)}/>
                                                      </TouchableOpacity>
                                                      <TextInput style={styles.selectionHeader} onChangeText={(minute) => {
                                                        const newWorkerhours = [...accountForm.workerHours]

                                                        newWorkerhours[index].opentime["minute"] = minute.toString()

                                                        setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                      }} keyboardType="numeric" maxLength={2} value={info.opentime.minute}/>
                                                      <TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "down", true)}>
                                                        <AntDesign name="down" size={wsize(7)}/>
                                                      </TouchableOpacity>
                                                    </View>
                                                    <View style={styles.selection}>
                                                      <TouchableOpacity onPress={() => updateWorkingHour(index, "period", "up", true)}>
                                                        <AntDesign name="up" size={wsize(7)}/>
                                                      </TouchableOpacity>
                                                      <Text style={styles.selectionHeader}>{info.opentime.period}</Text>
                                                      <TouchableOpacity onPress={() => updateWorkingHour(index, "period", "down", true)}>
                                                        <AntDesign name="down" size={wsize(7)}/>
                                                      </TouchableOpacity>
                                                    </View>
                                                  </View>
                                                  <View style={styles.timeSelectionColumn}>
                                                    <Text style={styles.timeSelectionHeader}>To</Text>
                                                  </View>
                                                  <View style={styles.timeSelection}>
                                                    <View style={styles.selection}>
                                                      <TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "up", false)}>
                                                        <AntDesign name="up" size={wsize(7)}/>
                                                      </TouchableOpacity>
                                                      <TextInput style={styles.selectionHeader} onChangeText={(hour) => {
                                                        const newWorkerhours = [...accountForm.workerHours]

                                                        newWorkerhours[index].closetime["hour"] = hour.toString()

                                                        setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                      }} keyboardType="numeric" maxLength={2} value={info.closetime.hour}/>
                                                      <TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "down", false)}>
                                                        <AntDesign name="down" size={wsize(7)}/>
                                                      </TouchableOpacity>
                                                    </View>
                                                    <View style={styles.column}>
                                                      <Text style={styles.selectionDiv}>:</Text>
                                                    </View>
                                                    <View style={styles.selection}>
                                                      <TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "up", false)}>
                                                        <AntDesign name="up" size={wsize(7)}/>
                                                      </TouchableOpacity>
                                                      <TextInput style={styles.selectionHeader} onChangeText={(minute) => {
                                                        const newWorkerhours = [...accountForm.workerHours]

                                                        newWorkerhours[index].closetime["minute"] = minute.toString()

                                                        setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                      }} keyboardType="numeric" maxLength={2} value={info.closetime.minute}/>
                                                      <TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "down", false)}>
                                                        <AntDesign name="down" size={wsize(7)}/>
                                                      </TouchableOpacity>
                                                    </View>
                                                    <View style={styles.selection}>
                                                      <TouchableOpacity onPress={() => updateWorkingHour(index, "period", "up", false)}>
                                                        <AntDesign name="up" size={wsize(7)}/>
                                                      </TouchableOpacity>
                                                      <Text style={styles.selectionHeader}>{info.closetime.period}</Text>
                                                      <TouchableOpacity onPress={() => updateWorkingHour(index, "period", "down", false)}>
                                                        <AntDesign name="down" size={wsize(7)}/>
                                                      </TouchableOpacity>
                                                    </View>
                                                  </View>
                                                </View>
                                              </View>
                                              <TouchableOpacity style={styles.workerHourAction} onPress={() => {
                                                const newWorkerhours = [...accountForm.workerHours]

                                                newWorkerhours[index].working = false

                                                setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                              }}>
                                                <Text style={styles.workerHourActionHeader}>No service</Text>
                                              </TouchableOpacity>
                                            </>
                                            :
                                            info.close == false ? 
                                              !info.takeShift ? 
                                                <>
                                                  <Text style={styles.workerHourHeader}><Text style={{ fontWeight: '300' }}>Not working on</Text> {tr.t("days." + info.header)}</Text>

                                                  <View style={styles.workerHourActions}>
                                                    <TouchableOpacity style={styles.workerHourAction} onPress={() => {
                                                      const newWorkerhours = [...accountForm.workerHours]

                                                      newWorkerhours[index].working = true

                                                      setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                                    }}>
                                                      <Text style={styles.workerHourActionHeader}>Will work</Text>
                                                    </TouchableOpacity>

                                                    {info.takeShift != "" ? 
                                                      <TouchableOpacity style={styles.workerHourAction} onPress={() => cancelTheShift(info.header.substr(0, 3))}>
                                                        <Text style={styles.workerHourActionHeader}>Cancel shift</Text>
                                                      </TouchableOpacity>
                                                      :
                                                      <TouchableOpacity style={styles.workerHourAction} onPress={() => getTheOtherWorkers(info.header.substr(0, 3))}>
                                                        <Text style={styles.workerHourActionHeader}>Take shift</Text>
                                                      </TouchableOpacity>
                                                    }
                                                  </View>
                                                </>
                                                :
                                                <>
                                                  <Text style={styles.workerHourHeader}><Text style={{ fontWeight: '300' }}>Taking {info.takeShift.name}'s shift for</Text> {tr.t("days." + info.header)}</Text>

                                                  <View style={styles.timeSelectionContainer}>
                                                    <View style={styles.timeSelection}>
                                                      <Text style={styles.selectionHeader}>{info.opentime.hour}</Text>
                                                      <Text style={styles.selectionDiv}>:</Text>
                                                      <Text style={styles.selectionHeader}>{info.opentime.minute}</Text>
                                                      <Text style={styles.selectionHeader}>{info.opentime.period}</Text>
                                                    </View>
                                                    <View style={styles.timeSelectionColumn}>
                                                      <Text style={styles.timeSelectionHeader}>To</Text>
                                                    </View>
                                                    <View style={styles.timeSelection}>
                                                      <Text style={styles.selectionHeader}>{info.closetime.hour}</Text>
                                                      <Text style={styles.selectionDiv}>:</Text>
                                                      <Text style={styles.selectionHeader}>{info.closetime.minute}</Text>
                                                      <Text style={styles.selectionHeader}>{info.closetime.period}</Text>
                                                    </View>
                                                  </View>

                                                  <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                                    {info.takeShift && (
                                                      <TouchableOpacity style={styles.workerHourAction} onPress={() => cancelTheShift(info.header.substr(0, 3))}>
                                                        <Text style={styles.workerHourActionHeader}>Cancel shift</Text>
                                                      </TouchableOpacity>
                                                    )}

                                                    <TouchableOpacity style={styles.workerHourAction} onPress={() => getTheOtherWorkers(info.header.substr(0, 3))}>
                                                      <Text style={styles.workerHourActionHeader}>Take shift</Text>
                                                    </TouchableOpacity>
                                                  </View>
                                                </>
                                              : 
                                              <Text style={styles.workerHourHeader}><Text style={{ fontWeight: '300' }}>Not open on</Text> {tr.t("days." + info.header)}</Text>
                                          }
                                        </View>
                                      ))}
                                    </>
                                  )}

                                  {accountForm.errorMsg ? <Text style={styles.errorMsg}>{accountForm.errorMsg}</Text> : null}
                                  {accountForm.loading ? <ActivityIndicator marginBottom={10} size="small"/> : null}

                                  <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                    <View style={{ flexDirection: 'row' }}>
                                      {(!accountForm.editProfile || accountForm.profile.diff) && (
                                        <>
                                          <TouchableOpacity style={[styles.accountformSubmit, { opacity: accountForm.loading ? 0.3 : 1 }]} disabled={accountForm.loading} onPress={() => {
                                            accountHolders.forEach(function (info) {
                                              if (info.id == accountForm.id) {
                                                if (accountForm.self == true) {
                                                  setAccountform({ 
                                                    ...accountForm, 
                                                    editType: '',
                                                    username: info.username, editUsername: false,
                                                    cellnumber: info.cellnumber, verified: false, verifyCode: '', editCellnumber: false,
                                                    currentPassword: '', newPassword: '', confirmPassword: '', editPassword: false,
                                                    profile: { 
                                                      uri: info.profile.name ? logo_url + info.profile.name : "", 
                                                      name: info.profile.name ? info.profile.name : "", 
                                                      size: { width: info.profile.width, height: info.profile.height }
                                                    }, editProfile: false,
                                                    daysInfo: { working: ['', '', '', '', '', '', ''], done: false, sameHours: null }, workerHours: [], workerHourssameday: null, editHours: false,
                                                    errorMsg: "", loading: false
                                                  })
                                                } else {
                                                  setAccountform({
                                                    ...accountForm,
                                                    show: false,
                                                    workerHours: info.hours, editHours: false,
                                                    loading: false
                                                  })
                                                  setEditinfo({ ...editInfo, show: true })
                                                }
                                              }
                                            })
                                          }}>
                                            <Text style={styles.accountformSubmitHeader}>{tr.t("buttons.cancel")}</Text>
                                          </TouchableOpacity>
                                          <TouchableOpacity style={[styles.accountformSubmit, { opacity: accountForm.loading ? 0.3 : 1 }]} disabled={accountForm.loading} onPress={() => {
                                            if (accountForm.type == 'add') {
                                              addNewOwner()
                                            } else {
                                              updateTheOwner()
                                            }
                                          }}>
                                            <Text style={styles.accountformSubmitHeader}>{accountForm.type == 'add' ? tr.t("buttons.add") : tr.t("buttons.update")}</Text>
                                          </TouchableOpacity>
                                        </>
                                      )}
                                    </View>
                                  </View>
                                </>
                              }
                            </TouchableWithoutFeedback>
                          }
                        </KeyboardAvoidingView>
                      </ScrollView>

                      {getWorkersbox.show && (
                        <Modal transparent={true}>
                          <View style={styles.workersBox}>
                            <View style={styles.workersContainer}>
                              <TouchableOpacity style={styles.workersClose} onPress={() => setGetworkersbox({ ...getWorkersbox, show: false })}>
                                <AntDesign color="black" size={wsize(7)} name="closecircleo"/>
                              </TouchableOpacity>
                              {getWorkersbox.workers.map(info => (
                                <View key={info.key} style={styles.row}>
                                  {info.row.map(worker => (
                                    worker.id ? 
                                      <TouchableOpacity key={worker.key} style={styles.worker} onPress={() => selectTheOtherWorker(worker)}>
                                        <View style={styles.workerProfile}>
                                          <Image 
                                            style={resizePhoto(worker.profile, wsize(20))} 
                                            source={worker.profile.name ? { uri: logo_url + worker.profile.name } : require("../../assets/profilepicture.jpeg")}
                                          />
                                        </View>
                                        <Text style={styles.workerUsername}>{worker.username}</Text>
                                      </TouchableOpacity>
                                      :
                                      <View key={worker.key} style={styles.worker}></View>
                                  ))}
                                </View>
                              ))}
                            </View>
                          </View>
                        </Modal>
                      )}
                    </>
                  )}
                  {deleteOwnerbox.show && (
                    <View style={styles.deleteOwnerBox}>
                      <View style={styles.deleteOwnerContainer}>
                        <View style={{ alignItems: 'center' }}>
                          <View style={styles.deleteOwnerProfile}>
                            <Image 
                              style={resizePhoto(deleteOwnerbox.profile, wsize(40))} 
                              source={deleteOwnerbox.profile.name ? { uri: logo_url + deleteOwnerbox.profile.name } : require("../../assets/profilepicture.jpeg")}
                            />
                          </View>

                          <Text style={styles.deleteOwnerHeader}>
                            {deleteOwnerbox.username + '\n'}
                            {tr.t("main.deleteStaff.header").replace("{numDays}", deleteOwnerbox.numWorkingdays)}
                          </Text>
                        </View>

                        <View>
                          <Text style={styles.deleteOwnerActionsHeader}>{tr.t("main.deleteStaff.delete")}</Text>
                          <View style={styles.deleteOwnerActions}>
                            <TouchableOpacity style={styles.deleteOwnerAction} onPress={() => {
                              setEditinfo({ ...editInfo, show: true })
                              setDeleteownerbox({ ...deleteOwnerbox, show: false })
                            }}>
                              <Text style={styles.deleteOwnerActionHeader}>{tr.t("buttons.no")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteOwnerAction} onPress={() => deleteTheOwner()}>
                              <Text style={styles.deleteOwnerActionHeader}>{tr.t("buttons.yes")}</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}
            {showDisabledscreen && (
              <Disable 
                close={() => socket.emit("socket/business/login", ownerId, () => setShowdisabledscreen(false))}
                language={language}
              />
            )}
          </SafeAreaView>
        </Modal>
      )}
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
  main: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

  header: { fontSize: wsize(5), fontWeight: 'bold' },

	// body
	body: { alignItems: 'center', height: '90%', width: '100%' },

  viewTypeSettingTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 10, padding: 5, width: '50%' },
  viewTypeSettingTouchHeader: { fontSize: wsize(5), textAlign: 'center' },
  viewTypeSettingsBox: { marginVertical: 50, width: '100%' },
  viewTypeSettingsHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
  viewTypeSettingsOptions: { flexDirection: 'row', justifyContent: 'space-around' },
  viewTypeSettingOption: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: '30%' },
  viewTypeSettingOptionHeader: { fontSize: wsize(4), textAlign: 'center' },

  menu: { backgroundColor: 'white', borderTopRadius: 3, borderRightRadius: 3, borderBottomRadius: 0, borderLeftRadius: 0, marginVertical: 0, width: '100%' },
  menuRow: { backgroundColor: '#FFE4CF', flexDirection: 'row', padding: '5%', width: '100%' },
  menuImageHolder: { borderRadius: 25, flexDirection: 'column', height: 50, justifyContent: 'space-around', overflow: 'hidden', width: 50 },
  menuName: { color: 'black', fontSize: wsize(4), fontWeight: 'bold' },
  itemInfo: { fontSize: wsize(5), marginLeft: 10, marginVertical: 10 },
  item: { backgroundColor: 'white', borderStyle: 'solid', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, paddingBottom: 30, width: '100%' },
  itemImageHolder: { borderRadius: 25, flexDirection: 'column', justifyContent: 'space-around', margin: 5, overflow: 'hidden', width: 50 },
  itemHeader: { fontSize: wsize(3), fontWeight: 'bold', marginLeft: 20, textDecorationStyle: 'solid' },
  itemMiniHeader: { fontSize: wsize(4), marginLeft: 10 },
  itemPrice: { fontSize: wsize(3), fontWeight: 'bold' },
  itemActions: { flexDirection: 'row', marginRight: 10 },
  itemAction: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginLeft: 10, padding: 5, width: '90%' },
  itemActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	bodyResult: { alignItems: 'center', flexDirection: 'column', height: '90%', justifyContent: 'space-around' },
	bodyResultHeader: { fontSize: wsize(5), fontWeight: 'bold', paddingHorizontal: '10%', textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNavButton: { backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
	bottomNavButtonHeader: { color: 'white', fontSize: wsize(4), fontWeight: 'bold', textAlign: 'center' },

  showInfoContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  showInfoBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '90%', justifyContent: 'space-around', width: '90%' },
  showInfoClose: { alignItems: 'center', borderRadius: 20, borderStyle: 'solid', borderWidth: 2, marginVertical: 30 },
  showInfoHeader: { fontSize: wsize(8), fontWeight: 'bold', textAlign: 'center' },
  workerInfoList: { marginVertical: 40, width: '100%' },
  workerInfo: { alignItems: 'center' },
  workerInfoProfile: { borderRadius: wsize(30) / 2, height: wsize(30), overflow: 'hidden', width: wsize(30) },
  workerInfoName: { color: 'black', fontSize: wsize(5), fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  workerTime: {  },
  workerTimeContainer: { flexDirection: 'row', marginBottom: 20 },
  dayHeader: { fontSize: wsize(5) },
  timeHeaders: { flexDirection: 'row' },
  timeHeader: { fontSize: wsize(5), fontWeight: 'bold' },
  timeHeaderSep: { fontSize: wsize(5), fontWeight: 'bold' },

  moreInfosContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  moreInfosBox: { alignItems: 'center', backgroundColor: 'white', height: '80%', width: '80%' },
  moreInfosClose: { alignItems: 'center', borderRadius: 20, borderStyle: 'solid', borderWidth: 2, marginVertical: 10 },
  moreInfoTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 5, padding: 5, width: '100%' },
  moreInfoTouchHeader: { fontSize: wsize(5), textAlign: 'center' },

  languages: { alignItems: 'center', width: '100%' },
  language: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: '10%', padding: 10, width: '80%' },
  languageHeader: { fontSize: wsize(6), textAlign: 'center' },

  locationHeader: { fontSize: wsize(5), fontWeight: 'bold', marginHorizontal: 20, textAlign: 'center' },
  locationAddressHeader: { fontSize: wsize(5), fontWeight: 'bold', margin: 20, textAlign: 'center' },
  locationActionOption: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 10, width: wsize(50) },
  locationActionOptionHeader: { fontSize: wsize(5), textAlign: 'center' },
  locationAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 10, width: 100 },
  locationActionHeader: { fontSize: wsize(5), textAlign: 'center' },

  // account form
  accountform: { backgroundColor: 'white', height: '100%', width: '100%' },
  accountformHeader: { fontSize: wsize(6), fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
  accountformEdit: { flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  accountInfoEdit: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 10, padding: 5, width: '70%' },
  accountInfoEditHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
  accountformInputField: { marginBottom: 20, marginHorizontal: '10%', width: '80%' },
  accountformInputHeader: { fontSize: wsize(5), fontWeight: 'bold' },
  accountformInputInput: { borderRadius: 2, borderStyle: 'solid', borderWidth: 3, fontSize: wsize(5), padding: 5, width: '100%' },
  accountformSubmit: { alignItems: 'center', borderRadius: 2, borderStyle: 'solid', borderWidth: 1, margin: 5, padding: 5, width: wsize(35) },
  accountformSubmitHeader: { fontSize: wsize(5) },

  inputsBox: { paddingHorizontal: 20, width: '100%' },
  inputContainer: { marginVertical: 20 },
  inputHeader: { fontFamily: 'Chilanka_400Regular', fontSize: wsize(5) },
  input: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), padding: 5 },
  cameraContainer: { alignItems: 'center', width: '100%' },
  camera: { height: wsize(80), width: wsize(80) },
  cameraHeader: { fontSize: wsize(6), fontWeight: 'bold', textAlign: 'center' },
  cameraActions: { flexDirection: 'row' },
  cameraAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: wsize(30) },
  cameraActionHeader: { fontSize: wsize(4), textAlign: 'center' },
  
  workersBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  workersContainer: { alignItems: 'center', backgroundColor: 'white', height: '80%', width: '80%' },
  workersClose: { marginVertical: 30 },
  worker: { alignItems: 'center', height: wsize(25), margin: 5, width: wsize(25) },
  workerProfile: { borderRadius: wsize(20) / 2, height: wsize(20), overflow: 'hidden', width: wsize(20) },
  workerUsername: { fontSize: wsize(5), textAlign: 'center' },

  workerHour: { alignItems: 'center', backgroundColor: 'rgba(127, 127, 127, 0.3)', borderRadius: 10, marginTop: 10, marginHorizontal: '1%', padding: '2%', width: '98%' },
  workerHourHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
  workerDayTouch: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: '90%' },
  workerDayTouchSelected: { backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: '90%' },
  workerDayTouchOff: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, margin: 5, opacity: 0.2, padding: 5, width: '90%' },
  workerDayTouchHeader: { fontSize: wsize(6), textAlign: 'center' },
  workingDay: { backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 10, margin: 5, padding: 10 },
  workingDayHeader: { fontSize: wsize(6), textAlign: 'center' },

  timeSelectionContainer: { flexDirection: 'row', width: '100%' },
  workerHourActions: { flexDirection: 'row', justifyContent: 'space-around' },
  workerHourAction: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: wsize(35) },
  workerHourActionHeader: { fontSize: wsize(4), textAlign: 'center' },
  timeSelectionColumn: { flexDirection: 'column', justifyContent: 'space-around', width: '10%' },
  timeSelection: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 3, flexDirection: 'row', justifyContent: 'space-around', width: '45%' },
  timeSelectionHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
  selection: { alignItems: 'center' },
  selectionHeader: { fontSize: wsize(6), textAlign: 'center' },
  selectionDiv: { fontSize: wsize(6) },
  workerTouch: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5 },
  workerTouchHeader: { fontSize: wsize(7), textAlign: 'center' },
  
  deleteOwnerBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  deleteOwnerContainer: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '100%', justifyContent: 'space-between', paddingVertical: 20, width: '100%' },
  deleteOwnerProfile: { borderRadius: wsize(40) / 2, height: wsize(40), overflow: 'hidden', width: wsize(40) },
  deleteOwnerHeader: { fontSize: wsize(6), fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
  deleteOwnerActionsHeader: { fontSize: wsize(6), fontWeight: 'bold', textAlign: 'center' },
  deleteOwnerActions: { flexDirection: 'row', justifyContent: 'space-around' },
  deleteOwnerAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 10, width: wsize(30) },
  deleteOwnerActionHeader: { fontSize: wsize(4), textAlign: 'center' },

  editInfoBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  editInfoContainer: { alignItems: 'center', backgroundColor: 'white', height: '100%', width: '100%' },
  editInfoClose: { height: wsize(10), width: wsize(10) },

  accountHolders: { alignItems: 'center', marginHorizontal: 10, marginTop: 20 },
  accountHoldersHeader: { fontFamily: 'Chilanka_400Regular', fontSize: wsize(30), textAlign: 'center' },
  accountHoldersAdd: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 3, padding: 5 },
  accountHoldersAddHeader: { fontSize: wsize(5) },
  account: { alignItems: 'center', marginBottom: 50 },
  accountHeader: { fontSize: wsize(4), fontWeight: 'bold', padding: 5 },
  accountEdit: { backgroundColor: 'rgba(127, 127, 127, 0.3)', borderRadius: 4, flexDirection: 'row', justifyContent: 'space-around', width: '90%' },
  accountEditProfile: { borderRadius: wsize(20) / 2, height: wsize(20), overflow: 'hidden', width: wsize(20) },
  accountEditHeader: { fontSize: wsize(5), paddingVertical: 8, textAlign: 'center' },
  accountEditTouch: { borderRadius: 2, borderStyle: 'solid', borderWidth: 2, marginTop: 5, padding: 5, width: wsize(50) },
  accountEditTouchHeader: { fontSize: wsize(4), textAlign: 'center' },

  loginsAdd: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 20, padding: 5 },
  loginsAddHeader: { fontSize: wsize(4) },
  login: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 5, margin: '5%', width: '90%' },
  loginIndex: { fontSize: wsize(6) },
  loginHeader: { fontSize: wsize(5), marginLeft: 5 },
  loginToggler: { alignItems: 'center', width: '30%' },
  loginTogglerHeader: { fontSize: wsize(4), textAlign: 'center' },
  loginTogglerActions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  loginTogglerAction: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, padding: 5, width: '48%' },
  loginTogglerActionHeader: { textAlign: 'center' },
  loginChange: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
  loginChangeHeader: { fontSize: wsize(3), textAlign: 'center' },
  loginRemove: { backgroundColor: 'white', borderRadius: wsize(10) / 2, height: wsize(10), marginBottom: 5, width: wsize(10) },

  userType: { alignItems: 'center', width: '100%' },
  userTypeHeader: { fontSize: wsize(4), textAlign: 'center' },
  userTypeActions: { flexDirection: 'row', justifyContent: 'space-between', width: '80%' },
  userTypeAction: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, paddingVertical: 10, width: '30%' },
  userTypeActionHeader: { fontSize: wsize(4), textAlign: 'center' },

  updateButtons: { flexDirection: 'row', justifyContent: 'space-around' },
  updateButton: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 10 },
  updateButtonHeader: { fontSize: wsize(5), fontWeight: 'bold' },

  qrBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  qrContainer: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  qrHeader: { fontSize: wsize(6), fontWeight: 'bold', textAlign: 'center' },

  loading: { alignItems: 'center', flexDirection: 'column', height: '90%', justifyContent: 'space-around', width: '100%' },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  column: { flexDirection: 'column', justifyContent: 'space-around' },
  errorMsg: { color: 'darkred', fontSize: wsize(4), textAlign: 'center' }
})
