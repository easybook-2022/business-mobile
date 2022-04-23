import React, { useState } from 'react';
import { SafeAreaView, Platform, ActivityIndicator, Dimensions, View, ImageBackground, Text, TextInput, Image, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { verifyUser, registerUser } from '../apis/owners'
import { ownerRegisterInfo, registerInfo, isLocal, displayPhonenumber } from '../../assets/info'

const { height, width } = Dimensions.get('window')
const wsize = p => {
  return width * (p / 100)
}
const hsize = p => {
  return height * (p / 100)
}

export default function Verifyowner({ navigation }) {
	const [cellnumber, setCellnumber] = useState(ownerRegisterInfo.cellnumber)
	const [verifyCode, setVerifycode] = useState('')
  const [verified, setVerified] = useState(false)

  const [passwordInfo, setPasswordinfo] = useState({ password: ownerRegisterInfo.password, confirmPassword: ownerRegisterInfo.password, step: 0 })

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
          setErrormsg('')
					setLoading(false)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg } = err.response.data

					setErrormsg(errormsg)
				} else {
          alert("verify")
				}
			})

			setLoading(false)
	}
  const register = () => {
    const { password, confirmPassword } = passwordInfo
    const data = { cellnumber, password, confirmPassword }

    registerUser(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { id } = res

          AsyncStorage.setItem("ownerid", id.toString())

          navigation.navigate("locationsetup")
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {

        } else {
          alert("register")
        }
      })
  }

	return (
		<SafeAreaView style={styles.register}>
			<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
				<View style={{ opacity: loading ? 0.5 : 1 }}>
					<View style={styles.box}>
						<View style={styles.background}>
							<Image source={require("../../assets/background.jpg")} style={{ height: width, width: width }}/>
						</View>
            
						<View style={styles.inputsBox}>
							{!verifyCode ?
								<View style={{ alignItems: 'center' }}>
									<View style={styles.inputContainer}>
										<Text style={styles.inputHeader}>Enter your cell number:</Text>
										<TextInput 
                      style={styles.input} 
                      onChangeText={(num) => setCellnumber(displayPhonenumber(cellnumber, num, () => Keyboard.dismiss()))} 
                      value={cellnumber} keyboardType="numeric" autoCorrect={false}
                    />
									</View>
									<TouchableOpacity style={[styles.submit, { opacity: loading ? 0.3 : 1 }]} disabled={loading} onPress={() => verify()} disabled={loading}>
										<Text style={styles.submitHeader}>Register</Text>
									</TouchableOpacity>
								</View>
								:
                <View style={{ alignItems: 'center' }}>
                  {!verified ? 
    								<>
    									<View style={styles.inputContainer}>
    										<Text style={styles.inputHeader}>Enter verify code from your message:</Text>
    										<TextInput style={styles.input} onChangeText={(usercode) => {
    											if (usercode.length == 6) {
    												Keyboard.dismiss()

                            if (usercode == verifyCode || (isLocal && usercode == '111111')) {
                              setVerified(true)
                              setErrormsg("")
                            } else {
                              setErrormsg("The verify code is wrong")
                            }
    											} else {
                            setErrormsg("")
                          }
    										}} keyboardType="numeric" autoCorrect={false}/>
    									</View>
    									<View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                        <View style={{ flexDirection: 'row' }}>
      										<TouchableOpacity style={[styles.submit, { opacity: loading ? 0.3 : 1 }]} disabled={loading} onPress={() => {
                            setVerifycode('')
                            setErrormsg('')
                          }}>
      											<Text style={styles.submitHeader}>Back</Text>
      										</TouchableOpacity>
                        </View>
    									</View>
    								</>
                    :
                    <>
                      <View style={styles.inputContainer}>
                        <Text style={styles.inputHeader}>Enter a password:</Text>
                        <TextInput style={styles.input} secureTextEntry onChangeText={(password) => setPasswordinfo({ ...passwordInfo, password })} value={passwordInfo.password} autoCorrect={false}/>
                      </View>
                      <View style={styles.inputContainer}>
                        <Text style={styles.inputHeader}>Confirm your password:</Text>
                        <TextInput style={styles.input} secureTextEntry onChangeText={(confirmPassword) => {
                          setPasswordinfo({ ...passwordInfo, confirmPassword })

                          if (confirmPassword.length == passwordInfo.password.length) {
                            Keyboard.dismiss()
                          }
                        }} value={passwordInfo.confirmPassword} autoCorrect={false}/>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                        <View style={{ flexDirection: 'row' }}>
                          <TouchableOpacity style={[styles.submit, { opacity: loading ? 0.3 : 1 }]} disabled={loading} onPress={() => register()}>
                            <Text style={styles.submitHeader}>Next</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </>
                  }
                </View>
							}

							<Text style={styles.errorMsg}>{errorMsg}</Text>
						</View>

						{loading ? <ActivityIndicator color="black" size="small"/> : null}

						<TouchableOpacity style={[styles.option, { opacity: loading ? 0.5 : 1 }]} disabled={loading} onPress={() => navigation.replace('forgotpassword')}>
							<Text style={styles.optionHeader}>I don't remember my password ? Click here</Text>
						</TouchableOpacity>
					</View>
				</View>
			</TouchableWithoutFeedback>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	register: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	background: { alignItems: 'center', flexDirection: 'column', height, justifyContent: 'space-around', position: 'absolute', top: 0, width: width },
	
	inputsBox: { flexDirection: 'column', height: height / 2, justifyContent: 'space-around', width: '100%' },
	inputContainer: { marginBottom: 30, width: '80%' },
	inputHeader: { fontFamily: 'appFont', fontSize: wsize(6) },
	input: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(7), padding: 5, width: '100%' },
	errorMsg: { color: 'darkred', fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
	
	submit: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontFamily: 'appFont', margin: 5, padding: 10 },
	submitHeader: { fontFamily: 'appFont', fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
	
	option: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, marginVertical: 10, paddingHorizontal: 10 },
	optionHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
})
