import React, { useState, useEffect } from 'react'
import { AsyncStorage, Dimensions, ScrollView, View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { setLocationHours } from '../apis/locations'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function setuphours(props) {
	const { type } = props.route.params

	const [days, setDays] = useState([
		{ key: "0", header: "Sunday", opentime: { hour: "00", minute: "00", period: "AM" }, closetime: { hour: "00", minute: "00", period: "AM" }},
		{ key: "1", header: "Monday", opentime: { hour: "00", minute: "00", period: "AM" }, closetime: { hour: "00", minute: "00", period: "AM" }},
		{ key: "2", header: "Tuesday", opentime: { hour: "00", minute: "00", period: "AM" }, closetime: { hour: "00", minute: "00", period: "AM" }},
		{ key: "3", header: "Wednesday", opentime: { hour: "00", minute: "00", period: "AM" }, closetime: { hour: "00", minute: "00", period: "AM" }},
		{ key: "4", header: "Thursday", opentime: { hour: "00", minute: "00", period: "AM" }, closetime: { hour: "00", minute: "00", period: "AM" }},
		{ key: "5", header: "Friday", opentime: { hour: "00", minute: "00", period: "AM" }, closetime: { hour: "00", minute: "00", period: "AM" }},
		{ key: "6", header: "Saturday", opentime: { hour: "00", minute: "00", period: "AM" }, closetime: { hour: "00", minute: "00", period: "AM" }}
	])

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

		days.forEach(function (day) {
			hours[day.header] = { opentime: day.opentime, closetime: day.closetime }
		})

		const data = { ownerid, locationid, hours }

		setLocationHours(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				let route

				if (res) {
					if (type == "hair" || type == "nail") {
						route = "salons"
					} else {
						route = "restaurants"
					}

					AsyncStorage.setItem("phase", route)

					props.navigation.dispatch(
						CommonActions.reset({
							index: 0,
							routes: [{ name: route }]
						})
					)
				}
			})
	}

	return (
		<View style={{ paddingVertical: offsetPadding }}>
			<ScrollView style={{ width: '100%' }}>
				<View style={style.box}>
					<Text style={style.boxHeader}>Setup</Text>
					<Text style={style.boxMiniheader}>Set your store hours</Text>

					<View style={style.days}>
						{days.map((day, index) => (
							<View key={index} style={{ flexDirection: 'row', marginVertical: 20 }}>
								<Text style={style.dayHeader}>{day.header}</Text>
								<View style={style.timeSelection}>
									<View style={style.selection}>
										<TouchableOpacity onPress={() => updateTime(index, "hour", "up", true)}>
											<AntDesign name="up" size={20}/>
										</TouchableOpacity>
										<Text style={style.selectionHeader}>{day.opentime.hour}</Text>
										<TouchableOpacity onPress={() => updateTime(index, "hour", "down", true)}>
											<AntDesign name="down" size={20}/>
										</TouchableOpacity>
									</View>
									<Text style={style.selectionDiv}>:</Text>
									<View style={style.selection}>
										<TouchableOpacity onPress={() => updateTime(index, "minute", "up", true)}>
											<AntDesign name="up" size={20}/>
										</TouchableOpacity>
										<Text style={style.selectionHeader}>{day.opentime.minute}</Text>
										<TouchableOpacity onPress={() => updateTime(index, "minute", "down", true)}>
											<AntDesign name="down" size={20}/>
										</TouchableOpacity>
									</View>
									<View style={style.selection}>
										<TouchableOpacity onPress={() => updateTime(index, "period", "up", true)}>
											<AntDesign name="up" size={20}/>
										</TouchableOpacity>
										<Text style={style.selectionHeader}>{day.opentime.period}</Text>
										<TouchableOpacity onPress={() => updateTime(index, "period", "down", true)}>
											<AntDesign name="down" size={20}/>
										</TouchableOpacity>
									</View>
								</View>
								<View style={style.timeSelection}>
									<View style={style.selection}>
										<TouchableOpacity onPress={() => updateTime(index, "hour", "up", false)}>
											<AntDesign name="up" size={20}/>
										</TouchableOpacity>
										<Text style={style.selectionHeader}>{day.closetime.hour}</Text>
										<TouchableOpacity onPress={() => updateTime(index, "hour", "down", false)}>
											<AntDesign name="down" size={20}/>
										</TouchableOpacity>
									</View>
									<Text style={style.selectionDiv}>:</Text>
									<View style={style.selection}>
										<TouchableOpacity onPress={() => updateTime(index, "minute", "up", false)}>
											<AntDesign name="up" size={20}/>
										</TouchableOpacity>
										<Text style={style.selectionHeader}>{day.closetime.minute}</Text>
										<TouchableOpacity onPress={() => updateTime(index, "minute", "down", false)}>
											<AntDesign name="down" size={20}/>
										</TouchableOpacity>
									</View>
									<View style={style.selection}>
										<TouchableOpacity onPress={() => updateTime(index, "period", "up", false)}>
											<AntDesign name="up" size={20}/>
										</TouchableOpacity>
										<Text style={style.selectionHeader}>{day.closetime.period}</Text>
										<TouchableOpacity onPress={() => updateTime(index, "period", "down", false)}>
											<AntDesign name="down" size={20}/>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						))}
					</View>

					<TouchableOpacity style={style.done} onPress={() => done()}>
						<Text style={style.doneHeader}>Done</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	)
}

const style = StyleSheet.create({
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	boxHeader: { fontFamily: 'appFont', fontSize: 50, fontWeight: 'bold', paddingVertical: 30 },
	boxMiniheader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold' },

	days: {  },
	dayHeader: { fontSize: 20, marginHorizontal: 10, marginVertical: 30 },
	timeSelection: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, flexDirection: 'row', height: 75, marginHorizontal: 5 },
	selection: { margin: 5 },
	selectionHeader: { fontSize: 15, textAlign: 'center' },
	selectionDiv: { fontSize: 15, marginVertical: 29 },

	done: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 100 },
	doneHeader: { fontWeight: 'bold', textAlign: 'center' },
})
