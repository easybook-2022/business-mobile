import React, { useState, useEffect } from 'react'
import { 
  SafeAreaView, ActivityIndicator, Platform, Dimensions, 
  ScrollView, View, FlatList, Text, TextInput, Image, 
  TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet, Modal 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { socket, logo_url } from '../../assets/info'
import { getOrders } from '../apis/schedules'
import { orderDone, setWaitTime } from '../apis/carts'

import AntDesign from 'react-native-vector-icons/AntDesign'

import Loadingprogress from '../components/loadingprogress'

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}

export default function Cartorders(props) {
	const { userid, type, ordernumber, refetch } = props.route.params

	const [ownerId, setOwnerid] = useState(null)
	const [orders, setOrders] = useState([])
  const [waitTime, setWaittime] = useState('')
	const [ready, setReady] = useState(false)
	const [loading, setLoading] = useState(false)
	const [showNoorders, setShownoorders] = useState(false)
  const [showSetwaittime, setShowsetwaittime] = useState({ show: false, waitTime: '' })

	const getTheOrders = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { userid, locationid, ordernumber }

		getOrders(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setOwnerid(ownerid)
					setOrders(res.orders)
					setReady(res.ready)
          setWaittime(res.waitTime)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data
				}
			})
	}
  const orderIsDone = async() => {
    const time = Date.now()
    const locationid = await AsyncStorage.getItem("locationid")
    const data = { userid, ordernumber, locationid, type: "orderDone", receiver: ["user" + userid] }

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
          setLoading(false)

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
        }
      })
  }
  const setTheWaitTime = () => {
    const { waitTime } = showSetwaittime
    let data = { type: "setWaitTime", ordernumber, waitTime }

    setWaitTime(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          data = { ...data, receiver: res.receiver }
          socket.emit("socket/setWaitTime", data, () => {
            setShowsetwaittime({ ...showSetwaittime, show: false, waitTime: '' })
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }

	useEffect(() => {
		getTheOrders()
	}, [])

	return (
		<SafeAreaView style={[styles.cartorders, { opacity: loading ? 0.5 : 1 }]}>
			<View style={styles.box}>
				<FlatList
					data={orders}
					renderItem={({ item, index }) => 
						<View style={styles.item} key={item.key}>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
								<View style={styles.itemImageHolder}>
                  {(item.image && item.image.name != "") && <Image source={{ uri: logo_url + item.image.name }} style={resizePhoto(item.image, wsize(30))}/>}
                </View>

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
          <View style={styles.row}>
    				<View style={styles.actions}>
              {type == "restaurant" && (
                <TouchableOpacity style={styles.action} disabled={loading} onPress={() => setShowsetwaittime({ ...showSetwaittime, show: true, waitTime: '' })}>
                  <Text style={styles.actionHeader}>Set wait time</Text>
                </TouchableOpacity>
              )}
                
              <TouchableOpacity style={styles.action} disabled={loading} onPress={() => orderIsDone()}>
                <Text style={styles.actionHeader}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
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
      {showSetwaittime.show && (
        <Modal transparent={true}>
          <SafeAreaView style={styles.waitTimeBox}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <View style={styles.waitTimeContainer}>
                <AntDesign name="closecircleo" size={wsize(7)} onPress={() => setShowsetwaittime({ ...showSetwaittime, show: false })}/>

                <Text style={styles.waitTimeHeader}>How long will be the wait ?</Text>

                <View style={styles.row}>
                  <TextInput 
                    style={styles.waitTimeInput} 
                    onChangeText={(waitTime) => setShowsetwaittime({ ...showSetwaittime, waitTime })}
                    keyboardType="numeric"
                    value={showSetwaittime.waitTime}
                  />
                  <View style={styles.column}><Text style={{ fontSize: 15, fontWeight: 'bold', marginLeft: 10 }}>mins</Text></View>
                </View>

                <View style={styles.waitTimeOptions}>
                  <View style={styles.row}>
                    {[...Array(3)].map((_, index) => (
                      <TouchableOpacity key={index.toString()} style={styles.waitTimeOption} onPress={() => setShowsetwaittime({ ...showSetwaittime, waitTime: ((index + 1) * 5).toString() })}>
                        <Text style={styles.waitTimeOptionHeader}>{(index + 1) * 5} mins</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.row}>
                    {[...Array(3)].map((_, index) => (
                      <TouchableOpacity key={index.toString()} style={styles.waitTimeOption} onPress={() => setShowsetwaittime({ ...showSetwaittime, waitTime: ((index + 4) * 5).toString() })}>
                        <Text style={styles.waitTimeOptionHeader}>{(index + 4) * 5} mins</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.waitTimeActions}>
                  <TouchableOpacity style={styles.waitTimeAction} onPress={() => setTheWaitTime()}>
                    <Text style={styles.waitTimeActionHeader}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </SafeAreaView>
        </Modal>
      )}
      {loading && <Loadingprogress/>}
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	cartorders: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },

	item: { borderStyle: 'solid', borderBottomWidth: 0.5, borderTopWidth: 0.5, padding: 10 },
	itemImageHolder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: wsize(30) / 2, height: wsize(30), overflow: 'hidden' },
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
  actions: { flexDirection: 'row', justifyContent: 'space-around' },
	action: { borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, margin: 10, padding: 10, width: wsize(30) },
	actionHeader: { fontSize: wsize(4), textAlign: 'center' },

	requiredBoxContainer: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
	requiredBox: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	requiredContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	requiredHeader: { fontFamily: 'appFont', fontSize: wsize(5), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	requiredActions: { flexDirection: 'row', justifyContent: 'space-around' },
	requiredAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: wsize(30) },
	requiredActionHeader: { fontSize: wsize(4), textAlign: 'center' },

  waitTimeBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  waitTimeContainer: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-between', paddingVertical: 10, width: '80%' },
  waitTimeHeader: { fontSize: 20, fontWeight: 'bold', paddingVertical: 10, textAlign: 'center' },
  waitTimeInput: { borderRadius: 2, borderStyle: 'solid', borderWidth: 2, fontSize: 20, padding: 2, textAlign: 'center', width: '30%' },
  waitTimeOptions: {  },
  waitTimeOption: { borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 10},
  waitTimeOptionHeader: { fontSize: 15, textAlign: 'center' },
  waitTimeActions: { flexDirection: 'row' },
  waitTimeAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: wsize(30) },
  waitTimeActionHeader: { fontSize: wsize(5), textAlign: 'center' },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
})
