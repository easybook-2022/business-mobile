import React, { useEffect, useState } from 'react'
import { 
  SafeAreaView, Platform, ScrollView, ActivityIndicator, Dimensions, 
  View, FlatList, Image, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, 
  Keyboard, StyleSheet, Modal 
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKeepAwake } from 'expo-keep-awake'
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { StackActions } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system'
import * as ImageManipulator from 'expo-image-manipulator'
import * as Speech from 'expo-speech'
import Voice from '@react-native-voice/voice';
import { socket, logo_url } from '../../assets/info'
import { displayTime, resizePhoto } from 'geottuse-tools'
import { updateNotificationToken, getOwnerInfo, logoutUser } from '../apis/owners'
import { fetchNumAppointments, fetchNumCartOrderers, getLocationProfile } from '../apis/locations'
import { getMenus, removeMenu, addNewMenu } from '../apis/menus'
import { cancelSchedule, doneService, getAppointments, getCartOrderers } from '../apis/schedules'
import { removeProduct } from '../apis/products'
import { setWaitTime } from '../apis/carts'

import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}

export default function Main(props) {
  useKeepAwake()

	const firstTime = props.route.params ? 
    props.route.params.firstTime ?
      true 
      : 
      false 
    : 
    false

	const [notificationPermission, setNotificationpermission] = useState(null);
	const [ownerId, setOwnerid] = useState(null)
  const [isOwner, setIsowner] = useState(false)
	const [storeIcon, setStoreicon] = useState('')
	const [storeName, setStorename] = useState('')
	const [locationType, setLocationtype] = useState('')

	const [appointments, setAppointments] = useState([])
	const [numAppointments, setNumappointments] = useState(0)

	const [cartOrderers, setCartorderers] = useState([])
  const [speakInfo, setSpeakinfo] = useState({ orderNumber: "" })
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
    } else {
      const info = await Notifications.requestPermissionsAsync()

      if (info.status == "granted") {
        setNotificationpermission(true)
      }
    }

    const { data } = await Notifications.getExpoPushTokenAsync({
      experienceId: "@robogram/easygo-business"
    })

    if (ownerid) {
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
            const { errormsg, status } = err.response.data
          }
        })
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
          const { errormsg, status } = err.response.data
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
          const { errormsg, status } = err.response.data
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
					const { name, fullAddress, logo, type } = res.info

					socket.emit("socket/business/login", ownerid, () => {
						setOwnerid(ownerid)
						setStorename(name)
						setStoreicon(logo)
						setLocationtype(type)

						if (type == 'store' || type == 'restaurant') {
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
          const { errormsg, status } = err.response.data
				}
			})
	}
  const getTheOwnerInfo = async() => {
    const ownerid = await AsyncStorage.getItem("ownerid")

    getOwnerInfo(ownerid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setIsowner(res.isOwner)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
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
          const { errormsg, status } = err.response.data
				}
			})
	}
  const speakToWorker = async(data) => {
    let message

    if (data.type == "makeAppointment" || data.type == "remakeAppointment" || data.type == "cancelRequest") {
      const { name, time, worker } = data.speak

      switch (data.type) {
        case "makeAppointment":
          message = "New appointment" 

          break;
        case "remakeAppointment":
          message = "Appointment rebook"

          break;
        case "cancelRequest":
          message = "Appointment cancelled"

          break;
        default:
      }

      message += " for " + name + " " + displayTime(time) + " with stylist: " + worker

      if (Constants.isDevice) Speech.speak(message, { rate: 0.7 })
    } else {
      const { name, quantity, customer, orderNumber } = data.speak

      switch (data.type) {
        case "checkout":
          message = customer + " ordered " + quantity + " of " + name + ". How long will be the wait ?"

          if (Constants.isDevice) {
            Speech.speak(message, {
              rate: 0.7,
              onDone: () => Constants.isDevice ? startVoice() : {}
            })
          }

          break;
        default:
      }
    }
  }
  const startVoice = async() => {
    await Voice.start('en-US')

    setTimeout(function () {
      stopSpeech()
    }, 5000)
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
          const { errormsg, status } = err.response.data
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
  const logout = async() => {
    const ownerid = await AsyncStorage.getItem("ownerid")

    logoutUser(ownerid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          socket.emit("socket/business/logout", ownerid, () => {
            AsyncStorage.clear()

            props.navigation.dispatch(StackActions.replace("auth"));
          })
        }
      })
  }
	const startWebsocket = () => {
		socket.on("updateSchedules", data => {
      if (
        data.type == "makeAppointment" || 
        data.type == "cancelRequest" || 
        data.type == "remakeAppointment"
      ) {
        getAllAppointments()

        speakToWorker(data)
      }
		})
		socket.on("updateOrders", data => {
      getAllCartOrderers()

      speakToWorker(data)
    })
		socket.io.on("open", () => {
			if (ownerId != null) {
				socket.emit("socket/business/login", ownerId, () => setShowdisabledscreen(false))
			}
		})
		socket.io.on("close", () => ownerId != null ? setShowdisabledscreen(true) : {})
	}
  
	const initialize = () => {
		getTheLocationProfile()
    getTheOwnerInfo()

		if (Constants.isDevice) getNotificationPermission()
	}
  const stopSpeech = async() => {
    await Voice.stop()
    await Voice.cancel()
    await Voice.destroy();
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

        if (
          data.type == "makeAppointment" || 
          data.type == "cancelRequest" || 
          data.type == "remakeAppointment"
        ) {
          getAllAppointments()

          speakToWorker(data)
        } else if (data.type == "checkout") {
          fetchTheNumCartOrderers()
        }
			});
		}

		return () => {
			socket.off("updateSchedules")
			socket.off("updateOrders")
		}
	}, [appointments.length, cartOrderers.length])

  useEffect(() => {
    if (Constants.isDevice) {
      Voice.onSpeechPartialResults = (e) => {
        if (e.value.toString().toLowerCase().includes("minute")) {
          stopSpeech()

          let data = { type: "setWaitTime", ordernumber: speakInfo.orderNumber, waitTime: e.value.toString() }

          setWaitTime(data)
            .then((res) => {
              if (res.status == 200) {
                return res.data
              }
            })
            .then((res) => {
              if (res) {
                data = { ...data, receiver: res.receiver }
                socket.emit("socket/setWaitTime", data)
              }
            })
            .catch((err) => {
              if (err.response && err.response.status == 400) {
                const { errormsg, status } = err.response.data
              }
            })
        }
      };

      return () => {
        Voice.destroy().then(Voice.removeAllListeners);
      }
    }
  }, [speakInfo.orderNumber])

	return (
		<SafeAreaView style={styles.main}>
      {loaded ?
  			<View style={styles.box}>
  				<View style={styles.body}>
  					<View style={styles.navs}>
              <Text style={styles.header}>
                {(locationType == 'hair' || locationType == 'nail') ? 'Appointment(s)' : 'Orderer(s)'}
              </Text>
  					</View>

            {viewType == "appointments" && (
              appointments.length > 0 ? 
                <FlatList
                  data={appointments}
                  renderItem={({ item, index }) => 
                    <View key={item.key} style={styles.schedule}>
                      <View style={styles.scheduleImageHolder}>
                        <Image 
                          style={resizePhoto(item.image, wsize(20))} 
                          source={item.image.name ? { uri: logo_url + item.image.name } : require("../../assets/noimage.jpeg")}
                        />
                      </View>
                        
                      <Text style={styles.scheduleHeader}>
                        Client: {item.client.username}
                        {'\nAppointment for: ' + item.name}
                        {'\n' + displayTime(item.time)}
                        {'\nwith stylist: ' + item.worker.username}
                      </Text>

                      <View style={styles.scheduleActions}>
                        <View style={styles.column}>
                          <TouchableOpacity style={styles.scheduleAction} onPress={() => cancelTheSchedule(index, "appointment")}>
                            <Text style={styles.scheduleActionHeader}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.column}>
                          <TouchableOpacity style={styles.scheduleAction} onPress={() => props.navigation.navigate("booktime", { scheduleid: item.id, serviceid: item.serviceid, serviceinfo: item.name })}>
                            <Text style={styles.scheduleActionHeader}>Pick another time for client</Text>
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
                  <Text style={styles.bodyResultHeader}>{numAppointments == 0 ? "No appointment(s) yet" : numAppointments + " appointment(s)"}</Text>
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
                              props.navigation.navigate("cartorders", { userid: item.adder, type: item.type, ordernumber: item.orderNumber, refetch: () => {
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
                  <Text style={styles.bodyResultHeader}>{numCartorderers == 0 ? 'No order(s) yet' : numCartorderers + ' order(s)'}</Text>
                </View>
            )}
  				</View>

  				<View style={styles.bottomNavs}>
  					<View style={styles.bottomNavsRow}>
              <View style={styles.column}>
    						<TouchableOpacity style={styles.bottomNav} onPress={() => props.navigation.navigate("settings", { refetch: () => initialize() })}>
    							<AntDesign name="setting" size={wsize(7)}/>
    						</TouchableOpacity>
              </View>

              {isOwner == true && (
                <TouchableOpacity style={styles.bottomNavButton} onPress={() => {
                  AsyncStorage.removeItem("locationid")
                  AsyncStorage.removeItem("locationtype")
                  AsyncStorage.setItem("phase", "list")

                  props.navigation.dispatch(StackActions.replace("list"));
                }}>
                  <Text style={styles.bottomNavButtonHeader}>Switch Business</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.bottomNavButton} onPress={() => props.navigation.navigate("menu", { refetch: () => initialize(), isOwner })}>
                <Text style={styles.bottomNavButtonHeader}>{isOwner == true ? "Edit" : "View"} Menu</Text>
              </TouchableOpacity>

              <View style={styles.column}>
    						<TouchableOpacity style={styles.bottomNav} onPress={() => logout()}>
    							<Text style={styles.bottomNavHeader}>Log-Out</Text>
    						</TouchableOpacity>
              </View>
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
										{(locationType == 'restaurant' || locationType == 'store') ? ' orders ' : ' appointments '}
										here
									</Text>
								: null }

								{showFirsttime.step == 1 ? 
									<Text style={styles.firstTimeHeader}>
										Before you can accept {(locationType == 'restaurant' || locationType == 'store') ? 'orders' : 'appointments'} from {(locationType == 'restaurant' || locationType == 'store') ? 'customers' : 'clients'}
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

              <TouchableOpacity style={styles.disabledClose} onPress={() => socket.emit("socket/business/login", userId, () => setShowdisabledscreen(false))}>
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
	main: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

	navs: { alignItems: 'center', height: '10%', width: '100%' },
  header: { fontSize: wsize(10), fontWeight: 'bold' },

	// body
	body: { height: '90%' },

	// client appointment & orders
	orderRequest: { borderRadius: 5, backgroundColor: 'white', marginHorizontal: 5, marginVertical: 2.5, padding: 10 },
	orderRequestRow: { flexDirection: 'row', justifyContent: 'space-between' },
	orderRequestHeader: { fontSize: wsize(4) },
	orderRequestQuantity: { fontSize: wsize(4), fontWeight: 'bold' },

	// client's schedule
	schedule: { alignItems: 'center', borderRadius: 5, backgroundColor: 'white', marginHorizontal: 5, marginVertical: 2.5 },
	scheduleRow: { flexDirection: 'row', justifyContent: 'space-between' },
	scheduleImageHolder: { borderRadius: wsize(20) / 2, margin: 5, overflow: 'hidden', width: wsize(20) },
	scheduleImage: { height: wsize(20), width: wsize(20) },
	scheduleHeader: { fontSize: wsize(4), fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
	scheduleActionsHeader: { fontSize: wsize(4), marginTop: 10, textAlign: 'center' },
	scheduleActions: { flexDirection: 'row', justifyContent: 'space-around' },
  column: { flexDirection: 'column', justifyContent: 'space-around' },
	scheduleAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, paddingVertical: 10, width: wsize(30) },
	scheduleActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	cartorderer: { backgroundColor: 'white', borderRadius: 5, flexDirection: 'row', justifyContent: 'space-around', margin: 10, padding: 5, width: wsize(100) - 20 },
	cartordererInfo: { alignItems: 'center' },
	cartordererUsername: { fontSize: wsize(5), fontWeight: 'bold', marginBottom: 10 },
	cartordererOrderNumber: { fontSize: wsize(7), fontWeight: 'bold', paddingVertical: 5 },
  cartordererActions: { flexDirection: 'row', justifyContent: 'space-around' },
	cartordererAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: wsize(30) },
	cartordererActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	bodyResult: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around' },
	bodyResultHeader: { fontSize: wsize(5) },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row' },
	bottomNavHeader: { color: 'black', fontSize: wsize(4), fontWeight: 'bold', paddingVertical: 5 },
	bottomNavButton: { backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
	bottomNavButtonHeader: { color: 'white', fontSize: wsize(4), fontWeight: 'bold', textAlign: 'center' },
  
	cancelRequestBox: { backgroundColor: 'white', height: '100%', width: '100%' },
	cancelRequestHeader: { fontFamily: 'Chilanka_400Regular', fontSize: wsize(6), marginHorizontal: 30, marginTop: 50, textAlign: 'center' },
	cancelRequestInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), height: 200, margin: '5%', padding: 10, width: '90%' },
	cancelRequestActions: { flexDirection: 'row', justifyContent: 'space-around' },
	cancelRequestTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: wsize(30) },
	cancelRequestTouchHeader: { fontSize: wsize(5), textAlign: 'center' },

	requiredBoxContainer: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
	requiredBox: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	requiredContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	requiredHeader: { fontFamily: 'Chilanka_400Regular', fontSize: wsize(6), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	requiredActions: { alignItems: 'center', justifyContent: 'space-around' },
	requiredAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: wsize(30) },
	requiredActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	alertBoxContainer: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
	alertBox: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	alertContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	alertHeader: { fontFamily: 'Chilanka_400Regular', fontSize: wsize(6), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
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
  disabledClose: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 50, padding: 10 },

  loading: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  column: { flexDirection: 'column', justifyContent: 'space-around' },
  errorMsg: { color: 'darkred', textAlign: 'center' }
})
