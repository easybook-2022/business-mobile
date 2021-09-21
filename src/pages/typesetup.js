import React, { useState, useEffect } from 'react'
import { AsyncStorage, ActivityIndicator, Dimensions, View, FlatList, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { setLocationType } from '../apis/locations'
import { registerInfo } from '../../assets/info'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - offsetPadding
const iconSize = (width / 2) - 90

export default function typesetup({ navigation }) {
	const [type, setType] = useState(registerInfo.storeType)
	const [loading, setLoading] = useState(false)
	const [errorMsg, setErrormsg] = useState('')
	
	const done = async() => {
		const ownerid = await AsyncStorage.getItem("ownerid")
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { ownerid, locationid, type }

		setLoading(true)
		
		setLocationType(data)
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
					AsyncStorage.setItem("phase", "setuphours")
					AsyncStorage.setItem("type", type)

					navigation.dispatch(
						CommonActions.reset({
							index: 0,
							routes: [{ name: "setuphours", params: { type } }]
						})
					)
				}
			})
	}
	return (
		<View style={style.typesetup}>
			<View style={{ paddingVertical: offsetPadding }}>
				<View style={[style.box, { opacity: loading ? 0.6 : 1 }]}>
					<Text style={style.boxHeader}>Setup</Text>
					<Text style={style.boxMiniheader}>What kind of service are you</Text>

					<View style={style.selections}>
						<TouchableOpacity style={type == 'hair' ? style.selectionSelected : style.selection} onPress={() => setType('hair')}>
							<Image source={require("../../assets/hairsalon.png")} style={style.selectionIcon}/>
						</TouchableOpacity>
						<TouchableOpacity style={type == 'nail' ? style.selectionSelected : style.selection} onPress={() => setType('nail')}>
							<Image source={require("../../assets/nailsalon.png")} style={style.selectionIcon}/>
						</TouchableOpacity>
						<TouchableOpacity style={type == 'restaurant' ? style.selectionSelected : style.selection} onPress={() => setType('restaurant')}>
							<Image source={require("../../assets/food.png")} style={style.selectionIcon}/>
						</TouchableOpacity>
					</View>
					
					{loading && <ActivityIndicator size="large"/>}

					<TouchableOpacity style={style.done} disabled={loading} onPress={() => done()}>
						<Text style={style.doneHeader}>Done</Text>
					</TouchableOpacity>

					{errorMsg ? <Text style={style.errorMsg}>{errorMsg}</Text> : null }

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
		</View>
	)
}

const style = StyleSheet.create({
	typesetup: { backgroundColor: 'white' },
	box: { alignItems: 'center', backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	boxHeader: { fontFamily: 'appFont', fontSize: 50, fontWeight: 'bold', paddingVertical: 30 },
	boxMiniheader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold' },

	selections: { flexDirection: 'column', height: '50%', justifyContent: 'space-around' },
	selection: { backgroundColor: 'rgba(127, 127, 127, 0.05)', borderRadius: iconSize / 2, borderStyle: 'solid', borderWidth: 2, height: iconSize, padding: 20, width: iconSize },
	selectionSelected: { backgroundColor: 'rgba(127, 127, 127, 0.8)', borderRadius: iconSize / 2, borderStyle: 'solid', borderWidth: 2, height: iconSize, padding: 20, width: iconSize },
	selectionIcon: { height: '100%', width: '100%' },

	done: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 100 },
	doneHeader: { fontWeight: 'bold', textAlign: 'center' },

	errorMsg: { color: 'red', fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
	setupButton: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 20, padding: 10 },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', height: 40, justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', height: 30, marginVertical: 5, marginHorizontal: 20 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },
})
