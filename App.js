import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, Text, View, TouchableOpacity, StyleSheet, Dimensions, LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import { socket } from './assets/info'

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);

// pages
import Auth from './src/pages/auth'
import Login from './src/pages/login'
import Register from './src/pages/register'
import Forgotpassword from './src/pages/forgotpassword'
import Resetpassword from './src/pages/resetpassword'
import Verifyowner from './src/pages/verifyowner'
import Locationsetup from './src/pages/locationsetup'
import Workinghours from './src/pages/workinghours'

import Main from './src/pages/main'
import Cartorders from './src/pages/cartorders'
import Diningorders from './src/pages/diningorders'
import Dinersorders from './src/pages/dinersorders'

// restaurants
import Makereservation from './src/pages/makereservation'

// salons
import Booktime from './src/pages/booktime'

// salons' components
import Addmenu from './src/components/addmenu'
import Addproduct from './src/components/addproduct'
import Addservice from './src/components/addservice'

import Menu from './src/pages/menu'
import Settings from './src/pages/settings'

const { height, width } = Dimensions.get('window')
const wsize = p => {
  return width * (p / 100)
}
const hsize = p => {
  return height * (p / 100)
}

export default function App() {
  const Stack = createNativeStackNavigator();

  const [loaded] = Font.useFonts({ appFont: require('./assets/Chilanka-Regular.ttf') });
  const [route, setRoute] = useState(null)

  if (loaded) {
    const retrieveId = async() => {
      let ownerid = await AsyncStorage.getItem("ownerid")
      let phase = await AsyncStorage.getItem("phase")

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

    if (route != null) {
      return (
        <NavigationContainer>
          <Stack.Navigator initialRouteName={route}>
            <Stack.Screen name="auth" component={Auth} options={{ headerShown: false }}/>
            <Stack.Screen name="login" component={Login} options={({ navigation, route }) => ({
              headerTitle: () => <Text style={styles.header}>Log-In</Text>,
              headerLeft: () => (
                Platform.OS == 'ios' && (
                  <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                    <Text style={styles.backHeader}>Go Back</Text>
                  </TouchableOpacity>
                )
              )
            })}/>
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
            <Stack.Screen name="verifyowner" component={Verifyowner} options={({ navigation, route }) => ({
              headerTitle: () => <Text style={styles.header}>Registration</Text>,
              headerLeft: () => (
                Platform.OS == 'ios' && (
                  <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                      <Text style={styles.backHeader}>Go Back</Text>
                  </TouchableOpacity>
                )
              )
            })}/>
            <Stack.Screen name="locationsetup" component={Locationsetup} options={{ headerShown: false }}/>
            <Stack.Screen name="workinghours" component={Workinghours} options={{ headerShown: false }}/>
            <Stack.Screen name="main" component={Main} options={{ headerShown: false }}/>
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
            <Stack.Screen name="diningorders" component={Diningorders} options={({ navigation, route }) => ({
              headerTitle: () => <Text style={styles.header}>Order(s)</Text>,
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
            <Stack.Screen name="dinersorders" component={Dinersorders} options={({ navigation }) => ({
              headerTitle: () => <Text style={styles.header}>Diners' Order(s)</Text>,
              headerLeft: () => (
                Platform.OS == 'ios' && (
                  <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                    <Text style={styles.backHeader}>Go Back</Text>
                  </TouchableOpacity>
                )
              )
            })}/>
            <Stack.Screen name="makereservation" component={Makereservation} options={({ navigation, route }) => ({
              headerTitle: () => <Text style={styles.header}>Choose another time</Text>,
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
            <Stack.Screen name="booktime" component={Booktime} options={({ navigation, route }) => ({
              headerTitle: () => <Text style={styles.header}>Request another time</Text>,
              headerLeft: () => (
                Platform.OS == 'ios' && (
                  <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
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
                <Text style={styles.header}>Edit Menu
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
            <Stack.Screen name="settings" component={Settings} options={({ navigation, route }) => ({
              headerTitle: () => <Text style={styles.header}>Setting(s)</Text>,
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
})
