import React, { useState, useEffect } from 'react';
import { SafeAreaView, Platform, View, Text, TextInput, Image, TouchableOpacity, TouchableWithoutFeedback, Dimensions, StyleSheet, Keyboard, Modal } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackActions } from '@react-navigation/native';
import { loginUser, verifyUser, registerUser } from '../apis/owners'
import { loginInfo, ownerGetinInfo, registerInfo, isLocal } from '../../assets/info'
import { displayPhonenumber } from 'geottuse-tools'

import Loadingprogress from '../widgets/loadingprogress'

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}

export default function Auth({ navigation }) {
  const [cellnumber, setCellnumber] = useState(ownerGetinInfo.cellnumber)
  const [password, setPassword] = useState(ownerGetinInfo.password)
  const [confirmPassword, setConfirmpassword] = useState(ownerGetinInfo.confirmPassword)
  const [noAccount, setNoaccount] = useState(false)
  const [verifyCode, setVerifycode] = useState('')
  const [verified, setVerified] = useState(false)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrormsg] = useState('')

  const login = () => {
    const data = { cellnumber, password }
    
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

          navigation.dispatch(StackActions.replace(msg))
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data

          switch (status) {
            case "nonexist":
              setNoaccount(true)
              verify()
          }
        }
      })
  }
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
        }
      })

      setLoading(false)
  }
  const register = () => {
    setLoading(true)

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

          setLoading(false)

          AsyncStorage.setItem("ownerid", id.toString())
          AsyncStorage.setItem("phase", "locationsetup")

          navigation.dispatch(StackActions.replace("locationsetup"))
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data

          setLoading(false)
        }
      })
  }

  useEffect(() => {
    if (password == confirmPassword) register()
  }, [confirmPassword.length])

	return (
		<SafeAreaView style={styles.auth}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
  			<View style={styles.box}>
          <View style={{ alignItems: 'center' }}>
            <Image style={styles.icon} source={require("../../assets/icon.png")}/>

            <Text style={styles.boxHeader}>Welcome to EasyGO (Business)</Text>
          </View>

          <View style={styles.inputsBox}>
            {!noAccount ? 
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputHeader}>Phone number:</Text>
                  <TextInput style={styles.input} onChangeText={(num) => setCellnumber(displayPhonenumber(cellnumber, num, () => Keyboard.dismiss()))} value={cellnumber} keyboardType="numeric" autoCorrect={false}/>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputHeader}>Password:</Text>
                  <TextInput style={styles.input} secureEntry={true} onChangeText={(password) => setPassword(password)} secureTextEntry={true} value={password} autoCorrect={false}/>
                </View>

                <Text style={styles.errorMsg}>{errorMsg}</Text>

                <TouchableOpacity style={styles.submit} onPress={() => login()}>
                  <Text style={styles.submitHeader}>Sign in</Text>
                </TouchableOpacity>
              </>
              :
              !verified ? 
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputHeader}>Enter verify code from your message:</Text>
                    <TextInput style={styles.input} onChangeText={(usercode) => {
                      if (usercode.length == 6) {
                        Keyboard.dismiss()

                        if (usercode == verifyCode || (usercode == '111111')) {
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
                        setVerified(false)
                        setNoaccount(false)
                        setErrormsg('')
                      }}>
                        <Text style={styles.submitHeader}>Back</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
                :
                <View style={styles.inputContainer}>
                  <Text style={styles.inputHeader}>Confirm your password:</Text>
                  <TextInput style={styles.input} secureTextEntry onChangeText={(confirmPassword) => setConfirmpassword(confirmPassword)} value={confirmPassword} autoCorrect={false}/>
                </View>
            }
          </View>

          {loading && <Modal transparent={true}><Loadingprogress/></Modal>}
        </View>
      </TouchableWithoutFeedback>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	auth: { backgroundColor: 'white', height: '100%', paddingTop: Platform.OS == "ios" ? 0 : Constants.statusBarHeight, width: '100%' },
	box: { alignItems: 'center', height: '100%', paddingHorizontal: 10, width: '100%' },
  icon: { height: width * 0.2, width: width * 0.2 },
	boxHeader: { fontSize: wsize(5), fontWeight: 'bold', marginVertical: '10%', textAlign: 'center' },

  inputsBox: { alignItems: 'center', width: '80%' },
  inputContainer: { marginBottom: 5, width: '100%' },
  inputHeader: { fontFamily: 'Chilanka_400Regular', fontSize: wsize(6) },
  input: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(7), padding: 5, width: '100%' },

  submit: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontFamily: 'Chilanka_400Regular', padding: 10, width: wsize(50) },
  submitHeader: { fontFamily: 'Chilanka_400Regular', fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
})
