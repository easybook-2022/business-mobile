import React, { useEffect, useState } from 'react'
import { SafeAreaView, Platform, ScrollView, ActivityIndicator, Dimensions, View, FlatList, Image, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet, Modal } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { CommonActions } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system'
import * as ImageManipulator from 'expo-image-manipulator'
import { test, socket, logo_url, displayTime } from '../../assets/info'
import { updateNotificationToken } from '../apis/owners'
import { fetchNumAppointments, fetchNumCartOrderers, getLocationProfile, changeLocationState, setLocationPublic } from '../apis/locations'
import { getMenus, removeMenu, addNewMenu } from '../apis/menus'
import { cancelSchedule, doneService, getAppointments, getCartOrderers } from '../apis/schedules'
import { removeProduct } from '../apis/products'

import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const defaultFont = Platform.OS == 'ios' ? 'Arial' : 'normal'
const wsize = p => {
  return width * (p / 100)
}
const hsize = p => {
  return height * (p / 100)
}

export default function Main(props) {
	const firstTime = props.route.params ? 
    props.route.params.firstTime ?
      true 
      : 
      false 
    : 
    false

	const [notificationPermission, setNotificationpermission] = useState(null);
	const [ownerId, setOwnerid] = useState(null)
	const [storeIcon, setStoreicon] = useState('')
	const [storeName, setStorename] = useState('')
	const [locationType, setLocationtype] = useState('')
	const [locationListed, setLocationlisted] = useState('')

	const [appointments, setAppointments] = useState([])
	const [numAppointments, setNumappointments] = useState(0)

	const [cartOrderers, setCartorderers] = useState([])
	const [numCartorderers, setNumcartorderers] = useState(0)

  const [loaded, setLoaded] = useState(false)

	const [viewType, setViewtype] = useState('')
	const [cancelInfo, setCancelinfo] = useState({ show: false, type: "", requestType: "", reason: "", id: 0, index: 0 })

	const [showMenurequired, setShowmenurequired] = useState(false)
	const [showDisabledscreen, setShowdisabledscreen] = useState(false)
	const [showFirsttime, setShowfirsttime] = useState({ show: firstTime, step: 0 })

	const getNotificationPermission = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const { status } = await Notifications.getPermissionsAsync()

		if (status == "granted") {
			setNotificationpermission(true)

			const { data } = await Notifications.getExpoPushTokenAsync({
				experienceId: "@robogram/easygo-business"
			})

			if (ownerid != null) {
				updateNotificationToken({ ownerid, token: data })
					.then((res) => {
						if (res.status == 200) {
							return res.data
						}
					})
					.then((res) => {
						if (res) {

						}
					})
					.catch((err) => {
						if (err.response && err.response.status == 400) {

						} else {
							alert("server error")
						}
					})
			}
		} else {
			const info = await Notifications.requestPermissionsAsync()

			if (info.status == "granted") {
				setNotificationpermission(true)

				const { data } = await Notifications.getExpoPushTokenAsync({
					experienceId: "@robogram/easygo-business"
				})

				if (userid != null) {
					updateNotificationToken({ userid, token: data })
						.then((res) => {
							if (res.status == 200) {
								return res.data
							}
						})
						.then((res) => {
							if (res) {

							}
						})
						.catch((err) => {
							if (err.response && err.response.status == 400) {
								
							} else {
								alert("server error")
							}
						})
				}
			}
		}
	}
	
	const fetchTheNumAppointments = async() => {
    const ownerid = await AsyncStorage.getItem("ownerid")

		fetchNumAppointments(ownerid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) setNumappointments(res.numAppointments)
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          
        } else {
          alert("server error")
        }
      })
	}
	const fetchTheNumCartOrderers = async() => {
		const locationid = await AsyncStorage.getItem("locationid")

		fetchNumCartOrderers(locationid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) setNumcartorderers(res.numCartorderers)
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {

				} else {
					alert("server error")
				}
			})
	}

	const getTheLocationProfile = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { locationid }

		getLocationProfile(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { name, fullAddress, logo, type, listed } = res.info

					socket.emit("socket/business/login", ownerid, () => {
						setOwnerid(ownerid)
						setStorename(name)
						setStoreicon(logo)
						setLocationtype(type)
						setLocationlisted(listed)

						if (type == 'restaurant') {
							fetchTheNumCartOrderers()
              getAllCartOrderers()
						} else {
							fetchTheNumAppointments()
							getAllAppointments()
						}
					})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					alert("server error")
				}
			})
	}
	const changeTheLocationState = async() => {
		const locationid = await AsyncStorage.getItem("locationid")

		changeLocationState(locationid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) setLocationlisted(res.listed)
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					if (err.response.data.status) {
						const { errormsg, status } = err.response.data

						switch (status) {
							case "menusetuprequired":
								setShowmenurequired(true)

								break;
							default:
						}
					}
				} else {
					alert("server error")
				}
			})
	}

	const getAllAppointments = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { ownerid, locationid }

		getAppointments(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setAppointments(res.appointments)
					setNumappointments(res.numappointments)
					setViewtype('appointments')
          setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {

				} else {
					alert("server error")
				}
			})
	}
	const getAllCartOrderers = async() => {
		const locationid = await AsyncStorage.getItem("locationid")

		getCartOrderers(locationid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setCartorderers(res.cartOrderers)
					setNumcartorderers(res.numCartorderers)
					setViewtype('cartorderers')
          setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {

				} else {
					alert("server error")
				}
			})
	}
	const cancelTheSchedule = (index, requestType) => {
		let id, type, item = index != null ? appointments[index] : appointments[cancelInfo.index]

    id = item.id
    type = item.type

		if (!cancelInfo.show) {
			setCancelinfo({ ...cancelInfo, show: true, type, requestType, id, index })
		} else {
			const { reason, id, index } = cancelInfo
			let data = { scheduleid: id, reason, type: "cancelSchedule" }

			cancelSchedule(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						data = { ...data, receiver: res.receiver }
						socket.emit("socket/business/cancelSchedule", data, () => {
              switch (requestType) {
                case "appointment":
                  const newAppointments = [...appointments]

                  newAppointments.splice(index, 1)

                  setAppointments(newAppointments)
                  fetchTheNumAppointments()

                  break
                default:
              }
    							
							setCancelinfo({ ...cancelInfo, show: false, type: "", requestType: "", reason: "", id: 0, index: 0 })
						})				
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						const { errormsg, status } = err.response.data
					} else {
						alert("server error")
					}
				})
		}
	}

  const doneTheService = (index, id) => {
    doneService(id)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const newAppointments = [...appointments]
          let data = { id, type: "doneService", receiver: res.receiver }

          newAppointments.splice(index, 1)

          socket.emit("socket/doneService", data, () => {
            fetchTheNumAppointments()
            setAppointments(newAppointments)
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data

        } else {
          alert("server error")
        }
      })
  }
	const removeFromList = (id, type) => {
		let newItems = []

		switch (type) {
			case "appointments":
				newItems = [...appointments]

				break
			case "cartOrderers":
				newItems = [...cartOrderers]

				break
			default:
		}

    newItems.forEach(function (item, index) {
      if (item.id == id) {
        newItems.splice(index, 1)
      }
    })

		switch (type) {
			case "appointments":
				setAppointments(newItems)

				break
			case "cartOrderers":
				setCartorderers(newItems)
				
				break
			default:
		}
	}
	const setTheLocationPublic = () => {
		setLocationPublic(ownerId)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setLocationlisted(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {

				} else {
					alert("server error")
				}
			})
	}
  const logout = async() => {
    const ownerid = await AsyncStorage.getItem("ownerid")

    socket.emit("socket/business/logout", ownerid, () => {
      AsyncStorage.clear()

      props.navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name: 'auth' }]
        })
      );
    })
  }
	const startWebsocket = () => {
		socket.on("updateSchedules", data => {
      if (data.type == "makeAppointment") {
        // if rebook 
        const newAppointments = [...appointments]

        newAppointments.forEach(function (info) {
          if (info.id == data.id) {
            info.time = data.time
          }
        })

        setAppointments(newAppointments)

        fetchTheNumAppointments()
      } else if (data.type == "cancelRequest") {
        const newAppointments = [...appointments]

        newAppointments.forEach(function (item, index) {
          if (item.id == data.scheduleid) {
            newAppointments.splice(index, 1)
          }
        })

        setAppointments(newAppointments)
        fetchTheNumAppointments()
			} else if (data.type == "cancelService") {
				const newAppointments = [...appointments]

        newAppointments.forEach(function(item, index) {
          if (item.id == data.id) {
            newAppointments.splice(index, 1)
          }
        })

				setAppointments(newAppointments)
				fetchTheNumAppointments()
			}
		})
		socket.on("updateOrders", () => fetchTheNumCartOrderers())
		socket.io.on("open", () => {
			if (ownerId != null) {
				socket.emit("socket/business/login", ownerId, () => setShowdisabledscreen(false))
			}
		})
		socket.io.on("close", () => ownerId != null ? setShowdisabledscreen(true) : {})
	}

	const initialize = () => {
		getTheLocationProfile()

		if (Constants.isDevice) getNotificationPermission()
	}

	useEffect(() => {
		initialize()

    if (firstTime) {
      props.navigation.setParams({ firstTime: false })
    }
	}, [])

	useEffect(() => {
		startWebsocket()

		if (Constants.isDevice) {
			Notifications.addNotificationResponseReceivedListener(res => {
				const { data } = res.notification.request.content

				if (data.type == "checkout") {
					fetchTheNumCartOrderers()
				}
			});
		}

		return () => {
			socket.off("updateSchedules")
			socket.off("updateOrders")
		}
	}, [appointments.length, cartOrderers.length])

	return (
		<SafeAreaView style={styles.main}>
      {loaded ?
  			<View style={styles.box}>
  				<View style={styles.body}>
  					<View style={styles.navs}>
              {locationType == 'salon' ? 
                <>
                  <Text style={styles.header}>Appointment(s)</Text>
                  <TouchableOpacity style={styles.headerTouch} onPress={() => getAllAppointments()}>
                    <Text style={styles.headerTouchHeader}>Refresh {(numAppointments > 0 ? '(' + numAppointments + ')' : '')}</Text>
                  </TouchableOpacity>
                </>
                :
                <>
                  <Text style={styles.header}>Orderer(s)</Text>
                  <TouchableOpacity style={styles.headerTouch} onPress={() => getAllCartOrderers()}>
                    <Text style={styles.headerTouchHeader}>Refresh {numCartorderers > 0 ? '(' + numCartorderers + ')' : ''}</Text>
                  </TouchableOpacity>
                </>
              }
  					</View>

  					{viewType == "appointments" && (
  						appointments.length > 0 ? 
  							<FlatList
  								data={appointments}
  								renderItem={({ item, index }) => 
  									<View key={item.key} style={styles.schedule}>
  										{item.image && (
  											<View style={styles.scheduleImageHolder}>
  												<Image style={styles.scheduleImage} source={{ uri: logo_url + item.image }}/>
  											</View>
  										)}
  											
  										<Text style={styles.scheduleHeader}>
                        Client: {item.client.username}
                        {'\nAppointment for: ' + item.name}
                        {'\n' + displayTime(item.time)}
  										</Text>

  										<View style={styles.scheduleActions}>
                        <View style={styles.column}>
                          <TouchableOpacity style={styles.scheduleAction} onPress={() => cancelTheSchedule(index, "appointment")}>
                            <Text style={styles.scheduleActionHeader}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.column}>
                          <TouchableOpacity style={styles.scheduleAction} onPress={() => doneTheService(index, item.id)}>
                            <Text style={styles.scheduleActionHeader}>Done</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
  									</View>
  								}
  							/>
  							:
  							<View style={styles.bodyResult}>
                  <Text style={styles.bodyResultHeader}>
    								{numAppointments == 0 ? "No appointment(s) yet" : numAppointments + " appointment(s)"}
                  </Text>
  							</View>
  					)}

  					{viewType == "cartorderers" && (
  						cartOrderers.length > 0 ? 
  							<FlatList
  								data={cartOrderers}
  								renderItem={({ item, index }) => 
                    item.product ? 
                      <View key={item.key} style={styles.orderRequest}>
                        <View style={styles.orderRequestRow}>
                          <View>
                            <Text style={styles.orderRequestHeader}>{item.product}</Text>
                            <Text style={styles.orderRequestQuantity}>Quantity: {item.quantity}</Text>
                          </View>
                        </View>
                      </View>
                      :
    									<View key={item.key} style={styles.cartorderer}>
    										<View style={styles.cartordererInfo}>
    											<Text style={styles.cartordererUsername}>Customer: {item.username}</Text>
    											<Text style={styles.cartordererOrderNumber}>Order #{item.orderNumber}</Text>

                          <View style={styles.cartorderActions}>
                            <TouchableOpacity style={styles.cartordererAction} onPress={() => {
                              props.navigation.navigate("cartorders", { userid: item.adder, ordernumber: item.orderNumber, refetch: () => {
                                getAllCartOrderers()
                                removeFromList(item.id, "cartOrderers")
                              }})
                            }}>
                              <Text style={styles.cartordererActionHeader}>See Order(s) ({item.numOrders})</Text>
                            </TouchableOpacity>
                          </View>
    										</View>
    									</View>
  								}
  							/>
  							:
  							<View style={styles.bodyResult}>
  								{numCartorderers == 0 ? 
  									<Text style={styles.bodyResultHeader}>No order(s) yet</Text>
  									:
  									<Text style={styles.bodyResultHeader}>{numCartorderers} order(s)</Text>
  								}
  							</View>
  					)}
  				</View>

  				<View style={styles.bottomNavs}>
  					<View style={styles.bottomNavsRow}>
  						<TouchableOpacity style={styles.bottomNav} onPress={() => props.navigation.navigate("settings", { refetch: () => getTheLocationProfile()})}>
  							<AntDesign name="setting" size={wsize(7)}/>
  						</TouchableOpacity>

  						<TouchableOpacity style={styles.bottomNavButton} onPress={() => props.navigation.navigate("menu", { refetch: () => getTheLocationProfile()})}>
  							<Text style={styles.bottomNavButtonHeader}>Edit Menu</Text>
  						</TouchableOpacity>

  						<TouchableOpacity style={styles.bottomNavButton} onPress={() => changeTheLocationState()}>
  							<Text style={styles.bottomNavButtonHeader}>{locationListed ? "Unlist" : "List"} Public</Text>
  						</TouchableOpacity>

  						<TouchableOpacity style={styles.bottomNav} onPress={() => logout()}>
  							<Text style={styles.bottomNavHeader}>Log-Out</Text>
  						</TouchableOpacity>
  					</View>
  				</View>
  			</View>
        :
        <View style={styles.loading}>
          <ActivityIndicator color="black" size="small"/>
        </View>
      }

			{cancelInfo.show && (
				<Modal transparent={true}>
					<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
						<SafeAreaView style={styles.cancelRequestBox}>
							<Text style={styles.cancelRequestHeader}>Why cancel? (optional)</Text>

							<TextInput 
								placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Write your reason" 
								multiline={true} textAlignVertical="top" style={styles.cancelRequestInput} 
								onChangeText={(reason) => setCancelinfo({ ...cancelInfo, reason })} autoCorrect={false} 
								autoCapitalize="none"
							/>

							<View style={{ alignItems: 'center' }}>
								<View style={styles.cancelRequestActions}>
									<TouchableOpacity style={styles.cancelRequestTouch} onPress={() => setCancelinfo({ ...cancelInfo, show: false, type: "", requestType: "", id: 0, index: 0, reason: "" })}>
										<Text style={styles.cancelRequestTouchHeader}>Close</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.cancelRequestTouch} onPress={() => cancelTheSchedule(null, cancelInfo.requestType)}>
										<Text style={styles.cancelRequestTouchHeader}>Done</Text>
									</TouchableOpacity>
								</View>
							</View>
						</SafeAreaView>
					</TouchableWithoutFeedback>
				</Modal>
			)}
			{showMenurequired && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.requiredBoxContainer}>
						<View style={styles.requiredBox}>
							<View style={styles.requiredContainer}>
								<Text style={styles.requiredHeader}>
									You need to add some 
									{locationType == "restaurant" ? 
										" food "
										:
										" products / services "
									}
									to your menu to list your location publicly
								</Text>

								<View style={styles.requiredActions}>
									<TouchableOpacity style={styles.requiredAction} onPress={() => setShowmenurequired(false)}>
										<Text style={styles.requiredActionHeader}>Close</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.requiredAction} onPress={() => {
										setShowmenurequired(false)
										props.navigation.navigate("menu", { menuid: '', name: '', refetch: () => getTheLocationProfile()})
									}}>
										<Text style={styles.requiredActionHeader}>Ok</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</SafeAreaView>
				</Modal>
			)}
			{showFirsttime.show && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.firstTimeBoxContainer}>
						<View style={styles.firstTimeBox}>
							<View style={styles.firstTimeContainer}>
								{showFirsttime.step == 0 ? 
									<Text style={styles.firstTimeHeader}>
										Welcome!!{'\n\n'}
										This is the main page{'\n\n'}
										You will see all 
										{locationType == 'restaurant' ? ' orders ' : ' appointments '}
										here
									</Text>
								: null }

								{showFirsttime.step == 1 ? 
									<Text style={styles.firstTimeHeader}>
										Before you can accept {locationType == 'restaurant' ? ' orders ' : ' appointments '} from {locationType == 'restaurant' ? 'customers' : 'clients'}
										{'\n\n'}
										you need to setup your menu
									</Text>
								: null }

								<View style={styles.firstTimeActions}>
									{showFirsttime.step > 0 && (
										<TouchableOpacity style={styles.firstTimeAction} onPress={() => setShowfirsttime({ ...showFirsttime, step: showFirsttime.step - 1 })}>
											<Text style={styles.firstTimeActionHeader}>Back</Text>
										</TouchableOpacity>
									)}
										
									<TouchableOpacity style={styles.firstTimeAction} onPress={() => {
										if (showFirsttime.step == 1) {
											setShowfirsttime({ show: false, step: 0 })
											props.navigation.navigate("menu", { menuid: '', name: '', refetch: () => getTheLocationProfile()})
										} else {
											setShowfirsttime({ ...showFirsttime, step: showFirsttime.step + 1 })
										}
									}}>
										<Text style={styles.firstTimeActionHeader}>{showFirsttime.step < 1 ? 'Next' : "Setup Menu"}</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</SafeAreaView>
				</Modal>
			)}
			{showDisabledscreen && (
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

							<ActivityIndicator color="black" size="large"/>
						</View>
					</SafeAreaView>
				</Modal>
			)}
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	main: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

	navs: { alignItems: 'center', height: '25%', width: '100%' },
  header: { fontSize: wsize(10), fontWeight: 'bold' },
  headerTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
  headerTouchHeader: { fontSize: wsize(9), fontWeight: 'bold', textAlign: 'center' },

	// body
	body: { height: '80%' },

	// client appointment & orders
	orderRequest: { borderRadius: 5, backgroundColor: 'white', marginHorizontal: 5, marginVertical: 2.5, padding: 10 },
	orderRequestRow: { flexDirection: 'row', justifyContent: 'space-between' },
	orderRequestHeader: { fontSize: wsize(4) },
	orderRequestQuantity: { fontSize: wsize(4), fontWeight: 'bold' },

	// client's schedule
	schedule: { alignItems: 'center', borderRadius: 5, backgroundColor: 'white', marginHorizontal: 5, marginVertical: 2.5 },
	scheduleRow: { flexDirection: 'row', justifyContent: 'space-between' },
	scheduleImageHolder: { borderRadius: wsize(20) / 2, height: wsize(20), margin: 5, overflow: 'hidden', width: wsize(20) },
	scheduleImage: { height: wsize(20), width: wsize(20) },
	scheduleHeader: { fontSize: wsize(4), fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
	scheduleActionsHeader: { fontSize: wsize(4), marginTop: 10, textAlign: 'center' },
	scheduleActions: { flexDirection: 'row' },
  column: { flexDirection: 'column', justifyContent: 'space-around' },
	scheduleAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, paddingVertical: 10, width: wsize(30) },
	scheduleActionHeader: { fontSize: wsize(4), textAlign: 'center' },
	scheduleNumOrders: { fontSize: wsize(4), fontWeight: 'bold', padding: 8 },

	cartorderer: { backgroundColor: 'white', borderRadius: 5, flexDirection: 'row', justifyContent: 'space-around', margin: 10, padding: 5, width: wsize(100) - 20 },
	cartordererInfo: { alignItems: 'center' },
	cartordererUsername: { fontSize: wsize(5), fontWeight: 'bold', marginBottom: 10 },
	cartordererOrderNumber: { fontSize: wsize(7), fontWeight: 'bold', paddingVertical: 5 },
  cartordererActions: { flexDirection: 'row', justifyContent: 'space-around' },
	cartordererAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: wsize(30) },
	cartordererActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	bodyResult: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around' },
	bodyResultHeader: { fontSize: wsize(4) },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', marginVertical: 5 },
	bottomNavHeader: { color: 'black', fontSize: wsize(4), fontWeight: 'bold', paddingVertical: 5 },
	bottomNavButton: { backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, paddingVertical: 8, width: wsize(30) },
	bottomNavButtonHeader: { color: 'white', fontSize: wsize(4), fontWeight: 'bold', textAlign: 'center' },

	cancelRequestBox: { backgroundColor: 'white', height: '100%', width: '100%' },
	cancelRequestHeader: { fontFamily: 'appFont', fontSize: wsize(6), marginHorizontal: 30, marginTop: 50, textAlign: 'center' },
	cancelRequestInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), height: 200, margin: '5%', padding: 10, width: '90%' },
	cancelRequestActions: { flexDirection: 'row', justifyContent: 'space-around' },
	cancelRequestTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: wsize(30) },
	cancelRequestTouchHeader: { fontSize: wsize(5), textAlign: 'center' },

	requiredBoxContainer: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
	requiredBox: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	requiredContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	requiredHeader: { fontFamily: 'appFont', fontSize: wsize(6), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	requiredActions: { alignItems: 'center', justifyContent: 'space-around' },
	requiredAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: wsize(30) },
	requiredActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	alertBoxContainer: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
	alertBox: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	alertContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	alertHeader: { fontFamily: 'appFont', fontSize: wsize(6), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	alertActions: { flexDirection: 'row', justifyContent: 'space-around' },
	alertAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: wsize(30) },
	alertActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	firstTimeBoxContainer: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
	firstTimeBox: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	firstTimeContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '90%' },
	firstTimeHeader: { fontSize: wsize(6), paddingHorizontal: 10, textAlign: 'center' },
	firstTimeActions: { flexDirection: 'row', justifyContent: 'space-around' },
	firstTimeAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 10, width: wsize(30) },
	firstTimeActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	disabled: { backgroundColor: 'black', flexDirection: 'column', justifyContent: 'space-around', height: '100%', opacity: 0.8, width: '100%' },
	disabledContainer: { alignItems: 'center', width: '100%' },
	disabledHeader: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
	disabledClose: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 10, width: wsize(20) },
	disabledCloseHeader: { fontSize: wsize(4), textAlign: 'center' },

  loading: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  column: { flexDirection: 'column', justifyContent: 'space-around' },
  errorMsg: { color: 'darkred', textAlign: 'center' }
})
