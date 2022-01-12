import React, { useState, useEffect, useRef } from 'react'
import { ActivityIndicator, Dimensions, ScrollView, View, Image, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet, Modal } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { logo_url } from '../../assets/info'
import { 
	addOwner, updateOwner, addBankaccount, updateBankaccount, getAccounts, getBankaccounts, 
	setBankaccountDefault, getBankaccountInfo, deleteTheBankAccount
} from '../apis/owners'
import { getLocationProfile, updateLocation, setLocationHours } from '../apis/locations'
import { loginInfo, ownerRegisterInfo, stripe_key } from '../../assets/info'

// bank account
const { accountNumber, countryCode, currency, routingNumber, accountHolderName } = loginInfo

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight

const fsize = p => {
	return width * p
}

export default function settings(props) {
	const { refetch } = props.route.params
	const required = props.route.params ? props.route.params.required : ""

	const [ownerid, setOwnerid] = useState('')
	const [cameraPermission, setCamerapermission] = useState(null);
	const [pickingPermission, setPickingpermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
	const [editType, setEdittype] = useState('')

	// location information
	const [storeName, setStorename] = useState(loginInfo.storeName)
	const [phonenumber, setPhonenumber] = useState(loginInfo.phonenumber)
	const [addressOne, setAddressone] = useState(loginInfo.addressOne)
	const [addressTwo, setAddresstwo] = useState(loginInfo.addressTwo)
	const [city, setCity] = useState(loginInfo.city)
	const [province, setProvince] = useState(loginInfo.province)
	const [postalcode, setPostalcode] = useState(loginInfo.postalcode)
	const [logo, setLogo] = useState({ uri: '', name: '' })
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
	const [accountHolders, setAccountHolders] = useState([])
	const [accountHoldersloading, setAccountholdersloading] = useState(true)
	const [workerHours, setWorkerhours] = useState([
		{ key: "0", header: "Sunday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true },
		{ key: "1", header: "Monday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true },
		{ key: "2", header: "Tuesday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true },
		{ key: "3", header: "Wednesday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true },
		{ key: "4", header: "Thursday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true },
		{ key: "5", header: "Friday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true },
		{ key: "6", header: "Saturday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: true }
	])

	// bank accounts
	const [bankAccounts, setBankAccounts] = useState([])
	const [bankAccountsloading, setBankaccountsloading] = useState(true)

	const [errorMsg, setErrormsg] = useState('')
	const [loading, setLoading] = useState(false)
	const [accountForm, setAccountform] = useState({
		show: false,
		type: '',
		id: -1,
		username: ownerRegisterInfo.username,
		cellnumber: ownerRegisterInfo.cellnumber, 
		password: ownerRegisterInfo.password, 
		confirmPassword: ownerRegisterInfo.password,
		profile: { uri: '', name: '' },

		loading: false,
		errorMsg: ''
	})
	const [bankAccountForm, setBankaccountform] = useState({
		show: false,
		id: -1,
		type: '',
		accountNumber: '', 
		countryCode: '',
		currency: '',

		// routing number: '0' + institution + transit number
		routingNumber: '',
		institutionNumber: '',
		placeholder: '',
		transitNumber: '',

		accountHolderName: '', 

		loading: false,
		errorMsg: ''
	})

	const isMounted = useRef(null)

	const updateYourLocation = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const { details } = await NetInfo.fetch()
		const ipAddress = details.ipAddress

		if (storeName && phonenumber && addressOne && city && province && postalcode) {
			const [{ latitude, longitude }] = await Location.geocodeAsync(`${addressOne} ${addressTwo}, ${city} ${province}, ${postalcode}`)
			const time = (Date.now() / 1000).toString().split(".")[0]
			const data = {
				storeName, phonenumber, addressOne, addressTwo, city, province, postalcode, logo,
				longitude, latitude, ownerid, time, ipAddress
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
					} else {
						setErrormsg("an error has occurred in server")
					}
				})
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
		const ownerid = await AsyncStorage.getItem("ownerid")
		const locationid = await AsyncStorage.getItem("locationid")
		const hours = {}

		setLoading(true)

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
					setLoading(false)
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}

	const addNewOwner = async() => {
		const hours = {}

		workerHours.forEach(function (workerHour) {
			let { opentime, closetime, working } = workerHour
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

			hours[workerHour.header.substr(0, 3)] = { opentime: newOpentime, closetime: newClosetime, working }
		})

		const { cellnumber, username, password, confirmPassword, profile } = accountForm
		const data = { ownerid, cellnumber, username, password, confirmPassword, hours, profile }

		setAccountform({ ...accountForm, loading: true, errorMsg: "" })

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
						...accountForm, show: false, type: '', username: '', cellnumber: '', 
						password: '', confirmPassword: '', profile: { uri: '', name: '' }, 
						loading: false, errorMsg: ""
					})
					getAllAccounts()
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data

					setAccountform({ ...accountForm, errormsg })
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}
	const updateWorkingHour = (index, timetype, dir, open) => {
		const newWorkerhours = [...workerHours]
		let value, period

		value = open ? 
			newWorkerhours[index].opentime[timetype]
			:
			newWorkerhours[index].closetime[timetype]

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
				}

				break
			case "period":
				value = value == "AM" ? "PM" : "AM"

				break
			default:
		}

		if (open) {
			newWorkerhours[index].opentime[timetype] = value
		} else {
			newWorkerhours[index].closetime[timetype] = value
		}

		setWorkerhours(newWorkerhours)
	}
	const working = index => {
		const newWorkerhours = [...workerHours]

		newWorkerhours[index].working = !newWorkerhours[index].working

		setWorkerhours(newWorkerhours)
	}
	const updateTheOwner = async() => {
		const hours = {}

		workerHours.forEach(function (workerHour) {
			let { opentime, closetime, working } = workerHour
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

			hours[workerHour.header.substr(0, 3)] = { opentime: newOpentime, closetime: newClosetime, working }
		})

		const { id, cellnumber, username, password, confirmPassword, profile } = accountForm
		const data = { ownerid: id, cellnumber, username, password, hours, confirmPassword, profile }

		updateOwner(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}

				return
			})
			.then((res) => {
				if (res) {
					setAccountform({
						...accountForm,
						show: false,
						type: '',
						username: '',
						cellnumber: '',
						password: '',
						confirmPassword: '',
						profile: { uri: '', name: '' },
						errorMsg: ""
					})
					getAllAccounts()
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}

	const openBankAccountForm = () => {
		setBankaccountform({
			...bankAccountForm,
			show: true,
			id: '',
			type: 'add',
			accountNumber: accountNumber, 
			countryCode: countryCode,
			currency: currency,

			// routing number: '0' + institution + transit number
			routingNumber: routingNumber,
			institutionNumber: routingNumber.substr(1, 3),
			placeholder: '',
			transitNumber: routingNumber.substr(4),

			accountHolderName: accountHolderName
		})
	}
	const addNewBankAccount = async() => {
		const locationid = await AsyncStorage.getItem("locationid")
		const { accountHolderName, accountNumber, transitNumber, routingNumber } = bankAccountForm
		let data = { locationid }
		const bankaccountDetails = {
			"bank_account[country]": countryCode,
			"bank_account[currency]": currency,
			"bank_account[account_holder_name]": accountHolderName,
			"bank_account[account_holder_type]": "company",
			"bank_account[routing_number]": routingNumber,
			"bank_account[account_number]": accountNumber
		};

		if (accountNumber && countryCode && currency && routingNumber && accountHolderName) {
			let formBody = [];
			
			for (let property in bankaccountDetails) {
				let encodedKey = encodeURIComponent(property);
				let encodedValue = encodeURIComponent(bankaccountDetails[property]);
				formBody.push(encodedKey + "=" + encodedValue);
			}
			formBody = formBody.join("&");
			
			const resp = await fetch("https://api.stripe.com/v1/tokens", {
				method: "post",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/x-www-form-urlencoded",
					Authorization: "Bearer " + stripe_key,
				},
				body: formBody,
			});
			const json = await resp.json()

			data = { ...data, banktoken: json.id }

			setBankaccountform({ ...bankAccountForm, loading: true })

			addBankaccount(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}

					return
				})
				.then((res) => {
					if (res) {
						setBankaccountform({
							...bankAccountForm,
							show: false,
							id: '',
							accountHolderName: '', accountNumber: '', transitNumber, routingNumber: '',
							loading: false
						})
						getAllBankaccounts()
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						
					} else {
						setErrormsg("an error has occurred in server")
					}
				})
		} else {
			if (!accountNumber) {
				setBankaccountform({
					...bankAccountForm,
					errorMsg: "Please enter your account number"
				})

				return
			}

			if (!countryCode) {
				setBankaccountform({
					...bankAccountForm,
					errorMsg: "Please select a country"
				})

				return
			}

			if (!currency) {
				setBankaccountform({
					...bankAccountForm,
					errorMsg: "Please select a currency"
				})

				return
			}

			if (!routingNumber) {
				setBankaccountform({
					...bankAccountForm,
					errorMsg: "Please enter your routing number"
				})

				return
			}

			if (!accountHolderName) {
				setBankaccountform({
					...bankAccountForm,
					errorMsg: "Please enter the account holder name"
				})

				return
			}
		}
	}

	const useBankAccount = async(bankid) => {
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { locationid, bankid }

		setBankaccountDefault(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const newBankaccounts = [...bankAccounts]

					newBankaccounts.forEach(function (data) {
						data.default = false

						if (data.bankid == bankid) {
							data.default = true
						}
					})

					setBankAccounts(newBankaccounts)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}
	const editBankAccount = async(bankid, index) => {
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { locationid, bankid }

		getBankaccountInfo(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { account_holder_name, last4, transit_number, institution_number } = res.bankaccountInfo

					setBankaccountform({
						show: true,
						id: bankid,
						type: 'edit',

						accountNumber: accountNumber,
						routingNumber: routingNumber,
						institutionNumber: institution_number,
						placeholder: "****" + last4,
						accountHolderName: account_holder_name, 
						transitNumber: transit_number
					})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}
	const updateTheBankAccount = async() => {
		const locationid = await AsyncStorage.getItem("locationid")
		const { id, accountHolderName, accountNumber, routingNumber, institutionNumber, transitNumber } = bankAccountForm
		const data = { oldbanktoken: id, locationid }
		const bankaccountDetails = {
			"bank_account[country]": countryCode,
			"bank_account[currency]": currency,
			"bank_account[account_holder_name]": accountHolderName,
			"bank_account[account_holder_type]": "company",
			"bank_account[routing_number]": routingNumber,
			"bank_account[account_number]": accountNumber
		};

		let formBody = [];
			
		for (let property in bankaccountDetails) {
			let encodedKey = encodeURIComponent(property);
			let encodedValue = encodeURIComponent(bankaccountDetails[property]);
			formBody.push(encodedKey + "=" + encodedValue);
		}
		formBody = formBody.join("&");
		
		const resp = await fetch("https://api.stripe.com/v1/tokens", {
			method: "post",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: "Bearer sk_test_lft1B76yZfF2oEtD5rI3y8dz",
			},
			body: formBody,
		});
		const json = await resp.json()

		data['banktoken'] = json.id

		setBankaccountform({ ...bankAccountForm, loading: true })

		updateBankaccount(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}

				return
			})
			.then((res) => {
				setBankaccountform({
					...bankAccountForm,
					show: false,
					id: '',
					accountHolderName: '', accountNumber: '', transitNumber: '', routingNumber: '',
					loading: false
				})
				getAllBankaccounts()
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}
	const deleteBankAccount = async(bankid, index) => {
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { locationid, bankid }

		deleteTheBankAccount(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const newBankaccounts = [...bankAccounts]

					newBankaccounts.splice(index, 1)

					setBankAccounts(newBankaccounts)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
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
				if (res && isMounted.current == true) {
					const { name, phonenumber, addressOne, addressTwo, city, province, postalcode, logo, hours, type } = res.info

					setStorename(name)
					setPhonenumber(phonenumber)
					setAddressone(addressOne)
					setAddresstwo(addressTwo)
					setCity(city)
					setProvince(province)
					setPostalcode(postalcode)
					setLogo({ uri: logo_url + logo, name: logo })
					setType(type)
					setInfoloading(false)
					setDays(hours)
					setDaysloading(false)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
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
				if (res && isMounted.current == true) {
					setOwnerid(ownerid)
					setAccountHolders(res.accounts)
					setAccountholdersloading(false)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}
	const snapProfile = async() => {
		let letters = [
			"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", 
			"n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
		]
		let photo_name_length = Math.floor(Math.random() * (15 - 10)) + 10
		let char = "", captured, self = this

		if (camComp) {
			let options = { quality: 0 };
			let photo = await camComp.takePictureAsync(options)
			let photo_option = [
				{ resize: { width: width, height: width }},
				{ flip: ImageManipulator.FlipType.Horizontal }
			]
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
				setAccountform({
					...accountForm,
					profile: {
						uri: `${FileSystem.documentDirectory}/${char}.jpg`,
						name: `${char}.jpg`
					}
				})
			})
		}
	}
	const chooseProfile = async() => {
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
				setAccountform({
					...accountForm,
					profile: {
						uri: `${FileSystem.documentDirectory}/${char}.jpg`,
						name: `${char}.jpg`
					}
				})
			})
		}
	}
	const getAllBankaccounts = async() => {
		const locationid = await AsyncStorage.getItem("locationid")

		getBankaccounts(locationid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res && isMounted.current == true) {
					setBankAccounts(res.bankaccounts)
					setBankaccountsloading(false)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}
	const snapPhoto = async() => {
		let letters = [
			"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", 
			"n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
		]
		let photo_name_length = Math.floor(Math.random() * (15 - 10)) + 10
		let char = "", captured, self = this

		if (camComp) {
			let options = { quality: 0 };
			let photo = await camComp.takePictureAsync(options)
			let photo_option = [{ resize: { width: width, height: width }}]
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
				setLogo({
					uri: `${FileSystem.documentDirectory}/${char}.jpg`,
					name: `${char}.jpg`
				})
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
				setLogo({
					uri: `${FileSystem.documentDirectory}/${char}.jpg`,
					name: `${char}.jpg`
				})
			})
		}
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
		isMounted.current = true

		getTheLocationProfile()
		getAllAccounts()
		getAllBankaccounts()

		allowCamera()
		allowChoosing()

		if (required == "bankaccount") {
			openBankAccountForm()
		}

		return () => isMounted.current = false
	}, [])

	return (
		<View style={style.settings}>
			<View style={style.settingsContainer}>
				<ScrollView style={{ width: '100%' }}>
					<View style={[style.box, { opacity: loading ? 0.6 : 1 }]}>
						{!infoLoading ?
							editType == 'information' ? 
								<>
									<Text style={style.header}>Edit Store Address</Text>

									<View style={style.inputsBox}>
										<View style={style.inputContainer}>
											<Text style={style.inputHeader}>{type}'s name:</Text>
											<TextInput style={style.input} onChangeText={(storeName) => setStorename(storeName)} value={storeName} autoCorrect={false}/>
										</View>
										<View style={style.inputContainer}>
											<Text style={style.inputHeader}>{type}'s Phone number:</Text>
											<TextInput style={style.input} onChangeText={(phonenumber) => setPhonenumber(phonenumber)} value={phonenumber} keyboardType="numeric" autoCorrect={false}/>
										</View>
										<View style={style.inputContainer}>
											<Text style={style.inputHeader}>{type}'s address #1:</Text>
											<TextInput style={style.input} onChangeText={(addressOne) => setAddressone(addressOne)} value={addressOne} keyboardType="numeric" autoCorrect={false}/>
										</View>
										<View style={style.inputContainer}>
											<Text style={style.inputHeader}>{type}'s address #2:</Text>
											<TextInput style={style.input} onChangeText={(addressTwo) => setAddresstwo(addressTwo)} value={addressTwo} keyboardType="numeric" autoCorrect={false}/>
										</View>
										<View style={style.inputContainer}>
											<Text style={style.inputHeader}>City:</Text>
											<TextInput style={style.input} onChangeText={(city) => setCity(city)} value={city} keyboardType="numeric" autoCorrect={false}/>
										</View>
										<View style={style.inputContainer}>
											<Text style={style.inputHeader}>Province:</Text>
											<TextInput style={style.input} onChangeText={(province) => setProvince(province)} value={province} keyboardType="numeric" autoCorrect={false}/>
										</View>
										<View style={style.inputContainer}>
											<Text style={style.inputHeader}>Postal Code:</Text>
											<TextInput style={style.input} onChangeText={(postalcode) => setPostalcode(postalcode)} value={postalcode} keyboardType="numeric" autoCorrect={false}/>
										</View>

										<View style={style.cameraContainer}>
											<Text style={style.inputHeader}>Store Logo</Text>

											{logo.uri ? (
												<>
													<Image style={style.camera} source={{ uri: logo.uri }}/>

													<TouchableOpacity style={style.cameraAction} onPress={() => setLogo({ uri: '', name: '' })}>
														<Text style={style.cameraActionHeader}>Cancel</Text>
													</TouchableOpacity>
												</>
											) : (
												<>
													<Camera style={style.camera} type={Camera.Constants.Type.back} ref={r => {setCamcomp(r)}}/>

													<View style={style.cameraActions}>
														<TouchableOpacity style={style.cameraAction} onPress={snapPhoto.bind(this)}>
															<Text style={style.cameraActionHeader}>Take this photo</Text>
														</TouchableOpacity>
														<TouchableOpacity style={style.cameraAction} onPress={() => choosePhoto()}>
															<Text style={style.cameraActionHeader}>Choose from phone</Text>
														</TouchableOpacity>
													</View>
												</>
											)}	
										</View>

										{errorMsg ? <Text style={style.errorMsg}>{errorMsg}</Text> : null }

										{loading && <ActivityIndicator color="black" size="large"/>}
									</View>

									<TouchableOpacity style={style.updateButton} disabled={loading} onPress={() => updateYourLocation()}>
										<Text style={style.updateButtonHeader}>Save</Text>
									</TouchableOpacity>
								</>
								:
								<TouchableOpacity style={style.editButton} onPress={() => setEdittype('information')}>
									<Text style={style.editButtonHeader}>Edit Location Info</Text>
								</TouchableOpacity>
							:
							<ActivityIndicator marginTop={'10%'} color="black" size="small"/>
						}

						{!daysLoading ?
							editType == 'hours' ? 
								<>
									<Text style={style.header}>Edit Store Hour(s)</Text>

									<View style={style.days}>
										{days.map((info, index) => (
											<View key={index} style={style.day}>
												{info.close == false ? 
													<>
														<View style={{ opacity: info.close ? 0.1 : 1 }}>
															<Text style={style.dayHeader}>The store is open on {info.header}</Text>
															<View style={style.timeSelectionContainer}>
																<View style={style.timeSelection}>
																	<View style={style.selection}>
																		<TouchableOpacity onPress={() => updateTime(index, "hour", "up", true)}>
																			<AntDesign name="up" size={30}/>
																		</TouchableOpacity>
																		<Text style={style.selectionHeader}>{info.opentime.hour}</Text>
																		<TouchableOpacity onPress={() => updateTime(index, "hour", "down", true)}>
																			<AntDesign name="down" size={30}/>
																		</TouchableOpacity>
																	</View>
																	<Text style={style.selectionDiv}>:</Text>
																	<View style={style.selection}>
																		<TouchableOpacity onPress={() => updateTime(index, "minute", "up", true)}>
																			<AntDesign name="up" size={30}/>
																		</TouchableOpacity>
																		<Text style={style.selectionHeader}>{info.opentime.minute}</Text>
																		<TouchableOpacity onPress={() => updateTime(index, "minute", "down", true)}>
																			<AntDesign name="down" size={30}/>
																		</TouchableOpacity>
																	</View>
																	<View style={style.selection}>
																		<TouchableOpacity onPress={() => updateTime(index, "period", "up", true)}>
																			<AntDesign name="up" size={30}/>
																		</TouchableOpacity>
																		<Text style={style.selectionHeader}>{info.opentime.period}</Text>
																		<TouchableOpacity onPress={() => updateTime(index, "period", "down", true)}>
																			<AntDesign name="down" size={30}/>
																		</TouchableOpacity>
																	</View>
																</View>
																<Text style={style.timeSelectionHeader}>To</Text>
																<View style={style.timeSelection}>
																	<View style={style.selection}>
																		<TouchableOpacity onPress={() => updateTime(index, "hour", "up", false)}>
																			<AntDesign name="up" size={30}/>
																		</TouchableOpacity>
																		<Text style={style.selectionHeader}>{info.closetime.hour}</Text>
																		<TouchableOpacity onPress={() => updateTime(index, "hour", "down", false)}>
																			<AntDesign name="down" size={30}/>
																		</TouchableOpacity>
																	</View>
																	<Text style={style.selectionDiv}>:</Text>
																	<View style={style.selection}>
																		<TouchableOpacity onPress={() => updateTime(index, "minute", "up", false)}>
																			<AntDesign name="up" size={30}/>
																		</TouchableOpacity>
																		<Text style={style.selectionHeader}>{info.closetime.minute}</Text>
																		<TouchableOpacity onPress={() => updateTime(index, "minute", "down", false)}>
																			<AntDesign name="down" size={30}/>
																		</TouchableOpacity>
																	</View>
																	<View style={style.selection}>
																		<TouchableOpacity onPress={() => updateTime(index, "period", "up", false)}>
																			<AntDesign name="up" size={30}/>
																		</TouchableOpacity>
																		<Text style={style.selectionHeader}>{info.closetime.period}</Text>
																		<TouchableOpacity onPress={() => updateTime(index, "period", "down", false)}>
																			<AntDesign name="down" size={30}/>
																		</TouchableOpacity>
																	</View>
																</View>
															</View>
														</View>
														<TouchableOpacity style={style.dayTouch} onPress={() => {
															const newDays = [...days]

															newDays[index].close = true

															setDays(newDays)
														}}>
															<Text style={style.dayTouchHeader}>Change to not open</Text>
														</TouchableOpacity>
													</>
													:
													<>
														<Text style={style.dayHeader}>The store is not open on {info.header}</Text>

														<TouchableOpacity style={style.dayTouch} onPress={() => {
															const newDays = [...days]

															newDays[index].close = false

															setDays(newDays)
														}}>
															<Text style={style.dayTouchHeader}>Change to open</Text>
														</TouchableOpacity>
													</>
												}
											</View>
										))}
									</View>

									<TouchableOpacity style={style.updateButton} disabled={loading} onPress={() => updateLocationHours()}>
										<Text style={style.updateButtonHeader}>Save</Text>
									</TouchableOpacity>
								</>
								:
								<TouchableOpacity style={style.editButton} onPress={() => setEdittype('hours')}>
									<Text style={style.editButtonHeader}>Edit Store Hour(s)</Text>
								</TouchableOpacity>
							:
							<ActivityIndicator marginTop={'10%'} color="black" size="small"/>
						}

						{!accountHoldersloading ?
							editType == 'users' ? 
								<View style={style.accountHolders}>
									<Text style={style.header}>Edit Worker(s)</Text>

									<TouchableOpacity style={style.accountHoldersAdd} onPress={() => {
										setAccountform({
											...accountForm,
											show: true,
											type: 'add'
										})
									}}>
										<Text style={style.accountHoldersAddHeader}>Add a worker</Text>
									</TouchableOpacity>

									{accountHolders.map((info, index) => (
										<View key={info.key} style={style.account}>
											<Text style={style.accountHeader}>#{index + 1}:</Text>

											<View style={style.accountEdit}>
												<Text style={style.accountEditHeader}>{info.username}</Text>
												<TouchableOpacity style={style.accountEditTouch} onPress={() => {
													setAccountform({
														...accountForm,
														show: true,
														type: 'edit',
														id: info.id,
														username: info.username,
														cellnumber: info.cellnumber,
														password: '',
														confirmPassword: '',
														profile: { uri: logo_url + info.profile, name: info.profile },
													})
													setWorkerhours(info.hours)
												}}>
													<Text>Change Info</Text>
												</TouchableOpacity>
											</View>
										</View>
									))}
								</View>
								:
								<TouchableOpacity style={style.editButton} onPress={() => setEdittype('users')}>
									<Text style={style.editButtonHeader}>Edit Worker(s)</Text>
								</TouchableOpacity>
							:
							<ActivityIndicator marginTop={'10%'} color="black" size="small"/>
						}

						{!bankAccountsloading ?
							editType == 'bankaccounts' ? 
								<View style={style.bankaccountHolders}>
									<Text style={style.header}>Edit Bank Account(s)</Text>

									<TouchableOpacity style={style.bankaccountHolderAdd} onPress={() => openBankAccountForm()}>
										<Text style={style.bankaccountHolderAddHeader}>Add a bank account</Text>
									</TouchableOpacity>

									{bankAccounts.map((info, index) => (
										<View key={info.key} style={style.bankaccount}>
											<View style={style.bankaccountRow}>
												<Text style={style.bankaccountHeader}>#{index + 1}:</Text>
												<View style={style.bankaccountNumberHolder}>
													<Text style={style.bankaccountNumberHeader}>{info.number}</Text>
												</View>
											</View>
											<View style={style.bankaccountActions}>
												<TouchableOpacity style={info.default ? style.bankaccountActionDisabled : style.bankaccountAction} disabled={info.default} onPress={() => useBankAccount(info.bankid)}>
													<Text style={info.default ? style.bankaccountActionHeaderDisabled : style.bankaccountActionHeader}>Set default</Text>
												</TouchableOpacity>
												<TouchableOpacity style={style.bankaccountAction} onPress={() => editBankAccount(info.bankid, index)}>
													<Text style={style.bankaccountActionHeader}>Change</Text>
												</TouchableOpacity>
												<TouchableOpacity style={style.bankaccountAction} onPress={() => deleteBankAccount(info.bankid, index)}>
													<Text style={style.bankaccountActionHeader}>Delete</Text>
												</TouchableOpacity>
											</View>
										</View>
									))}
								</View>
								:
								<TouchableOpacity style={style.editButton} onPress={() => setEdittype('bankaccounts')}>
									<Text style={style.editButtonHeader}>Edit Bank account(s)</Text>
								</TouchableOpacity>
							:
							<ActivityIndicator marginTop={'10%'} color="black" size="small"/>
						}
					</View>
				</ScrollView>

				{accountForm.show && (
					<Modal transparent={true}>
						<View style={style.accountform}>
							<TouchableWithoutFeedback style={{ paddingVertical: offsetPadding }} onPress={() => Keyboard.dismiss()}>
								<ScrollView>
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
											<AntDesign name="closecircleo" size={30}/>
										</TouchableOpacity>
									</View>

									<Text style={style.accountformHeader}>{accountForm.type == 'add' ? 'Add' : 'Editing'} worker info</Text>

									<View style={style.accountformInputField}>
										<Text style={style.accountformInputHeader}>Cell number:</Text>
										<TextInput style={style.accountformInputInput} onChangeText={(number) => setAccountform({
											...accountForm,
											cellnumber: number
										})} value={accountForm.cellnumber} autoCorrect={false}/>
									</View>

									<View style={style.accountformInputField}>
										<Text style={style.accountformInputHeader}>Username:</Text>
										<TextInput style={style.accountformInputInput} onChangeText={(username) => setAccountform({ ...accountForm, username })} value={accountForm.username} autoCorrect={false}/>
									</View>

									<View style={style.cameraContainer}>
										<Text style={style.cameraHeader}>Profile Picture</Text>

										{accountForm.profile.uri ? 
											<>
												<Image style={style.camera} source={{ uri: accountForm.profile.uri }}/>

												<TouchableOpacity style={style.cameraAction} onPress={() => setAccountform({ ...accountForm, profile: { uri: '', name: '' }})}>
													<Text style={style.cameraActionHeader}>Cancel</Text>
												</TouchableOpacity>
											</>
											:
											<>
												<Camera style={style.camera} type={Camera.Constants.Type.front} ref={r => {setCamcomp(r)}}/>

												<View style={style.cameraActions}>
													<TouchableOpacity style={style.cameraAction} onPress={snapProfile.bind(this)}>
														<Text style={style.cameraActionHeader}>Take this photo</Text>
													</TouchableOpacity>
													<TouchableOpacity style={style.cameraAction} onPress={() => chooseProfile()}>
														<Text style={style.cameraActionHeader}>Choose from phone</Text>
													</TouchableOpacity>
												</View>
											</>
										}	
									</View>

									<View style={style.accountformInputField}>
										<Text style={style.accountformInputHeader}>Password:</Text>
										<TextInput style={style.accountformInputInput} secureTextEntry={true} onChangeText={(password) => setAccountform({
											...accountForm,
											password: password
										})} value={accountForm.password} autoCorrect={false}/>
									</View>

									<View style={style.accountformInputField}>
										<Text style={style.accountformInputHeader}>Confirm password:</Text>
										<TextInput style={style.accountformInputInput} secureTextEntry={true} onChangeText={(password) => setAccountform({
											...accountForm,
											confirmPassword: password
										})} value={accountForm.confirmPassword} autoCorrect={false}/>
									</View>

									<View style={style.workerHours}>
										{workerHours.map((info, index) => (
											<View key={index} style={style.workerHour}>
												{info.working == true ? 
													<>
														<View style={{ opacity: info.working ? 1 : 0.1 }}>
															<Text style={style.workerHourHeader}>You are working on {info.header}</Text>
															<Text style={style.workerHourHeader}>Edit your time</Text>
															<View style={style.timeSelectionContainer}>
																<View style={style.timeSelection}>
																	<View style={style.selection}>
																		<TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "up", true)}>
																			<AntDesign name="up" size={30}/>
																		</TouchableOpacity>
																		<Text style={style.selectionHeader}>{info.opentime.hour}</Text>
																		<TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "down", true)}>
																			<AntDesign name="down" size={30}/>
																		</TouchableOpacity>
																	</View>
																	<Text style={style.selectionDiv}>:</Text>
																	<View style={style.selection}>
																		<TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "up", true)}>
																			<AntDesign name="up" size={30}/>
																		</TouchableOpacity>
																		<Text style={style.selectionHeader}>{info.opentime.minute}</Text>
																		<TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "down", true)}>
																			<AntDesign name="down" size={30}/>
																		</TouchableOpacity>
																	</View>
																	<View style={style.selection}>
																		<TouchableOpacity onPress={() => updateWorkingHour(index, "period", "up", true)}>
																			<AntDesign name="up" size={30}/>
																		</TouchableOpacity>
																		<Text style={style.selectionHeader}>{info.opentime.period}</Text>
																		<TouchableOpacity onPress={() => updateWorkingHour(index, "period", "down", true)}>
																			<AntDesign name="down" size={30}/>
																		</TouchableOpacity>
																	</View>
																</View>
																<Text style={style.timeSelectionHeader}>To</Text>
																<View style={style.timeSelection}>
																	<View style={style.selection}>
																		<TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "up", false)}>
																			<AntDesign name="up" size={30}/>
																		</TouchableOpacity>
																		<Text style={style.selectionHeader}>{info.closetime.hour}</Text>
																		<TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "down", false)}>
																			<AntDesign name="down" size={30}/>
																		</TouchableOpacity>
																	</View>
																	<Text style={style.selectionDiv}>:</Text>
																	<View style={style.selection}>
																		<TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "up", false)}>
																			<AntDesign name="up" size={30}/>
																		</TouchableOpacity>
																		<Text style={style.selectionHeader}>{info.closetime.minute}</Text>
																		<TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "down", false)}>
																			<AntDesign name="down" size={30}/>
																		</TouchableOpacity>
																	</View>
																	<View style={style.selection}>
																		<TouchableOpacity onPress={() => updateWorkingHour(index, "period", "up", false)}>
																			<AntDesign name="up" size={30}/>
																		</TouchableOpacity>
																		<Text style={style.selectionHeader}>{info.closetime.period}</Text>
																		<TouchableOpacity onPress={() => updateWorkingHour(index, "period", "down", false)}>
																			<AntDesign name="down" size={30}/>
																		</TouchableOpacity>
																	</View>
																</View>
															</View>
														</View>
														<TouchableOpacity style={style.workerHourTouch} onPress={() => {
															const newWorkerhours = [...workerHours]

															newWorkerhours[index].working = false

															setWorkerhours(newWorkerhours)
														}}>
															<Text style={style.workerHourTouchHeader}>Change to not working</Text>
														</TouchableOpacity>
													</>
													:
													<>
														<Text style={style.workerHourHeader}>You are not working on {info.header}</Text>

														<TouchableOpacity style={style.workerHourTouch} onPress={() => {
															const newWorkerhours = [...workerHours]

															newWorkerhours[index].working = true

															setWorkerhours(newWorkerhours)
														}}>
															<Text style={style.workerHourTouchHeader}>Change to working</Text>
														</TouchableOpacity>
													</>
												}
											</View>
										))}
									</View>

									{accountForm.errormsg ? <Text style={style.errorMsg}>{accountForm.errormsg}</Text> : null}
									{accountForm.loading ? <ActivityIndicator marginBottom={10} size="small"/> : null}

									<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
										<TouchableOpacity style={style.accountformSubmit} onPress={() => {
											setAccountform({
												...accountForm,

												show: false,
												username: '',
												cellnumber: '', password: '', confirmPassword: '',
												profile: { uri: '', name: '' },
												errorMsg: ""
											})
										}}>
											<Text style={style.accountformSubmitHeader}>Cancel</Text>
										</TouchableOpacity>
										<TouchableOpacity style={style.accountformSubmit} onPress={() => {
											if (accountForm.type == 'add') {
												addNewOwner()
											} else {
												updateTheOwner()
											}

											getAllAccounts()
										}}>
											<Text style={style.accountformSubmitHeader}>{accountForm.type == 'add' ? 'Add' : 'Save'} Account</Text>
										</TouchableOpacity>
									</View>
								</ScrollView>
							</TouchableWithoutFeedback>
						</View>
					</Modal>
				)}
				{bankAccountForm.show && (
					<Modal transparent={true}>
						<TouchableWithoutFeedback style={{ paddingVertical: offsetPadding }} onPress={() => Keyboard.dismiss()}>
							<View style={style.bankaccountform}>
								<View style={style.bankaccountformContainer}>
									<View style={{ alignItems: 'center', marginVertical: 5 }}>
										<TouchableOpacity onPress={() => {
											setBankaccountform({
												show: false,
												id: '',
												accountNumber: '', 
												countryCode: 'ca',
												currency: 'cad',

												// routing number: '0' + institution + transit number
												routingNumber: '',
												institutionNumber: '',
												transitNumber: '',

												accountHolderName: ''
											})
										}}>
											<AntDesign name="closecircleo" size={30}/>
										</TouchableOpacity>

										<Text style={style.bankaccountformHeader}>{bankAccountForm.type == 'add' ? 'Add' : 'Editing'} bank account</Text>
									</View>

									<View style={style.bankaccountformInputField}>
										<Text style={style.bankaccountformInputHeader}>Enter Account Holder</Text>
										<TextInput style={style.bankaccountformInputInput} onChangeText={(holder) => setBankaccountform({
											...bankAccountForm,
											accountHolderName: holder.toString()
										})} value={bankAccountForm.accountHolderName} autoCorrect={false}/>
									</View>
									<View style={style.bankaccountformInputField}>
										<Text style={style.bankaccountformInputHeader}>Enter Account Number</Text>
										<TextInput style={style.bankaccountformInputInput} onChangeText={(number) => setBankaccountform({
											...bankAccountForm,
											accountNumber: number.toString()
										})} value={bankAccountForm.accountNumber} placeholder={bankAccountForm.placeholder} autoCorrect={false} keyboardType="numeric"/>
									</View>
									<View style={{ flexDirection: 'row' }}>
										<View style={{ width: '50%' }}>
											<View style={style.bankaccountformInputField}>
												<Text style={style.bankaccountformInputHeader}>Enter Institution Number</Text>
												<TextInput style={style.bankaccountformInputInput} onChangeText={(number) => setBankaccountform({
													...bankAccountForm,
													institutionNumber: number.toString()
												})} value={bankAccountForm.institutionNumber} autoCorrect={false} keyboardType="numeric"/>
											</View>
										</View>
										<View style={{ width: '50%' }}>
											<View style={style.bankaccountformInputField}>
												<Text style={style.bankaccountformInputHeader}>Enter Transit Number</Text>
												<TextInput style={style.bankaccountformInputInput} onChangeText={(number) => setBankaccountform({
													...bankAccountForm,
													transitNumber: number.toString()
												})} value={bankAccountForm.transitNumber} autoCorrect={false} keyboardType="numeric"/>
											</View>
										</View>
									</View>

									{bankAccountForm.errormsg ? <Text style={style.errorMsg}>{bankAccountForm.errormsg}</Text> : null}
									{bankAccountForm.loading ? <ActivityIndicator marginBottom={10} size="small"/> : null}

									<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
										<TouchableOpacity style={style.bankaccountformSubmit} disabled={bankAccountForm.loading} onPress={() => {
											if (bankAccountForm.type == 'add') {
												addNewBankAccount()
											} else {
												updateTheBankAccount()
											}
										}}>
											<Text style={style.bankaccountformSubmitHeader}>{bankAccountForm.type == 'add' ? 'Add' : 'Save'} Bank Account</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</TouchableWithoutFeedback>
					</Modal>
				)}
			</View>
		</View>
	)
}

const style = StyleSheet.create({
	settings: { backgroundColor: 'white', height: '100%', paddingBottom: offsetPadding, width: '100%' },
	settingsContainer: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },
	box: { alignItems: 'center', height: '100%', width: '100%' },
	header: { fontFamily: 'appFont', fontSize: fsize(0.07), marginTop: 20, textAlign: 'center' },

	inputsBox: { paddingHorizontal: 20, width: '100%' },
	inputContainer: { marginVertical: 20 },
	inputHeader: { fontFamily: 'appFont', fontSize: fsize(0.04) },
	input: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: fsize(0.04), padding: 5 },
	cameraContainer: { alignItems: 'center', width: '100%' },
	cameraHeader: { fontSize: fsize(0.04), fontWeight: 'bold', paddingVertical: 5 },
	camera: { height: fsize(0.8), width: fsize(0.8) },
	cameraActions: { flexDirection: 'row' },
	cameraAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginBottom: 50, margin: 5, padding: 5, width: fsize(0.3) },
	cameraActionHeader: { fontSize: fsize(0.04), textAlign: 'center' },
	errorMsg: { color: 'red', fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },

	updateButton: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 10 },
	updateButtonHeader: { fontFamily: 'appFont', fontSize: fsize(0.05) },

	days: {  },
	day: { alignItems: 'center', marginVertical: 40, padding: 5 },
	dayHeader: { fontSize: fsize(0.06), marginHorizontal: 10, textAlign: 'center' },
	dayAnswer: { alignItems: 'center' },
	dayAnswerActions: { flexDirection: 'row', justifyContent: 'space-around', width: 210 },
	dayAnswerAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 10, width: 100 },
	dayAnswerActionHeader: {  },
	timeSelectionContainer: { flexDirection: 'row' },
	timeSelection: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, flexDirection: 'row', marginHorizontal: 5 },
	timeSelectionHeader: { fontSize: fsize(0.06), fontWeight: 'bold', paddingVertical: 38 },
	selection: { alignItems: 'center', margin: 5 },
	selectionHeader: { fontSize: fsize(0.07), textAlign: 'center' },
	selectionDiv: { fontSize: fsize(0.07), marginVertical: fsize(0.08) },
	dayTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5 },
	dayTouchHeader: { fontSize: fsize(0.05), textAlign: 'center' },

	accountHolders: { alignItems: 'center', marginHorizontal: 10, marginTop: 20 },
	accountHoldersHeader: { fontFamily: 'appFont', fontSize: fsize(0.06), textAlign: 'center' },
	accountHoldersAdd: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 3, padding: 5 },
	accountHoldersAddHeader: { fontSize: fsize(0.05) },
	account: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
	accountHeader: { fontSize: fsize(0.05), fontWeight: 'bold', padding: 5 },
	accountEdit: { backgroundColor: 'rgba(127, 127, 127, 0.3)', borderRadius: 4, flexDirection: 'row', justifyContent: 'space-between', width: '80%' },
	accountEditHeader: { fontSize: fsize(0.05), paddingVertical: 8, textAlign: 'center', width: '50%' },
	accountEditTouch: { alignItems: 'center', borderRadius: 2, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5 },

	bankaccountHolders: { alignItems: 'center', marginHorizontal: 10, marginTop: 20 },
	bankaccountHolderHeader: { fontFamily: 'appFont', fontSize: fsize(0.06), textAlign: 'center' },
	bankaccountHolderAdd: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 3, padding: 5 },
	bankaccountHolderAddHeader: { fontSize: fsize(0.05) },
	bankaccount: { marginVertical: 30 },
	bankaccountRow: { flexDirection: 'row', justifyContent: 'space-between' },
	bankaccountHeader: { fontSize: fsize(0.05), fontWeight: 'bold', padding: 5 },
	bankaccountNumberHolder: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, padding: 5, width: '70%' },
	bankaccountNumberHeader: { fontSize: fsize(0.05), paddingVertical: 4, textAlign: 'center', width: '100%' },
	bankaccountActions: { flexDirection: 'row', justifyContent: 'space-around' },
	bankaccountAction: { borderRadius: 2, borderStyle: 'solid', borderWidth: 2, marginTop: 5, padding: 5, width: 90 },
	bankaccountActionHeader: { fontSize: fsize(0.04), textAlign: 'center' },
	bankaccountActionDisabled: { backgroundColor: 'black', borderRadius: 2, borderStyle: 'solid', borderWidth: 2, marginTop: 5, padding: 5, width: 90 },
	bankaccountActionHeaderDisabled: { color: 'white', fontSize: fsize(0.04), textAlign: 'center' },
	
	editButton: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 30, padding: 5, width: fsize(0.8) },
	editButtonHeader: { fontSize: fsize(0.05), fontWeight: 'bold', textAlign: 'center' },

	// account form
	accountform: { backgroundColor: 'white', paddingVertical: 50 },
	accountformHeader: { fontSize: fsize(0.04), fontWeight: 'bold', marginVertical: 50, textAlign: 'center' },
	accountformInputField: { marginBottom: 20, marginHorizontal: '10%', width: '80%' },
	accountformInputHeader: { fontSize: fsize(0.04), fontWeight: 'bold' },
	accountformInputInput: { borderRadius: 2, borderStyle: 'solid', borderWidth: 3, fontSize: fsize(0.04), padding: 5, width: '100%' },
	accountformSubmit: { alignItems: 'center', borderRadius: 2, borderStyle: 'solid', borderWidth: 1, padding: 5, width: fsize(0.4) },
	accountformSubmitHeader: { fontFamily: 'appFont', fontSize: fsize(0.04) },

	workerHours: {  },
	workerHour: { alignItems: 'center', marginVertical: 40, padding: 5 },
	workerHourHeader: { fontSize: fsize(0.06), marginHorizontal: 10, textAlign: 'center' },
	workerHourTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5 },
	workerHourTouchHeader: { fontSize: fsize(0.06), textAlign: 'center' },

	// form
	bankaccountform: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	bankaccountformContainer: { backgroundColor: 'white', height: '90%', paddingVertical: 10, width: '90%' },
	bankaccountformHeader: { fontSize: fsize(0.04), fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
	bankaccountformInputField: { marginBottom: 20, marginHorizontal: '10%', width: '80%' },
	bankaccountformInputHeader: { fontSize: fsize(0.04), fontWeight: 'bold' },
	bankaccountformInputInput: { borderRadius: 2, borderStyle: 'solid', borderWidth: 3, fontSize: fsize(0.04), padding: 5, width: '100%' },
	bankaccountformSubmit: { alignItems: 'center', borderRadius: 2, borderStyle: 'solid', borderWidth: 1, padding: 5 },
	bankaccountformSubmitHeader: { fontFamily: 'appFont', fontSize: fsize(0.04) },
})
