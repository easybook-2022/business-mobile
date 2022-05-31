import React, { useEffect, useState } from 'react'
import { 
  SafeAreaView, Platform, ScrollView, ActivityIndicator, Dimensions, 
  View, FlatList, Image, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, 
  Keyboard, StyleSheet, Modal, KeyboardAvoidingView
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKeepAwake } from 'expo-keep-awake'
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { StackActions } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system'
import * as ImageManipulator from 'expo-image-manipulator'
import * as Speech from 'expo-speech'
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Voice from '@react-native-voice/voice';
import { ownerGetinInfo, socket, logo_url, useSpeech, timeControl } from '../../assets/info'
import { displayTime, resizePhoto, displayPhonenumber } from 'geottuse-tools'
import { updateNotificationToken, verifyUser, getOwnerInfo, logoutUser, getWorkersTime } from '../apis/owners'
import { fetchNumAppointments, fetchNumCartOrderers, getLocationProfile } from '../apis/locations'
import { getMenus, removeMenu, addNewMenu } from '../apis/menus'
import { cancelSchedule, doneService, getAppointments, getCartOrderers } from '../apis/schedules'
import { removeProduct } from '../apis/products'
import { setWaitTime } from '../apis/carts'

import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import Ionicons from 'react-native-vector-icons/Ionicons'

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}

export default function Main(props) {
  useKeepAwake()

	const [notificationPermission, setNotificationpermission] = useState(null);
	const [ownerId, setOwnerid] = useState(null)
  const [isOwner, setIsowner] = useState(false)
	const [storeIcon, setStoreicon] = useState('')
	const [storeName, setStorename] = useState('')
	const [locationType, setLocationtype] = useState('')

	const [appointments, setAppointments] = useState([])
	const [numAppointments, setNumappointments] = useState(0)

	const [cartOrderers, setCartorderers] = useState([])
  const [speakInfo, setSpeakinfo] = useState({ orderNumber: "" })
	const [numCartorderers, setNumcartorderers] = useState(0)

  const [loaded, setLoaded] = useState(false)

	const [viewType, setViewtype] = useState('')
	const [cancelInfo, setCancelinfo] = useState({ show: false, type: "", requestType: "", reason: "", id: 0, index: 0 })

	const [showMenurequired, setShowmenurequired] = useState(false)
	const [showDisabledscreen, setShowdisabledscreen] = useState(false)
  const [showInfo, setShowinfo] = useState({ show: false, workers: [], locationHours: [] })


  const [showMoreoptions, setShowmoreoptions] = useState({ show: false, loading: false, infoType: '' })
  const [editInfo, setEditinfo] = useState({ show: false, type: '' })
  const [accountForm, setAccountform] = useState({
    show: false,
    type: '', editType: '', addStep: 0, id: -1,
    username: '', editUsername: false,
    cellnumber: '', verified: false, verifyCode: '', editCellnumber: false,
    currentPassword: '', newPassword: '', confirmPassword: '', editPassword: false,
    profile: { uri: '', name: '', size: { width: 0, height: 0 }}, editProfile: false, camType: 'front',
    workerHours: [], editHours: false,
    loading: false,
    errorMsg: ''
  })
  const [deleteOwnerbox, setDeleteownerbox] = useState({
    show: false,
    id: -1, username: '', 
    profile: { name: "", width: 0, height: 0 }, numWorkingdays: 0
  })
  const [accountHolders, setAccountholders] = useState([])
  const [cameraPermission, setCamerapermission] = useState(null);
  const [pickingPermission, setPickingpermission] = useState(null);
  const [camComp, setCamcomp] = useState(null)
  const [camType, setCamtype] = useState('back')
  const [choosing, setChoosing] = useState(false)
  const [hoursRange, setHoursrange] = useState([
    { key: "0", header: "Sunday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true, takeShift: "" },
    { key: "1", header: "Monday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true, takeShift: "" },
    { key: "2", header: "Tuesday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true, takeShift: "" },
    { key: "3", header: "Wednesday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true, takeShift: "" },
    { key: "4", header: "Thursday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true, takeShift: "" },
    { key: "5", header: "Friday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true, takeShift: "" },
    { key: "6", header: "Saturday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true, takeShift: "" }
  ])
  const [getWorkersbox, setGetworkersbox] = useState({ show: false, day: '', workers: [] })
  const [logo, setLogo] = useState({ uri: '', name: '', size: { width: 0, height: 0 }, loading: false })

	const getNotificationPermission = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const { status } = await Notifications.getPermissionsAsync()

    if (status == "granted") {
      setNotificationpermission(true)
    } else {
      const info = await Notifications.requestPermissionsAsync()

      if (info.status == "granted") {
        setNotificationpermission(true)
      }
    }

    const { data } = await Notifications.getExpoPushTokenAsync({
      experienceId: "@robogram/easygo-business"
    })

    if (ownerid) {
      updateNotificationToken({ ownerid, token: data })
        .then((res) => {
          if (res.status == 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {

          }
        })
        .catch((err) => {
          if (err.response && err.response.status == 400) {
            const { errormsg, status } = err.response.data
          }
        })
    }
	}
	
	const fetchTheNumAppointments = async() => {
    const ownerid = await AsyncStorage.getItem("ownerid")

		fetchNumAppointments(ownerid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) setNumappointments(res.numAppointments)
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
	}
	const fetchTheNumCartOrderers = async() => {
		const locationid = await AsyncStorage.getItem("locationid")

		fetchNumCartOrderers(locationid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) setNumcartorderers(res.numCartorderers)
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
				}
			})
	}

	const getTheLocationProfile = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { locationid }

		getLocationProfile(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { name, fullAddress, logo, type } = res.info

					socket.emit("socket/business/login", ownerid, () => {
						setOwnerid(ownerid)
						setStorename(name)
						setStoreicon(logo)
						setLocationtype(type)

						if (type == 'store' || type == 'restaurant') {
							fetchTheNumCartOrderers()
              getAllCartOrderers()
						} else {
							fetchTheNumAppointments()
							getAllAppointments()
						}
					})
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
          setShowinfo({ ...showInfo, show: true, workers: res.workers, locationHours: res.locationHours })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }

	const getAllAppointments = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { ownerid, locationid }

		getAppointments(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setAppointments(res.appointments)
					setNumappointments(res.numappointments)
					setViewtype('appointments')
          setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
				}
			})
	}
  const speakToWorker = async(data) => {
    let message

    if (data.type == "makeAppointment" || data.type == "remakeAppointment" || data.type == "cancelRequest") {
      const { name, time, worker } = data.speak

      switch (data.type) {
        case "makeAppointment":
          message = "New appointment" 

          break;
        case "remakeAppointment":
          message = "Appointment rebook"

          break;
        case "cancelRequest":
          message = "Appointment cancelled"

          break;
        default:
      }

      message += " for " + name + " " + displayTime(time) + " with stylist: " + worker

      if (Constants.isDevice && useSpeech == true) Speech.speak(message, { rate: 0.7 })
    } else {
      const { name, quantity, customer, orderNumber } = data.speak

      switch (data.type) {
        case "checkout":
          message = customer + " ordered " + quantity + " of " + name + ". How long will be the wait ?"

          if (Constants.isDevice && useSpeech == true) {
            Speech.speak(message, {
              rate: 0.7,
              onDone: () => Constants.isDevice ? startVoice() : {}
            })
          }

          break;
        default:
      }
    }
  }
  const startVoice = async() => {
    await Voice.start('en-US')

    setTimeout(function () {
      stopSpeech()
    }, 5000)
  }

	const getAllCartOrderers = async() => {
		const locationid = await AsyncStorage.getItem("locationid")

		getCartOrderers(locationid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setCartorderers(res.cartOrderers)
					setNumcartorderers(res.numCartorderers)
					setViewtype('cartorderers')
          setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
				}
			})
	}
	const cancelTheSchedule = (index, requestType) => {
		let id, type, item = index != null ? appointments[index] : appointments[cancelInfo.index]

    id = item.id
    type = item.type

		if (!cancelInfo.show) {
			setCancelinfo({ ...cancelInfo, show: true, type, requestType, id, index })
		} else {
			const { reason, id, index } = cancelInfo
			let data = { scheduleid: id, reason, type: "cancelSchedule" }

			cancelSchedule(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						data = { ...data, receiver: res.receiver }
						socket.emit("socket/business/cancelSchedule", data, () => {
              switch (requestType) {
                case "appointment":
                  const newAppointments = [...appointments]

                  newAppointments.splice(index, 1)

                  setAppointments(newAppointments)
                  fetchTheNumAppointments()

                  break
                default:
              }
    							
							setCancelinfo({ ...cancelInfo, show: false, type: "", requestType: "", reason: "", id: 0, index: 0 })
						})				
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						const { errormsg, status } = err.response.data
					}
				})
		}
	}

  const doneTheService = (index, id) => {
    doneService(id)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const newAppointments = [...appointments]
          let data = { id, type: "doneService", receiver: res.receiver }

          newAppointments.splice(index, 1)

          socket.emit("socket/doneService", data, () => {
            fetchTheNumAppointments()
            setAppointments(newAppointments)
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
	const removeFromList = (id, type) => {
		let newItems = []

		switch (type) {
			case "appointments":
				newItems = [...appointments]

				break
			case "cartOrderers":
				newItems = [...cartOrderers]

				break
			default:
		}

    newItems.forEach(function (item, index) {
      if (item.id == id) {
        newItems.splice(index, 1)
      }
    })

		switch (type) {
			case "appointments":
				setAppointments(newItems)

				break
			case "cartOrderers":
				setCartorderers(newItems)
				
				break
			default:
		}
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

            props.navigation.dispatch(StackActions.replace("auth"));
          })
        }
      })
  }
	const startWebsocket = () => {
		socket.on("updateSchedules", data => {
      if (
        data.type == "makeAppointment" || 
        data.type == "cancelRequest" || 
        data.type == "remakeAppointment"
      ) {
        getAllAppointments()

        speakToWorker(data)
      }
		})
		socket.on("updateOrders", data => {
      getAllCartOrderers()

      speakToWorker(data)
    })
		socket.io.on("open", () => {
			if (ownerId != null) {
				socket.emit("socket/business/login", ownerId, () => setShowdisabledscreen(false))
			}
		})
		socket.io.on("close", () => ownerId != null ? setShowdisabledscreen(true) : {})
	}
  
	const initialize = () => {
		getTheLocationProfile()
    getTheOwnerInfo()

		if (Constants.isDevice) getNotificationPermission()
	}
  const stopSpeech = async() => {
    await Voice.stop()
    await Voice.cancel()
    await Voice.destroy();
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
    const ownerid = await AsyncStorage.getItem("ownerid")

    getAccounts(locationid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setOwnerid(ownerid)
          setAccountholders(res.accounts)
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

    let letters = [
      "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", 
      "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
    ]
    let photo_name_length = Math.floor(Math.random() * (15 - 10)) + 10
    let char = ""

    if (camComp) {
      let options = { quality: 0 };
      let photo = await camComp.takePictureAsync(options)
      let photo_option = [{ resize: { width: width, height: width }}]
      let photo_save_option = { format: ImageManipulator.SaveFormat.JPEG, base64: true }

      if (accountForm.camType == "front") {
        photo_option.push({ flip: ImageManipulator.FlipType.Horizontal })
      }

      photo = await ImageManipulator.manipulateAsync(
        photo.localUri || photo.uri,
        photo_option,
        photo_save_option
      )

      for (let k = 0; k < photo_name_length; k++) {
        char += "" + (
          k % 2 == 0 ? 
            letters[Math.floor(Math.random() * letters.length)].toUpperCase()
            :
            Math.floor(Math.random() * 9) + 0
        )
      }

      FileSystem.moveAsync({
        from: photo.uri,
        to: `${FileSystem.documentDirectory}/${char}.jpg`
      })
      .then(() => {
        setAccountform({
          ...accountForm,
          profile: {
            uri: `${FileSystem.documentDirectory}/${char}.jpg`,
            name: `${char}.jpg`, size: { width, height: width }
          },
          loading: false
        })
      })
    }
  }
  const chooseProfile = async() => {
    setAccountform({ ...accountForm, loading: true })
    setChoosing(true)

    let letters = [
      "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", 
      "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
    ]
    let photo_name_length = Math.floor(Math.random() * (15 - 10)) + 10
    let char = "", photo = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 0.1,
      base64: true
    });

    for (let k = 0; k < photo_name_length; k++) {
      char += "" + (
        k % 2 == 0 ? 
          letters[Math.floor(Math.random() * letters.length)].toUpperCase()
          :
          Math.floor(Math.random() * 9) + 0
      )
    }

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
  const addNewOwner = async() => {
    setAccountform({ ...accountForm, loading: true, errorMsg: "" })

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

      hours[workerHour.header.substr(0, 3)] = { 
        opentime: newOpentime, 
        closetime: newClosetime, working, 
        takeShift: takeShift ? takeShift : "" 
      }
    })

    const id = await AsyncStorage.getItem("locationid")
    const { cellnumber, username, newPassword, confirmPassword, profile } = accountForm
    const data = { id, cellnumber, username, password: newPassword, confirmPassword, hours, profile }

    addOwner(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }

        return
      })
      .then((res) => {
        if (res) {
          setAccountform({
            ...accountForm, show: false, 
            type: '', editType: '', addStep: 0, id: -1, 
            username: '', cellnumber: '', 
            password: '', confirmPassword: '', profile: { uri: '', name: '', size: { width: 0, height: 0 } }, 
            loading: false, errorMsg: ""
          })
          getAllAccounts()
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data

          setAccountform({ ...accountForm, errormsg })
        }
      })
  }
  const updateWorkingHour = (index, timetype, dir, open) => {
    const newWorkerhours = [...accountForm.workerHours], hoursRangeInfo = [...hoursRange]
    let value, { openunix, closeunix, calcDate } = hoursRangeInfo[index]
    let { opentime, closetime } = newWorkerhours[index], valid = false

    value = open ? opentime : closetime

    let { hour, minute, period } = timeControl(timetype, value, dir, open)

    if (open) {
      valid = (
        Date.parse(calcDate + " " + hour + ":" + minute + " " + period) >= openunix
        &&
        Date.parse(calcDate + " " + hour + ":" + minute + " " + period) <= Date.parse(calcDate + " " + closetime.hour + ":" + closetime.minute + " " + closetime.period)
      )
    } else {
      valid = (
        Date.parse(calcDate + " " + hour + ":" + minute + " " + period) <= closeunix
        &&
        Date.parse(calcDate + " " + hour + ":" + minute + " " + period) >= Date.parse(calcDate + " " + opentime.hour + ":" + opentime.minute + " " + opentime.period)
      )
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

          hours[workerHour.header.substr(0, 3)] = { 
            opentime: newOpentime, 
            closetime: newClosetime, working, 
            takeShift: takeShift ? takeShift : ""
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
            profile: { name: "", uri: "" }, editProfile: false, 
            loading: false, errorMsg: ""
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data

          setAccountform({ ...accountForm, errorMsg: errormsg })
        }
      })
  }
  const deleteTheOwner = id => {
    if (!deleteOwnerbox.show) {
      getWorkerInfo(id)
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
            message: "EasyGO Business allows you to take a photo of your location and your stylist profile",
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
    if (!loaded) initialize()
	}, [])

	useEffect(() => {
		startWebsocket()

		if (Constants.isDevice) {
			Notifications.addNotificationResponseReceivedListener(res => {
				const { data } = res.notification.request.content

        if (
          data.type == "makeAppointment" || 
          data.type == "cancelRequest" || 
          data.type == "remakeAppointment"
        ) {
          getAllAppointments()

          speakToWorker(data)
        } else if (data.type == "checkout") {
          fetchTheNumCartOrderers()
        }
			});
		}

		return () => {
			socket.off("updateSchedules")
			socket.off("updateOrders")
		}
	}, [appointments.length, cartOrderers.length])

  useEffect(() => {
    if (Constants.isDevice) {
      Voice.onSpeechPartialResults = (e) => {
        if (e.value.toString().toLowerCase().includes("minute")) {
          stopSpeech()

          let data = { type: "setWaitTime", ordernumber: speakInfo.orderNumber, waitTime: e.value.toString() }

          setWaitTime(data)
            .then((res) => {
              if (res.status == 200) {
                return res.data
              }
            })
            .then((res) => {
              if (res) {
                data = { ...data, receiver: res.receiver }
                socket.emit("socket/setWaitTime", data)
              }
            })
            .catch((err) => {
              if (err.response && err.response.status == 400) {
                const { errormsg, status } = err.response.data
              }
            })
        }
      };

      return () => {
        Voice.destroy().then(Voice.removeAllListeners);
      }
    }
  }, [speakInfo.orderNumber])

	return (
		<SafeAreaView style={styles.main}>
      {loaded ?
  			<View style={styles.box}>
  				<View style={styles.body}>
  					<View style={styles.navs}>
              <Text style={styles.header}>{(locationType == 'hair' || locationType == 'nail') ? 'Appointment(s)' : 'Orderer(s)'}</Text>
  					</View>

            {viewType == "appointments" && (
              appointments.length > 0 ? 
                <FlatList
                  data={appointments}
                  renderItem={({ item, index }) => 
                    <View key={item.key} style={styles.schedule}>
                      <View style={styles.scheduleImageHolder}>
                        <Image 
                          style={resizePhoto(item.image, wsize(20))} 
                          source={item.image.name ? { uri: logo_url + item.image.name } : require("../../assets/noimage.jpeg")}
                        />
                      </View>
                        
                      <Text style={styles.scheduleHeader}>
                        Client: {item.client.username}
                        {'\nAppointment for: ' + item.name}
                        {'\n' + displayTime(item.time)}
                        {'\nwith stylist: ' + item.worker.username}
                      </Text>

                      <View style={styles.scheduleActions}>
                        <View style={styles.column}>
                          <TouchableOpacity style={styles.scheduleAction} onPress={() => cancelTheSchedule(index, "appointment")}>
                            <Text style={styles.scheduleActionHeader}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.column}>
                          <TouchableOpacity style={styles.scheduleAction} onPress={() => props.navigation.navigate("booktime", { scheduleid: item.id, serviceid: item.serviceid, serviceinfo: item.name })}>
                            <Text style={styles.scheduleActionHeader}>Pick another time for client</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.column}>
                          <TouchableOpacity style={styles.scheduleAction} onPress={() => doneTheService(index, item.id)}>
                            <Text style={styles.scheduleActionHeader}>Done</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  }
                />
                :
                <View style={styles.bodyResult}>
                  <Text style={styles.bodyResultHeader}>You will see your appointment(s) here</Text>
                </View>
            )}
            {viewType == "cartorderers" && (
              cartOrderers.length > 0 ? 
                <FlatList
                  data={cartOrderers}
                  renderItem={({ item, index }) => 
                    item.product ? 
                      <View key={item.key} style={styles.orderRequest}>
                        <View style={styles.orderRequestRow}>
                          <View>
                            <Text style={styles.orderRequestHeader}>{item.product}</Text>
                            <Text style={styles.orderRequestQuantity}>Quantity: {item.quantity}</Text>
                          </View>
                        </View>
                      </View>
                      :
                      <View key={item.key} style={styles.cartorderer}>
                        <View style={styles.cartordererInfo}>
                          <Text style={styles.cartordererUsername}>Customer: {item.username}</Text>
                          <Text style={styles.cartordererOrderNumber}>Order #{item.orderNumber}</Text>

                          <View style={styles.cartorderActions}>
                            <TouchableOpacity style={styles.cartordererAction} onPress={() => {
                              props.navigation.navigate("cartorders", { userid: item.adder, type: item.type, ordernumber: item.orderNumber, refetch: () => {
                                getAllCartOrderers()
                                removeFromList(item.id, "cartOrderers")
                              }})
                            }}>
                              <Text style={styles.cartordererActionHeader}>See Order(s) ({item.numOrders})</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                  }
                />
                :
                <View style={styles.bodyResult}>
                  <Text style={styles.bodyResultHeader}>{numCartorderers == 0 ? 'No order(s) yet' : numCartorderers + ' order(s)'}</Text>
                </View>
            )}
  				</View>

  				<View style={styles.bottomNavs}>
  					<View style={styles.bottomNavsRow}>
              <View style={styles.column}>
                <TouchableOpacity style={styles.bottomNavButton} onPress={() => setShowmoreoptions(true)}>
                  <Text style={styles.bottomNavButtonHeader}>More Info</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.column}>
    						<TouchableOpacity style={styles.bottomNavButton} onPress={() => logout()}>
    							<Text style={styles.bottomNavButtonHeader}>Go home</Text>
    						</TouchableOpacity>
              </View>

              <View style={styles.column}>
                <TouchableOpacity style={styles.bottomNavButton} onPress={() => getTheWorkersTime()}>
                  <Text style={styles.bottomNavButtonHeader}>Hour(s)</Text>
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

			{cancelInfo.show && (
				<Modal transparent={true}>
					<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
						<SafeAreaView style={styles.cancelRequestBox}>
							<Text style={styles.cancelRequestHeader}>Why cancel? (optional)</Text>

							<TextInput 
								placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Write your reason" 
								multiline={true} textAlignVertical="top" style={styles.cancelRequestInput} 
								onChangeText={(reason) => setCancelinfo({ ...cancelInfo, reason })} autoCorrect={false} 
								autoCapitalize="none"
							/>

							<View style={{ alignItems: 'center' }}>
								<View style={styles.cancelRequestActions}>
									<TouchableOpacity style={styles.cancelRequestTouch} onPress={() => setCancelinfo({ ...cancelInfo, show: false, type: "", requestType: "", id: 0, index: 0, reason: "" })}>
										<Text style={styles.cancelRequestTouchHeader}>Close</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.cancelRequestTouch} onPress={() => cancelTheSchedule(null, cancelInfo.requestType)}>
										<Text style={styles.cancelRequestTouchHeader}>Done</Text>
									</TouchableOpacity>
								</View>
							</View>
						</SafeAreaView>
					</TouchableWithoutFeedback>
				</Modal>
			)}
			{showMenurequired && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.requiredBoxContainer}>
						<View style={styles.requiredBox}>
							<View style={styles.requiredContainer}>
								<Text style={styles.requiredHeader}>
									You need to add some 
									{locationType == "restaurant" ? 
										" food "
										:
										" products / services "
									}
									to your menu to list your location publicly
								</Text>

								<View style={styles.requiredActions}>
									<TouchableOpacity style={styles.requiredAction} onPress={() => setShowmenurequired(false)}>
										<Text style={styles.requiredActionHeader}>Close</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.requiredAction} onPress={() => {
										setShowmenurequired(false)
										props.navigation.navigate("menu", { menuid: '', name: '', refetch: () => getTheLocationProfile()})
									}}>
										<Text style={styles.requiredActionHeader}>Ok</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</SafeAreaView>
				</Modal>
			)}
      {showInfo.show && (
        <Modal transparent={true}>
          <View style={styles.showInfoContainer}>
            <View style={styles.showInfoBox}>
              <ScrollView style={{ width: '100%' }}>
                <View style={{ alignItems: 'center' }}>
                  <TouchableOpacity style={styles.showInfoClose} onPress={() => setShowinfo(false)}>
                    <AntDesign name="close" size={wsize(7)}/>
                  </TouchableOpacity>

                  <Text style={styles.showInfoHeader}>Salon's hour(s)</Text>

                  {showInfo.locationHours.map(info => (
                    !info.close && (
                      <View style={styles.workerTimeContainer} key={info.key}>
                        <Text style={styles.dayHeader}>{info.header}: </Text>
                        <View style={styles.timeHeaders}>
                          <Text style={styles.timeHeader}>{info.opentime.hour}</Text>
                          <View style={styles.column}><Text>:</Text></View>
                          <Text style={styles.timeHeader}>{info.opentime.minute}</Text>
                          <Text style={styles.timeHeader}>{info.opentime.period}</Text>
                        </View>
                        <View style={styles.column}><Text> - </Text></View>
                        <View style={styles.timeHeaders}>
                          <Text style={styles.timeHeader}>{info.closetime.hour}</Text>
                          <View style={styles.column}><Text>:</Text></View>
                          <Text style={styles.timeHeader}>{info.closetime.minute}</Text>
                          <Text style={styles.timeHeader}>{info.closetime.period}</Text>
                        </View>
                      </View>
                    )
                  ))}

                  <View style={styles.workerInfoList}>
                    {showInfo.workers.map(worker => (
                      <View key={worker.key} style={styles.worker}>
                        <View style={styles.workerInfo}>
                          <View style={styles.workerInfoProfile}>
                            <Image 
                              source={worker.profile.name ? { uri: logo_url + worker.profile.name } : require("../../assets/noimage.jpeg")}
                              style={resizePhoto(worker.profile, 50)}
                            />
                          </View>
                          <Text style={styles.workerInfoName}>{worker.name}</Text>
                        </View>
                        <View style={styles.workerTime}>
                          {worker.hours.map(info => (
                            info.working && (
                              <View style={styles.workerTimeContainer} key={info.key}>
                                <Text style={styles.dayHeader}>{info.header}: </Text>
                                <View style={styles.timeHeaders}>
                                  <Text style={styles.timeHeader}>{info.opentime.hour}</Text>
                                  <View style={styles.column}><Text>:</Text></View>
                                  <Text style={styles.timeHeader}>{info.opentime.minute}</Text>
                                  <Text style={styles.timeHeader}>{info.opentime.period}</Text>
                                </View>
                                <View style={styles.column}><Text> - </Text></View>
                                <View style={styles.timeHeaders}>
                                  <Text style={styles.timeHeader}>{info.closetime.hour}</Text>
                                  <View style={styles.column}><Text>:</Text></View>
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
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
      {showMoreoptions && (
        <Modal transparent={true}>
          <View style={styles.moreOptionsContainer}>
            <View style={styles.moreOptionsBox}>
              {showMoreoptions.infoType == '' ? 
                <>
                  <TouchableOpacity style={styles.moreOptionsClose} onPress={() => setShowmoreoptions(false)}>
                    <AntDesign name="close" size={wsize(7)}/>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.moreOptionTouch} onPress={() => {
                    setShowmoreoptions(false)
                    props.navigation.navigate("menu", { refetch: () => initialize(), isOwner })
                  }}>
                    <Text style={styles.moreOptionTouchHeader}>{isOwner == true ? "Change" : "Read"} Menu</Text>
                  </TouchableOpacity>

                  {(locationType == "hair" || locationType == "nail") && (
                    <TouchableOpacity style={styles.moreOptionTouch} onPress={() => {
                      setEditinfo({ ...editInfo, show: true, type: 'users' })
                      setShowmoreoptions({ ...showMoreoptions, infoType: 'users' })
                    }}>
                      <Text style={styles.moreOptionTouchHeader}>Change Workers Info</Text>
                    </TouchableOpacity>
                  )}

                  {isOwner == true && (
                    <>
                      <TouchableOpacity style={styles.moreOptionTouch} onPress={() => {
                        setShowmoreoptions({ ...showMoreoptions, infoType: 'information' })
                        setEditinfo({ ...editInfo, show: true, type: 'information' })
                      }}>
                        <Text style={styles.moreOptionTouchHeader}>
                          Change 
                          {(locationType == "hair" || locationType == "nail") && " Salon "} 
                          {locationType == "restaurant" && " Restaurant "}
                          {locationType == "store" && " Store "}
                          Info
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.moreOptionTouch} onPress={() => {
                        setShowmoreoptions({ ...showMoreoptions, infoType: 'hours' })
                        setEditinfo({ ...editInfo, show: true, type: 'hours' })
                      }}>
                        <Text style={styles.moreOptionTouchHeader}>
                          Change 
                          {(locationType == "hair" || locationType == "nail") && " Salon "} 
                          {locationType == "restaurant" && " Restaurant "}
                          {locationType == "store" && " Store "}
                          Hour(s)
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.moreOptionTouch} onPress={() => {
                        AsyncStorage.removeItem("locationid")
                        AsyncStorage.removeItem("locationtype")
                        AsyncStorage.setItem("phase", "list")

                        setShowmoreoptions({ ...showMoreoptions, show: false })
                        props.navigation.dispatch(StackActions.replace("list"));
                      }}>
                        <Text style={styles.moreOptionTouchHeader}>Switch Business</Text>
                      </TouchableOpacity>

                      {(locationType == "hair" || locationType == "nail") && (
                        <TouchableOpacity style={styles.moreOptionTouch} onPress={() => {
                          setShowmoreoptions({ ...showMoreoptions, infoType: 'receivetype' })
                          setEditinfo({ ...editInfo, show: true, type: 'receivetype' })
                        }}>
                          <Text style={styles.moreOptionTouchHeader}>Edit Appointment Alert Type</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </>
                :
                <>
                  {editInfo.show && (
                    <View style={styles.editInfoBox}>
                      <View style={styles.editInfoContainer}>
                        {editInfo.type == 'users' && (
                          <View style={styles.accountHolders}>
                            <Text style={styles.header}>Edit Stylist(s)</Text>

                            {isOwner == true && (
                              <TouchableOpacity style={styles.accountHoldersAdd} onPress={() => {
                                setAccountform({
                                  ...accountForm,
                                  show: true,
                                  type: 'add',
                                  username: ownerGetinInfo.username,
                                  cellnumber: ownerGetinInfo.cellnumber,
                                  currentPassword: ownerGetinInfo.password, 
                                  newPassword: ownerGetinInfo.password, 
                                  confirmPassword: ownerGetinInfo.password,
                                  workerHours: [...hoursRange]
                                })
                                setEditinfo({ ...editInfo, show: false })
                              }}>
                                <Text style={styles.accountHoldersAddHeader}>Add a new stylist</Text>
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
                                      isOwner == true && (
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
                                          id: info.id,
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
                                          show: true, type: 'edit', editType: 'hours', 
                                          id: info.id, workerHours: info.hours
                                        })
                                      }

                                      setEditinfo({ ...editInfo, show: false })
                                    }}>
                                      <Text style={styles.accountEditTouchHeader}>Change {ownerId === info.id ? "Info (your)" : "hours"}</Text>
                                    </TouchableOpacity>
                                  </View>
                                )}
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                  {accountForm.show && (
                    <>
                      <ScrollView style={{ height: '100%', width: '100%' }}>
                        <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : "position"}>
                          {(!accountForm.editCellnumber && !accountForm.editUsername && !accountForm.editProfile && !accountForm.editPassword && !accountForm.editHours && accountForm.type != 'add') ? 
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
                                }}>
                                  <AntDesign name="closecircleo" size={wsize(7)}/>
                                </TouchableOpacity>
                              </View>

                              <Text style={styles.accountformHeader}>{accountForm.type == 'add' ? 'Add' : 'Editing'} stylist info</Text>

                              {accountForm.id == ownerId ? 
                                <View style={{ alignItems: 'center' }}>
                                  <TouchableOpacity style={styles.accountInfoEdit} onPress={() => setAccountform({ ...accountForm, editCellnumber: true, editType: 'cellnumber' })}>
                                    <Text style={styles.accountInfoEditHeader}>Change Cell number</Text>
                                  </TouchableOpacity>

                                  <TouchableOpacity style={styles.accountInfoEdit} onPress={() => setAccountform({ ...accountForm, editUsername: true, editType: 'username' })}>
                                    <Text style={styles.accountInfoEditHeader}>Change your name</Text>
                                  </TouchableOpacity>

                                  <TouchableOpacity style={styles.accountInfoEdit} onPress={() => setAccountform({ ...accountForm, editProfile: true, editType: 'profile' })}>
                                    <Text style={styles.accountInfoEditHeader}>Change your profile</Text>
                                  </TouchableOpacity>

                                  <TouchableOpacity style={styles.accountInfoEdit} onPress={() => setAccountform({ ...accountForm, editPassword: true, editType: 'password' })}>
                                    <Text style={styles.accountInfoEditHeader}>Change your password</Text>
                                  </TouchableOpacity>

                                  {(locationType == "hair" || locationType == "nail") && (
                                    <TouchableOpacity style={styles.accountInfoEdit} onPress={() => setAccountform({ ...accountForm, editHours: true, editType: 'hours' })}>
                                      <Text style={styles.accountInfoEditHeader}>Change your days and hours</Text>
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
                                            <Text style={styles.workerHourHeader}>Your hours on {info.header}</Text>
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
                                          <Text style={styles.workerHourHeader}><Text style={{ fontWeight: '300' }}>Not working on</Text> {info.header}</Text>

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
                                        <Text style={styles.accountformSubmitHeader}>Cancel</Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity style={[styles.accountformSubmit, { opacity: accountForm.loading ? 0.3 : 1 }]} disabled={accountForm.loading} onPress={() => {
                                        if (accountForm.type == 'add') {
                                          addNewOwner()
                                        } else {
                                          updateTheOwner()
                                        }

                                        getAllAccounts()
                                      }}>
                                        <Text style={styles.accountformSubmitHeader}>{accountForm.type == 'add' ? 'Add' : 'Save'} Account</Text>
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
                                          <Text style={styles.accountformInputHeader}>Enter verify code from your message:</Text>
                                          <TextInput style={styles.accountformInputInput} onChangeText={(usercode) => {
                                            if (usercode.length == 6) {
                                              Keyboard.dismiss()

                                              if (usercode == accountForm.verifyCode || (usercode == '111111')) {
                                                setAccountform({ ...accountForm, verified: true, addStep: accountForm.addStep + 1, errorMsg: "" })
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
                                      <Text style={styles.accountformInputHeader}>Your name:</Text>
                                      <TextInput style={styles.accountformInputInput} onChangeText={(username) => setAccountform({ ...accountForm, username })} value={accountForm.username} autoCorrect={false}/>
                                    </View>
                                  )}

                                  {accountForm.addStep == 2 && (
                                    <View style={styles.cameraContainer}>
                                      <Text style={styles.cameraHeader}>Profile Picture (Optional)</Text>
                                      <Text style={styles.cameraHeader}>Take a picture of {accountForm.username} for clients (Optional)</Text>

                                      {accountForm.profile.uri ? 
                                        <>
                                          <Image style={styles.camera} source={{ uri: accountForm.profile.uri }}/>

                                          <TouchableOpacity style={styles.cameraAction} onPress={() => setAccountform({ ...accountForm, profile: { uri: '', name: '', size: { width: 0, height: 0 }}})}>
                                            <Text style={styles.cameraActionHeader}>Cancel</Text>
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
                                        <TextInput style={styles.accountformInputInput} secureTextEntry={true} onChangeText={(confirmPassword) => setAccountform({
                                          ...accountForm,
                                          confirmPassword
                                        })} value={accountForm.confirmPassword} autoCorrect={false}/>
                                      </View>
                                    </View>
                                  )}

                                  {accountForm.addStep == 4 && (
                                    accountForm.workerHours.map((info, index) => (
                                      <View key={index} style={styles.workerHour}>
                                        {info.working == true ? 
                                          <>
                                            <View style={{ opacity: info.working ? 1 : 0.1 }}>
                                              <Text style={styles.workerHourHeader}>Your hours on {info.header}</Text>
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
                                            <>
                                              <Text style={styles.workerHourHeader}><Text style={{ fontWeight: '300' }}>Not working on</Text> {info.header}</Text>

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
                                            <Text style={styles.workerHourHeader}><Text style={{ fontWeight: '300' }}>Not open on</Text> {info.header}</Text>
                                        }
                                      </View>
                                    ))
                                  )}

                                  {accountForm.errorMsg ? <Text style={styles.errorMsg}>{accountForm.errorMsg}</Text> : null}

                                  {accountForm.addStep != 0 && accountForm.verified && (
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
                                            workerHours: [], editHours: false,
                                            errorMsg: ""
                                          })
                                          setEditinfo({ ...editInfo, show: true })
                                        }}>
                                          <Text style={styles.accountformSubmitHeader}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.accountformSubmit, { opacity: accountForm.loading ? 0.3 : 1 }]} disabled={accountForm.loading} onPress={() => {
                                          if (accountForm.addStep == 4) {
                                            addNewOwner()
                                            getAllAccounts()
                                          } else {
                                            setAccountform({ ...accountForm, addStep: accountForm.addStep + 1 })
                                          }
                                        }}>
                                          <Text style={styles.accountformSubmitHeader}>
                                            {accountForm.addStep == 4 ? 
                                              (accountForm.type == 'add' ? 'Add' : 'Save') + ' Account'
                                              :
                                              'Next'
                                            }
                                          </Text>
                                        </TouchableOpacity>
                                      </View>
                                    </View>
                                  )}
                                </>
                                :
                                <>
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
                                            <Text style={styles.cameraActionHeader}>Cancel</Text>
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
                                        })} value={accountForm.confirmPassword} autoCorrect={false}/>
                                      </View>
                                    </View>
                                  )}

                                  {accountForm.editHours && (
                                    accountForm.workerHours.map((info, index) => (
                                      <View key={index} style={styles.workerHour}>
                                        {info.working == true ? 
                                          <>
                                            <View style={{ opacity: info.working ? 1 : 0.1 }}>
                                              <Text style={styles.workerHourHeader}>Your hours on {info.header}</Text>
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
                                                <Text style={styles.workerHourHeader}><Text style={{ fontWeight: '300' }}>Not working on</Text> {info.header}</Text>

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
                                              <>
                                                <Text style={styles.workerHourHeader}><Text style={{ fontWeight: '300' }}>Taking {info.takeShift.name}'s shift for</Text> {info.header}</Text>

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
                                              </>
                                            : 
                                            <Text style={styles.workerHourHeader}><Text style={{ fontWeight: '300' }}>Not open on</Text> {info.header}</Text>
                                        }
                                      </View>
                                    ))
                                  )}

                                  {accountForm.errorMsg ? <Text style={styles.errorMsg}>{accountForm.errorMsg}</Text> : null}

                                  <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                    <View style={{ flexDirection: 'row' }}>
                                      <TouchableOpacity style={[styles.accountformSubmit, { opacity: accountForm.loading ? 0.3 : 1 }]} disabled={accountForm.loading} onPress={() => {
                                        accountHolders.forEach(function (info) {
                                          if (info.id == accountForm.id) {
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
                                              workerHours: info.hours, editHours: false,
                                              errorMsg: ""
                                            })
                                          }
                                        })
                                      }}>
                                        <Text style={styles.accountformSubmitHeader}>Cancel</Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity style={[styles.accountformSubmit, { opacity: accountForm.loading ? 0.3 : 1 }]} disabled={accountForm.loading} onPress={() => {
                                        if (accountForm.type == 'add') {
                                          addNewOwner()
                                        } else {
                                          updateTheOwner()
                                        }

                                        getAllAccounts()
                                      }}>
                                        <Text style={styles.accountformSubmitHeader}>{accountForm.type == 'add' ? 'Add' : 'Save'}</Text>
                                      </TouchableOpacity>
                                    </View>
                                  </View>
                                </>
                              }
                            </TouchableWithoutFeedback>
                          }
                        </KeyboardAvoidingView>
                      </ScrollView>

                      {getWorkersbox.show && (
                        <View style={styles.workersContainer}>
                          <TouchableOpacity style={styles.workersClose} onPress={() => setGetworkersbox({ ...getWorkersbox, show: false })}>
                            <AntDesign color="black" size={wsize(7)} name="closecircleo"/>
                          </TouchableOpacity>
                          {getWorkersbox.workers.map(info => (
                            <View key={info.key} style={styles.row}>
                              {info.row.map(worker => (
                                <TouchableOpacity key={worker.key} style={styles.worker} onPress={() => selectTheOtherWorker(worker.id)}>
                                  <View style={styles.workerProfile}>
                                    <Image 
                                      style={resizePhoto(worker.profile, wsize(20))} 
                                      source={worker.profile.name ? { uri: logo_url + worker.profile.name } : require("../../assets/profilepicture.jpeg")}
                                    />
                                  </View>
                                  <Text style={styles.workerUsername}>{worker.username}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          ))}
                        </View>
                      )}
                    </>
                  )}
                </>
              }
            </View>
          </View>
        </Modal>
      )}
			{showDisabledscreen && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.disabled}>
						<View style={styles.disabledContainer}>
              <Text style={styles.disabledHeader}>
                There is an update to the app{'\n\n'}
                Please wait a moment{'\n\n'}
                or tap 'Close'
              </Text>

              <TouchableOpacity style={styles.disabledClose} onPress={() => socket.emit("socket/business/login", userId, () => setShowdisabledscreen(false))}>
                <Text style={styles.disabledCloseHeader}>Close</Text>
              </TouchableOpacity>

              <ActivityIndicator size="large"/>
            </View>
					</SafeAreaView>
				</Modal>
			)}
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	main: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

	navs: { alignItems: 'center', height: '10%', width: '100%' },
  header: { fontSize: wsize(10), fontWeight: 'bold' },

	// body
	body: { height: '90%' },

	// client appointment & orders
	orderRequest: { borderRadius: 5, backgroundColor: 'white', marginHorizontal: 5, marginVertical: 2.5, padding: 10 },
	orderRequestRow: { flexDirection: 'row', justifyContent: 'space-between' },
	orderRequestHeader: { fontSize: wsize(4) },
	orderRequestQuantity: { fontSize: wsize(4), fontWeight: 'bold' },

	// client's schedule
	schedule: { alignItems: 'center', borderRadius: 5, backgroundColor: 'white', marginHorizontal: 5, marginVertical: 2.5 },
	scheduleRow: { flexDirection: 'row', justifyContent: 'space-between' },
	scheduleImageHolder: { borderRadius: wsize(20) / 2, margin: 5, overflow: 'hidden', width: wsize(20) },
	scheduleImage: { height: wsize(20), width: wsize(20) },
	scheduleHeader: { fontSize: wsize(4), fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
	scheduleActionsHeader: { fontSize: wsize(4), marginTop: 10, textAlign: 'center' },
	scheduleActions: { flexDirection: 'row', justifyContent: 'space-around' },
  column: { flexDirection: 'column', justifyContent: 'space-around' },
	scheduleAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, paddingVertical: 10, width: wsize(30) },
	scheduleActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	cartorderer: { backgroundColor: 'white', borderRadius: 5, flexDirection: 'row', justifyContent: 'space-around', margin: 10, padding: 5, width: wsize(100) - 20 },
	cartordererInfo: { alignItems: 'center' },
	cartordererUsername: { fontSize: wsize(5), fontWeight: 'bold', marginBottom: 10 },
	cartordererOrderNumber: { fontSize: wsize(7), fontWeight: 'bold', paddingVertical: 5 },
  cartordererActions: { flexDirection: 'row', justifyContent: 'space-around' },
	cartordererAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: wsize(30) },
	cartordererActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	bodyResult: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around' },
	bodyResultHeader: { fontSize: wsize(5), fontWeight: 'bold', paddingHorizontal: '10%', textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row' },
	bottomNavHeader: { color: 'black', fontSize: wsize(4), fontWeight: 'bold', paddingVertical: 5 },
	bottomNavButton: { backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
	bottomNavButtonHeader: { color: 'white', fontSize: wsize(4), fontWeight: 'bold', textAlign: 'center' },
  
	cancelRequestBox: { backgroundColor: 'white', height: '100%', width: '100%' },
	cancelRequestHeader: { fontFamily: 'Chilanka_400Regular', fontSize: wsize(6), marginHorizontal: 30, marginTop: 50, textAlign: 'center' },
	cancelRequestInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), height: 200, margin: '5%', padding: 10, width: '90%' },
	cancelRequestActions: { flexDirection: 'row', justifyContent: 'space-around' },
	cancelRequestTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: wsize(30) },
	cancelRequestTouchHeader: { fontSize: wsize(5), textAlign: 'center' },

	requiredBoxContainer: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
	requiredBox: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	requiredContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	requiredHeader: { fontFamily: 'Chilanka_400Regular', fontSize: wsize(6), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	requiredActions: { alignItems: 'center', justifyContent: 'space-around' },
	requiredAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: wsize(30) },
	requiredActionHeader: { fontSize: wsize(4), textAlign: 'center' },

  showInfoContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  showInfoBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-around', width: '80%' },
  showInfoClose: { alignItems: 'center', borderRadius: 20, borderStyle: 'solid', borderWidth: 2, marginVertical: 30 },
  showInfoHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
  showInfoPhonenumber: { fontSize: wsize(5), fontWeight: 'bold', marginHorizontal: 10, marginVertical: 8, textAlign: 'center' },
  workerInfoList: { width: '100%' },
  worker: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 30, width: '100%' },
  workerInfo: {  },
  workerInfoProfile: { borderRadius: 25, height: 50, overflow: 'hidden', width: 50 },
  workerInfoName: { color: 'black', textAlign: 'center' },
  workerTime: {  },
  workerTimeContainer: { flexDirection: 'row', marginBottom: 10 },
  dayHeader: {  },
  timeHeaders: { flexDirection: 'row' },
  timeHeader: { fontSize: wsize(4), fontWeight: 'bold' },

  moreOptionsContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  moreOptionsBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-around', width: '80%' },
  moreOptionsClose: { alignItems: 'center', borderRadius: 20, borderStyle: 'solid', borderWidth: 2, marginVertical: 30 },
  moreOptionTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: '90%' },
  moreOptionTouchHeader: { fontSize: 20, textAlign: 'center' },

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
  accountformSubmitHeader: { fontFamily: 'Chilanka_400Regular', fontSize: wsize(5) },

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
  workerTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5 },
  workerTouchHeader: { fontSize: wsize(7), textAlign: 'center' },
  
  deleteOwnerBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  deleteOwnerContainer: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-between', paddingVertical: 20, width: '80%' },
  deleteOwnerProfile: { borderRadius: wsize(40) / 2, height: wsize(40), overflow: 'hidden', width: wsize(40) },
  deleteOwnerHeader: { fontSize: wsize(5), fontWeight: 'bold', marginVertical: 30, textAlign: 'center' },
  deleteOwnerActionsHeader: { fontSize: wsize(6), fontWeight: 'bold', textAlign: 'center' },
  deleteOwnerActions: { flexDirection: 'row', justifyContent: 'space-around' },
  deleteOwnerAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 10, width: wsize(30) },
  deleteOwnerActionHeader: { fontSize: wsize(4), textAlign: 'center' },

  editInfoBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  editInfoContainer: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
  editInfoClose: { height: 30, width: 30 },

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
  
  receiveTypesBox: { alignItems: 'center', marginHorizontal: 10, marginTop: 20 },
  receiveTypesHeader: { fontWeight: 'bold' },
  receiveTypes: { flexDirection: 'row', justifyContent: 'space-between' },
  receiveType: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: 150 },
  receiveTypeHeader: { textAlign: 'center' },

	disabled: { backgroundColor: 'black', flexDirection: 'column', justifyContent: 'space-around', height: '100%', opacity: 0.8, width: '100%' },
  disabledContainer: { alignItems: 'center', width: '100%' },
  disabledHeader: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  disabledClose: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 50, padding: 10 },

  loading: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  column: { flexDirection: 'column', justifyContent: 'space-around' },
  errorMsg: { color: 'darkred', textAlign: 'center' }
})
