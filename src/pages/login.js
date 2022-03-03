import React, { useState } from 'react';
import axios from 'axios'
import { 
	SafeAreaView, Dimensions, View, ImageBackground, Text, TextInput, Image, 
	TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { loginUser } from '../apis/owners'
import { loginInfo } from '../../assets/info'

const { height, width } = Dimensions.get('window')
const wsize = p => {
  return width * (p / 100)
}
const hsize = p => {
  return height * (p / 100)
}

export default function Login({ navigation }) {
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
				} else {
          alert("login")
				}
			})
	}

	return (
		<SafeAreaView style={style.login}>
			<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
				<View style={style.box}>
					<View style={style.background}>
						<Image source={require("../../assets/background.jpg")} style={{ height: width, width: width }}/>
					</View>

					<View style={style.inputsBox}>
						<View style={style.inputContainer}>
							<Text style={style.inputHeader}>Phone number:</Text>
							<TextInput style={style.input} onKeyPress={(e) => {
								let newValue = e.nativeEvent.key

								if (newValue >= "0" && newValue <= "9") {
									if (phonenumber.length == 3) {
										setPhonenumber("(" + phonenumber + ") " + newValue)
									} else if (phonenumber.length == 9) {
										setPhonenumber(phonenumber + "-" + newValue)
									} else if (phonenumber.length == 13) {
										setPhonenumber(phonenumber + newValue)

										Keyboard.dismiss()
									} else {
										setPhonenumber(phonenumber + newValue)
									}
								} else if (newValue == "Backspace") {
									setPhonenumber(phonenumber.substr(0, phonenumber.length - 1))
								}
							}} value={phonenumber} keyboardType="numeric" autoCorrect={false}/>
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

					<TouchableOpacity style={style.option} onPress={() => navigation.replace('forgotpassword')}>
						<Text style={style.optionHeader}>I don't remember my password ? Click here</Text>
					</TouchableOpacity>
				</View>
			</TouchableWithoutFeedback>
		</SafeAreaView>
	);
}

const style = StyleSheet.create({
	login: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	background: { alignItems: 'center', flexDirection: 'column', height, justifyContent: 'space-around', position: 'absolute', top: 0, width: width },
	
	inputsBox: { alignItems: 'center', width: '80%' },
	inputContainer: { marginBottom: 30, width: '100%' },
	inputHeader: { fontFamily: 'appFont', fontSize: wsize(7) },
	input: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(7), padding: 5, width: '100%' },

	submit: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontFamily: 'appFont', padding: 10, width: wsize(30) },
	submitHeader: { fontFamily: 'appFont', fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
	
	option: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, marginVertical: 10, padding: 5 },
	optionHeader: { fontSize: wsize(4), fontWeight: 'bold' },

  errorMsg: { color: 'darkred', fontSize: wsize(4), textAlign: 'center' }
})
