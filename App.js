import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, Text, View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import { useFonts, Chilanka_400Regular } from '@expo-google-fonts/chilanka';

// pages
import Auth from './src/pages/auth'
import Register from './src/pages/register'
import Forgotpassword from './src/pages/forgotpassword'
import Resetpassword from './src/pages/resetpassword'
import List from './src/pages/list'
import Locationsetup from './src/pages/locationsetup'
import Main from './src/pages/main'
import Booktime from './src/pages/booktime'
import Cartorders from './src/pages/cartorders'

// salons' components
import Addmenu from './src/components/addmenu'
import Addproduct from './src/components/addproduct'
import Addservice from './src/components/addservice'

import Menu from './src/pages/menu'

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}

export default function App() {
  const Stack = createNativeStackNavigator();

  const [fontLoaded] = useFonts({ Chilanka_400Regular });
  const [route, setRoute] = useState(null)

  if (fontLoaded) {
    const retrieveId = async() => {
      const ownerid = await AsyncStorage.getItem("ownerid")
      const phase = await AsyncStorage.getItem("phase")

      if (ownerid) {
        if (phase) {
          setRoute(phase)
        } else {
          setRoute("auth")
        }
      } else {
          setRoute("auth")
      }
    }

    retrieveId()
    
    if (route != null && fontLoaded) {
      return (
        <NavigationContainer>
          <Stack.Navigator initialRouteName={route}>
            <Stack.Screen name="auth" component={Auth} options={{ headerShown: false }}/>
            <Stack.Screen name="register" component={Register} options={{ headerShown: false }}/>
            <Stack.Screen name="forgotpassword" component={Forgotpassword} options={({ navigation, route }) => ({
              headerTitle: () => <Text style={styles.header}>Forget your password</Text>,
              headerLeft: () => (
                Platform.OS == 'ios' && (
                  <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                      <Text style={styles.backHeader}>Go Back</Text>
                  </TouchableOpacity>
                )
              )
            })}/>
            <Stack.Screen name="resetpassword" component={Resetpassword} options={({ navigation, route }) => ({
              headerTitle: () => <Text style={styles.header}>Resetting your password</Text>,
              headerLeft: () => (
                Platform.OS == 'ios' && (
                  <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                      <Text style={styles.backHeader}>Go Back</Text>
                  </TouchableOpacity>
                )
              )
            })}/>
            <Stack.Screen name="list" component={List} options={{ headerShown: false }}/>
            <Stack.Screen name="locationsetup" component={Locationsetup} options={{ headerShown: false }}/>
            <Stack.Screen name="main" component={Main} options={{ headerShown: false }}/>
            <Stack.Screen name="booktime" component={Booktime} options={({ navigation, route }) => ({
              headerTitle: () => <Text style={styles.header}>Request different time</Text>,
              headerLeft: () => (
                Platform.OS == 'ios' && (
                  <TouchableOpacity style={styles.back} onPress={() => {
                    if (route.params && route.params.refetch) {
                      route.params.refetch()
                    }

                    navigation.goBack()
                  }}>
                    <Text style={styles.backHeader}>Go Back</Text>
                  </TouchableOpacity>
                )
              )
            })}/>
            <Stack.Screen name="cartorders" component={Cartorders} options={({ navigation, route }) => ({
              headerTitle: () => <Text style={styles.header}>#{route.params.ordernumber} Order(s)</Text>,
              headerLeft: () => (
                Platform.OS == 'ios' && (
                  <TouchableOpacity style={styles.back} onPress={() => {
                    if (route.params && route.params.refetch) {
                      route.params.refetch()
                    }

                    navigation.goBack()
                  }}>
                    <Text style={styles.backHeader}>Go Back</Text>
                  </TouchableOpacity>
                )
              )
            })}/>
            <Stack.Screen name="addmenu" component={Addmenu} options={({ navigation, route }) => ({
              headerTitle: () => <Text style={styles.header}>{route.params.menuid ? 'Edit' : 'Add'} Menu</Text>,
              headerLeft: () => (
                Platform.OS == 'ios' && (
                  <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                    <Text style={styles.backHeader}>Go Back</Text>
                  </TouchableOpacity>
                )
              )
            })}/>
            <Stack.Screen name="addproduct" component={Addproduct} options={({ navigation, route }) => ({
              headerTitle: () => <Text style={styles.header}>{route.params.id ? 'Edit' : 'Add'} Product</Text>,
              headerLeft: () => (
                Platform.OS == 'ios' && (
                  <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                    <Text style={styles.backHeader}>Go Back</Text>
                  </TouchableOpacity>
                )
              )
            })}/>
            <Stack.Screen name="addservice" component={Addservice} options={({ navigation, route }) => ({
              headerTitle: () => <Text style={styles.header}>Add Service</Text>,
              headerLeft: () => (
                Platform.OS == 'ios' && (
                  <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                    <Text style={styles.backHeader}>Go Back</Text>
                  </TouchableOpacity>
                )
              )
            })}/>
            <Stack.Screen name="menu" component={Menu} disableMode={false} options={({ navigation, route }) => ({
              headerTitle: () => (
                <Text style={styles.header}>{route.params.isOwner == true ? "Edit" : "View"} Menu
                    {route.params.name && <Text style={{ fontSize: 15 }}>: {route.params.name}</Text>}
                </Text>
              ),
              headerLeft: () => (
                Platform.OS == 'ios' && (
                  <TouchableOpacity style={styles.back} onPress={() => {
                    const { refetch } = route.params

                    refetch()
                    navigation.goBack()
                  }}>
                    <Text style={styles.backHeader}>Go Back</Text>
                  </TouchableOpacity>
                )
              )
            })}/>
          </Stack.Navigator>
        </NavigationContainer>
      )
    }  
  }
  
  return null
}

const styles = StyleSheet.create({
  header: { fontSize: wsize(5), fontWeight: 'bold' },
  back: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 1, padding: 5, width: wsize(20) },
  backHeader: { fontSize: wsize(3), fontWeight: 'bold' },
});
