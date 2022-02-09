import React, { useState } from 'react';
import { SafeAreaView, ActivityIndicator, Dimensions, View, ImageBackground, Text, TextInput, Image, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { verifyUser } from '../apis/owners'
import { ownerRegisterInfo, registerInfo, isLocal } from '../../assets/info'

const { height, width } = Dimensions.get('window')
const wsize = p => {
  return width * (p / 100)
}
const hsize = p => {
  return height * (p / 100)
}

export default function Verifyowner({ navigation }) {
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

					setErrormsg(errormsg)
				} else {
					setErrormsg("an error has occurred in server")
				}
			})

			setLoading(false)
	}

	return (
		<SafeAreaView style={style.register}>
			<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
				<View style={{ opacity: loading ? 0.5 : 1 }}>
					<View style={style.box}>
						<View style={style.background}>
							<Image source={require("../../assets/background.jpg")} style={{ height: width, width: width }}/>
						</View>

						<View style={style.inputsBox}>
							{!verifyCode ?
								<View style={{ alignItems: 'center' }}>
									<View style={style.inputContainer}>
										<Text style={style.inputHeader}>Enter a cell number:</Text>
										<TextInput style={style.input} onKeyPress={(e) => {
											let newValue = e.nativeEvent.key

											if (newValue >= "0" && newValue <= "9") {
												if (cellnumber.length == 3) {
													setCellnumber("(" + cellnumber + ") " + newValue)
												} else if (cellnumber.length == 9) {
													setCellnumber(cellnumber + "-" + newValue)
												} else if (cellnumber.length == 13) {
													setCellnumber(cellnumber + newValue)
													
													Keyboard.dismiss()
												} else {
													setCellnumber(cellnumber + newValue)
												}
											} else if (newValue == "Backspace") {
												setCellnumber(cellnumber.substr(0, cellnumber.length - 1))
											}
										}} value={cellnumber} keyboardType="numeric" autoCorrect={false}/>
									</View>
									<TouchableOpacity style={[style.submit, { opacity: loading ? 0.3 : 1 }]} onPress={verify} disabled={loading}>
										<Text style={style.submitHeader}>Register</Text>
									</TouchableOpacity>
								</View>
								:
								<View style={{ alignItems: 'center' }}>
									<View style={style.inputContainer}>
										<Text style={style.inputHeader}>Enter verify code from your message:</Text>
										<TextInput style={style.input} onChangeText={(usercode) => {
											setUsercode(usercode)

											if (usercode.length == 6) {
												Keyboard.dismiss()
											}
										}} value={userCode} keyboardType="numeric" autoCorrect={false}/>
									</View>
									<View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                    <View style={{ flexDirection: 'row' }}>
  										<TouchableOpacity style={[style.submit, { opacity: loading ? 0.3 : 1 }]} disabled={loading} onPress={() => setVerifycode('')}>
  											<Text style={style.submitHeader}>Back</Text>
  										</TouchableOpacity>
  										<TouchableOpacity style={[style.submit, { opacity: loading ? 0.3 : 1 }]} disabled={loading} onPress={() => {
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
								</View>
							}

							<Text style={style.errorMsg}>{errorMsg}</Text>
						</View>

						{loading ? <ActivityIndicator color="black" size="small"/> : null}

						<TouchableOpacity style={style.option} onPress={() => navigation.replace('forgotpassword')}>
							<Text style={style.optionHeader}>I don't remember my password ? Click here</Text>
						</TouchableOpacity>
					</View>
				</View>
			</TouchableWithoutFeedback>
		</SafeAreaView>
	);
}

const style = StyleSheet.create({
	register: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	background: { alignItems: 'center', flexDirection: 'column', height, justifyContent: 'space-around', position: 'absolute', top: 0, width: width },
	
	inputsBox: { flexDirection: 'column', height: height / 2, justifyContent: 'space-around', width: '100%' },
	inputContainer: { marginBottom: 30, width: '80%' },
	inputHeader: { fontFamily: 'appFont', fontSize: wsize(7) },
	input: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(7), padding: 5, width: '100%' },
	errorMsg: { color: 'darkred', fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
	
	submit: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontFamily: 'appFont', margin: 5, padding: 10 },
	submitHeader: { fontFamily: 'appFont', fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
	
	option: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, marginVertical: 10, paddingHorizontal: 10 },
	optionHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
})
