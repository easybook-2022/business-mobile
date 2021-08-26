import React, { useState, useEffect } from 'react'
import { AsyncStorage, ActivityIndicator, Dimensions, ScrollView, View, FlatList, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Constants from 'expo-constants';
import { logo_url } from '../../assets/info'
import { seeUserOrders, receivePayment } from '../apis/schedules'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function cartorders(props) {
	const { userid, ordernumber, refetch } = props.route.params

	const [orders, setOrders] = useState([])
	const [totalCost, setTotalcost] = useState('')
	const [loading, setLoading] = useState(false)
	const [showBankaccountrequired, setShowbankaccountrequired] = useState(false)
	const [showPaymentconfirm, setShowpaymentconfirm] = useState(false)

	const getTheOrders = async() => {
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { userid, locationid, ordernumber }

		seeUserOrders(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setOrders(res.orders)
					setTotalcost(res.totalcost)
				}
			})
	}
	const receiveThePayment = async() => {
		const time = Date.now()
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { userid, ordernumber, locationid, time }

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
				if (res) setShowpaymentconfirm(true)
			})
			.catch((err) => {
				if (err.response.status == 400) {
					if (err.response.data.status) {
						const status = err.response.data.status

						switch (status) {
							case "bankaccountrequired":
								setShowbankaccountrequired(true)

								break
							default:
						}
					}
				}
			})
	}

	useEffect(() => {
		getTheOrders()
	}, [])

	return (
		<View style={style.cartorders}>
			<View style={{ paddingVertical: offsetPadding }}>
				<View style={[style.box, { opacity: loading ? 0.5 : 1 }]}>
					<TouchableOpacity style={style.back} onPress={() => {
						refetch()
						props.navigation.goBack()
					}}>
						<Text style={style.backHeader}>Back</Text>
					</TouchableOpacity>

					<Text style={style.boxHeader}><Text style={{ fontFamily: 'Arial', fontWeight: '100' }}>#{ordernumber}</Text> Order(s)</Text>

					<FlatList
						data={orders}
						renderItem={({ item, index }) => 
							<View style={style.item} key={item.key}>
								<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
									<View style={style.itemImageHolder}>
										<Image source={{ uri: logo_url + item.image }} style={style.itemImage}/>
									</View>
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
										<Text style={style.header}><Text style={{ fontWeight: 'bold' }}>Cost:</Text> ${item.cost.toFixed(2)}</Text>
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
						<Text>Order is delivered ?</Text>
						<TouchableOpacity style={style.receivePayment} disabled={loading} onPress={() => receiveThePayment()}>
							<Text style={style.receivePaymentHeader}>Receive payment of $ {totalCost}</Text>
						</TouchableOpacity>
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

				{showPaymentconfirm && (
					<Modal transparent={true}>
						<View style={style.confirmBoxContainer}>
							<View style={style.confirmBox}>
								<View style={style.confirmContainer}>
									<Text style={style.confirmHeader}>
										Yay. Congrats on your delivery and payment reception. Good job
									</Text>

									<View style={style.confirmActions}>
										<TouchableOpacity style={style.confirmAction} onPress={() => {
											refetch()
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
		</View>
	)
}

const style = StyleSheet.create({
	cartorders: { backgroundColor: 'white' },
	box: { backgroundColor: '#EAEAEA', height: screenHeight, width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, height: 30, margin: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },
	boxHeader: { fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', marginTop: 10, textAlign: 'center' },

	item: { borderStyle: 'solid', borderBottomWidth: 0.5, borderTopWidth: 0.5, padding: 10 },
	itemImageHolder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 35, height: 70, overflow: 'hidden', width: 70 },
	itemImage: { height: 70, width: 70 },
	itemInfos: {  },
	itemName: { fontSize: 20, marginBottom: 10 },
	itemInfo: { fontSize: 15 },
	header: { fontSize: 15 },
	note: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, padding: 5 },
	noteHeader: { textAlign: 'center' },
	orderersEdit: { flexDirection: 'row' },
	orderersEditHeader: { fontWeight: 'bold', marginRight: 10, marginTop: 7, textAlign: 'center' },
	orderersNumHolder: { backgroundColor: 'black', padding: 5 },
	orderersNumHeader: { color: 'white', fontWeight: 'bold' },

	receivePayment: { borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginVertical: 20, padding: 10 },
	receivePaymentHeader: { },

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
