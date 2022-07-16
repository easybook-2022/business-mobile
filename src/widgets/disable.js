import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { tr } from '../../assets/translate'

export default function Disable(props) {
  const { ownerId, close, language } = props

  useEffect(() => {
    tr.locale = language
  }, [])

  return (
    <SafeAreaView style={styles.disabled}>
      <View style={styles.disabledContainer}>
        <Text style={styles.disabledHeader}>{tr.t("disableHeader")}</Text>

        <TouchableOpacity style={styles.disabledClose} onPress={close}>
          <Text style={styles.disabledCloseHeader}>{tr.t("buttons.close")}</Text>
        </TouchableOpacity>

        <ActivityIndicator size="large"/>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  disabled: { backgroundColor: 'rgba(225, 225, 255, 0.4)', flexDirection: 'column', justifyContent: 'space-around', height: '100%', opacity: 0.8, width: '100%' },
  disabledContainer: { alignItems: 'center', width: '100%' },
  disabledHeader: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  disabledClose: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 50, padding: 10 },
})
