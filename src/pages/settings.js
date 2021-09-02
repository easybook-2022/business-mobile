import React, { useState, useEffect } from 'react'
import { AsyncStorage, ActivityIndicator, Dimensions, ScrollView, View, Image, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import { NetworkInfo } from 'react-native-network-info';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import * as Location from 'expo-location';
import { logo_url } from '../../assets/info'
import { 
	addOwner, updateOwner, addBankaccount, updateBankaccount, getAccounts, getBankaccounts, 
	setBankaccountDefault, getBankaccountInfo, deleteTheBankAccount
} from '../apis/owners'
import { getLocationProfile, updateLocation, setLocationHours } from '../apis/locations'
import { userInfo, stripe_key } from '../../assets/info'

// bank account
const { accountNumber, countryCode, currency, routingNumber, accountHolderName } = userInfo

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function settings(props) {
	const required = props.route.params ? props.route.params.required : ""

	const [ownerid, setOwnerid] = useState('')
	const [permission, setPermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
	const [camType, setCamtype] = useState(Camera.Constants.Type.back);
	const [editType, setEdittype] = useState('')

	// location information
	const [storeName, setStorename] = useState(userInfo.storeName)
	const [phonenumber, setPhonenumber] = useState(userInfo.phonenumber)
	const [addressOne, setAddressone] = useState(userInfo.addressOne)
	const [addressTwo, setAddresstwo] = useState(userInfo.addressTwo)
	const [city, setCity] = useState(userInfo.city)
	const [province, setProvince] = useState(userInfo.province)
	const [postalcode, setPostalcode] = useState(userInfo.postalcode)
	const [logo, setLogo] = useState({ uri: '', name: '' })

	// location hours
	const [days, setDays] = useState([
		{ key: "0", header: "Sunday", opentime: { hour: "00", minute: "00", period: "AM" }, closetime: { hour: "00", minute: "00", period: "AM" }},
		{ key: "1", header: "Monday", opentime: { hour: "00", minute: "00", period: "AM" }, closetime: { hour: "00", minute: "00", period: "AM" }},
		{ key: "2", header: "Tuesday", opentime: { hour: "00", minute: "00", period: "AM" }, closetime: { hour: "00", minute: "00", period: "AM" }},
		{ key: "3", header: "Wednesday", opentime: { hour: "00", minute: "00", period: "AM" }, closetime: { hour: "00", minute: "00", period: "AM" }},
		{ key: "4", header: "Thursday", opentime: { hour: "00", minute: "00", period: "AM" }, closetime: { hour: "00", minute: "00", period: "AM" }},
		{ key: "5", header: "Friday", opentime: { hour: "00", minute: "00", period: "AM" }, closetime: { hour: "00", minute: "00", period: "AM" }},
		{ key: "6", header: "Saturday", opentime: { hour: "00", minute: "00", period: "AM" }, closetime: { hour: "00", minute: "00", period: "AM" }}
	])

	// co-owners
	const [accountHolders, setAccountHolders] = useState([])

	// bank accounts
	const [bankAccounts, setBankAccounts] = useState([])
	const [errorMsg, setErrormsg] = useState('')
	const [loaded, setLoaded] = useState(false)
	const [loading, setLoading] = useState(false)
	const [accountForm, setAccountform] = useState({
		show: false,
		type: '',
		cellnumber: '', password: '', confirmPassword: '',

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

	const updateYourLocation = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const ipAddress = await NetworkInfo.getIPAddress()

		if (storeName && phonenumber && addressOne && city && province && postalcode && logo.name) {
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
						if (!res.data.errormsg) {
							return res.data
						} else {
							setErrormsg(res.data.errormsg)
							setLoading(false)
						}
					}
				})
				.then((res) => {
					if (res) {
						const { id } = res

						setEdittype('')
						setLoading(false)
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

			if (!logo.name) {
				setErrormsg("Please take a good photo of your store")

				return
			}
		}
	}

	const updateTime = (index, timetype, dir, open) => {
		const newDays = [...days]
		let value, period

		if (open) {
			value = newDays[index].opentime[timetype]
		} else {
			value = newDays[index].closetime[timetype]
		}

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
					value = 1
				} else if (value < 1) {
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
	const updateYourHours = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const locationid = await AsyncStorage.getItem("locationid")
		const hours = {}

		setLoading(true)

		days.forEach(function (day) {
			hours[day.header.substr(0, 3)] = { opentime: day.opentime, closetime: day.closetime }
		})

		const data = { ownerid, locationid, hours }

		setLocationHours(data)
			.then((res) => {
				if (res.status == 200) {
					if (!res.data.errormsg) {
						return res.data
					} else {
						setLoading(false)
					}
				}
			})
			.then((res) => {
				if (res) {
					setEdittype('')
					setLoading(false)
				}
			})
	}

	const addNewOwner = async() => {
		const { cellnumber, password, confirmPassword } = accountForm
		const data = { ownerid, cellnumber, password, confirmPassword }

		setAccountform({ ...accountForm, loading: true })

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
						show: false,
						type: '',
						cellnumber: '',
						password: '',
						confirmPassword: '',
						loading: false
					})
					getAllAccounts()
				}
			})
	}
	const updateTheOwner = async() => {
		const { cellnumber, password, confirmPassword } = accountForm
		const data = { ownerid, cellnumber, password, confirmPassword }

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
						show: false,
						type: '',
						cellnumber: '',
						password: '',
						confirmPassword: ''
					})
					getAllAccounts()
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
		const data = { locationid }
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

			data['banktoken'] = json.id

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
					accountHolderName: '', accountNumber: '', transitNumber: '', routingNumber: ''
				})
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
	}

	const getTheLocationProfile = async() => {
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { locationid, longitude: null, latitude: null }

		getLocationProfile(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { locationInfo, msg } = res
					const { name, phonenumber, addressOne, addressTwo, city, province, postalcode, logo, hours } = locationInfo

					setStorename(name)
					setPhonenumber(phonenumber)
					setAddressone(addressOne)
					setAddresstwo(addressTwo)
					setCity(city)
					setProvince(province)
					setPostalcode(postalcode)
					setLogo({ uri: logo_url + logo, name: logo })
					setDays(hours)
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
					setAccountHolders(res.accounts)
				}
			})
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
				if (res) {
					setBankAccounts(res.bankaccounts)
					setLoaded(true)
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

			if (camType == Camera.Constants.Type.front) {
				photo_option.push({ flip: ImageManipulator.FlipType.Horizontal })
			}

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
	const openCamera = async() => {
		const { status } = await Camera.getPermissionsAsync()

		if (status == 'granted') {
			setPermission(status === 'granted')
		} else {
			const { status } = await Camera.requestPermissionsAsync()

			setPermission(status === 'granted')
		}
	}

	useEffect(() => {
		getTheLocationProfile()
		getAllAccounts()
		getAllBankaccounts()

		openCamera()

		if (required == "bankaccount") {
			openBankAccountForm()
		}
	}, [])

	return (
		<View style={style.settings}>
			<View style={{ backgroundColor: '#EAEAEA', paddingVertical: offsetPadding }}>
				<TouchableOpacity style={style.back} onPress={() => props.navigation.goBack()}>
					<Text style={style.backHeader}>Back</Text>
				</TouchableOpacity>

				<ScrollView style={{ height: screenHeight - 70, width: '100%' }}>
					<View style={[style.box, { opacity: loading ? 0.6 : 1 }]}>
						<Text style={style.boxHeader}>Setting(s)</Text>
						
						{loaded ? 
							<>
								{editType == 'information' ? 
									<>
										<Text style={style.header}>Edit Location Information</Text>

										<View style={style.inputsBox}>
											<View style={style.inputContainer}>
												<Text style={style.inputHeader}>Store Name:</Text>
												<TextInput style={style.input} onChangeText={(storeName) => setStorename(storeName)} value={storeName} autoCorrect={false}/>
											</View>
											<View style={style.inputContainer}>
												<Text style={style.inputHeader}>Store Phone number:</Text>
												<TextInput style={style.input} onChangeText={(phonenumber) => setPhonenumber(phonenumber)} value={phonenumber} keyboardType="numeric" autoCorrect={false}/>
											</View>
											<View style={style.inputContainer}>
												<Text style={style.inputHeader}>Address #1:</Text>
												<TextInput style={style.input} onChangeText={(addressOne) => setAddressone(addressOne)} value={addressOne} keyboardType="numeric" autoCorrect={false}/>
											</View>
											<View style={style.inputContainer}>
												<Text style={style.inputHeader}>Address #2:</Text>
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
															<AntDesign name="closecircleo" size={30}/>
														</TouchableOpacity>
													</>
												) : (
													<>
														<Camera style={style.camera} type={camType} ref={r => {setCamcomp(r)}}/>

														<TouchableOpacity style={style.cameraAction} onPress={snapPhoto.bind(this)}>
															<Entypo name="camera" size={30}/>
														</TouchableOpacity>
													</>
												)}	
											</View>

											{errorMsg ? <Text style={style.errorMsg}>{errorMsg}</Text> : null }

											{loading && <ActivityIndicator size="large"/>}
										</View>

										<TouchableOpacity style={style.updateButton} disabled={loading} onPress={() => updateYourLocation()}>
											<Text>Save</Text>
										</TouchableOpacity>
									</>
									:
									<TouchableOpacity style={style.editButton} onPress={() => setEdittype('information')}>
										<Text style={style.editButtonHeader}>Edit Your Location Address and Logo</Text>
									</TouchableOpacity>
								}

								{editType == 'hours' ? 
									<>
										<Text style={style.header}>Set your hours</Text>

										<View style={style.days}>
											{days.map((day, index) => (
												<View key={index} style={{ marginVertical: 20 }}>
													<Text style={style.dayHeader}>{day.header}</Text>
													<View style={style.timeSelectionContainer}>
														<View style={style.timeSelection}>
															<View style={style.selection}>
																<TouchableOpacity onPress={() => updateTime(index, "hour", "up", true)}>
																	<AntDesign name="up" size={30}/>
																</TouchableOpacity>
																<Text style={style.selectionHeader}>{day.opentime.hour}</Text>
																<TouchableOpacity onPress={() => updateTime(index, "hour", "down", true)}>
																	<AntDesign name="down" size={30}/>
																</TouchableOpacity>
															</View>
															<Text style={style.selectionDiv}>:</Text>
															<View style={style.selection}>
																<TouchableOpacity onPress={() => updateTime(index, "minute", "up", true)}>
																	<AntDesign name="up" size={30}/>
																</TouchableOpacity>
																<Text style={style.selectionHeader}>{day.opentime.minute}</Text>
																<TouchableOpacity onPress={() => updateTime(index, "minute", "down", true)}>
																	<AntDesign name="down" size={30}/>
																</TouchableOpacity>
															</View>
															<View style={style.selection}>
																<TouchableOpacity onPress={() => updateTime(index, "period", "up", true)}>
																	<AntDesign name="up" size={30}/>
																</TouchableOpacity>
																<Text style={style.selectionHeader}>{day.opentime.period}</Text>
																<TouchableOpacity onPress={() => updateTime(index, "period", "down", true)}>
																	<AntDesign name="down" size={30}/>
																</TouchableOpacity>
															</View>
														</View>
														<View style={style.timeSelection}>
															<View style={style.selection}>
																<TouchableOpacity onPress={() => updateTime(index, "hour", "up", false)}>
																	<AntDesign name="up" size={30}/>
																</TouchableOpacity>
																<Text style={style.selectionHeader}>{day.closetime.hour}</Text>
																<TouchableOpacity onPress={() => updateTime(index, "hour", "down", false)}>
																	<AntDesign name="down" size={30}/>
																</TouchableOpacity>
															</View>
															<Text style={style.selectionDiv}>:</Text>
															<View style={style.selection}>
																<TouchableOpacity onPress={() => updateTime(index, "minute", "up", false)}>
																	<AntDesign name="up" size={30}/>
																</TouchableOpacity>
																<Text style={style.selectionHeader}>{day.closetime.minute}</Text>
																<TouchableOpacity onPress={() => updateTime(index, "minute", "down", false)}>
																	<AntDesign name="down" size={30}/>
																</TouchableOpacity>
															</View>
															<View style={style.selection}>
																<TouchableOpacity onPress={() => updateTime(index, "period", "up", false)}>
																	<AntDesign name="up" size={30}/>
																</TouchableOpacity>
																<Text style={style.selectionHeader}>{day.closetime.period}</Text>
																<TouchableOpacity onPress={() => updateTime(index, "period", "down", false)}>
																	<AntDesign name="down" size={30}/>
																</TouchableOpacity>
															</View>
														</View>
													</View>
												</View>
											))}
										</View>

										<TouchableOpacity style={style.updateButton} disabled={loading} onPress={() => updateYourHours()}>
											<Text>Save</Text>
										</TouchableOpacity>
									</>
									:
									<TouchableOpacity style={style.editButton} onPress={() => setEdittype('hours')}>
										<Text style={style.editButtonHeader}>Edit Your Hour(s)</Text>
									</TouchableOpacity>
								}

								{editType == 'users' ? 
									<View style={style.accountHolders}>
										<Text style={style.accountHoldersHeader}>Login User(s)</Text>

										<TouchableOpacity style={style.accountHoldersAdd} onPress={() => {
											setAccountform({
												...accountForm,
												show: true,
												type: 'add',
												cellnumber: '', password: '', confirmPassword: ''
											})
										}}>
											<Text>Add a Login User</Text>
										</TouchableOpacity>

										{accountHolders.map((info, index) => (
											<View key={info.key} style={style.account}>
												<Text style={style.accountHeader}>#{index + 1}:</Text>

												<View style={style.accountEdit}>
													<Text style={style.accountEditHeader}>{info.cellnumber}</Text>
													{info.id == ownerid && (
														<TouchableOpacity style={style.accountEditTouch} onPress={() => {
															setAccountform({
																...accountForm,
																show: true,
																type: 'edit',
																cellnumber: info.cellnumber,
																password: '',
																confirmPassword: ''
															})
														}}>
															<Text>Change Info</Text>
														</TouchableOpacity>
													)}
												</View>
											</View>
										))}
									</View>
									:
									<TouchableOpacity style={style.editButton} onPress={() => setEdittype('users')}>
										<Text style={style.editButtonHeader}>Edit Co-Owners Information</Text>
									</TouchableOpacity>
								}

								{editType == 'bankaccounts' ? 
									<View style={style.bankaccountHolders}>
										<Text style={style.bankaccountHolderHeader}>Bank Account(s)</Text>

										<TouchableOpacity style={style.bankaccountHolderAdd} onPress={() => openBankAccountForm()}>
											<Text>Add a bank account</Text>
										</TouchableOpacity>

										{bankAccounts.map((info, index) => (
											<View key={info.key} style={style.bankaccount}>
												<View style={style.bankaccountRow}>
													<Text style={style.bankaccountHeader}>#{index + 1}:</Text>
													<View style={style.bankaccountImageHolder}>
														<Image source={require("../../assets/rbc.png")} style={style.bankaccountImage}/>
													</View>
													<View style={style.bankaccountNumberHolder}>
														<Text style={style.bankaccountNumberHeader}>{info.number}</Text>
													</View>
												</View>
												<View style={style.bankaccountActions}>
													<TouchableOpacity style={info.default ? style.bankaccountActionDisabled : style.bankaccountAction} disabled={info.default} onPress={() => useBankAccount(info.bankid)}>
														<Text style={info.default ? style.bankaccountActionHeaderDisabled : style.bankaccountActionHeader}>Set default</Text>
													</TouchableOpacity>
													<TouchableOpacity style={style.bankaccountAction} disabled={info.default} onPress={() => editBankAccount(info.bankid, index)}>
														<Text style={style.bankaccountActionHeader}>Edit</Text>
													</TouchableOpacity>
													<TouchableOpacity style={info.default ? style.bankaccountActionDisabled : style.bankaccountAction} disabled={info.default} onPress={() => deleteBankAccount(info.bankid, index)}>
														<Text style={info.default ? style.bankaccountActionHeaderDisabled : style.bankaccountActionHeader}>Remove</Text>
													</TouchableOpacity>
												</View>
											</View>
										))}
									</View>
									:
									<TouchableOpacity style={style.editButton} onPress={() => setEdittype('bankaccounts')}>
										<Text style={style.editButtonHeader}>Edit Bank account(s) information</Text>
									</TouchableOpacity>
								}
							</>
							:
							<ActivityIndicator marginTop={'50%'} size="small"/>
						}
					</View>
				</ScrollView>

				{accountForm.show && (
					<Modal transparent={true}>
						<View style={{ paddingVertical: offsetPadding }}>
							<View style={style.form}>
								<View style={style.formContainer}>
									<View style={{ alignItems: 'center', marginVertical: 10 }}>
										<TouchableOpacity onPress={() => {
											setAccountform({
												show: false,
												cellnumber: '', password: '', confirmPassword: ''
											})
										}}>
											<AntDesign name="closecircleo" size={30}/>
										</TouchableOpacity>
									</View>

									<Text style={style.formHeader}>{accountForm.type == 'add' ? 'Add' : 'Editing'} login user</Text>

									<View style={style.formInputField}>
										<Text style={style.formInputHeader}>Cell number:</Text>
										<TextInput style={style.formInputInput} onChangeText={(number) => setAccountform({
											...accountForm,
											cellnumber: number
										})} value={accountForm.cellnumber} autoCorrect={false}/>
									</View>

									<View style={style.formInputField}>
										<Text style={style.formInputHeader}>Password:</Text>
										<TextInput style={style.formInputInput} secureTextEntry={true} onChangeText={(password) => setAccountform({
											...accountForm,
											password: password
										})} value={accountForm.password} autoCorrect={false}/>
									</View>

									<View style={style.formInputField}>
										<Text style={style.formInputHeader}>Confirm password:</Text>
										<TextInput style={style.formInputInput} secureTextEntry={true} onChangeText={(password) => setAccountform({
											...accountForm,
											confirmPassword: password
										})} value={accountForm.confirmPassword} autoCorrect={false}/>
									</View>

									{accountForm.errorMsg ? <Text style={style.errorMsg}>{accountForm.errorMsg}</Text> : null}
									{accountForm.loading ? <ActivityIndicator marginBottom={10} size="small"/> : null}

									<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
										<TouchableOpacity style={style.formSubmit} onPress={() => {
											if (accountForm.type == 'add') {
												addNewOwner()
											} else {
												updateTheOwner()
											}
										}}>
											<Text style={style.formSubmitHeader}>{accountForm.type == 'add' ? 'Add' : 'Save'} Account</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</View>
					</Modal>
				)}
				
				{bankAccountForm.show && (
					<Modal transparent={true}>
						<View style={{ paddingVertical: offsetPadding }}>
							<View style={style.form}>
								<View style={style.formContainer}>
									<View style={{ alignItems: 'center', marginVertical: 10 }}>
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
									</View>

									<Text style={style.formHeader}>{bankAccountForm.type == 'add' ? 'Add' : 'Editing'} bank account</Text>

									<View style={style.formInputField}>
										<Text style={style.formInputHeader}>Account Holder</Text>
										<TextInput style={style.formInputInput} onChangeText={(holder) => setBankaccountform({
											...bankAccountForm,
											accountHolderName: holder.toString()
										})} value={bankAccountForm.accountHolderName} autoCorrect={false}/>
									</View>
									<View style={style.formInputField}>
										<Text style={style.formInputHeader}>Account Number</Text>
										<TextInput style={style.formInputInput} onChangeText={(number) => setBankaccountform({
											...bankAccountForm,
											accountNumber: number.toString()
										})} value={bankAccountForm.accountNumber} placeholder={bankAccountForm.placeholder} autoCorrect={false}/>
									</View>
									<View style={style.formInputField}>
										<Text style={style.formInputHeader}>Institution Number</Text>
										<TextInput style={style.formInputInput} onChangeText={(number) => setBankaccountform({
											...bankAccountForm,
											institutionNumber: number.toString()
										})} value={bankAccountForm.institutionNumber} autoCorrect={false}/>
									</View>
									<View style={style.formInputField}>
										<Text style={style.formInputHeader}>Transit Number</Text>
										<TextInput style={style.formInputInput} onChangeText={(number) => setBankaccountform({
											...bankAccountForm,
											transitNumber: number.toString()
										})} value={bankAccountForm.transitNumber} autoCorrect={false}/>
									</View>

									{bankAccountForm.errorMsg ? <Text style={style.errorMsg}>{bankAccountForm.errorMsg}</Text> : null}
									{bankAccountForm.loading ? <ActivityIndicator marginBottom={10} size="small"/> : null}

									<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
										<TouchableOpacity style={style.formSubmit} onPress={() => {
											if (bankAccountForm.type == 'add') {
												addNewBankAccount()
											} else {
												updateTheBankAccount()
											}
										}}>
											<Text style={style.formSubmitHeader}>{bankAccountForm.type == 'add' ? 'Add' : 'Save'} Bank Account</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</View>
					</Modal>
				)}
			</View>
		</View>
	)
}

const style = StyleSheet.create({
	settings: { backgroundColor: 'blue', height: '100%', width: '100%' },
	box: { alignItems: 'center', height: '100%', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, height: 30, margin: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },
	boxHeader: { fontFamily: 'appFont', fontSize: 50, textAlign: 'center' },
	header: { fontFamily: 'appFont', fontSize: 20, marginTop: 20, textAlign: 'center' },

	inputsBox: { paddingHorizontal: 20, width: '100%' },
	inputContainer: { marginVertical: 20 },
	inputHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold' },
	input: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: 20, padding: 5 },
	cameraContainer: { alignItems: 'center', width: '100%' },
	cameraHeader: { fontFamily: 'appFont', fontWeight: 'bold', paddingVertical: 5 },
	camera: { height: width * 0.8, width: width * 0.8 },
	cameraAction: { margin: 10 },
	errorMsg: { color: 'red', fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
	updateButton: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 10 },

	days: {  },
	dayHeader: { fontSize: 20, marginHorizontal: 10, textAlign: 'center' },
	timeSelectionContainer: { flexDirection: 'row' },
	timeSelection: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, flexDirection: 'row', marginHorizontal: 5 },
	selection: { alignItems: 'center', margin: 5 },
	selectionHeader: { fontSize: 20, textAlign: 'center' },
	selectionDiv: { fontSize: 29, marginVertical: 27 },

	accountHolders: { alignItems: 'center', marginHorizontal: 10, marginTop: 20 },
	accountHoldersHeader: { fontFamily: 'appFont', fontSize: 20, textAlign: 'center' },
	accountHoldersAdd: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 3, padding: 5 },
	account: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
	accountHeader: { fontSize: 20, fontWeight: 'bold', padding: 5 },
	accountEdit: { backgroundColor: 'rgba(127, 127, 127, 0.3)', borderRadius: 4, flexDirection: 'row', justifyContent: 'space-between', width: '80%' },
	accountEditHeader: { fontSize: 20, paddingVertical: 8, textAlign: 'center', width: '50%' },
	accountEditTouch: { alignItems: 'center', borderRadius: 2, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5 },

	bankaccountHolders: { alignItems: 'center', marginHorizontal: 10, marginTop: 20 },
	bankaccountHolderHeader: { fontFamily: 'appFont', fontSize: 20, textAlign: 'center' },
	bankaccountHolderAdd: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 3, padding: 5 },
	bankaccount: { marginVertical: 30 },
	bankaccountRow: { flexDirection: 'row', justifyContent: 'space-between' },
	bankaccountHeader: { fontSize: 20, fontWeight: 'bold', padding: 5 },
	bankaccountImageHolder: { height: 40, margin: 2, width: 40 },
	bankaccountImage: { height: 40, width: 40 },
	bankaccountNumberHolder: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', padding: 5, width: '70%' },
	bankaccountNumberHeader: { fontSize: 20, paddingVertical: 4, textAlign: 'center', width: '50%' },
	bankaccountActions: { flexDirection: 'row', justifyContent: 'space-around' },
	bankaccountAction: { borderRadius: 2, borderStyle: 'solid', borderWidth: 2, marginTop: 5, padding: 5, width: 80 },
	bankaccountActionHeader: { fontSize: 10, textAlign: 'center' },
	bankaccountActionDisabled: { backgroundColor: 'black', borderRadius: 2, borderStyle: 'solid', borderWidth: 2, marginTop: 5, padding: 5, width: 80 },
	bankaccountActionHeaderDisabled: { color: 'white', fontSize: 10, textAlign: 'center' },

	editButton: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 20, padding: 5, width: 300 },
	editButtonHeader: { fontSize: 13, fontWeight: 'bold', textAlign: 'center' },

	// form
	form: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	formContainer: { backgroundColor: 'white', flexDirection: 'column', height: '90%', justifyContent: 'space-between', paddingVertical: 10, width: '90%' },
	formHeader: { fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
	formInputField: { marginBottom: 20, marginHorizontal: '10%', width: '80%' },
	formInputHeader: { fontSize: 20, fontWeight: 'bold' },
	formInputInput: { borderRadius: 2, borderStyle: 'solid', borderWidth: 3, padding: 5, width: '100%' },
	formSubmit: { alignItems: 'center', borderRadius: 2, borderStyle: 'solid', borderWidth: 1, padding: 5 },
	formSubmitHeader: {  },
})
