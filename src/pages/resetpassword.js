import React, { useState } from 'react';
import { AsyncStorage, Dimensions, View, Text, TextInput, Image, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { resetPassword } from '../apis/owners'
import { userInfo } from '../../assets/info'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function resetpassword(props) {
	const { cellnumber } = props.route.params

	const [newPassword, setNewpassword] = useState('')
	const [confirmPassword, setConfirmpassword] = useState('')
	const [errorMsg, setErrormsg] = useState('')

	const reset = () => {
		const data = { cellnumber, newPassword, confirmPassword }

		resetPassword(data)
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
					
					props.navigation.dispatch(
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
		<View style={style.resetpassword}>
			<View style={{ paddingVertical: offsetPadding }}>
				<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
					<View style={style.box}>
						<Text style={style.boxHeader}>Reset Password</Text>

						<View style={style.inputsBox}>
							<View style={style.inputContainer}>
								<Text style={style.inputHeader}>New password:</Text>
								<TextInput style={style.input} secureTextEntry={true} onChangeText={(password) => setNewpassword(password)} value={newPassword} autoCorrect={false}/>
							</View>

							<View style={style.inputContainer}>
								<Text style={style.inputHeader}>Confirm password:</Text>
								<TextInput style={style.input} secureTextEntry={true} onChangeText={(password) => setConfirmpassword(password)} value={confirmPassword} autoCorrect={false}/>
							</View>

							<Text style={style.errorMsg}>{errorMsg}</Text>

							<TouchableOpacity style={style.submit} onPress={() => reset()}>
								<Text style={style.submitHeader}>Done</Text>
							</TouchableOpacity>
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
								<View style={style.options}>
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
								</View>
							</View>
						</View>
					</View>
				</TouchableWithoutFeedback>
			</View>
		</View>
	);
}

const style = StyleSheet.create({
	resetpassword: { backgroundColor: '#0288FF', height: '100%', width: '100%' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	background: { height: '100%', position: 'absolute', width: '100%' },
	boxHeader: { color: 'white', fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', paddingVertical: 30 },
	
	inputsBox: { alignItems: 'center', backgroundColor: 'rgba(2, 136, 255, 0.1)', paddingHorizontal: 20, width: '80%' },
	inputContainer: { marginVertical: 5 },
	inputHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold' },
	input: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: 20, padding: 10, width: width - 100 },
	errorMsg: { color: 'red', fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
	submit: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontFamily: 'appFont', marginVertical: 40, padding: 10, width: 100 },
	submitHeader: { fontWeight: 'bold', textAlign: 'center' },
	
	options: {  },
	option: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, marginVertical: 10, padding: 5 },
	optionHeader: {  },
})
