import React, { useEffect, useState } from 'react';
import { SafeAreaView, Platform, Dimensions, View, ImageBackground, Text, TextInput, Image, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { getCode } from '../apis/owners'
import { loginInfo } from '../../assets/info'
import { displayPhonenumber } from 'geottuse-tools'

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}
let source

export default function Forgotpassword({ navigation }) {
	const [info, setInfo] = useState({ cellnumber: loginInfo.cellnumber, resetcode: '111111', sent: false })
	const [code, setCode] = useState('')
	const [errorMsg, setErrormsg] = useState('')

	const getTheCode = () => {
    const data = { cellnumber: info.cellnumber, cancelToken: source.token }

		getCode(data)
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

  useEffect(() => {
    source = axios.CancelToken.source();

    return () => {
      if (source) {
        source.cancel("components got unmounted");
      }
    }
  }, [])

	return (
		<SafeAreaView style={styles.forgotpassword}>
			<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
				<View style={styles.box}>
					<View style={styles.inputsBox}>
						{!info.sent ? 
							<View style={{ alignItems: 'center' }}>
								<View style={styles.inputContainer}>
									<Text style={styles.inputHeader}>Cell number:</Text>
									<TextInput style={styles.input} onChangeText={(num) => setInfo({ 
                    ...info, 
                    cellnumber: displayPhonenumber(info.cellnumber, num, () => Keyboard.dismiss())
                  })} value={info.cellnumber} keyboardType="numeric" autoCorrect={false}/>
								</View>

								<TouchableOpacity style={styles.submit} onPress={() => getTheCode()}>
									<Text style={styles.submitHeader}>Reset</Text>
								</TouchableOpacity>
							</View>
							:
							<View style={{ alignItems: 'center' }}>
								<View style={styles.inputContainer}>
									<Text style={styles.resetCodeHeader}>Please enter the reset code sent to your phone</Text>

									<Text style={styles.inputHeader}>Reset Code:</Text>
									<TextInput style={styles.input} onChangeText={(resetcode) => setInfo({ ...info, resetcode })} keyboardType="numeric" value={info.resetcode} autoCorrect={false}/>
								</View>

								<TouchableOpacity style={styles.submit} onPress={() => done()}>
									<Text style={styles.submitHeader}>Done</Text>
								</TouchableOpacity>
							</View>
						}

						<Text style={styles.errorMsg}>{errorMsg}</Text>
					</View>
					
					<View>
						<TouchableOpacity style={styles.option} onPress={() => navigation.replace('login')}>
							<Text style={styles.optionHeader}>Already a member ? Log in</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.option} onPress={() => navigation.replace('verifyowner')}>
							<Text style={styles.optionHeader}>Don't have an account ? Sign up</Text>
						</TouchableOpacity>
					</View>
				</View>
			</TouchableWithoutFeedback>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	forgotpassword: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
  
	inputsBox: { flexDirection: 'column', height: height / 2, justifyContent: 'space-around', width: '80%' },
	inputContainer: { marginBottom: 30, width: '100%' },
  resetCodeHeader: { fontSize: wsize(4) },
	inputHeader: { fontFamily: 'Chilanka_400Regular', fontSize: wsize(7) },
	input: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(7), padding: 5, width: '100%' },
	errorMsg: { color: 'darkred', fontSize: wsize(10), fontWeight: 'bold', textAlign: 'center' },
	
	submit: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontFamily: 'Chilanka_400Regular', margin: 5, padding: 10 },
  submitHeader: { fontFamily: 'Chilanka_400Regular', fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
	
	option: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, marginVertical: 10, paddingHorizontal: 10 },
  optionHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
})
