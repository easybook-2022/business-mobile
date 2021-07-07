import React, { useState, useEffect } from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'

export default function restaurants() {
	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={style.box}>
			</View>
		</SafeAreaView>
	)
}

const style = StyleSheet.create({
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
})
