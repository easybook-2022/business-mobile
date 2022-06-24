import React, { useEffect, useState } from 'react'
import { 
  SafeAreaView, Platform, ScrollView, HorizontalScrollView, ActivityIndicator, Dimensions, 
  View, FlatList, Image, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, 
  Keyboard, StyleSheet, Modal, KeyboardAvoidingView
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKeepAwake } from 'expo-keep-awake'
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { CommonActions } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system'
import * as ImageManipulator from 'expo-image-manipulator'
import * as Speech from 'expo-speech'
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import Voice from '@react-native-voice/voice';
import { tr } from '../../assets/translate'
import { loginInfo, ownerSigninInfo, socket, logo_url, useSpeech, timeControl } from '../../assets/info'
import { getId, displayTime, resizePhoto, displayPhonenumber } from 'geottuse-tools'
import { 
  updateNotificationToken, verifyUser, addOwner, updateOwner, deleteOwner, getStylistInfo, 
  getOtherWorkers, getAccounts, getOwnerInfo, logoutUser, getWorkersTime, getAllWorkersTime, 
  getWorkersHour
} from '../apis/owners'
import { getLocationProfile, getLocationHours, setLocationHours, updateLocation, setReceiveType, getDayHours } from '../apis/locations'
import { getMenus, removeMenu, addNewMenu } from '../apis/menus'
import { cancelSchedule, doneService, getAppointments, getCartOrderers, removeBooking, getAppointmentInfo, blockTime } from '../apis/schedules'
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
  let updateWorkersHour
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  useKeepAwake()

  const [language, setLanguage] = useState('')
	const [notificationPermission, setNotificationpermission] = useState(null);
	const [ownerId, setOwnerid] = useState(null)
  const [isOwner, setIsowner] = useState(false)
	const [locationType, setLocationtype] = useState('')

	const [appointments, setAppointments] = useState({ list: [], loading: false })
  const [chartInfo, setChartinfo] = useState({ chart: {}, workers: [], workersHour: {}, dayDir: 0, date: {}, loading: false })
  const [removeBookingconfirm, setRemovebookingconfirm] = useState({ show: false, scheduleid: -1, client: { name: "", cellnumber: "" }, workerid: -1, date: {}, reason: "", confirm: false })

	const [cartOrderers, setCartorderers] = useState([])
  const [speakInfo, setSpeakinfo] = useState({ orderNumber: "" })

  const [loaded, setLoaded] = useState(false)

	const [viewType, setViewtype] = useState('')
	const [cancelInfo, setCancelinfo] = useState({ show: false, type: "", requestType: "", reason: "", id: 0, index: 0 })

	const [showDisabledscreen, setShowdisabledscreen] = useState(false)
  const [showInfo, setShowinfo] = useState({ show: false, workersHours: [], locationHours: [] })

  const [showMoreoptions, setShowmoreoptions] = useState({ show: false, loading: false, infoType: '' })
  const [editInfo, setEditinfo] = useState({ show: false, type: '', loading: false })
  const [accountForm, setAccountform] = useState({
    show: false,
    type: '', editType: '', addStep: 0, id: -1, self: false,
    username: '', editUsername: false,
    cellnumber: '', verified: false, verifyCode: '', editCellnumber: false,
    currentPassword: '', newPassword: '', confirmPassword: '', editPassword: false,
    profile: { uri: '', name: '', size: { width: 0, height: 0 }}, editProfile: false, camType: 'front',
    workerHours: [], editHours: false,
    loading: false,
    errorMsg: ''
  })

  const [locationInfo, setLocationinfo] = useState('')
  const [locationCoords, setLocationcoords] = useState({ longitude: null, latitude: null, address: '' })
  const [storeName, setStorename] = useState(loginInfo.storeName)
  const [phonenumber, setPhonenumber] = useState(loginInfo.phonenumber)
  const [addressOne, setAddressone] = useState(loginInfo.addressOne)
  const [addressTwo, setAddresstwo] = useState(loginInfo.addressTwo)
  const [city, setCity] = useState(loginInfo.city)
  const [province, setProvince] = useState(loginInfo.province)
  const [postalcode, setPostalcode] = useState(loginInfo.postalcode)
  const [logo, setLogo] = useState({ uri: '', name: '', size: { width: 0, height: 0 }, loading: false })
  const [locationReceivetype, setLocationreceivetype] = useState('')

  const [locationHours, setLocationhours] = useState([
    { key: "0", header: "Sunday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, close: false },
    { key: "1", header: "Monday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, close: false },
    { key: "2", header: "Tuesday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, close: false },
    { key: "3", header: "Wednesday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, close: false },
    { key: "4", header: "Thursday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, close: false },
    { key: "5", header: "Friday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, close: false },
    { key: "6", header: "Saturday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, close: false }
  ])
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
  const [timeRange, setTimerange] = useState([
    { key: "0", header: "Sunday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, working: true, takeShift: "" },
    { key: "1", header: "Monday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, working: true, takeShift: "" },
    { key: "2", header: "Tuesday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, working: true, takeShift: "" },
    { key: "3", header: "Wednesday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, working: true, takeShift: "" },
    { key: "4", header: "Thursday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, working: true, takeShift: "" },
    { key: "5", header: "Friday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, working: true, takeShift: "" },
    { key: "6", header: "Saturday", opentime: { hour: "06", minute: "00", period: "AM" }, closetime: { hour: "09", minute: "00", period: "PM" }, working: true, takeShift: "" }
  ])
  const [hoursInfo, setHoursinfo] = useState({})
  const [getWorkersbox, setGetworkersbox] = useState({ show: false, day: '', workers: [] })

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
					const { name, fullAddress, logo, type, receiveType, hours } = res.info
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

              locationHours.push({ key: locationHours.length.toString(), header, opentime: {...hours[k].opentime}, closetime: {...hours[k].closetime} })

              hours[k].opentime.hour = openHour.toString()
              hours[k].opentime.minute = openMinute.toString()
              hours[k].closetime.hour = closeHour.toString()
              hours[k].closetime.minute = closeMinute.toString()

              hours[k]["date"] = dateStr
              hours[k]["openunix"] = Date.parse(dateStr + " " + openTime)
              hours[k]["closeunix"] = Date.parse(dateStr + " " + closeTime)
              hours[k]["working"] = true
            }

						setOwnerid(ownerid)
						setStorename(name)
            setPhonenumber(phonenumber)
            setAddressone(addressOne)
            setAddresstwo(addressTwo)
            setCity(city)
            setProvince(province)
            setPostalcode(postalcode)
            setLogo({ ...logo, uri: logo_url + logo.name, size: { width: logo.width, height: logo.height }})
            setLocationtype(type)
            setLocationreceivetype(receiveType)
            setLocationhours(hours)
            setShowinfo({ ...showInfo, locationHours })
            setTimerange(hours)

						if (type == 'store' || type == 'restaurant') {
              getAllCartOrderers()
						} else {
              getTheWorkersHour()
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
          setShowinfo({ ...showInfo, show: true, workersHours: res.workers })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getTheWorkersHour = async() => {
    const locationid = await AsyncStorage.getItem("locationid")
    const data = { locationid, ownerid: null }

    getWorkersHour(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { workersHour } = res

          let date = new Date(Date.now())
          let jsonDate = {"day":days[date.getDay()].substr(0, 3),"month":months[date.getMonth()],"date":date.getDate(),"year":date.getFullYear()}

          for (let worker in workersHour) {
            for (let day in workersHour[worker]) {
              if (day != "scheduled" && day != "profileInfo") {
                let { open, close } = workersHour[worker][day]

                workersHour[worker][day]["open"] = jsonDateToUnix({ ...jsonDate, "hour": open["hour"], "minute": open["minute"] })
                workersHour[worker][day]["close"] = jsonDateToUnix({ ...jsonDate, "hour": close["hour"], "minute": close["minute"] })
              } else if (day == "scheduled") {
                let scheduled = workersHour[worker][day]
                let newScheduled = {}

                for (let info in scheduled) {
                  let splitInfo = info.split("-")
                  let time = splitInfo[0]
                  let status = splitInfo[1]

                  newScheduled[jsonDateToUnix(JSON.parse(time)) + "-" + status] = scheduled[info]
                }

                workersHour[worker][day] = newScheduled
              }
            }
          }

          setChartinfo({ ...chartInfo, workersHour })
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

    let jsonDate, newWorkersTime = {}, hourInfo = hoursInfo[days[date.getDay()].substr(0, 3)]
    let closedtime = Date.parse(days[date.getDay()] + " " + months[date.getMonth()] + ", " + date.getDate() + " " + date.getFullYear() + " " + hourInfo["closeHour"] + ":" + hourInfo["closeMinute"])
    let now = Date.parse(days[today.getDay()] + " " + months[today.getMonth()] + ", " + today.getDate() + " " + today.getFullYear() + " " + today.getHours() + ":" + today.getMinutes())
    let day = days[date.getDay()].substr(0, 3), working = false

    for (let worker in newWorkershour) {
      for (let info in newWorkershour[worker]) {
        if (info == day && newWorkershour[worker][info]["working"] == true && working == false) {
          working = true
        } else if (info != "scheduled" && info != "profileInfo") {
          let dayHourInfo = hoursInfo[day]

          newWorkershour[worker][day]["open"] = jsonDateToUnix({
            "day":days[date.getDay()].substr(0, 3),"month":months[date.getMonth()],
            "date":date.getDate(),"year":date.getFullYear(), 
            "hour": dayHourInfo["openHour"], "minute": dayHourInfo["openMinute"]
          })
          newWorkershour[worker][day]["close"] = jsonDateToUnix({
            "day":days[date.getDay()].substr(0, 3),"month":months[date.getMonth()],
            "date":date.getDate(),"year":date.getFullYear(), 
            "hour": dayHourInfo["closeHour"], "minute": dayHourInfo["closeMinute"]
          })
        }
      }
    }

    if (dir == null && (now > closedtime || working == false)) {
      getAppointmentsChart(dayDir + 1)
    } else {
      if (dayDir != 0) date.setDate(today.getDate() + dayDir)

      jsonDate = {"day":days[date.getDay()].substr(0, 3),"month":months[date.getMonth()],"date":date.getDate(),"year":date.getFullYear()}

      const data = { locationid, jsonDate }

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

            chart = { 
              "key": dayDir.toString(), 
              "times": times, 
              "dateHeader": tr.t("days." + days[date.getDay()]) + ", " + jsonDate["month"] + " " + jsonDate["date"] + ", " + jsonDate["year"]
            }

            setChartinfo({ 
              ...chartInfo, chart, workers, 
              workersHour: newWorkershour, 
              dayDir, date: jsonDate, 
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
  }
  const blockTheTime = (workerid, jsonDate) => {
    const newWorkershour = {...chartInfo.workersHour}
    const data = { workerid, jsonDate: JSON.stringify(jsonDate) }
    const unix = jsonDateToUnix(jsonDate)

    blockTime(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          if (res.action == "add") {
            newWorkershour[workerid]["scheduled"][unix + "-b"] = res.id
          } else {
            if (unix + "-b" in newWorkershour[workerid]["scheduled"]) {
              delete newWorkershour[workerid]["scheduled"][unix + "-b"]
            }
          }

          setChartinfo({ ...chartInfo, workersHour: newWorkershour })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const removeTheBooking = id => {
    if (!removeBookingconfirm.show) {
      getAppointmentInfo(id)
        .then((res) => {
          if (res.status == 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            const { client, worker, time } = res

            setRemovebookingconfirm({ 
              ...removeBookingconfirm, 
              show: true, scheduleid: id, workerid: worker.id, 
              client: { name: client.name, cellnumber: client.cellnumber }, 
              date: jsonDateToUnix(time) 
            })
          }
        })
    } else {
      const { scheduleid, workerid, date, reason } = removeBookingconfirm
      const newWorkershour = {...chartInfo.workersHour}
      let data = { scheduleid, reason, type: "cancelSchedule" }

      if (date + "-c" in newWorkershour[workerid]["scheduled"]) {
        delete newWorkershour[workerid]["scheduled"][date + "-c"]
      }

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
              setRemovebookingconfirm({ ...removeBookingconfirm, confirm: true })
              setChartinfo({ ...chartInfo, workersHour: newWorkershour })

              setTimeout(function () {
                setRemovebookingconfirm({ ...removeBookingconfirm, show: false, confirm: false })
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
    const { list } = {...appointments}
		let id, type, item = index != null ? list[index] : list[cancelInfo.index]

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
                  const { list } = {...appointments}

                  list.splice(index, 1)

                  setAppointments({ ...appointments, list })

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
          const { list } = {...appointments}
          let data = { id, type: "doneService", receiver: res.receiver }

          list.splice(index, 1)

          socket.emit("socket/doneService", data, () => {
            setAppointments({ ...appointments, list })
            getTheWorkersHour()
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

            props.navigation.dispatch(CommonActions.reset({ index: 1, routes: [{ name: "auth" }]}));
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
        getTheWorkersHour()

        if (viewType == "appointments_list") {
          getListAppointments()
        }
          
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

    return () => {
      socket.off("updateSchedules")
      socket.off("updateOrders")
    }
	}
  
	const initialize = async() => {
    tr.locale = await AsyncStorage.getItem("language")

    setLanguage(await AsyncStorage.getItem("language"))

		getTheLocationProfile()
    getTheLocationHours()
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
  const updateYourLocation = async() => {
    if (storeName && phonenumber && addressOne && city && province && postalcode) {
      let longitude = null, latitude = null

      try {
        const [info] = await Location.geocodeAsync(`${addressOne}${addressTwo ? ' ' + addressTwo : ''}, ${city} ${province}, ${postalcode}`)

        longitude = info.longitude
        latitude = info.latitude
      } catch(err) {

      }

      if (longitude && latitude) {
        const id = await AsyncStorage.getItem("locationid")
        const time = (Date.now() / 1000).toString().split(".")[0]
        const data = {
          id, storeName, phonenumber, addressOne, addressTwo, city, province, postalcode, logo,
          longitude, latitude
        }

        updateLocation(data)
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
    } else {
      if (!storeName) {
        setEditinfo({ ...editInfo, errorMsg: "Please enter your store name" })

        return
      }

      if (!phonenumber) {
        setEditinfo({ ...editInfo, errorMsg: "Please enter your store phone number" })

        return
      }

      if (!addressOne) {
        setEditinfo({ ...editInfo, errorMsg: "Please enter the Address # 1" })

        return
      }

      if (!addressTwo) {
        setEditinfo({ ...editInfo, errorMsg: "Please enter the Address # 2" })

        return
      }

      if (!city) {
        setEditinfo({ ...editInfo, errorMsg: "Please enter the city" })

        return
      }

      if (!province) {
        setEditinfo({ ...editInfo, errorMsg: "Please enter the province" })

        return
      }

      if (!postalcode) {
        setEditinfo({ ...editInfo, errorMsg: "Please enter the postal code" })

        return
      }
    }
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
        setLogo({
          uri: `${FileSystem.documentDirectory}/${char}.jpg`,
          name: `${char}.jpg`, size: { width, height: width }, 
          loading: false
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
  const markLocation = async() => {
    const getGeocoding = async() => {
      setLocationinfo('destination')

      const location = await Location.getCurrentPositionAsync({});
      const { longitude, latitude } = location.coords
      let address = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      for (let item of address) {
        setLocationcoords({ 
          longitude, 
          latitude,
          address: `${item.name}, ${item.subregion} ${item.region}, ${item.postalCode}`
        })
        setAddressone(item.name)
        setCity(item.subregion)
        setProvince(item.region)
        setPostalcode(item.postalCode)
      }
      
      setEditinfo({ ...editInfo, errorMsg: '' })
    }

    const { status } = await Location.getForegroundPermissionsAsync()

    if (status == 'granted') {
      getGeocoding()
    } else {
      const { status } = await Location.requestForegroundPermissionsAsync()

      if (status == 'granted') {
        getGeocoding()
      }
    }
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
          getTheWorkersHour()
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
  const updateWorkingHour = (index, timetype, dir, open) => {
    const newWorkerhours = [...accountForm.workerHours], timeRangeInfo = [...timeRange]
    let value, { openunix, closeunix, date } = timeRangeInfo[index]
    let { opentime, closetime } = newWorkerhours[index], valid = false

    value = open ? opentime : closetime

    let { hour, minute, period } = timeControl(timetype, value, dir, open)
    let calcTime = Date.parse(date + " " + hour + ":" + minute + " " + period)

    if (open) {
      valid = (calcTime >= openunix && calcTime <= Date.parse(date + " " + closetime.hour + ":" + closetime.minute + " " + closetime.period))
    } else {
      valid = (calcTime <= closeunix && calcTime >= Date.parse(date + " " + opentime.hour + ":" + opentime.minute + " " + opentime.period))
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
          setEditinfo({ ...editInfo, show: true })
          getAllAccounts()
          getTheWorkersHour()
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
  const selectTheOtherWorker = id => {
    const { day } = getWorkersbox

    const newWorkerhours = [...accountForm.workerHours]

    newWorkerhours.forEach(function (info) {
      if (info.header.substr(0, 3) == day) {
        info.takeShift = id.toString()
      }
    })

    setAccountform({...accountForm, workerHours: newWorkerhours })
    setGetworkersbox({ ...getWorkersbox, show: false })
  }
  const updateLocationHours = async() => {
    setEditinfo({ ...editInfo, loading: true })

    const locationid = await AsyncStorage.getItem("locationid")
    const hours = {}

    days.forEach(function (day) {
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
      newClosetime.hour = closehour

      delete newOpentime.period
      delete newClosetime.period

      hours[day.header.substr(0, 3)] = { opentime: newOpentime, closetime: newClosetime, close }
    })

    const data = { locationid, hours: JSON.stringify(hours) }

    setLocationHours(data)
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
  
	useEffect(() => {
    initialize()
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
          getTheWorkersHour()

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

  const header = (locationType == "hair" || locationType == "nail") && " Salon " || 
                  locationType == "restaurant" && " Restaurant " || 
                  locationType == "store" && " Store "
  const currenttime = Date.now()
  const { date, workersHour, workers } = chartInfo
  let currDay = date.day ? date.day.substr(0, 3) : ""

	return (
		<SafeAreaView style={styles.main}>
      {loaded ?
  			<View style={styles.box}>
  				<View style={styles.body}>
            <View style={{ flexDirection: 'column', height: '10%', justifyContent: 'space-around' }}>
              {(locationType == "hair" || locationType == "nail") ? 
                <View style={styles.viewTypes}>
                  <TouchableOpacity style={[styles.viewType, { backgroundColor: viewType == "appointments_list" ? "black" : "transparent" }]} onPress={() => getListAppointments()}>
                    <Text style={[styles.viewTypeHeader, { color: viewType == "appointments_list" ? "white": "black" }]}>{tr.t("main.navs.myAppointments")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.viewType, { backgroundColor: viewType == "appointments_chart" ? "black" : "transparent" }]} onPress={() => getAppointmentsChart(0, null)}>
                    <Text style={[styles.viewTypeHeader, { color: viewType == "appointments_chart" ? "white" : "black" }]}>{tr.t("main.navs.allAppointments")}</Text>
                  </TouchableOpacity>
                </View>
                :
                <View style={styles.viewTypes}>
                  <TouchableOpacity style={styles.viewType} onPress={() => getAllCartOrderers()}>
                    <Text style={styles.viewTypeHeader}>{tr.t("main.navs.cartOrderers")}</Text>
                  </TouchableOpacity>
                </View>
              }
            </View>

            {viewType == "appointments_list" && ( 
              !appointments.loading ?
                appointments.list.length > 0 ? 
                  <FlatList
                    data={appointments.list}
                    renderItem={({ item, index }) => 
                      <View key={item.key} style={styles.schedule}>
                        <Text style={styles.scheduleHeader}>{item.name}</Text>
                        <View style={styles.scheduleImageHolder}>
                          <Image 
                            style={resizePhoto(item.image, wsize(20))} 
                            source={item.image.name ? { uri: logo_url + item.image.name } : require("../../assets/noimage.jpeg")}
                          />
                        </View>
                          
                        <Text style={styles.scheduleHeader}>
                          {tr.t("main.list.clientName")} {item.client.username}
                          {'\n' + tr.t("main.list.staff") + ': ' + item.worker.username}
                          {'\n' + 
                            displayTime(item.time)
                              .replace("today at", tr.t("headers.todayAt"))
                              .replace("tomorrow at", tr.t("headers.tomorrowAt"))
                          }
                        </Text>

                        <View style={styles.scheduleActions}>
                          <View style={styles.column}>
                            <TouchableOpacity style={styles.scheduleAction} onPress={() => cancelTheSchedule(index, "appointment")}>
                              <Text style={styles.scheduleActionHeader}>{tr.t("buttons.cancel")}</Text>
                            </TouchableOpacity>
                          </View>
                          <View style={styles.column}>
                            <TouchableOpacity style={styles.scheduleAction} onPress={() => props.navigation.navigate("booktime", { scheduleid: item.id, serviceid: item.serviceid, serviceinfo: item.name })}>
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
                <ScrollView horizontal>
                  <View style={{ borderColor: 'black', borderStyle: 'solid', borderWidth: 2 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                      <View style={styles.column}>
                        <TouchableOpacity onPress={() => getAppointmentsChart(chartInfo.dayDir - 1, "left")}>
                          <AntDesign name="left" size={wsize(7)}/>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.column}>
                        <Text style={{ fontSize: wsize(8), fontWeight: 'bold', textAlign: 'center' }}>{chartInfo.chart.dateHeader}</Text>
                      </View>
                      <View style={styles.column}>
                        <TouchableOpacity onPress={() => getAppointmentsChart(chartInfo.dayDir + 1, "right")}>
                          <AntDesign name="right" size={wsize(7)}/>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.chartRow}>
                      {chartInfo.workers.map(worker => (
                        <View key={worker.key} style={[styles.chartWorker, { width: workers.length < 5 ? (width / workers.length) : 200 } ]}>
                          <Text style={styles.chartWorkerHeader}>{worker.username}</Text>
                          <View style={styles.chartWorkerProfile}>
                            <Image
                              style={resizePhoto(worker.profile, 40)}
                              source={worker.profile.name ? { uri: logo_url + worker.profile.name } : require("../../assets/profilepicture.jpeg")}
                            />
                          </View>
                        </View>
                      ))}
                    </View>

                    <ScrollView>
                      {chartInfo.chart.times && chartInfo.chart.times.map(item => (
                        <View key={item.key} style={styles.chartRow}>
                          <View style={styles.chartRow}>
                            {chartInfo.workers.map(worker => (
                              <TouchableOpacity
                                disabled={item.timepassed}
                                key={worker.key}
                                style={[
                                  styles.chartWorker,
                                  {
                                    backgroundColor: (
                                        item.time + "-c" in chartInfo.workersHour[worker.id]["scheduled"] || 
                                        item.time + "-b" in chartInfo.workersHour[worker.id]["scheduled"]
                                      ) ? 
                                      item.time + "-c" in chartInfo.workersHour[worker.id]["scheduled"] ? 
                                        'black' 
                                        :
                                        'grey'
                                      : 
                                      'transparent',
                                    opacity: (
                                      !item.timepassed
                                      ||
                                      item.time + "-b" in chartInfo.workersHour[worker.id]["scheduled"]
                                    ) ? 1 : 0.3,
                                    paddingVertical: 10,
                                    width: workers.length < 5 ? (width / workers.length) : 200
                                  }
                                ]}
                                onPress={() => {
                                  if (item.time + "-c" in chartInfo.workersHour[worker.id]["scheduled"]) {
                                    removeTheBooking(chartInfo.workersHour[worker.id]["scheduled"][item.time + "-c"])
                                  } else {
                                    blockTheTime(worker.id, item.jsonDate)
                                  }
                                }}
                              >
                                <Text style={[styles.chartTimeHeader, 
                                  { 
                                    color: (
                                      item.time >= chartInfo.workersHour[worker.id][currDay]["open"] && item.time < chartInfo.workersHour[worker.id][currDay]["close"] ?
                                        item.time + "-c" in chartInfo.workersHour[worker.id]["scheduled"] ? 'white' : 'black'
                                        :
                                        'black'
                                    )
                                  }
                                ]}
                                >{item.timeDisplay}</Text>
                              </TouchableOpacity>
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
                              props.navigation.navigate("cartorders", { userid: item.adder, type: item.type, ordernumber: item.orderNumber, refetch: () => {
                                getAllCartOrderers()
                                removeFromList(item.id, "cartOrderers")
                              }})
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
  				</View>

  				<View style={styles.bottomNavs}>
  					<View style={styles.bottomNavsRow}>
              <View style={styles.column}>
                <TouchableOpacity style={styles.bottomNavButton} onPress={() => setShowmoreoptions({ ...showMoreoptions, show: true })}>
                  <Text style={styles.bottomNavButtonHeader}>{tr.t("main.bottomNavs.changeInfo")}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.column}>
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

              <View style={styles.column}>
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

      {(cancelInfo.show || showInfo.show || showMoreoptions.show || removeBookingconfirm.show || showDisabledscreen) && (
        <Modal transparent={true}>
    			{cancelInfo.show && (
  					<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
  						<SafeAreaView style={styles.cancelRequestBox}>
  							<Text style={styles.cancelRequestHeader}>{tr.t("main.hidden.cancelInfo.header")}</Text>

  							<TextInput 
  								placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder={tr.t("main.hidden.cancelInfo.reason")} 
  								multiline={true} textAlignVertical="top" style={styles.cancelRequestInput} 
  								onChangeText={(reason) => setCancelinfo({ ...cancelInfo, reason })} autoCorrect={false} 
  								autoCapitalize="none"
  							/>

  							<View style={{ alignItems: 'center' }}>
  								<View style={styles.cancelRequestActions}>
  									<TouchableOpacity style={styles.cancelRequestTouch} onPress={() => setCancelinfo({ ...cancelInfo, show: false, type: "", requestType: "", id: 0, index: 0, reason: "" })}>
  										<Text style={styles.cancelRequestTouchHeader}>{tr.t("buttons.close")}</Text>
  									</TouchableOpacity>
  									<TouchableOpacity style={styles.cancelRequestTouch} onPress={() => cancelTheSchedule(null, cancelInfo.requestType)}>
  										<Text style={styles.cancelRequestTouchHeader}>{tr.t("buttons.done")}</Text>
  									</TouchableOpacity>
  								</View>
  							</View>
  						</SafeAreaView>
  					</TouchableWithoutFeedback>
    			)}
          {showInfo.show && (
            <View style={styles.showInfoContainer}>
              <View style={styles.showInfoBox}>
                <ScrollView style={{ width: '100%' }}>
                  <View style={{ alignItems: 'center' }}>
                    <TouchableOpacity style={styles.showInfoClose} onPress={() => setShowinfo({ ...showInfo, show: false })}>
                      <AntDesign name="close" size={wsize(7)}/>
                    </TouchableOpacity>

                    <Text style={styles.showInfoHeader}>{tr.t("main.hidden.showInfo.header")}</Text>

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

                    <View style={styles.workerInfoList}>
                      {showInfo.workersHours.map(worker => (
                        <View key={worker.key} style={{ alignItems: 'center', backgroundColor: 'rgba(127, 127, 127, 0.2)', marginVertical: 50, paddingVertical: 10 }}>
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
                  </View>
                </ScrollView>
              </View>
            </View>
          )}
          {showMoreoptions.show && (
            <View style={styles.moreOptionsContainer}>
              <View style={styles.moreOptionsBox}>
                {showMoreoptions.infoType == '' ? 
                  <>
                    <TouchableOpacity style={styles.moreOptionsClose} onPress={() => setShowmoreoptions({ ...showMoreoptions, show: false })}>
                      <AntDesign name="close" size={wsize(7)}/>
                    </TouchableOpacity>

                    <ScrollView style={{ width: '80%' }}>
                      <TouchableOpacity style={styles.moreOptionTouch} onPress={() => {
                        setShowmoreoptions({ ...showMoreoptions, show: false })
                        props.navigation.navigate("menu", { refetch: () => initialize(), isOwner })
                      }}>
                        <Text style={styles.moreOptionTouchHeader}>{tr.t("main.hidden.showMoreoptions.changeMenu")}</Text>
                      </TouchableOpacity>

                      {(locationType == "hair" || locationType == "nail") && (
                        <TouchableOpacity style={styles.moreOptionTouch} onPress={() => {
                          setEditinfo({ ...editInfo, show: true, type: 'users' })
                          setShowmoreoptions({ ...showMoreoptions, infoType: 'users' })
                          getAllAccounts()
                        }}>
                          <Text style={styles.moreOptionTouchHeader}>{tr.t("main.hidden.showMoreoptions.changeStaffinfo")}</Text>
                        </TouchableOpacity>
                      )}

                      {isOwner == true && (
                        <>
                          <TouchableOpacity style={styles.moreOptionTouch} onPress={() => {
                            setShowmoreoptions({ ...showMoreoptions, infoType: 'information' })
                            setEditinfo({ ...editInfo, show: true, type: 'information' })
                          }}>
                            <Text style={styles.moreOptionTouchHeader}>{tr.t("main.hidden.showMoreoptions.changeBusinessinfo")}</Text>
                          </TouchableOpacity>

                          <TouchableOpacity style={styles.moreOptionTouch} onPress={() => {
                            setShowmoreoptions({ ...showMoreoptions, infoType: 'hours' })
                            setEditinfo({ ...editInfo, show: true, type: 'hours' })
                          }}>
                            <Text style={styles.moreOptionTouchHeader}>{tr.t("main.hidden.showMoreoptions.changeBusinesshours")}</Text>
                          </TouchableOpacity>

                          <TouchableOpacity style={styles.moreOptionTouch} onPress={() => {
                            AsyncStorage.removeItem("locationid")
                            AsyncStorage.removeItem("locationtype")
                            AsyncStorage.setItem("phase", "list")

                            setShowmoreoptions({ ...showMoreoptions, show: false })

                            setTimeout(function () {
                              props.navigation.dispatch(CommonActions.reset({ index: 1, routes: [{ name: "list" }]}));
                            }, 1000)
                          }}>
                            <Text style={styles.moreOptionTouchHeader}>{tr.t("main.hidden.showMoreoptions.moreBusinesses")}</Text>
                          </TouchableOpacity>

                          {(locationType == "hair" || locationType == "nail") && (
                            <TouchableOpacity style={styles.moreOptionTouch} onPress={() => {
                              AsyncStorage.setItem("phase", "walkin")

                              setShowmoreoptions({ ...showMoreoptions, show: false })

                              setTimeout(function () {
                                props.navigation.dispatch(CommonActions.reset({ index: 1, routes: [{ name: "walkin" }]}));
                              }, 1000)
                            }}>
                              <Text style={styles.moreOptionTouchHeader}>{tr.t("main.hidden.showMoreoptions.walkIn")}</Text>
                            </TouchableOpacity>
                          )}

                          {(locationType == "hair" || locationType == "nail") && (
                            <View style={styles.receiveTypesBox}>
                              <Text style={styles.receiveTypesHeader}>{tr.t("main.hidden.showMoreoptions.getAppointmentsby.header")}</Text>

                              <View style={styles.receiveTypes}>
                                <TouchableOpacity style={[styles.receiveType, { backgroundColor: locationReceivetype == 'stylist' ? 'black' : 'white' }]} onPress={() => setTheReceiveType('stylist')}>
                                  <Text style={[styles.receiveTypeHeader, { color: locationReceivetype == 'stylist' ? 'white' : 'black' }]}>{tr.t("main.hidden.showMoreoptions.getAppointmentsby.staff")}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.receiveType, { backgroundColor: locationReceivetype == 'owner' ? 'black' : 'white' }]} onPress={() => setTheReceiveType('owner')}>
                                  <Text style={[styles.receiveTypeHeader, { color: locationReceivetype == 'owner' ? 'white' : 'black' }]}>{tr.t("main.hidden.showMoreoptions.getAppointmentsby.owner")}</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          )}
                        </>
                      )}
                    </ScrollView>
                  </>
                  :
                  <>
                    {editInfo.show && (
                      <ScrollView style={{ height: '100%', width: '100%' }}>
                        <View style={styles.editInfoBox}>
                          <View style={styles.editInfoContainer}>
                            <View style={{ alignItems: 'center', marginVertical: 30 }}>
                              <TouchableOpacity style={styles.editInfoClose} onPress={() => {
                                setShowmoreoptions({ ...showMoreoptions, infoType: '' })
                                setEditinfo({ ...editInfo, show: false, type: '' })
                              }}>
                                <AntDesign name="closecircleo" size={30}/>
                              </TouchableOpacity>
                            </View>

                            {editInfo.type == 'information' && (
                              <>
                                {locationInfo == '' && (
                                  <>
                                    <TouchableOpacity style={[styles.locationActionOption, { width: width * 0.5 }]} disabled={editInfo.loading} onPress={() => markLocation()}>
                                      <Text style={styles.locationActionOptionHeader}>{tr.t("buttons.markLocation")}</Text>
                                    </TouchableOpacity>

                                    <Text style={[styles.header, { fontSize: wsize(4) }]}>Or</Text>

                                    <TouchableOpacity style={[styles.locationAction, { width: width * 0.6 }]} disabled={editInfo.loading} onPress={() => {
                                      setLocationinfo('away')
                                      setEditinfo({ ...editInfo, errorMsg: '' })
                                    }}>
                                      <Text style={styles.locationActionHeader}>{tr.t("buttons.editAddress")}</Text>
                                    </TouchableOpacity>
                                  </>
                                )}

                                {locationInfo == 'destination' && (
                                  <View style={{ alignItems: 'center', width: '100%' }}>
                                    <Text style={styles.locationHeader}>{tr.t("headers.locatedHeader." + header)}</Text>

                                    {(locationCoords.longitude && locationCoords.latitude) ? 
                                      <>
                                        <MapView
                                          region={{
                                            longitude: locationCoords.longitude,
                                            latitude: locationCoords.latitude,
                                            latitudeDelta: 0.003,
                                            longitudeDelta: 0.003
                                          }}
                                          scrollEnabled={false}
                                          zoomEnabled={false}
                                          style={{ borderRadius: width * 0.4 / 2, height: width * 0.4, width: width * 0.4 }}
                                        >
                                          <Marker coordinate={{ longitude: locationCoords.longitude, latitude: locationCoords.latitude }}/>
                                        </MapView>
                                        <Text style={styles.locationAddressHeader}>{locationCoords.address}</Text>
                                      </>
                                      :
                                      <ActivityIndicator color="black" size="small"/>
                                    }

                                    <Text style={[styles.locationHeader, { marginVertical: 10 }]}>Or</Text>

                                    <TouchableOpacity style={styles.locationActionOption} onPress={() => {
                                      setLocationcoords({ longitude: null, latitude: null })
                                      setLocationinfo('away')
                                    }}>
                                      <Text style={styles.locationActionOptionHeader}>Enter address instead</Text>
                                    </TouchableOpacity>
                                  </View>
                                )}

                                {locationInfo == 'away' && (
                                  <>
                                    <TouchableOpacity style={[styles.locationActionOption, { width: width * 0.5 }]} disabled={editInfo.loading} onPress={() => markLocation()}>
                                      <Text style={styles.locationActionOptionHeader}>{tr.t("buttons.markLocation")}</Text>
                                    </TouchableOpacity>

                                    <Text style={[styles.header, { fontSize: wsize(4) }]}>Or</Text>

                                    <Text style={styles.header}>Edit Address</Text>

                                    <View style={styles.inputsBox}>
                                      <View style={styles.inputContainer}>
                                        <Text style={styles.inputHeader}>{tr.t("main.editingAddress.name")}:</Text>
                                        <TextInput style={styles.input} onChangeText={(storeName) => setStorename(storeName)} value={storeName} autoCorrect={false}/>
                                      </View>
                                      <View style={styles.inputContainer}>
                                        <Text style={styles.inputHeader}>{tr.t("main.editingAddress.phoneNumber")}:</Text>
                                        <TextInput style={styles.input} onChangeText={(num) => setPhonenumber(displayPhonenumber(phonenumber, num, () => Keyboard.dismiss()))} value={phonenumber} keyboardType="numeric" autoCorrect={false}/>
                                      </View>
                                      <View style={styles.inputContainer}>
                                        <Text style={styles.inputHeader}>{tr.t("main.editingAddress.addressOne")}:</Text>
                                        <TextInput style={styles.input} onChangeText={(addressOne) => setAddressone(addressOne)} value={addressOne} autoCorrect={false}/>
                                      </View>
                                      <View style={styles.inputContainer}>
                                        <Text style={styles.inputHeader}>{tr.t("main.editingAddress.addressTwo")}:</Text>
                                        <TextInput style={styles.input} onChangeText={(addressTwo) => setAddresstwo(addressTwo)} value={addressTwo} autoCorrect={false}/>
                                      </View>
                                      <View style={styles.inputContainer}>
                                        <Text style={styles.inputHeader}>{tr.t("main.editingAddress.city")}:</Text>
                                        <TextInput style={styles.input} onChangeText={(city) => setCity(city)} value={city} keyboardType="numeric" autoCorrect={false}/>
                                      </View>
                                      <View style={styles.inputContainer}>
                                        <Text style={styles.inputHeader}>{tr.t("main.editingAddress.province")}:</Text>
                                        <TextInput style={styles.input} onChangeText={(province) => setProvince(province)} value={province} keyboardType="numeric" autoCorrect={false}/>
                                      </View>
                                      <View style={styles.inputContainer}>
                                        <Text style={styles.inputHeader}>{tr.t("main.editingAddress.postalCode")}:</Text>
                                        <TextInput style={styles.input} onChangeText={(postalcode) => setPostalcode(postalcode)} value={postalcode} keyboardType="numeric" autoCorrect={false}/>
                                      </View>

                                      {editInfo.errorMsg ? <Text style={styles.errorMsg}>{editInfo.errorMsg}</Text> : null }
                                    </View>
                                  </>
                                )}

                                <View style={[styles.cameraContainer, { marginVertical: 20 }]}>
                                  <Text style={styles.header}>{header.substr(1, header.length - 2)}'s Photo</Text>

                                  {logo.uri ? (
                                    <>
                                      <Image style={resizePhoto(logo.size, width * 0.8)} source={{ uri: logo.uri }}/>

                                      <TouchableOpacity style={styles.cameraAction} onPress={() => {
                                        allowCamera()
                                        setLogo({ ...logo, uri: '' })
                                      }}>
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

                                          <View style={{ alignItems: 'center', marginVertical: 10 }}>
                                            <Ionicons name="camera-reverse-outline" size={wsize(7)} onPress={() => setCamtype(camType == 'back' ? 'front' : 'back')}/>
                                          </View>
                                        </>
                                      )}

                                      <View style={styles.cameraActions}>
                                        <TouchableOpacity style={[styles.cameraAction, { opacity: logo.loading ? 0.5 : 1 }]} disabled={logo.loading} onPress={snapPhoto.bind(this)}>
                                          <Text style={styles.cameraActionHeader}>{tr.t("buttons.takePhoto")}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.cameraAction, { opacity: logo.loading ? 0.5 : 1 }]} disabled={logo.loading} onPress={() => {
                                          allowChoosing()
                                          choosePhoto()
                                        }}>
                                          <Text style={styles.cameraActionHeader}>{tr.t("buttons.choosePhoto")}</Text>
                                        </TouchableOpacity>
                                      </View>
                                    </>
                                  )}  
                                </View>

                                <TouchableOpacity style={styles.updateButton} disabled={editInfo.loading} onPress={() => updateYourLocation()}>
                                  <Text style={styles.updateButtonHeader}>{tr.t("buttons.update")}</Text>
                                </TouchableOpacity>
                              </>
                            )}

                            {editInfo.type == 'hours' && (
                              <>
                                <Text style={[styles.header, { fontSize: wsize(6) }]}>{tr.t("main.editingHours.header")}</Text>

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
                                  <TouchableOpacity style={styles.updateButton} disabled={editInfo.loading} onPress={() => updateLocationHours()}>
                                    <Text style={styles.updateButtonHeader}>{tr.t("buttons.update")}</Text>
                                  </TouchableOpacity>
                                </View>
                              </>
                            )}

                            {editInfo.type == 'users' && (
                              <View style={styles.accountHolders}>
                                <Text style={styles.header}>{tr.t("main.editInfo.staff.header")}</Text>

                                {isOwner == true && (
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
                                      workerHours: [...timeRange]
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
                            )}
                          </View>
                        </View>
                      </ScrollView>
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
                                        <AntDesign name="closecircleo" size={30}/>
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
                                      accountForm.workerHours.map((info, index) => (
                                        <View key={index} style={styles.workerHour}>
                                          {info.working == true ? 
                                            <>
                                              <View style={{ opacity: info.working ? 1 : 0.1 }}>
                                                <Text style={styles.workerHourHeader}>Set new stylist's working hours on {info.header}</Text>
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
                                                <Text style={styles.workerHourHeader}>Not working on {info.header}</Text>

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
                                              <Text style={styles.workerHourHeader}>Not open on {info.header}</Text>
                                              
                                          }
                                        </View>
                                      ))
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
                                              workerHours: [], editHours: false,
                                              errorMsg: ""
                                            })
                                            setEditinfo({ ...editInfo, show: true })
                                          }}>
                                            <Text style={styles.accountformSubmitHeader}>{tr.t("buttons.cancel")}</Text>
                                          </TouchableOpacity>
                                          <TouchableOpacity style={[styles.accountformSubmit, { opacity: accountForm.loading ? 0.3 : 1 }]} disabled={accountForm.loading} onPress={() => {
                                            if (accountForm.addStep == 4) {
                                              addNewOwner()
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
                                                  (accountForm.type == 'add' ? tr.t("buttons.add") : tr.t("buttons.update")) + ' Account'
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
                                                workerHours: info.hours, editHours: false,
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
                                        <AntDesign name="closecircleo" size={30}/>
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
                                                  workerHours: info.hours, editHours: false,
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
          {removeBookingconfirm.show && (
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <View style={styles.removeBookingContainer}>
                <View style={styles.removeBookingBox}>
                  {!removeBookingconfirm.confirm ? 
                    <>
                      <Text style={styles.removeBookingHeader}>Why cancel ? (Optional)</Text>

                      <TextInput 
                        placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Write your reason" 
                        multiline={true} textAlignVertical="top" style={styles.removeBookingInput} 
                        onChangeText={(reason) => setRemovebookingconfirm({ ...removeBookingconfirm, reason })} autoCorrect={false} 
                        autoCapitalize="none"
                      />

                      <View style={styles.removeBookingActions}>
                        <TouchableOpacity style={styles.removeBookingAction} onPress={() => setRemovebookingconfirm({ ...removeBookingconfirm, show: false })}>
                          <Text style={styles.removeBookingActionHeader}>{tr.t("buttons.cancel")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.removeBookingAction} onPress={() => removeTheBooking()}>
                          <Text style={styles.removeBookingActionHeader}>Ok</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                    :
                    <Text style={styles.removeBookingHeader}>
                      Appointment removed for client: {removeBookingconfirm.client.name}
                      {'\n' + displayTime(removeBookingconfirm.date)}
                    </Text>
                  }
                </View>
              </View>
            </TouchableWithoutFeedback>
          )}
    			{showDisabledscreen && (
  					<SafeAreaView style={styles.disabled}>
  						<View style={styles.disabledContainer}>
                <Text style={styles.disabledHeader}>
                  There is an update to the app{'\n\n'}
                  Please wait a moment{'\n\n'}
                  or tap 'Close'
                </Text>

                <TouchableOpacity style={styles.disabledClose} onPress={() => socket.emit("socket/business/login", ownerId, () => setShowdisabledscreen(false))}>
                  <Text style={styles.disabledCloseHeader}>{tr.t("buttons.close")}</Text>
                </TouchableOpacity>

                <ActivityIndicator size="large"/>
              </View>
  					</SafeAreaView>
    			)}
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
	scheduleHeader: { fontSize: wsize(5), fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
	scheduleActionsHeader: { fontSize: wsize(4), marginTop: 10, textAlign: 'center' },
	scheduleActions: { flexDirection: 'row', justifyContent: 'space-around' },
  column: { flexDirection: 'column', justifyContent: 'space-around' },
	scheduleAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, paddingVertical: 10, width: wsize(30) },
	scheduleActionHeader: { fontSize: wsize(4), textAlign: 'center' },

  chartRow: { flexDirection: 'row', width: '100%' },
  chartTimeHeader: { fontSize: wsize(7), fontWeight: 'bold', textAlign: 'center' },
  chartWorker: { alignItems: 'center', borderColor: 'grey', borderStyle: 'solid', borderWidth: 1 },
  chartWorkerHeader: { fontSize: wsize(5), textAlign: 'center' },
  chartWorkerProfile: { borderRadius: 20, height: 40, overflow: 'hidden', width: 40 },

	cartorderer: { backgroundColor: 'white', borderRadius: 5, flexDirection: 'row', justifyContent: 'space-around', margin: 10, padding: 5, width: wsize(100) - 20 },
	cartordererInfo: { alignItems: 'center' },
	cartordererUsername: { fontSize: wsize(5), fontWeight: 'bold', marginBottom: 10 },
	cartordererOrderNumber: { fontSize: wsize(7), fontWeight: 'bold', paddingVertical: 5 },
  cartordererActions: { flexDirection: 'row', justifyContent: 'space-around' },
	cartordererAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: wsize(30) },
	cartordererActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	bodyResult: { alignItems: 'center', flexDirection: 'column', height: '90%', justifyContent: 'space-around' },
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

  showInfoContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  showInfoBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '90%', justifyContent: 'space-around', width: '90%' },
  showInfoClose: { alignItems: 'center', borderRadius: 20, borderStyle: 'solid', borderWidth: 2, marginVertical: 30 },
  showInfoHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
  workerInfoList: { width: '100%' },
  workerInfo: { alignItems: 'center' },
  workerInfoProfile: { borderRadius: wsize(30) / 2, height: wsize(30), overflow: 'hidden', width: wsize(30) },
  workerInfoName: { color: 'black', fontSize: wsize(5), fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  workerTime: {  },
  workerTimeContainer: { flexDirection: 'row', marginBottom: 20 },
  dayHeader: { fontSize: wsize(5) },
  timeHeaders: { flexDirection: 'row' },
  timeHeader: { fontSize: wsize(5), fontWeight: 'bold' },

  moreOptionsContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  moreOptionsBox: { alignItems: 'center', backgroundColor: 'white', height: '80%', width: '80%' },
  moreOptionsClose: { alignItems: 'center', borderRadius: 20, borderStyle: 'solid', borderWidth: 2, marginVertical: 10 },
  moreOptionTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 5, padding: 5, width: '100%' },
  moreOptionTouchHeader: { fontSize: 20, textAlign: 'center' },

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
  
  receiveTypesBox: { alignItems: 'center', marginHorizontal: 10, marginTop: 30 },
  receiveTypesHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
  receiveTypes: { flexDirection: 'row', justifyContent: 'space-between' },
  receiveType: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: '45%' },
  receiveTypeHeader: { textAlign: 'center' },

  updateButtons: { flexDirection: 'row', justifyContent: 'space-around' },
  updateButton: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 10 },
  updateButtonHeader: { fontSize: wsize(5), fontWeight: 'bold' },

  removeBookingContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  removeBookingBox: { backgroundColor: 'white', flexDirection: 'column', height: '70%', justifyContent: 'space-around', width: '70%' },
  removeBookingHeader: { fontSize: wsize(6), fontWeight: 'bold', textAlign: 'center' },
  removeBookingInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), height: 200, margin: '5%', padding: 10, width: '90%' },
  removeBookingActions: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  removeBookingAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: '40%' },
  removeBookingActionHeader: { textAlign: 'center' },

	disabled: { backgroundColor: 'black', flexDirection: 'column', justifyContent: 'space-around', height: '100%', opacity: 0.8, width: '100%' },
  disabledContainer: { alignItems: 'center', width: '100%' },
  disabledHeader: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  disabledClose: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 50, padding: 10 },

  loading: { alignItems: 'center', flexDirection: 'column', height: '90%', justifyContent: 'space-around', width: '100%' },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  column: { flexDirection: 'column', justifyContent: 'space-around' },
  errorMsg: { color: 'darkred', textAlign: 'center' }
})
