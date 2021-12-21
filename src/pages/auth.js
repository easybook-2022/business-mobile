import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

const fsize = p => {
	return width * p
}

export default function auth({ navigation }) {
	return (
		<View style={style.auth}>
			<View style={style.box}>
				<Image style={{ height: fsize(0.5), width: fsize(0.5) }} source={require("../../assets/icon.png")}/>

				<Text allowFontScaling={false} style={style.boxHeader}>Welcome to EasyGO (Business)</Text>

				<View style={style.boxNav}>
					<Text allowFontScaling={false} style={style.boxActionsHeader}>Do you have an account ?</Text>
					<View style={style.boxActions}>
						<TouchableOpacity style={style.boxAction} onPress={() => navigation.navigate("verifyowner")}>
							<Text allowFontScaling={false} style={style.boxActionHeader}>No</Text>
						</TouchableOpacity>
						<TouchableOpacity style={style.boxAction} onPress={() => navigation.navigate("login")}>
							<Text allowFontScaling={false} style={style.boxActionHeader}>Yes</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</View>
	)
}

const style = StyleSheet.create({
	auth: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', paddingVertical: offsetPadding, width: '100%' },
	boxHeader: { fontSize: fsize(0.05), fontWeight: 'bold', textAlign: 'center' },
	boxNav: { alignItems: 'center' },
	boxActionsHeader: { fontSize: fsize(0.05), fontWeight: 'bold'  },
	boxActions: { flexDirection: 'row', justifyContent: 'space-around' },
	boxAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 10, width: fsize(0.3) },
	boxActionHeader: { fontSize: fsize(0.05) }
})
