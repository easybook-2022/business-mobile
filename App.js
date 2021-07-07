import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AsyncStorage, SafeAreaView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import * as Font from 'expo-font';

// pages
import Login from './src/pages/login'
import Register from './src/pages/register'
import Setup from './src/pages/setup'

// restaurants
import Restaurants from './src/pages/restaurants'

// salons
import Salons from './src/pages/salons'
import Booktime from './src/pages/salons/booktime'

// salons' components
import Services from './src/components/salons/services'
import Addproduct from './src/components/addproduct'

import Settings from './src/pages/settings'

const Stack = createStackNavigator();

export default function App() {
    const [loaded] = Font.useFonts({ appFont: require('./assets/Chilanka-Regular.ttf') });
    const [route, setRoute] = useState(null)

    if (loaded) {
        const retrieveId = async() => {
            let userid = await AsyncStorage.getItem("userid")
            let setup = await AsyncStorage.getItem("setup")

            if (userid) {
                if (setup == "true") {
                    setRoute("salons")
                } else {
                    setRoute("setup")
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
                        <Stack.Screen name="restaurants" component={Restaurants} options={{ headerShown: false }}/>
                        <Stack.Screen name="salons" component={Salons} options={{ headerShown: false }}/>
                        <Stack.Screen name="booktime" component={Booktime} options={{ headerShown: false }}/>
                        <Stack.Screen name="services" component={Services} options={({ navigation, route }) => ({
                            headerTitle: () => (
                                <View>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{route.params.name}</Text>
                                </View>
                            ),
                            headerLeft: () => (
                                <TouchableOpacity style={style.back} onPress={() => {
                                    const { map } = route.params

                                    map.pop()
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
