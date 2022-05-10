import React, { useState, useEffect } from 'react'
import { 
  SafeAreaView, Platform, ActivityIndicator, Dimensions, ScrollView, View, Image, 
  Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, 
  StyleSheet, Modal, PermissionsAndroid
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { logo_url, timeControl } from '../../assets/info'
import { addOwner, updateOwner, deleteOwner, getWorkerInfo, getOtherWorkers, getAccounts } from '../apis/owners'
import { getLocationProfile, updateLocation, setLocationHours, setReceiveType } from '../apis/locations'
import { loginInfo, ownerRegisterInfo } from '../../assets/info'
import { displayPhonenumber } from 'geottuse-tools'

// bank account
let { accountNumber, countryCode, currency, routingNumber, accountHolderName } = loginInfo

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import Ionicons from 'react-native-vector-icons/Ionicons'

// components
import Loadingprogress from '../components/loadingprogress';

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}

export default function Settings(props) {
	const [ownerId, setOwnerid] = useState('')
	const [cameraPermission, setCamerapermission] = useState(null);
	const [pickingPermission, setPickingpermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
  const [camType, setCamtype] = useState('back')
  const [choosing, setChoosing] = useState(false)
	const [editType, setEdittype] = useState('')

	// location information
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
	const [type, setType] = useState('')
	const [infoLoading, setInfoloading] = useState(true)

	// location hours
	const [days, setDays] = useState([
		{ key: "0", header: "Sunday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, close: false },
		{ key: "1", header: "Monday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, close: false },
		{ key: "2", header: "Tuesday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, close: false },
		{ key: "3", header: "Wednesday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, close: false },
		{ key: "4", header: "Thursday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, close: false },
		{ key: "5", header: "Friday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, close: false },
		{ key: "6", header: "Saturday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, close: false }
	])
	const [daysLoading, setDaysloading] = useState(true)

	// co-owners
	const [accountHolders, setAccountholders] = useState([])
	const [accountHoldersloading, setAccountholdersloading] = useState(true)
  const [hoursRange, setHoursrange] = useState([
    { key: "0", header: "Sunday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true, takeShift: "" },
    { key: "1", header: "Monday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true, takeShift: "" },
    { key: "2", header: "Tuesday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true, takeShift: "" },
    { key: "3", header: "Wednesday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true, takeShift: "" },
    { key: "4", header: "Thursday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true, takeShift: "" },
    { key: "5", header: "Friday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true, takeShift: "" },
    { key: "6", header: "Saturday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true, takeShift: "" }
  ])

  const [receiveTypeloading, setReceivetypeloading] = useState(true)

	const [errorMsg, setErrormsg] = useState('')
	const [loading, setLoading] = useState(false)
	const [accountForm, setAccountform] = useState({
		show: false,
		type: '', editType: '', addStep: 0, id: -1,
		username: '', editUsername: false,
		cellnumber: '', editCellnumber: false,
		currentPassword: '', newPassword: '', confirmPassword: '', editPassword: false,
		profile: { uri: '', name: '', size: { width: 0, height: 0 }}, editProfile: false, camType: 'front',
    workerHours: [], editHours: false,
		loading: false,
		errorMsg: ''
	})
  const [deleteOwnerbox, setDeleteownerbox] = useState({
    show: false,
    id: -1, username: '', profile: '', numWorkingdays: 0
  })
  const [getWorkersbox, setGetworkersbox] = useState({
    show: false,
    day: '',
    workers: []
  })

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
        const time = (Date.now() / 1000).toString().split(".")[0]
        const data = {
          storeName, phonenumber, addressOne, addressTwo, city, province, postalcode, logo,
          longitude, latitude, ownerid: ownerId, time
        }

        setLoading(true)

        updateLocation(data)
          .then((res) => {
            if (res.status == 200) {
              return res.data
            }
          })
          .then((res) => {
            if (res) {
              const { id } = res

              setEdittype('')
              setLoading(false)
            }
          })
          .catch((err) => {
            if (err.response && err.response.status == 400) {
              const { errormsg, status } = err.response.data

              setErrormsg(errormsg)
              setLoading(false)
            }
          })
      }
		} else {
			if (!storeName) {
				setErrormsg("Please enter your store name")

				return
			}

			if (!phonenumber) {
				setErrormsg("Please enter your store phone number")

				return
			}

			if (!addressOne) {
				setErrormsg("Please enter the Address # 1")

				return
			}

			if (!addressTwo) {
				setErrormsg("Please enter the Address # 2")

				return
			}

			if (!city) {
				setErrormsg("Please enter the city")

				return
			}

			if (!province) {
				setErrormsg("Please enter the province")

				return
			}

			if (!postalcode) {
				setErrormsg("Please enter the postal code")

				return
			}
		}
	}

	const updateTime = (index, timetype, dir, open) => {
		const newDays = [...days]
		let value, period

		value = open ? 
			newDays[index].opentime[timetype]
			:
			newDays[index].closetime[timetype]

		switch (timetype) {
			case "hour":
				value = parseInt(value)
				value = dir == "up" ? value + 1 : value - 1

				if (value > 12) {
					value = 1
				} else if (value < 1) {
					value = 12
				}

				if (value < 10) {
					value = "0" + value
				} else {
          value = value.toString()
        }

				break
			case "minute":
				value = parseInt(value)
				value = dir == "up" ? value + 1 : value - 1

				if (value > 59) {
					value = 0
				} else if (value < 0) {
					value = 59
				}

				if (value < 10) {
					value = "0" + value
				} else {
          value = value.toString()
        }

				break
			case "period":
				value = value == "AM" ? "PM" : "AM"

				break
			default:
		}

		if (open) {
			newDays[index].opentime[timetype] = value
		} else {
			newDays[index].closetime[timetype] = value
		}

		setDays(newDays)
	}
	const dayClose = index => {
		const newDays = [...days]

		newDays[index].close = !newDays[index].close

		setDays(newDays)
	}
	const updateLocationHours = async() => {
    setLoading(true)

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

		const data = { locationid, hours }

		setLocationHours(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setEdittype('')
					setLoading(false)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data

					setLoading(false)
				}
			})
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

		const { cellnumber, username, newPassword, confirmPassword, profile } = accountForm
		const data = { ownerid: ownerId, cellnumber, username, password: newPassword, confirmPassword, hours, profile }

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
              id, username, profile, numWorkingdays: Object.keys(days).length
            })
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

	const getTheLocationProfile = async() => {
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
					const { name, phonenumber, addressOne, addressTwo, city, province, postalcode, logo, hours, type, receiveType } = res.info
          let openHour, openMinute, closeHour, closeMinute
          let openInfo, closeInfo, currDate, calcDate, openTime, closeTime

          for (let k = 0; k < 7; k++) {
            openInfo = hours[k].opentime
            closeInfo = hours[k].closetime

            openMinute = parseInt(openInfo.minute)
            openHour = parseInt(openInfo.hour)
            openHour = openInfo.period == "PM" ? openHour + 12 : openHour

            closeMinute = parseInt(closeInfo.minute)
            closeHour = parseInt(closeInfo.hour)
            closeHour = closeInfo.period == "PM" ? closeHour + 12 : closeHour

            currDate = new Date()

            calcDate = new Date(currDate.setDate(currDate.getDate() - currDate.getDay() + k)).toUTCString();
            calcDate = calcDate.split(" ")
            calcDate.pop()
            calcDate.pop()

            calcDate = calcDate.join(" ") + " "

            openTime = (openHour < 10 ? "0" + openHour : openHour)
            openTime += ":"
            openTime += (openMinute < 10 ? "0" + openMinute : openMinute)

            closeTime = (closeHour < 10 ? "0" + closeHour : closeHour)
            closeTime += ":"
            closeTime += (closeMinute < 10 ? "0" + closeMinute : closeMinute)

            hours[k]["calcDate"] = calcDate
            hours[k]["openunix"] = Date.parse(calcDate + openTime)
            hours[k]["closeunix"] = Date.parse(calcDate + closeTime)
          }

					setStorename(name)
					setPhonenumber(phonenumber)
					setAddressone(addressOne)
					setAddresstwo(addressTwo)
					setCity(city)
					setProvince(province)
					setPostalcode(postalcode)
					setLogo({ ...logo, uri: logo_url + logo.name })
					setType(type)
          setLocationreceivetype(receiveType)
          setReceivetypeloading(false)
					setInfoloading(false)
					setDays(hours)
          setHoursrange(hours)
					setDaysloading(false)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data
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
					setAccountholdersloading(false)
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
	const snapPhoto = async() => {
    setLogo({ ...logo, loading: true })

		let letters = [
			"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", 
			"n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
		]
		let photo_name_length = Math.floor(Math.random() * (15 - 10)) + 10
		let char = ""

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

		let letters = [
			"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", 
			"n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
		]
		let photo_name_length = Math.floor(Math.random() * (15 - 10)) + 10
		let char = ""
		let photo = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			aspect: [1, 1],
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
      
      setErrormsg()
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

	useEffect(() => {
		getTheLocationProfile()
		getAllAccounts()
	}, [])

	return (
		<SafeAreaView style={styles.settings}>
			<View style={styles.settingsContainer}>
				<ScrollView style={{ width: '100%' }}>
					<View style={[styles.box, { opacity: loading ? 0.6 : 1 }]}>
						{!infoLoading ?
							editType == 'information' ? 
                <>
                  {!locationInfo ? 
                    <>
                      <TouchableOpacity style={[styles.locationActionOption, { width: width * 0.5 }]} disabled={loading} onPress={() => markLocation()}>
                        <Text style={styles.locationActionOptionHeader}>Mark your location</Text>
                      </TouchableOpacity>

                      <Text style={styles.header}>Or</Text>

                      <TouchableOpacity style={[styles.locationAction, { width: width * 0.6 }]} disabled={loading} onPress={() => {
                        setLocationinfo('away')
                        setErrormsg()
                      }}>
                        <Text style={styles.locationActionHeader}>Edit address instead</Text>
                      </TouchableOpacity>
                    </>
                    :
                    locationInfo == "away" ? 
                      <>
                        <TouchableOpacity style={[styles.locationActionOption, { width: width * 0.5 }]} disabled={loading} onPress={() => markLocation()}>
                          <Text style={styles.locationActionOptionHeader}>Mark your location</Text>
                        </TouchableOpacity>

                        <Text style={styles.header}>Or</Text>

                        <Text style={styles.header}>Edit Address</Text>

                        <View style={styles.inputsBox}>
                          <View style={styles.inputContainer}>
                            <Text style={styles.inputHeader}>{(type == 'hair' || type == 'nail') ? type + ' salon' : type}'s name:</Text>
                            <TextInput style={styles.input} onChangeText={(storeName) => setStorename(storeName)} value={storeName} autoCorrect={false}/>
                          </View>
                          <View style={styles.inputContainer}>
                            <Text style={styles.inputHeader}>{(type == 'hair' || type == 'nail') ? type + ' salon' : type}'s Phone number:</Text>
                            <TextInput style={styles.input} onChangeText={(num) => setPhonenumber(displayPhonenumber(phonenumber, num, () => Keyboard.dismiss()))} value={phonenumber} keyboardType="numeric" autoCorrect={false}/>
                          </View>
                          <View style={styles.inputContainer}>
                            <Text style={styles.inputHeader}>{(type == 'hair' || type == 'nail') ? type + ' salon' : type}'s address #1:</Text>
                            <TextInput style={styles.input} onChangeText={(addressOne) => setAddressone(addressOne)} value={addressOne} autoCorrect={false}/>
                          </View>
                          <View style={styles.inputContainer}>
                            <Text style={styles.inputHeader}>{(type == 'hair' || type == 'nail') ? type + ' salon' : type}'s address #2:</Text>
                            <TextInput style={styles.input} onChangeText={(addressTwo) => setAddresstwo(addressTwo)} value={addressTwo} autoCorrect={false}/>
                          </View>
                          <View style={styles.inputContainer}>
                            <Text style={styles.inputHeader}>City:</Text>
                            <TextInput style={styles.input} onChangeText={(city) => setCity(city)} value={city} keyboardType="numeric" autoCorrect={false}/>
                          </View>
                          <View style={styles.inputContainer}>
                            <Text style={styles.inputHeader}>Province:</Text>
                            <TextInput style={styles.input} onChangeText={(province) => setProvince(province)} value={province} keyboardType="numeric" autoCorrect={false}/>
                          </View>
                          <View style={styles.inputContainer}>
                            <Text style={styles.inputHeader}>Postal Code:</Text>
                            <TextInput style={styles.input} onChangeText={(postalcode) => setPostalcode(postalcode)} value={postalcode} keyboardType="numeric" autoCorrect={false}/>
                          </View>

                          {errorMsg ? <Text style={styles.errorMsg}>{errorMsg}</Text> : null }
                        </View>
                      </>
                      :
                      <View style={{ alignItems: 'center', width: '100%' }}>
                        <Text style={styles.locationHeader}>
                          Your {(type == 'hair' || type == 'nail') ? type + ' salon' : type} is located at
                        </Text>
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
                  }

                  <View style={[styles.cameraContainer, { marginVertical: 100 }]}>
                    <Text style={styles.inputHeader}>Store Logo</Text>

                    {logo.uri ? (
                      <>
                        <Image style={styles.camera} source={{ uri: logo.uri }}/>

                        <TouchableOpacity style={styles.cameraAction} onPress={() => {
                          allowCamera()
                          setLogo({ ...logo, uri: '' })
                        }}>
                          <Text style={styles.cameraActionHeader}>Cancel</Text>
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
                            <Text style={styles.cameraActionHeader}>Take this photo</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.cameraAction, { opacity: logo.loading ? 0.5 : 1 }]} disabled={logo.loading} onPress={() => {
                            allowChoosing()
                            choosePhoto()
                          }}>
                            <Text style={styles.cameraActionHeader}>Choose from phone</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}  
                  </View>

                  <TouchableOpacity style={styles.updateButton} disabled={loading} onPress={() => updateYourLocation()}>
                    <Text style={styles.updateButtonHeader}>Save</Text>
                  </TouchableOpacity>
                </>
								:
								<TouchableOpacity style={styles.editButton} onPress={() => {
                  setCamtype('back')
                  setEdittype('information')
                }}>
									<Text style={styles.editButtonHeader}>Edit Location Info</Text>
								</TouchableOpacity>
							:
              <View style={styles.loading}>
                <ActivityIndicator color="black" size="small"/>
              </View>
						}

						{!daysLoading ?
							editType == 'hours' ? 
								<>
									<Text style={styles.header}>
                    Edit 
                    {(type === "hair" || type === "nail") && " Salon "} 
                    {type === "restaurant" && " Restaurant "}
                    {type === "store" && " Store "}
                    Hour(s)
                  </Text>

									{days.map((info, index) => (
										<View key={index} style={styles.workerHour}>
											{info.close == false ? 
												<>
													<View style={{ opacity: info.close ? 0.1 : 1, width: '100%' }}>
														<Text style={styles.workerHourHeader}><Text style={{ fontWeight: '300' }}>Open on</Text> {info.header}</Text>
														<View style={styles.timeSelectionContainer}>
															<View style={styles.timeSelection}>
																<View style={styles.selection}>
																	<TouchableOpacity onPress={() => updateTime(index, "hour", "up", true)}>
																		<AntDesign name="up" size={wsize(7)}/>
																	</TouchableOpacity>
                                  <TextInput style={styles.selectionHeader} onChangeText={(hour) => {
                                    const newDays = [...days]

                                    newDays[index].opentime["hour"] = hour.toString()

                                    setDays(newDays)
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
                                    const newDays = [...days]

                                    newDays[index].opentime["minute"] = minute.toString()

                                    setDays(newDays)
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
                                    const newDays = [...days]

                                    newDays[index].closetime["hour"] = hour.toString()

                                    setDays(newDays)
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
                                    const newDays = [...days]

                                    newDays[index].closetime["minute"] = minute.toString()

                                    setDays(newDays)
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
														const newDays = [...days]

														newDays[index].close = true

														setDays(newDays)
													}}>
														<Text style={styles.workerTouchHeader}>Change to not open</Text>
													</TouchableOpacity>
												</>
												:
												<>
													<Text style={styles.workerHourHeader}><Text style={{ fontWeight: '300' }}>Not open on</Text> {info.header}</Text>

													<TouchableOpacity style={styles.workerTouch} onPress={() => {
														const newDays = [...days]

														newDays[index].close = false

														setDays(newDays)
													}}>
														<Text style={styles.workerTouchHeader}>Change to open</Text>
													</TouchableOpacity>
												</>
											}
										</View>
									))}

									<TouchableOpacity style={styles.updateButton} disabled={loading} onPress={() => updateLocationHours()}>
										<Text style={styles.updateButtonHeader}>Save</Text>
									</TouchableOpacity>
								</>
								:
								<TouchableOpacity style={styles.editButton} onPress={() => setEdittype('hours')}>
									<Text style={styles.editButtonHeader}>
                    Edit 
                    {(type === "hair" || type === "nail") && " Salon "} 
                    {type === "restaurant" && " Restaurant "}
                    {type === "store" && " Store "}
                    Hour(s)
                  </Text>
								</TouchableOpacity>
							:
              <View style={styles.loading}>
                <ActivityIndicator color="black" size="small"/>
              </View>
						}

						{(type == "hair" || type == "nail") && (
              !accountHoldersloading ?
  							editType == 'users' ? 
                  <View style={styles.accountHolders}>
                    <Text style={styles.header}>Edit Stylist(s)</Text>

                    <TouchableOpacity style={styles.accountHoldersAdd} onPress={() => {
                      setAccountform({
                        ...accountForm,
                        show: true,
                        type: 'add',
                        username: ownerRegisterInfo.username,
                        cellnumber: ownerRegisterInfo.cellnumber,
                        currentPassword: ownerRegisterInfo.password, 
                        newPassword: ownerRegisterInfo.password, 
                        confirmPassword: ownerRegisterInfo.password,
                        workerHours: [...hoursRange]
                      })
                    }}>
                      <Text style={styles.accountHoldersAddHeader}>Add a new stylist</Text>
                    </TouchableOpacity>

                    {accountHolders.map((info, index) => (
                      <View key={info.key} style={styles.account}>
                        <View style={styles.column}>
                          <Text style={styles.accountHeader}>#{index + 1}:</Text>
                        </View>

                        <View style={styles.accountEdit}>
                          <View style={styles.column}>
                            <Text style={styles.accountEditHeader}>{info.username}</Text>
                          </View>

                          {(type == "hair" || type == "nail") && (
                            <>
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
                                      profile: { ...accountForm.profioe, uri: logo_url + info.profile.name },
                                      workerHours: info.hours
                                    })
                                  } else { // others can only edit other's hours
                                    setAccountform({ 
                                      ...accountForm, 
                                      show: true, type: 'edit', editType: 'hours', 
                                      id: info.id, workerHours: info.hours
                                    })
                                  }
                                }}>
                                  <Text style={styles.accountEditTouchHeader}>Change Info {ownerId == info.id && "(your)"}</Text>
                                </TouchableOpacity>
                              </View>
                              <View style={styles.column}>
                                <TouchableOpacity onPress={() => deleteTheOwner(info.id)}>
                                  <AntDesign color="black" name="closecircleo" size={wsize(7)}/>
                                </TouchableOpacity>
                              </View>
                            </>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
  								:
                  <TouchableOpacity style={styles.editButton} onPress={() => setEdittype('users')}>
                    <Text style={styles.editButtonHeader}>Edit Stylist(s) Info</Text>
                  </TouchableOpacity>
  							:
                <View style={styles.loading}>
                  <ActivityIndicator color="black" size="small"/>
                </View>
						)}

            {(type == "hair" || type == "nail") && (
              !receiveTypeloading ? 
                editType == "receivetype" ? 
                  <View style={styles.receiveTypesBox}>
                    <Text style={styles.receiveTypesHeader}>How do you want to receive appointments</Text>

                    <View style={styles.receiveTypes}>
                      <TouchableOpacity style={[styles.receiveType, { backgroundColor: locationReceivetype == 'stylist' ? 'black' : 'white' }]} onPress={() => setTheReceiveType('stylist')}>
                        <Text style={[styles.receiveTypeHeader, { color: locationReceivetype == 'stylist' ? 'white' : 'black' }]}>By each stylist</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.receiveType, { backgroundColor: locationReceivetype == 'computer' ? 'black' : 'white' }]} onPress={() => setTheReceiveType('computer')}>
                        <Text style={[styles.receiveTypeHeader, { color: locationReceivetype == 'computer' ? 'white' : 'black' }]}>By main computer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  :
                  <TouchableOpacity style={styles.editButton} onPress={() => setEdittype('receivetype')}>
                    <Text style={styles.editButtonHeader}>Edit Receive Type</Text>
                  </TouchableOpacity>
                :
                <View style={styles.loading}>
                  <ActivityIndicator color="black" size="small"/>
                </View>
            )}
					</View>
				</ScrollView>

				{accountForm.show && (
					<Modal transparent={true}>
						<SafeAreaView style={styles.accountform}>
              <ScrollView style={{ height: '100%', width: '100%' }}>
                {(!accountForm.editCellnumber && !accountForm.editUsername && !accountForm.editProfile && !accountForm.editPassword && !accountForm.editHours && accountForm.type != 'add') ? 
    							<>
                    <View style={{ alignItems: 'center', marginVertical: 10 }}>
    									<TouchableOpacity onPress={() => {
    										setAccountform({
    											...accountForm,

    											show: false,
    											username: '',
    											cellnumber: '', password: '', confirmPassword: '',
    											profile: { uri: '', name: '' },
    											errorMsg: ""
    										})
    									}}>
    										<AntDesign name="closecircleo" size={wsize(7)}/>
    									</TouchableOpacity>
    								</View>

    								<Text style={styles.accountformHeader}>{accountForm.type == 'add' ? 'Add' : 'Editing'} stylist info</Text>

                    {accountForm.id == ownerId ? 
                      <>
                        <View style={{ alignItems: 'center' }}>
                          <TouchableOpacity style={styles.accountInfoEdit} onPress={() => setAccountform({ ...accountForm, editCellnumber: true, editType: 'cellnumber' })}>
                            <Text style={styles.accountInfoEditHeader}>Change Cell number</Text>
                          </TouchableOpacity>
                        </View>

        								<View style={{ alignItems: 'center' }}>
                          <TouchableOpacity style={styles.accountInfoEdit} onPress={() => setAccountform({ ...accountForm, editUsername: true, editType: 'username' })}>
                            <Text style={styles.accountInfoEditHeader}>Change your name</Text>
                          </TouchableOpacity>
                        </View>

        								<View style={{ alignItems: 'center' }}>
                          <TouchableOpacity style={styles.accountInfoEdit} onPress={() => setAccountform({ ...accountForm, editProfile: true, editType: 'profile' })}>
                            <Text style={styles.accountInfoEditHeader}>Change your profile</Text>
                          </TouchableOpacity>
                        </View>

                        <View style={{ alignItems: 'center' }}>
                          <TouchableOpacity style={styles.accountInfoEdit} onPress={() => setAccountform({ ...accountForm, editPassword: true, editType: 'password' })}>
                            <Text style={styles.accountInfoEditHeader}>Change your password</Text>
                          </TouchableOpacity>
                        </View>

                        {(type == "hair" || type == "nail") && (
                          <View style={{ alignItems: 'center' }}>
                            <TouchableOpacity style={styles.accountInfoEdit} onPress={() => setAccountform({ ...accountForm, editHours: true, editType: 'hours' })}>
                              <Text style={styles.accountInfoEditHeader}>Change your days and hours</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </>
                      :
                      <>
                        {accountForm.workerHours.map((info, index) => (
                          <View key={index} style={styles.workerHour}>
                            {info.working == true ? 
                              <>
                                <View>
                                  <Text style={styles.workerHourHeader}><Text style={{ fontWeight: '300' }}>Working on</Text> {info.header}</Text>
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
                                  <Text style={styles.workerHourActionHeader}>Change to not working</Text>
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
                                    <Text style={styles.workerHourActionHeader}>Change to working</Text>
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
                      <View style={styles.accountformEdit}>
                        {accountForm.addStep == 0 && (
                          <View style={styles.accountformInputField}>
                            <Text style={styles.accountformInputHeader}>Cell number:</Text>
                            <TextInput style={styles.accountformInputInput} onChangeText={(num) => 
                              setAccountform({ 
                                ...accountForm, 
                                cellnumber: displayPhonenumber(accountForm.cellnumber, num, () => Keyboard.dismiss()) 
                              })
                            } keyboardType="numeric" value={accountForm.cellnumber} autoCorrect={false}/>
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
                            <Text style={styles.cameraHeader}>Profile Picture</Text>

                            {accountForm.profile.uri ? 
                              <>
                                <Image style={styles.camera} source={{ uri: accountForm.profile.uri }}/>

                                <TouchableOpacity style={styles.cameraAction} onPress={() => setAccountform({ ...accountForm, profile: { uri: '', name: '' }})}>
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
                                    <Text style={styles.workerHourHeader}><Text style={{ fontWeight: '300' }}>Working on</Text> {info.header}</Text>
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
                                    <Text style={styles.workerHourHeader}><Text style={{ fontWeight: '300' }}>Not working on</Text> {info.header}</Text>

                                    <View style={styles.workerHourActions}>
                                      <TouchableOpacity style={styles.workerHourAction} onPress={() => {
                                        const newWorkerhours = [...accountForm.workerHours]

                                        newWorkerhours[index].working = true

                                        setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                      }}>
                                        <Text style={styles.workerHourActionHeader}>Change to working</Text>
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

                        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                          <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity style={[styles.accountformSubmit, { opacity: accountForm.loading ? 0.3 : 1 }]} disabled={accountForm.loading} onPress={() => {
                              setAccountform({ 
                                ...accountForm, 
                                show: false,
                                type: '', editType: '', addStep: 0, 
                                username: '', editUsername: false,
                                cellnumber: '', editCellnumber: false,
                                currentPassword: '', newPassword: '', confirmPassword: '', editPassword: false,
                                profile: { uri: '', name: '' }, editProfile: false,
                                workerHours: [], editHours: false,
                                errorMsg: ""
                              })
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
                      </View>
                      :
                      <View style={styles.accountformEdit}>
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

                                <TouchableOpacity style={styles.cameraAction} onPress={() => setAccountform({ ...accountForm, profile: { uri: '', name: '' }})}>
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
                                    <Text style={styles.workerHourHeader}><Text style={{ fontWeight: '300' }}>Working on</Text> {info.header}</Text>
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
                                  !info.takeShift ? 
                                    <>
                                      <Text style={styles.workerHourHeader}><Text style={{ fontWeight: '300' }}>Not working on</Text> {info.header}</Text>

                                      <View style={styles.workerHourActions}>
                                        <TouchableOpacity style={styles.workerHourAction} onPress={() => {
                                          const newWorkerhours = [...accountForm.workerHours]

                                          newWorkerhours[index].working = true

                                          setAccountform({ ...accountForm, workerHours: newWorkerhours })
                                        }}>
                                          <Text style={styles.workerHourActionHeader}>Change to working</Text>
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
                                    cellnumber: info.cellnumber, editCellnumber: false,
                                    currentPassword: '', newPassword: '', confirmPassword: '', editPassword: false,
                                    profile: { uri: logo_url + info.profile, name: info.profile }, editProfile: false,
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
                      </View>
                    }
                  </TouchableWithoutFeedback>
                }
              </ScrollView>
						</SafeAreaView>

            {getWorkersbox.show && (
              <Modal transparent={true}>
                <SafeAreaView style={styles.workersBox}>
                  <View style={styles.workersContainer}>
                    <TouchableOpacity style={styles.workersClose} onPress={() => setGetworkersbox({ ...getWorkersbox, show: false })}>
                      <AntDesign color="black" size={wsize(7)} name="closecircleo"/>
                    </TouchableOpacity>
                    {getWorkersbox.workers.map(info => (
                      <View key={info.key} style={styles.row}>
                        {info.row.map(worker => (
                          <TouchableOpacity key={worker.key} style={styles.worker} onPress={() => selectTheOtherWorker(worker.id)}>
                            <View style={styles.workerProfile}>
                              <Image style={resizePhoto(worker.profile, wsize(20))} source={{ uri: logo_url + worker.profile.name }}/>
                            </View>
                            <Text style={styles.workerUsername}>{worker.username}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ))}
                  </View>
                </SafeAreaView>
              </Modal>
            )}
					</Modal>
				)}
        {deleteOwnerbox.show && (
          <Modal transparent={true}>
            <SafeAreaView style={styles.deleteOwnerBox}>
              <View style={styles.deleteOwnerContainer}>
                <View style={styles.deleteOwnerProfile}>
                  <Image style={resizePhoto(deleteOwnerbox.profile, wsize(40))} source={{ uri: logo_url + deleteOwnerbox.profile.name }}/>
                </View>
                <Text style={styles.deleteOwnerHeader}>
                  {deleteOwnerbox.username}
                  {'\n\nWorking ' + deleteOwnerbox.numWorkingdays + ' day(s)'}
                </Text>

                <View>
                  <Text style={styles.deleteOwnerActionsHeader}>Are you sure you want to remove this stylist</Text>
                  <View style={styles.deleteOwnerActions}>
                    <TouchableOpacity style={styles.deleteOwnerAction} onPress={() => setDeleteownerbox({ ...deleteOwnerbox, show: false })}>
                      <Text style={styles.deleteOwnerActionHeader}>No</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteOwnerAction} onPress={() => deleteTheOwner()}>
                      <Text style={styles.deleteOwnerActionHeader}>Yes</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </Modal>
        )}
        {(logo.loading || loading || accountForm.loading) && <Modal transparent={true}><Loadingprogress/></Modal>}
			</View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
  settings: { backgroundColor: 'white', height: '100%', width: '100%' },
	settingsContainer: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },
	box: { alignItems: 'center', height: '100%', width: '100%' },

  locationHeader: { fontSize: wsize(5), fontWeight: 'bold', marginHorizontal: 20, textAlign: 'center' },
  locationAddressHeader: { fontSize: wsize(5), fontWeight: 'bold', margin: 20, textAlign: 'center' },
  locationActionOption: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 10, width: wsize(50) },
  locationActionOptionHeader: { fontSize: wsize(5), textAlign: 'center' },
  locationAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 10, width: 100 },
  locationActionHeader: { fontSize: wsize(5), textAlign: 'center' },

	header: { fontFamily: 'appFont', fontSize: wsize(7), marginTop: 20, textAlign: 'center' },

	inputsBox: { paddingHorizontal: 20, width: '100%' },
	inputContainer: { marginVertical: 20 },
	inputHeader: { fontFamily: 'appFont', fontSize: wsize(5) },
	input: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), padding: 5 },
	cameraContainer: { alignItems: 'center', width: '100%' },
	cameraHeader: { fontSize: wsize(4), fontWeight: 'bold', paddingVertical: 5 },
	camera: { height: wsize(80), width: wsize(80) },
	cameraActions: { flexDirection: 'row' },
	cameraAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginBottom: 50, margin: 5, padding: 5, width: wsize(30) },
	cameraActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	updateButton: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 10 },
	updateButtonHeader: { fontFamily: 'appFont', fontSize: wsize(4) },

  workerHour: { alignItems: 'center', backgroundColor: 'rgba(127, 127, 127, 0.3)', borderRadius: 10, marginTop: 40, marginHorizontal: '5%', padding: '2%', width: '90%' },
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

	accountHolders: { alignItems: 'center', marginHorizontal: 10, marginTop: 20 },
	accountHoldersHeader: { fontFamily: 'appFont', fontSize: wsize(30), textAlign: 'center' },
	accountHoldersAdd: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 3, padding: 5 },
	accountHoldersAddHeader: { fontSize: wsize(5) },
	account: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
	accountHeader: { fontSize: wsize(5), fontWeight: 'bold', padding: 5 },
	accountEdit: { backgroundColor: 'rgba(127, 127, 127, 0.3)', borderRadius: 4, flexDirection: 'row', justifyContent: 'space-around', width: '80%' },
	accountEditHeader: { fontSize: wsize(5), paddingVertical: 8, textAlign: 'center' },
	accountEditTouch: { borderRadius: 2, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: wsize(30) },
  accountEditTouchHeader: { fontSize: wsize(4), textAlign: 'center' },
	
	receiveTypesBox: { alignItems: 'center', marginHorizontal: 10, marginTop: 20 },
  receiveTypesHeader: { fontWeight: 'bold' },
  receiveTypes: { flexDirection: 'row', justifyContent: 'space-between' },
  receiveType: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: 150 },
  receiveTypeHeader: { textAlign: 'center' },

  editButton: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 30, padding: 5, width: wsize(80) },
	editButtonHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },

	// account form
	accountform: { backgroundColor: 'white', height: '100%', paddingVertical: 50 },
  accountformHeader: { fontSize: wsize(6), fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
	accountInfoEdit: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 10, padding: 5, width: '70%' },
  accountInfoEditHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
  accountformInputField: { marginBottom: 20, marginHorizontal: '10%', width: '80%' },
	accountformInputHeader: { fontSize: wsize(5), fontWeight: 'bold' },
	accountformInputInput: { borderRadius: 2, borderStyle: 'solid', borderWidth: 3, fontSize: wsize(5), padding: 5, width: '100%' },
	accountformSubmit: { alignItems: 'center', borderRadius: 2, borderStyle: 'solid', borderWidth: 1, margin: 5, padding: 5, width: wsize(35) },
	accountformSubmitHeader: { fontFamily: 'appFont', fontSize: wsize(5) },
  accountformEdit: { flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	
  workersBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  workersContainer: { alignItems: 'center', backgroundColor: 'white', height: '80%', width: '80%' },
  workersClose: { marginVertical: 30 },
  worker: { alignItems: 'center', height: wsize(25), margin: 5, width: wsize(25) },
  workerProfile: { borderRadius: wsize(20) / 2, height: wsize(20), overflow: 'hidden', width: wsize(20) },
  workerUsername: { fontSize: wsize(5), textAlign: 'center' },
  
  deleteOwnerBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  deleteOwnerContainer: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-between', paddingVertical: 20, width: '80%' },
  deleteOwnerProfile: { borderRadius: wsize(40) / 2, height: wsize(40), overflow: 'hidden', width: wsize(40) },
  deleteOwnerHeader: { fontSize: wsize(5), fontWeight: 'bold', marginVertical: 30, textAlign: 'center' },
  deleteOwnerActionsHeader: { fontSize: wsize(6), fontWeight: 'bold', textAlign: 'center' },
  deleteOwnerActions: { flexDirection: 'row', justifyContent: 'space-around' },
  deleteOwnerAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 10, width: wsize(30) },
  deleteOwnerActionHeader: { fontSize: wsize(4), textAlign: 'center' },

  row: { flexDirection: 'row', justifyContent: 'space-around' },
  loading: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  column: { flexDirection: 'column', justifyContent: 'space-around' },
  errorMsg: { color: 'darkred', fontSize: wsize(4), textAlign: 'center' },
})
