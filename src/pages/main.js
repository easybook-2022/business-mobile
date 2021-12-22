import React, { useEffect, useState, useRef } from 'react'
import { ScrollView, ActivityIndicator, Dimensions, View, FlatList, Image, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet, Modal } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { CommonActions } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import { socket, logo_url, displayTime } from '../../assets/info'
import { updateNotificationToken } from '../apis/owners'
import { fetchNumRequests, fetchNumAppointments, fetchNumCartOrderers, fetchNumReservations, fetchNumorders, getInfo, changeLocationState, setLocationPublic } from '../apis/locations'
import { getMenus, removeMenu, addNewMenu } from '../apis/menus'
import { getRequests, acceptRequest, cancelRequest, cancelReservation, doneDining, receiveEpayment, receiveInpersonpayment, canServeDiners, getAppointments, getCartOrderers, getReservations } from '../apis/schedules'
import { getProducts, getServices, removeProduct } from '../apis/products'

import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)
const storeLogoSize = 70
const imageSize = 50

const fsize = p => {
	return width * p
}

export default function main(props) {
	const firstTime = props.route.params ? props.route.params.firstTime ? true : false : false

	const [notificationPermission, setNotificationpermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
	const [camType, setCamtype] = useState(Camera.Constants.Type.back);
	const [ownerId, setOwnerid] = useState(null)
	const [storeIcon, setStoreicon] = useState('')
	const [storeName, setStorename] = useState('')
	const [storeAddress, setStoreaddress] = useState('')
	const [locationType, setLocationtype] = useState('')
	const [locationListed, setLocationlisted] = useState('')

	const [showEdit, setShowedit] = useState('')

	const [requests, setRequests] = useState([])
	const [numRequests, setNumrequests] = useState(0)

	const [appointments, setAppointments] = useState([])
	const [numAppointments, setNumappointments] = useState(0)

	const [cartOrderers, setCartorderers] = useState([])
	const [numCartorderers, setNumcartorderers] = useState(0)

	const [reservations, setReservations] = useState([])
	const [numReservations, setNumreservations] = useState(0)

	const [viewType, setViewtype] = useState('')
	const [cancelRequestInfo, setCancelrequestinfo] = useState({ show: false, type: "", reason: "", id: 0, index: 0 })
	const [acceptRequestInfo, setAcceptrequestinfo] = useState({ show: false, type: "", index: 0, tablenum: "", errorMsg: "" })
	const [showBankaccountrequired, setShowbankaccountrequired] = useState({ show: false, scheduleid: 0 })
	const [showPaymentrequired, setShowpaymentrequired] = useState(false)
	const [showPublicinforequired, setShowpublicinforequired] = useState({ show: false, index: 0, type: "" })
	const [showPaymentunsent, setShowpaymentunsent] = useState(false)
	const [showMenurequired, setShowmenurequired] = useState(false)
	const [showPaymentconfirm, setShowpaymentconfirm] = useState({ show: false, info: {} })
	const [showUnservedorders, setShowunservedorders] = useState(false)
	const [showWrongworker, setShowwrongworker] = useState(false)
	const [showUnallowedpayment, setShowunallowedpayment] = useState(false)
	const [showDisabledScreen, setShowdisabledscreen] = useState(false)
	const [showFirsttime, setShowfirsttime] = useState({ show: firstTime, step: 0 })
	
	const isMounted = useRef(null)

	const getNotificationPermission = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const { status } = await Notifications.getPermissionsAsync()

		if (status == "granted") {
			setNotificationpermission(true)

			const { data } = await Notifications.getExpoPushTokenAsync({
				experienceId: "@robogram/easygo-business"
			})

			if (ownerid != null) {
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

						}
					})
			}
		} else {
			const info = await Notifications.requestPermissionsAsync()

			if (info.status == "granted") {
				setNotificationpermission(true)

				const { data } = await Notifications.getExpoPushTokenAsync({
					experienceId: "@robogram/easygo-business"
				})

				if (userid != null) {
					updateNotificationToken({ userid, token: data })
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
								
							}
						})
				}
			}
		}
	}
	
	const fetchTheNumRequests = async() => {
		const locationid = await AsyncStorage.getItem("locationid")

		fetchNumRequests(locationid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setNumrequests(res.numRequests)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				}
			})
	}
	const fetchTheNumAppointments = async() => {
		const locationid = await AsyncStorage.getItem("locationid")

		if (locationType == "salon") {
			fetchNumAppointments(locationid)
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
						
					}
				})
		}
	}
	const fetchTheNumReservations = async() => {
		const locationid = await AsyncStorage.getItem("locationid")

		if (locationType == "restaurant") {
			fetchNumReservations(locationid)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) setNumreservations(res.numReservations)
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						
					}
				})
		}
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

				}
			})
	}

	const getTheInfo = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { locationid, menuid: '' }

		getInfo(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res && isMounted.current == true) {
					const { msg, name, address, icon, type, listed } = res

					socket.emit("socket/business/login", ownerid, () => {
						setOwnerid(ownerid)
						setShowedit(msg)
						setStorename(name)
						setStoreaddress(address)
						setStoreicon(icon)
						setLocationtype(type)
						setLocationlisted(listed)

						fetchTheNumRequests()

						if (type == 'restaurant') {
							fetchTheNumCartOrderers()
							getAllReservations()
						} else {
							fetchTheNumAppointments()
							getAllAppointments()
						}
					})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				}
			})
	}
	const changeTheLocationState = async() => {
		const locationid = await AsyncStorage.getItem("locationid")

		changeLocationState(locationid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) setLocationlisted(res.listed)
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					if (err.response.data.status) {
						const { errormsg, status } = err.response.data

						switch (status) {
							case "menusetuprequired":
								setShowmenurequired(true)

								break;
							case "bankaccountrequired":
								setShowpublicinforequired({ show: true, index: 0, "type": "listlocation" })

								break
							default:
						}
					}
				}
			})
	}
	const getAllRequests = async() => {
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { ownerid: ownerId, locationid }

		getRequests(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setRequests(res.requests)
					setNumrequests(res.numrequests)
					setViewtype('requests')
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {

				}
			})
	}
	const getAllAppointments = async() => {
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { ownerid: ownerId, locationid }

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
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {

				}
			})
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
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {

				}
			})
	}
	const getAllReservations = async() => {
		const locationid = await AsyncStorage.getItem("locationid")

		getReservations(locationid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setReservations(res.reservations)
					setNumreservations(res.numreservations)
					setViewtype('reservations')
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				}
			})
	}
	const cancelTheRequest = index => {
		let id, type

		if (index != null) {
			const item = requests[index]

			id = item.id
			type = item.type
		} else {
			const item = requests[cancelRequestInfo.index]

			id = item.id
			type = item.type
		}

		if (!cancelRequestInfo.show) {
			setCancelrequestinfo({ ...cancelRequestInfo, show: true, type, id, index })
		} else {
			const { reason, id, index } = cancelRequestInfo
			let data = { id, reason, type: "cancelRequest" }

			cancelRequest(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						const newRequests = [...requests]

						data = { ...data, receiver: res.receiver }
						socket.emit("socket/cancelRequest", data, () => {
							newRequests.splice(index, 1)

							setRequests(newRequests)
							setNumrequests(numRequests - 1)
							setCancelrequestinfo({ ...cancelRequestInfo, show: false, type: "", reason: "", id: 0, index: 0 })
						})				
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						
					}
				})
		}
	}
	const acceptTheRequest = async(index) => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const { id, tablenum } = index != undefined ? requests[index] : acceptRequestInfo

		if (locationType == "restaurant") {
			if (!acceptRequestInfo.show) {
				setAcceptrequestinfo({ ...acceptRequestInfo, show: true, type: locationType, index, tablenum })
			} else {
				const { index, tablenum } = acceptRequestInfo
				const scheduleid = requests[index].id

				if (tablenum) {
					let data = { scheduleid, tablenum, type: "acceptRequest" }

					acceptRequest(data)
						.then((res) => {
							if (res.status == 200) {
								return res.data
							}
						})
						.then((res) => {
							if (res) {
								const newRequests = [...requests]

								data = { ...data, receivers: res.receivers, worker: null }
								socket.emit("socket/business/acceptRequest", data, () => {
									newRequests[index].status = "accepted"

									setRequests(newRequests)
									setAcceptrequestinfo({ show: false, tablenum })
								})
							}
						})
						.catch((err) => {
							if (err.response && err.response.status == 400) {
								
							}
						})
				} else {
					setAcceptrequestinfo({ ...acceptRequestInfo, errorMsg: "Please enter a table # for the diner(s)" })
				}
			}
		} else {
			let data = { scheduleid: id, ownerid: ownerId, tablenum: tablenum ? tablenum : "", type: "acceptRequest" }

			acceptRequest(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						const newRequests = [...requests]

						data = { ...data, receivers: res.receivers, worker: res.worker }
						socket.emit("socket/business/acceptRequest", data, () => {
							newRequests[index].status = "accepted"
							newRequests[index].worker = res.worker

							setRequests(newRequests)
						})
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						
					}
				})
		}
	}
	const cancelTheReservation = (index, id) => {
		cancelReservation(id)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const newReservations = [...reservations]
					const data = { id, type: "cancelReservation", receiver: res.receiver }

					socket.emit("socket/business/cancelReservation", data, () => {
						newReservations.splice(index, 1)

						setReservations(newReservations)
						fetchTheNumReservations()
					})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data


				}
			})
	}
	const doneTheDining = (index, id) => {
		const newReservations = [...reservations]

		newReservations[index].gettingPayment = true

		setReservations(newReservations)

		doneDining(id)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const newReservations = [...reservations]

					newReservations[index].gettingPayment = false

					setReservations(newReservations)

					props.navigation.navigate("dinersorders", { scheduleid: id, refetch: () => getAllReservations()})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data

					switch (status) {
						case "unserved":
							const newReservations = [...reservations]

							newReservations[index].gettingPayment = false

							setReservations(newReservations)

							setShowunservedorders(true)

							break;
						default:
					}
				}
			})
	}
	const canServeTheDiners = (index, id) => {
		const newReservations = [...reservations]
		let data = { id, type: "canServeDiners" }

		canServeDiners(id)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					newReservations[index].seated = true

					data = { ...data, receiver: res.receiver, time: newReservations[index].time }
					socket.emit("socket/canServeDiners", data, () => setReservations(newReservations))
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				}
			})
	}
	const receiveTheepayment = async(index, id) => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const newAppointments = [...appointments]

		newAppointments[index].gettingPayment = true

		setAppointments(newAppointments)

		let data = { scheduleid: id, ownerid, type: "receivePayment" }

		receiveEpayment(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const newAppointments = [...appointments]
					const { clientName, name, price, receiver } = res

					data = { ...data, receiver }
					socket.emit("socket/receivePayment", data, () => {
						newAppointments.splice(index, 1)

						setAppointments(newAppointments)
						fetchTheNumAppointments()
						setShowbankaccountrequired({ show: false, scheduleid: 0 })
						setShowpaymentconfirm({ show: true, info: { clientName, name, price } })
					})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data
					const newAppointments = [...appointments]

					newAppointments[index].gettingPayment = false

					setAppointments(newAppointments)

					switch (status) {
						case "paymentunsent":
							setShowpaymentunsent(true)

							break;
						case "wrongworker":
							setShowwrongworker(true)

							break;
						case "bankaccountrequired":
							setShowbankaccountrequired({ show: true, scheduleid: id })

							break;
						case "cardrequired":
							setShowpaymentrequired(true)

							break;
						default:
					}
				}
			})
	}
	const receiveTheinpersonpayment = async(index, id) => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const newAppointments = [...appointments]

		newAppointments[index].gettingPayment = true

		setAppointments(newAppointments)

		let data = { scheduleid: id, ownerid, type: "receivePayment" }

		receiveInpersonpayment(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const newAppointments = [...appointments]
					const { clientName, name, price, receiver } = res

					data = { ...data, receiver }
					socket.emit("socket/receivePayment", data, () => {
						newAppointments.splice(index, 1)

						setAppointments(newAppointments)
						fetchTheNumAppointments()
						setShowbankaccountrequired({ show: false, scheduleid: 0 })
						setShowpaymentconfirm({ show: true, info: { clientName, name, price } })
					})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data
					const newAppointments = [...appointments]

					newAppointments[index].gettingPayment = false

					setAppointments(newAppointments)

					switch (status) {
						case "paymentunsent":
							setShowpaymentunsent(true)

							break;
						case "wrongworker":
							setShowwrongworker(true)

							break;
						case "unallowedpayment":
							setShowunallowedpayment(true)

							break
						default:
					}
				}
			})
	}
	const removeFromList = (id, type) => {
		let newItems = []

		switch (type) {
			case "requests":
				newItems = [...requests]

				break
			case "appointments":
				newItems = [...appointments]

				break
			case "cartOrderers":
				newItems = [...cartOrderers]

				break
			case "reservations":
				newItems = [...reservations]

				break
			default:
		}

		newItems = newItems.filter(item => {
			if (item.id != id) {
				return item
			}
		})

		switch (type) {
			case "requests":
				setRequests(newItems)

				break
			case "appointments":
				setAppointments(newItems)

				break
			case "cartOrderers":
				setCartorderers(newItems)
				
				break
			case "reservations":
				setReservations(newItems)

				break
			default:
		}
	}
	const setTheLocationPublic = () => {
		setLocationPublic(ownerId)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setShowpublicinforequired({ show: false, index: 0, type: "" })
					setLocationlisted(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {

				}
			})
	}
	const startWebsocket = () => {
		socket.on("updateRequests", data => {
			if (data.type == "makeReservation") {
				const newReservations = [...reservations]

				setReservations(newReservations.filter(item => {
					if (item.id == data.scheduleid) {
						return item.status = "requested"
					} else {
						return item
					}
				}))

				fetchTheNumReservations()
				fetchTheNumRequests()
			} else if (data.type == "requestAppointment") {
				const newAppointments = [...appointments]

				setAppointments(newAppointments.filter(item => {
					if (item.id != data.id) {
						return item
					}
				}))

				fetchTheNumAppointments()
				fetchTheNumRequests()
			} else if (data.type == "cancelService") {
				const newAppointments = [...appointments]
				const newRequests = [...requests]

				setAppointments(newAppointments.filter(item => {
					if (item.id != data.scheduleid) {
						return item
					}
				}))

				setRequests(newRequests.filter(item => {
					if (item.id != data.scheduleid) {
						return item
					}
				}))

				fetchTheNumAppointments()
				fetchTheNumRequests()
			} else if (data.type == "acceptRequest") {
				const newRequests = [...requests]

				setRequests(newRequests.filter(item => {
					if (item.id == data.scheduleid) {
						return item.status = "accepted", item.worker = data.worker
					}
				}))
			}
		})
		socket.on("updateSchedules", data => {
			if (data.type == "confirmRequest") {
				const newRequests = [...requests]

				fetchTheNumRequests()

				if (locationType == "salon") {
					if (data.worker.id == ownerId) {
						fetchTheNumAppointments()
					}
				} else {
					fetchTheNumReservations()
				}

				setRequests(newRequests.filter(item => {
					if (item.id != data.scheduleid) {
						return item
					}
				}))
			} else if (data.type == "cancelService") {
				const newAppointments = [...appointments]

				setAppointments(newAppointments.filter(item => {
					if (item.id != data.id) {
						return item
					}
				}))
				fetchTheNumAppointments()
				fetchTheNumReservations()
			} else if (data.type == "allowPayment") {
				const newAppointments = [...appointments]

				setAppointments(newAppointments.filter(item => {
					if (item.id == data.scheduleid) {
						return item.allowPayment = true
					} else {
						return item
					}
				}))
				fetchTheNumAppointments()
			}
		})
		socket.on("updateOrders", () => fetchTheNumCartOrderers())
		socket.on("updateCustomerOrders", data => {
			const newReservations = [...reservations]

			setReservations(newReservations.filter(item => {
				if (item.id == data.scheduleid) {
					return item.numMakings += 1
				} else {
					return item
				}
			}))
		})
		socket.io.on("open", () => {
			if (ownerId != null) {
				socket.emit("socket/business/login", ownerId, () => setShowdisabledscreen(false))
			}
		})
		socket.io.on("close", () => ownerId != null ? setShowdisabledscreen(true) : {})
	}

	const initialize = () => {
		getTheInfo()

		if (Constants.isDevice) getNotificationPermission()
		props.navigation.setParams({ firstTime: false })
	}

	useEffect(() => {
		initialize()
	}, [])

	useEffect(() => {
		isMounted.current = true

		startWebsocket()

		if (Constants.isDevice) {
			Notifications.addNotificationResponseReceivedListener(res => {
				const { data } = res.notification.request.content

				if (data.type == "requestAppointment") {
					const newAppointments = [...appointments]

					setAppointments(newAppointments.filter(item => {
						if (item.id != data.scheduleid) {
							return item
						}
					}))

					fetchTheNumAppointments()
					fetchTheNumRequests()
				} else if (data.type == "sendServicePayment") {
					const newAppointments = [...appointments]

					setAppointments(newAppointments.filter(item => {
						if (item.id == data.scheduleid) {
							return item.allowPayment = true
						} else {
							return item
						}
					}))
					fetchTheNumAppointments()
				} else if (data.type == "checkout") {
					fetchTheNumCartOrderers()
				}
			});
		}

		return () => {
			socket.off("updateRequests")
			socket.off("updateSchedules")
			socket.off("updateOrders")
			socket.off("updateCustomerOrders")

			isMounted.current = false
		}
	}, [
		requests.length, appointments.length, 
		cartOrderers.length, reservations.length
	])
	
	return (
		<View style={style.main}>
			<View style={{ paddingVertical: offsetPadding }}>
				<View style={style.box}>
					<View style={style.headers}>
						<View style={style.storeIconHolder}>
							<Image source={{ uri: logo_url + storeIcon }} style={style.image}/>
						</View>
						<Text style={style.locationInfoHeader}>{storeName}</Text>
						<Text style={style.locationInfoHeader}>{storeAddress}</Text>
					</View>

					<View style={style.body}>
						<View style={style.navs}>
							<View style={{ flexDirection: 'row' }}>
								{locationType != '' && (
									<TouchableOpacity style={viewType == "requests" ? style.navSelected : style.nav} onPress={() => getAllRequests()}>
										<Text style={[viewType == "requests" ? style.navHeaderSelected : style.navHeader, { fontSize: fsize(0.07) }]}>{numRequests}</Text>
										<Text style={viewType == "requests" ? style.navHeaderSelected : style.navHeader}>Request(s)</Text>
									</TouchableOpacity>
								)}

								{locationType == 'salon' && (
									<TouchableOpacity style={viewType == "appointments" ? style.navSelected : style.nav} onPress={() => getAllAppointments()}>
										<Text style={[viewType == "appointments" ? style.navHeaderSelected : style.navHeader, { fontSize: fsize(0.07) }]}>{numAppointments}</Text>
										<Text style={viewType == "appointments" ? style.navHeaderSelected : style.navHeader}>Appointment(s)</Text>
									</TouchableOpacity>
								)}

								{locationType == 'restaurant' && (
									<TouchableOpacity style={viewType == "cartorderers" ? style.navSelected : style.nav} onPress={() => getAllCartOrderers()}>
										<Text style={[viewType == "cartorderers" ? style.navHeaderSelected : style.navHeader, { fontSize: fsize(0.07) }]}>{numCartorderers}</Text>
										<Text style={viewType == "cartorderers" ? style.navHeaderSelected : style.navHeader}>Orderer(s)</Text>
									</TouchableOpacity>
								)}

								{locationType == 'restaurant' && (
									<TouchableOpacity style={viewType == "reservations" ? style.navSelected : style.nav} onPress={() => getAllReservations()}>
										<Text style={[viewType == "reservations" ? style.navHeaderSelected : style.navHeader, { fontSize: fsize(0.07) }]}>{numReservations}</Text>
										<Text style={viewType == "reservations" ? style.navHeaderSelected : style.navHeader}>Reservation(s)</Text>
									</TouchableOpacity>
								)}
							</View>
						</View>

						{viewType == "requests" && (
							requests.length > 0 ? 
								<FlatList
									data={requests}
									renderItem={({ item, index }) => 
										<View key={item.key} style={style.request}>
											<View style={{ flexDirection: 'row' }}>
												<View style={style.requestImageHolder}>
													<Image style={style.requestImage} source={{ uri: logo_url + item.image }}/>
												</View>
												<View style={style.requestInfo}>
													<Text>
														{locationType == 'salon' ? 
															(item.status == "requested" || item.status == "change") ? 
																<>
																	<Text style={style.requestInfoHeader}>{item.username + ' requested ' + (item.status == 'change' ? ' a time change for ' : '') + item.name + '\n'}</Text> 
																	<Text style={style.requestInfoHeader}>{displayTime(item.time)}</Text>
																	{item.worker != null && <Text style={style.requestInfoHeader}>{'\nwith worker: '}<Text style={{ fontSize: fsize(0.07) }}>{item.worker.username}</Text></Text>}
																</>
																:
																<>
																	<Text style={style.requestInfoHeader}>{item.username + ' has an appointment for ' + item.name +'\n'}</Text>
																	<Text style={style.requestInfoHeader}>{displayTime(item.time)}</Text>
																	{item.worker != null && <Text style={style.requestInfoHeader}>{'\nwith worker: '}<Text style={{ fontSize: fsize(0.07) }}>{item.worker.username}</Text>{'\n'}</Text>}
																	<Text style={{ color: 'grey', fontStyle: 'italic' }}>waiting for confirmation</Text>
																</>
															:
															<>
																<Text><Text style={style.requestInfoHeader}>{item.username}</Text> is {item.status == 'change' ? 're-' : ''}booking a reservation</Text>
																<Text style={style.requestInfoHeader}>{'\n' + displayTime(item.time)}</Text>
																<Text style={style.requestInfoHeader}>{item.diners > 0 ? ' for ' + item.diners + ' ' + (item.diners == 1 ? 'person' : 'people') : ' for 1 person'}</Text>

																{(item.status == "rebook" || item.status == "accepted") && <Text style={{ color: 'grey', fontStyle: 'italic' }}>{'\n\n'}waiting for confirmation</Text>}
															</>
														}
													</Text>
													{item.note ? <Text style={{ fontWeight: 'bold', marginTop: 20 }}>Customer's note: {item.note}</Text> : null}
												</View>
											</View>

											{(item.status == "requested" || item.status == "change") ? 
												<View style={style.requestActions}>
													<View style={{ flexDirection: 'row' }}>
														<TouchableOpacity style={style.requestAction} onPress={() => {
															if (locationType == 'salon') {
																props.navigation.navigate("booktime", { appointmentid: item.id, refetch: () => {
																	fetchTheNumRequests()
																	removeFromList(item.id, "requests")
																}})
															} else {
																props.navigation.navigate("makereservation", { userid: item.userId, scheduleid: item.id, refetch: () => {
																	fetchTheNumRequests()
																	removeFromList(item.id, "requests")
																}})
															}
														}}>
															<Text style={style.requestActionHeader}>Another time</Text>
														</TouchableOpacity>
														<TouchableOpacity style={style.requestAction} onPress={() => cancelTheRequest(index)}>
															<Text style={style.requestActionHeader}>Cancel</Text>
														</TouchableOpacity>
														<TouchableOpacity style={style.requestAction} onPress={() => acceptTheRequest(index)}>
															<Text style={style.requestActionHeader}>Accept</Text>
														</TouchableOpacity>
													</View>
												</View>
												:
												null
											}
										</View>
									}
								/>
								:
								<View style={style.bodyResult}>
									{numRequests == 0 ? 
										<Text style={style.bodyResultHeader}>No request(s) yet</Text>
										:
										<Text style={style.bodyResultHeader}>{numRequests} request(s)</Text>
									}
								</View>
						)}

						{viewType == "appointments" && (
							appointments.length > 0 ? 
								<FlatList
									data={appointments}
									renderItem={({ item, index }) => 
										<View key={item.key} style={style.schedule}>
											<View style={style.scheduleImageHolder}>
												<Image style={style.scheduleImage} source={{ uri: logo_url + item.image }}/>
											</View>
											<Text style={style.scheduleHeader}>
												<Text style={{ fontFamily: 'Arial', fontWeight: 'bold' }}>You</Text> have 
												{' '}an appointment for{'\n'}
												<Text style={{ fontFamily: 'Arial', fontWeight: 'bold' }}> {item.name}</Text>
												{'\n'}
												<Text style={{ fontFamily: 'Arial', fontWeight: 'bold' }}>{displayTime(item.time)}</Text>
												{'\n\n'}
												<Text style={{ fontFamily: 'Arial', fontWeight: 'bold' }}>with client: {item.client.username}</Text>
											</Text>

											<View style={{ marginBottom: 10 }}>
												<Text style={style.scheduleActionsHeader}>Service is done ?</Text>
												<View style={style.scheduleActions}>
													<TouchableOpacity style={item.gettingPayment ? style.scheduleActionDisabled : style.scheduleAction} disabled={item.gettingPayment} onPress={() => receiveTheepayment(index, item.id)}>
														<Text style={style.scheduleActionHeader}>{item.allowPayment == true ? 'Receive\ne-payment' : 'e-payment\nPayment awaits'}</Text>
													</TouchableOpacity>
													<TouchableOpacity style={item.gettingPayment ? style.scheduleActionDisabled : style.scheduleAction} disabled={item.gettingPayment} onPress={() => receiveTheinpersonpayment(index, item.id)}>
														<Text style={style.scheduleActionHeader}>{item.allowPayment == true ? 'Receive\nin-person-pay' : 'in-person-pay\nPayment awaits'}</Text>
													</TouchableOpacity>
												</View>
												{item.gettingPayment && <ActivityIndicator marginBottom={-5} marginTop={-15} size="small"/>}
											</View>
										</View>
									}
								/>
								:
								<View style={style.bodyResult}>
									{numAppointments == 0 ? 
										<Text style={style.bodyResultHeader}>No appointment(s) yet</Text>
										:
										<Text style={style.bodyResultHeader}>{numAppointments} appointment(s)</Text>
									}
								</View>
						)}

						{viewType == "cartorderers" && (
							cartOrderers.length > 0 ? 
								<FlatList
									data={cartOrderers}
									renderItem={({ item, index }) => 
										<View key={item.key} style={style.cartorderer}>
											<View style={style.cartordererImageHolder}>
												<Image style={style.cartordererImage} source={{ uri: logo_url + item.profile }}/>
											</View>
											<View style={style.cartordererInfo}>
												<Text style={style.cartordererUsername}>Customer: {item.username}</Text>
												<Text style={style.cartordererOrderNumber}>Order #{item.orderNumber}</Text>
												<TouchableOpacity style={style.cartordererSeeOrders} onPress={() => {
													props.navigation.navigate("cartorders", { userid: item.adder, ordernumber: item.orderNumber, refetch: () => {
														getAllCartOrderers()
														removeFromList(item.id, "cartOrderers")
													}})
												}}>
													<Text style={style.cartordererSeeOrdersHeader}>See Order(s) ({item.numOrders})</Text>
												</TouchableOpacity>
											</View>
										</View>
									}
								/>
								:
								<View style={style.bodyResult}>
									{numCartorderers == 0 ? 
										<Text style={style.bodyResultHeader}>No order(s) yet</Text>
										:
										<Text style={style.bodyResultHeader}>{numCartorderers} order(s)</Text>
									}
								</View>
						)}

						{viewType == "reservations" && (
							reservations.length > 0 ?
								<FlatList
									data={reservations}
									renderItem={({ item, index }) => 
										<View key={item.key} style={style.schedule}>
											<View style={style.scheduleRow}>
												<View style={style.scheduleImageHolder}>
													<Image style={style.scheduleImage} source={{ uri: logo_url + item.image }}/>
												</View>
												<Text style={style.scheduleHeader}>
													<Text style={{ fontFamily: 'Arial', fontWeight: 'bold' }}>{item.username}{'\n'}</Text> 
													made a reservation for {'\n'}
													<Text style={{ fontFamily: 'Arial', fontWeight: 'bold' }}>
														{item.diners > 0 ? 
															item.diners + " " + (item.diners > 1 ? 'people' : 'person') 
															: 
															" 1 person"
														}
													</Text>
													{'\n'}
													<Text style={{ fontFamily: 'Arial', fontWeight: 'bold' }}>{displayTime(item.time)}</Text>
													{'\n'}for table: <Text style={{ fontFamily: 'Arial', fontWeight: 'bold' }}>#{item.table}</Text>
												</Text>
											</View>

											{item.seated ? 
												<View style={{ alignItems: 'center', marginVertical: 10 }}>
													<View style={{ flexDirection: 'row', marginBottom: 10 }}>
														<TouchableOpacity style={style.scheduleAction} onPress={() => props.navigation.navigate("diningorders", { scheduleid: item.id, refetch: () => {
															fetchTheNumReservations()
															removeFromList(item.id, "reservations")
														}})}>
															<Text style={style.scheduleActionHeader}>Customers' Orders</Text>
														</TouchableOpacity>
														<Text style={style.scheduleNumOrders}>{item.numMakings > 0 && '(' + item.numMakings + ')'}</Text>
													</View>
													<View style={{ alignItems: 'center' }}>
														<Text style={{ padding: 8 }}>Diners are done ?</Text>
														<View style={{ flexDirection: 'row' }}>
															<TouchableOpacity style={item.gettingPayment ? style.scheduleActionDisabled : style.scheduleAction} disabled={item.gettingPayment} onPress={() => cancelTheReservation(index, item.id)}>
																<Text style={style.scheduleActionHeader}>Cancel Reservation</Text>
															</TouchableOpacity>
															<TouchableOpacity style={item.gettingPayment ? style.scheduleActionDisabled : style.scheduleAction} disabled={item.gettingPayment} onPress={() => doneTheDining(index, item.id)}>
																<Text style={style.scheduleActionHeader}>Receive payment</Text>
																{item.gettingPayment && <ActivityIndicator marginBottom={-5} marginTop={-15} size="small"/>}
															</TouchableOpacity>
														</View>
													</View>
												</View>
												:
												<View style={{ alignItems: 'center', marginVertical: 10 }}>
													<Text style={style.scheduleHeader}>Diner(s) are seated at their table and ready to be serve</Text>
													<View style={{ flexDirection: 'row' }}>
														<TouchableOpacity style={style.scheduleAction} disabled={item.gettingPayment} onPress={() => cancelTheReservation(index, item.id)}>
															<Text style={style.scheduleActionHeader}>Cancel Reservation</Text>
														</TouchableOpacity>
														<TouchableOpacity style={style.scheduleAction} onPress={() => canServeTheDiners(index, item.id)}>
															<Text style={style.scheduleActionHeader}>Yes</Text>
														</TouchableOpacity>
													</View>
												</View>
											}
										</View>
									}
								/>
								:
								<View style={style.bodyResult}>
									{numReservations == 0 ? 
										<Text style={style.bodyResultHeader}>No reservation(s) yet</Text>
										:
										<Text style={style.bodyResultHeader}>{numReservations} reservation(s)</Text>
									}
								</View>
						)}
					</View>

					<View style={style.bottomNavs}>
						<View style={style.bottomNavsRow}>
							<TouchableOpacity style={style.bottomNav} onPress={() => props.navigation.navigate("settings", { refetch: () => getTheInfo()})}>
								<AntDesign name="setting" size={30}/>
							</TouchableOpacity>

							<TouchableOpacity style={style.bottomNavButton} onPress={() => props.navigation.navigate("menu", { menuid: '', name: '', refetch: () => getTheInfo()})}>
								<Text style={style.bottomNavButtonHeader}>Edit Menu</Text>
							</TouchableOpacity>

							<TouchableOpacity style={style.bottomNavButton} onPress={() => changeTheLocationState()}>
								<Text style={style.bottomNavButtonHeader}>{locationListed ? "Unlist" : "List"} Public</Text>
							</TouchableOpacity>

							<TouchableOpacity style={style.bottomNav} onPress={async() => {
								const ownerid = await AsyncStorage.getItem("ownerid")

								socket.emit("socket/business/logout", ownerid, () => {
									AsyncStorage.clear()

									props.navigation.dispatch(
										CommonActions.reset({
											index: 1,
											routes: [{ name: 'auth' }]
										})
									);
								})
							}}>
								<Text style={style.bottomNavHeader}>Log-Out</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>

				{cancelRequestInfo.show && (
					<Modal transparent={true}>
						<TouchableWithoutFeedback style={{ paddingVertical: offsetPadding }} onPress={() => Keyboard.dismiss()}>
							<View style={style.cancelRequestBox}>
								<Text style={style.cancelRequestHeader}>Tell the {cancelRequestInfo.type == "restaurant" ? "diners" : "customer"} the reason for this cancellation ? (optional)</Text>

								<TextInput placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Write your reason" multiline={true} style={style.cancelRequestInput} onChangeText={(reason) => {
									setCancelrequestinfo({
										...cancelRequestInfo,
										reason: reason
									})
								}} autoCorrect={false} autoCapitalize="none"/>

								<View style={{ alignItems: 'center' }}>
									<View style={style.cancelRequestActions}>
										<TouchableOpacity style={style.cancelRequestTouch} onPress={() => setCancelrequestinfo({ ...cancelRequestInfo, show: false, type: "", id: 0, index: 0, reason: "" })}>
											<Text style={style.cancelRequestTouchHeader}>Close</Text>
										</TouchableOpacity>
										<TouchableOpacity style={style.cancelRequestTouch} onPress={() => cancelTheRequest()}>
											<Text style={style.cancelRequestTouchHeader}>Done</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</TouchableWithoutFeedback>
					</Modal>
				)}

				{acceptRequestInfo.show && (
					<Modal transparent={true}>
						<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
							<View style={style.acceptRequestContainer} onPress={() => Keyboard.dismiss()}>
								<View style={style.acceptRequestBox}>
									<Text style={style.acceptRequestHeader}>Tell the diner the table #?</Text>

									<TextInput placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder='What table will be available' style={style.acceptRequestInput} onChangeText={(tablenum) => {
										setAcceptrequestinfo({
											...acceptRequestInfo,
											tablenum
										})
									}} value={acceptRequestInfo.tablenum} autoCorrect={false} autoComplete="none"/>

									{acceptRequestInfo.errorMsg ? <Text style={style.errorMsg}>{acceptRequestInfo.errorMsg}</Text> : null}

									<View style={{ alignItems: 'center' }}>
										<View style={style.acceptRequestActions}>
											<TouchableOpacity style={style.acceptRequestTouch} onPress={() => {
												getAllRequests()
												setAcceptrequestinfo({ ...acceptRequestInfo, show: false, tablenum: "" })
											}}>
												<Text style={style.acceptRequestTouchHeader}>Close</Text>
											</TouchableOpacity>
											<TouchableOpacity style={style.acceptRequestTouch} onPress={() => acceptTheRequest()}>
												<Text style={style.acceptRequestTouchHeader}>Done</Text>
											</TouchableOpacity>
										</View>
									</View>
								</View>
							</View>
						</TouchableWithoutFeedback>
					</Modal>
				)}
				
				{showPublicinforequired.show && (
					<Modal transparent={true}>
						<View style={style.requiredBoxContainer}>
							<View style={style.requiredBox}>
								<View style={style.requiredContainer}>
									<Text style={style.requiredHeader}>
										We recommend you provide a bank account before
										setting your place public for {locationType == "restaurant" ? "customers" : "clients"}
									</Text>

									{locationType == "restaurant" ? 
										<View style={{ alignItems: 'center' }}>
											<TouchableOpacity style={style.requiredAction} onPress={() => setShowpublicinforequired({ show: false, index: 0, type: "" })}>
												<Text style={style.requiredActionHeader}>Close</Text>
											</TouchableOpacity>
											<TouchableOpacity style={style.requiredAction} onPress={() => setTheLocationPublic()}>
												<Text style={style.requiredActionHeader}>Set public anyway</Text>
											</TouchableOpacity>
											<TouchableOpacity style={style.requiredAction} onPress={() => {
												setShowpublicinforequired({ show: false, index: 0, type: "" })
												props.navigation.navigate("settings", { required: "bankaccount" })
											}}>
												<Text style={style.requiredActionHeader}>Add account</Text>
											</TouchableOpacity>
										</View>
										:
										<View style={{ alignItems: 'center' }}>
											<TouchableOpacity style={style.requiredAction} onPress={() => setShowpublicinforequired({ show: false, index: 0, type: "" })}>
												<Text style={style.requiredActionHeader}>Close</Text>
											</TouchableOpacity>
											<TouchableOpacity style={style.requiredAction} onPress={() => setTheLocationPublic()}>
												<Text style={style.requiredActionHeader}>Set public anyway</Text>
											</TouchableOpacity>
											<TouchableOpacity style={style.requiredAction} onPress={() => {
												setShowpublicinforequired({ show: false, index: 0, type: "" })
												props.navigation.navigate("settings", { required: "bankaccount" })
											}}>
												<Text style={style.requiredActionHeader}>Add account</Text>
											</TouchableOpacity>
										</View>
									}
								</View>
							</View>
						</View>
					</Modal>
				)}

				{showBankaccountrequired.show && (
					<Modal transparent={true}>
						<View style={style.requiredBoxContainer}>
							<View style={style.requiredBox}>
								<View style={style.requiredContainer}>
									<Text style={style.requiredHeader}>
										You need to provide a bank account to
										receive payment from the client
									</Text>

									<View style={{ alignItems: 'center' }}>
										<TouchableOpacity style={style.requiredAction} onPress={() => setShowbankaccountrequired({ show: false, scheduleid: 0 })}>
											<Text style={style.requiredActionHeader}>Close</Text>
										</TouchableOpacity>
										<TouchableOpacity style={style.requiredAction} onPress={() => {
											setShowbankaccountrequired({ show: false, scheduleid: 0 })
											props.navigation.navigate("settings", { required: "bankaccount" })
										}}>
											<Text style={style.requiredActionHeader}>Add account</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</View>
					</Modal>
				)}

				{showPaymentrequired && (
					<Modal transparent={true}>
						<View style={style.requiredBoxContainer}>
							<View style={style.requiredBox}>
								<View style={style.requiredContainer}>
									<Text style={style.requiredHeader}>
										The client hasn't provide any payment method
									</Text>

									<View style={style.requiredActions}>
										<TouchableOpacity style={style.requiredAction} onPress={() => setShowpaymentrequired(false)}>
											<Text style={style.requiredActionHeader}>Close</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</View>
					</Modal>
				)}

				{showPaymentunsent && (
					<Modal transparent={true}>
						<View style={style.requiredBoxContainer}>
							<View style={style.requiredBox}>
								<View style={style.requiredContainer}>
									<Text style={style.requiredHeader}>
										The customer hasn't sent their payment yet.
										{'\n\n'}
										When your service with the customer is done, 
										tell him/her to send their payment in their 
										notification
									</Text>

									<View style={style.requiredActions}>
										<TouchableOpacity style={style.requiredAction} onPress={() => setShowpaymentunsent(false)}>
											<Text style={style.requiredActionHeader}>Ok</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</View>
					</Modal>
				)}

				{showMenurequired && (
					<Modal transparent={true}>
						<View style={style.requiredBoxContainer}>
							<View style={style.requiredBox}>
								<View style={style.requiredContainer}>
									<Text style={style.requiredHeader}>
										You need to add some 
										{locationType == "restaurant" ? 
											" food "
											:
											" products / services "
										}
										to your menu to list your location publicly
									</Text>

									<View style={style.requiredActions}>
										<TouchableOpacity style={style.requiredAction} onPress={() => setShowmenurequired(false)}>
											<Text style={style.requiredActionHeader}>Close</Text>
										</TouchableOpacity>
										<TouchableOpacity style={style.requiredAction} onPress={() => {
											setShowmenurequired(false)
											props.navigation.navigate("menu", { menuid: '', name: '', refetch: () => getTheInfo()})
										}}>
											<Text style={style.requiredActionHeader}>Ok</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</View>
					</Modal>
				)}

				{showPaymentconfirm.show && (
					<Modal transparent={true}>
						<View style={style.alertBoxContainer}>
							<View style={style.alertBox}>
								<View style={style.alertContainer}>
									<Text style={style.alertHeader}>
										<Text>Congrats on your service of</Text>
										{'\n'}
										<Text style={{ fontFamily: 'Arial', fontWeight: 'bold' }}>{showPaymentconfirm.info.name}</Text>
										{'\n'}
										<Text>for {showPaymentconfirm.info.clientName}</Text>
										{'\n\n'}
										<Text>You earned ${showPaymentconfirm.info.price}</Text>
										{'\n\n'}
										<Text>Good job! :)</Text>
									</Text>

									<View style={style.alertActions}>
										<TouchableOpacity style={style.alertAction} onPress={() => setShowpaymentconfirm({ show: false, info: {} })}>
											<Text style={style.alertActionHeader}>Ok</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</View>
					</Modal>
				)}

				{showUnservedorders && (
					<Modal transparent={true}>
						<View style={style.alertBoxContainer}>
							<View style={style.alertBox}>
								<View style={style.alertContainer}>
									<Text style={style.alertHeader}>
										There is one or more unserved orders from the customers.
										{'\n'}
										Please finish the serve
									</Text>

									<View style={style.alertActions}>
										<TouchableOpacity style={style.alertAction} onPress={() => setShowunservedorders(false)}>
											<Text style={style.alertActionHeader}>Ok</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</View>
					</Modal>
				)}

				{showWrongworker && (
					<Modal transparent={true}>
						<View style={style.alertBoxContainer}>
							<View style={style.alertBox}>
								<View style={style.alertContainer}>
									<Text style={style.alertHeader}>Only the worker of this client can receive the payment</Text>

									<View style={style.alertActions}>
										<TouchableOpacity style={style.alertAction} onPress={() => setShowwrongworker(false)}>
											<Text style={style.alertActionHeader}>Ok</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</View>
					</Modal>
				)}

				{showUnallowedpayment && (
					<Modal transparent={true}>
						<View style={style.alertBoxContainer}>
							<View style={style.alertBox}>
								<View style={style.alertContainer}>
									<Text style={style.alertHeader}>The client hasn't allowed payment yet</Text>

									<View style={style.alertActions}>
										<TouchableOpacity style={style.alertAction} onPress={() => setShowunallowedpayment(false)}>
											<Text style={style.alertActionHeader}>Ok</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</View>
					</Modal>
				)}

				{showFirsttime.show && (
					<Modal transparent={true}>
						<View style={style.firstTimeBoxContainer}>
							<View style={style.firstTimeBox}>
								<View style={style.firstTimeContainer}>
									{showFirsttime.step == 0 ? 
										<Text style={style.firstTimeHeader}>
											Welcome!!{'\n\n'}

											This is the main page. You will see all appointment requests/scheduled here
										</Text>
									: null }

									{showFirsttime.step == 1 ? 
										<Text style={style.firstTimeHeader}>
											But before you can start setting your location public and accepting customers' requests,
										</Text>
									: null }

									{showFirsttime.step == 2 ? 
										<Text style={style.firstTimeHeader}>
											you need to setup your menu(s) and service(s)
										</Text>
									: null }

									<View style={style.firstTimeActions}>
										<TouchableOpacity style={style.firstTimeAction} onPress={() => {
											if (showFirsttime.step == 2) {
												setShowfirsttime({ show: false, step: 0 })
												props.navigation.navigate("menu", { menuid: '', name: '', refetch: () => getTheInfo()})
											} else {
												setShowfirsttime({ ...showFirsttime, step: showFirsttime.step + 1 })
											}
										}}>
											<Text style={style.firstTimeActionHeader}>{showFirsttime.step < 2 ? 'Next' : "Let's start"}</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</View>
					</Modal>
				)}
			</View>

			{showDisabledScreen && (
				<Modal transparent={true}>
					<View style={style.disabled}>
						<View style={style.disabledContainer}>
							<Text style={style.disabledHeader}>
								There is an update to the app{'\n\n'}
								Please wait a moment{'\n\n'}
								or tap 'Close'
							</Text>

							<TouchableOpacity style={style.disabledClose} onPress={() => socket.emit("socket/business/login", ownerId, () => setShowdisabledscreen(false))}>
								<Text style={style.disabledCloseHeader}>Close</Text>
							</TouchableOpacity>

							<ActivityIndicator size="large"/>
						</View>
					</View>
				</Modal>
			)}
		</View>
	)
}

const style = StyleSheet.create({
	main: { backgroundColor: 'white' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

	headers: { alignItems: 'center', flexDirection: 'column', height: fsize(0.25), justifyContent: 'space-between', paddingVertical: 5 },
	storeIconHolder: { borderRadius: storeLogoSize / 2, height: storeLogoSize, overflow: 'hidden', width: storeLogoSize },
	image: { height: storeLogoSize, width: storeLogoSize },
	locationInfoHeader: { fontSize: fsize(0.04), fontWeight: 'bold', paddingHorizontal: 10, textAlign: 'center' },

	navs: { alignItems: 'center' },
	nav: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 2, marginVertical: 3, padding: 2, width: fsize(0.3) },
	navHeader: { color: 'black', fontSize: fsize(0.035) },
	navSelected: { alignItems: 'center', backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 2, marginVertical: 3, padding: 2, width: fsize(0.3) },
	navHeaderSelected: { color: 'white', fontSize: fsize(0.035) },

	// body
	body: { height: screenHeight - 190 },

	// client appointment requests
	request: { borderRadius: 5, backgroundColor: 'white', marginHorizontal: 5, marginVertical: 2.5 },
	requestRow: { flexDirection: 'row', justifyContent: 'space-between' },
	requestImageHolder: { borderRadius: imageSize / 2, height: imageSize, margin: 5, overflow: 'hidden', width: imageSize },
	requestImage: { height: imageSize, width: imageSize },
	requestInfo: { fontFamily: 'appFont', fontSize: fsize(0.05), padding: 10, width: width - 100 },
	requestInfoHeader: { fontSize: fsize(0.05), fontWeight: 'bold' },
	requestActions: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
	requestAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: 80 },
	requestActionHeader: { fontSize: fsize(0.025), textAlign: 'center' },

	// client's schedule
	schedule: { alignItems: 'center', borderRadius: 5, backgroundColor: 'white', marginHorizontal: 5, marginVertical: 2.5 },
	scheduleRow: { flexDirection: 'row', justifyContent: 'space-between' },
	scheduleImageHolder: { borderRadius: imageSize / 2, height: imageSize, margin: 5, overflow: 'hidden', width: imageSize },
	scheduleImage: { height: imageSize, width: imageSize },
	scheduleHeader: { fontFamily: 'appFont', fontSize: fsize(0.04), padding: 10, textAlign: 'center', width: width - 100 },
	scheduleActionsHeader: { fontSize: fsize(0.05), marginTop: 10, textAlign: 'center' },
	scheduleActions: { flexDirection: 'row' },
	scheduleAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: 130 },
	scheduleActionDisabled: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, opacity: 0.5, padding: 5, width: 130 },
	scheduleActionHeader: { fontSize: fsize(0.03), textAlign: 'center' },
	scheduleNumOrders: { fontWeight: 'bold', padding: 8 },

	cartorderer: { backgroundColor: 'white', borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', margin: 10, padding: 5 },
	cartordererImageHolder: { borderRadius: imageSize / 2, height: imageSize, overflow: 'hidden', width: imageSize },
	cartordererImage: { height: imageSize, width: imageSize },
	cartordererInfo: { alignItems: 'center', width: width - 81 },
	cartordererUsername: { fontWeight: 'bold', marginBottom: 10 },
	cartordererOrderNumber: { fontSize: fsize(0.06), paddingVertical: 5 },
	cartordererSeeOrders: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
	cartordererSeeOrdersHeader: { fontSize: fsize(0.06), textAlign: 'center' },

	bodyResult: { alignItems: 'center', flexDirection: 'column', height: screenHeight - 220, justifyContent: 'space-around' },
	bodyResultHeader: { fontSize: fsize(0.05), fontWeight: 'bold' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', height: 40, justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', height: 30, marginVertical: 5 },
	bottomNavHeader: { color: 'black', fontSize: fsize(0.04), fontWeight: 'bold', paddingVertical: 5 },
	bottomNavButton: { backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, paddingVertical: 8, width: fsize(0.25) },
	bottomNavButtonHeader: { color: 'white', fontSize: fsize(0.035), fontWeight: 'bold', textAlign: 'center' },

	cancelRequestBox: { backgroundColor: 'white', height: '100%', width: '100%' },
	cancelRequestHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), marginHorizontal: 30, marginTop: 50, textAlign: 'center' },
	cancelRequestInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: fsize(0.05), height: 200, margin: '5%', padding: 10, width: '90%' },
	cancelRequestActions: { flexDirection: 'row', justifyContent: 'space-around' },
	cancelRequestTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: 100 },
	cancelRequestTouchHeader: { textAlign: 'center' },

	acceptRequestContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	acceptRequestBox: { backgroundColor: 'white', paddingVertical: 10, width: '80%' },
	acceptRequestHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), marginHorizontal: 30, textAlign: 'center' },
	acceptRequestInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: fsize(0.033), margin: '5%', padding: 10, width: '90%' },
	errorMsg: { color: 'red', fontWeight: 'bold', marginVertical: 30, textAlign: 'center' },
	acceptRequestActions: { flexDirection: 'row', justifyContent: 'space-around' },
	acceptRequestTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: 100 },
	acceptRequestTouchHeader: { textAlign: 'center' },

	requiredBoxContainer: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
	requiredBox: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', paddingVertical: offsetPadding, width: '100%' },
	requiredContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	requiredHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	requiredActions: { alignItems: 'center', justifyContent: 'space-around' },
	requiredAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 150 },
	requiredActionHeader: { textAlign: 'center' },

	alertBoxContainer: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
	alertBox: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', paddingVertical: offsetPadding, width: '100%' },
	alertContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	alertHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	alertActions: { flexDirection: 'row', justifyContent: 'space-around' },
	alertAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	alertActionHeader: { },

	firstTimeBoxContainer: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
	firstTimeBox: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', paddingVertical: offsetPadding, width: '100%' },
	firstTimeContainer: { backgroundColor: 'white', flexDirection: 'column', height: '90%', justifyContent: 'space-around', width: '90%' },
	firstTimeHeader: { fontSize: fsize(0.08), paddingHorizontal: 10, textAlign: 'center' },
	firstTimeActions: { flexDirection: 'row', justifyContent: 'space-around' },
	firstTimeAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	firstTimeActionHeader: { },

	disabled: { backgroundColor: 'black', flexDirection: 'column', justifyContent: 'space-around', height: '100%', opacity: 0.8, width: '100%' },
	disabledContainer: { alignItems: 'center', width: '100%' },
	disabledHeader: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
	disabledClose: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 50, padding: 10 },
	disabledCloseHeader: {  }
})
