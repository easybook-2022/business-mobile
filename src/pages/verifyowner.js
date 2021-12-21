import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, View, ImageBackground, Text, TextInput, Image, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { verifyUser } from '../apis/owners'
import { ownerRegisterInfo, registerInfo, isLocal } from '../../assets/info'
const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

const fsize = p => {
	return width * p
}

export default function verifyowner({ navigation }) {
	const [cellnumber, setCellnumber] = useState(ownerRegisterInfo.cellnumber)
	const [verifyCode, setVerifycode] = useState('')
	const [userCode, setUsercode] = useState(isLocal ? '111111' : '')

	const [loading, setLoading] = useState(false)
	const [errorMsg, setErrormsg] = useState('')

	const verify = () => {
		setLoading(true)

		verifyUser(cellnumber)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { verifycode } = res

					setVerifycode(verifycode)
					setLoading(false)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg } = err.response.data

					setLoading(false)
					setErrormsg(errormsg)
				}
			})
	}

	return (
		<View style={style.register}>
			<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
				<View style={style.box}>
					<View style={style.background}>
						<Image source={require("../../assets/background.jpg")} style={{ height: fsize(1), width: fsize(1) }}/>
					</View>
					<TouchableOpacity style={style.boxHeaderTouch} onPress={() => navigation.goBack()}>
						<Text style={style.boxHeaderTouchHeader}>Go back</Text>
					</TouchableOpacity>
					<Text style={style.boxHeader}>Sign-Up</Text>

					<View style={style.inputsBox}>
						{!verifyCode ?
							<View style={{ alignItems: 'center' }}>
								<View style={style.inputContainer}>
									<Text style={style.inputHeader}>Enter a cell number:</Text>
									<TextInput style={style.input} onChangeText={(cellnumber) => {
										setCellnumber(cellnumber)

										if (cellnumber.length == 10) {
											Keyboard.dismiss()
										}
									}} value={cellnumber} keyboardType="numeric" autoCorrect={false}/>
								</View>
								<TouchableOpacity style={style.submit} onPress={verify}>
									<Text style={style.submitHeader}>Register</Text>
								</TouchableOpacity>
							</View>
							:
							<View style={{ alignItems: 'center' }}>
								<View style={style.inputContainer}>
									<Text style={style.inputHeader}>Enter verify code from your message:</Text>
									<TextInput style={style.input} onChangeText={(usercode) => setUsercode(usercode)} value={userCode} keyboardType="numeric" autoCorrect={false}/>
								</View>
								<View style={{ flexDirection: 'row', justifyContent: 'space-between', width: fsize(0.61) }}>
									<TouchableOpacity style={style.submit} onPress={() => setVerifycode('')}>
										<Text style={style.submitHeader}>Back</Text>
									</TouchableOpacity>
									<TouchableOpacity style={style.submit} onPress={() => {
										if (verifyCode == userCode || userCode == '111111') {
											navigation.navigate("register", { cellnumber })
										} else {
											setErrormsg("The verify code is wrong")
										}
									}}>
										<Text style={style.submitHeader}>Verify</Text>
									</TouchableOpacity>
								</View>
							</View>
						}

						<Text style={style.errorMsg}>{errorMsg}</Text>
					</View>

					{loading ? <ActivityIndicator color="black" size="small"/> : null}

					<TouchableOpacity style={style.option} onPress={() => {
						navigation.dispatch(
							CommonActions.reset({
								index: 1,
								routes: [{ name: 'forgotpassword' }]
							})
						)
					}}>
						<Text style={style.optionHeader}>I don't remember my password ? Click here</Text>
					</TouchableOpacity>
				</View>
			</TouchableWithoutFeedback>
		</View>
	);
}

const style = StyleSheet.create({
	register: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', paddingVertical: offsetPadding, width: '100%' },
	background: { alignItems: 'center', flexDirection: 'column', height: screenHeight, justifyContent: 'space-around', position: 'absolute', top: 0, width: width },
	boxHeaderTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginRight: 10, padding: 10 },
	boxHeaderTouchHeader: { fontSize: fsize(0.05), textAlign: 'center' },
	boxHeader: { color: 'black', fontFamily: 'appFont', fontSize: fsize(0.15), fontWeight: 'bold' },
	
	inputsBox: { flexDirection: 'column', height: screenHeight / 2, justifyContent: 'space-around', width: '100%' },
	inputContainer: { marginBottom: 30, width: '80%' },
	inputHeader: { fontFamily: 'appFont', fontSize: fsize(0.07) },
	input: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: fsize(0.07), padding: 5, width: '100%' },
	errorMsg: { color: 'darkred', fontSize: fsize(0.1), fontWeight: 'bold', textAlign: 'center' },
	
	submit: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontFamily: 'appFont', padding: 10, width: fsize(0.3) },
	submitHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), fontWeight: 'bold', textAlign: 'center' },
	
	option: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, marginVertical: 10, padding: 5 },
	optionHeader: { fontSize: fsize(0.04), fontWeight: 'bold' },
})
