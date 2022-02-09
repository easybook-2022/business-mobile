import React, { useState, useEffect, useRef } from 'react'
import { SafeAreaView, ActivityIndicator, Dimensions, ScrollView, View, FlatList, Text, TextInput, Image, TouchableOpacity, Keyboard, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { socket, logo_url } from '../../assets/info'
import { getMenus } from '../apis/menus'
import { getScheduleInfo, getDiningOrders, serveRound, setOrderPrice } from '../apis/schedules'

const { height, width } = Dimensions.get('window')
const wsize = p => {
  return width * (p / 100)
}
const hsize = p => {
  return height * (p / 100)
}

export default function Diningorders(props) {
	const { scheduleid, refetch } = props.route.params
	
	const [ownerId, setOwnerid] = useState(null)
	const [name, setName] = useState('')
	const [table, setTable] = useState('')
	const [timeStr, setTimestr] = useState('')
	const [rounds, setRounds] = useState([])
	const [loaded, setLoaded] = useState(false)
	const [showDisabledScreen, setShowdisabledscreen] = useState(false)
  const [orderPrice, setOrderprice] = useState({ show: false, indexes: {}, id: -1, name: '', price: 0.00, errorMsg: "" })
  const [showErrorbox, setShowerrorbox] = useState({ show: false, errorMsg: "" })

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
					
				} else {
					alert("an error has occurred in server")
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
					
				} else {
					alert("an error has occurred in server")
				}
			})
	}
	const serveTheRound = (roundid) => {
		let data = { ownerid: ownerId, scheduleid, roundid, type: "serveRound" }

		serveRound(data)
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
					socket.emit("socket/serveRound", data)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
				  const { errormsg, status } = err.response.data

          switch (status) {
            case "unsetprices":
              setShowerrorbox({ ...showErrorbox, show: true, errorMsg: "Please set the price for each order" })

              break;
            default:
          }
				} else {
					alert("an error has occurred in server")
				}
			})
	}
  const setTheOrderPrice = async(roundIndex, ordersIndex, orderIndex, id) => {
    if (!orderPrice.show) {
      const { name } = rounds[roundIndex].round[ordersIndex].orders[orderIndex]
      const locationid = await AsyncStorage.getItem("locationid")

      getMenus(locationid)
        .then((res) => {
          if (res.status == 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            setOrderprice({ ...orderPrice, show: true, indexes: { roundIndex, ordersIndex, orderIndex }, id, name, menus: res.menus })
          }
        })
        .catch((err) => {
          if (err.response && err.response.status == 400) {

          } else {
            alert("an error has occurred in server")
          }
        })
    } else {
      const { indexes, id, name, price } = orderPrice
      let data = { orderid: id, name, price, type: "setOrderPrice" }

      if (price) {
        setOrderPrice(data)
          .then((res) => {
            if (res.status == 200) {
              return res.data
            }
          })
          .then((res) => {
            if (res) {
              data = { ...data, indexes, receiver: res.receiver }
              socket.emit("socket/setOrderPrice", data, () => {
                const newRounds = [...rounds]

                newRounds.forEach(function (round, roundIndex) {
                  round.round.forEach(function (orders, ordersIndex) {
                    orders.orders.forEach(function (order, orderIndex) {
                      if (indexes.roundIndex == roundIndex && indexes.ordersIndex == ordersIndex && indexes.orderIndex == orderIndex) {
                        order.priceUnset = false
                      }
                    })
                  })
                })

                setRounds(newRounds)
                setOrderprice({ ...orderPrice, show: false })
              })
            }
          })
          .catch((err) => {
            if (err.response && err.response.status == 400) {

            }
          })
      } else {
        setOrderprice({ ...orderPrice, errorMsg: "Please enter a price" })
      }
    }
  }

	const startWebsocket = () => {
		socket.on("updateRounds", data => {
			const receiver = "owner" + ownerId

			if (data.type == "serveRound") {
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
		<SafeAreaView style={styles.diningorders}>
			<View style={styles.box}>
				{loaded ?
					rounds.length > 0 ? 
						<ScrollView style={{ height: '100%' }}>
							{rounds.map((round, roundIndex) => (
								<View style={styles.round} key={round.key}>
									<View style={{ alignItems: 'center' }}>
										<TouchableOpacity style={styles.roundDeliver} onPress={() => serveTheRound(round.id)}>
											<Text style={styles.roundDeliverHeader}>Ready to serve</Text>
										</TouchableOpacity>
									</View>

									{round.round.map((orders, ordersIndex) => (
										orders.orders.map((order, orderIndex) => (
											<View style={styles.order} key={order.key}>
												<View style={{ alignItems: 'center' }}>
													<View style={styles.orderItem} key={order.key}>
														{order.image ?
                              <View style={styles.orderItemImageHolder}>
                                <Image source={{ uri: logo_url + order.image }} style={styles.orderItemImage}/>
                              </View>
                            : null}

                            <Text style={styles.orderItemHeader}>{order.name}</Text>

                            {order.options.map(option => (
                              <Text key={option.key} style={styles.itemInfo}>
                                <Text style={{ fontWeight: 'bold' }}>{option.header}: </Text> 
                                {option.selected}
                                {option.type == 'percentage' && '%'}
                              </Text>
                            ))}

                            {order.others.map(other => (
                              other.selected ? 
                                <Text key={other.key} style={styles.itemInfo}>
                                  <Text style={{ fontWeight: 'bold' }}>{other.name}: </Text> 
                                  <Text>{other.input}</Text>
                                </Text>
                              : null
                            ))}

                            {order.sizes.map(size => (
                              size.selected ? 
                                <Text key={size.key} style={styles.itemInfo}>
                                  <Text style={{ fontWeight: 'bold' }}>Size: </Text> 
                                  <Text>{size.name}</Text>
                                </Text>
                              : null
                            ))}

                            <Text style={styles.orderItemHeader}>
                              <Text style={{ fontWeight: 'bold' }}>Quantity: </Text>
                              {order.callfor == 0 ? order.quantity : order.callfor}
                            </Text>

                            {order.priceUnset == true && (
                              <TouchableOpacity style={styles.orderItemSetPrice} onPress={() => setTheOrderPrice(roundIndex, ordersIndex, orderIndex, order.id)}>
                                <Text style={styles.orderItemSetPriceHeader}>Set price</Text>
                              </TouchableOpacity>
                            )}
													</View>
												</View>
											</View>
										))
									))}
								</View>
							))}
						</ScrollView>
						:
						<View style={styles.noResult}>
							<Text style={styles.noResultHeader}>No Order(s) Yet</Text>
						</View>
					:
					<View style={styles.loading}>
            <ActivityIndicator color="black" size="large"/>
          </View>
				}
			</View>

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
      {orderPrice.show && (
        <Modal transparent={true}>
          <SafeAreaView style={styles.orderInfoContainer}>
            <View style={styles.orderInfoBox}>
              <Text style={styles.orderInfoHeader}>Enter the price of {orderPrice.name} for customer to pay:</Text>

              <TextInput 
                placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="example: 34.99"
                style={styles.orderInfoInput}
                onChangeText={(price) => {
                  let newPrice = price.toString()

                  if (newPrice.includes(".") && newPrice.split(".")[1].length == 2) {
                    Keyboard.dismiss()
                  }

                  setOrderprice({ ...orderPrice, price, errorMsg: "" })
                }}
                keyboardType="numeric" autoCorrect={false} autoCapitalize="none"
              />

              <Text style={styles.errorMsg}>{orderPrice.errorMsg}</Text>

              <View style={{ alignItems: 'center' }}>
                <View style={styles.orderInfoActions}>
                  <TouchableOpacity style={styles.orderInfoAction} onPress={() => setOrderprice({ ...orderPrice, show: false })}>
                    <Text style={styles.orderInfoActionHeader}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.orderInfoAction} onPress={() => setTheOrderPrice()}>
                    <Text style={styles.orderInfoActionHeader}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={styles.orderInfoMenuContainer}>
              <FlatList
                style={{ marginTop: 10 }}
                data={orderPrice.menus}
                renderItem={({ item, index }) => 
                  item.row.map(info => (
                    info.photo && <Image key={info.key} style={{ height, width }} source={{ uri: logo_url + info.photo }}/>
                  ))
                }
              />
            </View>
          </SafeAreaView>
        </Modal>
      )}
      {showErrorbox.show && (
        <Modal transparent={true}>
          <SafeAreaView style={styles.errorBox}>
            <View style={styles.errorContainer}>
              <Text style={styles.errorHeader}>{showErrorbox.errorMsg}</Text>

              <View style={styles.errorActions}>
                <TouchableOpacity style={styles.errorAction} onPress={() => setShowerrorbox({ ...showErrorbox, show: false, errorMsg: "" })}>
                  <Text style={styles.errorActionHeader}>Ok</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      )}
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	diningorders: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { height: '100%', width: '100%' },

	roundTouch: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginLeft: 10, padding: 5, width: 120 },
	roundTouchHeader: {  },
	round: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5 },
	roundDeliver: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 5, padding: 5 },
	roundDeliverHeader: { fontSize: wsize(5), textAlign: 'center' },
	order: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 5, margin: 5 },
	orderItems: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, overflow: 'hidden' },
	orderItem: { alignItems: 'center', marginVertical: 20, width: 200 },
	orderItemImageHolder: { borderRadius: wsize(30) / 2, height: wsize(30), overflow: 'hidden', width: wsize(30) },
	orderItemImage: { height: wsize(30), width: wsize(30) },
	orderItemHeader: { fontSize: wsize(5), fontWeight: 'bold' },
  orderItemSetPrice: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: wsize(30) },
  orderItemSetPriceHeader: { fontSize: wsize(4), textAlign: 'center' },
	itemChange: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 20, padding: 5, width: 80 },
	itemChangeHeader: { fontSize: wsize(3), textAlign: 'center' },
	orderersEdit: { flexDirection: 'row' },
	orderersEditHeader: { fontWeight: 'bold', marginRight: 10, marginTop: 7, textAlign: 'center' },
	orderersEditTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
	orderersEditTouchHeader: { },
	orderCallfor: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, width: '100%' },
	orderCallforHeader: { fontSize: wsize(5), fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
	orderer: { alignItems: 'center', marginHorizontal: 10 },
	ordererProfile: { borderRadius: 25, height: 50, overflow: 'hidden', width: 50 },
	ordererUsername: { textAlign: 'center' },

	disabled: { backgroundColor: 'black', flexDirection: 'column', justifyContent: 'space-around', height: '100%', opacity: 0.8, width: '100%' },
	disabledContainer: { alignItems: 'center', width: '100%' },
	disabledHeader: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
	disabledClose: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 50, padding: 10 },
	disabledCloseHeader: {  },

  orderInfoContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  orderInfoBox: { backgroundColor: 'white', flexDirection: 'column', height: '40%', justifyContent: 'space-around', width: '95%' },
  orderInfoHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
  orderInfoInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), margin: '5%', padding: 10, width: '90%' },
  orderInfoActions: { flexDirection: 'row', justifyContent: 'space-around' },
  orderInfoAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: wsize(30) },
  orderInfoActionHeader: { fontSize: wsize(5), textAlign: 'center' },
  orderInfoMenuContainer: { height: '60%', width: '95%' },

  errorBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)', flexDirection: 'column', justifyContent: 'space-around', height: '100%', width: '100%' },
  errorContainer: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '30%', justifyContent: 'space-between', paddingVertical: 20, width: '80%' },
  errorHeader: { color: 'black', fontWeight: 'bold', paddingHorizontal: 10, textAlign: 'center' },
  errorActions: { flexDirection: 'row', justifyContent: 'space-around' },
  errorAction: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 10 },
  errorActionHeader: { color: 'black', textAlign: 'center' },

  loading: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  noResult: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  noResultHeader: { fontSize: wsize(4), fontWeight: 'bold' }
})
