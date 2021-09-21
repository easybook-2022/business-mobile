import React, { useState } from 'react';
import { AsyncStorage, ActivityIndicator, Dimensions, View, ImageBackground, Text, TextInput, Image, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { registerUser } from '../apis/owners'
import { registerInfo } from '../../assets/info'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - offsetPadding

export default function register(props) {
	const cellnumber = props.route.params.cellnumber
	const [password, setPassword] = useState(registerInfo.password)
	const [confirmPassword, setConfirmpassword] = useState(registerInfo.password)

	const [loading, setLoading] = useState(false)
	const [errorMsg, setErrormsg] = useState('')

	const register = () => {
		const data = { cellnumber, password, confirmPassword }

		setLoading(true)
		
		registerUser(data)
			.then((res) => {
				if (res.status == 200) {
					if (!res.data.errormsg) {
						return res.data
					} else {
						setLoading(false)
						setErrormsg(res.data.errormsg)
					}
				}

				return
			})
			.then((res) => {
				if (res) {
					const { id } = res

					AsyncStorage.setItem("ownerid", id.toString())
					AsyncStorage.setItem("phase", "setup")

					props.navigation.navigate("setup")
				}
			})
	}

	return (
		<View style={style.register}>
			<ImageBackground style={{ paddingVertical: offsetPadding }} source={require("../../assets/background.jpg")} resizeMode="stretch">
				<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
					<View style={style.box}>
						<Text style={style.boxHeader}>Sign-Up</Text>

						<View style={style.inputsBox}>
							<View style={style.inputContainer}>
								<Text style={style.inputHeader}>Password:</Text>
								<TextInput style={style.input} secureTextEntry={true} onChangeText={(password) => setPassword(password)} value={password} autoCorrect={false}/>
							</View>

							<View style={style.inputContainer}>
								<Text style={style.inputHeader}>Confirm Password:</Text>
								<TextInput style={style.input} secureTextEntry={true} onChangeText={(password) => setConfirmpassword(password)} value={confirmPassword} autoCorrect={false}/>
							</View>

							<Text style={style.errorMsg}>{errorMsg}</Text>

							<TouchableOpacity style={style.submit} onPress={register}>
								<Text style={style.submitHeader}>Register</Text>
							</TouchableOpacity>
						</View>

						{loading ? <ActivityIndicator color="black" size="small"/> : null}

						<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
							<View style={style.options}>
								<TouchableOpacity style={style.option} onPress={() => {
									props.navigation.dispatch(
										CommonActions.reset({
											index: 1,
											routes: [{ name: 'login' }]
										})
									);
								}}>
									<Text style={style.optionHeader}>Already a member ? Log in</Text>
								</TouchableOpacity>
								<TouchableOpacity style={style.option} onPress={() => {
									props.navigation.dispatch(
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
	register: { height: '100%', width: '100%' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', paddingVertical: 20, width: '100%' },
	background: { height: '100%', position: 'absolute', width: '100%' },
	boxHeader: { color: 'black', fontFamily: 'appFont', fontSize: 50, fontWeight: 'bold', paddingVertical: 30 },

	inputsBox: { alignItems: 'center', backgroundColor: 'rgba(2, 136, 255, 0.1)', paddingHorizontal: 20, width: '80%' },
	inputContainer: { marginVertical: 5 },
	inputHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold' },
	input: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: 20, padding: 10, width: width - 100 },
	errorMsg: { color: 'darkred', fontWeight: 'bold', textAlign: 'center' },
	submit: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontFamily: 'appFont', marginVertical: 40, padding: 10, width: 100 },
	submitHeader: { fontWeight: 'bold', textAlign: 'center' },

	options: {  },
	option: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, marginVertical: 10, padding: 5 },
	optionHeader: {  }
})
