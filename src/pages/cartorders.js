import React, { useState, useEffect, useRef } from 'react'
import { ActivityIndicator, Platform, Dimensions, ScrollView, View, FlatList, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { socket, logo_url } from '../../assets/info'
import { seeUserOrders } from '../apis/schedules'
import { orderReady, receivePayment } from '../apis/carts'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const defaultFont = Platform.OS == 'ios' ? 'Arial' : 'normal'

const fsize = p => {
	return width * p
}

export default function cartorders(props) {
	const { userid, ordernumber, refetch } = props.route.params

	const [ownerId, setOwnerid] = useState(null)
	const [orders, setOrders] = useState([])
	const [totalCost, setTotalcost] = useState({ price: 0.00, pst: 0.00, hst: 0.00, cost: 0.00, nofee: 0.00, fee: 0.00 })
	const [ready, setReady] = useState(false)
	const [loading, setLoading] = useState(false)
	const [showBankaccountrequired, setShowbankaccountrequired] = useState(false)
	const [showNoorders, setShownoorders] = useState(false)
	const [showPaymentconfirm, setShowpaymentconfirm] = useState(false)

	const isMounted = useRef(null)
	
	const getTheOrders = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { userid, locationid, ordernumber }

		seeUserOrders(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res && isMounted.current == true) {
					setOwnerid(ownerid)
					setOrders(res.orders)
					setTotalcost(res.totalcost)
					setReady(res.ready)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					alert("an error has occurred in server")
				}
			})
	}
	const orderIsReady = async() => {
		const locationid = await AsyncStorage.getItem("locationid")
		let data = { userid, locationid, ordernumber, type: "orderReady", receiver: ["user" + userid] }

		orderReady(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					socket.emit("socket/orderReady", data, () => setReady(true))
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					if (err.response.data.status) {
						const { errormsg, status } = err.response.data

						switch (status) {
							case "nonexist":
								setShownoorders(true)

								break
							default:
						}
					}
				} else {
					alert("an error has occurred in server")
				}
			})
	}
	const receiveThePayment = async() => {
		const time = Date.now()
		const locationid = await AsyncStorage.getItem("locationid")
		let data = { userid, ordernumber, locationid, time, type: "productPurchased", receiver: ["user" + userid] }

		setLoading(true)

		receivePayment(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				} else {
					setLoading(false)
				}
			})
			.then((res) => {
				if (res) {
					socket.emit("socket/productPurchased", data, () => setShowpaymentconfirm(true))
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					if (err.response.data.status) {
						const { errormsg, status } = err.response.data

						switch (status) {
							case "bankaccountrequired":
								setShowbankaccountrequired(true)

								break
							case "nonexist":
								setShownoorders(true)

								break
							default:
						}

						setLoading(false)
					}
				} else {
					alert("an error has occurred in server")
				}
			})
	}

	useEffect(() => {
		isMounted.current = true

		getTheOrders()

		return () => isMounted.current = false
	}, [])

	return (
		<View style={[style.cartorders, { opacity: loading ? 0.5 : 1 }]}>
			<View style={style.box}>
				<FlatList
					data={orders}
					renderItem={({ item, index }) => 
						<View style={style.item} key={item.key}>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
								{item.image && (
									<View style={style.itemImageHolder}>
										<Image source={{ uri: logo_url + item.image }} style={style.itemImage}/>
									</View>
								)}
									
								<View style={style.itemInfos}>
									<Text style={style.itemName}>{item.name}</Text>

									{item.options.map((option, infoindex) => (
										<Text key={option.key} style={style.itemInfo}>
											<Text style={{ fontWeight: 'bold' }}>{option.header}: </Text> 
											{option.selected}
											{option.type == 'percentage' && '%'}
										</Text>
									))}

									{item.others.map((other, otherindex) => (
										other.selected ? 
											<Text key={other.key} style={style.itemInfo}>
												<Text style={{ fontWeight: 'bold' }}>{other.name}: </Text>
												<Text>{other.input}</Text>
											</Text>
										: null
									))}

									{item.sizes.map((size, sizeindex) => (
										size.selected ? 
											<Text key={size.key} style={style.itemInfo}>
												<Text style={{ fontWeight: 'bold' }}>Size: </Text>
												<Text>{size.name}</Text>
											</Text>
										: null
									))}
								</View>
								<View>
									<Text style={style.header}><Text style={{ fontWeight: 'bold' }}>Quantity:</Text> {item.quantity}</Text>

									{item.productId ? 
										<>
											<Text style={style.header}><Text style={{ fontWeight: 'bold' }}>Price:</Text> ${item.price.toFixed(2)}</Text>
											{item.fee > 0 && <Text style={style.header}><Text style={{ fontWeight: 'bold' }}>E-pay fee:</Text> ${item.fee.toFixed(2)}</Text>}
											{item.pst > 0 && <Text style={style.header}><Text style={{ fontWeight: 'bold' }}>PST:</Text> ${item.pst.toFixed(2)}</Text>}
											{item.hst > 0 && <Text style={style.header}><Text style={{ fontWeight: 'bold' }}>HST:</Text> ${item.hst.toFixed(2)}</Text>}
											<Text style={style.header}><Text style={{ fontWeight: 'bold' }}>Total Cost:</Text> ${item.totalcost.toFixed(2)}</Text>
										</>
										:
										<>
										</>
									}
								</View>
							</View>

							{item.note ? 
								<View style={style.note}>
									<Text style={style.noteHeader}><Text style={{ fontWeight: 'bold' }}>Customer's note:</Text> {'\n' + item.note}</Text>
								</View>
							: null }

							{item.orderers > 0 && (
								<>
									<View style={{ alignItems: 'center' }}>
										<View style={style.orderersEdit}>
											<Text style={style.orderersEditHeader}>Calling for</Text>
											<View style={style.orderersNumHolder}>
												<Text style={style.orderersNumHeader}>{item.orderers} {item.orderers == 1 ? 'person' : 'people'}</Text>
											</View>
										</View>
									</View>
								</>
							)}
						</View>
					}
				/>

				<View style={{ alignItems: 'center' }}>
					{loading && <ActivityIndicator size="small"/>}
					{!ready ? 
						<>
							<Text>Total cost: ${totalCost.cost.toFixed(2)}</Text>
							<Text>Order is ready?</Text>
							<TouchableOpacity style={style.receivePayment} disabled={loading} onPress={() => orderIsReady()}>
								<Text style={style.receivePaymentHeader}>Alert customer(s)</Text>
							</TouchableOpacity>
						</>
						:
						<TouchableOpacity style={style.receivePayment} disabled={loading} onPress={() => receiveThePayment()}>
							<Text style={style.receivePaymentHeader}>Receive payment of $ {totalCost.cost.toFixed(2)}</Text>
						</TouchableOpacity>
					}
				</View>
			</View>

			{showBankaccountrequired && (
				<Modal transparent={true}>
					<View style={style.requiredBoxContainer}>
						<View style={style.requiredBox}>
							<View style={style.requiredContainer}>
								<Text style={style.requiredHeader}>
									You need to provide a bank account to 
									receive your payment
								</Text>

								<View style={style.requiredActions}>
									<TouchableOpacity style={style.requiredAction} onPress={() => setShowbankaccountrequired(false)}>
										<Text style={style.requiredActionHeader}>Close</Text>
									</TouchableOpacity>
									<TouchableOpacity style={style.requiredAction} onPress={() => {
										setShowbankaccountrequired(false)
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
			{showNoorders && (
				<Modal transparent={true}>
					<View style={style.requiredBoxContainer}>
						<View style={style.requiredBox}>
							<View style={style.requiredContainer}>
								<Text style={style.requiredHeader}>Order has already been delivered or doesn't exist</Text>

								<View style={style.requiredActions}>
									<TouchableOpacity style={style.requiredAction} onPress={() => {
										if (refetch) refetch()
											
										setShownoorders(false)
										props.navigation.goBack()
									}}>
										<Text style={style.requiredActionHeader}>Close</Text>
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
									You have received a total payment of $ {totalCost.price.toFixed(2)}
									{'\n\n\n'}
									Good Job
								</Text>

								<View style={style.confirmActions}>
									<TouchableOpacity style={style.confirmAction} onPress={() => {
										if (refetch) refetch()

										setShowpaymentconfirm(false)
										props.navigation.goBack()
									}}>
										<Text style={style.confirmActionHeader}>Ok</Text>
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
	cartorders: { backgroundColor: 'white', height: '100%', paddingBottom: offsetPadding, width: '100%' },
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },

	item: { borderStyle: 'solid', borderBottomWidth: 0.5, borderTopWidth: 0.5, padding: 10 },
	itemImageHolder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 35, height: 70, overflow: 'hidden', width: 70 },
	itemImage: { height: 70, width: 70 },
	itemInfos: {  },
	itemName: { fontSize: fsize(0.05), marginBottom: 10 },
	itemInfo: { fontSize: fsize(0.04) },
	header: { fontSize: fsize(0.04) },
	note: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, marginVertical: 10, padding: 5 },
	noteHeader: { textAlign: 'center' },
	orderersEdit: { flexDirection: 'row' },
	orderersEditHeader: { fontWeight: 'bold', marginRight: 10, marginTop: 7, textAlign: 'center' },
	orderersNumHolder: { backgroundColor: 'black', padding: 5 },
	orderersNumHeader: { color: 'white', fontWeight: 'bold' },

	receivePayment: { borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginVertical: 10, padding: 10 },
	receivePaymentHeader: { },

	requiredBoxContainer: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
	requiredBox: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', paddingVertical: offsetPadding, width: '100%' },
	requiredContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	requiredHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	requiredActions: { flexDirection: 'row', justifyContent: 'space-around' },
	requiredAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	requiredActionHeader: { },

	confirmBoxContainer: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
	confirmBox: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', paddingVertical: offsetPadding, width: '100%' },
	confirmContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	confirmHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	confirmActions: { flexDirection: 'row', justifyContent: 'space-around' },
	confirmAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	confirmActionHeader: { },
})
