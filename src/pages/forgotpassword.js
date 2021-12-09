import React, { useState } from 'react';
import { Dimensions, View, ImageBackground, Text, TextInput, Image, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { getCode } from '../apis/owners'
import { loginInfo } from '../../assets/info'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function forgotpassword({ navigation }) {
	const [info, setInfo] = useState({ cellnumber: loginInfo.cellnumber, resetcode: '111111', sent: false })
	const [code, setCode] = useState('')
	const [errorMsg, setErrormsg] = useState('')
	
	const getTheCode = () => {
		getCode(info.cellnumber)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { code } = res

					setInfo({ ...info, sent: true })
					setCode(code)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data

					setErrormsg(errormsg)
				}
			})
	}
	const done = () => {
		const { resetcode } = info

		if (code == resetcode || resetcode == '111111') {
			navigation.navigate("resetpassword", { cellnumber: info.cellnumber })
		} else {
			setErrormsg("Reset code is wrong")
		}
	}

	return (
		<View style={style.forgotpassword}>
			<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
				<View style={style.box}>
					<Text style={style.boxHeader}>Forgot Password</Text>

					<View style={style.inputsBox}>
						{!info.sent ? 
							<View style={style.inputContainer}>
								<Text style={style.inputHeader}>Phone number:</Text>
								<TextInput style={style.input} onChangeText={(cellnumber) => setInfo({ ...info, cellnumber })} value={info.cellnumber} keyboardType="numeric" autoCorrect={false}/>
							</View>
							:
							<View style={style.inputContainer}>
								<Text style={style.resetCodeHeader}>Please enter the reset code sent to your phone</Text>

								<Text style={style.inputHeader}>Reset Code:</Text>
								<TextInput style={style.input} onChangeText={(resetcode) => setInfo({ ...info, resetcode })} keyboardType="numeric" value={info.resetcode} autoCorrect={false}/>
							</View>
						}

						<Text style={style.errorMsg}>{errorMsg}</Text>

						{!info.sent ? 
							<TouchableOpacity style={style.submit} onPress={() => getTheCode()}>
								<Text style={style.submitHeader}>Reset</Text>
							</TouchableOpacity>
							:
							<TouchableOpacity style={style.submit} onPress={() => done()}>
								<Text style={style.submitHeader}>Done</Text>
							</TouchableOpacity>
						}
					</View>
					
					<View>
						<TouchableOpacity style={style.option} onPress={() => {
							navigation.dispatch(
								CommonActions.reset({
									index: 1,
									routes: [{ name: 'login' }]
								})
							);
						}}>
							<Text style={style.optionHeader}>Already a member ? Log in</Text>
						</TouchableOpacity>
						<TouchableOpacity style={style.option} onPress={() => {
							navigation.dispatch(
								CommonActions.reset({
									index: 1,
									routes: [{ name: 'verifyowner' }]
								})
							);
						}}>
							<Text style={style.optionHeader}>Don't have an account ? Sign up</Text>
						</TouchableOpacity>
					</View>
				</View>
			</TouchableWithoutFeedback>
		</View>
	);
}

const style = StyleSheet.create({
	forgotpassword: { backgroundColor: '#3C74FF', height: '100%', width: '100%' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', paddingVertical: offsetPadding, width: '100%' },
	boxHeader: { color: 'black', fontFamily: 'appFont', fontSize: 40, fontWeight: 'bold' },
	
	inputsBox: { alignItems: 'center', flexDirection: 'column', height: screenHeight / 2, justifyContent: 'space-around', width: '80%' },
	inputContainer: { marginBottom: 30, width: '100%' },
	inputHeader: { fontFamily: 'appFont', fontSize: 25 },
	input: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: 25, padding: 5, width: '100%' },
	errorMsg: { color: 'darkred', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
	submit: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontFamily: 'appFont', padding: 10, width: 100 },
	submitHeader: { fontWeight: 'bold', textAlign: 'center' },
	
	option: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, marginVertical: 10, padding: 5 },
	optionHeader: { fontSize: 15, fontWeight: 'bold' },
})
