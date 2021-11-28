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
					<Text style={style.boxHeader}>Sign-Up</Text>

					<View style={style.inputsBox}>
						{!verifyCode ?
							<>
								<Text style={style.inputHeader}>Cell number:</Text>
								<TextInput style={style.input} onChangeText={(cellnumber) => setCellnumber(cellnumber)} value={cellnumber} keyboardType="numeric" autoCorrect={false}/>
							</>
							:
							<>
								<Text style={style.inputHeader}>Enter verify code from your message:</Text>
								<TextInput style={style.input} onChangeText={(usercode) => setUsercode(usercode)} value={userCode} keyboardType="numeric" autoCorrect={false}/>
							</>
						}

						<Text style={style.errorMsg}>{errorMsg}</Text>

						{!verifyCode ?
							<TouchableOpacity style={style.submit} onPress={verify}>
								<Text style={style.submitHeader}>Register</Text>
							</TouchableOpacity>
							:
							<View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 210 }}>
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
						}
					</View>

					{loading ? <ActivityIndicator color="black" size="small"/> : null}

					<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
						<View style={style.options}>
							<TouchableOpacity style={style.option} onPress={() => {
								navigation.dispatch(
									CommonActions.reset({
										index: 1,
										routes: [{ name: 'login' }]
									})
								);
							}}>
								<Text>Already a member ? Log in</Text>
							</TouchableOpacity>
							<TouchableOpacity style={style.option} onPress={() => {
								navigation.dispatch(
									CommonActions.reset({
										index: 1,
										routes: [{ name: 'forgotpassword' }]
									})
								)
							}}>
								<Text>Forgot your password ? Reset here</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</TouchableWithoutFeedback>
		</View>
	);
}

const style = StyleSheet.create({
	register: { backgroundColor: '#3C74FF', height: '100%', width: '100%' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', paddingVertical: offsetPadding, width: '100%' },
	boxHeader: { color: 'black', fontFamily: 'appFont', fontSize: 50, fontWeight: 'bold' },
	
	inputsBox: { alignItems: 'center', flexDirection: 'column', height: screenHeight / 2, justifyContent: 'space-around', width: '80%' },
	inputHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold' },
	input: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: 20, padding: 10, width: width - 100 },
	errorMsg: { color: 'darkred', fontWeight: 'bold', textAlign: 'center' },
	submit: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontFamily: 'appFont', padding: 10, width: 100 },
	submitHeader: { fontWeight: 'bold', textAlign: 'center' },
	
	option: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, marginVertical: 10, padding: 5 }
})
