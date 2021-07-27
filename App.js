import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AsyncStorage, Text, View, TouchableOpacity, StyleSheet, LogBox } from 'react-native';
import * as Font from 'expo-font';

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);

// pages
import Login from './src/pages/login'
import Register from './src/pages/register'
import Setup from './src/pages/setup'
import Typesetup from './src/pages/typesetup'
import Setuphours from './src/pages/setuphours'

import Main from './src/pages/main'

// restaurants
import Makereservation from './src/pages/makereservation'

// salons
import Booktime from './src/pages/booktime'

// salons' components
import Services from './src/components/salons/services'
import Addproduct from './src/components/addproduct'
import Addservice from './src/components/addservice'

import Menu from './src/pages/menu'

import Settings from './src/pages/settings'

const Stack = createStackNavigator();

export default function App() {
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
                    setRoute("login")
                }
            } else {
                setRoute("login")
            }
        }

        retrieveId()

        if (route != null) {
            return (
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={route}>
                        <Stack.Screen name="login" component={Login} options={{ headerShown: false }}/>
                        <Stack.Screen name="register" component={Register} options={{ headerShown: false }}/>
                        <Stack.Screen name="setup" component={Setup} options={{ headerShown: false }}/>
                        <Stack.Screen name="typesetup" component={Typesetup} options={{ headerShown: false }}/>
                        <Stack.Screen name="setuphours" component={Setuphours} options={{ headerShown: false }}/>
                        <Stack.Screen name="main" component={Main} options={{ headerShown: false }}/>
                        <Stack.Screen name="makereservation" component={Makereservation} options={{ headerShown: false }}/>
                        <Stack.Screen name="booktime" component={Booktime} options={{ headerShown: false }}/>
                        <Stack.Screen name="services" component={Services} options={({ navigation, route }) => ({
                            headerTitle: () => (
                                <View>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Edit Menu: {route.params.name}</Text>
                                </View>
                            ),
                            headerLeft: () => (
                                <TouchableOpacity style={style.back} onPress={() => {
                                    const { map, refetch } = route.params

                                    map.pop()
                                    refetch()
                                    navigation.goBack({ map })
                                }}>
                                    <Text style={style.backHeader}>Go Back</Text>
                                </TouchableOpacity>
                            )
                        })}/>
                        <Stack.Screen name="addproduct" component={Addproduct} options={({ navigation, route }) => ({
                            headerTitle: () => (
                                <View>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Add Product</Text>
                                </View>
                            ),
                            headerLeft: () => (
                                <TouchableOpacity style={style.back} onPress={() => navigation.goBack()}>
                                    <Text style={style.backHeader}>Go Back</Text>
                                </TouchableOpacity>
                            )
                        })}/>
                        <Stack.Screen name="addservice" component={Addservice} options={({ navigation, route }) => ({
                            headerTitle: () => (
                                <View>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Add Service</Text>
                                </View>
                            ),
                            headerLeft: () => (
                                <TouchableOpacity style={style.back} onPress={() => navigation.goBack()}>
                                    <Text style={style.backHeader}>Go Back</Text>
                                </TouchableOpacity>
                            )
                        })}/>
                        <Stack.Screen name="menu" component={Menu} options={({ navigation, route }) => ({
                            headerTitle: () => (
                                <View>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Edit Menu
                                        {route.params.name && <Text style={{ fontSize: 15 }}>: {route.params.name}</Text>}
                                    </Text>
                                </View>
                            ),
                            headerLeft: () => (
                                <TouchableOpacity style={style.back} onPress={() => {
                                    const { refetch } = route.params

                                    refetch()
                                    navigation.goBack()
                                }}>
                                    <Text style={style.backHeader}>Go Back</Text>
                                </TouchableOpacity>
                            )
                        })}/>
                        <Stack.Screen name="settings" component={Settings} options={{ headerShown: false }}/>
                    </Stack.Navigator>
                </NavigationContainer>
            )
        }  
    }

    return null
}

const style = StyleSheet.create({
    back: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 1, margin: 5, padding: 5 },
    backHeader: { fontWeight: 'bold' },
})
