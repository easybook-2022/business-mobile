import React, { useEffect, useState } from 'react'
import { AsyncStorage, ActivityIndicator, Dimensions, ScrollView, View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Constants from 'expo-constants';
import { getServiceInfo } from '../apis/services'
import { getAppointmentInfo, rescheduleAppointment } from '../apis/schedules'
import { getLocationHours } from '../apis/locations'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function booktime(props) {
	const { appointmentid, refetch } = props.route.params

	const [name, setName] = useState('')
	const [serviceId, setServiceid] = useState(0)
	const [times, setTimes] = useState([])
	const [loaded, setLoaded] = useState(false)

	const [confirm, setConfirm] = useState({ show: false, time: "", requested: false })

	const getTheAppointmentInfo = async() => {
		getAppointmentInfo(appointmentid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { locationId, name } = res.appointmentInfo

					setName(name)
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
					const { openTime, closeTime } = res
					let openHour = openTime.hour, openMinute = openTime.minute, openPeriod = openTime.period
					let closeHour = closeTime.hour, closeMinute = closeTime.minute, closePeriod = closeTime.period

					openHour = openPeriod == "PM" ? parseInt(openHour) + 12 : openHour
					closeHour = closePeriod == "PM" ? parseInt(closeHour) + 12 : closeHour

					const currTime = new Date(Date.now()).toString().split(" ")

					let openStr = currTime[0] + " " + currTime[1] + " " + currTime[2] + " " + currTime[3] + " " + openHour + ":" + openMinute
					let closeStr = currTime[0] + " " + currTime[1] + " " + currTime[2] + " " + currTime[3] + " " + closeHour + ":" + closeMinute
					let openDateStr = Date.parse(openStr), closeDateStr = Date.parse(closeStr)
					let k = 1, newTimes = []

					while (openDateStr < (closeDateStr - ((1000 * (60 * 10))))) {
						openDateStr += (1000 * (60 * 10)) // push every 10 minutes

						let timestr = new Date(openDateStr).toString().split(" ")[4]
						let time = timestr.split(":")
						let hour = parseInt(time[0])
						let minute = time[1]
						let period = hour > 11 ? "pm" : "am"

						let currtime = parseInt(hour.toString() + "" + minute)

						let timedisplay = (hour > 12 ? hour - 12 : hour) + ":" + minute + " " + period

						k++
						newTimes.push({ key: (k - 1).toString(), header: timedisplay, time: openDateStr, booked: false })
					}

					setTimes(newTimes)
					setLoaded(true)
				}
			})
	}
	const rescheduleTheAppointment = () => {
		let { service, time } = confirm
		let data = { appointmentid, time }

		rescheduleAppointment(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) setConfirm({ ...confirm, requested: true })
			})
			.catch((error) => {
				alert(error.message)
			})
	}
	
	useEffect(() => {
		getTheAppointmentInfo()
	}, [])
	
	return (
		<View style={{ paddingVertical: offsetPadding }}>
			<View style={style.box}>
				<TouchableOpacity style={style.back} onPress={() => props.navigation.goBack()}>
					<Text style={style.backHeader}>Back</Text>
				</TouchableOpacity>

				<Text style={style.boxHeader}>Request another time for client</Text>
				<Text style={style.serviceHeader}>Service: <Text style={{ fontWeight: 'bold' }}>{name}</Text></Text>

				{!loaded ? 
					<ActivityIndicator size="small"/>
					:
					<ScrollView>
						<View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around', marginBottom: 50, width: '100%' }}>
							<View style={style.times}>
								{times.map(info => (
									<TouchableOpacity style={info.booked ? style.selected : style.unselect} disabled={info.booked} key={info.key} onPress={() => {
										if (!info.booked) setConfirm({ ...confirm, show: true, service: name, timeheader: info.header, time: info.time })
									}}>
										<Text style={{ color: info.booked ? 'white' : 'black', fontSize: 15 }}>{info.header}</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>
					</ScrollView>
				}
			</View>
			
			{confirm.show && (
				<Modal transparent={true}>
					<View style={{ paddingVertical: offsetPadding }}>
						<View style={style.confirmBox}>
							<View style={style.confirmContainer}>
								{!confirm.requested ? 
									<>
										<Text style={style.confirmHeader}>
											<Text style={{ fontFamily: 'appFont' }}>Select this time for client</Text>
											{'\n'} at {confirm.timeheader + '\n for \n'}
											<Text style={{ fontFamily: 'appFont', fontSize: 30 }}>{confirm.service}</Text>
										</Text>

										<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
											<View style={style.confirmOptions}>
												<TouchableOpacity style={style.confirmOption} onPress={() => setConfirm({ show: false, time: "", requested: false })}>
													<Text style={style.confirmOptionHeader}>No</Text>
												</TouchableOpacity>
												<TouchableOpacity style={style.confirmOption} onPress={() => rescheduleTheAppointment()}>
													<Text style={style.confirmOptionHeader}>Yes</Text>
												</TouchableOpacity>
											</View>
										</View>
									</>
									:
									<>
										<View style={style.requestedHeaders}>
											<Text style={style.requestedHeader}>Time requested {'\n'}</Text>
											<Text style={style.requestedHeaderInfo}>at {confirm.timeheader} {'\n'}</Text>
											<Text style={style.requestedHeaderInfo}>You will get notify by the client</Text>

											<TouchableOpacity style={style.requestedClose} onPress={() => {
												setConfirm({ ...confirm, show: false, requested: false, errormsg: "" })
												refetch()
												props.navigation.goBack()
											}}>
												<Text style={style.requestedCloseHeader}>Ok</Text>
											</TouchableOpacity>
										</View>
									</>
								}
							</View>
						</View>
					</View>
				</Modal>
			)}
		</View>
	)
}

const style = StyleSheet.create({
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, height: 30, marginTop: 20, marginHorizontal: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },

	boxHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
	serviceHeader: { fontSize: 25, textAlign: 'center', marginBottom: 50 },

	times: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', width: 282 },
	unselect: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 5, width: 90 },
	selected: { alignItems: 'center', backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 5, width: 90 },

	// confirm & requested box
	confirmBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	confirmContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	confirmHeader: { fontSize: 20, fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	confirmOptions: { flexDirection: 'row' },
	confirmOption: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 60 },
	confirmOptionHeader: { textAlign: 'center' },
	requestedHeaders: { alignItems: 'center', paddingHorizontal: 10 },
	requestedClose: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, marginVertical: 10, padding: 5, width: 100 },
	requestedCloseHeader: { fontFamily: 'appFont', fontSize: 20, textAlign: 'center' },
	requestedHeader: { fontFamily: 'appFont', fontSize: 25 },
	requestedHeaderInfo: { fontSize: 20, textAlign: 'center' },
})
