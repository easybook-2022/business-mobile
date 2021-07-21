import React, { useEffect, useState } from 'react'
import { AsyncStorage, SafeAreaView, ScrollView, ActivityIndicator, Dimensions, View, FlatList, Image, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import { logo_url } from '../../../assets/info'
import { getInfo } from '../../apis/locations'
import { getMenus, removeMenu, getAppointments, addNewMenu } from '../../apis/menus'
import { getRequests, acceptRequest, cancelRequest } from '../../apis/appointments'
import { getProducts, getServices, removeProduct } from '../../apis/products'

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
	const [showEdit, setShowedit] = useState('')
	const [requests, setRequests] = useState([
		{ // client requested time
			key: "request-0", id: "10d0df0cidod-0", username: 'good girl 0', time: 1624540847504, name: "Foot Care", 
			image: require("../../../assets/nailsalon/footcare.jpeg")
		},
		{ // client requested time
			key: "request-1", id: "10d0df0cidod-1", username: 'good girl 1', time: 1624540848604, name: "Foot Care", 
			image: require("../../../assets/nailsalon/footcare.jpeg")
		},
		{ // client requested time
			key: "request-2", id: "10d0df0cidod-2", username: 'good girl 2', time: 1624540849704, name: "Foot Care", 
			image: require("../../../assets/nailsalon/footcare.jpeg")
		},
		{ // client requested time
			key: "request-3", id: "10d0df0cidod-3", username: 'good girl 3', time: 1624571850804, name: "Foot Care", 
			image: require("../../../assets/nailsalon/footcare.jpeg")
		}
	])
	const [appointments, setAppointments] = useState([
		{
			key: "appointment-0", id: "19c9d9f9d9f-0", username: "good girl 0", time: 1624541947504, name: "Foot Care",
			image: require("../../../assets/nailsalon/footcare.jpeg")
		},
		{
			key: "appointment-1", id: "19c9d9f9d9f-1", username: "good girl 1", time: 1624542047504, name: "Foot Care",
			image: require("../../../assets/nailsalon/footcare.jpeg")
		},
		{
			key: "appointment-2", id: "19c9d9f9d9f-2", username: "good girl 2", time: 1624542147504, name: "Foot Care",
			image: require("../../../assets/nailsalon/footcare.jpeg")
		},
		{
			key: "appointment-3", id: "19c9d9f9d9f-3", username: "good girl 3", time: 1624542447504, name: "Foot Care",
			image: require("../../../assets/nailsalon/footcare.jpeg")
		}
	])
	const [viewType, setViewtype] = useState('')
	const [cancelRequestInfo, setCancelrequestinfo] = useState({ show: false, reason: "", id: 0, index: 0 })
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
					const { msg, storeName, storeAddress, storeLogo } = res

					setShowedit(msg)
					setStorename(storeName)
					setStoreaddress(storeAddress)
					setStoreicon(storeLogo)
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
	const getAllAppointments = () => {
		getAppointments()
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {

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
				}
			})
	}
	
	useEffect(() => {
		getTheInfo()
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
								<Text style={style.navHeader}>Request(s)</Text>
							</TouchableOpacity>
							<TouchableOpacity style={style.nav} onPress={() => getAllAppointments()}>
								<Text style={style.navHeader}>Appointment(s)</Text>
							</TouchableOpacity>
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
											<Text style={{ fontWeight: 'bold' }}>{item.username + ' requested'}</Text> 
											<Text style={{ fontWeight: 'bold' }}>{' ' + item.name}</Text> on 
											<Text style={{ fontWeight: 'bold' }}>{' ' + displayDateStr(item.time)}</Text>
										</Text>

										<View style={style.requestActions}>
											<View style={{ flexDirection: 'row' }}>
												<TouchableOpacity style={style.requestAction} onPress={() => props.navigation.navigate("booktime", { appointmentid: item.id })}>
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
								<View key={item.key} style={style.appointment}>

								</View>
							}
						/>
					)}
				</View>

				<View style={style.bottomNavs}>
					<View style={{ flexDirection: 'row' }}>
						<TouchableOpacity style={style.bottomNav} onPress={() => props.navigation.navigate("settings")}>
							<AntDesign name="setting" size={30}/>
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
					<SafeAreaView style={{ flex: 1 }}>
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
					</SafeAreaView>
				</Modal>
			)}
		</View>
	)
}

const style = StyleSheet.create({
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },

	// height = 150
	headers: { alignItems: 'center', flexDirection: 'column', height: 150, justifyContent: 'space-between', paddingVertical: 5 },
	storeIconHolder: { borderRadius: 35, height: 70, overflow: 'hidden', width: 70 },
	image: { height: 70, width: 70 },
	locationName: { fontSize: 15, fontWeight: 'bold', paddingHorizontal: 10, textAlign: 'center' },
	locationAddress: { fontSize: 15, fontWeight: 'bold', paddingHorizontal: 10, textAlign: 'center' },

	navs: { alignItems: 'center', backgroundColor: 'rgba(127, 127, 127, 0.1)', height: 30 },
	nav: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: 13, marginHorizontal: 2, marginVertical: 3, padding: 2, width: (width / 3) - 10 },
	navHeader: { fontSize: 13 },

	// products
	/*product: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, margin: 5, padding: 5, width: (width / 3) - 10 },
	productEmpty: { borderRadius: 5, margin: 5, padding: 5, width: (width / 3) - 10 },
	productHeader: { fontSize: 10, fontWeight: 'bold', paddingVertical: 10 },
	productImage: { backgroundColor: 'black', borderRadius: 25, height: 50, width: 50 },
	productPrice: { fontWeight: 'bold' },
	productRemove: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 8, padding: 2 },
	productRemoveHeader: { fontSize: 10, textAlign: 'center' },*/

	// body
	body: { height: screenHeight - 180 },

	// client appointment requests
	request: { borderRadius: 5, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 5, marginVertical: 2.5 },
	imageHolder: { borderRadius: 40, height: 80, margin: 5, overflow: 'hidden', width: 80 },
	requestInfo: { fontFamily: 'appFont', fontSize: 20, padding: 10, width: width - 100 },
	requestActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
	requestAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: 80 },
	requestActionHeader: { fontSize: 10 },

	// client's appointments
	appointment: { borderRadius: 5, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 5, marginVertical: 2.5 },

	// height = 50
	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', height: 50, justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', height: 30, marginVertical: 10, marginHorizontal: 20 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },

	cancelRequestBox: { backgroundColor: 'white', height: '100%', width: '100%' },
	cancelRequestHeader: { fontFamily: 'appFont', fontSize: 20, margin: 30, textAlign: 'center' },
	cancelRequestInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: 20, height: 200, margin: '5%', padding: 10, width: '90%' },
	cancelRequestActions: { flexDirection: 'row', justifyContent: 'space-around' },
	cancelRequestTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: 100 },
	cancelRequestTouchHeader: { textAlign: 'center' },
})
