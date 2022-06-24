import { useState, useEffect } from 'react';
import { SafeAreaView, Dimensions, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}

export default function Picklanguage({ navigation }) {
  const [newBusiness, setNewbusiness] = useState(null)

  const pick = async(language) => {
    const phase = await AsyncStorage.getItem("phase")

    AsyncStorage.setItem("language", language)

    navigation.dispatch(CommonActions.reset({ index: 1, routes: [{ name: phase }]}))
  }
  const initialize = async() => {
    setNewbusiness(await AsyncStorage.getItem("newBusiness"))
  }

  useEffect(() => {
    initialize()
  }, [])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.picklanguage}>
        <View style={styles.body}>
          <View style={styles.languages}>
            <TouchableOpacity style={styles.language} onPress={() => pick('english')}>
              <Text style={styles.languageHeader}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.language} onPress={() => pick('french')}>
              <Text style={styles.languageHeader}>French (Français)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.language} onPress={() => pick('vietnamese')}>
              <Text style={styles.languageHeader}>Vietnamese (Tiếng Việt)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.language} onPress={() => pick('chinese')}>
              <Text style={styles.languageHeader}>Chinese (中国人)</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.bottomNavs}>
          <View style={styles.bottomNavsRow}>
            {newBusiness && <TouchableOpacity style={styles.bottomNav} onPress={() => {
              AsyncStorage.removeItem("newBusiness")

              navigation.dispatch(CommonActions.reset({ index: 1, routes: [{ name: "list" }]}));
            }}><Text style={styles.bottomNavHeader}>{tr.t("buttons.cancel")}</Text></TouchableOpacity>}

            <TouchableOpacity style={styles.bottomNav} onPress={() => {
              AsyncStorage.clear()

              navigation.dispatch(CommonActions.reset({ index: 1, routes: [{ name: "auth" }]}));
            }}>
              <Text style={styles.bottomNavHeader}>Log-Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  picklanguage: { height: '100%', width: '100%' },
  body: { flexDirection: 'column', height: '90%', justifyContent: 'space-around' },
  languages: { alignItems: 'center', width: '100%' },
  language: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: '10%', padding: 10, width: '80%' },
  languageHeader: { fontSize: wsize(6), textAlign: 'center' },

  bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
  bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
  bottomNavHeader: { fontSize: wsize(4), fontWeight: 'bold' },
})
