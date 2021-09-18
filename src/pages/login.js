import React, { useState } from 'react';
import { AsyncStorage, Dimensions, View, ImageBackground, Text, TextInput, Image, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { loginUser } from '../apis/owners'
import { loginInfo } from '../../assets/info'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function login({ navigation }) {
	const [phonenumber, setPhonenumber] = useState(loginInfo.cellnumber)
	const [password, setPassword] = useState(loginInfo.password)
	const [errorMsg, setErrormsg] = useState('')

	const login = () => {
		const data = { cellnumber: phonenumber, password: password }

		loginUser(data)
			.then((res) => {
				if (res.status == 200) {
					if (!res.data.errormsg) {
						return res.data
					} else {
						setErrormsg(res.data.errormsg)
					}
				}

				return
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
			.catch((error) => console.log(error))
	}

	return (
		<View style={style.login}>
			<ImageBackground style={{ paddingVertical: offsetPadding }} source={require("../../assets/background.jpg")} resizeMode="stretch">
				<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
					<View style={style.box}>
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

							<TouchableOpacity style={style.submit} onPress={login}>
								<Text style={style.submitHeader}>Sign-In</Text>
							</TouchableOpacity>
						</View>

						<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
							<View style={style.options}>
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
								<TouchableOpacity style={style.option} onPress={() => {
									navigation.dispatch(
										CommonActions.reset({
											index: 1,
											routes: [{ name: 'forgotpassword' }]
										})
									)
								}}>
									<Text style={style.optionHeader}>Forgot your password ? Reset here</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</TouchableWithoutFeedback>
			</ImageBackground>
		</View>
	);
}

const style = StyleSheet.create({
	login: { height: '100%', width: '100%' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	background: { height: '100%', position: 'absolute', width: '100%' },
	boxHeader: { color: 'black', fontFamily: 'appFont', fontSize: 50, fontWeight: 'bold', paddingVertical: 30 },
	
	inputsBox: { alignItems: 'center', backgroundColor: 'rgba(2, 136, 255, 0.1)', paddingHorizontal: 20, width: '80%' },
	inputContainer: { marginVertical: 5 },
	inputHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold' },
	input: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: 20, padding: 10, width: width - 100 },
	errorMsg: { color: 'darkred', fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
	submit: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontFamily: 'appFont', marginVertical: 40, padding: 10, width: 100 },
	submitHeader: { fontWeight: 'bold', textAlign: 'center' },
	
	options: {  },
	option: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, marginVertical: 10, padding: 5 },
	optionHeader: {  },
})
