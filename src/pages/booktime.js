import React, { useEffect, useState, useRef } from 'react'
import { ActivityIndicator, Dimensions, ScrollView, View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { getServiceInfo } from '../apis/services'
import { getAppointmentInfo, rescheduleAppointment } from '../apis/schedules'
import { getLocationHours } from '../apis/locations'
import { socket } from '../../assets/info'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight

const fsize = p => {
	return width * p
}

export default function booktime(props) {
	const months = ['January', 'February', 'March', 'April', 'May', 'Jun', 'July', 'August', 'September', 'October', 'November', 'December']
	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	const pushtime = 1000 * (60 * 10)

	const { appointmentid, refetch } = props.route.params

	const [ownerId, setOwnerid] = useState(null)
	const [name, setName] = useState('')
	const [serviceId, setServiceid] = useState(0)

	const [openTime, setOpentime] = useState({ hour: 0, minute: 0 })
	const [closeTime, setClosetime] = useState({ hour: 0, minute: 0 })
	const [selectedDateInfo, setSelecteddateinfo] = useState({ month: '', year: 0, day: '', date: 0, time: 0 })
	const [calendar, setCalendar] = useState({ firstDay: 0, numDays: 30, data: [
		{ key: "day-row-0", row: [
	    	{ key: "day-0-0", num: 0, passed: false }, { key: "day-0-1", num: 0, passed: false }, { key: "day-0-2", num: 0, passed: false }, 
	    	{ key: "day-0-3", num: 0, passed: false }, { key: "day-0-4", num: 0, passed: false }, { key: "day-0-5", num: 0, passed: false }, 
	    	{ key: "day-0-6", num: 0, passed: false }
    	]}, 
  		{ key: "day-row-1", row: [
	    	{ key: "day-1-0", num: 0, passed: false }, { key: "day-1-1", num: 0, passed: false }, { key: "day-1-2", num: 0, passed: false }, 
	    	{ key: "day-1-3", num: 0, passed: false }, { key: "day-1-4", num: 0, passed: false }, { key: "day-1-5", num: 0, passed: false }, 
	    	{ key: "day-1-6", num: 0, passed: false }
    	]}, 
    	{ key: "day-row-2", row: [
	    	{ key: "day-2-0", num: 0, passed: false }, { key: "day-2-1", num: 0, passed: false }, { key: "day-2-2", num: 0, passed: false }, 
	    	{ key: "day-2-3", num: 0, passed: false }, { key: "day-2-4", num: 0, passed: false }, { key: "day-2-5", num: 0, passed: false }, 
	    	{ key: "day-2-6", num: 0, passed: false }
    	]}, 
	  	{ key: "day-row-3", row: [
	    	{ key: "day-3-0", num: 0, passed: false }, { key: "day-3-1", num: 0, passed: false }, { key: "day-3-2", num: 0, passed: false }, 
	    	{ key: "day-3-3", num: 0, passed: false }, { key: "day-3-4", num: 0, passed: false }, { key: "day-3-5", num: 0, passed: false }, 
	    	{ key: "day-3-6", num: 0, passed: false }
	    ]}, 
	    { key: "day-row-4", row: [
	    	{ key: "day-4-0", num: 0, passed: false }, { key: "day-4-1", num: 0, passed: false }, { key: "day-4-2", num: 0, passed: false }, 
	    	{ key: "day-4-3", num: 0, passed: false }, { key: "day-4-4", num: 0, passed: false }, { key: "day-4-5", num: 0, passed: false }, 
	    	{ key: "day-4-6", num: 0, passed: false }
	    ]}, 
	    { key: "day-row-5", row: [
	    	{ key: "day-5-0", num: 0, passed: false }, { key: "day-5-1", num: 0, passed: false }, { key: "day-5-2", num: 0, passed: false }, 
	    	{ key: "day-5-3", num: 0, passed: false }, { key: "day-5-4", num: 0, passed: false }, { key: "day-5-5", num: 0, passed: false }, 
	    	{ key: "day-5-6", num: 0, passed: false }
	    ]}
	]})
	const [times, setTimes] = useState([])
	const [scheduledTimes, setScheduledtimes] = useState([])
	const [loaded, setLoaded] = useState(false)

	const [confirm, setConfirm] = useState({ show: false, timeheader: "", requested: false })

	const isMounted = useRef(null)
	
	const getTheAppointmentInfo = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")

		getAppointmentInfo(appointmentid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res && isMounted.current == true) {
					const { locationId, name } = res.appointmentInfo

					setOwnerid(ownerid)
					setName(name)
					getTheLocationHours(locationId)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {

				} else {
					alert("an error has occurred in server")
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

					const currTime = new Date(Date.now())
					const currDay = days[currTime.getDay()]
					const currDate = currTime.getDate()
					const currMonth = months[currTime.getMonth()]

					let openStr = currDay + " " + currMonth + " " + currTime.getDate() + " " + currTime.getFullYear() + " " + openHour + ":" + openMinute
					let closeStr = currDay + " " + currMonth + " " + currTime.getDate() + " " + currTime.getFullYear() + " " + closeHour + ":" + closeMinute
					let openDateStr = Date.parse(openStr), closeDateStr = Date.parse(closeStr)
					let newTimes = [], currenttime = Date.now(), currDateStr = openDateStr
					let firstDay = (new Date(currTime.getFullYear(), currTime.getMonth())).getDay()
					let numDays = 32 - new Date(currTime.getFullYear(), currTime.getMonth(), 32).getDate()
					let daynum = 1, data = calendar.data, datetime = 0, datenow = Date.parse(currDay + " " + currMonth + " " + currTime.getDate() + " " + currTime.getFullYear())

					data.forEach(function (info, rowindex) {
						info.row.forEach(function (day, dayindex) {
							day.num = 0

							if (rowindex == 0) {
								if (dayindex >= firstDay) {
									datetime = Date.parse(days[dayindex] + " " + currMonth + " " + daynum + " " + currTime.getFullYear())

									day.passed = datenow > datetime
									day.num = daynum
									daynum++
								}
							} else if (daynum <= numDays) {
								datetime = Date.parse(days[dayindex] + " " + currMonth + " " + daynum + " " + currTime.getFullYear())

								day.passed = datenow > datetime
								day.num = daynum
								daynum++
							}
						})
					})

					while (currDateStr < (closeDateStr - pushtime)) {
						currDateStr += pushtime

						let timestr = new Date(currDateStr)
						let hour = timestr.getHours()
						let minute = timestr.getMinutes()
						let period = hour < 12 ? "am" : "pm"

						let timedisplay = (hour <= 12 ? (hour == 0 ? "12" : hour) : hour - 12) + ":" + (minute < 10 ? '0' + minute : minute) + " " + period
						let timepassed = currenttime > currDateStr
						let timetaken = scheduled.indexOf(currDateStr) > -1
						
						newTimes.push({ 
							key: newTimes.length, header: timedisplay, 
							time: currDateStr, timetaken, timepassed
						})
					}

					setOpentime({ hour: openHour, minute: openMinute })
					setClosetime({ hour: closeHour, minute: closeMinute })
					setSelecteddateinfo({ month: currMonth, year: currTime.getFullYear(), day: currDay, date: currDate, time: 0 })
					setCalendar({ firstDay, numDays, data })
					setTimes(newTimes)
					setScheduledtimes(scheduled)
					setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					alert("an error has occurred in server")
				}
			})
	}
	const dateNavigate = (dir) => {
		setLoaded(false)

		const currTime = new Date(Date.now())
		const currDay = days[currTime.getDay()]
		const currMonth = months[currTime.getMonth()]

		let month = months.indexOf(selectedDateInfo.month), year = selectedDateInfo.year

		month = dir == 'left' ? month - 1 : month + 1

		if (month < 0) {
			month = 11
			year--
		} else if (month > 11) {
			month = 0
			year++
		}

		let firstDay, numDays, daynum = 1, data = calendar.data, datetime
		let datenow = Date.parse(currDay + " " + currMonth + " " + currTime.getDate() + " " + currTime.getFullYear())

		firstDay = (new Date(year, month)).getDay()
		numDays = 32 - new Date(year, month, 32).getDate()
		data.forEach(function (info, rowindex) {
			info.row.forEach(function (day, dayindex) {
				day.num = 0
				day.passed = false

				if (rowindex == 0) {
					if (dayindex >= firstDay) {
						datetime = Date.parse(days[dayindex] + " " + months[month] + " " + daynum + " " + year)

						day.passed = datenow > datetime
						day.num = daynum
						daynum++
					}
				} else if (daynum <= numDays) {
					datetime = Date.parse(days[dayindex] + " " + months[month] + " " + daynum + " " + year)

					day.passed = datenow > datetime
					day.num = daynum
					daynum++
				}
			})
		})

		let date = month == currTime.getMonth() && year == currTime.getFullYear() ? currTime.getDate() : 1
		let openStr = months[month] + " " + date + ", " + year + " " + openTime.hour + ":" + openTime.minute
		let closeStr = months[month] + " " + date + ", " + year + " " + closeTime.hour + ":" + closeTime.minute
		let openDateStr = Date.parse(openStr), closeDateStr = Date.parse(closeStr), currDateStr = openDateStr
		let currenttime = Date.now(), newTimes = []

		while (currDateStr < (closeDateStr - pushtime)) {
			currDateStr += pushtime

			let timestr = new Date(currDateStr)
			let hour = timestr.getHours()
			let minute = timestr.getMinutes()
			let period = hour < 12 ? "am" : "pm"

			let timedisplay = (hour <= 12 ? (hour == 0 ? "12" : hour) : hour - 12) + ":" + (minute < 10 ? '0' + minute : minute) + " " + period
			let timepassed = currenttime > currDateStr

			newTimes.push({ 
				key: newTimes.length, header: timedisplay, 
				time: currDateStr, timetaken: false, timepassed,
				disable: true
			})
		}

		setSelecteddateinfo({ ...selectedDateInfo, month: months[month], date: null, year })
		setCalendar({ firstDay, numDays, data })
		setTimes(newTimes)
		setLoaded(true)
	}
	const selectDate = (date) => {
		const { month, year } = selectedDateInfo

		let openStr = month + " " + date + ", " + year + " " + openTime.hour + ":" + openTime.minute
		let closeStr = month + " " + date + ", " + year + " " + closeTime.hour + ":" + closeTime.minute
		let openDateStr = Date.parse(openStr), closeDateStr = Date.parse(closeStr), currDateStr = openDateStr
		let currenttime = Date.now(), newTimes = []

		while (currDateStr < (closeDateStr - pushtime)) {
			currDateStr += pushtime

			let timestr = new Date(currDateStr)
			let hour = timestr.getHours()
			let minute = timestr.getMinutes()
			let period = hour < 12 ? "am" : "pm"

			let timedisplay = (hour <= 12 ? (hour == 0 ? "12" : hour) : hour - 12) + ":" + (minute < 10 ? '0' + minute : minute) + " " + period
			let timepassed = currenttime > currDateStr
			let timetaken = scheduledTimes.indexOf(currDateStr) > -1

			newTimes.push({ 
				key: newTimes.length, header: timedisplay, 
				time: currDateStr, timetaken, timepassed
			})
		}

		setSelecteddateinfo({ ...selectedDateInfo, date })
		setTimes(newTimes)
	}
	const selectTime = (name, timeheader, time) => {
		const { month, date, year } = selectedDateInfo
		const currTime = new Date(Date.now())

		const sTime = Date.parse(month + " " + date + " " + year + " " + timeheader)
		const eTime = Date.parse(months[currTime.getMonth()] + " " + currTime.getDate() + ", " + currTime.getFullYear() + " 23:59")
		let timedisplay = "", diff

		setSelecteddateinfo({ ...selectedDateInfo, name, time })

		if (selectedDateInfo.date) {
			if (sTime < eTime) {
				timedisplay = "today at " + timeheader
			} else if (sTime > eTime) {
				if (sTime - eTime > 86400000) { // tomorrow or more
					diff = sTime - eTime

					if (diff <= 604800000) { // this week
						let sDay = new Date(sTime)
						let eDay = new Date(eTime)

						if (sDay.getDay() == eDay.getDay()) {
							timedisplay = " next " + days[sDay.getDay()] + " at " + timeheader
						} else {
							timedisplay = " on " + days[sDay.getDay()] + " at " + timeheader
						}
					} else if (diff > 604800000 && diff <= 1210000000) { // next week
						let sDay = new Date(sTime)
						let eDay = new Date(eTime)

						if (sDay.getDay() != eDay.getDay()) {
							timedisplay = " next " + days[sDay.getDay()] + " at " + timeheader
						} else {
							timedisplay = " on " + days[sDay.getDay()] + ", " + months[sDay.getMonth()] + " " + date + " at " + timeheader
						}
					} else {
						let sDay = new Date(sTime)
						let eDay = new Date(eTime)

						if (sDay.getMonth() != eDay.getMonth()) {
							timedisplay = " on " + days[sDay.getDay()] + ", " + months[sDay.getMonth()] + " " + date + " at " + timeheader
						} else {
							timedisplay = " on " + days[sDay.getDay()] + ", " + date + " at " + timeheader
						}
					}
				} else {
					timedisplay = "tomorrow at " + timeheader
				}
			}

			setConfirm({ ...confirm, show: true, service: name, timeheader: timedisplay, time })
		}
	}
	const rescheduleTheAppointment = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const { month, date, year, time } = selectedDateInfo
		const { service } = confirm
		const selecteddate = new Date(time)
		const selectedtime = selecteddate.getHours() + ":" + selecteddate.getMinutes()
		const dateInfo = Date.parse(month + " " + date + ", " + year + " " + selectedtime).toString()
		let data = { ownerid, appointmentid, time: dateInfo, type: "rescheduleAppointment" }

		rescheduleAppointment(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					data = { ...data, receiver: res.receiver, worker: res.worker }
					socket.emit("socket/rescheduleAppointment", data, () => setConfirm({ ...confirm, requested: true }))
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					alert("an error has occurred in server")
				}
			})
	}
	
	useEffect(() => {
		isMounted.current = true

		getTheAppointmentInfo()

		return () => isMounted.current = false
	}, [])
	
	return (
		<View style={style.booktime}>
			{loaded ? 
				<View style={style.box}>
					<View style={style.headers}>
						<Text style={style.serviceHeader}><Text style={{ fontSize: fsize(0.04) }}>for</Text> client</Text>
						<Text style={style.serviceHeader}><Text style={{ fontSize: fsize(0.04) }}>requesting for</Text> {name}</Text>
					</View>
		
					<ScrollView style={style.body}>
						<View style={style.dateHeaders}>
							<View style={style.date}>
								<TouchableOpacity style={style.dateNav} onPress={() => dateNavigate('left')}><AntDesign name="left" size={25}/></TouchableOpacity>
								<Text style={style.dateHeader}>{selectedDateInfo.month}, {selectedDateInfo.year}</Text>
								<TouchableOpacity style={style.dateNav} onPress={() => dateNavigate('right')}><AntDesign name="right" size={25}/></TouchableOpacity>
							</View>

							<View style={style.dateDays}>
								<View style={style.dateDaysRow}>
									{days.map((day, index) => (
										<TouchableOpacity key={"day-header-" + index} style={style.dateDayTouchDisabled}>
											<Text style={{ fontWeight: 'bold', textAlign: 'center' }}>{day.substr(0, 3)}</Text>
										</TouchableOpacity>
									))}
								</View>
								{calendar.data.map((info, rowindex) => (
									<View key={info.key} style={style.dateDaysRow}>
										{info.row.map((day, dayindex) => (
											day.num > 0 ?
												day.passed ? 
													<TouchableOpacity key={day.key} disabled={true} style={style.dateDayTouchPassed}>
														<Text style={style.dateDayTouchHeader}>{day.num}</Text>
													</TouchableOpacity>
													:
													selectedDateInfo.date == day.num ?
														<TouchableOpacity key={day.key} style={style.dateDayTouchSelected} onPress={() => selectDate(day.num)}>
															<Text style={style.dateDayTouchSelectedHeader}>{day.num}</Text>
														</TouchableOpacity>
														:
														<TouchableOpacity key={day.key} style={style.dateDayTouch} onPress={() => selectDate(day.num)}>
															<Text style={style.dateDayTouchHeader}>{day.num}</Text>
														</TouchableOpacity>
												:
												<TouchableOpacity key={"calender-header-" + rowindex + "-" + dayindex} style={style.dateDayTouchDisabled}></TouchableOpacity>
										))}
									</View>
								))}
							</View>
						</View>
						<Text style={style.timesHeader}>Pick a time</Text>
						<View style={style.timesContainer}>
							<View style={style.times}>
								{times.map(info => (
									<View key={info.key}>
										{(!info.timetaken && !info.timepassed) && (
											<TouchableOpacity style={style.unselect} onPress={() => selectTime(name, info.header, info.time)}>
												<Text style={{ color: 'black' }}>{info.header}</Text>
											</TouchableOpacity>
										)}

										{(info.timetaken && !info.timepassed) && (
											<TouchableOpacity style={style.selected} disabled={true} onPress={() => {}}>
												<Text style={{ color: 'white' }}>{info.header}</Text>
											</TouchableOpacity>
										)}

										{(!info.timetaken && info.timepassed) && (
											<TouchableOpacity style={style.selectedPassed} disabled={true} onPress={() => {}}>
												<Text style={{ color: 'black' }}>{info.header}</Text>
											</TouchableOpacity>
										)}
									</View>
								))}
							</View>
						</View>
					</ScrollView>
				</View>
				:
				<View style={{ alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' }}>
					<ActivityIndicator color="black" size="small"/>
				</View>
			}
			
			{confirm.show && (
				<Modal transparent={true}>
					<View style={{ paddingVertical: offsetPadding }}>
						<View style={style.confirmBox}>
							<View style={style.confirmContainer}>
								{!confirm.requested ? 
									<>
										<Text style={style.confirmHeader}>
											<Text style={{ fontFamily: 'appFont' }}>Select this time for client</Text>
											{'\n' + confirm.timeheader}
											<Text style={{ fontFamily: 'appFont', fontSize: fsize(0.07) }}>{'\n\n for ' + confirm.service}</Text>
										</Text>

										<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
											<View style={style.confirmOptions}>
												<TouchableOpacity style={style.confirmOption} onPress={() => setConfirm({ show: false, timeheader: "", requested: false })}>
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
	booktime: { backgroundColor: 'white', height: '100%', paddingBottom: offsetPadding, width: '100%' },
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },

	headers: { flexDirection: 'column', height: '15%', justifyContent: 'space-around', width: '100%' },
	serviceHeader: { fontSize: fsize(0.06), fontWeight: 'bold', textAlign: 'center' },

	body: { height: '85%' },

	dateHeaders: { alignItems: 'center', marginVertical: 50 },
	date: { flexDirection: 'row', margin: 10 },
	dateNav: { marginHorizontal: 20 },
	dateHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), marginVertical: 5, textAlign: 'center', width: fsize(0.5) },
	dateDays: { alignItems: 'center' },
	dateDaysRow: { flexDirection: 'row' },

	dateDayTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 3, paddingVertical: 10, width: fsize(0.1) },
	dateDayTouchHeader: { color: 'black', fontSize: fsize(0.038), textAlign: 'center' },

	dateDayTouchSelected: { backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 3, paddingVertical: 10, width: fsize(0.1) },
	dateDayTouchSelectedHeader: { color: 'white', fontSize: fsize(0.038), textAlign: 'center' },

	dateDayTouchPassed: { backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 3, paddingVertical: 10, width: fsize(0.1) },
	dateDayTouchPassedHeader: { color: 'black', fontSize: fsize(0.038), textAlign: 'center' },

	dateDayTouchDisabled: { margin: 3, paddingVertical: 10, width: fsize(0.1) },
	dateDayTouchDisabledHeader: { fontSize: fsize(0.038), fontWeight: 'bold' },

	timesContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10, width: '100%' },
	timesHeader: { fontFamily: 'appFont', fontSize: fsize(0.07), fontWeight: 'bold', textAlign: 'center' },
	times: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', width: fsize(0.79) },
	
	unselect: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, paddingVertical: 10, width: fsize(0.25) },
	unselectHeader: { color: 'black', fontSize: fsize(0.04) },
	
	selected: { alignItems: 'center', backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, paddingVertical: 10, width: fsize(0.25) },
	selectedHeader: { color: 'white', fontSize: fsize(0.04) },

	selectedPassed: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, opacity: 0.3, paddingVertical: 10, width: fsize(0.25) },
	selectedPassedHeader: { color: 'black', fontSize: fsize(0.04) },

	// confirm & requested box
	confirmBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	confirmContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	confirmHeader: { fontSize: fsize(0.05), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	confirmOptions: { flexDirection: 'row' },
	confirmOption: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 60 },
	confirmOptionHeader: { textAlign: 'center' },
	requestedHeaders: { alignItems: 'center', paddingHorizontal: 10 },
	requestedClose: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, marginVertical: 10, padding: 5, width: 100 },
	requestedCloseHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), textAlign: 'center' },
	requestedHeader: { fontFamily: 'appFont', fontSize: fsize(0.06) },
	requestedHeaderInfo: { fontSize: fsize(0.05), textAlign: 'center' },
})
