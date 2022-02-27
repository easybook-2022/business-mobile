import React from 'react';
import { SafeAreaView, View, Text, Image, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

const { height, width } = Dimensions.get('window')
const wsize = p => {
  return width * (p / 100)
}
const hsize = p => {
  return height * (p / 100)
}

export default function Auth({ navigation }) {
	return (
		<SafeAreaView style={styles.auth}>
			<View style={styles.box}>
				<Image style={styles.icon} source={require("../../assets/icon.png")}/>

				<Text style={styles.boxHeader}>Welcome to EasyGO (Business)</Text>

        <View style={styles.boxOptions}>
          <View style={styles.boxOption}>
            <View style={styles.column}><Text style={styles.boxOptionHeader}>Are you new ?</Text></View>
            <TouchableOpacity style={styles.boxOptionTouch} onPress={() => navigation.navigate("verifyowner")}><Text>Click to{'\n'}Register</Text></TouchableOpacity>
          </View>
          <View style={styles.boxOption}>
            <View style={styles.column}><Text style={styles.boxOptionHeader}>Already registered?</Text></View>
            <TouchableOpacity style={styles.boxOptionTouch} onPress={() => navigation.navigate("login")}><Text>Click to{'\n'}Login</Text></TouchableOpacity>
          </View>
        </View>
      </View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	auth: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', paddingHorizontal: 10, width: '100%' },
  icon: { height: width * 0.5, width: width * 0.5 },
	boxHeader: { fontSize: wsize(7), fontWeight: 'bold', textAlign: 'center' },
	
  boxOptions: { alignItems: 'center' },
  boxOption: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
	boxOptionHeader: { fontSize: wsize(5), fontWeight: 'bold'  },
	boxOptionTouch: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 10 },
	boxOptionTouchHeader: { fontSize: wsize(5) },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
})
