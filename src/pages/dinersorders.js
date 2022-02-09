import React, { useState, useEffect, useRef } from 'react'
import { SafeAreaView, ActivityIndicator, Dimensions, View, FlatList, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { socket, logo_url } from '../../assets/info'
import { getDinersOrders, getDinersPayments } from '../apis/schedules'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')
const wsize = p => {
  return width * (p / 100)
}
const hsize = p => {
  return height * (p / 100)
}

export default function Dinersorders(props) {
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
					
				} else {
					alert("an error has occurred in server")
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
					} else {
						alert("an error has occurred in server")
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
      let total = 0.00

			newDiners.forEach(function (diner, index) {
				if (diner.userId == data.userid) {
					diner.allowpayment = true
          diner.tip = parseFloat(data.tip)
				}

        total += parseFloat(diner.charge) + parseFloat(data.tip)
			})

			setDiners(newDiners)
      setTotalpayment(total.toFixed(2))
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
		<SafeAreaView style={styles.dinersorders}>
			{loaded ? 
				<View style={styles.box}>
					<View style={styles.header}>
						<Text style={styles.boxHeader}>({diners.length}) Diner(s) made order(s)</Text>
					</View>

					<View style={styles.body}>
						<FlatList
							data={diners}
							renderItem={({ item, index }) => 
								<View key={item.key} style={styles.diner}>
									<View style={styles.dinerRow}>
										<View style={styles.dinerProfile}>
											<Image source={{ uri: logo_url + item.profile }} style={{ height: wsize(20), width: wsize(20) }}/>
										</View>
										<Text style={styles.dinerHeader}>{item.username}</Text>
										<Text style={styles.dinerCharge}>
											{(item.paying || (!item.paying && !item.payed && !item.paid)) && 'Paying'}
											{(item.payed || item.paid) && 'Paid'}
											: 
											$ {item.charge.toFixed(2)}

                      {item.tip > 0 && '\nTipping: $' + item.tip.toFixed(2)}
										</Text>

										{(item.payed || item.paid) && <View style={{ marginRight: 10, marginTop: 18 }}><AntDesign name="checkcircleo" color="blue" size={30}/></View>}
										{item.paying && <View style={{ marginRight: 10, marginTop: 18 }}><ActivityIndicator color="blue" size="large"/></View>}
									</View>
									<Text style={styles.dinerStatus}>{item.allowpayment ? "Payment sent" : "Waiting for payment"}</Text>
								</View>
							}
						/>
					</View>

					<View style={styles.footer}>
						<Text style={styles.totalHeader}>Total: $ {totalPayment}</Text>

						<TouchableOpacity style={[styles.payment, { opacity: gettingPayment ? 0.3 : 1 }]} disabled={gettingPayment} onPress={() => getTheDinersPayments()}>
							<Text style={styles.paymentHeader}>Receive now</Text>
						</TouchableOpacity>
					</View>
				</View>
				:
				<View style={styles.loading}>
          <ActivityIndicator color="black" size="large"/>
        </View>
			}

			{paymentConfirm.show && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.confirmBoxContainer}>
						<View style={styles.confirmBox}>
							<View style={styles.confirmContainer}>
								<Text style={styles.confirmHeader}>
									All diners have paid
									{'\n\n'}
									You have received a total payment of $ {totalPayment}
									{'\n\n\n'}
									Good Job
								</Text>

								<View style={styles.confirmActions}>
									<TouchableOpacity style={styles.confirmAction} onPress={() => {
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
										<Text style={styles.confirmActionHeader}>Ok</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</SafeAreaView>
				</Modal>
			)}
			{showPaymentUnconfirmed.show && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.confirmBoxContainer}>
						<View style={styles.confirmBox}>
							<View style={styles.confirmContainer}>
								<Text style={styles.confirmHeader}>
									{showPaymentUnconfirmed.username} hasn't sent his/her payment yet.
									{'\n\n'}
									Please tell him/her to send the payment in their notification
								</Text>

								<View style={styles.confirmActions}>
									<TouchableOpacity style={styles.confirmAction} onPress={() => setShowpaymentunconfirmed({ show: false, username: "" })}>
										<Text style={styles.confirmActionHeader}>Ok</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</SafeAreaView>
				</Modal>
			)}
			{showDisabledScreen && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.disabled}>
						<View style={styles.disabledContainer}>
							<Text style={styles.disabledHeader}>
								There is an update to the app{'\n\n'}
								Please wait a moment{'\n\n'}
								or tap 'Close'
							</Text>

							<TouchableOpacity style={styles.disabledClose} onPress={() => socket.emit("socket/business/login", ownerId, () => setShowdisabledscreen(false))}>
								<Text style={styles.disabledCloseHeader}>Close</Text>
							</TouchableOpacity>

							<ActivityIndicator size="large"/>
						</View>
					</SafeAreaView>
				</Modal>
			)}
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	dinersorders: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },

	header: { flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	boxHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },

	body: { alignItems: 'center', height: '80%' },

	diner: { backgroundColor: 'white', marginBottom: 5, marginHorizontal: 5 },
	dinerRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 5, width: width - 10 },
	dinerProfile: { borderRadius: wsize(20) / 2, height: wsize(20), overflow: 'hidden', width: wsize(20) },
	dinerHeader: { fontSize: wsize(4), fontWeight: 'bold', marginVertical: 25 },
	dinerCharge: { fontSize: wsize(4), marginVertical: 25 },
	dinerStatus: { fontSize: wsize(5), fontWeight: '100', marginBottom: 20, textAlign: 'center' },

	footer: { alignItems: 'center', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	totalHeader: { fontSize: wsize(4), fontWeight: 'bold', textAlign: 'center' },
	payment: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 10, padding: 5, width: wsize(30) },
	paymentHeader: { fontSize: wsize(4), textAlign: 'center' },

	confirmBoxContainer: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
	confirmBox: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	confirmContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	confirmHeader: { fontFamily: 'appFont', fontSize: wsize(5), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	confirmActions: { flexDirection: 'row', justifyContent: 'space-around' },
	confirmAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	confirmActionHeader: { },

	disabled: { backgroundColor: 'black', flexDirection: 'column', justifyContent: 'space-around', height: '100%', opacity: 0.8, width: '100%' },
	disabledContainer: { alignItems: 'center', width: '100%' },
	disabledHeader: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
	disabledClose: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 50, padding: 10 },
	disabledCloseHeader: {  },

  loading: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
})
