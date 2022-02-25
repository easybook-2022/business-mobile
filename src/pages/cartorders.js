import React, { useState, useEffect, useRef } from 'react'
import { SafeAreaView, ActivityIndicator, Platform, Dimensions, ScrollView, View, FlatList, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { socket, logo_url } from '../../assets/info'
import { seeUserOrders } from '../apis/schedules'
import { orderReady, orderDone } from '../apis/carts'

const { height, width } = Dimensions.get('window')
const wsize = p => {
  return width * (p / 100)
}
const hsize = p => {
  return height * (p / 100)
}

export default function Cartorders(props) {
	const { userid, ordernumber, refetch } = props.route.params

	const [ownerId, setOwnerid] = useState(null)
	const [orders, setOrders] = useState([])
	const [ready, setReady] = useState(false)
	const [loading, setLoading] = useState(false)
	const [showNoorders, setShownoorders] = useState(false)

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
					setReady(res.ready)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					alert("server error")
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
  const orderIsDone = async() => {
    const time = Date.now()
    const locationid = await AsyncStorage.getItem("locationid")
    let data = { userid, ordernumber, locationid, type: "orderDone", receiver: ["user" + userid] }

    setLoading(true)

    orderDone(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        } else {
          setLoading(false)
        }
      })
      .then((res) => {
        if (res) {
          socket.emit("socket/orderDone", data, () => {
            if (refetch) refetch()

            props.navigation.goBack()
          })
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

            setLoading(false)
          }
        } else {
          alert("server error")
        }
      })
  }

	useEffect(() => {
		isMounted.current = true

		getTheOrders()

		return () => isMounted.current = false
	}, [])

	return (
		<SafeAreaView style={[styles.cartorders, { opacity: loading ? 0.5 : 1 }]}>
			<View style={styles.box}>
				<FlatList
					data={orders}
					renderItem={({ item, index }) => 
						<View style={styles.item} key={item.key}>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
								{item.image && (
									<View style={styles.itemImageHolder}>
										<Image source={{ uri: logo_url + item.image }} style={styles.itemImage}/>
									</View>
								)}

								<View style={styles.itemInfos}>
									<Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.header}><Text style={{ fontWeight: 'bold' }}>Quantity:</Text> {item.quantity}</Text>
                  {item.cost && <Text style={styles.header}><Text style={{ fontWeight: 'bold' }}>Total cost:</Text> ${item.cost.toFixed(2)}</Text>}

									{item.options.map((option, infoindex) => (
										<Text key={option.key} style={styles.itemInfo}>
											<Text style={{ fontWeight: 'bold' }}>{option.header}: </Text> 
											{option.selected}
											{option.type == 'percentage' && '%'}
										</Text>
									))}

									{item.others.map((other, otherindex) => (
										other.selected ? 
											<Text key={other.key} style={styles.itemInfo}>
												<Text style={{ fontWeight: 'bold' }}>{other.name}: </Text>
												<Text>{other.input}</Text>
											</Text>
										: null
									))}

									{item.sizes.map((size, sizeindex) => (
										size.selected ? 
											<Text key={size.key} style={styles.itemInfo}>
												<Text style={{ fontWeight: 'bold' }}>Size: </Text>
												<Text>{size.name}</Text>
											</Text>
										: null
									))}
								</View>
							</View>

							{item.note ? 
                <View style={{ alignItems: 'center' }}>
  								<View style={styles.note}>
  									<Text style={styles.noteHeader}><Text style={{ fontWeight: 'bold' }}>Customer's note:</Text> {'\n' + item.note}</Text>
  								</View>
                </View>
							: null }
						</View>
					}
				/>

				<View style={{ alignItems: 'center' }}>
					{loading && <ActivityIndicator size="small"/>}
					{!ready ?
						<>
							<Text style={styles.readyHeader}>Order is ready?</Text>
							<TouchableOpacity style={styles.alert} disabled={loading} onPress={() => orderIsReady()}>
								<Text style={styles.alertHeader}>Alert customer(s)</Text>
							</TouchableOpacity>
						</>
            :
            <TouchableOpacity style={styles.alert} disabled={loading} onPress={() => orderIsDone()}>
              <Text style={styles.alertHeader}>Done</Text>
            </TouchableOpacity>
          }
				</View>
			</View>

			{showNoorders && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.requiredBoxContainer}>
						<View style={styles.requiredBox}>
							<View style={styles.requiredContainer}>
								<Text style={styles.requiredHeader}>Order has already been delivered or doesn't exist</Text>

								<View style={styles.requiredActions}>
									<TouchableOpacity style={styles.requiredAction} onPress={() => {
										if (refetch) refetch()
											
										setShownoorders(false)
										props.navigation.goBack()
									}}>
										<Text style={styles.requiredActionHeader}>Close</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</SafeAreaView>
				</Modal>
			)}
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	cartorders: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },

	item: { borderStyle: 'solid', borderBottomWidth: 0.5, borderTopWidth: 0.5, padding: 10 },
	itemImageHolder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: wsize(30) / 2, height: wsize(30), overflow: 'hidden', width: wsize(30) },
	itemImage: { height: wsize(30), width: wsize(30) },
	itemInfos: {  },
	itemName: { fontSize: wsize(5), marginBottom: 10 },
	itemInfo: { fontSize: wsize(4) },
	header: { fontSize: wsize(4) },
	note: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, marginVertical: 10, padding: 5, width: wsize(50) },
	noteHeader: { fontSize: wsize(4), textAlign: 'center' },
	orderersEdit: { flexDirection: 'row' },
	orderersEditHeader: { fontWeight: 'bold', marginRight: 10, marginTop: 7, textAlign: 'center' },
	orderersNumHolder: { backgroundColor: 'black', padding: 5 },
	orderersNumHeader: { color: 'white', fontWeight: 'bold' },

  readyHeader: { fontSize: wsize(4) },
	alert: { borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginVertical: 10, padding: 10, width: wsize(30) },
	alertHeader: { fontSize: wsize(4), textAlign: 'center' },

	requiredBoxContainer: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
	requiredBox: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	requiredContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	requiredHeader: { fontFamily: 'appFont', fontSize: wsize(5), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	requiredActions: { flexDirection: 'row', justifyContent: 'space-around' },
	requiredAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: wsize(30) },
	requiredActionHeader: { fontSize: wsize(4), textAlign: 'center' }
})
