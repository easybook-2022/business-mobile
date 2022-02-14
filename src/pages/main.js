import React, { useEffect, useState, useRef } from 'react'
import { SafeAreaView, Platform, ScrollView, ActivityIndicator, Dimensions, View, FlatList, Image, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet, Modal } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { CommonActions } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system'
import * as ImageManipulator from 'expo-image-manipulator'
import { socket, logo_url, displayTime } from '../../assets/info'
import { updateNotificationToken } from '../apis/owners'
import { fetchNumRequests, fetchNumAppointments, fetchNumCartOrderers, fetchNumReservations, fetchNumorders, getLocationProfile, changeLocationState, setLocationPublic } from '../apis/locations'
import { getMenus, removeMenu, addNewMenu } from '../apis/menus'
import { getRequests, acceptRequest, cancelSchedule, requestPayment, doneDining, receiveEpayment, receiveInpersonpayment, canServeDiners, getAppointments, getCartOrderers, getReservations } from '../apis/schedules'
import { getProducts, getServices, removeProduct } from '../apis/products'
import { setProductPrice } from '../apis/carts'

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
	const firstTime = props.route.params ? props.route.params.firstTime ? true : false : false

	const [notificationPermission, setNotificationpermission] = useState(null);
	const [ownerId, setOwnerid] = useState(null)
	const [storeIcon, setStoreicon] = useState('')
	const [storeName, setStorename] = useState('')
	const [locationType, setLocationtype] = useState('')
	const [locationListed, setLocationlisted] = useState('')

	const [requests, setRequests] = useState([])
	const [numRequests, setNumrequests] = useState(0)

	const [appointments, setAppointments] = useState([])
	const [numAppointments, setNumappointments] = useState(0)

	const [cartOrderers, setCartorderers] = useState([])
	const [numCartorderers, setNumcartorderers] = useState(0)

	const [reservations, setReservations] = useState([])
	const [numReservations, setNumreservations] = useState(0)

	const [viewType, setViewtype] = useState('')
	const [productPrice, setProductprice] = useState({ show: false, index: -1, id: -1, name: '', price: 0.00, errorMsg: "" })
	const [cancelInfo, setCancelinfo] = useState({ show: false, type: "", requestType: "", reason: "", id: 0, index: 0 })
	const [acceptRequestInfo, setAcceptrequestinfo] = useState({ show: false, type: "", index: 0, tablenum: "", errorMsg: "" })
	const [requestPaymentinfo, setRequestpaymentinfo] = useState({ show: false, confirm: false, id: 0, servicename: '', serviceprice: 0.00, servicetip: 0.00, menus: [] })

	const [showBankaccountrequired, setShowbankaccountrequired] = useState({ show: false, scheduleid: 0 })
	const [showPaymentrequired, setShowpaymentrequired] = useState(false)
	const [showPaymentunsent, setShowpaymentunsent] = useState(false)
	const [showMenurequired, setShowmenurequired] = useState(false)
	const [showPaymentconfirm, setShowpaymentconfirm] = useState({ show: false, info: {} })
	const [showUnservedorders, setShowunservedorders] = useState(false)
	const [showWrongworker, setShowwrongworker] = useState(false)
	const [showUnallowedpayment, setShowunallowedpayment] = useState(false)
	const [showDisabledScreen, setShowdisabledscreen] = useState(false)
	const [showFirsttime, setShowfirsttime] = useState({ show: firstTime, step: 0 })
	
	const isMounted = useRef(null)

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
	
  const fetchTheNumRequests = async() => {
    const locationid = await AsyncStorage.getItem("locationid")

    fetchNumRequests(locationid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setNumrequests(res.numRequests)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          
        } else {
          alert("server error")
        }
      })
  }
	const fetchTheNumAppointments = async() => {
    const ownerid = await AsyncStorage.getItem("ownerid")

		if (locationType == "salon") {
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
	}
	const fetchTheNumReservations = async() => {
		const locationid = await AsyncStorage.getItem("locationid")

		if (locationType == "restaurant") {
			fetchNumReservations(locationid)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) setNumreservations(res.numReservations)
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						
					} else {
						alert("server error")
					}
				})
		}
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
				if (res && isMounted.current == true) {
					const { name, fullAddress, logo, type, listed } = res.info

					socket.emit("socket/business/login", ownerid, () => {
						setOwnerid(ownerid)
						setStorename(name)
						setStoreicon(logo)
						setLocationtype(type)
						setLocationlisted(listed)

						if (type == 'restaurant') {
							fetchTheNumCartOrderers()
							getAllReservations()
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

  const getAllRequests = async() => {
    const locationid = await AsyncStorage.getItem("locationid")
    const data = { ownerid: ownerId, locationid }

    getRequests(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setRequests(res.requests)
          setNumrequests(res.numrequests)
          setViewtype('requests')
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {

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
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {

				} else {
					alert("server error")
				}
			})
	}
	const getAllReservations = async() => {
		const locationid = await AsyncStorage.getItem("locationid")

		getReservations(locationid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setReservations(res.reservations)
					setNumreservations(res.numreservations)
					setViewtype('reservations')
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					alert("server error")
				}
			})
	}
	const setTheProductPrice = async(index, id) => {
    if (!productPrice.show) {
      const { product } = requests[index]
      const locationid = await AsyncStorage.getItem("locationid")

      getMenus(locationid)
        .then((res) => {
          if (res.status == 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            setProductprice({ ...productPrice, show: true, index, id, name: product, menus: res.menus })
          }
        })
        .catch((err) => {
          if (err.response && err.response.status == 400) {

          } else {
            alert("server error")
          }
        })
    } else {
      const { index, id, name, price } = productPrice
      let data = { cartid: id, name, price, type: "setProductPrice" }

      if (price) {
        setProductPrice(data)
          .then((res) => {
            if (res.status == 200) {
              return res.data
            }
          })
          .then((res) => {
            if (res) {
              data = { ...data, receiver: res.receiver }
              socket.emit("socket/setProductPrice", data, () => {
                const newRequests = [...requests]

                newRequests.splice(index, 1)

                setRequests(newRequests)
                fetchTheNumRequests()
                fetchTheNumCartOrderers()
                setProductprice({ ...productPrice, show: false })
              })
            }
          })
          .catch((err) => {
            if (err.response && err.response.status == 400) {
              const { errormsg, status } = err.response.data
            }
          })
      } else {
        setProductprice({ ...productPrice, errorMsg: "Please enter a price" })
      }
    }
	}
	const cancelTheSchedule = (index, requestType) => {
		let id, type, item

    switch (requestType) {
      case "request":
        item = index != null ? requests[index] : requests[cancelInfo.index]

        break
      case "reservation":
        item = index != null ? reservations[index] : reservations[cancelInfo.index]

        break
      case "appointment":
        item = index != null ? appointments[index] : appointments[cancelInfo.index]

        break
    }

    id = item.id
    type = item.type

		if (!cancelInfo.show) {
			setCancelinfo({ ...cancelInfo, show: true, type, requestType, id, index })
		} else {
			const { reason, id, index } = cancelInfo
			let data = { scheduleid: id, reason, type: "cancelRequest" }

			cancelSchedule(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						data = { ...data, receiver: res.receiver }
						socket.emit("socket/business/cancelRequest", data, () => {
              switch (requestType) {
                case "request":
                  const newRequests = [...requests]

                  newRequests.splice(index, 1)

                  setRequests(newRequests)
                  setNumrequests(numRequests - 1)

                  break
                case "reservation":
                  const newReservations = [...reservations]

                  newReservations.splice(index, 1)

                  setReservations(newReservations)
                  setNumreservations(numReservations - 1)

                  break
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
	const acceptTheRequest = async(index) => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const { id, tablenum } = index != undefined ? requests[index] : acceptRequestInfo

		if (locationType == "restaurant") {
			if (!acceptRequestInfo.show) {
				setAcceptrequestinfo({ ...acceptRequestInfo, show: true, type: locationType, index, tablenum })
			} else {
				const { index, tablenum } = acceptRequestInfo
				const scheduleid = requests[index].id

				if (tablenum) {
					let data = { scheduleid, tablenum, type: "acceptRequest" }

					acceptRequest(data)
						.then((res) => {
							if (res.status == 200) {
								return res.data
							}
						})
						.then((res) => {
							if (res) {
								const newRequests = [...requests]

								data = { ...data, receivers: res.receivers, worker: null }
								socket.emit("socket/business/acceptRequest", data, () => {
									newRequests[index].status = "accepted"

									setRequests(newRequests)
									setAcceptrequestinfo({ show: false, tablenum })
								})
							}
						})
						.catch((err) => {
							if (err.response && err.response.status == 400) {
								
							} else {
								alert("server error")
							}
						})
				} else {
					setAcceptrequestinfo({ ...acceptRequestInfo, errorMsg: "Please enter a table # for the diner(s)" })
				}
			}
		} else {
			let data = { scheduleid: id, ownerid: ownerId, tablenum: tablenum ? tablenum : "", type: "acceptRequest" }

			acceptRequest(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						const newRequests = [...requests]

						data = { ...data, receivers: res.receivers, worker: res.worker }
						socket.emit("socket/business/acceptRequest", data, () => {
							newRequests[index].status = "accepted"
							newRequests[index].worker = res.worker

							setRequests(newRequests)
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
	}
	const requestThePayment = async(index, id) => {
		if (!requestPaymentinfo.show) {
			const { name } = appointments[index]
      const locationid = await AsyncStorage.getItem("locationid")

      getMenus(locationid)
        .then((res) => {
          if (res.status == 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            setRequestpaymentinfo({ ...requestPaymentinfo, show: true, id, servicename: name, menus: res.menus })
          }
        })
        .catch((err) => {
          if (err.response && err.response.status == 400) {

          } else {
            alert("server error")
          }
        })
		} else {
			const { id, serviceprice } = requestPaymentinfo
			const data = { scheduleid: id, ownerid: ownerId, serviceprice }

      if (serviceprice) {
  			requestPayment(data)
  				.then((res) => {
  					if (res.status == 200) {
  						return res.data
  					}
  				})
  				.then((res) => {
  					if (res) {
  						const data = { id, type: "requestPayment", receiver: res.receiver, workerInfo: res.workerInfo }

  						socket.emit("socket/business/requestPayment", data, () => setRequestpaymentinfo({ ...requestPaymentinfo, show: false }))
  					}
  				})
          .catch((err) => {
            if (err.response && err.response.status == 400) {
              const { errormsg, status } = err.response.data
            }
          })
      } else {
        setRequestpaymentinfo({ ...requestPaymentinfo, errorMsg: "Please enter a price" })
      }
		}
	}
	const doneTheDining = (index, id) => {
		const newReservations = [...reservations]

		newReservations[index].gettingPayment = true

		setReservations(newReservations)

		doneDining(id)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const newReservations = [...reservations]

					newReservations[index].gettingPayment = false

					setReservations(newReservations)

					props.navigation.navigate("dinersorders", { scheduleid: id, refetch: () => getAllReservations()})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data

					switch (status) {
						case "unserved":
							const newReservations = [...reservations]

							newReservations[index].gettingPayment = false

							setReservations(newReservations)

							setShowunservedorders(true)

							break;
						default:
					}
				} else {
					alert("server error")
				}
			})
	}
	const canServeTheDiners = (index, id) => {
		const newReservations = [...reservations]
		let data = { id, type: "canServeDiners" }

		canServeDiners(id)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					newReservations[index].seated = true

					data = { ...data, receiver: res.receiver, time: newReservations[index].time }
					socket.emit("socket/canServeDiners", data, () => setReservations(newReservations))
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					alert("server error")
				}
			})
	}
	const receiveTheepayment = async(index, id) => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const newAppointments = [...appointments]

		newAppointments[index].gettingPayment = true

		setAppointments(newAppointments)

		let data = { scheduleid: id, ownerid, type: "receivePayment" }

		receiveEpayment(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const newAppointments = [...appointments]
					const { clientName, name, price, receiver } = res

					data = { ...data, receiver }
					socket.emit("socket/receivePayment", data, () => {
						newAppointments.splice(index, 1)

						setAppointments(newAppointments)
						fetchTheNumAppointments()
						setShowbankaccountrequired({ show: false, scheduleid: 0 })
						setShowpaymentconfirm({ show: true, info: { clientName, name, price } })

            setTimeout(function () {
              setShowpaymentconfirm({ show: false, info: {} })
            }, 3000)
					})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data
					const newAppointments = [...appointments]

					newAppointments[index].gettingPayment = false

					setAppointments(newAppointments)

					switch (status) {
						case "paymentunsent":
							setShowpaymentunsent(true)

							break;
						case "wrongworker":
							setShowwrongworker(true)

							break;
						case "bankaccountrequired":
							setShowbankaccountrequired({ show: true, scheduleid: id })

							break;
						case "cardrequired":
							setShowpaymentrequired(true)

							break;
						default:
					}
				} else {
					alert("server error")
				}
			})
	}
	const receiveTheinpersonpayment = async(index, id) => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const newAppointments = [...appointments]

		newAppointments[index].gettingPayment = true

		setAppointments(newAppointments)

		let data = { scheduleid: id, ownerid, type: "receivePayment" }

		receiveInpersonpayment(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const newAppointments = [...appointments]
					const { clientName, name, price, receiver } = res

					data = { ...data, receiver }
					socket.emit("socket/receivePayment", data, () => {
						newAppointments.splice(index, 1)

						setAppointments(newAppointments)
						fetchTheNumAppointments()
						setShowbankaccountrequired({ show: false, scheduleid: 0 })
						setShowpaymentconfirm({ show: true, info: { clientName, name, price } })

            setTimeout(function () {
              setShowpaymentconfirm({ show: false, info: {} })
            }, 3000)
					})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data
					const newAppointments = [...appointments]

					newAppointments[index].gettingPayment = false

					setAppointments(newAppointments)

					switch (status) {
						case "paymentunsent":
							setShowpaymentunsent(true)

							break;
						case "wrongworker":
							setShowwrongworker(true)

							break;
						case "unallowedpayment":
							setShowunallowedpayment(true)

							break
						default:
					}
				} else {
					alert("server error")
				}
			})
	}
	const removeFromList = (id, type) => {
		let newItems = []

		switch (type) {
			case "requests":
				newItems = [...requests]

				break
			case "appointments":
				newItems = [...appointments]

				break
			case "cartOrderers":
				newItems = [...cartOrderers]

				break
			case "reservations":
				newItems = [...reservations]

				break
			default:
		}

    newItems.forEach(function (item, index) {
      if (item.id == id) {
        newItems.splice(index, 1)
      }
    })

		switch (type) {
			case "requests":
				setRequests(newItems)

				break
			case "appointments":
				setAppointments(newItems)

				break
			case "cartOrderers":
				setCartorderers(newItems)
				
				break
			case "reservations":
				setReservations(newItems)

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
		socket.on("updateRequests", data => {
			if (data.type == "makeReservation") {
				const newReservations = [...reservations]

        newReservations.forEach(function (item, index) {
          if (item.id == data.scheduleid) {
            newReservations.splice(index, 1)
          }
        })

				setReservations(newReservations)

				fetchTheNumReservations()
				fetchTheNumRequests()
			} else if (data.type == "cancelSchedule") {
				const newAppointments = [...appointments]
				const newRequests = [...requests]

        newAppointments.forEach(function (item, index) {
          if (item.id == data.scheduleid) {
            newAppointments.splice(index, 1)
          }
        })
        newRequests.forEach(function (item, index) {
          if (item.id == data.scheduleid) {
            newRequests.splice(index, 1)
          }
        })

				setAppointments(newAppointments)
				setRequests(newRequests)

				fetchTheNumAppointments()
				fetchTheNumRequests()
			} else if (data.type == "acceptRequest") {
				const newRequests = [...requests]

        newRequests.forEach(function (item) {
          if (item.id == data.scheduleid) {
            item.status = "accepted"
            item.worker = data.worker
          }
        })

				setRequests(newRequests)
			}
		})
		socket.on("updateSchedules", data => {
      if (data.type == "makeAppointment") {
        const newAppointments = [...appointments]

        newAppointments.forEach(function (item) {
          if (item.id == data.id) {
            item.time = data.time
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
			} else if (data.type == "confirmRequest") {
				const newRequests = [...requests]

				fetchTheNumRequests()

				if (locationType == "salon") {
					if (data.worker.id == ownerId) {
						fetchTheNumAppointments()
					}
				} else {
					fetchTheNumReservations()
				}

        newRequests.forEach(function (item, index) {
          if (item.id == data.scheduleid) {
            newRequests.splice(index, 1)
          }
        })

				setRequests(newRequests)
			} else if (data.type == "cancelService") {
				const newAppointments = [...appointments]

        newAppointments.forEach(function(item, index) {
          if (item.id == data.id) {
            newAppointments.splice(index, 1)
          }
        })

				setAppointments(newAppointments)
				fetchTheNumAppointments()
				fetchTheNumReservations()
			} else if (data.type == "allowPayment") {
				const newAppointments = [...appointments]

        newAppointments.forEach(function (item, index) {
          if (item.id == data.scheduleid) {
            item.allowPayment = true
          }
        })

				setAppointments(newAppointments)
				fetchTheNumAppointments()
			} else if (data.type == "confirmPayment") {
				setRequestpaymentinfo({ 
					...requestPaymentinfo, serviceprice: data.price, servicetip: data.tip, 
					show: true, confirm: true 
				})

        setTimeout(function () {
          const newAppointments = [...appointments]

          newAppointments.forEach(function (item, index) {
            if (item.id == data.scheduleid) {
              newAppointments.splice(index, 1)
            }
          })

          setAppointments(newAppointments)
          setRequestpaymentinfo({ ...requestPaymentinfo, show: false, confirm: false })
          fetchTheNumAppointments()
        }, 3000)
			}
		})
		socket.on("updateOrders", () => {
      fetchTheNumRequests()
      fetchTheNumCartOrderers()
    })
		socket.on("updateCustomerOrders", data => {
			const newReservations = [...reservations]

      newReservations.forEach(function (item) {
        if (item.id == data.scheduleid) {
          item.numMakings += 1
        }
      })

			setReservations(newReservations)
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

		if (Constants.isDevice) getNotificationPermission()
		props.navigation.setParams({ firstTime: false })
	}

	useEffect(() => {
		initialize()
	}, [])

	useEffect(() => {
		isMounted.current = true

		startWebsocket()

		if (Constants.isDevice) {
			Notifications.addNotificationResponseReceivedListener(res => {
				const { data } = res.notification.request.content

				if (data.type == "makeAppointment") {
					const newAppointments = [...appointments]

          newAppointments.forEach(function (item) {
            if (item.id == data.id) {
              item.time = data.time
            }
          })

          setAppointments(newAppointments)
          fetchTheNumAppointments()
				} else if (data.type == "sendServicePayment") {
					const newAppointments = [...appointments]

          newAppointments.forEach(function (item, index) {
            if (item.id == data.scheduleid) {
              item.allowPayment = true
            }
          })

					setAppointments(newAppointments)
					fetchTheNumAppointments()
				} else if (data.type == "checkout") {
					fetchTheNumCartOrderers()
				}
			});
		}

		return () => {
			socket.off("updateRequests")
			socket.off("updateSchedules")
			socket.off("updateOrders")
			socket.off("updateCustomerOrders")

			isMounted.current = false
		}
	}, [
		requests.length, appointments.length, 
		cartOrderers.length, reservations.length
	])

	return (
		<SafeAreaView style={styles.main}>
			<View style={styles.box}>
				<View style={styles.body}>
					<View style={styles.navs}>
            <View style={styles.navsRow}>
  						{locationType == 'salon' && (
  							<TouchableOpacity style={[styles.nav, { backgroundColor: viewType == "appointments" ? 'black' : 'transparent', width: wsize(33) }]} onPress={() => getAllAppointments()}>
                  <Text style={[styles.navHeader, { color: viewType == "appointments" ? 'white' : 'black' }]}>{'Refresh\nAppointment(s)' + (numAppointments > 0 ? '\n' + numAppointments : '')}</Text>
  							</TouchableOpacity>
  						)}

  						{locationType == 'restaurant' && (
                <>
                  <TouchableOpacity style={[styles.nav, { backgroundColor: viewType == "requests" ? 'black' : 'transparent', width: wsize(30) }]} onPress={() => getAllRequests()}>
                    <Text style={[styles.navHeader, { color: viewType == "requests" ? 'white' : 'black' }]}>{numRequests + '\nRequest(s)'}</Text>
                  </TouchableOpacity>
    							<TouchableOpacity style={[styles.nav, { backgroundColor: viewType == "cartorderers" ? 'black' : 'transparent', width: wsize(30) }]} onPress={() => getAllCartOrderers()}>
    								<Text style={[styles.navHeader, { color: viewType == "cartorderers" ? 'white' : 'black' }]}>{numCartorderers + '\nOrderer(s)'}</Text>
    							</TouchableOpacity>
                  <TouchableOpacity style={[styles.nav, { backgroundColor: viewType == "reservations" ? 'black' : 'transparent', width: wsize(30) }]} onPress={() => getAllReservations()}>
                    <Text style={[styles.navHeader, { color: viewType == "reservations" ? 'white' : 'black' }]}>{numReservations + '\nReservation(s)'}</Text>
                  </TouchableOpacity>
                </>
  						)}
            </View>
					</View>

          {viewType == "requests" && (
            requests.length > 0 ? 
              <FlatList
                data={requests}
                renderItem={({ item, index }) => 
                  item.product ? 
                    <View key={item.key} style={styles.orderRequest}>
                      <View style={styles.orderRequestRow}>
                        <View>
                          <Text style={styles.orderRequestHeader}>{item.product}</Text>
                          <Text style={styles.orderRequestQuantity}>Quantity: {item.quantity}</Text>
                        </View>
                        <View style={styles.column}>
                          <TouchableOpacity style={styles.orderRequestSetPrice} onPress={() => setTheProductPrice(index, item.id)}>
                            <Text style={styles.orderRequestSetPriceHeader}>Set price{'\n'}for customer</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    :
                    <View key={item.key} style={styles.request}>
                      <View style={{ flexDirection: 'row' }}>
                        {item.image && (
                          <View style={styles.requestImageHolder}>
                            <Image style={styles.requestImage} source={{ uri: logo_url + item.image }}/>
                          </View>
                        )}
                          
                        <View style={styles.requestInfo}>
                          <Text>
                            {locationType == 'salon' ? 
                              (item.status == "requested" || item.status == "change") ? 
                                <>
                                  <Text style={styles.requestInfoHeader}>
                                    Client: {item.username}
                                    {'\n' + (item.status == 'change' ? 'Rebooking' : 'Booking')} for: {item.name}
                                    {'\n' + displayTime(item.time)}
                                    {item.worker != null && '\n\nwith worker: ' + item.worker.username}
                                  </Text>
                                </>
                                :
                                <>
                                  <Text style={styles.requestInfoHeader}>
                                    Client: {item.username}
                                    {'\n\n'}Booking for: {item.name}
                                    {'\n' + displayTime(item.time)}
                                    {item.worker != null && '\n\nwith worker: ' + item.worker.username}
                                  </Text>
                                  
                                  <Text style={styles.requestInfoStatus}>{'\n\n'}waiting for client to confirm</Text>
                                </>
                              :
                              <>
                                <Text style={styles.requestInfoHeader}>
                                  Customer: {item.username}
                                  {'\n' + (item.status == 'change' ? 'Rebooking' : 'Booking')} a reservation
                                  {'\n' + displayTime(item.time)}
                                  {item.diners > 0 ? '\nfor ' + item.diners + ' ' + (item.diners == 1 ? 'person' : 'people') : ' for 1 person'}
                                </Text>                                

                                {(item.status == "rebook" || item.status == "accepted") && <Text style={styles.requestInfoStatus}>{'\n\n'}waiting for client to confirm</Text>}
                              </>
                            }
                          </Text>
                          {item.note ? <Text style={{ fontWeight: 'bold', marginTop: 20 }}>Customer's note: {item.note}</Text> : null}
                        </View>
                      </View>

                      {(item.status == "requested" || item.status == "change") && (
                        <View style={styles.requestActions}>
                          <View style={{ flexDirection: 'row' }}>
                            <View style={styles.column}>
                              <TouchableOpacity style={styles.requestAction} onPress={() => {
                                if (locationType == 'salon') {
                                  props.navigation.navigate("booktime", { appointmentid: item.id, refetch: () => {
                                    fetchTheNumRequests()
                                    removeFromList(item.id, "requests")
                                  }})
                                } else {
                                  props.navigation.navigate("makereservation", { userid: item.userId, scheduleid: item.id, refetch: () => {
                                    fetchTheNumRequests()
                                    removeFromList(item.id, "requests")
                                  }})
                                }
                              }}>
                                <Text style={styles.requestActionHeader}>Too busy?{'\n'}Request another time</Text>
                              </TouchableOpacity>
                            </View>
                            <View style={styles.column}>
                              <TouchableOpacity style={styles.requestAction} onPress={() => cancelTheSchedule(index, "request")}>
                                <Text style={styles.requestActionHeader}>Cancel{'\n'}Request</Text>
                              </TouchableOpacity>
                            </View>
                            <View style={styles.column}>
                              <TouchableOpacity style={styles.requestAction} onPress={() => acceptTheRequest(index)}>
                                <Text style={styles.requestActionHeader}>Accept{'\n'}Request</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                }
              />
              :
              <View style={styles.bodyResult}>
                <Text style={styles.bodyResultHeader}>
                  {numRequests == 0 ? "No request(s) yet" : numRequests + " request(s)"}
                </Text>
              </View>
          )}

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

										{item.serviceid ? 
											<>
												<View style={styles.scheduleActions}>
                          <View style={styles.column}>
  													<TouchableOpacity style={[styles.scheduleAction, { opacity: item.gettingPayment ? 0.5 : 1 }]} disabled={item.gettingPayment} onPress={() => receiveTheepayment(index, item.id)}>
  														<Text style={styles.scheduleActionHeader}>{item.allowPayment == true ? 'Receive\ne-payment' : 'e-payment\nPayment awaits'}</Text>
  													</TouchableOpacity>
                          </View>
                          <View style={styles.column}>
  													<TouchableOpacity style={[styles.scheduleAction, { opacity: item.gettingPayment ? 0.5 : 1 }]} disabled={item.gettingPayment} onPress={() => receiveTheinpersonpayment(index, item.id)}>
  														<Text style={styles.scheduleActionHeader}>{item.allowPayment == true ? 'Receive\nin-person-pay' : 'in-person-pay\nPayment awaits'}</Text>
  													</TouchableOpacity>
                          </View>
												</View>
												{item.gettingPayment && <ActivityIndicator marginBottom={-5} color="black" size="small"/>}
											</>
											:
											<>
												<View style={styles.scheduleActions}>
                          <View style={styles.column}>
  													<TouchableOpacity style={styles.scheduleAction} onPress={() => cancelTheSchedule(index, "appointment")}>
  														<Text style={styles.scheduleActionHeader}>Cancel{'\n'}with client</Text>
  													</TouchableOpacity>
                          </View>
                          <View style={styles.column}>
  													<TouchableOpacity style={styles.scheduleAction} onPress={() => requestThePayment(index, item.id)}>
  														<Text style={styles.scheduleActionHeader}>Get payment</Text>
  													</TouchableOpacity>
                          </View>
												</View>
											</>
										}
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
									<View key={item.key} style={styles.cartorderer}>
										<View style={styles.cartordererImageHolder}>
											<Image style={styles.cartordererImage} source={{ uri: logo_url + item.profile }}/>
										</View>
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

					{viewType == "reservations" && (
						reservations.length > 0 ?
							<FlatList
								data={reservations}
								renderItem={({ item, index }) => 
									<View key={item.key} style={styles.schedule}>
										<View style={styles.scheduleRow}>
											<View style={styles.scheduleImageHolder}>
												<Image style={styles.scheduleImage} source={{ uri: logo_url + item.image }}/>
											</View>
											<Text style={styles.scheduleHeader}>
                        <Text style={{ fontFamily: defaultFont, fontWeight: 'bold' }}>
                          Booked by: {item.username}
                          {'\n' + displayTime(item.time)}
                          {'\n' + (item.diners > 0 ? item.diners + " " + (item.diners > 1 ? 'people' : 'person') : " 1 person")}
                          {'\n'}Table #{item.table}
                        </Text>
											</Text>
										</View>

										{item.seated ? 
											<View style={{ alignItems: 'center', marginVertical: 10 }}>
												<TouchableOpacity style={styles.scheduleAction} onPress={() => props.navigation.navigate("diningorders", { scheduleid: item.id, refetch: () => {
													fetchTheNumReservations()
													removeFromList(item.id, "reservations")
												}})}>
													<Text style={styles.scheduleActionHeader}>Customers' Orders</Text>
												</TouchableOpacity>
                        <Text style={styles.scheduleNumOrders}>{item.numMakings > 0 && item.numMakings + ' new order(s)'}</Text>
												<View style={{ alignItems: 'center' }}>
													<View style={{ flexDirection: 'row' }}>
														<TouchableOpacity style={[styles.scheduleAction, { opacity: item.gettingPayment ? 0.5 : 1 }]} disabled={item.gettingPayment} onPress={() => cancelTheSchedule(index, "reservation")}>
															<Text style={styles.scheduleActionHeader}>Cancel{'\n'}Reservation</Text>
														</TouchableOpacity>
														<TouchableOpacity style={[styles.scheduleAction, { opacity: item.gettingPayment ? 0.5 : 1 }]} disabled={item.gettingPayment} onPress={() => doneTheDining(index, item.id)}>
															<Text style={styles.scheduleActionHeader}>Receive{'\n'}payment</Text>
														</TouchableOpacity>
													</View>
                          {item.gettingPayment && <ActivityIndicator marginBottom={-5} color="black" size="small"/>}
												</View>
											</View>
											:
											<View style={{ alignItems: 'center', marginVertical: 10 }}>
												<View style={{ flexDirection: 'row' }}>
                          <View style={styles.column}>
  													<TouchableOpacity style={styles.scheduleAction} disabled={item.gettingPayment} onPress={() => cancelTheSchedule(index, "reservation")}>
  														<Text style={styles.scheduleActionHeader}>Cancel{'\n'}Reservation</Text>
  													</TouchableOpacity>
                          </View>
                          <View style={styles.column}>
  													<TouchableOpacity style={styles.scheduleAction} onPress={() => canServeTheDiners(index, item.id)}>
  														<Text style={styles.scheduleActionHeader}>Ready{'\n'}to serve</Text>
  													</TouchableOpacity>
                          </View>
												</View>
											</View>
										}
									</View>
								}
							/>
							:
							<View style={styles.bodyResult}>
                <Text style={styles.bodyResultHeader}>
  								{numReservations == 0 ? "No reservation(s) yet" : numReservations + " reservation(s)"}
                </Text>
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

			{productPrice.show && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.productInfoContainer}>
						<View style={styles.productInfoBox}>
							<Text style={styles.productInfoHeader}>Enter the price of {productPrice.name} for customer to pay:</Text>

							<TextInput 
								placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="example: 34.99"
								style={styles.productInfoInput}
								onChangeText={(price) => {
									let newPrice = price.toString()

									if (newPrice.includes(".") && newPrice.split(".")[1].length == 2) {
										Keyboard.dismiss()
									}

									setProductprice({ ...productPrice, price, errorMsg: "" })
								}}
								keyboardType="numeric" autoCorrect={false} autoCapitalize="none"
							/>

              <Text style={styles.errorMsg}>{productPrice.errorMsg}</Text>

							<View style={{ alignItems: 'center' }}>
								<View style={styles.productInfoActions}>
									<TouchableOpacity style={styles.productInfoAction} onPress={() => setProductprice({ ...productPrice, show: false })}>
										<Text style={styles.productInfoActionHeader}>Cancel</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.productInfoAction} onPress={() => setTheProductPrice()}>
										<Text style={styles.productInfoActionHeader}>Done</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
            <View style={styles.productInfoMenuContainer}>
              <FlatList
                style={{ marginTop: 10 }}
                data={productPrice.menus}
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
			{cancelInfo.show && (
				<Modal transparent={true}>
					<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
						<SafeAreaView style={styles.cancelRequestBox}>
							<Text style={styles.cancelRequestHeader}>
                Tell the 
                {cancelInfo.type == "restaurant" ? 
                  "diners" 
                  : 
                  " " + (cancelInfo.requestType == "appointment" || cancelInfo.requestType == "request" ? "client" : "diner(s)") + " "
                } 
                the reason for this cancellation ? (optional)
              </Text>

							<TextInput 
								placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Write your reason" 
								multiline={true} style={styles.cancelRequestInput} 
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
			{acceptRequestInfo.show && (
				<Modal transparent={true}>
					<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
						<SafeAreaView style={styles.acceptRequestContainer}>
							<View style={styles.acceptRequestBox}>
								<Text style={styles.acceptRequestHeader}>Tell the diner the table #?</Text>

								<TextInput placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder='What table will be available' style={styles.acceptRequestInput} onChangeText={(tablenum) => {
									setAcceptrequestinfo({
										...acceptRequestInfo,
										tablenum
									})
								}} value={acceptRequestInfo.tablenum} autoCorrect={false} autoComplete="none"/>

								{acceptRequestInfo.errorMsg ? <Text style={styles.errorMsg}>{acceptRequestInfo.errorMsg}</Text> : null}

								<View style={{ alignItems: 'center' }}>
									<View style={styles.acceptRequestActions}>
										<TouchableOpacity style={styles.acceptRequestAction} onPress={() => {
											getAllRequests()
											setAcceptrequestinfo({ ...acceptRequestInfo, show: false, tablenum: "" })
										}}>
											<Text style={styles.acceptRequestActionHeader}>Close</Text>
										</TouchableOpacity>
										<TouchableOpacity style={styles.acceptRequestAction} onPress={() => acceptTheRequest()}>
											<Text style={styles.acceptRequestActionHeader}>Done</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</SafeAreaView>
					</TouchableWithoutFeedback>
				</Modal>
			)}
			{requestPaymentinfo.show && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.requestPaymentContainer}>
            {!requestPaymentinfo.confirm ? 
              <View style={styles.requestPriceContainer}>
                <View style={styles.requestPriceBox}>
                  <Text style={styles.requestPriceHeader}>Enter the price of {requestPaymentinfo.servicename} ?</Text>

                  <TextInput 
                    placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="example: 12.99" 
                    style={styles.requestPriceInput} 
                    onChangeText={(price) => {
                      let newPrice = price.toString()

                      if (newPrice.includes(".") && newPrice.split(".")[1].length == 2) {
                        Keyboard.dismiss()
                      }

                      setRequestpaymentinfo({ ...requestPaymentinfo, serviceprice: newPrice, errorMsg: "" })
                    }} 
                    keyboardType="numeric" autoCorrect={false} autoCapitalize="none"
                  />

                  <Text style={styles.errorMsg}>{requestPaymentinfo.errorMsg}</Text>

                  <View style={{ alignItems: 'center' }}>
                    <View style={styles.requestPriceActions}>
                      <TouchableOpacity style={styles.requestPriceAction} onPress={() => setRequestpaymentinfo({ show: false, servicename: '', serviceprice: 0.00 })}>
                        <Text style={styles.requestPriceActionHeader}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.requestPriceAction} onPress={() => requestThePayment()}>
                        <Text style={styles.requestPriceActionHeader}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <View style={styles.requestPriceMenuContainer}>
                  <FlatList
                    style={{ marginTop: 10 }}
                    data={requestPaymentinfo.menus}
                    renderItem={({ item, index }) => 
                      item.row.map(info => (
                        info.photo && <Image key={info.key} style={{ height, width }} source={{ uri: logo_url + info.photo }}/>
                      ))
                    }
                  />
                </View>
              </View>
              :
              <View style={styles.requestPaymentConfirmBox}>
                <Text style={styles.requestPaymentConfirmHeader}>
                  Payment confirmed{'\n'}
                  You have received a payment of 
                  ${(requestPaymentinfo.serviceprice + requestPaymentinfo.servicetip).toFixed(2)}
                  {'\nGood job! :)'}
                </Text>
              </View>
            }
          </SafeAreaView>
				</Modal>
			)}
			{showBankaccountrequired.show && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.requiredBoxContainer}>
						<View style={styles.requiredBox}>
							<View style={styles.requiredContainer}>
								<Text style={styles.requiredHeader}>No bank account found</Text>

								<View style={{ alignItems: 'center' }}>
									<TouchableOpacity style={styles.requiredAction} onPress={() => setShowbankaccountrequired({ show: false, scheduleid: 0 })}>
										<Text style={styles.requiredActionHeader}>Close</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.requiredAction} onPress={() => {
										setShowbankaccountrequired({ show: false, scheduleid: 0 })
										props.navigation.navigate("settings", { required: "bankaccount" })
									}}>
										<Text style={styles.requiredActionHeader}>Add bank{'\n'}account</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</SafeAreaView>
				</Modal>
			)}
			{showPaymentrequired && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.requiredBoxContainer}>
						<View style={styles.requiredBox}>
							<View style={styles.requiredContainer}>
								<Text style={styles.requiredHeader}>
									The client hasn't provide any payment yet
								</Text>

								<View style={styles.requiredActions}>
									<TouchableOpacity style={styles.requiredAction} onPress={() => setShowpaymentrequired(false)}>
										<Text style={styles.requiredActionHeader}>Close</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</SafeAreaView>
				</Modal>
			)}
			{showPaymentunsent && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.requiredBoxContainer}>
						<View style={styles.requiredBox}>
							<View style={styles.requiredContainer}>
								<Text style={styles.requiredHeader}>
									Client hasn't sent payment yet.
								</Text>

								<View style={styles.requiredActions}>
									<TouchableOpacity style={styles.requiredAction} onPress={() => setShowpaymentunsent(false)}>
										<Text style={styles.requiredActionHeader}>Ok</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</SafeAreaView>
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
			{showPaymentconfirm.show && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.alertBoxContainer}>
						<View style={styles.alertBox}>
							<View style={styles.alertContainer}>
								<Text style={styles.alertHeader}>
									<Text>Congrats on your service of</Text>
									{'\n'}
									<Text style={{ fontFamily: defaultFont, fontWeight: 'bold' }}>{showPaymentconfirm.info.name}</Text>
									{'\n'}
									<Text>
                    for {showPaymentconfirm.info.clientName}
                    {'\n\n'}
                    You earned ${showPaymentconfirm.info.price.toFixed(2)}
                    {'\n\n'}
                    Good job! :)
                  </Text>
								</Text>
							</View>
						</View>
					</SafeAreaView>
				</Modal>
			)}
			{showUnservedorders && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.alertBoxContainer}>
						<View style={styles.alertBox}>
							<View style={styles.alertContainer}>
								<Text style={styles.alertHeader}>
                  You have orders from customers waiting to be served
								</Text>

								<View style={styles.alertActions}>
									<TouchableOpacity style={styles.alertAction} onPress={() => setShowunservedorders(false)}>
										<Text style={styles.alertActionHeader}>Ok</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</SafeAreaView>
				</Modal>
			)}
			{showWrongworker && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.alertBoxContainer}>
						<View style={styles.alertBox}>
							<View style={styles.alertContainer}>
								<Text style={styles.alertHeader}>Only the worker of this client can receive the payment</Text>

								<View style={styles.alertActions}>
									<TouchableOpacity style={styles.alertAction} onPress={() => setShowwrongworker(false)}>
										<Text style={styles.alertActionHeader}>Ok</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</SafeAreaView>
				</Modal>
			)}
			{showUnallowedpayment && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.alertBoxContainer}>
						<View style={styles.alertBox}>
							<View style={styles.alertContainer}>
								<Text style={styles.alertHeader}>The client hasn't allowed payment yet</Text>

								<View style={styles.alertActions}>
									<TouchableOpacity style={styles.alertAction} onPress={() => setShowunallowedpayment(false)}>
										<Text style={styles.alertActionHeader}>Ok</Text>
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

										{locationType == 'restaurant' ? 
											' requests, booked reservations and orders '
											:
											' requests and your scheduled appointments '
										}
										
										here
									</Text>
								: null }

								{showFirsttime.step == 1 ? 
									<Text style={styles.firstTimeHeader}>
										Before you can accept requests from {locationType == 'restaurant' ? 'diners' : 'clients'}
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

	navs: { alignItems: 'center', flexDirection: 'row', height: '15%', justifyContent: 'space-around', width: '100%' },
	navsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  nav: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, flexDirection: 'column', justifyContent: 'space-around', marginHorizontal: 5 },
	navHeader: { color: 'black', fontSize: wsize(4), paddingVertical: 5, textAlign: 'center' },

	// body
	body: { height: '75%' },

	// client appointment & order requests & order
	orderRequest: { borderRadius: 5, backgroundColor: 'white', marginHorizontal: 5, marginVertical: 2.5, padding: 10 },
	orderRequestRow: { flexDirection: 'row', justifyContent: 'space-between' },
	orderRequestHeader: { fontSize: wsize(4) },
	orderRequestQuantity: { fontSize: wsize(4), fontWeight: 'bold' },
	orderRequestSetPrice: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: wsize(30) },
	orderRequestSetPriceHeader: { fontSize: wsize(4), textAlign: 'center' },

  request: { borderRadius: 5, backgroundColor: 'white', marginHorizontal: 5, marginVertical: 2.5 },
  requestRow: { flexDirection: 'row', justifyContent: 'space-between' },
  requestImageHolder: { borderRadius: wsize(20) / 2, height: wsize(20), margin: 5, overflow: 'hidden', width: wsize(20) },
  requestImage: { height: wsize(20), width: wsize(20) },
  requestInfo: { fontFamily: 'appFont', fontSize: wsize(4), padding: 10, width: width - 100 },
  requestInfoHeader: { fontSize: wsize(4), fontWeight: 'bold' },
  requestInfoStatus: { color: 'darkgrey', fontStyle: 'italic', fontSize: wsize(4) },
  requestActions: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  requestAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: wsize(30) },
  requestActionHeader: { fontSize: wsize(4), textAlign: 'center' },

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

	cartorderer: { backgroundColor: 'white', borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', margin: 10, padding: 5 },
	cartordererImageHolder: { borderRadius: wsize(20) / 2, height: wsize(20), overflow: 'hidden', width: wsize(20) },
	cartordererImage: { height: wsize(20), width: wsize(20) },
	cartordererInfo: { alignItems: 'center', width: wsize(70) },
	cartordererUsername: { fontSize: wsize(5), fontWeight: 'bold', marginBottom: 10 },
	cartordererOrderNumber: { fontSize: wsize(5), paddingVertical: 5 },
  cartordererActions: { flexDirection: 'row', justifyContent: 'space-around' },
	cartordererAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: wsize(30) },
	cartordererActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	bodyResult: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around' },
	bodyResultHeader: { fontSize: wsize(4) },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', marginVertical: 5 },
	bottomNavHeader: { color: 'black', fontSize: wsize(4), fontWeight: 'bold', paddingVertical: 5 },
	bottomNavButton: { backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, paddingVertical: 8, width: wsize(30) },
	bottomNavButtonHeader: { color: 'white', fontSize: wsize(4), fontWeight: 'bold', textAlign: 'center' },

	productInfoContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	productInfoBox: { backgroundColor: 'white', flexDirection: 'column', height: '40%', justifyContent: 'space-around', width: '95%' },
	productInfoHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
	productInfoInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), margin: '5%', padding: 10, width: '90%' },
	productInfoActions: { flexDirection: 'row', justifyContent: 'space-around' },
	productInfoAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: wsize(30) },
	productInfoActionHeader: { fontSize: wsize(5), textAlign: 'center' },
  productInfoMenuContainer: { height: '60%', width: '95%' },

	cancelRequestBox: { backgroundColor: 'white', height: '100%', width: '100%' },
	cancelRequestHeader: { fontFamily: 'appFont', fontSize: wsize(6), marginHorizontal: 30, marginTop: 50, textAlign: 'center' },
	cancelRequestInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), height: 200, margin: '5%', padding: 10, width: '90%' },
	cancelRequestActions: { flexDirection: 'row', justifyContent: 'space-around' },
	cancelRequestTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: wsize(30) },
	cancelRequestTouchHeader: { fontSize: wsize(5), textAlign: 'center' },

	acceptRequestContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	acceptRequestBox: { backgroundColor: 'white', paddingVertical: 10, width: '80%' },
	acceptRequestHeader: { fontFamily: 'appFont', fontSize: wsize(6), marginHorizontal: 30, textAlign: 'center' },
	acceptRequestInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), margin: '5%', padding: 10, width: '90%' },
	acceptRequestActions: { flexDirection: 'row', justifyContent: 'space-around' },
	acceptRequestAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: wsize(30) },
	acceptRequestActionHeader: { fontSize: wsize(5), textAlign: 'center' },

	requestPaymentContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  requestPriceContainer: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
  requestPriceBox: { backgroundColor: 'white', flexDirection: 'column', height: '40%', justifyContent: 'space-around', width: '95%' },
  requestPriceHeader:  { fontSize: wsize(6), fontWeight: 'bold', textAlign: 'center' },
  requestPriceInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), margin: '5%', padding: 10, width: '90%' },
  requestPriceActions: { flexDirection: 'row', justifyContent: 'space-around' },
  requestPriceAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: wsize(30) },
  requestPriceActionHeader: { fontSize: wsize(5), textAlign: 'center' },
  requestPriceMenuContainer: { height: '60%', width: '95%' },

  requestPaymentConfirmBox: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '90%' },
  requestPaymentConfirmHeader: { fontFamily: 'appFont', fontSize: wsize(6), marginHorizontal: 30, textAlign: 'center' },
  requestPaymentConfirmActions: { flexDirection: 'row', justifyContent: 'space-around' },
  requestPaymentConfirmAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: wsize(30) },
  requestPaymentConfirmActionHeader: { fontSize: wsize(4), textAlign: 'center' },

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

  column: { flexDirection: 'column', justifyContent: 'space-around' },
  errorMsg: { color: 'darkred', textAlign: 'center' }
})
