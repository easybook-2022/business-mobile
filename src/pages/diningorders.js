import React, { useState, useEffect } from 'react'
import { AsyncStorage, ActivityIndicator, Dimensions, ScrollView, View, FlatList, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Constants from 'expo-constants';
import { logo_url } from '../../assets/info'
import { getScheduleInfo, getDiningOrders, deliverRound } from '../apis/schedules'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function diningorders(props) {
	const { scheduleid, refetch } = props.route.params
	
	const [name, setName] = useState('')
	const [table, setTable] = useState('')
	const [timeStr, setTimestr] = useState('')
	const [rounds, setRounds] = useState([])
	const [loaded, setLoaded] = useState(false)
	
	const getTheScheduleInfo = () => {
		getScheduleInfo(scheduleid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { name, table, time } = res.scheduleInfo
					const unix = parseInt(time)

					let date = new Date(unix).toString().split(" ")
					let timereserved = date[4].split(":")

					let hour = timereserved[0]
					let minute = timereserved[1]
					let period = hour > 12 ? "PM" : "AM"

					hour = hour > 12 ? hour - 12 : hour

					setTimestr(hour + ":" + minute + " " + period)
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
				if (res) {
					setRounds(res.rounds)
					setLoaded(true)
				}
			})
	}
	const deliverTheRound = (roundid) => {
		const data = { scheduleid, roundid }

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
				}
			})
	}

	useEffect(() => {
		getTheScheduleInfo()
		getTheOrders()
	}, [])

	return (
		<View style={{ paddingVertical: offsetPadding }}>
			<View style={style.box}>
				<TouchableOpacity style={style.back} onPress={() => {
					refetch()
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
		</View>
	)
}

const style = StyleSheet.create({
	box: { height: '100%', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, height: 30, marginTop: 20, marginHorizontal: 20, padding: 5, width: 100 },
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
})
