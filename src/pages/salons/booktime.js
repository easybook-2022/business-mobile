import React, { useEffect, useState } from 'react'
import { ActivityIndicator, SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { requestTime } from '../../apis/menus'

export default function booktime(props) {
	let { name } = props.route.params

	let [service, setService] = useState(name)
	let [times, setTimes] = useState([])
	let [loaded, setLoaded] = useState(false)

	let [confirm, setConfirm] = useState({ show: false, time: "", requested: false })

	useEffect(() => {
		let timenow = Date.now()
		let k = 1

		while (times.length < 100) {
			timenow += (1000 * (60 * 10)) // push every 10 minutes

			let timestr = new Date(timenow).toString().split(" ")[4]
			let time = timestr.split(":")
			let hour = parseInt(time[0])
			let minute = time[1]
			let period = hour > 11 ? "pm" : "am"

			let currtime = parseInt(hour.toString() + "" + minute)

			if (currtime >= 1000 && currtime <= (2000 - 50)) {
				let timedisplay = (hour > 12 ? hour - 12 : hour) + ":" + minute + " " + period

				k++
				times.push({ key: (k - 1).toString(), header: timedisplay, time: timenow, booked: k % 2 == 0 ? true : false })
			}
		}

		setTimes(times)
		setLoaded(true)
	}, [])

	const selectTime = (time) => {
		setConfirm({
			...confirm,
			show: true,
			service: service,
			time: time
		})
	}
	const requestATime = () => {
		let { service, time } = confirm
		let data = { service, time }

		setConfirm({
			...confirm,
			requested: true
		})

		requestTime(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					let { serviceid } = res

					setTimeout(function () {
						setConfirm({
							...confirm,
							show: false,
							requested: false
						})
					}, 2000)
				}
			})
			.catch((error) => {
				alert(error.message)
			})
	}

	return (
		<SafeAreaView style={{ flex: 1 }}>
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
						<View style={style.times}>
							{times.map(info => (
								<TouchableOpacity style={info.booked ? style.selected : style.unselect} disabled={info.booked} key={info.key} onPress={() => {
									if (!info.booked) {
										selectTime(info.header)
									}
								}}>
									<Text style={{ color: info.booked ? 'white' : 'black', fontSize: 20 }}>{info.header}</Text>
								</TouchableOpacity>
							))}
						</View>
					</ScrollView>
				}
			</View>

			{confirm.show && (
				<Modal transparent={true}>
					<SafeAreaView style={{ flex: 1 }}>
						<View style={style.confirmBox}>
							<View style={style.confirmContainer}>
								{!confirm.requested ? 
									<>
										<Text style={style.confirmHeader}>
											<Text style={{ fontFamily: 'appFont' }}>Select this time for client</Text>
											{'\n'} at {' ' + confirm.time}
										</Text>

										<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
											<View style={style.confirmOptions}>
												<TouchableOpacity style={style.confirmOption} onPress={() => setConfirm({ show: false, time: "", requested: false })}>
													<Text style={style.confirmOptionHeader}>No</Text>
												</TouchableOpacity>
												<TouchableOpacity style={style.confirmOption} onPress={() => requestATime()}>
													<Text style={style.confirmOptionHeader}>Yes</Text>
												</TouchableOpacity>
											</View>
										</View>
									</>
									:
									<>
										<View style={style.requestedHeaders}>
											<Text style={style.requestedHeader}>Time requested {'\n'}</Text>
											<Text style={style.requestedHeaderInfo}>at {confirm.time} {'\n'}</Text>
											<Text style={style.requestedHeaderInfo}>You will get notified by client</Text>
										</View>
									</>
								}
							</View>
						</View>
					</SafeAreaView>
				</Modal>
			)}
		</SafeAreaView>
	)
}

const style = StyleSheet.create({
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, margin: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },

	boxHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
	serviceHeader: { fontSize: 25, textAlign: 'center', marginBottom: 50 },

	times: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', width: '100%' },
	unselect: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5 },
	selected: { alignItems: 'center', backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5 },

	// confirm & requested box
	confirmBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	confirmContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	confirmHeader: { fontSize: 20, fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	confirmOptions: { flexDirection: 'row' },
	confirmOption: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	confirmOptionHeader: { },
	requestedHeaders: { alignItems: 'center' },
	requestedHeader: { fontFamily: 'appFont', fontSize: 25 },
	requestedHeaderInfo: { fontSize: 20, textAlign: 'center' },
})
