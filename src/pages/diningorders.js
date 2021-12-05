import React, { useState, useEffect, useRef } from 'react'
import { ActivityIndicator, Dimensions, ScrollView, View, FlatList, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { socket, logo_url } from '../../assets/info'
import { getScheduleInfo, getDiningOrders, deliverRound } from '../apis/schedules'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function diningorders(props) {
	const { scheduleid, refetch } = props.route.params
	
	const [ownerId, setOwnerid] = useState(null)
	const [name, setName] = useState('')
	const [table, setTable] = useState('')
	const [timeStr, setTimestr] = useState('')
	const [rounds, setRounds] = useState([])
	const [loaded, setLoaded] = useState(false)
	const [showDisabledScreen, setShowdisabledscreen] = useState(false)

	const isMounted = useRef(null)
	
	const getTheScheduleInfo = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")

		getScheduleInfo(scheduleid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res && isMounted.current == true) {
					socket.emit("socket/business/login", ownerid, () => {
						const { name, table, time } = res.scheduleInfo
						const unix = parseInt(time)

						let date = new Date(unix).toString().split(" ")
						let timereserved = date[4].split(":")

						let hour = timereserved[0]
						let minute = timereserved[1]
						let period = hour > 12 ? "PM" : "AM"

						hour = hour > 12 ? hour - 12 : hour
						
						setOwnerid(ownerid)
						setTimestr(hour + ":" + minute + " " + period)
					})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				}
			})
	}
	const getTheOrders = () => {
		getDiningOrders(scheduleid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res && isMounted.current == true) {
					setRounds(res.rounds)
					setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				}
			})
	}
	const deliverTheRound = (roundid) => {
		let data = { ownerid: ownerId, scheduleid, roundid, type: "deliverRound" }

		deliverRound(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const newRounds = [...rounds]

					newRounds.forEach(function (round, index) {
						if (round.id == roundid) {
							newRounds.splice(index, 1)
						}
					})

					setRounds(newRounds)

					data = { ...data, receiver: res.receiver }
					socket.emit("socket/deliverRound", data)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				}
			})
	}

	const startWebsocket = () => {
		socket.on("updateRounds", data => {
			const receiver = "owner" + ownerId

			if (data.type == "deliverRound") {
				const newRounds = [...rounds]

				newRounds.forEach(function (round, index) {
					if (round.id == data.roundid) {
						newRounds.splice(index, 1)
					}
				})

				setRounds(newRounds)
			} else if (data.type == "sendOrders") {
				getTheOrders()
			}
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

		getTheScheduleInfo()
		getTheOrders()

		return () => isMounted.current = false
	}, [])

	useEffect(() => {
		startWebsocket()

		return () => {
			socket.off("updateRounds")
		}
	}, [rounds.length])

	return (
		<View style={{ paddingVertical: offsetPadding }}>
			<View style={style.box}>
				<TouchableOpacity style={style.back} onPress={() => {
					if (refetch) {
						refetch()
					}

					props.navigation.goBack()
				}}>
					<Text style={style.backHeader}>Back</Text>
				</TouchableOpacity>

				<Text style={style.boxHeader}>Order(s)</Text>

				{loaded ?
					rounds.length > 0 ? 
						<ScrollView style={{ height: screenHeight - 86 }}>
							{rounds.map(round => (
								<View style={style.round} key={round.key}>
									<View style={{ alignItems: 'center' }}>
										<TouchableOpacity style={style.roundDeliver} onPress={() => deliverTheRound(round.id)}>
											<Text style={style.roundDeliverHeader}>Ready to serve</Text>
										</TouchableOpacity>
									</View>

									{round.round.map(orders => (
										orders.orders.map(order => (
											<View style={style.order} key={order.key}>
												<View style={{ alignItems: 'center' }}>
													<View style={style.orderItem} key={order.key}>
														<View style={style.orderItemImageHolder}>
															<Image source={{ uri: logo_url + order.image }} style={style.orderItemImage}/>
														</View>
														<Text style={style.orderItemName}>{order.name}</Text>

														{order.options.map(option => (
															<Text key={option.key} style={style.itemInfo}>
																<Text style={{ fontWeight: 'bold' }}>{option.header}: </Text> 
																{option.selected}
																{option.type == 'percentage' && '%'}
															</Text>
														))}

														{order.others.map(other => (
															other.selected ? 
																<Text key={other.key} style={style.itemInfo}>
																	<Text style={{ fontWeight: 'bold' }}>{other.name}: </Text> 
																	<Text>{other.input}</Text>
																</Text>
															: null
														))}

														{order.sizes.map(size => (
															size.selected ? 
																<Text key={size.key} style={style.itemInfo}>
																	<Text style={{ fontWeight: 'bold' }}>Size: </Text> 
																	<Text>{size.name}</Text>
																</Text>
															: null
														))}

														<Text style={style.orderItemQuantity}>
															<Text style={{ fontWeight: 'bold' }}>Quantity: </Text>
															{order.callfor == 0 ? order.quantity : order.callfor}
														</Text>
													</View>
												</View>
											</View>
										))
									))}
								</View>
							))}
						</ScrollView>
						:
						<View style={{ alignItems: 'center', flexDirection: 'column', height: screenHeight - 86, justifyContent: 'space-around' }}>
							<Text style={{ fontWeight: 'bold' }}>No Order(s) Yet</Text>
						</View>
					:
					<ActivityIndicator size="large" marginTop={'50%'}/>
				}
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
	box: { height: '100%', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, marginTop: 20, marginHorizontal: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },
	boxHeader: { fontSize: 15, marginHorizontal: 20, textAlign: 'center' },

	roundTouch: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginLeft: 10, padding: 5, width: 120 },
	roundTouchHeader: {  },
	round: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5 },
	roundDeliver: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 5, padding: 5 },
	roundDeliverHeader: { textAlign: 'center' },
	order: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 5, margin: 5 },
	orderItems: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, overflow: 'hidden' },
	orderItem: { alignItems: 'center', marginVertical: 20, width: 200 },
	orderItemImageHolder: { borderRadius: 40, height: 80, overflow: 'hidden', width: 80 },
	orderItemImage: { height: 80, width: 80 },
	orderItemName: { fontWeight: 'bold' },
	orderItemQuantity: {  },
	orderItemPrice: {  },
	itemChange: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 20, padding: 5, width: 80 },
	itemChangeHeader: { fontSize: 13, textAlign: 'center' },
	orderersEdit: { flexDirection: 'row' },
	orderersEditHeader: { fontWeight: 'bold', marginRight: 10, marginTop: 7, textAlign: 'center' },
	orderersEditTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
	orderersEditTouchHeader: { },
	orderCallfor: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, width: '100%' },
	orderCallforHeader: { fontSize: 20, fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
	orderer: { alignItems: 'center', marginHorizontal: 10 },
	ordererProfile: { borderRadius: 25, height: 50, overflow: 'hidden', width: 50 },
	ordererUsername: { textAlign: 'center' },

	disabled: { backgroundColor: 'black', flexDirection: 'column', justifyContent: 'space-around', height: '100%', opacity: 0.8, width: '100%' },
	disabledContainer: { alignItems: 'center', width: '100%' },
	disabledHeader: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
	disabledClose: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 50, padding: 10 },
	disabledCloseHeader: {  }
})
