import React, { useEffect, useState } from 'react';
import { SafeAreaView, ActivityIndicator, Dimensions, FlatList, View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllLocations } from '../apis/locations'
import { resizePhoto } from 'geottuse-tools';
import { socket, logo_url } from '../../assets/info'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}

export default function Locationslist(props) {
  const [locations, setLocations] = useState([])

  const getTheAllLocations = async() => {
    const ownerid = await AsyncStorage.getItem("ownerid")

    getAllLocations(ownerid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setLocations(res.locations)
        }
      })
  }
  const logout = async() => {
    const ownerid = await AsyncStorage.getItem("ownerid")

    socket.emit("socket/business/logout", ownerid, () => {
      AsyncStorage.clear()

      props.navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name: 'auth' }]
        })
      );
    })
  }

  useEffect(() => {
    getTheAllLocations()
  }, [])

  return (
    <SafeAreaView style={styles.list}>
      <View style={styles.box}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.listAdd} onPress={() => {
            AsyncStorage.setItem("phase", "locationsetup")
            AsyncStorage.setItem("newBusiness", "true")

            props.navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "locationsetup" }]
              })
            )
          }}>
            <View style={styles.column}><Text style={styles.listAddHeader}>Add a business</Text></View>
            <View style={styles.column}><AntDesign name="pluscircleo" size={30}/></View>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <FlatList
            data={locations}
            renderItem={({ item, index }) => 
              <TouchableOpacity key={item.key} style={styles.location} onPress={() => {
                AsyncStorage.setItem("locationid", item.id.toString())
                AsyncStorage.setItem("locationtype", item.type)
                AsyncStorage.setItem("phase", "main")

                props.navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: "main" }]
                  })
                )
              }}>
                <View style={styles.locationImageHolder}>
                  <Image style={resizePhoto(item.logo, wsize(20))} source={{ uri: logo_url + item.logo.name }}/>
                </View>

                <View style={styles.column}>
                  <Text style={styles.locationName}>{item.name}</Text>
                  <Text style={styles.locationAddress}>{item.address}</Text>
                </View>
              </TouchableOpacity>
            }
          />
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
  list: { backgroundColor: 'white', height: '100%', width: '100%' },
  box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
  header: { alignItems: 'center', flexDirection: 'column', height: '10%', justifyContent: 'space-around' },
  listAdd: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, flexDirection: 'row', height: '70%', justifyContent: 'space-around', width: wsize(50) },
  listAddHeader: {  },

  body: { alignItems: 'center', height: '80%', width: '100%' },
  location: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5, padding: 5, width: width * 0.95 },
  locationImageHolder: { borderRadius: wsize(20) / 2, overflow: 'hidden', height: wsize(20), width: wsize(20) },
  locationName: { fontSize: wsize(6), fontWeight: 'bold' },
  locationAddress: { fontSize: wsize(4), fontWeight: 'bold' },

  bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
  bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  bottomNav: { flexDirection: 'row' },
  bottomNavHeader: { color: 'black', fontSize: wsize(4), fontWeight: 'bold', paddingVertical: 5 },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
})
