import { useEffect, useState, useCallback } from 'react'
import { 
  SafeAreaView, Platform, ScrollView, HorizontalScrollView, ActivityIndicator, Dimensions, 
  View, FlatList, Image, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, 
  Keyboard, StyleSheet, Modal, KeyboardAvoidingView
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKeepAwake } from 'expo-keep-awake'
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useFocusEffect, useIsFocused, CommonActions } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system'
import * as ImageManipulator from 'expo-image-manipulator'
import * as Speech from 'expo-speech'
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { BarCodeScanner } from 'expo-barcode-scanner';
import QRCode from 'react-native-qrcode-svg';
import Voice from '@react-native-voice/voice';
import { tr } from '../../assets/translate'
import { loginInfo, ownerSigninInfo, socket, logo_url, useSpeech, timeControl, tableUrl } from '../../assets/info'
import { getId, displayTime, resizePhoto, displayPhonenumber } from 'geottuse-tools'
import { 
  updateNotificationToken, verifyUser, updateLogins, addOwner, updateOwner, deleteOwner, getStylistInfo, 
  getOtherWorkers, getAccounts, getOwnerInfo, logoutUser, getWorkersTime, getAllWorkersTime, getWorkersHour, setUseVoice, 
  switchAccount, verifySwitchAccount
} from '../apis/owners'
import { getTables, getTableOrders, finishOrder, viewPayment, finishDining, getQrCode, orderMeal, viewTableOrders, addTable, removeTable, getTableBills, getOrderingTables } from '../apis/dining_tables'
import { getLocationProfile, getLocationHours, updateLocationHours, updateInformation, getLogins, updateAddress, updateLogo, setReceiveType, getDayHours } from '../apis/locations'
import { getMenus, removeMenu, addNewMenu } from '../apis/menus'
import { 
  cancelSchedule, doneService, getAppointments, getCartOrderers, 
  removeBooking, getAppointmentInfo, getReschedulingAppointments, 
  blockTime, salonChangeAppointment, pushAppointments
} from '../apis/schedules'
import { getProductInfo, removeProduct } from '../apis/products'
import { setWaitTime } from '../apis/carts'

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
	const [notificationPermission, setNotificationpermission] = useState(null);
	const [ownerId, setOwnerid] = useState(null)
  const [userType, setUsertype] = useState('')
	const [locationType, setLocationtype] = useState('')

	const [appointments, setAppointments] = useState({ list: [], loading: false })
  const [chartInfo, setChartinfo] = useState({ times: [], resetChart: 0, workers: [], workersHour: {}, dayDir: 0, date: {}, loading: false })
  const [scheduleOption, setScheduleoption] = useState({ 
    show: false, index: -1, id: "", type: "", remove: false, rebook: false, showRebookHeader: false, 
    client: { id: -1, name: "", cellnumber: "" }, 
    service: { id: -1, name: "" }, blocked: [], 
    reason: "", note: "", oldTime: 0, jsonDate: {}, confirm: false, 

    push: false, select: false, showSelectHeader: false,
    selectedIds: [], pushType: null, pushBy: null, pushFactors: [], selectedFactor: ""
  })
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

  const [speakInfo, setSpeakinfo] = useState({ orderNumber: "" })

  const [loaded, setLoaded] = useState(false)

	const [viewType, setViewtype] = useState('')

	const [showDisabledscreen, setShowdisabledscreen] = useState(false)
  const [alertInfo, setAlertinfo] = useState({ show: false, text: "" })
  const [showInfo, setShowinfo] = useState({ show: false, workersHours: [], locationHours: [] })

  const [showMoreoptions, setShowmoreoptions] = useState({ show: false, loading: false, infoType: '' })
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
    profile: { uri: '', name: '', size: { width: 0, height: 0 }}, editProfile: false, camType: 'front',
    daysInfo: { working: ['', '', '', '', '', '', ''], done: false, sameHours: null }, workerHours: [], workerHourssameday: null, editHours: false,
    loading: false,
    errorMsg: ''
  })

  const [locationInfo, setLocationinfo] = useState('')
  const [locationCoords, setLocationcoords] = useState({ longitude: null, latitude: null, longitudeDelta: null, latitudeDelta: null })
  const [storeName, setStorename] = useState('')
  const [phonenumber, setPhonenumber] = useState('')
  const [logo, setLogo] = useState({ uri: '', name: '', size: { width: 0, height: 0 }, loading: false })
  const [locationReceivetype, setLocationreceivetype] = useState('')
  const [useVoice, setUsevoice] = useState(false)

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
  const [showPayment, setShowpayment] = useState({ show: false, tableId: "", id: -1, orders: [], paymentInfo: { show: false, subTotalcost: "", totalCost: "" }})
  const [showProductinfo, setShowproductinfo] = useState({
    show: false, 
    id: -1, name: '', note: '', image: '', sizes: [], quantities: [], percents: [], price: 0, 
    quantity: 0, cost: 0, 
    errorMsg: "",
    loading: false
  })
  const [showCurrentorders, setShowcurrentorders] = useState({ show: false, orders: [] })
  const [showTableorders, setShowtableorders] = useState({ show: false, orders: [] })
  const [orderSentalert, setOrdersentalert] = useState(false)
  const [showQr, setShowqr] = useState({ show: false, table: "", codeText: "" })
  const [switchAccountauth, setSwitchaccountauth] = useState({ show: false, type: '', password: '' })

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
      experienceId: "@robogram/serviceapp-business"
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

  const getTheLocationProfile = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
    const usertype = await AsyncStorage.getItem("userType")
		const locationid = await AsyncStorage.getItem("locationid")
    const tableInfo = JSON.parse(await AsyncStorage.getItem("table"))
		const data = { locationid }

    setUsertype(usertype)

		getLocationProfile(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { name, logo, type, receiveType, hours } = res.info
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
						setStorename(name)
            setPhonenumber(res.info.phonenumber)
            setLogo({ ...logo, uri: logo.name ? logo_url + logo.name : "", size: { width: logo.width, height: logo.height }})
            setLocationtype(type)
            setLocationreceivetype(receiveType)
            setLocationhours(hours)
            setShowinfo({ ...showInfo, locationHours })
            setHoursrange(hours)

						if (type == 'store' || type == 'restaurant') {
              if (type == 'store') {
                getAllCartOrderers()
              } else {
                switch (usertype) {
                  case "orderer":
                    if (tableInfo) {
                      setTable({ ...table, id: tableInfo.id, name: tableInfo.name })
                      getAllMenus()
                    } else {
                      getAllTables()
                    }

                    break;
                  case "kitchen":
                    getAllOrderingTables(true)

                    break;
                  case "owner":
                    setLoaded(true)

                    break;
                  default:
                }
              }
						} else {
              getListAppointments()
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
          setUsevoice(res.useVoice)
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

  const getTheWorkersHour = async(getlist) => {
    const locationid = await AsyncStorage.getItem("locationid")
    const data = { locationid, ownerid: null }
    let jsonDate = { ...chartInfo.date }

    getWorkersHour(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { workersHour } = res

          for (let worker in workersHour) {
            for (let info in workersHour[worker]) {
              if (info != "scheduled" && info != "profileInfo" && !getlist) { // after rebooking or block time or cancel booking
                let { begin, end, working } = workersHour[worker][info]

                workersHour[worker][info]["beginWork"] = jsonDateToUnix({ ...jsonDate, "hour": begin["hour"], "minute": begin["minute"] })
                workersHour[worker][info]["endWork"] = jsonDateToUnix({ ...jsonDate, "hour": end["hour"], "minute": end["minute"] })
              } else if (info == "scheduled") {
                let scheduled = workersHour[worker][info]
                let newScheduled = {}

                for (let info in scheduled) {
                  let splitInfo = info.split("-")
                  let time = splitInfo[0]
                  let status = splitInfo[1]

                  newScheduled[jsonDateToUnix(JSON.parse(time)) + "-" + status] = scheduled[info]
                }

                workersHour[worker][info] = newScheduled
              }
            }
          }

          if (getlist) {
            setScheduleoption({
              ...scheduleOption,
              show: false, index: -1, id: "", type: "", remove: false, rebook: false, 
              client: { id: -1, name: "", cellnumber: "" }, worker: { id: -1 }, 
              service: { id: -1, name: "" }, blocked: [], reason: "", note: "", oldTime: 0, jsonDate: {}, confirm: false
            })
          }

          setChartinfo({ 
            ...chartInfo, 
            resetChart: getlist == true ? chartInfo.resetChart + 1 : chartInfo.resetChart, 
            workersHour 
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }

	const getListAppointments = async() => {
    setViewtype("appointments_list")
    setAppointments({ ...appointments, loading: true })

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
					setAppointments({ ...appointments, list: res.appointments, loading: false })
          setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
				}
			})
	}
  const getAppointmentsChart = async(dayDir, dir) => {
    setViewtype("appointments_chart")
    setChartinfo({ ...chartInfo, loading: true })

    const locationid = await AsyncStorage.getItem("locationid")
    const today = new Date(), pushtime = 1000 * (60 * 15), newWorkershour = {...chartInfo.workersHour}
    let chart, date = new Date(today.getTime())

    date.setDate(today.getDate() + dayDir)

    let jsonDate, newWorkersTime = {}, hourInfo = workersHoursinfo[days[date.getDay()].substr(0, 3)]

    if (hourInfo != undefined) {
      hourInfo = hoursInfo[days[date.getDay()].substr(0, 3)]

      let closedtime = Date.parse(days[date.getDay()] + " " + months[date.getMonth()] + ", " + date.getDate() + " " + date.getFullYear() + " " + hourInfo["closeHour"] + ":" + hourInfo["closeMinute"])
      let now = Date.parse(days[today.getDay()] + " " + months[today.getMonth()] + ", " + today.getDate() + " " + today.getFullYear() + " " + today.getHours() + ":" + today.getMinutes())
      let day = days[date.getDay()].substr(0, 3), working = false

      jsonDate = {"day":day,"month":months[date.getMonth()],"date":date.getDate(),"year":date.getFullYear()}

      for (let worker in newWorkershour) {
        for (let info in newWorkershour[worker]) {
          if (info == day && newWorkershour[worker][info]["working"] == true && working == false) {
            let { end } = newWorkershour[worker][day]
            let endWork = jsonDateToUnix({ ...jsonDate, "hour": end["hour"], "minute": end["minute"] })

            working = Date.now() < endWork
          }
        }
      }

      if (dir == null && ((now + 900000) >= closedtime || working == false)) {
        getAppointmentsChart(dayDir + 1, "right")
      } else {
        const data = { locationid, jsonDate }

        for (let worker in newWorkershour) {
          for (let info in newWorkershour[worker]) {
            if (info == day && newWorkershour[worker][info]["working"] == true && working == false) {
              working = true
            } else if (info != "scheduled" && info != "profileInfo") {
              let { begin, end, working } = workersHour[worker][day]

              newWorkershour[worker][day]["beginWork"] = jsonDateToUnix({ ...jsonDate, "hour": begin["hour"], "minute": begin["minute"] })
              newWorkershour[worker][day]["endWork"] = jsonDateToUnix({ ...jsonDate, "hour": end["hour"], "minute": end["minute"] })
            }
          }
        }

        getDayHours(data)
          .then((res) => {
            if (res.status == 200) {
              return res.data
            }
          })
          .then((res) => {
            if (res) {
              const { opentime, closetime, workers } = res
              let times = [], chart = {}, openhour = parseInt(opentime["hour"]), openminute = parseInt(opentime["minute"])
              let closehour = parseInt(closetime["hour"]), closeminute = parseInt(closetime["minute"])
              let openStr = jsonDate["month"] + " " + jsonDate["date"] + ", " + jsonDate["year"] + " " + openhour + ":" + openminute
              let closeStr = jsonDate["month"] + " " + jsonDate["date"] + ", " + jsonDate["year"] + " " + closehour + ":" + closeminute
              let openTimeStr = Date.parse(openStr), closeTimeStr = Date.parse(closeStr), calcTimeStr = openTimeStr
              let currenttime = Date.now(), key = 0

              while (calcTimeStr < closeTimeStr - pushtime) {
                calcTimeStr += pushtime

                let timestr = new Date(calcTimeStr)
                let hour = timestr.getHours()
                let minute = timestr.getMinutes()
                let period = hour < 12 ? "AM" : "PM"
                let timeDisplay = (
                  hour <= 12 ? 
                    hour == 0 ? 12 : hour
                    :
                    hour - 12
                  )
                  + ":" + 
                  (minute < 10 ? '0' + minute : minute) + " " + period
                let timepassed = currenttime > calcTimeStr

                jsonDate = { ...jsonDate, day: days[date.getDay()], hour, minute }

                times.push({
                  key: "time-" + key + "-" + dayDir,
                  timeDisplay, time: calcTimeStr, jsonDate,
                  timepassed
                })

                key += 1
              }

              setChartinfo({ 
                ...chartInfo, times, workers, 
                dayDir, date: jsonDate, 
                workersHour: newWorkershour,
                loading: false 
              })

              setLoaded(true)
            }
          })
          .catch((err) => {
            if (err.response && err.response.status == 400) {
              const { errormsg, status } = err.response.data
            }
          })
      }
    } else {
      if (
          dir == "right" 
          || 
          dir == null // at first render
      ) {
        getAppointmentsChart(dayDir + 1, dir)
      } else {
        getAppointmentsChart(dayDir - 1, dir)
      }
    }
  }
  const timeStyle = (info, worker, type) => {
    const { blocked, rebook } = scheduleOption, currDay = chartInfo.date.day.substr(0, 3)
    const { time, timepassed, jsonDate } = info
    const scheduled = workersHour[worker]["scheduled"]
    const { beginWork, endWork, working } = workersHour[worker][currDay]
    let bgColor = 'transparent', opacity = 1, fontColor = 'black', disabled = false, header = ""
    let style

    switch (type) {
      case "bg":
        if (timepassed || !(time >= beginWork && time <= endWork && working)) {
          if (rebook) { // in rebook mode
            if (time + "-co" in scheduled) { // time is confirmed
              bgColor = 'black'
            } else if (time + "-bl" in scheduled) { // time is blocked
              if (JSON.stringify(blocked).includes(JSON.stringify(jsonDate))) { // time blocked belongs to schedule

              } else {
                bgColor = 'grey'
              }
            }
          } else {
            if (time + "-bl" in scheduled) {
              bgColor = 'grey'
            } else if (time + "-co" in scheduled) {
              bgColor = 'black'
            }
          }
        } else {
          if (rebook) {
            if (time + "-co" in scheduled) {
              bgColor = "black"
            } else if (time + "-bl" in scheduled) {
              if (JSON.stringify(blocked).includes("\"id\":" + scheduled[time + "-bl"])) { // time blocked belongs to schedule

              } else {
                bgColor = "grey"
              }
            }
          } else {
            if (time + "-co" in scheduled) {
              bgColor = "black"
            } else if (time + "-bl" in scheduled) {
              bgColor = "grey"
            }
          }
        }

        break;
      case "opacity":
        if (timepassed || !(time >= beginWork && time <= endWork && working)) {
          if (rebook) { // in rebook mode
            if (time + "-co" in scheduled) { // time is confirmed

            } else if (time + "-bl" in scheduled) { // time is blocked
              if (JSON.stringify(blocked).includes(JSON.stringify(jsonDate))) {
                opacity = 0.3
              } else {

              }
            } else {
              opacity = 0.3
            }
          } else {
            if (!(time + "-co" in scheduled) && !(time + "-bl" in scheduled)) {
              opacity = 0.3
            }
          }
        } else {

        }

        break;
      case "fontColor":
        if (timepassed || !(time >= beginWork && time <= endWork && working)) {
          if (rebook) { // in rebook mode
            if (time + "-co" in scheduled) { // time is confirmed
              fontColor = 'white'
            } else if (time + "-bl" in scheduled) { // time is blocked

            }
          } else {
            if (time + "-co" in scheduled) {
              fontColor = 'white'
            }
          }
        } else {
          if (time + "-co" in scheduled) {
            fontColor = 'white'
          }
        }

        break;
      case "disabled":
        if (
          (
            timepassed 
            || 
            !(time >= beginWork && time <= endWork && working)
          ) 
          && 
          !(time + "-co" in scheduled || time + "-bl" in scheduled)
        ) {
          disabled = true
        }

        break;
      case "header":
        if (rebook) {
          if (time + "-co" in scheduled || time + "-w" in scheduled) {
            if (time + "-co" in scheduled) {
              header = "(" + tr.t("main.chart.booked") + ")"
            } else {
              header = "(" + tr.t("main.chart.walkIn") + ")"
            }
          } else if (time + "-bl" in scheduled) {
            if (JSON.stringify(blocked).includes("\"id\":" + scheduled[time + "-bl"])) { // time blocked belongs to schedule

            } else {
              header = "(" + tr.t("main.chart.stillBusy") + ")"
            }
          }
        } else {
          if (time + "-co" in scheduled) {
            header = "(" + tr.t("main.chart.booked") + ")"
          } else if (time + "-bl" in scheduled) {
            header = "(" + tr.t("main.chart.stillBusy") + ")"
          }
        }

        break;
      default:

    }

    style = (type == "bg" && bgColor)
            ||
            (type == "opacity" && opacity)
            ||
            (type == "fontColor" && fontColor)
            ||
            (type == "disabled" && disabled)
            ||
            (type == "header" && header)

    return style
  }
  const pushTheAppointments = (select) => {
    let compute = false

    if (scheduleOption.select || select) {
      if (!scheduleOption.select) {
        setScheduleoption({ ...scheduleOption, show: true, showSelectHeader: true, selectedIds: [] })

        setTimeout(function () {
          setScheduleoption({ ...scheduleOption, show: false, select: true, showSelectHeader: false })
        }, 1000)
      } else if (!scheduleOption.push) {
        setScheduleoption({ ...scheduleOption, show: true, push: true })
      } else {
        compute = true
      }
    } else {
      if (!scheduleOption.push) {
        setScheduleoption({ ...scheduleOption, show: true, push: true, selectedIds: [] })
      } else {
        compute = true
      }
    }

    if (compute) {
      const { pushBy, selectedIds, selectedFactor } = scheduleOption
      const data = { date: chartInfo.date, selectedIds }

      getReschedulingAppointments(data)
        .then((res) => {
          if (res.status == 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            const schedules = res.schedules
            let pushMilli = 0, reschedules = {}
            let unix, newDate, day, month, date, year
            let hour, minute, time

            switch (pushBy) {
              case "days":
                pushMilli = 86400000 * selectedFactor

                break;
              case "hours":
                pushMilli = 3600000 * selectedFactor

                break;
              case "minutes":
                pushMilli = 60000 * selectedFactor

                break;
              default:
            }

            schedules.forEach(function (info) {
              unix = Date.parse(info["day"] + " " + info["month"] + " " + info["date"] + " " + info["year"] + " " + info["hour"] + ":" + info["minute"]) + pushMilli

              newDate = new Date(unix)
              day = days[newDate.getDay()]
              month = months[newDate.getMonth()]
              date = newDate.getDate()
              year = newDate.getFullYear()
              hour = newDate.getHours()
              minute = newDate.getMinutes()

              reschedules[info.id] = { unix, day, month, date, year, hour, minute }

              info.blockedSchedules.forEach(function (info) {
                time = JSON.parse(info.time)

                unix = Date.parse(time["day"] + " " + time["month"] + " " + time["date"] + " " + time["year"] + " " + time["hour"] + ":" + time["minute"]) + pushMilli

                newDate = new Date(unix)
                day = days[newDate.getDay()]
                month = months[newDate.getMonth()]
                date = newDate.getDate()
                year = newDate.getFullYear()
                hour = newDate.getHours()
                minute = newDate.getMinutes()

                reschedules[info.id] = { unix, day, month, date, year, hour, minute }
              })
            })

            let data = { schedules: reschedules, type: "pushAppointments" }

            pushAppointments(data)
              .then((res) => {
                if (res.status == 200) {
                  return res.data
                }
              })
              .then((res) => {
                if (res) {
                  data = { ...data, receiver: res.receiver, rebooks: res.rebooks }
                  
                  socket.emit("socket/business/pushAppointments", data, () => {
                    setScheduleoption({ 
                      ...scheduleOption, 
                      show: false, select: false, push: false, pushType: null, pushBy: null, selectedIds: [], selectedFactor: "", pushFactors: [] 
                    })
                    getTheWorkersHour(false)
                  })
                }
              })
          }
        })
    }
  }
  const blockTheTime = (workerid, jsonDate) => {
    const newWorkershour = {...chartInfo.workersHour}
    const data = { workerid, jsonDate, time: jsonDateToUnix(jsonDate) }

    blockTime(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          getTheWorkersHour(false)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const showScheduleOption = (id, type, index, action) => {
    getAppointmentInfo(id)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { name, note, serviceId, time, client, blocked } = res
          const unix = jsonDateToUnix(time)

          blocked.forEach(function (info) {
            info["unix"] = jsonDateToUnix(JSON.parse(info["time"]))
            info["time"] = JSON.parse(info["time"])
          })

          if (action == "remove") {
            if (!scheduleOption.remove) {
              setScheduleoption({ 
                ...scheduleOption, 
                show: true, id, type, index, remove: true, 
                service: { id: serviceId ? serviceId : -1, name }, 
                client, blocked, note, oldTime: unix, jsonDate: time
              })
            } else {
              setScheduleoption({ ...scheduleOption, remove: false })
            }
          } else {
            setScheduleoption({ ...scheduleOption, show: true, showRebookHeader: true })

            if (!scheduleOption.rebook) {
              setTimeout(function () {
                setScheduleoption({ 
                  ...scheduleOption, 
                  rebook: true, showRebookHeader: false, id, type, index, 
                  service: { id: serviceId ? serviceId : -1, name }, 
                  client, blocked, note, oldTime: unix, jsonDate: time
                })
              }, 500)
            } else {
              setScheduleoption({ ...scheduleOption, rebook: false })
            }
          }
        }
      })
  }
  const rebookSchedule = async(time, jsonDate, worker) => {
    const { id, client, service, blocked, oldTime, note } = scheduleOption
    const locationid = await AsyncStorage.getItem("locationid")

    blocked.forEach(function (blockInfo, index) {
      blockInfo["newTime"] = unixToJsonDate(time + (blockInfo.unix - oldTime))
      blockInfo["newUnix"] = (time + (blockInfo.unix - oldTime)).toString()
    })

    let data = { 
      id, // id for socket purpose (updating)
      clientid: client.id, 
      workerid: worker, 
      locationid, serviceid: service.id ? service.id : -1, 
      serviceinfo: service.name ? service.name : "",
      time: jsonDate, note, 
      timeDisplay: displayTime(jsonDate), 
      type: "salonChangeAppointment",
      blocked
    }

    salonChangeAppointment(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          if (res.receiver) {
            data = { 
              ...data, 
              receiver: res.receiver, time, worker: res.worker
            }

            socket.emit("socket/salonChangeAppointment", data, () => {
              setScheduleoption({ 
                ...scheduleOption, 
                show: false, index: -1, id: "", type: "", remove: false, rebook: false, 
                client: { id: -1, name: "", cellnumber: "" }, worker: { id: -1 }, 
                service: { id: -1, name: "" }, blocked: [], reason: "", note: "", 
                oldTime: 0, jsonDate: {}, confirm: false
              })
            })
          } else {
            setScheduleoption({ ...scheduleOption, show: false, rebook: false })
          }

          getTheWorkersHour(false)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          setAlertinfo({ ...alertInfo, show: true, text: tr.t("main.hidden.alert.schedulingConflict") })

          setTimeout(function () {
            setAlertinfo({ ...alertInfo, show: false, text: "" })
            setScheduleoption({ ...scheduleOption, rebook: false })
          }, 1000)
        }
      })
  }
  const speakToWorker = async(data) => {
    let message

    if (data.type == "makeAppointment" || data.type == "remakeAppointment" || data.type == "cancelRequest") {
      const { name, time, worker } = data.speak
      const { id, username } = worker

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

      message += " for " + name + " " + displayTime(time) + " with stylist: " + username

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
    if (useVoice) {
      await Voice.start('en-US')

      setTimeout(function () {
        stopSpeech()
      }, 5000)
    }
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
  const getAllTableBills = async() => {
    const locationid = await AsyncStorage.getItem("locationid")

    getTableBills(locationid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setTablebills(res.tables)
          setViewtype('tableorders')
          setTableviewtype('bills')
          setLoaded(true)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getAllOrderingTables = async(show) => {
    const locationid = await AsyncStorage.getItem("locationid")

    getOrderingTables(locationid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setTableorders(res.tables)
          setViewtype('tableorders')
          
          if (show) setTableviewtype('orders')

          setLoaded(true)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
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
          setMenuinfo({ ...menuInfo, list: res.list })
          getTheTable()
          setLoaded(true)
        }
      })
  }
  const getAllTables = async() => {
    const locationid = await AsyncStorage.getItem("locationid")

    getTables(locationid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }  
      })
      .then((res) => {
        if (res) {
          const tablesList = res.tables
          const newTables = []
          let row = []

          tablesList.forEach(function (tableInfo) {
            row.push(tableInfo)

            if (row.length == 3) {
              newTables.push({ key: "table-" + newTables.length, row })
              row = []
            }
          })

          if (row.length > 0) {
            newTables.push({ key: "table-" + newTables.length, row })
          }

          setTables(newTables)
          setLoaded(true)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const showQrCode = async(id) => {
    const locationid = await AsyncStorage.getItem("locationid")

    getQrCode(id)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setShowqr({ ...showQr, show: true, table: res.name, codeText: tableUrl + id })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data

          
        }
      })
  }
  const getTheTable = async() => {
    const tableInfo = JSON.parse(await AsyncStorage.getItem("table"))

    getQrCode(tableInfo.name)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setNumtableorders(res.numOrders)
        }
      })
  }
  const selectDiningTable = tableId => {
    getQrCode(tableId)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const tableInfo = JSON.stringify({ id: res.name, name: tableId })

          setTable({ ...table, id: res.name, name: tableId })

          AsyncStorage.setItem("table", tableInfo)

          getAllMenus()
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const displayListItem = info => {
    return (
      <TouchableOpacity style={styles.item} onPress={() => getMealInfo(info.id)}>
        <View style={[styles.column, { width: '33.3%' }]}>
          {info.image.name && (
            <View style={styles.itemImageHolder}>
              <Image style={[styles.itemImage, resizePhoto(info.image, 50)]} source={{ uri: logo_url + info.image.name }}/> 
            </View>
          )}
          <Text style={styles.itemHeader}>
            {info.number ? info.number + "." : ""}
            {info.number && '\n'}
            {info.name}
          </Text>
          <Text style={styles.itemMiniHeader}>{info.description}</Text>
        </View>

        <View style={{ width: '33.3%' }}>
          {info.price ? 
            <View style={styles.column}><Text style={styles.itemPrice}>$ {info.price} (1 size)</Text></View>
            :
            <>
              {info.sizes.length > 0 && info.sizes.map(size => <Text key={size.key} style={styles.itemPrice}>{size.name}: ${size.price}</Text>)}
              {info.quantities.length > 0 && info.quantities.map(quantity => <Text key={quantity.key} style={styles.itemPrice}>{quantity.input}: ${quantity.price}</Text>)}
            </>
          }

          {info.percents.map(percent => <Text key={percent.key} style={styles.itemPrice}>{percent.input}: ${percent.price}</Text>)}
        </View>

        <View style={styles.itemActions} style={{ width: '33.3%' }}>
          <View style={styles.column}>
            <TouchableOpacity style={styles.itemAction} onPress={() => getMealInfo(info.id)}>
              <Text style={styles.itemActionHeader}>Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    )
  }
  const getMealInfo = id => {
    getProductInfo(id)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          let { cost, name, price, productImage, sizes, quantities, percents, quantity } = res.productInfo
          let newCost = cost

          if (sizes.length == 1) {
            sizes[0].selected = true
            newCost += parseFloat(sizes[0].price)
          }

          if (quantities.length == 1) {
            quantities[0].selected = true
            newCost += parseFloat(quantities[0].price)
          }

          setShowproductinfo({
            ...showProductinfo,
            show: true, 
            id, cost: newCost, name, image: productImage, 
            sizes, quantities, percents, price, quantity
          })
        }
      })
  }
  const selectOption = (index, option) => {
    let newCost = showProductinfo.cost, newOptions

    switch (option) {
      case "size":
        newOptions = [...showProductinfo.sizes]

        newOptions.forEach(function (option) {
          if (option.selected) {
            option.selected = false
            newCost -= parseFloat(option.price)
          }
        })
        newOptions[index].selected = true
        newCost = showProductinfo.quantity * parseFloat(newOptions[index].price)

        setShowproductinfo({ ...showProductinfo, sizes: newOptions, cost: newCost, errorMsg: "" })

        break;
      case "quantity":
        newOptions = [...showProductinfo.quantities]

        newOptions.forEach(function (option) {
          if (option.selected) {
            option.selected = false
            newCost -= parseFloat(option.price)
          }
        })
        newOptions[index].selected = true
        newCost = showProductinfo.quantity * parseFloat(newOptions[index].price)

        setShowproductinfo({ ...showProductinfo, quantities: newOptions, cost: newCost, errorMsg: "" })

        break;
      case "percent":
        newOptions = [...showProductinfo.percents]

        newOptions.forEach(function (option) {
          if (option.selected) {
            option.selected = false
            newCost -= parseFloat(option.price)
          }
        })
        newOptions[index].selected = true
        newCost = showProductinfo.quantity * parseFloat(newOptions[index].price)

        setShowproductinfo({ ...showProductinfo, percents: newOptions, cost: newCost, errorMsg: "" })

        break;
      default:
    }
  }
  const changeQuantity = action => {
    let newQuantity = showProductinfo.quantity
    let newCost = 0

    newQuantity = action === "+" ? newQuantity + 1 : newQuantity - 1

    if (newQuantity < 1) {
      newQuantity = 1
    }

    if (showProductinfo.price) {
      newCost += newQuantity * parseFloat(showProductinfo.price)
    } else {
      if (showProductinfo.sizes.length > 0) {
        showProductinfo.sizes.forEach(function (size) {
          if (size.selected) {
            newCost += newQuantity * parseFloat(size.price)
          }
        })
      } else {
        showProductinfo.quantities.forEach(function (quantity) {
          if (quantity.selected) {
            newCost += newQuantity * parseFloat(quantity.price)
          }
        })
      }
    }

    setShowproductinfo({ ...showProductinfo, quantity: newQuantity, cost: newCost })
  }
  const viewTheTableOrders = async() => {
    const tableInfo = JSON.parse(await AsyncStorage.getItem("table"))

    viewTableOrders(tableInfo.name)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setShowtableorders({ ...showTableorders, show: true, orders: res.orders })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const addToOrders = () => {
    setShowproductinfo({ ...showProductinfo, loading: true })

    let { id, name, cost, price, sizes, quantities, percents, image, quantity, note } = showProductinfo
    const newOrders = [...showCurrentorders.orders]
    let sizeRequired = sizes.length > 0, quantityRequired = quantities.length > 0, sizeSelected = "", quantitySelected = ""
    let specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/, orderKey = ""

    let newCost = 0

    if (price) {
      newCost = parseFloat(price) * quantity
    } else {
      sizes.forEach(function (info) {
        if (info.selected) {
          newCost += parseFloat(info.price) * quantity
          sizeSelected = info.name
        }
      })

      quantities.forEach(function (info) {
        if (info.selected) {
          newCost += parseFloat(info.price) * quantity
          quantitySelected = info.input
        }
      })
    }

    percents.forEach(function (info) {
      if (info.selected) {
        newCost += parseFloat(info.price) * quantity
      }
    })

    if (price || ((sizeRequired && sizeSelected) || (quantityRequired && quantitySelected))) {
      newCost = newCost.toFixed(2)

      if (newCost.toString().split(".")[1].length < 2) {
        newCost = newCost + "0"
      }

      while (orderKey == "" || JSON.stringify(newOrders).includes(orderKey)) {
        orderKey = getId()
      }

      newOrders.unshift({
        key: orderKey,
        productId: id,
        name, price, sizes, quantities, percents,
        image, quantity, note,
        cost: newCost
      })

      AsyncStorage.setItem("orders", JSON.stringify(newOrders))

      setShowcurrentorders({ ...showCurrentorders, orders: newOrders })
      setShowproductinfo({ ...showProductinfo, show: false, id: -1, loading: false })
    } else {
      setShowproductinfo({ ...showProductinfo, errorMsg: "Please select a " + (sizeRequired ? "size" : "quantity") })
    }
  }
  const sendOrders = async() => {
    const tableInfo = JSON.parse(await AsyncStorage.getItem("table"))
    const newOrders = [...showCurrentorders.orders]
    let sizes = [], quantities = [], percents = []

    newOrders.forEach(function (order) {
      order.sizes.forEach(function (info) {
        if (info.selected) {
          sizes.push(info.name)
        }
      })

      order.quantities.forEach(function (info) {
        if (info.selected) {
          quantities.push(info.input)
        }
      })

      order.percents.forEach(function (info) {
        if (info.selected) {
          percents.push(info.input)
        }
      })

      order.sizes = sizes
      order.quantities = quantities
      order.percents = percents

      sizes = []
      quantities = []
      percents = []
    })

    let data = { orders: JSON.stringify(newOrders), tableid: tableInfo.name }

    orderMeal(data)
      .then((res) => {
        if (res.status === 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          data = { ...data, receiver: res.receiver }
          socket.emit("socket/orderMeal", data, () => {
            setShowcurrentorders({ ...showCurrentorders, show: false, orders: [] })
            setOrdersentalert(true)

            setTimeout(function () {
              setOrdersentalert(false)

              AsyncStorage.setItem("orders", "[]")
              getTheTable()
            }, 1000)
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const deleteOrder = index => {
    const newOrders = [...showCurrentorders.orders]

    newOrders.splice(index, 1)

    AsyncStorage.setItem("orders", JSON.stringify(newOrders))

    setShowcurrentorders({ 
      ...showCurrentorders, 
      show: newOrders.length > 0,
      orders: newOrders 
    })
  }
  const displayList = info => {
    let { id, image, number = "", name, list, show = true, parentId = "" } = info

    return (
      <View>
        {name ? 
          <View style={[styles.menu, { backgroundColor: parentId ? 'white' : 'transparent' }]}>
            <TouchableOpacity style={styles.menuRow} onPress={() => {
              const newList = [...menuInfo.list]

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

              setMenuinfo({ ...menuInfo, list: newList })
            }}>
              {image.name && (
                <View style={styles.menuImageHolder}>
                  <Image style={[styles.menuImage, resizePhoto(image, 50)]} source={{ uri: logo_url + image.name }}/>
                </View>
              )}

              <View style={styles.column}><Text style={styles.menuName}>{name} (Menu)</Text></View>
              <View style={[styles.column, { marginLeft: 20 }]}><AntDesign name={show ? "arrowup" : "arrowdown"} size={wsize(5)}/></View>
            </TouchableOpacity>
            {list.length > 0 && list.map((listInfo, index) => (
              <View key={"list-" + index}>
                {show && (
                  listInfo.listType == "list" ? 
                    displayList({ id: listInfo.id, number: listInfo.number, name: listInfo.name, image: listInfo.image, list: listInfo.list, show: listInfo.show, parentId: listInfo.parentId })
                    :
                    <View>{displayListItem(listInfo)}</View>
                )}
              </View>
            ))}
          </View>
          :
          list.map((listInfo, index) => (
            <View key={"list-" + index}>
              {show && (
                listInfo.listType == "list" ? 
                  displayList({ id: listInfo.id, number: listInfo.number, name: listInfo.name, image: listInfo.image, list: listInfo.list, show: listInfo.show, parentId: listInfo.parentId })
                  :
                  <View>{displayListItem(listInfo)}</View>
              )}
            </View>
          ))
        }
      </View>
    )
  }
  const finishTheOrder = (orderid, id) => {
    const newTableorders = [...tableOrders]
    const data = { orderid, id }

    finishOrder(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          getAllOrderingTables(false)
        }
      })
  }
  const viewThePayment = id => {
    viewPayment(id)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const newPaymentinfo = {...showPayment.paymentInfo}

          newPaymentinfo.show = true
          newPaymentinfo.subTotalcost = res.subTotalCost
          newPaymentinfo.totalCost = res.totalCost

          setShowpayment({ ...showPayment, show: true, tableId: res.name, id, orders: res.orders, paymentInfo: newPaymentinfo })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data

          switch (status) {
            case "unfinishedOrders":
              setAlertinfo({ ...alertInfo, show: true, text: tr.t("main.hidden.alert.unfinishedOrders") })

              break;
            case "noOrders":
              setAlertinfo({ ...alertInfo, show: true, text: tr.t("main.hidden.alert.noOrders") })
          }

          setTimeout(function () {
            setAlertinfo({ ...alertInfo, show: false, text: "" })
          }, 1000)
        }
      })
  }
  const finishTheDining = () => {
    const time = new Date(Date.now())
    const day = time.getDay(), month = time.getMonth(), date = time.getDate(), year = time.getFullYear()
    const hour = time.getHours(), minute = time.getMinutes()
    const timeStr = { day, month, date, year, hour, minute }

    const data = { id: showPayment.id, time: timeStr }

    finishDining(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setShowpayment({ ...showPayment, show: false, orders: [], paymentInfo: { show: false, subTotalcost: "", totalCost: "" }})
          getAllTableBills(false)
        }
      })
  }

  const removeTheBooking = () => {
    const { id, workerid, date, reason } = scheduleOption
    let data = { scheduleid: id, reason, type: "cancelSchedule" }

    removeBooking(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          data = { ...data, receiver: res.receiver }

          socket.emit("socket/business/cancelSchedule", data, () => {
            setScheduleoption({ ...scheduleOption, confirm: true })
            getTheWorkersHour(false)

            setTimeout(function () {
              setScheduleoption({ 
                ...scheduleOption, 
                show: false, index: -1, id: "", type: "", remove: false, rebook: false, 
                client: { id: -1, name: "", cellnumber: "" }, worker: { id: -1 }, 
                service: { id: -1, name: "" }, blocked: [], reason: "", note: "", 
                oldTime: 0, jsonDate: {}, confirm: false
              })
            }, 2000)
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
	const cancelTheSchedule = () => {
    const { reason, id, index } = scheduleOption
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
            switch (viewType) {
              case "appointments_list":
                const { list } = {...appointments}

                list.splice(index, 1)

                setAppointments({ ...appointments, list })

                break
              default:
            }

            setScheduleoption({ ...scheduleOption, show: false, remove: false, type: "", reason: "", id: 0, index: 0 })
            getTheWorkersHour(false)
          })        
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
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
          const { list } = {...appointments}
          let data = { id, type: "doneService", receiver: res.receiver }

          list.splice(index, 1)

          socket.emit("socket/doneService", data, () => {
            setAppointments({ ...appointments, list })
            getTheWorkersHour(false)
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
				newItems = {...appointments}

        newItems.list.forEach(function (item, index) {
          if (item.id == id) {
            newItems.list.splice(index, 1)
          }
        })

				break
			case "cartOrderers":
				newItems = [...cartOrderers]

        newItems.forEach(function (item, index) {
          if (item.id == id) {
            newItems.splice(index, 1)
          }
        })

				break
			default:
		}

		switch (type) {
			case "appointments":
				setAppointments({ ...appointments, list: newItems })

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

            props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "auth" }]}));
          })
        }
      })
  }
	const startWebsocket = () => {
		socket.on("updateSchedules", data => {
      if (
        data.type == "makeAppointment" || 
        data.type == "cancelRequest" || 
        data.type == "remakeAppointment" || 
        data.type == "bookWalkIn"
      ) {
        getTheWorkersHour(false)

        if (viewType == "appointments_list") {
          getListAppointments()
        }
          
        if (data.type != "bookWalkIn") speakToWorker(data)
      }
		})
		socket.on("updateOrders", data => {
      getAllCartOrderers()

      speakToWorker(data)
    })
    socket.on("updateTableOrders", () => {
      getAllOrderingTables(false)
    })
		socket.io.on("open", () => {
			if (ownerId != null) {
				socket.emit("socket/business/login", ownerId, () => setShowdisabledscreen(false))
			}
		})
		socket.io.on("close", () => ownerId != null ? setShowdisabledscreen(true) : {})

    return () => {
      socket.off("updateSchedules")
      socket.off("updateOrders")
      socket.off("updateTableOrders")
    }
	}
  
	const initialize = async() => {
    tr.locale = await AsyncStorage.getItem("language")

    setLanguage(await AsyncStorage.getItem("language"))

    getTheOwnerInfo()
    getTheLocationProfile()
    getTheLocationHours()

		if (Constants.isDevice) getNotificationPermission()
	}
  const stopSpeech = async() => {
    if (useVoice) {
      await Voice.stop()
      await Voice.cancel()
      await Voice.destroy();
    }
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
            profile: { name: "", uri: "" }, editProfile: false, 
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
  const switchTheAccount = async type => {
    const locationid = await AsyncStorage.getItem("locationid")
    const data = { locationid, type }
    let askPassword = false

    switch (userType) { // initial
      case "owner":

        break;
      case "kitchen":
        askPassword = true

        break;
      case "orderer":
        askPassword = true

        break;
      default:

    }

    if (askPassword == true) {
      setShowmoreoptions({ ...showMoreoptions, show: false })
      setSwitchaccountauth({ ...switchAccountauth, show: true, type, password: '' })
    } else {
      switchAccount(data)
        .then((res) => {
          if (res.status == 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            setOwnerid(res.id)
            setUsertype(type)

            AsyncStorage.setItem("ownerid", res.id)
            AsyncStorage.setItem("userType", type)

            if (type == "orderer") {
              getAllTables()
            }

            setShowmoreoptions({ ...showMoreoptions, show: false })
            setSwitchaccountauth({ ...switchAccountauth, show: false, type: '', password: '', errorMsg: '' })
          }
        })
        .catch((err) => {
          if (err.response && err.response.status == 400) {
            const { errormsg, status } = err.response.data
          }
        })
    }
  }
  const verifyTheSwitchAccount = async() => {
    const { type, password } = switchAccountauth
    const locationid = await AsyncStorage.getItem("locationid")
    const data = { locationid, type, password }

    verifySwitchAccount(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          switchAccount(data)
            .then((res) => {
              if (res.status == 200) {
                return res.data
              }
            })
            .then((res) => {
              if (res) {
                setOwnerid(res.id)
                setUsertype(type)

                AsyncStorage.setItem("ownerid", res.id)
                AsyncStorage.setItem("userType", type)

                setShowmoreoptions({ ...showMoreoptions, show: false })
                setSwitchaccountauth({ ...switchAccountauth, show: false, type: '', password: '', errorMsg: '' })

                if (type == "orderer") {
                  getAllTables()
                }
              }
            })
            .catch((err) => {
              if (err.response && err.response.status == 400) {
                const { errormsg, status } = err.response.data
              }
            })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data

          switch (status) {
            case "passwordMismatch":
              setSwitchaccountauth({ ...switchAccountauth, errorMsg: "Password is incorrect" })

              break;
            default:
          }
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
  const setTheUseVoice = async(option) => {
    const ownerid = await AsyncStorage.getItem("ownerid")
    const data = { ownerid, option }

    setUseVoice(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setUsevoice(option)
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
          getTheWorkersHour(false)

          if (viewType == "appointments_list") {
            getListAppointments()
          } else if (viewType == "appointments_chart") {
            const newChartinfo = {...chartInfo}
            const { workersHour } = newChartinfo
            const { scheduleid, time, worker } = data.speak
            const workerId = worker.id.toString(), unix = jsonDateToUnix(time)
            const scheduled = workersHour[workerId]["scheduled"]

            for (let time in scheduled) {
              if (scheduled[time] == scheduleid) {
                delete workersHour[workerId]["scheduled"][time]
              }
            }

            if (data.type == "makeAppointment" || data.type == "remakeAppointment") {
              workersHour[workerId]["scheduled"][unix] = parseInt(scheduleid)
            }

            setChartinfo({ ...chartInfo, workersHour })
          }
            
          speakToWorker(data)
        } else if (data.type == "checkout") {
          getCartOrderers()
        }
			});
		}

		return () => {
			socket.off("updateSchedules")
			socket.off("updateOrders")
		}
	}, [viewType, chartInfo.workersHour, appointments.list.length, cartOrderers.length])

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

        return () => {
          Voice.destroy().then(Voice.removeAllListeners);
        }
      };
    }
  }, [speakInfo.orderNumber])

  useEffect(() => {
    if (scheduleOption.pushBy != "") getAllTheWorkersTime()
    if (scheduleOption.selectedFactor != "") pushTheAppointments()
  }, [scheduleOption.selectedFactor, scheduleOption.pushBy])

  useEffect(() => {
    if (chartInfo.resetChart > 0) getAppointmentsChart(0, null)
  }, [chartInfo.resetChart])

  const header = (locationType == "hair" || locationType == "nail") && " Salon " || 
                  locationType == "restaurant" && " Restaurant " || 
                  locationType == "store" && " Store "
  const currenttime = Date.now()
  const { date, workersHour, workers } = chartInfo
  let currDay = date.day ? date.day.substr(0, 3) : ""
  const { daysInfo } = accountForm
  const { sizes, quantities, percents } = showProductinfo

	return (
		<SafeAreaView style={styles.main}>
      {loaded ?
  			<View style={styles.box}>
  				<View style={styles.body}>
            <View style={{ flexDirection: 'column', height: '10%', justifyContent: 'space-around' }}>
              <View style={styles.viewTypes}>
                {(locationType == "hair" || locationType == "nail") ? 
                  <>
                    <TouchableOpacity style={[styles.viewType, { backgroundColor: viewType == "appointments_list" ? "black" : "transparent" }]} onPress={() => getListAppointments()}>
                      <Text style={[styles.viewTypeHeader, { color: viewType == "appointments_list" ? "white": "black" }]}>{tr.t("main.navs.myAppointments")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.viewType, { backgroundColor: viewType == "appointments_chart" ? "black" : "transparent" }]} onPress={() => getTheWorkersHour(true)}>
                      <Text style={[styles.viewTypeHeader, { color: viewType == "appointments_chart" ? "white" : "black" }]}>{tr.t("main.navs.allAppointments")}</Text>
                    </TouchableOpacity>
                  </>
                  :
                  <>
                    {userType == "kitchen" && (
                      <>
                        <TouchableOpacity style={[styles.viewType, { width: '30%' }]} onPress={() => getAllCartOrderers()}>
                          <Text style={styles.viewTypeHeader}>{tr.t("main.navs.cartOrderers")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.viewType, { width: '30%' }]} onPress={() => getAllTableBills(true)}>
                          <Text style={styles.viewTypeHeader}>{tr.t("main.navs.tableBills")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.viewType, { width: '30%' }]} onPress={() => getAllOrderingTables(true)}>
                          <Text style={styles.viewTypeHeader}>{tr.t("main.navs.tableOrders")}</Text>
                        </TouchableOpacity>
                      </>
                    )}

                    {userType == "orderer" && (
                      <>
                        {table.id ?  
                          <>
                            <TouchableOpacity style={[styles.viewType, { width: '30%' }]} onPress={() => {
                              AsyncStorage.removeItem("table")

                              setTable({ ...table, id: '', name: '' })
                              getAllTables()
                            }}>
                              <Text style={styles.viewTypeHeader}>Back</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.viewType, { width: '30%' }]} onPress={() => getAllMenus()}>
                              <Text style={styles.viewTypeHeader}>See Menu</Text>
                            </TouchableOpacity>
                          </>
                          :
                          <Text style={styles.tablesHeader}>Select your table</Text>
                        }
                      </>
                    )}
                  </>
                }
              </View>
            </View>

            {viewType == "appointments_list" && ( 
              !appointments.loading ?
                appointments.list.length > 0 ? 
                  <FlatList
                    showsVerticalScrollIndicator={false}
                    data={appointments.list}
                    renderItem={({ item, index }) => 
                      <View key={item.key} style={styles.schedule}>
                        <Text style={styles.scheduleHeader}>{item.name}</Text>
                        {item.image.name && (
                          <View style={styles.scheduleImageHolder}>
                            <Image 
                              style={resizePhoto(item.image, wsize(20))} 
                              source={{ uri: logo_url + item.image.name }}
                            />
                          </View>
                        )}
                          
                        <Text style={styles.scheduleHeader}>
                          {tr.t("main.list.clientName") + ': ' + item.client.username}
                          {item.worker && '\n' + tr.t("main.list.staff") + ': ' + item.worker.username}
                          {'\n' + 
                            displayTime(item.time)
                              .replace("today at", tr.t("headers.todayAt"))
                              .replace("tomorrow at", tr.t("headers.tomorrowAt"))
                          }
                          {'\n'}({(item.type == "confirmed" ? "app booked" : "walk-in booked")})
                        </Text>

                        <View style={styles.scheduleActions}>
                          <View style={styles.column}>
                            <TouchableOpacity style={styles.scheduleAction} onPress={() => showScheduleOption(item.id, "list", index, "remove")}>
                              <Text style={styles.scheduleActionHeader}>{tr.t("buttons.cancel")}</Text>
                            </TouchableOpacity>
                          </View>
                          <View style={styles.column}>
                            <TouchableOpacity style={styles.scheduleAction} onPress={() => {
                              props.navigation.navigate("booktime", { scheduleid: item.id, serviceid: item.serviceid, serviceinfo: item.name })
                            }}>
                              <Text style={styles.scheduleActionHeader}>{tr.t("main.list.changeTime")}</Text>
                            </TouchableOpacity>
                          </View>
                          <View style={styles.column}>
                            <TouchableOpacity style={styles.scheduleAction} onPress={() => doneTheService(index, item.id)}>
                              <Text style={styles.scheduleActionHeader}>{tr.t("buttons.done")}</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    }
                  />
                  :
                  <View style={styles.bodyResult}>
                    <Text style={styles.bodyResultHeader}>{tr.t("main.list.header")}</Text>
                  </View>
                :
                <View style={styles.loading}>
                  <ActivityIndicator color="black" size="small"/>
                </View>
            )}

            {viewType == "appointments_chart" && (
              !chartInfo.loading ? 
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ borderColor: 'black', borderStyle: 'solid', borderWidth: 2 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                      <View style={styles.column}>
                        <TouchableOpacity disabled={scheduleOption.select} onPress={() => getAppointmentsChart(chartInfo.dayDir - 1, "left")}>
                          <AntDesign name="left" size={wsize(7)}/>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.column}>
                        <Text style={{ fontSize: wsize(5), fontWeight: 'bold', paddingVertical: 10, textAlign: 'center' }}>{
                          tr.t("days." + date.day) + ", " + 
                          tr.t("months." + date.month) + " " + 
                          date.date + ", " + 
                          date.year
                        }</Text>
                      </View>
                      <View style={styles.column}>
                        <TouchableOpacity disabled={scheduleOption.select} onPress={() => getAppointmentsChart(chartInfo.dayDir + 1, "right")}>
                          <AntDesign name="right" size={wsize(7)}/>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <View style={styles.chartActions}>
                        {!scheduleOption.select && (
                          <TouchableOpacity style={styles.chartAction} onPress={() => pushTheAppointments(false)}>
                            <Text style={styles.chartActionHeader}>{tr.t("main.chart.reschedule.all")}</Text>
                          </TouchableOpacity>
                        )}

                        {!scheduleOption.select ? 
                          <TouchableOpacity style={styles.chartAction} onPress={() => pushTheAppointments(true)}>
                            <Text style={styles.chartActionHeader}>{tr.t("main.chart.reschedule.some")}</Text>
                          </TouchableOpacity>
                          :
                          <>
                            <TouchableOpacity style={styles.chartAction} onPress={() => setScheduleoption({ ...scheduleOption, show: false, select: false, push: false, pushType: null, pushBy: null, selectedIds: [] })}>
                              <Text style={styles.chartActionHeader}>{tr.t("buttons.cancel")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.chartAction} onPress={() => pushTheAppointments(true)}>
                              <Text style={styles.chartActionHeader}>{tr.t("main.chart.reschedule.finishSelect")}</Text>
                            </TouchableOpacity>
                          </>
                        }
                      </View>
                    </View>
                    <View style={styles.chartRow}>
                      {chartInfo.workers.map(worker => (
                        <View key={worker.key} style={[styles.chartWorker, { width: workers.length < 5 ? (width / workers.length) : 200 } ]}>
                          <View>
                            <Text style={styles.chartWorkerHeader}>{worker.username}</Text>
                            <View style={styles.chartWorkerProfile}>
                              <Image
                                style={resizePhoto(worker.profile, 40)}
                                source={worker.profile.name ? { uri: logo_url + worker.profile.name } : require("../../assets/profilepicture.jpeg")}
                              />
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                      {chartInfo.times && chartInfo.times.map((item, index) => (
                        <View key={item.key} style={styles.chartRow}>
                          <View style={styles.chartRow}>
                            {chartInfo.workers.map(worker => (
                              <View
                                key={worker.key}
                                style={[
                                  styles.chartTime,
                                  { width: workers.length < 5 ? (width / workers.length) : 200 },
                                  (
                                    item.time + "-co" in chartInfo.workersHour[worker.id]["scheduled"] 
                                    || 
                                    item.time + "-w_" in chartInfo.workersHour[worker.id]["scheduled"]
                                  ) 
                                  && 
                                  (
                                    (item.time + "-co" in chartInfo.workersHour[worker.id]["scheduled"] && scheduleOption.selectedIds.includes(chartInfo.workersHour[worker.id]["scheduled"][item.time + "-co"].toString()))
                                    ||
                                    (item.time + "-w_" in chartInfo.workersHour[worker.id]["scheduled"] && scheduleOption.selectedIds.includes(chartInfo.workersHour[worker.id]["scheduled"][item.time + "-w_"].toString()))
                                  ) ? 
                                    { 
                                      backgroundColor: 'rgba(0, 0, 0, 0.8)'
                                    }
                                    :
                                    {
                                      backgroundColor: timeStyle(item, worker.id, "bg"),
                                      opacity: timeStyle(item, worker.id, "opacity")
                                    }
                                ]}
                              >
                                <TouchableOpacity
                                  disabled={timeStyle(item, worker.id, "disabled")}
                                  onPress={(e) => {
                                    if (scheduleOption.rebook) {
                                      if (scheduleOption.id == chartInfo.workersHour[worker.id]["scheduled"][item.time + "-co"]) {
                                        setScheduleoption({ ...scheduleOption, show: false, rebook: false })
                                      } else {
                                        rebookSchedule(item.time, item.jsonDate, worker.id)
                                      }
                                    } else if (!(item.time + "-co" in workersHour[worker.id]["scheduled"] || item.time + "-w_" in workersHour[worker.id]["scheduled"])) {
                                      blockTheTime(worker.id, item.jsonDate)
                                    } else {
                                      if (scheduleOption.select) {
                                        const { selectedIds } = scheduleOption
                                        const scheduleId = chartInfo.workersHour[worker.id]["scheduled"][item.time + "-co"].toString()

                                        selectedIds.push(scheduleId)

                                        setScheduleoption({ ...scheduleOption, selectedIds })
                                      } else {
                                        if (item.time + "-co" in chartInfo.workersHour[worker.id]["scheduled"]) {
                                          showScheduleOption(chartInfo.workersHour[worker.id]["scheduled"][item.time + "-co"], "chart", index, "change")
                                        } else if (item.time + "-w_" in chartInfo.workersHour[worker.id]["scheduled"]) {
                                          showScheduleOption(chartInfo.workersHour[worker.id]["scheduled"][item.time + "-w_"], "chart", index, "change")
                                        }
                                      }
                                    }
                                  }}
                                  style={{ flexDirection: 'row', height: '100%', justifyContent: 'space-around', width: '100%' }}
                                >
                                  <Text style={[
                                    styles.chartTimeHeader, 
                                    (
                                      item.time + "-co" in chartInfo.workersHour[worker.id]["scheduled"] 
                                      ||
                                      item.time + "-w_" in chartInfo.workersHour[worker.id]["scheduled"]
                                    ) 
                                    && 
                                    (
                                      (item.time + "-co" in chartInfo.workersHour[worker.id]["scheduled"] && scheduleOption.selectedIds.includes(chartInfo.workersHour[worker.id]["scheduled"][item.time + "-co"].toString()))
                                      ||
                                      (item.time + "-w_" in chartInfo.workersHour[worker.id]["scheduled"] && scheduleOption.selectedIds.includes(chartInfo.workersHour[worker.id]["scheduled"][item.time + "-w_"].toString()))
                                    ) ? 
                                      { color: 'white' }
                                      :
                                      { color: timeStyle(item, worker.id, "fontColor") }
                                  ]}>
                                    {item.timeDisplay + '\n'}
                                    {(
                                      (item.time + "-co" in workersHour[worker.id]["scheduled"] || item.time + "-w_" in workersHour[worker.id]["scheduled"])
                                      ||
                                      (item.time + "-bl" in workersHour[worker.id]["scheduled"])
                                    ) && (
                                      <Text style={styles.chartScheduledInfo}>{timeStyle(item, worker.id, "header")}</Text>
                                    )}
                                  </Text>

                                  {(item.time + "-co" in workersHour[worker.id]["scheduled"] || item.time + "-w_" in workersHour[worker.id]["scheduled"]) && (
                                    <View 
                                      style={styles.chartScheduledActions}
                                      onStartShouldSetResponder={(event) => true}
                                      onTouchEnd={(e) => e.stopPropagation()}
                                    >
                                      <View style={styles.column}>
                                         <TouchableOpacity style={styles.chartScheduledAction} onPress={() => {
                                          if (item.time + "-co" in chartInfo.workersHour[worker.id]["scheduled"]) {
                                            showScheduleOption(chartInfo.workersHour[worker.id]["scheduled"][item.time + "-co"], "chart", index, "remove")
                                          } else {
                                            showScheduleOption(chartInfo.workersHour[worker.id]["scheduled"][item.time + "-w_"], "chart", index, "remove")
                                          }
                                         }}>
                                          <AntDesign color="white" name="closecircleo" size={30}/>
                                        </TouchableOpacity>
                                      </View>
                                    </View>
                                  )}
                                </TouchableOpacity>
                              </View>
                            ))}
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </ScrollView>
                :
                <View style={styles.loading}>
                  <ActivityIndicator color="black" size="small"/>
                </View>
            )}

            {locationType == "restaurant" && (
              <>
                {userType == "owner" && (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[styles.viewTypeHeader, { fontWeight: 'bold' }]}>This is {storeName}</Text>

                    {logo.uri && (
                      <View style={{ height: wsize(90), width: wsize(90) }}>
                        <Image style={resizePhoto(logo.size, wsize(90))} source={{ uri: logo.uri }}/>
                      </View>
                    )}
                  </View>
                )}

                {userType == "kitchen" && (
                  <>
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
                                  <Text style={styles.cartordererUsername}>{tr.t("main.cartOrderers.customerName")} {item.username}</Text>
                                  <Text style={styles.cartordererOrderNumber}>{tr.t("main.cartOrderers.orderNumber")}{item.orderNumber}</Text>

                                  <View style={styles.cartorderActions}>
                                    <TouchableOpacity style={styles.cartordererAction} onPress={() => {
                                      props.navigation.navigate("cartorders", { 
                                        userid: item.adder, 
                                        type: item.type, 
                                        ordernumber: item.orderNumber 
                                      })
                                    }}>
                                      <Text style={styles.cartordererActionHeader}>{tr.t("main.cartOrderers.seeOrders") + '\n'}({item.numOrders})</Text>
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              </View>
                          }
                        />
                        :
                        <View style={styles.bodyResult}>
                          <Text style={styles.bodyResultHeader}>{tr.t("main.cartOrderers.header")}</Text>
                        </View>
                    )}

                    {viewType == 'tableorders' && (
                      tableViewtype == "orders" ? 
                        <>
                          {tableOrders.length > 0 ?  
                            <FlatList
                              data={tableOrders}
                              renderItem={({ item, index }) => 
                                <View style={styles.tableOrder}>
                                  <View style={[styles.column, { width: '18%' }]}>
                                    <Text style={styles.orderHeader}>Table{'\n'}#{item.id}</Text>
                                  </View>

                                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: '82%' }}>
                                    {item.orders.map(order => (
                                      <View key={order.key} style={[styles.order, { opacity: order.finish ? 0.3 : 1 }]}>
                                        <View style={styles.orderInfo}>
                                          <Text style={styles.orderInfoHeader}>{order.name} {(order.sizes.length == 0 && order.quantities.length == 0 && order.percents.length == 0) && "(" + order.quantity + ")"}</Text>
                                          {order.note ? <Text style={[styles.orderInfoHeader, { fontWeight: '500' }]}>NOTE: {order.note}</Text> : null}
                                        
                                          {(order.sizes.length > 0 || order.quantities.length > 0 || order.percents.length > 0) && (
                                            <View style={{ marginTop: 5 }}>
                                              {order.sizes.length > 0 && order.sizes.map(size => 
                                                <Text 
                                                  key={size.key} 
                                                  style={styles.orderInfoHeader}
                                                >
                                                  {size["name"].substr(0, 1)} {"(" + order.quantity + ")"}
                                                </Text>
                                              )}
                                              {order.quantities.length > 0 && order.quantities.map(quantity => 
                                                <Text 
                                                  key={quantity.key} 
                                                  style={styles.orderInfoHeader}
                                                >
                                                  {quantity["input"]} {"(" + order.quantity + ")"}
                                                </Text>
                                              )}
                                              {order.percents.length > 0 && order.percents.map(percent => 
                                                <Text 
                                                  key={percent.key} 
                                                  style={styles.orderInfoHeader}
                                                >
                                                  {percent["input"]}
                                                </Text>
                                              )}
                                            </View>
                                          )}

                                          <View style={styles.column}>
                                            <TouchableOpacity style={styles.orderDone} onPress={() => finishTheOrder(order.key, order.tableId)}>
                                              <Text style={styles.orderDoneHeader}>{tr.t("buttons.done").toUpperCase()}</Text>
                                            </TouchableOpacity>
                                          </View>
                                        </View>
                                      </View>
                                    ))}
                                  </View>

                                  
                                </View>
                              }
                            />
                            :
                            <View style={styles.bodyResult}>
                              <Text style={styles.bodyResultHeader}>{tr.t("main.tableOrders.header")}</Text>
                            </View>
                          }
                        </>
                        :
                        <>
                          {tableBills.length > 0 ? 
                            <FlatList
                              data={tableBills}
                              renderItem={({ item, index }) => 
                                <View key={item.key} style={styles.tableBill}>
                                  <View>
                                    <Text style={styles.tableBillHeader}>{tr.t("main.tableOrders.tableHeader")}{item.name}</Text>
                                  </View>

                                  <View>
                                    <TouchableOpacity style={styles.tableBillOption} onPress={() => viewThePayment(item.key)}>
                                      <Text style={styles.tableBillOptionHeader}>{tr.t("main.tableOrders.seeBill")}</Text>
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              }
                            />
                            :
                            <View style={styles.bodyResult}>
                              <Text style={styles.bodyResultHeader}>There are {tableOrders.length} order(s)</Text>
                            </View>
                          }
                        </>
                    )}
                  </>
                )}

                {userType == "orderer" && (
                  table.id ? 
                    <>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                        {showCurrentorders.orders.length > 0 && (
                          <TouchableOpacity style={styles.ordererTouch} onPress={() => setShowcurrentorders({ ...showCurrentorders, show: true })}>
                            <Text style={styles.ordererTouchHeader}>{showCurrentorders.orders.length + '\nSee / Send'}</Text>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity style={styles.ordererTouch} disabled={numTableorders == 0} onPress={() => viewTheTableOrders()}>
                          <Text style={styles.ordererTouchHeader}>{numTableorders + '\nOrdered'}</Text>
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.ordererHeader}>Your are Table #{table.id}</Text>

                      <ScrollView showsVerticalScrollIndicator={false}>
                        {displayList({ id: "", name: "", image: "", list: menuInfo.list })}
                      </ScrollView>
                    </>
                    :
                    <FlatList
                      data={tables}
                      renderItem={({ item, index }) => 
                        <View key={item.key} style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                          {item.row.map(info => (
                            <View key={info.key} style={styles.table}>
                              <View style={styles.column}><Text style={styles.tableHeader}>{tr.t("tables.table")}{info.name}</Text></View>

                              <View style={styles.tableActions}>
                                <View style={styles.column}>
                                  <TouchableOpacity style={[styles.tableAction, { padding: 10 }]} onPress={() => showQrCode(info.tableid)}>
                                    <Text style={styles.tableActionHeader}>{tr.t("tables.showBarcode")}</Text>
                                  </TouchableOpacity>
                                </View>
                                <View style={styles.column}>
                                  <TouchableOpacity style={[styles.tableAction, { padding: 10 }]} onPress={() => selectDiningTable(info.tableid)}>
                                    <Text style={styles.tableActionHeader}>{tr.t("tables.selectTable")}</Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            </View>
                          ))}
                        </View>
                      }
                    />
                )}
              </>
            )}  
  				</View>

  				<View style={styles.bottomNavs}>
  					<View style={styles.bottomNavsRow}>
              <View style={[styles.column, { width: '28%' }]}>
                <TouchableOpacity style={styles.bottomNavButton} onPress={() => setShowmoreoptions({ ...showMoreoptions, show: true })}>
                  <Text style={styles.bottomNavButtonHeader}>{tr.t("main.bottomNavs.info")}</Text>
                </TouchableOpacity>
              </View>

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
        scheduleOption.show || showInfo.show || showMoreoptions.show || showDisabledscreen || 
        alertInfo.show || showPayment.show || showAddtable.show || showRemovetable.show || 
        showProductinfo.show || showCurrentorders.show || orderSentalert || showTableorders.show || showQr.show || 
        switchAccountauth.show
      ) && (
        <Modal transparent={true}>
          <SafeAreaView style={{ flex: 1 }}>
            {scheduleOption.show && (
              <SafeAreaView style={styles.scheduleOptionBox}>
                {scheduleOption.showRebookHeader && (
                  <View style={styles.scheduleOptionHeaderBox}>
                    <Text style={styles.scheduleOptionHeader}>{tr.t("main.hidden.scheduleOption.rebookHeader")}</Text>
                  </View>
                )}
                
                {scheduleOption.showSelectHeader && (
                  <View style={styles.scheduleOptionHeaderBox}>
                    <Text style={styles.scheduleOptionHeader}>{tr.t("main.hidden.scheduleOption.selectHeader")}</Text>
                  </View>
                )}

                {scheduleOption.remove && (
                  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                    <View style={styles.scheduleBox}>
                      <Text style={styles.scheduleHeader}>{tr.t("main.hidden.scheduleOption.remove.header")}</Text>

                      <TextInput 
                        placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder={tr.t("main.hidden.scheduleOption.remove.reason")} 
                        multiline={true} textAlignVertical="top" style={styles.scheduleCancelInput} 
                        onChangeText={(reason) => setScheduleoption({ ...scheduleOption, reason })} autoCorrect={false} 
                        autoCapitalize="none"
                      />

                      <View style={{ alignItems: 'center' }}>
                        <View style={styles.scheduleCancelActions}>
                          <TouchableOpacity style={styles.scheduleCancelTouch} onPress={() => setScheduleoption({ ...scheduleOption, show: false, remove: false })}>
                            <Text style={styles.scheduleCancelTouchHeader}>{tr.t("buttons.close")}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.scheduleCancelTouch} onPress={() => cancelTheSchedule()}>
                            <Text style={styles.scheduleCancelTouchHeader}>{tr.t("buttons.done")}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                )}

                {scheduleOption.push && (
                  <View style={styles.scheduleBox}>
                    {scheduleOption.pushType == null ? 
                      <>
                        <Text style={styles.scheduleOptionHeader}>{tr.t("main.hidden.scheduleOption.select.pushTypeHeader")}</Text>

                        <View style={styles.schedulePushActions}>
                          <TouchableOpacity style={styles.schedulePushAction} onPress={() => setScheduleoption({ ...scheduleOption, pushType: "backward" })}>
                            <Text style={styles.schedulePushActionHeader}>{tr.t("main.hidden.scheduleOption.select.pushTypes.backward")}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.schedulePushAction} onPress={() => setScheduleoption({ ...scheduleOption, pushType: "forward" })}>
                            <Text style={styles.schedulePushActionHeader}>{tr.t("main.hidden.scheduleOption.select.pushTypes.forward")}</Text>
                          </TouchableOpacity>
                        </View>

                        <View style={styles.scheduleActions}>
                          <TouchableOpacity style={styles.scheduleAction} onPress={() => setScheduleoption({ ...scheduleOption, show: false, select: false, push: false, pushType: null, pushBy: null, selectedIds: [] })}>
                            <Text style={styles.scheduleActionHeader}>{tr.t("buttons.cancel")}</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                      :
                      scheduleOption.pushBy == null ? 
                        <>
                          <Text style={styles.scheduleOptionHeader}>{
                            language == "chinese" || language == "french" ? 
                              tr.t("main.hidden.scheduleOption.select.pushByHeader." + scheduleOption.pushType)
                              :
                              tr.t("main.hidden.scheduleOption.select.pushByHeader").replace("{dir}", scheduleOption.pushType)
                          }</Text>

                          <View style={styles.schedulePushActions}>
                            <TouchableOpacity style={styles.schedulePushAction} onPress={() => {
                              const today = new Date(), calcDate = new Date(), pushFactors = []
                              let k = 0

                              today.setDate(today.getDate() + chartInfo.dayDir)

                              while (pushFactors.length < 3) {
                                k = scheduleOption.pushType == "backward" ? k - 1 : k + 1

                                calcDate.setDate(today.getDate() + k)

                                if ((k == 1 || k == -1) && days[calcDate.getDay()].substr(0, 3) in workersHoursinfo && calcDate.getTime() == today.getTime()) {
                                  pushFactors.push({ header: (k == 1 ? "Tomorrow" : "Yesterday") + ",\n" + days[calcDate.getDay()], pushBy: k })
                                } else if (days[calcDate.getDay()].substr(0, 3) in workersHoursinfo) {
                                  pushFactors.push({ 
                                    header: (k < 0 ? "Back " + (0 - k) + " day(s) on\n" : k + " day(s) on\n") + days[calcDate.getDay()], 
                                    pushBy: k 
                                  })
                                }
                              }

                              setScheduleoption({ ...scheduleOption, pushBy: "days", pushFactors })
                            }}>
                              <Text style={styles.schedulePushActionHeader}>{tr.t("main.hidden.scheduleOption.select.pushBys.days")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.schedulePushAction} onPress={() => {
                              const { pushType } = scheduleOption
                              const today = new Date(), calcDate = new Date(), pushFactors = []
                              let k = 0, hour = "", period = ""

                              today.setDate(today.getDate() + chartInfo.dayDir)

                              while (pushFactors.length < 3) {
                                k = pushType == "backward" ? k - 1 : k + 1

                                calcDate.setDate(today.getHours() + k)

                                if ((k == 1 || k == -1) && calcDate.getTime() == today.getTime()) {
                                  pushFactors.push({ header: "Now", pushBy: k })
                                } else {
                                  pushFactors.push({ 
                                    header: (k < 0 ? 0 - k : k) + " " + tr.t("main.hidden.scheduleOption.select.pushBys.hours").toLowerCase() + " " + tr.t("buttons." + pushType), 
                                    pushBy: k 
                                  })
                                }
                              }

                              setScheduleoption({ ...scheduleOption, pushBy: "hours", pushFactors })
                            }}>
                              <Text style={styles.schedulePushActionHeader}>{tr.t("main.hidden.scheduleOption.select.pushBys.hours")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.schedulePushAction} onPress={() => {
                              const { pushType } = scheduleOption
                              const today = new Date(), calcDate = new Date(), pushFactors = []
                              let k = 0, minute

                              today.setDate(today.getDate() + chartInfo.dayDir)

                              while (pushFactors.length < 3) {
                                k = pushType == "backward" ? k - 15 : k + 15

                                calcDate.setDate(today.getMinutes() + k)

                                if ((k == 1 || k == -1) && calcDate.getTime() == today.getTime()) {
                                  pushFactors.push({ header: "Now", pushBy: k })
                                } else {
                                  pushFactors.push({ 
                                    header: (k < 0 ? 0 - k : k) + " minute(s) " + pushType, 
                                    pushBy: k 
                                  })
                                }
                              }

                              setScheduleoption({ ...scheduleOption, pushBy: "minutes", pushFactors })
                            }}>
                              <Text style={styles.schedulePushActionHeader}>{tr.t("main.hidden.scheduleOption.select.pushBys.minutes")}</Text>
                            </TouchableOpacity>
                          </View>

                          <View style={styles.scheduleActions}>
                            <TouchableOpacity style={styles.scheduleAction} onPress={() => setScheduleoption({ ...scheduleOption, show: false, select: false, push: false, pushType: null, pushBy: null, selectedIds: [] })}>
                              <Text style={styles.scheduleActionHeader}>{tr.t("buttons.cancel")}</Text>
                            </TouchableOpacity>
                          </View>
                        </>
                        :
                        <>
                          <Text style={styles.scheduleOptionHeader}>
                            {tr.t("main.hidden.scheduleOption.selectFactor").replace("{factor}", tr.t("main.hidden.scheduleOption.select.pushBys." + scheduleOption.pushBy))}
                          </Text>

                          <View style={styles.schedulePushActions}>
                            {scheduleOption.pushFactors.map((factor, index) => (
                              <TouchableOpacity key={index} style={[
                                styles.schedulePushAction, 
                                { backgroundColor: scheduleOption.selectedFactor == factor.pushBy ? 'black' : 'transparent' }
                              ]} onPress={() => setScheduleoption({ ...scheduleOption, selectedFactor: factor.pushBy })}>
                                <Text style={[
                                  styles.schedulePushActionHeader,
                                  { color: scheduleOption.selectedFactor == factor.pushBy ? 'white' : 'black' }
                                ]}>{factor.header}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>

                          <Text style={styles.scheduleOptionHeader}>Or{'\n' + tr.t("main.hidden.scheduleOption.select.timeFactorHeader")}{tr.t("main.hidden.scheduleOption.select.pushBys." + scheduleOption.pushBy)}</Text>
                          <TextInput style={styles.scheduleInput} placeholder={"Enter how many " + scheduleOption.pushBy} onChangeText={factor => setScheduleoption({ ...scheduleOption, selectedFactor: factor })}/>
                          <TouchableOpacity style={styles.scheduleAction} onPress={() => pushTheAppointments()}>
                            <Text style={styles.scheduleActionHeader}>{tr.t("main.hidden.scheduleOption.rescheduleNow")}</Text>
                          </TouchableOpacity>

                          <View style={styles.scheduleActions}>
                            <TouchableOpacity style={styles.scheduleAction} onPress={() => setScheduleoption({ ...scheduleOption, pushBy: null, pushFactors: [] })}>
                              <Text style={styles.scheduleActionHeader}>{tr.t("buttons.back")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.scheduleAction} onPress={() => setScheduleoption({ ...scheduleOption, show: false, select: false, push: false, pushType: null, pushBy: null, selectedIds: [] })}>
                              <Text style={styles.scheduleActionHeader}>{tr.t("buttons.cancel")}</Text>
                            </TouchableOpacity>
                          </View>
                        </>
                    }
                  </View>
                )}
              </SafeAreaView>
            )} 
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
                      )}
                    </View>
                  </ScrollView>
                </View>
              </View>
            )}
            {showMoreoptions.show && (
              <View style={styles.moreInfosContainer}>
                <View style={styles.moreInfosBox}>
                  {showMoreoptions.infoType == '' ? 
                    <>
                      <TouchableOpacity style={styles.moreInfosClose} onPress={() => setShowmoreoptions({ ...showMoreoptions, show: false })}>
                        <AntDesign name="close" size={wsize(7)}/>
                      </TouchableOpacity>

                      <ScrollView showsVerticalScrollIndicator={false} style={{ width: '90%' }}>
                        {userType == "owner" && (
                          <>
                            <TouchableOpacity style={styles.moreInfoTouch} onPress={() => {
                              setShowmoreoptions({ ...showMoreoptions, show: false })
                              props.navigation.navigate("menu", { userType })
                            }}>
                              <Text style={styles.moreInfoTouchHeader}>{tr.t("main.hidden.showMoreoptions.changeMenu")}</Text>
                            </TouchableOpacity>

                            {(locationType == "hair" || locationType == "nail") && (
                              <TouchableOpacity style={styles.moreInfoTouch} onPress={() => {
                                setEditinfo({ ...editInfo, show: true, type: 'users' })
                                setShowmoreoptions({ ...showMoreoptions, infoType: 'users' })
                                getAllAccounts()
                              }}>
                                <Text style={styles.moreInfoTouchHeader}>{tr.t("main.hidden.showMoreoptions.changeStaffinfo")}</Text>
                              </TouchableOpacity>
                            )}

                            {(locationType == "store" || locationType == "restaurant") && (
                              <TouchableOpacity style={styles.moreInfoTouch} onPress={() => {
                                getTheLogins()
                                setEditinfo({ ...editInfo, show: true, type: 'login' })
                                setShowmoreoptions({ ...showMoreoptions, infoType: 'login' })
                              }}>
                                <Text style={styles.moreInfoTouchHeader}>{tr.t("main.hidden.showMoreoptions.changeLogininfo")}</Text>
                              </TouchableOpacity>
                            )}

                            <TouchableOpacity style={styles.moreInfoTouch} onPress={() => {
                              setShowmoreoptions({ ...showMoreoptions, infoType: 'information' })
                              setEditinfo({ ...editInfo, show: true, type: 'information' })
                            }}>
                              <Text style={styles.moreInfoTouchHeader}>{tr.t("main.hidden.showMoreoptions.changeBusinessinformation")}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.moreInfoTouch} onPress={() => {
                              setShowmoreoptions({ ...showMoreoptions, infoType: 'location' })
                              setEditinfo({ ...editInfo, show: true, type: 'location' })
                            }}>
                              <Text style={styles.moreInfoTouchHeader}>{tr.t("main.hidden.showMoreoptions.changeBusinesslocation")}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.moreInfoTouch} onPress={() => {
                              setShowmoreoptions({ ...showMoreoptions, infoType: 'logo' })
                              setEditinfo({ ...editInfo, show: true, type: 'logo' })
                            }}>
                              <Text style={styles.moreInfoTouchHeader}>{tr.t("main.hidden.showMoreoptions.changeBusinesslogo")}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.moreInfoTouch} onPress={() => {
                              setShowmoreoptions({ ...showMoreoptions, infoType: 'hours' })
                              setEditinfo({ ...editInfo, show: true, type: 'hours' })
                            }}>
                              <Text style={styles.moreInfoTouchHeader}>{tr.t("main.hidden.showMoreoptions.changeBusinesshours")}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.moreInfoTouch} onPress={() => {
                              AsyncStorage.removeItem("locationid")
                              AsyncStorage.removeItem("locationtype")
                              AsyncStorage.setItem("phase", "list")

                              setShowmoreoptions({ ...showMoreoptions, show: false })

                              setTimeout(function () {
                                props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "list" }]}));
                              }, 1000)
                            }}>
                              <Text style={styles.moreInfoTouchHeader}>{tr.t("main.hidden.showMoreoptions.moreBusinesses")}</Text>
                            </TouchableOpacity>

                            {(locationType == "hair" || locationType == "nail") && (
                              <TouchableOpacity style={styles.moreInfoTouch} onPress={() => {
                                AsyncStorage.setItem("phase", "walkin")

                                setShowmoreoptions({ ...showMoreoptions, show: false })

                                setTimeout(function () {
                                  props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "walkin" }]}));
                                }, 1000)
                              }}>
                                <Text style={styles.moreInfoTouchHeader}>{tr.t("main.hidden.showMoreoptions.walkIn")}</Text>
                              </TouchableOpacity>
                            )}

                            {(locationType == "hair" || locationType == "nail") && (
                              <View style={styles.moreOptionsBox}>
                                <Text style={styles.moreOptionsHeader}>{tr.t("main.hidden.showMoreoptions.getAppointmentsby.header")}</Text>

                                <View style={styles.moreOptions}>
                                  <TouchableOpacity style={[styles.moreOption, { backgroundColor: locationReceivetype == 'everyone' ? 'black' : 'white' }]} onPress={() => setTheReceiveType('everyone')}>
                                    <Text style={[styles.moreOptionHeader, { color: locationReceivetype == 'everyone' ? 'white' : 'black' }]}>{tr.t("main.hidden.showMoreoptions.getAppointmentsby.both")}</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity style={[styles.moreOption, { backgroundColor: locationReceivetype == 'owner' ? 'black' : 'white' }]} onPress={() => setTheReceiveType('owner')}>
                                    <Text style={[styles.moreOptionHeader, { color: locationReceivetype == 'owner' ? 'white' : 'black' }]}>{tr.t("main.hidden.showMoreoptions.getAppointmentsby.owner")}</Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            )}

                            <TouchableOpacity style={styles.moreInfoTouch} onPress={() => {
                              setShowmoreoptions({ ...showMoreoptions, show: false })
                              props.navigation.navigate("tables")
                            }}>
                              <Text style={styles.moreInfoTouchHeader}>{tr.t("main.hidden.showMoreoptions.editTables")}</Text>
                            </TouchableOpacity>

                            {(locationType == "hair" || locationType == "nail") && (
                              <View style={styles.moreOptionsBox}>
                                <Text style={styles.moreOptionsHeader}>{tr.t("main.hidden.showMoreoptions.useVoice.header")}</Text>

                                <View style={styles.moreOptions}>
                                  <TouchableOpacity style={[styles.moreOption, { backgroundColor: useVoice == true ? 'black' : 'white' }]} onPress={() => setTheUseVoice(true)}>
                                    <Text style={[styles.moreOptionHeader, { color: useVoice == true ? 'white' : 'black' }]}>{tr.t("main.hidden.showMoreoptions.useVoice.yes")}</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity style={[styles.moreOption, { backgroundColor: useVoice == false ? 'black' : 'white' }]} onPress={() => setTheUseVoice(false)}>
                                    <Text style={[styles.moreOptionHeader, { color: useVoice == false ? 'white' : 'black' }]}>{tr.t("main.hidden.showMoreoptions.useVoice.no")}</Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            )}

                            <TouchableOpacity style={styles.moreInfoTouch} onPress={() => {
                              setShowmoreoptions({ ...showMoreoptions, show: false })
                              props.navigation.navigate("paymentrecords")
                            }}>
                              <Text style={styles.moreInfoTouchHeader}>{tr.t("main.hidden.showMoreoptions.paymentRecords")}</Text>
                            </TouchableOpacity>
                          </>
                        )}

                        {locationType == "restaurant" && (
                          <View style={styles.moreOptionsBox}>
                            <Text style={styles.moreOptionsHeader}>{tr.t("main.hidden.showMoreoptions.switchAccount.header")}</Text>

                            <View style={styles.moreOptions}>
                              {userType != 'kitchen' && (
                                <TouchableOpacity style={styles.moreOption} onPress={() => switchTheAccount('kitchen')}>
                                  <Text style={styles.moreOptionHeader}>{tr.t("main.hidden.showMoreoptions.switchAccount.kitchen")}</Text>
                                </TouchableOpacity>
                              )}

                              {userType != 'owner' && (
                                <TouchableOpacity style={styles.moreOption} onPress={() => switchTheAccount('owner')}>
                                  <Text style={styles.moreOptionHeader}>{tr.t("main.hidden.showMoreoptions.switchAccount.owner")}</Text>
                                </TouchableOpacity>
                              )}
                              
                              {userType != 'orderer' && (
                                <TouchableOpacity style={styles.moreOption} onPress={() => switchTheAccount('orderer')}>
                                  <Text style={styles.moreOptionHeader}>{tr.t("main.hidden.showMoreoptions.switchAccount.tableOrderers")}</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>
                        )}

                        <TouchableOpacity style={styles.moreInfoTouch} onPress={() => {
                          setShowmoreoptions({ ...showMoreoptions, infoType: 'changelanguage' })
                          setEditinfo({ ...editInfo, show: true, type: 'changelanguage' })
                        }}>
                          <Text style={styles.moreInfoTouchHeader}>{tr.t("main.hidden.showMoreoptions.changeLanguage")}</Text>
                        </TouchableOpacity>
                      </ScrollView>
                    </>
                    :
                    <>
                      {editInfo.show && (
                        <View style={styles.editInfoBox}>
                          <View style={styles.editInfoContainer}>
                            <View style={{ marginTop: 5 }}>
                              <TouchableOpacity style={styles.editInfoClose} onPress={() => {
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
                            </View>

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

                                {editInfo.locationHours.map((info, index) => (
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

                                  {userType == true && (
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
                                            userType == true && (
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
                                            <View style={styles.column}><Text style={styles.loginHeader}>{item.cellnumber}</Text></View>
                                          </View>

                                          <View style={{ alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.2)', width: '100%' }}>
                                            <View style={styles.column}>
                                              <TouchableOpacity style={styles.loginChange} onPress={() => setLogins({ ...logins, type: 'usertype', info: {...logins.info, id: item.id, userType: item.userType }})}>
                                                <Text style={styles.loginChangeHeader}>Change User Type{'\n(' + item.userType + ')'}</Text>
                                              </TouchableOpacity>
                                            </View>

                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                                              <View style={[styles.column, { width: '48%' }]}>
                                                <TouchableOpacity style={styles.loginChange} onPress={() => setLogins({ ...logins, type: 'cellnumber', info: {...logins.info, id: item.id, noAccount: false, verifyCode: "", verified: false }})}>
                                                  <Text style={styles.loginChangeHeader}>Change number</Text>
                                                </TouchableOpacity>
                                              </View>

                                              <View style={[styles.column, { width: '48%' }]}>
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
                    </>
                  }
                </View>
              </View>
            )}
      			{showDisabledscreen && (
    					<Disable 
                close={() => socket.emit("socket/business/login", ownerId, () => setShowdisabledscreen(false))}
                language={language}
              />
      			)}
            {alertInfo.show && (
              <SafeAreaView style={styles.alertBox}>
                <View style={styles.alertContainer}>
                  <Text style={styles.alertHeader}>{alertInfo.text}</Text>
                </View>
              </SafeAreaView>
            )}
            {showPayment.show && (
              <View style={styles.paymentBox}>
                <View style={styles.paymentContainer}>
                  <TouchableOpacity style={styles.paymentClose} onPress={() => setShowpayment({ ...showPayment, show: false })}><AntDesign name="closecircleo" size={wsize(10)}/></TouchableOpacity>

                  <Text style={styles.paymentTableHeader}>Table #{showPayment.tableId}</Text>

                  <Text style={styles.paymentHeader}>Payment Detail</Text>

                  <FlatList
                    style={{ width: '100%' }}
                    data={showPayment.orders}
                    renderItem={({ item, index }) => 
                      <View style={styles.payment}>
                        {item.image.name && (
                          <View style={styles.itemImage}>
                            <Image 
                              style={resizePhoto(item.image, wsize(20))} 
                              source={{ uri: logo_url + item.image.name }}
                            />
                          </View>
                        )}

                        <View style={styles.paymentInfos}>
                          <Text style={[styles.paymentInfoHeader, { marginBottom: 20 }]}>{item.name}</Text>

                          {item.sizes.length > 0 && item.sizes.map(size => 
                            <Text 
                              key={size.key} 
                              style={styles.paymentInfoHeader}
                            >
                              {size["name"]} {"(" + item.quantity + ")"}
                            </Text>
                          )}
                          {item.quantities.length > 0 && item.quantities.map(quantity => 
                            <Text 
                              key={quantity.key} 
                              style={styles.paymentInfoHeader}
                            >
                              {quantity["input"]} {"(" + item.quantity + ")"}
                            </Text>
                          )}
                          {item.percents.length > 0 && item.percents.map(percent => 
                            <Text 
                              key={percent.key} 
                              style={styles.paymentInfoHeader}
                            >
                              {percent["input"]}
                            </Text>
                          )}

                          <Text style={styles.paymentInfoHeader}>${item.cost}</Text>
                        </View>
                      </View>
                    }
                  />

                  <View style={styles.paymentTotalInfos}>
                    <Text style={styles.paymentTotalInfoHeader}>Subtotal: $ {showPayment.paymentInfo.subTotalcost}</Text>
                    <Text style={styles.paymentTotalInfoHeader}>Total: $ {showPayment.paymentInfo.totalCost}</Text>
                  </View>

                  <TouchableOpacity style={styles.paymentFinish} onPress={() => finishTheDining()}>
                    <Text style={styles.paymentFinishHeader}>Finish Dining</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {showProductinfo.show && (
              <View style={styles.productInfoBox}>
                <View style={styles.productInfoContainer}>
                  <View style={{ alignItems: 'center' }}>
                    <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
                      <View style={{ alignItems: 'center' }}>
                        <TouchableOpacity style={styles.productInfoClose} onPress={() => setShowproductinfo({ ...showProductinfo, show: false, loading: false })}>
                          <AntDesign name="closecircleo" size={wsize(10)}/>
                        </TouchableOpacity>

                        {showProductinfo.image.name && (
                          <View style={styles.styles.imageHolder}>
                            <Image source={{ uri: logo_url + showProductinfo.image.name }} style={styles.image}/>
                          </View>
                        )}

                        <Text style={styles.productInfoHeader}>{showProductinfo.name}</Text>

                        <View style={styles.optionsBox}>
                          {(sizes.length > 0 || quantities.length) > 0 && (
                            <Text style={styles.optionsHeader}>
                              {sizes.length > 0 ? 
                                sizes.length == 1 ? "(1 size only)" : "Select a size"
                                :
                                quantities.length == 1 ? "(1 quantity only)" : "Select a quantity"
                              }
                            </Text>
                          )}

                          <View style={styles.options}>
                            {sizes.length > 0 && (
                              sizes.length == 1 ? 
                                <View style={styles.option}>
                                  <Text style={styles.optionPrice}>{sizes[0].name + ": $" + sizes[0].price}</Text>
                                </View>
                                :
                                sizes.map((size, index) => (
                                  <View key={size.key} style={styles.option}>
                                    <TouchableOpacity style={size.selected ? styles.optionTouchDisabled : styles.optionTouch} onPress={() => selectOption(index, "size")}>
                                      <Text style={size.selected ? styles.optionTouchDisabledHeader : styles.optionTouchHeader}>{size.name}</Text>
                                    </TouchableOpacity>
                                    <View style={styles.column}><Text style={styles.optionPrice}>$ {size.price}</Text></View>
                                  </View>
                                ))
                            )}

                            {quantities.length > 0 && (
                              quantities.length == 1 ? 
                                <View style={styles.option}>
                                  <Text style={styles.optionPrice}>{quantities[0].input + ": $" + quantities[0].price}</Text>
                                </View>
                                :
                                quantities.map((quantity, index) => (
                                  <View key={quantity.key} style={styles.option}>
                                    <TouchableOpacity style={quantity.selected ? styles.optionTouchDisabled : styles.optionTouch} onPress={() => selectOption(index, "quantity")}>
                                      <Text style={quantity.selected ? styles.optionTouchDisabledHeader : styles.optionTouchHeader}>{quantity.input}</Text>
                                    </TouchableOpacity>
                                    <View style={styles.column}><Text style={styles.optionPrice}>$ {quantity.price}</Text></View>
                                  </View>
                                ))
                            )}

                            {percents.length > 0 && (
                              percents.length == 1 ? 
                                <View style={styles.option}>
                                  <Text style={styles.optionPrice}>{percents[0].input + ": $" + percents[0].price}</Text>
                                </View>
                                :
                                percents.map((percent, index) => (
                                  <View key={percent.key} style={styles.option}>
                                    <TouchableOpacity style={percent.selected ? styles.optionTouchDisabled : styles.optionTouch} onPress={() => selectOption(index, "percent")}>
                                      <Text style={percent.selected ? styles.optionTouchDisabledHeader : styles.optionTouchHeader}>{percent.input}</Text>
                                    </TouchableOpacity>
                                    <View style={styles.column}><Text style={styles.optionPrice}>$ {percent.price}</Text></View>
                                  </View>
                                ))
                            )}
                          </View>
                        </View>

                        <View style={styles.quantityRow}>
                          <View style={styles.quantity}>
                            <View style={styles.column}><Text style={styles.quantityHeader}>Quantity:</Text></View>
                            <View style={styles.column}><Text style={styles.quantityAction} onPress={() => changeQuantity("-")}>-</Text></View>
                            <View style={styles.column}><Text style={styles.quantityHeader}>{showProductinfo.quantity}</Text></View>
                            <View style={styles.column}><Text style={styles.quantityAction} onPress={() => changeQuantity("+")}>+</Text></View>
                          </View>
                        </View>

                        <Text style={styles.price}>Cost: ${showProductinfo.cost.toFixed(2)}</Text>

                        <View style={styles.note}>
                          <Text style={styles.noteHeader}>Add some instruction if you want ?</Text>

                          <View style={styles.noteInputContainer}>
                            <TextInput
                              style={styles.noteInput} multiline
                              placeholdertextcolor="rgba(127, 127, 127, 0.8)" placeholder="Type in here"
                              maxlength={100} onChangeText={note => setShowproductinfo({ ...showProductinfo, note })}
                            />
                          </View>
                        </View>

                        {showProductinfo.errorMsg ? <Text style={styles.errorMsg}>{showProductinfo.errorMsg}</Text> : null}

                        <View style={styles.productInfoItemActions}>
                          <TouchableOpacity disabled={showProductinfo.loading} style={[styles.productInfoItemAction, { opacity: showProductinfo.loading ? 0.1 : 1 }]} onPress={() => addToOrders()}>
                            <Text style={styles.productInfoItemActionHeader}>Add to Orders</Text>
                          </TouchableOpacity>
                        </View>

                        {showProductinfo.loading && <Loadingprogress/>}
                      </View>
                    </ScrollView>
                  </View>
                </View>
              </View>
            )}
            {showCurrentorders.show && (
              <View style={styles.showOrdersBox}>
                <View style={styles.showOrdersContainer}>
                  <TouchableOpacity style={styles.showOrdersClose} onPress={() => setShowcurrentorders({ ...showCurrentorders, show: false })}>
                    <AntDesign name="closecircleo" size={wsize(10)}/>
                  </TouchableOpacity>
                  <Text style={styles.showOrdersHeader}>{showCurrentorders.orders.length} Order(s)</Text>

                  <TouchableOpacity style={styles.showOrdersSend} onPress={() => sendOrders()}>
                    <Text style={styles.showOrdersSendHeader}>Send to{'\n'}Kitchen</Text>
                  </TouchableOpacity>

                  <View style={styles.showOrdersList}>
                    <FlatList
                      data={showCurrentorders.orders}
                      renderItem={({ item, index }) => 
                        <View key={item.key} style={styles.showOrder}>
                          <View style={{ width: '33.3%' }}>
                            {item.image.name && (
                              <View style={styles.showOrderPhoto}>
                                <Image style={{ height: '100%', width: '100%' }} source={{ uri: logo_url + item.image.name }}/>
                              </View>
                            )}
                            <Text style={styles.showOrderHeader}>{item.name}</Text>
                          </View>
                          <View style={{ width: '33.3%' }}>
                            {item.price ? 
                              <Text>$ {item.price} ({item.quantity})</Text>
                              :
                              <>
                                {item.sizes.map(info => info.selected ? <Text key={info.key}>{info.name}: ${info.price} ({item.quantity})</Text> : <Text key={info.key}></Text>)}
                                {item.quantities.map(info => info.selected ? <Text key={info.key}>{info.input}: ${info.price} ({item.quantity})</Text> : <Text key={info.key}></Text>)}
                              </>
                            }

                            {item.percents.map(info => info.selected ? <Text key={info.key}>{info.input}: ${info.price}</Text> : <Text key={info.key}></Text>)}

                            <Text style={styles.showOrderCost}>Cost: $ {item.cost}</Text>
                          </View>
                          <TouchableOpacity style={styles.showOrderDelete} onPress={() => deleteOrder(index)}>
                            <AntDesign name="closecircleo" size={wsize(10)}/>
                          </TouchableOpacity>
                        </View>
                      }
                    />
                  </View>
                </View>
              </View>
            )}
            {orderSentalert && (
              <View style={styles.orderSentAlertBox}>
                <View style={styles.orderSentAlertContainer}>
                  <Text style={styles.orderSentAlertHeader}>
                    Your order(s) has been sent{'\n'}to the kitchen
                  </Text>
                </View>
              </View>
            )}
            {showTableorders.show && (
              <View style={styles.showOrdersBox}>
                <View style={styles.showOrdersContainer}>
                  <TouchableOpacity style={styles.showOrdersClose} onPress={() => setShowtableorders({ ...showTableorders, show: false })}>
                    <AntDesign name="closecircleo" size={wsize(10)}/>
                  </TouchableOpacity>
                  <Text style={styles.showOrdersHeader}>{showTableorders.orders.length} Ordered</Text>

                  <View style={styles.showOrdersList}>
                    <FlatList
                      data={showTableorders.orders}
                      renderItem={({ item, index }) => 
                        <View key={item.key} style={styles.showOrder}>
                          <View style={{ width: '50%' }}>
                            {item.image.name && (
                              <View style={styles.showOrderPhoto}>
                                <Image style={{ height: '100%', width: '100%' }} source={{ uri: logo_url + item.image.name }}/>
                              </View>
                            )}

                            <Text style={styles.showOrderHeader}>{item.name}</Text>
                          </View>
                          <View style={{ width: '50%' }}>
                            {item.price ? 
                              <Text>$ {item.price} ({item.quantity})</Text>
                              :
                              <>
                                {item.sizes.map(info => <Text key={info.key}>{info.name}: ${info.price}</Text>)}
                                {item.quantities.map(info => <Text key={info.key}>{info.input}: ${info.price}</Text>)}
                              </>
                            }

                            {item.percents.map(info => info.selected ? <Text key={info.key}>{info.input}: ${info.price}</Text> : <Text></Text>)}

                            <Text style={styles.showOrderCost}>Cost: $ {item.cost}</Text>
                          </View>
                        </View>
                      }
                    />
                  </View>
                </View>
              </View>
            )}
            {showQr.show && (
              <View style={styles.qrBox}>
                <View style={styles.qrContainer}>
                  <TouchableOpacity style={styles.qrClose} onPress={() => setShowqr({ ...showQr, show: false, table: "" })}>
                    <AntDesign name="close" size={wsize(10)}/>
                  </TouchableOpacity>

                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.qrHeader}>{tr.t("tables.hidden.qr.header")}{showQr.table}</Text>

                    <QRCode size={wsize(80)} value={showQr.codeText}/>
                  </View>
                </View>
              </View>
            )}
            {switchAccountauth.show && (
              <View style={styles.switchAccountAuthBox}>
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                  <View style={styles.switchAccountAuthContainer}>
                    <TouchableOpacity style={styles.switchAccountAuthClose} onPress={() => {
                      setSwitchaccountauth({ ...switchAccountauth, show: false, type: '', password: '', errorMsg: '' })
                      setShowmoreoptions({ ...showMoreoptions, show: false })
                    }}>
                      <AntDesign name="close" size={wsize(10)}/>
                    </TouchableOpacity>

                    <Text style={styles.switchAccountAuthHeader}>Enter password for {"'" + switchAccountauth.type + "'"}</Text>

                    <TextInput style={styles.switchAccountAuthInput} secureTextEntry={true} onChangeText={password => setSwitchaccountauth({ ...switchAccountauth, password, errorMsg: '' })}/>

                    <Text style={styles.errorMsg}>{switchAccountauth.errorMsg}</Text>

                    <View style={styles.switchAccountAuthActions}>
                      <TouchableOpacity style={styles.switchAccountAuthAction} onPress={() => {
                        setSwitchaccountauth({ ...switchAccountauth, show: false, type: '', password: '', errorMsg: '' })
                        setShowmoreoptions({ ...showMoreoptions, show: false })
                      }}>
                        <Text style={styles.switchAccountAuthActionHeader}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.switchAccountAuthAction} onPress={() => verifyTheSwitchAccount()}>
                        <Text style={styles.switchAccountAuthActionHeader}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
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

  viewTypes: { flexDirection: 'row', justifyContent: 'space-around' },
  viewType: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: '40%' },
  viewTypeHeader: { fontSize: wsize(4), textAlign: 'center' },

	// body
	body: { height: '90%', width: '100%' },

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
	scheduleHeader: { fontSize: wsize(4.5), fontWeight: 'bold', textAlign: 'center' },
  scheduleInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(6), padding: 5, width: '90%' },
	scheduleActions: { flexDirection: 'row', justifyContent: 'space-around' },
  column: { flexDirection: 'column', justifyContent: 'space-around' },
	scheduleAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, paddingVertical: 10, width: wsize(30) },
	scheduleActionHeader: { fontSize: wsize(4), textAlign: 'center' },

  chartActions: { flexDirection: 'row', justifyContent: 'space-around' },
  chartAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: '40%' },
  chartActionHeader: { textAlign: 'center' },
  chartRow: { flexDirection: 'row', width: '100%' },
  chartTimeHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
  chartWorker: { alignItems: 'center', borderColor: 'grey', borderStyle: 'solid', borderWidth: 1, flexDirection: 'row', justifyContent: 'space-around' },
  chartWorkerHeader: { fontSize: wsize(6), textAlign: 'center' },
  chartWorkerProfile: { borderRadius: 20, height: 40, overflow: 'hidden', width: 40 },
  chartTime: { alignItems: 'center', borderColor: 'grey', borderStyle: 'solid', borderWidth: 1, flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 },
  chartScheduledInfo: { fontSize: wsize(4), fontWeight: 'bold' },
  chartScheduledActions: { flexDirection: 'row', justifyContent: 'space-around' },
  chartScheduledAction: {  },

	cartorderer: { backgroundColor: 'white', borderRadius: 5, flexDirection: 'row', justifyContent: 'space-around', margin: 10, padding: 5, width: wsize(100) - 20 },
	cartordererInfo: { alignItems: 'center' },
	cartordererUsername: { fontSize: wsize(5), fontWeight: 'bold', marginBottom: 10 },
	cartordererOrderNumber: { fontSize: wsize(7), fontWeight: 'bold', paddingVertical: 5 },
  cartordererActions: { flexDirection: 'row', justifyContent: 'space-around' },
	cartordererAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: wsize(30) },
	cartordererActionHeader: { fontSize: wsize(4), textAlign: 'center' },

  ordererTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: '30%' },
  ordererTouchHeader: { fontSize: wsize(4), textAlign: 'center' },
  ordererHeader: { fontSize: wsize(5), fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },

  tablesHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
  table: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: '2.5%', padding: 10, width: '30%' },
  tableHeader: { fontSize: wsize(4), fontWeight: 'bold', textAlign: 'center' },
  tableActions: {  },
  tableAction: { borderRadius: wsize(10) / 2, borderStyle: 'solid', borderWidth: 2, margin: 5, width: '90%' },
  tableActionHeader: { fontSize: wsize(3), textAlign: 'center' },

  tableOrder: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, flexDirection: 'row', margin: 10 },
  order: { backgroundColor: 'black', borderRadius: 5, margin: '2%', padding: 5 },
  orderHeader: { color: 'black', fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
  orderItemImage: { width: '20%' },
  orderInfo: {  },
  orderInfoHeader: { color: 'white', fontSize: wsize(3), fontWeight: 'bold' },
  orderDone: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, padding: 3, width: '100%' },
  orderDoneHeader: { color: 'black', fontSize: wsize(4), textAlign: 'center' },
  seeOrders: { alignItems: 'center', backgroundColor: 'black', borderRadius: 10, flexDirection: 'row', justifyContent: 'space-around', marginVertical: 2, padding: 10 },
  seeOrdersHeader: { color: 'white', fontSize: wsize(6), fontWeight: 'bold', textAlign: 'center' },
  addTable: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginBottom: 20, padding: 5 },
  addTableHeader: { fontSize: wsize(5), textAlign: 'center' },

  tableBill: { backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', margin: '2%', padding: 5 },
  tableBillHeader: { fontSize: wsize(7), fontWeight: 'bold', marginHorizontal: 10 },
  tableBillOption: { alignItems: 'center', backgroundColor: 'black', borderRadius: 10, flexDirection: 'row', justifyContent: 'space-around', marginVertical: 2, padding: 10 },
  tableBillOptionHeader: { color: 'white', fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },

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
  showInfoHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
  workerInfoList: { marginVertical: 40, width: '100%' },
  workerInfo: { alignItems: 'center' },
  workerInfoProfile: { borderRadius: wsize(30) / 2, height: wsize(30), overflow: 'hidden', width: wsize(30) },
  workerInfoName: { color: 'black', fontSize: wsize(5), fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  workerTime: {  },
  workerTimeContainer: { flexDirection: 'row', marginBottom: 20 },
  dayHeader: { fontSize: wsize(5) },
  timeHeaders: { flexDirection: 'row' },
  timeHeader: { fontSize: wsize(5), fontWeight: 'bold' },

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
  
  moreOptionsBox: { alignItems: 'center', marginHorizontal: 10, marginVertical: 50 },
  moreOptionsHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
  moreOptions: { flexDirection: 'row', justifyContent: 'space-between' },
  moreOption: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: '45%' },
  moreOptionHeader: { textAlign: 'center' },

  updateButtons: { flexDirection: 'row', justifyContent: 'space-around' },
  updateButton: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 10 },
  updateButtonHeader: { fontSize: wsize(5), fontWeight: 'bold' },

  scheduleOptionBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  scheduleOptions: { flexDirection: 'column', height: '50%', justifyContent: 'space-around' },
  scheduleOption: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 10 },
  scheduleOptionHeaderBox: { backgroundColor: 'white', flexDirection: 'column', height: '20%', justifyContent: 'space-around', width: '100%' },
  scheduleOptionHeader: { fontSize: wsize(6), paddingHorizontal: '5%', textAlign: 'center' },
  scheduleBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  scheduleCancelInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), height: 200, margin: '5%', padding: 10, width: '90%' },
  scheduleCancelActions: { flexDirection: 'row', justifyContent: 'space-around' },
  scheduleCancelTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: wsize(30) },
  scheduleCancelTouchHeader: { fontSize: wsize(5), textAlign: 'center' },
  schedulePushActions: { alignItems: 'center', marginVertical: 20, width: '100%' },
  schedulePushAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 10, padding: 10, width: '50%' },
  schedulePushActionHeader: { fontSize: wsize(6), textAlign: 'center' },
  scheduleSubmit: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 10, width: '60%' },
  scheduleSubmitHeader: { fontSize: wsize(5), textAlign: 'center' },

  alertBox: { backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', justifyContent: 'space-around', height: '100%', width: '100%' },
  alertContainer: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '30%', justifyContent: 'space-around', width: '100%' },
  alertHeader: { color: 'red', fontSize: wsize(6), fontWeight: 'bold', paddingHorizontal: 10 },

  paymentBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  paymentContainer: { alignItems: 'center', backgroundColor: 'white', height: '95%', width: '95%' },
  paymentClose: { marginVertical: 20 },
  paymentTableHeader: { fontSize: wsize(6), fontWeight: 'bold', marginVertical: 5, textAlign: 'center' },
  paymentHeader: { fontSize: wsize(6), fontWeight: 'bold' },
  payment: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, flexDirection: 'row', justifyContent: 'space-between', margin: '2%', padding: 5 },
  paymentInfos: {  },
  paymentInfoHeader: { fontSize: wsize(4), fontWeight: 'bold' },
  paymentTotalInfos: { },
  paymentTotalInfoHeader: { fontSize: wsize(5), textAlign: 'center' },
  paymentFinish: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 20, padding: 5 },
  paymentFinishHeader: { fontSize: wsize(5), textAlign: 'center' },

  productInfoBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  productInfoContainer: { alignItems: 'center', backgroundColor: 'white', height: '80%', overflowY: 'scroll', width: '80%' },
  productInfoClose: { height: 50, marginVertical: 20, width: 50 },
  imageHolder: { borderRadius: 50, height: 100, overflow: 'hidden', width: 100 },
  image: { height: '100%', width: '100%' },
  productInfoHeader: { fontSize: wsize(5), fontWeight: 'bold', paddingVertical: 10, textAlign: 'center' },
  info: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 30, paddingHorizontal: 5 },
  infoHeader: { fontWeight: 'bold', marginVertical: 7, marginRight: 20 },
  amount: { flexDirection: 'row', justifyContent: 'space-between', width: 100 },
  amountAction: { borderRadius: 5 },
  amountHeader: { fontSize: wsize(5), fontWeight: 'bold', padding: 10 },
  percentage: { flexDirection: 'row', justifyContent: 'space-between', width: 100 },
  percentageAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, height: 35, paddingTop: 8, width: 35 },
  percentageHeader: { fontSize: wsize(5), fontWeight: 'bold', padding: 10 },
  optionsBox: { marginVertical: 20, width: '80%' },
  optionsHeader: { fontSize: wsize(5), fontWeight: 'bold' },
  options: {  },
  option: { flexDirection: 'row', marginVertical: 5 },
  optionTouchDisabled: { backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, color: 'white', padding: 10 },
  optionTouchDisabledHeader: { color: 'white', textAlign: 'center' },
  optionTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, padding: 10 },
  optionTouchHeader: { textAlign: 'center' },
  optionPrice: { fontWeight: 'bold', marginHorizontal: 10 },
  note: { marginTop: 10, width: '90%' },
  noteHeader: { fontWeight: 'bold', textAlign: 'center' },
  noteInputContainer: { width: '100%' },
  noteInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), height: 100, padding: 5, width: '100%' },
  quantityRow: { flexDirection: 'row', justifyContent: 'space-around' },
  quantity: { flexDirection: 'row', justifyContent: 'space-around' },
  quantityHeader: { borderRadius: 5, fontSize: wsize(5), fontWeight: 'bold', paddingVertical: 5 },
  quantityAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginHorizontal: 10, padding: 10 },
  price: { fontSize: wsize(5), fontWeight: 'bold', marginTop: 20, textAlign: 'center' },
  productInfoItemActions: { flexDirection: 'row', justifyContent: 'space-around' },
  productInfoItemAction: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, margin: 10, padding: 10, width: 100 },
  productInfoItemActionHeader: { fontSize: wsize(5), textAlign: 'center' },

  showOrdersBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  showOrdersContainer: { alignItems: 'center', backgroundColor: 'white', height: '90%', width: '90%' },
  showOrdersClose: { height: wsize(10), marginVertical: 20, width: wsize(10) },
  showOrdersHeader: { fontSize: wsize(5), fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
  showOrdersSend: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, marginVertical: 20, padding: 5, width: 100 },
  showOrdersSendHeader: { textAlign: 'center' },
  showOrdersList: { height: '60%', width: '100%' },
  showOrder: { borderStyle: 'solid', borderBottomWidth: 1, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 10, width: '100%' },
  showOrderPhoto: { height: wsize(20), width: wsize(20) },
  showOrderCost: { fontWeight: 'bold', marginTop: 30 },
  showOrderDelete: { height: wsize(10), width: wsize(10) },

  orderSentAlertBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  orderSentAlertContainer: { backgroundColor: 'white', flexDirection: 'column', height: '30%', justifyContent: 'space-around', width: '90%' },
  orderSentAlertHeader: { fontSize: wsize(5), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },

  qrBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  qrContainer: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  qrHeader: { fontSize: wsize(6), fontWeight: 'bold', textAlign: 'center' },

  switchAccountAuthBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  switchAccountAuthContainer: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '90%' },
  switchAccountAuthHeader: { fontSize: wsize(5), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
  switchAccountAuthInput: { borderStyle: 'solid', borderWidth: 2, fontSize: wsize(6), padding: 5, width: '90%' },
  switchAccountAuthActions: { flexDirection: 'row', justifyContent: 'space-around', width: '80%' },
  switchAccountAuthAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
  switchAccountAuthActionHeader: { fontSize: wsize(5), textAlign: 'center' },

  loading: { alignItems: 'center', flexDirection: 'column', height: '90%', justifyContent: 'space-around', width: '100%' },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  column: { flexDirection: 'column', justifyContent: 'space-around' },
  errorMsg: { color: 'darkred', fontSize: wsize(4), textAlign: 'center' }
})
