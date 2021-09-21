import React, { useState, useEffect } from 'react'
import { AsyncStorage, ActivityIndicator, Dimensions, ScrollView, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { setLocationHours } from '../apis/locations'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function setuphours({ navigation }) {
	const [locationType, setLocationtype] = useState('')
	const [days, setDays] = useState([
		{ key: "0", header: "Sunday", opentime: { hour: "00", minute: "00", period: "AM" }, closetime: { hour: "00", minute: "00", period: "AM" }},
		{ key: "1", header: "Monday", opentime: { hour: "00", minute: "00", period: "AM" }, closetime: { hour: "00", minute: "00", period: "AM" }},
		{ key: "2", header: "Tuesday", opentime: { hour: "00", minute: "00", period: "AM" }, closetime: { hour: "00", minute: "00", period: "AM" }},
		{ key: "3", header: "Wednesday", opentime: { hour: "00", minute: "00", period: "AM" }, closetime: { hour: "00", minute: "00", period: "AM" }},
		{ key: "4", header: "Thursday", opentime: { hour: "00", minute: "00", period: "AM" }, closetime: { hour: "00", minute: "00", period: "AM" }},
		{ key: "5", header: "Friday", opentime: { hour: "00", minute: "00", period: "AM" }, closetime: { hour: "00", minute: "00", period: "AM" }},
		{ key: "6", header: "Saturday", opentime: { hour: "00", minute: "00", period: "AM" }, closetime: { hour: "00", minute: "00", period: "AM" }}
	])
	const [loading, setLoading] = useState(false)
	
	const updateTime = (index, timetype, dir, open) => {
		const newDays = [...days]
		let value, period

		if (open) {
			value = newDays[index].opentime[timetype]
		} else {
			value = newDays[index].closetime[timetype]
		}

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
					value = 1
				} else if (value < 1) {
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
	const done = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const locationid = await AsyncStorage.getItem("locationid")
		const hours = {}

		setLoading(true)

		days.forEach(function (day) {
			hours[day.header.substr(0, 3)] = { opentime: day.opentime, closetime: day.closetime }
		})

		const data = { ownerid, locationid, hours }

		setLocationHours(data)
			.then((res) => {
				if (res.status == 200) {
					if (!res.data.errormsg) {
						return res.data
					} else {
						setLoading(false)
					}
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
	}
	const getLocationType = async() => {
		const type = await AsyncStorage.getItem("locationtype")

		setLocationtype(type)
	}
	
	useEffect(() => {
		getLocationType()
	}, [])

	return (
		<View style={style.setuphours}>
			<View style={{ paddingVertical: offsetPadding }}>
				<ScrollView style={{ backgroundColor: '#EAEAEA', height: screenHeight - 40, width: '100%' }}>
					<View style={[style.box, { opacity: loading ? 0.6 : 1 }]}>
						<Text style={style.boxHeader}>Setup</Text>
						<Text style={style.boxMiniheader}>Please set your opening hours</Text>

						<View style={style.days}>
							{days.map((day, index) => (
								<View key={index} style={{ marginVertical: 20 }}>
									<Text style={style.dayHeader}>{day.header}</Text>
									<View style={style.timeSelectionContainer}>
										<View style={style.timeSelection}>
											<View style={style.selection}>
												<TouchableOpacity onPress={() => updateTime(index, "hour", "up", true)}>
													<AntDesign name="up" size={30}/>
												</TouchableOpacity>
												<Text style={style.selectionHeader}>{day.opentime.hour}</Text>
												<TouchableOpacity onPress={() => updateTime(index, "hour", "down", true)}>
													<AntDesign name="down" size={30}/>
												</TouchableOpacity>
											</View>
											<Text style={style.selectionDiv}>:</Text>
											<View style={style.selection}>
												<TouchableOpacity onPress={() => updateTime(index, "minute", "up", true)}>
													<AntDesign name="up" size={30}/>
												</TouchableOpacity>
												<Text style={style.selectionHeader}>{day.opentime.minute}</Text>
												<TouchableOpacity onPress={() => updateTime(index, "minute", "down", true)}>
													<AntDesign name="down" size={30}/>
												</TouchableOpacity>
											</View>
											<View style={style.selection}>
												<TouchableOpacity onPress={() => updateTime(index, "period", "up", true)}>
													<AntDesign name="up" size={30}/>
												</TouchableOpacity>
												<Text style={style.selectionHeader}>{day.opentime.period}</Text>
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
												<Text style={style.selectionHeader}>{day.closetime.hour}</Text>
												<TouchableOpacity onPress={() => updateTime(index, "hour", "down", false)}>
													<AntDesign name="down" size={30}/>
												</TouchableOpacity>
											</View>
											<Text style={style.selectionDiv}>:</Text>
											<View style={style.selection}>
												<TouchableOpacity onPress={() => updateTime(index, "minute", "up", false)}>
													<AntDesign name="up" size={30}/>
												</TouchableOpacity>
												<Text style={style.selectionHeader}>{day.closetime.minute}</Text>
												<TouchableOpacity onPress={() => updateTime(index, "minute", "down", false)}>
													<AntDesign name="down" size={30}/>
												</TouchableOpacity>
											</View>
											<View style={style.selection}>
												<TouchableOpacity onPress={() => updateTime(index, "period", "up", false)}>
													<AntDesign name="up" size={30}/>
												</TouchableOpacity>
												<Text style={style.selectionHeader}>{day.closetime.period}</Text>
												<TouchableOpacity onPress={() => updateTime(index, "period", "down", false)}>
													<AntDesign name="down" size={30}/>
												</TouchableOpacity>
											</View>
										</View>
									</View>
								</View>
							))}
						</View>

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
	dayHeader: { fontSize: 20, marginHorizontal: 10, textAlign: 'center' },
	timeSelectionContainer: { flexDirection: 'row' },
	timeSelection: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, flexDirection: 'row', marginHorizontal: 5 },
	timeSelectionHeader: { fontSize: 20, fontWeight: 'bold', paddingVertical: 38 },
	selection: { alignItems: 'center', margin: 5 },
	selectionHeader: { fontSize: 20, textAlign: 'center' },
	selectionDiv: { fontSize: 25, marginVertical: 27 },

	done: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 30, padding: 5, width: 100 },
	doneHeader: { fontWeight: 'bold', textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', height: 40, justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', height: 30, marginVertical: 5, marginHorizontal: 20 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },
})
