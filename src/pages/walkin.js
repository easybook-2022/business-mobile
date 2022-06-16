import { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Dimensions, Keyboard } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { socket } from '../../assets/info'

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}

export default function Walkin({ navigation }) {
  const logout = async() => {
    const ownerid = await AsyncStorage.getItem("ownerid")

    socket.emit("socket/business/logout", ownerid, () => {
      AsyncStorage.clear()

      navigation.dispatch(CommonActions.reset({ index: 1, routes: [{ name: "auth" }]}));
    })
  }

  return (
    <SafeAreaView style={styles.walkin}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.box}>
          <View style={styles.headers}>
            <Text style={styles.header}>
              Hi Client{':)\n'}
              Welcome to Design
            </Text>
            <Text style={styles.header}>Easily enter your info below{'\n'}and have a seat</Text>
          </View>

          <View style={styles.inputsBox}>
            <TextInput style={styles.input} placeholder="Enter a name we can call you"/>
            <TextInput style={styles.input} placeholder="Enter service"/>
            <TextInput style={styles.input} placeholder="Enter the stylist you want"/>

            <TouchableOpacity style={styles.submit} onPress={() => {}}>
              <Text style={styles.submitHeader}>Check-in</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomNavs}>
            <View style={styles.bottomNavsRow}>
              <View style={styles.column}>
                <TouchableOpacity style={styles.bottomNav} onPress={() => logout()}>
                  <Text style={styles.bottomNavHeader}>Log-Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  walkin: { backgroundColor: 'white', height: '100%', width: '100%' },
  box: { alignItems: 'center', backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

  headers: { flexDirection: 'column', height: '20%', justifyContent: 'space-around', width: '100%' },
  header: { fontSize: wsize(6), textAlign: 'center' },

  inputsBox: { alignItems: 'center', height: '70%', width: '90%' },
  input: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(6), marginBottom: 30, paddingVertical: 20, width: '100%' },

  submit: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 10 },
  submitHeader: { fontSize: wsize(6) },

  bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
  bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  bottomNav: { flexDirection: 'row' },
  bottomNavHeader: { color: 'black', fontSize: wsize(4), fontWeight: 'bold', paddingVertical: 5 },
})
