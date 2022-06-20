import React, { useEffect, useState } from 'react';
import { SafeAreaView, ActivityIndicator, Dimensions, View, Image, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { socket } from '../../assets/info'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}

export default function Authoption({ navigation }) {
  const logout = async() => {
    const ownerid = await AsyncStorage.getItem("ownerid")

    socket.emit("socket/business/logout", ownerid, () => {
      AsyncStorage.clear()

      navigation.dispatch(CommonActions.reset({ index: 1, routes: [{ name: "auth" }]}));
    })
  }

  return (
    <SafeAreaView style={styles.authoption}>
      <View style={styles.box}>
        <View style={styles.body}>
          <View style={styles.authOptions}>
            <TouchableOpacity style={styles.authOptionTouch} onPress={() => {
              AsyncStorage.setItem("phase", "walkin")
              
              navigation.navigate("walkin")
            }}>
              <Text style={styles.authOptionTouchHeader}>Walk-in(s)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.authOptionTouch} onPress={() => {
              AsyncStorage.setItem("phase", "main")

              navigation.navigate("main")
            }}>
              <Text style={styles.authOptionTouchHeader}>Appointment(s)</Text>
            </TouchableOpacity>
          </View>
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  authoption: { backgroundColor: 'white', height: '100%', width: '100%' },
  box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
  header: { alignItems: 'center', flexDirection: 'column', height: '10%', justifyContent: 'space-around' },

  body: { alignItems: 'center', flexDirection: 'column', height: '90%', justifyContent: 'space-around', width: '100%' },
  authOptions: { alignItems: 'center', width: '100%' },
  authOptionTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: '10%', padding: 10, width: '70%' },
  authOptionTouchHeader: { fontSize: 20, textAlign: 'center' },

  bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
  bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  bottomNav: { flexDirection: 'row' },
  bottomNavHeader: { color: 'black', fontSize: wsize(4), fontWeight: 'bold', paddingVertical: 5 },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
})
