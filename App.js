import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, Text, View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import { tr } from './assets/translate'
import { useFonts, Chilanka_400Regular } from '@expo-google-fonts/chilanka';

// pages
import Auth from './src/pages/auth'
import Register from './src/pages/register'
import Forgotpassword from './src/pages/forgotpassword'
import Resetpassword from './src/pages/resetpassword'
import Picklanguage from './src/pages/picklanguage'
import Tables from './src/pages/tables'
import List from './src/pages/list'
import Locationsetup from './src/pages/locationsetup'
import Main from './src/pages/main'
import Booktime from './src/pages/booktime'

import Salonincomerecords from './src/pages/salonincomerecords'
import Restaurantincomerecords from './src/pages/restaurantincomerecords'

// salons' components
import Addmenu from './src/components/addmenu'
import Addproduct from './src/components/addproduct'
import Addmeal from './src/components/addmeal'
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
      const language = await AsyncStorage.getItem("language")

      if (ownerid) {
        if (phase) {
          if (language) {
            setRoute(phase)
          } else {
            setRoute("picklanguage")
          }
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
            <Stack.Screen name="picklanguage" component={Picklanguage} options={({ navigation, route }) => ({
              headerTitle: () => <Text style={styles.header}>Pick a language</Text>
            })}/>
            <Stack.Screen name="tables" component={Tables} options={({ navigation, route }) => ({
              headerTitle: () => <Text style={styles.header}>Edit Table(s)</Text>,
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
              headerTitle: () => <Text style={styles.header}>{tr.t("booktime.header")}</Text>,
              headerLeft: () => (
                Platform.OS == 'ios' && (
                  <TouchableOpacity style={styles.back} onPress={() => {
                    
                    navigation.setParams({ num: "this is a number" })
                    navigation.goBack()
                  }}>
                    <Text style={styles.backHeader}>Go Back</Text>
                  </TouchableOpacity>
                )
              )
            })}/>
            <Stack.Screen name="salonincomerecords" component={Salonincomerecords} options={({ navigation, route }) => ({
              headerTitle: () => <Text style={styles.header}>Dailey/Monthly/Yearly Income</Text>,
              headerLeft: () => (
                Platform.OS == 'ios' && (
                  <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                    <Text style={styles.backHeader}>Go Back</Text>
                  </TouchableOpacity>
                )
              )
            })}/>
            <Stack.Screen name="restaurantincomerecords" component={Restaurantincomerecords} options={({ navigation, route }) => ({
              headerTitle: () => <Text style={styles.header}>Daily/Monthly/Yearly Income</Text>,
              headerLeft: () => (
                Platform.OS == 'ios' && (
                  <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                    <Text style={styles.backHeader}>Go Back</Text>
                  </TouchableOpacity>
                )
              )
            })}/>
            <Stack.Screen name="addmenu" component={Addmenu} options={({ navigation, route }) => ({
              headerTitle: () => <Text style={styles.header}>{tr.t("addmenu.header." + (route.params.menuid ? 'edit' : 'add'))}</Text>,
              headerLeft: () => (
                Platform.OS == 'ios' && (
                  <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                    <Text style={styles.backHeader}>Go Back</Text>
                  </TouchableOpacity>
                )
              )
            })}/>
            <Stack.Screen name="addproduct" component={Addproduct} options={({ navigation, route }) => ({
              headerTitle: () => <Text style={styles.header}>{tr.t("addproduct.header." + (route.params.id ? 'edit' : 'add'))}</Text>,
              headerLeft: () => (
                Platform.OS == 'ios' && (
                  <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                    <Text style={styles.backHeader}>Go Back</Text>
                  </TouchableOpacity>
                )
              )
            })}/>
            <Stack.Screen name="addmeal" component={Addmeal} options={({ navigation, route }) => ({
              headerTitle: () => <Text style={styles.header}>{tr.t("addmeal.header." + (route.params.productid ? 'edit' : 'add'))}</Text>,
              headerLeft: () => (
                Platform.OS == 'ios' && (
                  <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                    <Text style={styles.backHeader}>Go Back</Text>
                  </TouchableOpacity>
                )
              )
            })}/>
            <Stack.Screen name="addservice" component={Addservice} options={({ navigation, route }) => ({
              headerTitle: () => <Text style={styles.header}>{tr.t("addservice.header." + (route.params.id ? 'edit' : 'add'))}</Text>,
              headerLeft: () => (
                Platform.OS == 'ios' && (
                  <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                    <Text style={styles.backHeader}>Go Back</Text>
                  </TouchableOpacity>
                )
              )
            })}/>
            <Stack.Screen name="menu" component={Menu} disableMode={false} options={({ navigation, route }) => ({
              headerTitle: () => <Text style={styles.header}>{tr.t("menu.header." + (route.params.userType == "owner" ? "edit" : "view"))}</Text>,
              headerLeft: () => (
                Platform.OS == 'ios' && (
                  <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
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
