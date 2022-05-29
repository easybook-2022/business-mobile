import React, { useState } from 'react';
import { SafeAreaView, Platform, Dimensions, View, ImageBackground, Text, TextInput, Image, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { StackActions } from '@react-navigation/native';
import { resetPassword } from '../apis/owners'
import { userInfo } from '../../assets/info'

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}

export default function Resetpassword(props) {
	const offsetPadding = Constants.statusBarHeight
	const screenHeight = height - (offsetPadding * 2)
	const { cellnumber } = props.route.params
	
	const [newPassword, setNewpassword] = useState('')
	const [confirmPassword, setConfirmpassword] = useState('')
	const [errorMsg, setErrormsg] = useState('')

	const reset = () => {
		const data = { cellnumber, newPassword, confirmPassword }

		resetPassword(data)
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
					
					props.navigation.dispatch(StackActions.replace(msg))
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data

					setErrormsg(errormsg)
				}
			})
	}

	return (
		<SafeAreaView style={style.resetpassword}>
			<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
				<View style={style.box}>
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
							<TouchableOpacity style={style.option} onPress={() => navigation.replace('verifyowner')}>
								<Text style={style.optionHeader}>Don't have an account ? Sign up</Text>
							</TouchableOpacity>
							<TouchableOpacity style={style.option} onPress={() => navigation.replace('login')}>
                <Text style={style.optionHeader}>Already a member ? Log in</Text>
              </TouchableOpacity>
						</View>
					</View>
				</View>
			</TouchableWithoutFeedback>
		</SafeAreaView>
	);
}

const style = StyleSheet.create({
	resetpassword: { backgroundColor: '#3C74FF', height: '100%', paddingTop: Platform.OS == "ios" ? 0 : Constants.statusBarHeight, width: '100%' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', paddingVertical: 30, width: '100%' },
  
	inputsBox: { alignItems: 'center', backgroundColor: 'rgba(2, 136, 255, 0.1)', paddingHorizontal: 20, width: '80%' },
	inputContainer: { marginVertical: 5 },
	inputHeader: { fontFamily: 'Chilanka_400Regular', fontSize: wsize(5), fontWeight: 'bold' },
	input: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), padding: 10, width: width - 100 },
	
	submit: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontFamily: 'Chilanka_400Regular', marginVertical: 40, padding: 10, width: 100 },
	submitHeader: { fontWeight: 'bold', textAlign: 'center' },
	
	options: {  },
	option: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, marginVertical: 10, padding: 5 },
	optionHeader: { fontSize: wsize(4) },

  errorMsg: { color: 'darkred', fontSize: wsize(4), textAlign: 'center' },
})
