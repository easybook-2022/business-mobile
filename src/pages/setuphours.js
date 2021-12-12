import React, { useState, useEffect, useRef } from 'react'
import { ActivityIndicator, Dimensions, ScrollView, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { setLocationHours } from '../apis/locations'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')

export default function setuphours({ navigation }) {
	const offsetPadding = Constants.statusBarHeight
	const screenHeight = height - (offsetPadding * 2)
	
	const [locationType, setLocationtype] = useState('')
	const [days, setDays] = useState([
		{ key: "0", header: "Sunday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, close: null },
		{ key: "1", header: "Monday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, close: null },
		{ key: "2", header: "Tuesday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, close: null },
		{ key: "3", header: "Wednesday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, close: null },
		{ key: "4", header: "Thursday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, close: null },
		{ key: "5", header: "Friday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, close: null },
		{ key: "6", header: "Saturday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, close: null }
	])
	const [errorMsg, setErrormsg] = useState()
	const [loading, setLoading] = useState(false)
	const isMounted = useRef(null)
	
	const updateTime = (index, timetype, dir, open) => {
		const newDays = [...days]
		let value, period

		value = open ? 
			newDays[index].opentime[timetype]
			:
			newDays[index].closetime[timetype]

		switch (timetype) {
			case "hour":
				value = parseInt(value)
				value = dir == "up" ? value + 1 : value - 1

				if (value > 12) {
					value = 1
				} else if (value < 1) {
					value = 12
				}

				if (value < 10) {
					value = "0" + value
				}

				break
			case "minute":
				value = parseInt(value)
				value = dir == "up" ? value + 1 : value - 1

				if (value > 59) {
					value = 0
				} else if (value < 0) {
					value = 59
				}

				if (value < 10) {
					value = "0" + value
				}

				break
			case "period":
				value = value == "AM" ? "PM" : "AM"

				break
			default:
		}

		if (open) {
			newDays[index].opentime[timetype] = value
		} else {
			newDays[index].closetime[timetype] = value
		}

		setDays(newDays)
	}
	const dayTouch = index => {
		const newDays = [...days]

		newDays[index].close = !newDays[index].close

		setDays(newDays)
	}
	const done = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const locationid = await AsyncStorage.getItem("locationid")
		const hours = {}
		let invalid = false

		setLoading(true)

		days.forEach(function (day) {
			let { opentime, closetime, close } = day
			let newOpentime = {...opentime}, newClosetime = {...closetime}
			let openhour = parseInt(newOpentime.hour), closehour = parseInt(newClosetime.hour)
			let openperiod = newOpentime.period, closeperiod = newClosetime.period

			if (close == false) {
				if (openperiod == "PM") {
					if (openhour < 12) {
						openhour += 12
					}

					openhour = openhour < 10 ? 
						"0" + openhour
						:
						openhour.toString()
				} else {
					if (openhour == 12) {
						openhour = "00"
					} else if (openhour < 10) {
						openhour = "0" + openhour
					} else {
						openhour = openhour.toString()
					}
				}

				if (closeperiod == "PM") {
					if (closehour < 12) {
						closehour += 12
					}

					closehour = closehour < 10 ? 
						"0" + closehour
						:
						closehour.toString()
				} else {
					if (closehour == 12) {
						closehour = "00"
					} else if (closehour < 10) {
						closehour = "0" + closehour
					} else {
						closehour = closehour.toString()
					}
				}

				newOpentime.hour = openhour
				newClosetime.hour = closehour

				delete newOpentime.period
				delete newClosetime.period

				hours[day.header.substr(0, 3)] = { opentime: newOpentime, closetime: newClosetime, close }
			} else if (close == true) {
				hours[day.header.substr(0, 3)] = { opentime: newOpentime, closetime: newClosetime, close }
			} else {
				invalid = true
			}
		})

		if (!invalid) {
			const data = { ownerid, locationid, hours }

			setLocationHours(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						AsyncStorage.setItem("phase", "main")

						navigation.dispatch(
							CommonActions.reset({
								index: 0,
								routes: [{ name: "main" }]
							})
						)
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						setLoading(false)
					}
				})
		} else {
			setLoading(false)
			setErrormsg("Please choose an option for all the days")
		}
	}
	const getLocationType = async() => {
		const type = await AsyncStorage.getItem("type")

		if (isMounted.current == true) {
			setLocationtype(type)
		}
	}
	
	useEffect(() => {
		isMounted.current = true

		getLocationType()

		return () => isMounted.current = false
	}, [])

	return (
		<View style={style.setuphours}>
			<View style={{ paddingVertical: offsetPadding }}>
				<ScrollView style={{ backgroundColor: '#EAEAEA', height: screenHeight - 40, width: '100%' }}>
					<View style={[style.box, { opacity: loading ? 0.6 : 1 }]}>
						<Text style={style.boxHeader}>Setup</Text>
						<Text style={style.boxMiniheader}>Set the {locationType == 'hair' || locationType == 'nail' ? 'salon' : 'restaurant'}'s opening hours</Text>

						<View style={style.days}>
							{days.map((info, index) => (
								<View key={index} style={style.day}>
									{info.close == null ? 
										<View style={style.dayAnswer}>
											<Text style={style.dayHeader}>Is the store open on {info.header}?</Text>

											<View style={style.dayAnswerActions}>
												<TouchableOpacity style={style.dayAnswerAction} onPress={() => {
													const newDays = [...days]

													newDays[index].close = true

													setDays(newDays)
												}}>
													<Text>No</Text>
												</TouchableOpacity>
												<TouchableOpacity style={style.dayAnswerAction} onPress={() => {
													const newDays = [...days]

													newDays[index].close = false

													setDays(newDays)
												}}>
													<Text>Yes</Text>
												</TouchableOpacity>
											</View>
										</View>
										:
										<>
											{info.close == false ? 
												<>
													<View style={{ opacity: info.close ? 0.1 : 1 }}>
														<Text style={style.dayHeader}>The store is open on {info.header}</Text>
														<Text style={style.dayHeader}>Set the time</Text>
														<View style={style.timeSelectionContainer}>
															<View style={style.timeSelection}>
																<View style={style.selection}>
																	<TouchableOpacity onPress={() => updateTime(index, "hour", "up", true)}>
																		<AntDesign name="up" size={30}/>
																	</TouchableOpacity>
																	<Text style={style.selectionHeader}>{info.opentime.hour}</Text>
																	<TouchableOpacity onPress={() => updateTime(index, "hour", "down", true)}>
																		<AntDesign name="down" size={30}/>
																	</TouchableOpacity>
																</View>
																<Text style={style.selectionDiv}>:</Text>
																<View style={style.selection}>
																	<TouchableOpacity onPress={() => updateTime(index, "minute", "up", true)}>
																		<AntDesign name="up" size={30}/>
																	</TouchableOpacity>
																	<Text style={style.selectionHeader}>{info.opentime.minute}</Text>
																	<TouchableOpacity onPress={() => updateTime(index, "minute", "down", true)}>
																		<AntDesign name="down" size={30}/>
																	</TouchableOpacity>
																</View>
																<View style={style.selection}>
																	<TouchableOpacity onPress={() => updateTime(index, "period", "up", true)}>
																		<AntDesign name="up" size={30}/>
																	</TouchableOpacity>
																	<Text style={style.selectionHeader}>{info.opentime.period}</Text>
																	<TouchableOpacity onPress={() => updateTime(index, "period", "down", true)}>
																		<AntDesign name="down" size={30}/>
																	</TouchableOpacity>
																</View>
															</View>
															<Text style={style.timeSelectionHeader}>To</Text>
															<View style={style.timeSelection}>
																<View style={style.selection}>
																	<TouchableOpacity onPress={() => updateTime(index, "hour", "up", false)}>
																		<AntDesign name="up" size={30}/>
																	</TouchableOpacity>
																	<Text style={style.selectionHeader}>{info.closetime.hour}</Text>
																	<TouchableOpacity onPress={() => updateTime(index, "hour", "down", false)}>
																		<AntDesign name="down" size={30}/>
																	</TouchableOpacity>
																</View>
																<Text style={style.selectionDiv}>:</Text>
																<View style={style.selection}>
																	<TouchableOpacity onPress={() => updateTime(index, "minute", "up", false)}>
																		<AntDesign name="up" size={30}/>
																	</TouchableOpacity>
																	<Text style={style.selectionHeader}>{info.closetime.minute}</Text>
																	<TouchableOpacity onPress={() => updateTime(index, "minute", "down", false)}>
																		<AntDesign name="down" size={30}/>
																	</TouchableOpacity>
																</View>
																<View style={style.selection}>
																	<TouchableOpacity onPress={() => updateTime(index, "period", "up", false)}>
																		<AntDesign name="up" size={30}/>
																	</TouchableOpacity>
																	<Text style={style.selectionHeader}>{info.closetime.period}</Text>
																	<TouchableOpacity onPress={() => updateTime(index, "period", "down", false)}>
																		<AntDesign name="down" size={30}/>
																	</TouchableOpacity>
																</View>
															</View>
														</View>
													</View>
													<TouchableOpacity style={style.dayTouch} onPress={() => {
														const newDays = [...days]

														newDays[index].close = null

														setDays(newDays)
													}}>
														<Text style={style.dayTouchHeader}>Cancel</Text>
													</TouchableOpacity>
												</>
												:
												<>
													<Text style={style.dayHeader}>Not open on {info.header}</Text>

													<TouchableOpacity style={style.dayTouch} onPress={() => {
														const newDays = [...days]

														newDays[index].close = null

														setDays(newDays)
													}}>
														<Text style={style.dayTouchHeader}>Change</Text>
													</TouchableOpacity>
												</>
											}
										</>
									}
								</View>
							))}
						</View>

						<Text style={style.errorMsg}>{errorMsg}</Text>

						{loading && <ActivityIndicator size="large"/>}
						
						<TouchableOpacity style={style.done} disabled={loading} onPress={() => done()}>
							<Text style={style.doneHeader}>Done</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
				<View style={style.bottomNavs}>
					<View style={{ flexDirection: 'row' }}>
						<TouchableOpacity style={style.bottomNav} onPress={() => {
							AsyncStorage.clear()

							navigation.dispatch(
								CommonActions.reset({
									index: 1,
									routes: [{ name: 'login' }]
								})
							);
						}}>
							<Text style={style.bottomNavHeader}>Log-Out</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</View>
	)
}

const style = StyleSheet.create({
	setuphours: { backgroundColor: 'white' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	boxHeader: { fontFamily: 'appFont', fontSize: 50, fontWeight: 'bold', paddingVertical: 30 },
	boxMiniheader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', marginBottom: 30 },

	days: {  },
	day: { alignItems: 'center', marginVertical: 40, padding: 5 },
	dayHeader: { fontSize: 20, marginHorizontal: 10, textAlign: 'center' },
	dayAnswer: { alignItems: 'center' },
	dayAnswerActions: { flexDirection: 'row', justifyContent: 'space-around', width: 210 },
	dayAnswerAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 10, width: 100 },
	dayAnswerActionHeader: {  },
	timeSelectionContainer: { flexDirection: 'row' },
	timeSelection: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, flexDirection: 'row', marginHorizontal: 5 },
	timeSelectionHeader: { fontSize: 20, fontWeight: 'bold', paddingVertical: 38 },
	selection: { alignItems: 'center', margin: 5 },
	selectionHeader: { fontSize: 20, textAlign: 'center' },
	selectionDiv: { fontSize: 25, marginVertical: 27 },
	dayTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5 },
	dayTouchHeader: { fontSize: 20, textAlign: 'center' },

	errorMsg: { color: 'darkred', fontWeight: 'bold', textAlign: 'center' },

	done: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 30, padding: 5, width: 100 },
	doneHeader: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', height: 40, justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', height: 30, marginVertical: 5, marginHorizontal: 20 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },
})
