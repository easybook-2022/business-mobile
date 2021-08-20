import React, { useState } from 'react';
import { AsyncStorage, Dimensions, View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { loginUser } from '../apis/owners'
import { userInfo } from '../../assets/info'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function login({ navigation }) {
	const [phonenumber, setPhonenumber] = useState(userInfo.cellnumber)
	const [password, setPassword] = useState(userInfo.password)
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
			<View style={{ paddingVertical: offsetPadding }}>
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
					</View>

					<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
						<View style={style.options}>
							<TouchableOpacity style={style.option} onPress={() => {
								navigation.dispatch(
									CommonActions.reset({
										index: 1,
										routes: [{ name: 'register' }]
									})
								);
							}}>
								<Text style={style.optionHeader}>Don't have an account ? Sign up</Text>
							</TouchableOpacity>
						</View>
					</View>

					<TouchableOpacity style={style.submit} onPress={login}>
						<Text style={style.submitHeader}>Sign-In</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}

const style = StyleSheet.create({
	login: { backgroundColor: '#0288FF', height: '100%', width: '100%' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	background: { height: '100%', position: 'absolute', width: '100%' },
	boxHeader: { color: 'white', fontFamily: 'appFont', fontSize: 50, fontWeight: 'bold', paddingVertical: 30 },
	
	inputsBox: { backgroundColor: 'rgba(2, 136, 255, 0.1)', paddingHorizontal: 20, width: '80%' },
	inputContainer: { marginVertical: 5 },
	inputHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold' },
	input: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: 20, padding: 10 },
	errorMsg: { color: 'red', fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
	
	options: { flexDirection: 'row' },
	option: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, padding: 5 },
	optionHeader: {  },
	submit: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontFamily: 'appFont', marginVertical: 40, padding: 10 },
	submitHeader: { fontWeight: 'bold' },
})
