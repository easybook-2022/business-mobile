import React, { useEffect, useState } from 'react'
import { AsyncStorage, ActivityIndicator, Dimensions, ScrollView, View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet, Modal } from 'react-native';
import Constants from 'expo-constants';
import { getLocationHours } from '../apis/locations'
import { getReservationInfo, rescheduleReservation } from '../apis/schedules'

import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function booktime(props) {
	let { userid, reservationid, refetch } = props.route.params

	const [name, setName] = useState(name)
	const [diners, setDiners] = useState(0)
	const [table, setTable] = useState('')
	const [times, setTimes] = useState([])
	const [openTime, setOpentime] = useState(0)
	const [closeTime, setClosetime] = useState(0)
	const [loaded, setLoaded] = useState(false)

	const [confirm, setConfirm] = useState({ show: false, service: "", timeheader: "", time: "", tablenum: "", requested: false, errorMsg: "" })
	
	const getTheReservationInfo = async() => {
		getReservationInfo(reservationid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { locationId, name, diners, table } = res.reservationInfo

					setName(name)
					setDiners(diners)
					setTable(table)
					getTheLocationHours(locationId)
				}
			})
	}
	const getTheLocationHours = async(locationid) => {
		const day = new Date(Date.now()).toString().split(" ")[0]
		const data = { locationid, day }

		getLocationHours(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { openTime, closeTime, scheduled } = res

					let openHour = openTime.hour, openMinute = openTime.minute, openPeriod = openTime.period
					let closeHour = closeTime.hour, closeMinute = closeTime.minute, closePeriod = closeTime.period

					openHour = openPeriod == "PM" ? parseInt(openHour) + 12 : openHour
					closeHour = closePeriod == "PM" ? parseInt(closeHour) + 12 : closeHour

					const currTime = new Date(Date.now()).toString().split(" ")

					let openStr = currTime[0] + " " + currTime[1] + " " + currTime[2] + " " + currTime[3] + " " + openHour + ":" + openMinute
					let closeStr = currTime[0] + " " + currTime[1] + " " + currTime[2] + " " + currTime[3] + " " + closeHour + ":" + closeMinute
					let openDateStr = Date.parse(openStr), closeDateStr = Date.parse(closeStr)
					let newTimes = [], currenttime = Date.now(), currDateStr = openDateStr, pushtime = 1000 * (60 * 5)

					while (currDateStr < (closeDateStr - pushtime)) {
						currDateStr += pushtime

						let timestr = new Date(currDateStr).toString().split(" ")[4]
						let time = timestr.split(":")
						let hour = parseInt(time[0])
						let minute = time[1]
						let period = hour > 11 ? "pm" : "am"

						let currtime = parseInt(hour.toString() + "" + minute)
						let timedisplay = (hour > 12 ? hour - 12 : hour) + ":" + minute + " " + period
						let timepassed = currenttime > currDateStr
						let timetaken = scheduled.indexOf(currDateStr) > -1

						newTimes.push({ 
							key: newTimes.length, header: timedisplay, 
							time: currDateStr, timetaken, timepassed
						})
					}

					setTimes(newTimes)
					setLoaded(true)
				}
			})
	}
	const rescheduleTheReservation = async() => {
		const userid = await AsyncStorage.getItem("userid")
		const { time, tablenum } = confirm
		const data = { reservationid, time, table: tablenum ? tablenum : table }

		rescheduleReservation(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setConfirm({ ...confirm, requested: true })
					refetch()
				}
			})
			.catch((error) => console.log(error.message))
	}

	useEffect(() => {
		getTheReservationInfo()
	}, [])

	return (
		<View style={{ paddingVertical: offsetPadding }}>
			<View style={style.box}>
				<TouchableOpacity style={style.back} onPress={() => {
					refetch()
					props.navigation.goBack()
				}}>
					<Text style={style.backHeader}>Back</Text>
				</TouchableOpacity>

				<Text style={style.boxHeader}>Request another time for {(diners + 1) > 0 ? '\n' + (diners + 1) + ' ' + ((diners + 1) == 1 ? 'person' : 'people') : "1 person"}</Text>
				
				{!loaded ? 
					<ActivityIndicator size="small"/>
					:
					<ScrollView>
						<Text style={style.timesHeader}>Availabilities</Text>
						<View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around', marginBottom: 50, width: '100%' }}>
							<View style={style.times}>
								{times.map(info => (
									<>
										{!info.timetaken && !info.timepassed ? 
											<TouchableOpacity style={style.unselect} key={info.key} onPress={() => setConfirm({ ...confirm, show: true, service: name, timeheader: info.header, time: info.time })}>
												<Text style={{ color: 'black', fontSize: 15 }}>{info.header}</Text>
											</TouchableOpacity>
											:
											info.timetaken ? 
												<TouchableOpacity style={style.selected} disabled={true} key={info.key} onPress={() => {}}>
													<Text style={{ color: 'white', fontSize: 15 }}>{info.header}</Text>
												</TouchableOpacity>
												:
												<TouchableOpacity style={style.selectedPassed} disabled={true} key={info.key} onPress={() => {}}>
													<Text style={{ color: 'black', fontSize: 15 }}>{info.header}</Text>
												</TouchableOpacity>
										}
									</>
								))}
							</View>
						</View>
					</ScrollView>
				}
			</View>

			{confirm.show && (
				<Modal transparent={true}>
					<TouchableWithoutFeedback style={{ paddingVertical: offsetPadding }} onPress={() => Keyboard.dismiss()}>
						<View style={style.confirmBox}>
							<View style={style.confirmContainer}>
								{!confirm.requested ? 
									<>
										<Text style={style.confirmHeader}>
											<Text style={{ fontFamily: 'appFont' }}>Request a different time for {(diners + 1) > 0 ? '\n' + (diners + 1) + ' ' + ((diners + 1) == 1 ? 'person' : 'people') : '1 person'}</Text>
											{'\n at ' + confirm.service}
											{'\n at ' + confirm.timeheader}
										</Text>

										<View style={{ alignItems: 'center' }}>
											<Text style={style.confirmHeader}>Tell the diner the table #?</Text>

											<TextInput placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder={table ? table + "? If not, please re-enter" : 'What table will be available'} style={style.confirmInput} onChangeText={(tablenum) => {
												setConfirm({
													...confirm,
													tablenum
												})
											}} autoCorrect={false}/>
										</View>

										{confirm.errorMsg ? <Text style={style.errorMsg}>{confirm.errorMsg}</Text> : null}

										<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
											<View style={style.confirmOptions}>
												<TouchableOpacity style={style.confirmOption} onPress={() => setConfirm({ show: false, service: "", time: "" })}>
													<Text style={style.confirmOptionHeader}>No</Text>
												</TouchableOpacity>
												<TouchableOpacity style={style.confirmOption} onPress={() => rescheduleTheReservation()}>
													<Text style={style.confirmOptionHeader}>Yes</Text>
												</TouchableOpacity>
											</View>
										</View>
									</>
									:
									<View style={style.requestedHeaders}>
										<Text style={style.requestedHeader}>Reservation requested at</Text>
										<Text style={style.requestedHeaderInfo}>{confirm.service}</Text>
										<Text style={style.requestedHeaderInfo}>at {confirm.timeheader}</Text>
										<Text style={style.requestedHeaderInfo}>for {diners + 1} diner{(diners + 1) > 1 ? "s" : ""}{'\n'}</Text>
										<Text style={style.requestedHeaderInfo}>You will get notify by the diners</Text>
										<TouchableOpacity style={style.requestedClose} onPress={() => {
											setConfirm({ ...confirm, show: false, requested: false })
											props.navigation.goBack()
										}}>
											<Text style={style.requestedCloseHeader}>Ok</Text>
										</TouchableOpacity>
									</View>
								}
							</View>
						</View>
					</TouchableWithoutFeedback>
				</Modal>
			)}
		</View>
	)
}

const style = StyleSheet.create({
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, height: 30, marginTop: 20, marginHorizontal: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },

	boxHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', marginBottom: 50, textAlign: 'center' },
	serviceHeader: { fontSize: 25, fontWeight: 'bold', textAlign: 'center', marginBottom: 50 },

	timesHeader: { fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', textAlign: 'center' },
	times: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', width: 282 },
	unselect: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 5, width: 90 },
	selected: { alignItems: 'center', backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 5, width: 90 },
	selectedPassed: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, opacity: 0.3, padding: 5, width: 90 },

	// confirm & requested box
	confirmBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	confirmContainer: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	confirmHeader: { fontSize: 20, fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	confirmInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: (width * 0.8) - 50 },
	confirmOptions: { flexDirection: 'row' },
	confirmOption: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	confirmOptionHeader: { },
	requestedHeaders: { alignItems: 'center', paddingHorizontal: 10 },
	requestedClose: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, marginVertical: 10, padding: 5, width: 100 },
	requestedCloseHeader: { fontFamily: 'appFont', fontSize: 20, textAlign: 'center' },
	requestedHeader: { fontFamily: 'appFont', fontSize: 25, textAlign: 'center' },
	requestedHeaderInfo: { fontSize: 20, textAlign: 'center' },
})
