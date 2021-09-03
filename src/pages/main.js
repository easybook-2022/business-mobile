import React, { useEffect, useState } from 'react'
import { AsyncStorage, ScrollView, ActivityIndicator, Dimensions, View, FlatList, Image, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import { logo_url } from '../../assets/info'
import { fetchNumRequests, fetchNumAppointments, fetchNumCartOrderers, fetchNumReservations, fetchNumorders, getInfo, changeLocationState } from '../apis/locations'
import { getMenus, removeMenu, addNewMenu } from '../apis/menus'
import { getRequests, acceptRequest, cancelRequest, doneDining, doneService, getAppointments, getCartOrderers, getReservations } from '../apis/schedules'
import { getProducts, getServices, removeProduct } from '../apis/products'

import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

let updateNumrequests, updateNumappointments, updateNumcartorderers, updateNumreservations

export default function main(props) {
	const [permission, setPermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
	const [camType, setCamtype] = useState(Camera.Constants.Type.back);
	const [storeIcon, setStoreicon] = useState('')
	const [storeName, setStorename] = useState('')
	const [storeAddress, setStoreaddress] = useState('')
	const [locationType, setLocationtype] = useState('')
	const [locationState, setLocationstate] = useState('')

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
	const [cancelRequestInfo, setCancelrequestinfo] = useState({ show: false, reason: "", id: 0, index: 0 })
	const [acceptRequestInfo, setAcceptrequestinfo] = useState({ show: false, type: "", requestid: "", tablenum: "", errorMsg: "" })
	const [showBankaccountrequired, setShowbankaccountrequired] = useState({ show: false, index: 0, type: "" })
	const [showMenurequired, setShowmenurequired] = useState(false)
	const [showPaymentconfirm, setShowpaymentconfirm] = useState(false)

	const fetchTheNumRequests = async() => {
		const locationid = await AsyncStorage.getItem("locationid")

		if (locationid != null) {
			fetchNumRequests(locationid)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) setNumrequests(res.numRequests)
				})
		}
	}
	const fetchTheNumAppointments = async() => {
		const locationid = await AsyncStorage.getItem("locationid")

		if (locationid != null) {
			fetchNumAppointments(locationid)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) setNumappointments(res.numAppointments)
				})
		}
	}
	const fetchTheNumCartOrderers = async() => {
		const locationid = await AsyncStorage.getItem("locationid")

		if (locationid != null) {
			fetchNumCartOrderers(locationid)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) setNumcartorderers(res.numCartorderers)
				})
		}
	}
	const fetchTheNumReservations = async() => {
		const locationid = await AsyncStorage.getItem("locationid")

		if (locationid != null) {
			fetchNumReservations(locationid)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) setNumreservations(res.numReservations)
				})
		}
	}
	const getTheInfo = async() => {
		const userid = await AsyncStorage.getItem("userid")
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { locationid, menuid: '' }

		getInfo(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { msg, storeName, storeAddress, storeLogo, locationType, locationState } = res

					setShowedit(msg)
					setStorename(storeName)
					setStoreaddress(storeAddress)
					setStoreicon(storeLogo)
					setLocationtype(locationType)
					setLocationstate(locationState)

					fetchTheNumRequests()

					if (locationType == 'salon') {
						fetchTheNumAppointments()
					} else if (locationType == 'restaurant') {
						fetchTheNumReservations()
					}

					if (locationType == 'restaurant') {
						getAllReservations()
					} else {
						getAllAppointments()
					}
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
				if (res) setLocationstate(res.state)
			})
			.catch((err) => {
				if (err.response.status == 400) {
					if (err.response.data.status) {
						const status = err.response.data.status

						switch (status) {
							case "menusetuprequired":
								setShowmenurequired(true)

								break;
							case "bankaccountrequired":
								setShowbankaccountrequired({ show: true, index: 0, "type": "listlocation" })

								break
							default:
						}
					}
				}
			})
	}
	const displayTimestr = (unixtime) => {
		let weekdays = { "Mon": "Monday", "Tue": "Tuesday", "Wed": "Wednesday", "Thu": "Thursday", "Fri": "Friday", "Sat": "Saturday", "Sun": "Sunday" }
		let months = { 
			"Jan": "January", "Feb": "February", "Mar": "March", "Apr": "April", "May": "May", "Jun": "June", 
			"Jul": "July", "Aug": "August", "Sep": "September", "Oct": "October", "Nov": "November", "Dec": "December" 
		}
		let d = new Date(unixtime).toString().split(" ")
		let day = weekdays[d[0]]
		let month = months[d[1]]
		let date = d[2]
		let year = d[3]

		let time = d[4].split(":")
		let hour = parseInt(time[0])
		let minute = time[1]
		let period = hour > 11 ? "pm" : "am"

		hour = hour > 12 ? hour - 12 : hour

		//day + ", " + month + " " + date + ", " + year + " at " + 

		let timestr = hour + ":" + minute + " " + period;

		return timestr
	}
	const getAllRequests = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { ownerid, locationid }

		getRequests(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setRequests(res.requests)
					setViewtype('requests')
				}
			})
	}
	const getAllAppointments = async() => {
		const locationid = await AsyncStorage.getItem("locationid")

		getAppointments(locationid)
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
				}
			})
			.catch((err) => {
				alert(err.message)
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
	}
	const cancelTheRequest = (requestid, index) => {
		if (!cancelRequestInfo.show) {
			setCancelrequestinfo({
				...cancelRequestInfo,
				show: true,
				id: requestid,
				index: index
			})
		} else {
			const { reason, id, index } = cancelRequestInfo
			const data = { id, reason }

			cancelRequest(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						const newRequests = [...requests]

						newRequests.splice(index, 1)

						setRequests(newRequests)
						setNumrequests(numRequests - 1)
						setCancelrequestinfo({ ...cancelRequestInfo, show: false, reason: "", requestid: 0, index: 0 })
					}
				})
		}
	}
	const acceptTheRequest = (requestid, index) => {
		const { type } = requestid ? requests[index] : acceptRequestInfo

		if (type != "restaurant") {
			const data = { requestid, tablenum: "" }

			acceptRequest(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						const newRequests = [...requests]

						newRequests.splice(index, 1)

						setRequests(newRequests)
						setNumrequests(numRequests - 1)
						setNumappointments(numAppointments + 1)
						setAcceptrequestinfo({ show: false, tablenum: "" })

						if (locationType == 'restaurant') {
							getAllReservations()
						} else {
							getAllAppointments()
						}
					}
				})
		} else {
			if (!acceptRequestInfo.show) {
				setAcceptrequestinfo({ ...acceptRequestInfo, show: true, type, requestid })
			} else {
				const { requestid, tablenum } = acceptRequestInfo

				if (tablenum) {
					const data = { requestid, tablenum }

					acceptRequest(data)
						.then((res) => {
							if (res.status == 200) {
								return res.data
							}
						})
						.then((res) => {
							if (res) {
								const newRequests = [...requests]

								newRequests.splice(index, 1)

								setRequests(newRequests)
								setNumrequests(numRequests - 1)
								setNumappointments(numAppointments + 1)
								setAcceptrequestinfo({ show: false, tablenum: "" })

								if (locationType == 'restaurant') {
									getAllReservations()
								} else {
									getAllAppointments()
								}
							}
						})
				} else {
					setAcceptrequestinfo({ ...acceptRequestInfo, errorMsg: "Please enter the table number for the diner" })
				}
			}
		}
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

					newReservations.splice(index, 1)

					setReservations(newReservations)
				}
			})
	}
	const doneTheService = (index, id) => {
		const newAppointments = [...appointments]

		newAppointments[index].gettingPayment = true

		setAppointments(newAppointments)

		doneService(id)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const newAppointments = [...appointments]

					newAppointments.splice(index, 1)

					setAppointments(newAppointments)

					showPaymentconfirm(true)
				}
			})
			.catch((err) => {
				if (err.response.status == 400) {
					if (err.response.data.status) {
						const status = err.response.data.status

						switch (status) {
							case "bankaccountrequired":
								setShowbankaccountrequired({ show: true, index, "type": "doneservice" })

								break;
							default:
						}
					}
				}
			})
	}

	useEffect(() => {
		getTheInfo()

		updateNumrequests = setInterval(() => fetchTheNumRequests(), 1000)
		updateNumappointments = setInterval(() => fetchTheNumAppointments(), 1000)
		updateNumcartorderers = setInterval(() => fetchTheNumCartOrderers(), 1000)
		updateNumreservations = setInterval(() => fetchTheNumReservations(), 1000)

		return () => {
			clearInterval(updateNumrequests)
			clearInterval(updateNumappointments)
			clearInterval(updateNumcartorderers)
			clearInterval(updateNumreservations)
		}
	}, [])
	
	return (
		<View style={style.main}>
			<View style={{ paddingVertical: offsetPadding }}>
				<View style={style.box}>
					<View style={style.headers}>
						<View style={style.storeIconHolder}>
							<Image source={{ uri: logo_url + storeIcon }} style={style.image}/>
						</View>
						<Text style={style.locationName}>{storeName}</Text>
						<Text style={style.locationAddress}>{storeAddress}</Text>
					</View>

					<View style={style.body}>
						<View style={style.navs}>
							<View style={{ flexDirection: 'row' }}>
								<TouchableOpacity style={viewType == "requests" ? style.navSelected : style.nav} onPress={() => getAllRequests()}>
									<Text style={viewType == "requests" ? style.navHeaderSelected : style.navHeader}>{numRequests}</Text>
									<Text style={viewType == "requests" ? style.navHeaderSelected : style.navHeader}>Request(s)</Text>
								</TouchableOpacity>

								{locationType == 'salon' && (
									<TouchableOpacity style={viewType == "appointments" ? style.navSelected : style.nav} onPress={() => getAllAppointments()}>
										<Text style={viewType == "appointments" ? style.navHeaderSelected : style.navHeader}>{numAppointments}</Text>
										<Text style={viewType == "appointments" ? style.navHeaderSelected : style.navHeader}>Appointment(s)</Text>
									</TouchableOpacity>
								)}

								<TouchableOpacity style={viewType == "cartorderers" ? style.navSelected : style.nav} onPress={() => getAllCartOrderers()}>
									<Text style={viewType == "cartorderers" ? style.navHeaderSelected : style.navHeader}>{numCartorderers}</Text>
									<Text style={viewType == "cartorderers" ? style.navHeaderSelected : style.navHeader}>Orderer(s)</Text>
								</TouchableOpacity>

								{locationType == 'restaurant' && (
									<TouchableOpacity style={viewType == "reservations" ? style.navSelected : style.nav} onPress={() => getAllReservations()}>
										<Text style={viewType == "reservations" ? style.navHeaderSelected : style.navHeader}>{numReservations}</Text>
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
												<View style={style.imageHolder}>
													<Image source={{ uri: logo_url + item.image }} style={{ height: 50, width: 50 }}/>
												</View>
												<View style={style.requestInfo}>
													<Text>
														{locationType == 'salon' ? 
															<>
																<Text style={{ fontWeight: 'bold' }}>{item.username + ' requested'}</Text> 
																<Text style={{ fontWeight: 'bold' }}>{' ' + item.name}</Text> at 
																<Text style={{ fontWeight: 'bold' }}>{' ' + displayTimestr(item.time)}</Text>
															</>
															:
															<>
																<Text><Text style={{ fontWeight: 'bold' }}>{item.username}</Text> is booking a reservation</Text>
																<Text style={{ fontWeight: 'bold' }}>{'\n'}at {displayTimestr(item.time)}</Text>
																<Text style={{ fontWeight: 'bold' }}>{(item.diners + 1) > 0 ? ' for ' + (item.diners + 1) + ' ' + ((item.diners + 1) == 1 ? 'person' : 'people') : ' for 1 person'}</Text>
															</>
														}
													</Text>
												</View>
											</View>

											<View style={style.requestActions}>
												<View style={{ flexDirection: 'row' }}>
													<TouchableOpacity style={style.requestAction} onPress={() => {
														if (locationType == 'salon') {
															props.navigation.navigate("booktime", { appointmentid: item.id, refetch: () => getAllRequests() })
														} else {
															props.navigation.navigate("makereservation", { userid: item.userId, reservationid: item.id, refetch: () => {
																fetchTheNumRequests()
																getAllRequests()
															}})
														}
													}}>
														<Text style={style.requestActionHeader}>Another time</Text>
													</TouchableOpacity>
													<TouchableOpacity style={style.requestAction} onPress={() => cancelTheRequest(item.id, index)}>
														<Text style={style.requestActionHeader}>Cancel</Text>
													</TouchableOpacity>
													<TouchableOpacity style={style.requestAction} onPress={() => acceptTheRequest(item.id, index)}>
														<Text style={style.requestActionHeader}>Accept</Text>
													</TouchableOpacity>
												</View>
											</View>
										</View>
									}
								/>
								:
								<View style={style.bodyResult}>
									<Text style={style.bodyResultHeader}>No request(s) yet</Text>
								</View>
						)}

						{viewType == "appointments" && (
							appointments.length > 0 ? 
								<FlatList
									data={appointments}
									renderItem={({ item, index }) => 
										<View key={item.key} style={style.schedule}>
											<View style={style.imageHolder}>
												<Image source={{ uri: logo_url + item.image }} style={{ height: 80, width: 80 }}/>
											</View>
											<Text style={style.scheduleHeader}>
												<Text style={{ fontFamily: 'Arial', fontWeight: 'bold' }}>{item.username} </Text> 
												has an appointment for
												<Text style={{ fontFamily: 'Arial', fontWeight: 'bold' }}> {item.name}</Text>
												{'\n'} at {''}
												<Text style={{ fontFamily: 'Arial', fontWeight: 'bold' }}>{displayTimestr(item.time)}</Text>
											</Text>

											<View style={{ flexDirection: 'row', marginBottom: 10 }}>
												<Text style={{ padding: 8 }}>Service is done ?</Text>
												<TouchableOpacity style={item.gettingPayment ? style.scheduleActionDisabled : style.scheduleAction} disabled={item.gettingPayment} onPress={() => doneTheService(index, item.id)}>
													<Text style={style.scheduleActionHeader}>Receive payment</Text>
													{item.gettingPayment && <ActivityIndicator marginBottom={-5} marginTop={-15} size="small"/>}
												</TouchableOpacity>
											</View>
										</View>
									}
								/>
								:
								<View style={style.bodyResult}>
									<Text style={style.bodyResultHeader}>No appointment(s) yet</Text>
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
												<Text style={style.cartordererUsername}>{item.username}</Text>
												<Text style={style.cartordererOrderNumber}>Order #{item.orderNumber}</Text>
												<TouchableOpacity style={style.cartordererSeeOrders} onPress={() => props.navigation.navigate("cartorders", { userid: item.id, ordernumber: item.orderNumber, refetch: () => getAllCartOrderers() })}>
													<Text style={style.cartordererSeeOrdersHeader}>See Order(s) ({item.numOrders})</Text>
												</TouchableOpacity>
											</View>
										</View>
									}
								/>
								:
								<View style={style.bodyResult}>
									<Text style={style.bodyResultHeader}>No order(s) yet</Text>
								</View>
						)}

						{viewType == "reservations" && (
							reservations.length > 0 ?
								<FlatList
									data={reservations}
									renderItem={({ item, index }) => 
										<View key={item.key} style={style.schedule}>
											<View style={style.scheduleRow}>
												<View style={style.imageHolder}>
													<Image source={{ uri: logo_url + item.image }} style={{ height: 80, width: 80 }}/>
												</View>
												<Text style={style.scheduleHeader}>
													<Text style={{ fontFamily: 'Arial', fontWeight: 'bold' }}>{item.username}{'\n'}</Text> 
													made a reservation
													{'\n'} at {''}
													<Text style={{ fontFamily: 'Arial', fontWeight: 'bold' }}>{displayTimestr(item.time)}</Text>
													{''} for {'\n'}

													<Text style={{ fontFamily: 'Arial', fontWeight: 'bold' }}>
														{(item.diners + 1) > 0 ? 
															(item.diners + 1) + " " + ((item.diners + 1) > 1 ? 'people' : 'person') 
															: 
															" 1 person"
														}
													</Text>

													{'\n'}for table: <Text style={{ fontFamily: 'Arial', fontWeight: 'bold' }}>#{item.table}</Text>
												</Text>
											</View>

											<View style={{ alignItems: 'center', marginVertical: 10 }}>
												<View style={{ flexDirection: 'row', marginBottom: 10 }}>
													<TouchableOpacity style={style.scheduleAction} onPress={() => props.navigation.navigate("diningorders", { scheduleid: item.id, refetch: () => getAllReservations() })}>
														<Text style={style.scheduleActionHeader}>Customers' Orders</Text>
													</TouchableOpacity>
													<Text style={style.scheduleNumOrders}>{item.numMakings > 0 && '(' + item.numMakings + ')'}</Text>
												</View>
												<View style={{ flexDirection: 'row' }}>
													<Text style={{ padding: 8 }}>Diners are done ?</Text>
													<TouchableOpacity style={item.gettingPayment ? style.scheduleActionDisabled : style.scheduleAction} disabled={item.gettingPayment} onPress={() => doneTheDining(index, item.id)}>
														<Text style={style.scheduleActionHeader}>Receive payment</Text>
														{item.gettingPayment && <ActivityIndicator marginBottom={-5} marginTop={-15} size="small"/>}
													</TouchableOpacity>
												</View>
											</View>									
										</View>
									}
								/>
								:
								<View style={style.bodyResult}>
									<Text style={style.bodyResultHeader}>No reservation(s) yet</Text>
								</View>
						)}
					</View>

					<View style={style.bottomNavs}>
						<View style={{ flexDirection: 'row' }}>
							<TouchableOpacity style={style.bottomNav} onPress={() => {
								clearInterval(updateNumrequests)
								clearInterval(updateNumappointments)
								clearInterval(updateNumreservations)

								props.navigation.navigate("settings")
							}}>
								<AntDesign name="setting" size={30}/>
							</TouchableOpacity>

							<TouchableOpacity style={style.bottomNavButton} onPress={() => props.navigation.navigate("menu", { menuid: '', name: '', refetch: () => getTheInfo() })}>
								<Text style={style.bottomNavHeader}>Edit Menu</Text>
							</TouchableOpacity>

							<TouchableOpacity style={style.bottomNavButton} onPress={() => changeTheLocationState()}>
								<Text style={style.bottomNavHeader}>Set {locationState == "unlist" ? "active" : "inactive"}</Text>
							</TouchableOpacity>

							<TouchableOpacity style={style.bottomNav} onPress={() => {
								AsyncStorage.clear()

								props.navigation.dispatch(
									CommonActions.reset({
										index: 1,
										routes: [{ name: 'login' }]
									})
								);
							}}>
								<Text style={style.bottomNavHeader}>Log-Out</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>

				{cancelRequestInfo.show && (
					<Modal transparent={true}>
						<View style={{ paddingVertical: offsetPadding }}>
							<View style={style.cancelRequestBox}>
								<Text style={style.cancelRequestHeader}>Tell the diner the reason for this cancellation ?</Text>

								<TextInput placeholder="Write your reason" multiline={true} style={style.cancelRequestInput} onChangeText={(reason) => {
									setCancelrequestinfo({
										...cancelRequestInfo,
										reason: reason
									})
								}} autoCorrect={false}/>

								<View style={{ alignItems: 'center' }}>
									<View style={style.cancelRequestActions}>
										<TouchableOpacity style={style.cancelRequestTouch} onPress={() => setCancelrequestinfo({ ...cancelRequestInfo, show: false, id: 0, index: 0, reason: "" })}>
											<Text style={style.cancelRequestTouchHeader}>Close</Text>
										</TouchableOpacity>
										<TouchableOpacity style={style.cancelRequestTouch} onPress={() => cancelTheRequest()}>
											<Text style={style.cancelRequestTouchHeader}>Done</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</View>
					</Modal>
				)}

				{acceptRequestInfo.show && (
					<Modal transparent={true}>
						<View style={style.acceptRequestContainer}>
							<View style={style.acceptRequestBox}>
								<Text style={style.acceptRequestHeader}>Tell the diner the table #?</Text>

								<TextInput placeholder="What table will be available" style={style.acceptRequestInput} onChangeText={(tablenum) => {
									setAcceptrequestinfo({
										...acceptRequestInfo,
										tablenum
									})
								}} autoCorrect={false} autoComplete="none"/>

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
					</Modal>
				)}
				
				{showBankaccountrequired.show && (
					<Modal transparent={true}>
						<View style={style.requiredBoxContainer}>
							<View style={style.requiredBox}>
								<View style={style.requiredContainer}>
									<Text style={style.requiredHeader}>
										You need to provide a bank account to 
										list your location for customers to see
									</Text>

									<View style={style.requiredActions}>
										<TouchableOpacity style={style.requiredAction} onPress={() => setShowbankaccountrequired({ show: false, index: 0, type: "" })}>
											<Text style={style.requiredActionHeader}>Close</Text>
										</TouchableOpacity>
										<TouchableOpacity style={style.requiredAction} onPress={() => {
											setShowbankaccountrequired({ show: false, index: 0, type: "" })
											props.navigation.navigate("settings", { required: "bankaccount" })
										}}>
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
											props.navigation.navigate("menu", { menuid: '', name: '', refetch: () => getTheInfo() })
										}}>
											<Text style={style.requiredActionHeader}>Ok</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</View>
					</Modal>
				)}

				{showPaymentconfirm && (
					<Modal transparent={true}>
						<View style={style.confirmBoxContainer}>
							<View style={style.confirmBox}>
								<View style={style.confirmContainer}>
									<Text style={style.confirmHeader}>
										Yay. Congrats on your service and payment reception. Good job
									</Text>

									<View style={style.confirmActions}>
										<TouchableOpacity style={style.confirmAction} onPress={() => showPaymentconfirm(false)}>
											<Text style={style.confirmActionHeader}>Ok</Text>
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
	main: { backgroundColor: 'white' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

	headers: { alignItems: 'center', flexDirection: 'column', height: 100, justifyContent: 'space-between', paddingVertical: 5 },
	storeIconHolder: { borderRadius: 25, height: 50, overflow: 'hidden', width: 50 },
	image: { height: 50, width: 50 },
	locationName: { fontSize: 13, fontWeight: 'bold', paddingHorizontal: 10, textAlign: 'center' },
	locationAddress: { fontSize: 13, fontWeight: 'bold', paddingHorizontal: 10, textAlign: 'center' },

	navs: { alignItems: 'center', height: 45 },
	nav: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: 13, marginHorizontal: 2, marginVertical: 3, padding: 2, width: (width / 3) - 10 },
	navHeader: { color: 'black', fontSize: 13 },
	navSelected: { alignItems: 'center', backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: 13, marginHorizontal: 2, marginVertical: 3, padding: 2, width: (width / 3) - 10 },
	navHeaderSelected: { color: 'white', fontSize: 13 },

	// body
	body: { height: screenHeight - 140 },

	// client appointment requests
	request: { borderRadius: 5, backgroundColor: 'white', marginHorizontal: 5, marginVertical: 2.5 },
	requestRow: { flexDirection: 'row', justifyContent: 'space-between' },
	imageHolder: { borderRadius: 40, height: 80, margin: 5, overflow: 'hidden', width: 80 },
	requestInfo: { fontFamily: 'appFont', fontSize: 20, padding: 10, width: width - 100 },
	requestActions: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
	requestAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: 80 },
	requestActionHeader: { fontSize: 10, textAlign: 'center' },

	// client's schedule
	schedule: { alignItems: 'center', borderRadius: 5, backgroundColor: 'white', marginHorizontal: 5, marginVertical: 2.5 },
	scheduleRow: { flexDirection: 'row', justifyContent: 'space-between' },
	imageHolder: { borderRadius: 25, height: 50, margin: 5, overflow: 'hidden', width: 50 },
	scheduleHeader: { fontFamily: 'appFont', fontSize: 20, padding: 10, textAlign: 'center', width: width - 100 },
	scheduleAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, height: 27, marginTop: 3, padding: 5, width: 120 },
	scheduleActionDisabled: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, height: 27, marginTop: 3, opacity: 0.5, padding: 5, width: 120 },
	scheduleActionHeader: { fontSize: 10, textAlign: 'center' },
	scheduleNumOrders: { fontWeight: 'bold', padding: 8 },

	cartorderer: { backgroundColor: 'white', borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', margin: 10, padding: 5 },
	cartordererImageHolder: { borderRadius: 25, height: 50, overflow: 'hidden', width: 50 },
	cartordererImage: { height: 50, width: 50 },
	cartordererInfo: { alignItems: 'center', width: width - 81 },
	cartordererUsername: { fontWeight: 'bold', marginBottom: 10 },
	cartordererOrderNumber: { fontSize: 20, paddingVertical: 5 },
	cartordererSeeOrders: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
	cartordererSeeOrdersHeader: { textAlign: 'center' },

	bodyResult: { alignItems: 'center', flexDirection: 'column', height: screenHeight - 220, justifyContent: 'space-around' },
	bodyResultHeader: { fontWeight: 'bold' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', height: 40, justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', height: 30, marginVertical: 5, marginHorizontal: 20 },
	bottomNavButton: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 3 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },

	cancelRequestBox: { backgroundColor: 'white', height: '100%', width: '100%' },
	cancelRequestHeader: { fontFamily: 'appFont', fontSize: 20, margin: 30, textAlign: 'center' },
	cancelRequestInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: 20, height: 200, margin: '5%', padding: 10, width: '90%' },
	cancelRequestActions: { flexDirection: 'row', justifyContent: 'space-around' },
	cancelRequestTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: 100 },
	cancelRequestTouchHeader: { textAlign: 'center' },

	acceptRequestContainer: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	acceptRequestBox: { backgroundColor: 'white', width: '80%' },
	acceptRequestHeader: { fontFamily: 'appFont', fontSize: 20, margin: 30, textAlign: 'center' },
	acceptRequestInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: 13, margin: '5%', padding: 10, width: '90%' },
	errorMsg: { color: 'red', fontWeight: 'bold', marginVertical: 30, textAlign: 'center' },
	acceptRequestActions: { flexDirection: 'row', justifyContent: 'space-around' },
	acceptRequestTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: 100 },
	acceptRequestTouchHeader: { textAlign: 'center' },

	requiredBoxContainer: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
	requiredBox: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', paddingVertical: offsetPadding, width: '100%' },
	requiredContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	requiredHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	requiredActions: { flexDirection: 'row', justifyContent: 'space-around' },
	requiredAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	requiredActionHeader: { },

	confirmBoxContainer: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
	confirmBox: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', paddingVertical: offsetPadding, width: '100%' },
	confirmContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	confirmHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	confirmActions: { flexDirection: 'row', justifyContent: 'space-around' },
	confirmAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	confirmActionHeader: { },
})
