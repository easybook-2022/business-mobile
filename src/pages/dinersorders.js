import React, { useState, useEffect, useRef } from 'react'
import { ActivityIndicator, Dimensions, View, FlatList, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { socket, logo_url } from '../../assets/info'
import { getDinersOrders, getDinersPayments } from '../apis/schedules'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)
const itemSize = 70

const fsize = p => {
	return width * p
}

export default function dinersorders(props) {
	const { scheduleid, refetch } = props.route.params

	const [ownerId, setOwnerid] = useState(null)
	const [diners, setDiners] = useState([])
	const [totalPayment, setTotalpayment] = useState(0.00)
	const [paymentConfirm, setPaymentconfirm] = useState({ show: false, receiver: [] })
	const [showPaymentUnconfirmed, setShowpaymentunconfirmed] = useState({ show: false, username: "" })
	const [gettingPayment, setGettingpayment] = useState(false)
	const [loaded, setLoaded] = useState(false)
	const [showDisabledScreen, setShowdisabledscreen] = useState(false)

	const isMounted = useRef(null)

	const getTheDinersOrders = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")

		getDinersOrders(scheduleid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res && isMounted.current == true) {
					socket.emit("socket/business/login", ownerid, () => {
						setOwnerid(ownerid)
						setDiners(res.diners)
						setTotalpayment(res.total.toFixed(2))
						setLoaded(true)
					})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				}
			})
	}
	const getTheDinersPayments = async() => {
		setGettingpayment(true)

		let k = 0, newDiners = [...diners]
		let data, allpaid = true
		let time = Date.now()
		let receiver = []

		while (k < newDiners.length) {
			if (!newDiners[k].paid) {
				newDiners[k].paying = true
				setDiners(newDiners)

				data = { scheduleid, userid: newDiners[k].userId, time }
				receiver.push("user" + newDiners[k].userId)

				try {
					let res = await getDinersPayments(data)

					if (res.status == 200 && isMounted.current == true) { // user payment passed
						newDiners[k].paying = false
						newDiners[k].paid = true

						setDiners(newDiners)
					}
				} catch (err) {
					if (err.response && err.response.status == 400) {
						const { errormsg, status, info } = err.response.data

						switch (status) {
							case "paymentunconfirmed":
								const username = info["username"]

								setShowpaymentunconfirmed({ show: true, username })
								setGettingpayment(false)
								newDiners[k].paying = false

								break
							default:
						}
					}

					allpaid = false
				}
			}

			k++
		}

		if (allpaid) {
			data = { type: "getDinersPayments", scheduleid, receiver }
			socket.emit("socket/getDinersPayments", data, () => setPaymentconfirm({ show: true, receiver }))
		}

		setGettingpayment(false)
	}

	const startWebsocket = () => {
		socket.on("sendDiningPayment", data => {
			const newDiners = [...diners]

			newDiners.forEach(function (diner, index) {
				if (diner.userId == data.userid) {
					diner.allowpayment = true
				}
			})

			setDiners(newDiners)
		})
		socket.io.on("open", () => {
			if (ownerId != null) {
				socket.emit("socket/business/login", ownerId, () => setShowdisabledscreen(false))
			}
		})
		socket.io.on("close", () => ownerId != null ? setShowdisabledscreen(true) : {})
	}

	useEffect(() => {
		isMounted.current = true

		getTheDinersOrders()

		return () => isMounted.current = false
	}, [])

	useEffect(() => {
		startWebsocket()

		return () => {
			socket.off("sendDiningPayment")
		}
	}, [diners.length])

	return (
		<View style={style.dinersorders}>
			<View style={{ backgroundColor: '#EAEAEA', paddingVertical: offsetPadding }}>
				<View style={style.box}>
					<TouchableOpacity style={gettingPayment ? style.backDisabled : style.back} disabled={gettingPayment} onPress={() => props.navigation.goBack()}>
						<Text allowFontScaling={false} style={style.backHeader}>Back</Text>
					</TouchableOpacity>

					<View style={style.body}>
						<Text allowFontScaling={false} style={style.header}>({diners.length}) Diner(s) made order(s)</Text>

						{loaded ? 
							<>
								<FlatList
									data={diners}
									renderItem={({ item, index }) => 
										<View key={item.key} style={style.diner}>
											<View style={style.dinerRow}>
												<View style={style.dinerProfile}>
													<Image source={{ uri: logo_url + item.profile }} style={{ height: itemSize, width: itemSize }}/>
												</View>
												<Text allowFontScaling={false} style={style.dinerHeader}>{item.username}</Text>
												<Text allowFontScaling={false} style={style.dinerCharge}>
													{(item.paying || (!item.paying && !item.payed && !item.paid)) && 'Paying'}
													{(item.payed || item.paid) && 'Paid'}
													: 
													$ {item.charge.toFixed(2)}
												</Text>

												{(item.payed || item.paid) && <View style={{ marginRight: 10, marginTop: 18 }}><AntDesign name="checkcircleo" color="blue" size={30}/></View>}
												{item.paying && <View style={{ marginRight: 10, marginTop: 18 }}><ActivityIndicator color="blue" size="large"/></View>}
											</View>
											<Text allowFontScaling={false} style={style.dinerStatus}>{item.allowpayment ? "Payment sent" : "Waiting for payment"}</Text>
										</View>
									}
								/>

								<Text allowFontScaling={false} style={style.totalHeader}>Total: $ {totalPayment}</Text>

								<TouchableOpacity style={gettingPayment ? style.paymentDisabled : style.payment} disabled={gettingPayment} onPress={() => getTheDinersPayments()}>
									<Text allowFontScaling={false} style={style.paymentHeader}>Receive now</Text>
								</TouchableOpacity>
							</>
							:
							<ActivityIndicator marginTop={50} size="large"/>
						}	
					</View>
				</View>

				{paymentConfirm.show && (
					<Modal transparent={true}>
						<View style={style.confirmBoxContainer}>
							<View style={style.confirmBox}>
								<View style={style.confirmContainer}>
									<Text allowFontScaling={false} style={style.confirmHeader}>
										All diners have paid
										{'\n\n'}
										You have received a total payment of $ {totalPayment}
										{'\n\n\n'}
										Good Job
									</Text>

									<View style={style.confirmActions}>
										<TouchableOpacity style={style.confirmAction} onPress={() => {
											socket.emit(
												"socket/deleteReservation", 
												{ id: scheduleid, type: "deleteReservation", receiver: paymentConfirm.receiver }, 
												() => {
													refetch()
													setPaymentconfirm({ show: false, receiver: [] })
													props.navigation.goBack()
												}
											)
										}}>
											<Text allowFontScaling={false} style={style.confirmActionHeader}>Ok</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</View>
					</Modal>
				)}

				{showPaymentUnconfirmed.show && (
					<Modal transparent={true}>
						<View style={style.confirmBoxContainer}>
							<View style={style.confirmBox}>
								<View style={style.confirmContainer}>
									<Text allowFontScaling={false} style={style.confirmHeader}>
										{showPaymentUnconfirmed.username} hasn't sent his/her payment yet.
										{'\n\n'}
										Please tell him/her to send the payment in their notification
									</Text>

									<View style={style.confirmActions}>
										<TouchableOpacity style={style.confirmAction} onPress={() => setShowpaymentunconfirmed({ show: false, username: "" })}>
											<Text allowFontScaling={false} style={style.confirmActionHeader}>Ok</Text>
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
							<Text allowFontScaling={false} style={style.disabledHeader}>
								There is an update to the app{'\n\n'}
								Please wait a moment{'\n\n'}
								or tap 'Close'
							</Text>

							<TouchableOpacity style={style.disabledClose} onPress={() => socket.emit("socket/business/login", ownerId, () => setShowdisabledscreen(false))}>
								<Text allowFontScaling={false} style={style.disabledCloseHeader}>Close</Text>
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
	dinersorders: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, marginTop: 20, marginHorizontal: 20, padding: 5, width: 100 },
	backDisabled: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, height: 30, marginTop: 20, marginHorizontal: 20, opacity: 0.3, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: fsize(0.05) },

	body: { alignItems: 'center', height: screenHeight - 30 },
	header: { fontSize: fsize(0.05), fontWeight: 'bold', marginVertical: 20 },

	diner: { backgroundColor: 'white', marginBottom: 5, marginHorizontal: 5 },
	dinerRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 5, width: width - 10 },
	dinerProfile: { borderRadius: itemSize / 2, height: itemSize, overflow: 'hidden', width: itemSize },
	dinerHeader: { fontSize: fsize(0.04), fontWeight: 'bold', marginVertical: 25 },
	dinerCharge: { fontSize: fsize(0.04), marginVertical: 25 },
	dinerStatus: { fontWeight: '100', marginBottom: 20, textAlign: 'center' },

	totalHeader: { fontWeight: '100', textAlign: 'center' },
	payment: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 10, padding: 5, width: 150 },
	paymentDisabled: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 10, opacity: 0.3, padding: 5, width: 150 },
	paymentHeader: { textAlign: 'center' },

	confirmBoxContainer: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
	confirmBox: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', paddingVertical: offsetPadding, width: '100%' },
	confirmContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	confirmHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	confirmActions: { flexDirection: 'row', justifyContent: 'space-around' },
	confirmAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	confirmActionHeader: { },

	disabled: { backgroundColor: 'black', flexDirection: 'column', justifyContent: 'space-around', height: '100%', opacity: 0.8, width: '100%' },
	disabledContainer: { alignItems: 'center', width: '100%' },
	disabledHeader: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
	disabledClose: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 50, padding: 10 },
	disabledCloseHeader: {  }
})
