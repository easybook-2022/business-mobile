import React, { useState } from 'react';
import axios from 'axios'
import { 
	Dimensions, View, ImageBackground, Text, TextInput, Image, 
	TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { loginUser } from '../apis/owners'
import { loginInfo } from '../../assets/info'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

const fsize = p => {
	return width * p
}

export default function login({ navigation }) {
	const [phonenumber, setPhonenumber] = useState(loginInfo.cellnumber)
	const [password, setPassword] = useState(loginInfo.password)
	const [errorMsg, setErrormsg] = useState('')

	const login = () => {
		const data = { cellnumber: phonenumber, password: password }
		
		loginUser(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { ownerid, locationid, locationtype, msg } = res

					AsyncStorage.setItem("ownerid", ownerid.toString())
					AsyncStorage.setItem("locationid", locationid ? locationid.toString() : "")
					AsyncStorage.setItem("locationtype", locationtype ? locationtype : "")
					AsyncStorage.setItem("phase", msg)

					navigation.dispatch(
						CommonActions.reset({
							index: 0,
							routes: [{ name: msg }]
						})
					)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg } = err.response.data

					setErrormsg(errormsg)
				}
			})
	}

	return (
		<View style={style.login}>
			<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
				<View style={style.box}>
					<View style={style.background}>
						<Image source={require("../../assets/background.jpg")} style={{ height: width, width: width }}/>
					</View>
					<TouchableOpacity style={style.boxHeaderTouch} onPress={() => navigation.goBack()}>
						<Text style={style.boxHeaderTouchHeader}>Go back</Text>
					</TouchableOpacity>
					<Text style={style.boxHeader}>Log-In</Text>

					<View style={style.inputsBox}>
						<View style={style.inputContainer}>
							<Text style={style.inputHeader}>Phone number:</Text>
							<TextInput style={style.input} onChangeText={(phonenumber) => setPhonenumber(phonenumber)} value={phonenumber} keyboardType="numeric" autoCorrect={false}/>
						</View>

						<View style={style.inputContainer}>
							<Text style={style.inputHeader}>Password:</Text>
							<TextInput style={style.input} secureEntry={true} onChangeText={(password) => setPassword(password)} secureTextEntry={true} value={password} autoCorrect={false}/>
						</View>

						<Text style={style.errorMsg}>{errorMsg}</Text>

						<TouchableOpacity style={style.submit} onPress={() => login()}>
							<Text style={style.submitHeader}>Sign-In</Text>
						</TouchableOpacity>
					</View>

					<View>
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
				</View>
			</TouchableWithoutFeedback>
		</View>
	);
}

const style = StyleSheet.create({
	login: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', paddingVertical: offsetPadding, width: '100%' },
	background: { alignItems: 'center', flexDirection: 'column', height: screenHeight, justifyContent: 'space-around', position: 'absolute', top: 0, width: width },
	boxHeaderTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginRight: 10, padding: 10 },
	boxHeaderTouchHeader: { fontSize: fsize(0.05), textAlign: 'center' },
	boxHeader: { color: 'black', fontFamily: 'appFont', fontSize: fsize(0.15), fontWeight: 'bold' },
	
	inputsBox: { alignItems: 'center', width: '80%' },
	inputContainer: { marginBottom: 30, width: '100%' },
	inputHeader: { fontFamily: 'appFont', fontSize: fsize(0.07) },
	input: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: fsize(0.07), padding: 5, width: '100%' },
	errorMsg: { color: 'darkred', fontSize: fsize(0.05), fontWeight: 'bold', textAlign: 'center' },

	submit: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontFamily: 'appFont', padding: 10, width: fsize(0.3) },
	submitHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), fontWeight: 'bold', textAlign: 'center' },
	
	option: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, marginVertical: 10, padding: 5 },
	optionHeader: { fontSize: fsize(0.04), fontWeight: 'bold' },
})
