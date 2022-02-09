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

				<View style={styles.boxNav}>
					<Text style={styles.boxActionsHeader}>Do you have an account ?</Text>
					<View style={styles.boxActions}>
						<TouchableOpacity style={styles.boxAction} onPress={() => navigation.navigate("verifyowner")}>
							<Text style={styles.boxActionHeader}>No</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.boxAction} onPress={() => navigation.navigate("login")}>
							<Text style={styles.boxActionHeader}>Yes</Text>
						</TouchableOpacity>
					</View>
				</View>
      </View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	auth: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  icon: { height: width * 0.5, width: width * 0.5 },
	boxHeader: { fontSize: wsize(7), fontWeight: 'bold', textAlign: 'center' },
	boxNav: { alignItems: 'center' },
	boxActionsHeader: { fontSize: wsize(5), fontWeight: 'bold'  },
	boxActions: { flexDirection: 'row', justifyContent: 'space-around' },
	boxAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 10, width: wsize(30) },
	boxActionHeader: { fontSize: wsize(5) }
})
