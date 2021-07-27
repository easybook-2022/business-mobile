import React, { useEffect, useState } from 'react'
import { AsyncStorage, ScrollView, ActivityIndicator, Dimensions, View, FlatList, Image, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import { logo_url } from '../../assets/info'
import { fetchNumRequests, fetchNumAppointments, fetchNumReservations, getInfo } from '../apis/locations'
import { getMenus, removeMenu, addNewMenu } from '../apis/menus'
import { getRequests, acceptRequest, cancelRequest, getAppointments, getReservations } from '../apis/schedules'
import { getProducts, getServices, removeProduct } from '../apis/products'

import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function main(props) {
	const [permission, setPermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
	const [camType, setCamtype] = useState(Camera.Constants.Type.back);
	const [storeIcon, setStoreicon] = useState('')
	const [storeName, setStorename] = useState('')
	const [storeAddress, setStoreaddress] = useState('')
	const [locationType, setLocationtype] = useState('')
	const [updateNumrequests, setUpdatenumrequests] = useState()
	const [updateNumappointments, setUpdatenumappointments] = useState()
	const [updateNumreservations, setUpdatenumreservations] = useState()

	const [showEdit, setShowedit] = useState('')

	const [requests, setRequests] = useState([])
	const [numRequests, setNumrequests] = useState(0)

	const [appointments, setAppointments] = useState([])
	const [numAppointments, setNumappointments] = useState(0)

	const [reservations, setReservations] = useState([])
	const [numReservations, setNumreservations] = useState(0)

	const [viewType, setViewtype] = useState('')
	const [cancelRequestInfo, setCancelrequestinfo] = useState({ show: false, reason: "", id: 0, index: 0 })
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
		const time = Date.now()
		const data = { locationid, time }

		if (locationid != null) {
			fetchNumAppointments(data)
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
	const fetchTheNumReservations = async() => {
		const locationid = await AsyncStorage.getItem("locationid")
		const time = Date.now()
		const data = { locationid, time }

		if (locationid != null) {
			fetchNumReservations(data)
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
					const { msg, storeName, storeAddress, storeLogo, locationType } = res

					setShowedit(msg)
					setStorename(storeName)
					setStoreaddress(storeAddress)
					setStoreicon(storeLogo)
					setLocationtype(locationType)

					fetchTheNumRequests()
					setUpdatenumrequests(setInterval(() => fetchTheNumRequests(), 5000))

					if (locationType == 'salon') {
						fetchTheNumAppointments()
						setUpdatenumappointments(setInterval(() => fetchTheNumAppointments(), 5000))
					} else if (locationType == 'restaurant') {
						fetchTheNumReservations()
						setUpdatenumreservations(setInterval(() => fetchTheNumReservations(), 5000))
					}

					getAllReservations()
				}
			})
	}
	const displayDateStr = (unixtime) => {
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

		let datestr = day + ", " + month + " " + date + ", " + year + " at " + hour + ":" + minute + " " + period;

		return datestr
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
		acceptRequest(requestid)
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
				}
			})
	}
	
	useEffect(() => {
		getTheInfo()

		return () => {
			clearInterval(updateNumrequests)
			clearInterval(updateNumappointments)
			clearInterval(updateNumreservations)
		}
	}, [])
	
	return (
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
							<TouchableOpacity style={style.nav} onPress={() => props.navigation.navigate("menu", { menuid: '', name: '', refetch: () => getTheInfo() })}>
								<Text style={style.navHeader}>Edit Menu</Text>
							</TouchableOpacity>

							<TouchableOpacity style={style.nav} onPress={() => getAllRequests()}>
								<Text style={style.navHeader}>{numRequests} Request(s)</Text>
							</TouchableOpacity>

							{locationType == 'salon' && (
								<TouchableOpacity style={style.nav} onPress={() => getAllAppointments()}>
									<Text style={style.navHeader}>{numAppointments} Appointment(s)</Text>
								</TouchableOpacity>
							)}

							{locationType == 'restaurant' && (
								<TouchableOpacity style={style.nav} onPress={() => getAllReservations()}>
									<Text style={style.navHeader}>{numReservations} Reservation(s)</Text>
								</TouchableOpacity>
							)}
						</View>
					</View>

					{viewType == "requests" && (
						<FlatList
							data={requests}
							renderItem={({ item, index }) => 
								<View key={item.key} style={style.request}>
									<View style={style.imageHolder}>
										<Image source={{ uri: logo_url + item.image }} style={{ height: 80, width: 80 }}/>
									</View>
									<View style={style.requestInfo}>
										<Text>
											{locationType == 'salon' ? 
												<>
													<Text style={{ fontWeight: 'bold' }}>{item.username + ' requested'}</Text> 
													<Text style={{ fontWeight: 'bold' }}>{' ' + item.name}</Text> on 
													<Text style={{ fontWeight: 'bold' }}>{' ' + displayDateStr(item.time)}</Text>
												</>
												:
												<>
													<Text style={{ fontWeight: 'bold' }}>{item.username + ' booked reservation'}</Text> 
													<Text style={{ fontWeight: 'bold' }}>{' for ' + item.name}</Text> on 
													<Text style={{ fontWeight: 'bold' }}>{' ' + displayDateStr(item.time)}</Text>
												</>
											}
										</Text>

										<View style={style.requestActions}>
											<View style={{ flexDirection: 'row' }}>
												<TouchableOpacity style={style.requestAction} onPress={() => {
													if (locationType == 'salon') {
														props.navigation.navigate("booktime", { appointmentid: item.id })
													} else {
														props.navigation.navigate("makereservation", { userid: item.userId, reservationid: item.id })
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
								</View>
							}
						/>
					)}

					{viewType == "appointments" && (
						<FlatList
							data={appointments}
							renderItem={({ item }) => 
								<View key={item.key} style={style.schedule}>
									<View style={style.imageHolder}>
										<Image source={{ uri: logo_url + item.image }} style={{ height: 80, width: 80 }}/>
									</View>
									<Text style={style.scheduleHeader}>
										<Text style={{ fontFamily: 'Arial', fontWeight: 'bold' }}>{item.username} </Text> 
										has an appointment for
										<Text style={{ fontFamily: 'Arial', fontWeight: 'bold' }}> {item.name}</Text>
										{'\n'} on {displayDateStr(item.time)}
									</Text>
								</View>
							}
						/>
					)}

					{viewType == "reservations" && (
						<FlatList
							data={reservations}
							renderItem={({ item }) => 
								<View key={item.key} style={style.schedule}>
									<View style={style.imageHolder}>
										<Image source={{ uri: logo_url + item.image }} style={{ height: 80, width: 80 }}/>
									</View>
									<Text style={style.scheduleHeader}>
										<Text style={{ fontFamily: 'Arial', fontWeight: 'bold' }}>{item.username} </Text> 
										booked a reservation for
										<Text style={{ fontFamily: 'Arial', fontWeight: 'bold' }}> {item.name}</Text>
										{'\n'} on {displayDateStr(item.time)} for {item.seaters} {item.seaters == 1 ? 'person' : 'people'}
									</Text>
								</View>
							}
						/>
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

						<TouchableOpacity style={style.bottomNav} onPress={() => {
							clearInterval(updateNumrequests)
							clearInterval(updateNumappointments)
							clearInterval(updateNumreservations)

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
							<Text style={style.cancelRequestHeader}>Tell the client the reason for this cancellation ?</Text>

							<TextInput placeholder="Write your reason" multiline={true} style={style.cancelRequestInput} onChangeText={(reason) => {
								setCancelrequestinfo({
									...cancelRequestInfo,
									reason: reason
								})
							}}/>

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
		</View>
	)
}

const style = StyleSheet.create({
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

	// height = 150
	headers: { alignItems: 'center', flexDirection: 'column', height: 150, justifyContent: 'space-between', paddingVertical: 5 },
	storeIconHolder: { borderRadius: 35, height: 70, overflow: 'hidden', width: 70 },
	image: { height: 70, width: 70 },
	locationName: { fontSize: 15, fontWeight: 'bold', paddingHorizontal: 10, textAlign: 'center' },
	locationAddress: { fontSize: 15, fontWeight: 'bold', paddingHorizontal: 10, textAlign: 'center' },

	navs: { alignItems: 'center', backgroundColor: 'rgba(127, 127, 127, 0.1)', height: 30 },
	nav: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: 13, marginHorizontal: 2, marginVertical: 3, padding: 2, width: (width / 3) - 10 },
	navHeader: { fontSize: 13 },

	// body
	body: { height: screenHeight - 190 },

	// client appointment requests
	request: { borderRadius: 5, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 5, marginVertical: 2.5 },
	imageHolder: { borderRadius: 40, height: 80, margin: 5, overflow: 'hidden', width: 80 },
	requestInfo: { fontFamily: 'appFont', fontSize: 20, padding: 10, width: width - 100 },
	requestActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
	requestAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: 80 },
	requestActionHeader: { fontSize: 10 },

	// client's schedule
	schedule: { borderRadius: 5, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 5, marginVertical: 2.5 },
	imageHolder: { borderRadius: 40, height: 80, margin: 5, overflow: 'hidden', width: 80 },
	scheduleHeader: { fontFamily: 'appFont', fontSize: 20, padding: 10, width: width - 100 },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', height: 40, justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', height: 30, marginVertical: 5, marginHorizontal: 20 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },

	cancelRequestBox: { backgroundColor: 'white', height: '100%', width: '100%' },
	cancelRequestHeader: { fontFamily: 'appFont', fontSize: 20, margin: 30, textAlign: 'center' },
	cancelRequestInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: 20, height: 200, margin: '5%', padding: 10, width: '90%' },
	cancelRequestActions: { flexDirection: 'row', justifyContent: 'space-around' },
	cancelRequestTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: 100 },
	cancelRequestTouchHeader: { textAlign: 'center' },
})
