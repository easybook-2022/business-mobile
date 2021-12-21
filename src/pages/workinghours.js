import React, { useState, useEffect, useRef } from 'react'
import { ActivityIndicator, Dimensions, ScrollView, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { setLocationHours } from '../apis/locations'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

const fsize = p => {
	return width * p
}

export default function workinghours({ navigation }) {
	const [type, setType] = useState('')
	const [workerHours, setWorkerhours] = useState([
		{ key: "0", header: "Sunday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: null },
		{ key: "1", header: "Monday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: null },
		{ key: "2", header: "Tuesday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: null },
		{ key: "3", header: "Wednesday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: null },
		{ key: "4", header: "Thursday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: null },
		{ key: "5", header: "Friday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: null },
		{ key: "6", header: "Saturday", opentime: { hour: "12", minute: "00", period: "AM" }, closetime: { hour: "11", minute: "59", period: "PM" }, working: null }
	])
	const [errorMsg, setErrormsg] = useState()
	const [loading, setLoading] = useState(false)
	const isMounted = useRef(null)
	
	const getInfo = async() => setType(await AsyncStorage.getItem("locationtype"))
	const done = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const hours = {}
		let invalid = false

		setLoading(true)

		workerHours.forEach(function (workerHour) {
			let { opentime, closetime, working } = workerHour
			let newOpentime = {...opentime}, newClosetime = {...closetime}
			let openhour = parseInt(newOpentime.hour), closehour = parseInt(newClosetime.hour)
			let openperiod = newOpentime.period, closeperiod = newClosetime.period

			if (working == true) {
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

				hours[workerHour.header.substr(0, 3)] = { opentime: newOpentime, closetime: newClosetime, working }
			} else if (working == false) {
				hours[workerHour.header.substr(0, 3)] = { opentime: newOpentime, closetime: newClosetime, working }
			} else {
				invalid = true
			}
		})

		if (!invalid) {
			const data = { ownerid, hours }

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
	
	useEffect(() => {
		isMounted.current = true

		return () => isMounted.current = false
	}, [])

	return (
		<View style={style.workinghours}>
			<View style={{ paddingVertical: offsetPadding }}>
				{!type ? 
					<View style={style.introBox}>
						<Text style={style.introHeader}>The Final Step</Text>
						<Text style={style.introHeader}>Let's set your working days and hours</Text>
						<TouchableOpacity style={style.submit} disabled={loading} onPress={() => getInfo()}>
							<Text style={style.submitHeader}>Let's go</Text>
						</TouchableOpacity>
					</View>
					:
					<ScrollView style={{ backgroundColor: '#EAEAEA', height: screenHeight - 40, width: '100%' }}>
						<View style={[style.box, { opacity: loading ? 0.6 : 1 }]}>

							<Text style={style.boxHeader}>Your time</Text>
							<Text style={style.boxMiniheader}>Set your working days and hours</Text>

							<View style={style.days}>
								{workerHours.map((info, index) => (
									<View key={index} style={style.workerHour}>
										{info.working == null ? 
											<View style={style.workerHourAnswer}>
												<Text style={style.workerHourHeader}>Are you working on {info.header}?</Text>

												<Text style={[style.workerHourHeader, { marginTop: 10 }]}>Tap 'No' or 'Yes'</Text>

												<View style={style.workerHourAnswerActions}>
													<TouchableOpacity style={style.workerHourAnswerAction} onPress={() => {
														const newWorkerhours = [...workerHours]

														newWorkerhours[index].working = false

														setWorkerhours(newWorkerhours)
													}}>
														<Text style={style.workerHourAnswerActionHeader}>No</Text>
													</TouchableOpacity>
													<TouchableOpacity style={style.workerHourAnswerAction} onPress={() => {
														const newWorkerhours = [...workerHours]

														newWorkerhours[index].working = true

														setWorkerhours(newWorkerhours)
													}}>
														<Text style={style.workerHourAnswerActionHeader}>Yes</Text>
													</TouchableOpacity>
												</View>
											</View>
											:
											<>
												{info.working == true ? 
													<>
														<View style={{ opacity: info.working ? 1 : 0.1 }}>
															<Text style={style.workerHourHeader}>You are working on {info.header}</Text>
															<Text style={[style.workerHourHeader, { marginTop: 10 }]}>Use the arrow to set the time</Text>
															<View style={style.timeSelectionContainer}>
																<View style={style.timeSelection}>
																	<View style={style.selection}>
																		<TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "up", true)}>
																			<AntDesign name="up" size={fsize(0.08)}/>
																		</TouchableOpacity>
																		<Text style={style.selectionHeader}>{info.opentime.hour}</Text>
																		<TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "down", true)}>
																			<AntDesign name="down" size={fsize(0.08)}/>
																		</TouchableOpacity>
																	</View>
																	<Text style={style.selectionDiv}>:</Text>
																	<View style={style.selection}>
																		<TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "up", true)}>
																			<AntDesign name="up" size={fsize(0.08)}/>
																		</TouchableOpacity>
																		<Text style={style.selectionHeader}>{info.opentime.minute}</Text>
																		<TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "down", true)}>
																			<AntDesign name="down" size={fsize(0.08)}/>
																		</TouchableOpacity>
																	</View>
																	<View style={style.selection}>
																		<TouchableOpacity onPress={() => updateWorkingHour(index, "period", "up", true)}>
																			<AntDesign name="up" size={fsize(0.08)}/>
																		</TouchableOpacity>
																		<Text style={style.selectionHeader}>{info.opentime.period}</Text>
																		<TouchableOpacity onPress={() => updateWorkingHour(index, "period", "down", true)}>
																			<AntDesign name="down" size={fsize(0.08)}/>
																		</TouchableOpacity>
																	</View>
																</View>
																<Text style={style.timeSelectionHeader}>To</Text>
																<View style={style.timeSelection}>
																	<View style={style.selection}>
																		<TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "up", false)}>
																			<AntDesign name="up" size={fsize(0.08)}/>
																		</TouchableOpacity>
																		<Text style={style.selectionHeader}>{info.closetime.hour}</Text>
																		<TouchableOpacity onPress={() => updateWorkingHour(index, "hour", "down", false)}>
																			<AntDesign name="down" size={fsize(0.08)}/>
																		</TouchableOpacity>
																	</View>
																	<Text style={style.selectionDiv}>:</Text>
																	<View style={style.selection}>
																		<TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "up", false)}>
																			<AntDesign name="up" size={fsize(0.08)}/>
																		</TouchableOpacity>
																		<Text style={style.selectionHeader}>{info.closetime.minute}</Text>
																		<TouchableOpacity onPress={() => updateWorkingHour(index, "minute", "down", false)}>
																			<AntDesign name="down" size={fsize(0.08)}/>
																		</TouchableOpacity>
																	</View>
																	<View style={style.selection}>
																		<TouchableOpacity onPress={() => updateWorkingHour(index, "period", "up", false)}>
																			<AntDesign name="up" size={fsize(0.08)}/>
																		</TouchableOpacity>
																		<Text style={style.selectionHeader}>{info.closetime.period}</Text>
																		<TouchableOpacity onPress={() => updateWorkingHour(index, "period", "down", false)}>
																			<AntDesign name="down" size={fsize(0.08)}/>
																		</TouchableOpacity>
																	</View>
																</View>
															</View>
														</View>
														<TouchableOpacity style={style.workerHourTouch} onPress={() => {
															const newWorkerhours = [...workerHours]

															newWorkerhours[index].working = null

															setWorkerhours(newWorkerhours)
														}}>
															<Text style={style.workerHourTouchHeader}>Cancel</Text>
														</TouchableOpacity>
													</>
													:
													<>
														<Text style={style.workerHourHeader}>Not working on {info.header}</Text>

														<TouchableOpacity style={style.workerHourTouch} onPress={() => {
															const newWorkerhours = [...workerHours]

															newWorkerhours[index].working = null

															setWorkerhours(newWorkerhours)
														}}>
															<Text style={style.workerHourTouchHeader}>Change</Text>
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
							
							<TouchableOpacity style={style.submit} disabled={loading} onPress={() => done()}>
								<Text style={style.submitHeader}>Done</Text>
							</TouchableOpacity>
						</View>
					</ScrollView>
				}

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
	workinghours: { backgroundColor: 'white' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	boxHeader: { fontFamily: 'appFont', fontSize: fsize(0.1), fontWeight: 'bold', paddingVertical: 30 },
	boxMiniheader: { fontFamily: 'appFont', fontSize: fsize(0.05), fontWeight: 'bold', marginBottom: 30 },

	introBox: { alignItems: 'center', flexDirection: 'column', height: screenHeight - 40, justifyContent: 'space-around', width: '100%' },
	introHeader: { fontSize: fsize(0.1), textAlign: 'center' },

	workerHours: { marginVertical: 50 },
	workerHour: { alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 10, marginTop: 30, padding: 5 },
	workerHourHeader: { fontSize: fsize(0.05), fontWeight: 'bold', marginBottom: 10, marginHorizontal: 10, textAlign: 'center' },
	workerHourAnswer: { alignItems: 'center' },
	workerHourAnswerActions: { flexDirection: 'row', justifyContent: 'space-between' },
	workerHourAnswerAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 10, width: fsize(0.15) },
	workerHourAnswerActionHeader: { fontSize: fsize(0.04) },
	timeSelectionContainer: { flexDirection: 'row' },
	timeSelection: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, flexDirection: 'row', marginHorizontal: 5 },
	timeSelectionHeader: { fontSize: fsize(0.05), fontWeight: 'bold', paddingVertical: 38 },
	selection: { alignItems: 'center', margin: 5 },
	selectionHeader: { fontSize: fsize(0.05), textAlign: 'center' },
	selectionDiv: { fontSize: fsize(0.07), marginVertical: fsize(0.07) },
	workerHourTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5 },
	workerHourTouchHeader: { fontSize: fsize(0.05), textAlign: 'center' },

	errorMsg: { color: 'darkred', fontWeight: 'bold', textAlign: 'center' },

	submit: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 30, padding: 5, width: fsize(0.3) },
	submitHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', height: 40, justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', height: 30, marginVertical: 5, marginHorizontal: 20 },
	bottomNavHeader: { fontSize: fsize(0.04), fontWeight: 'bold', paddingVertical: 5 },
})
