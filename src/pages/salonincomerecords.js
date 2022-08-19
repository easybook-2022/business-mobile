import { useEffect, useState } from 'react'
import { SafeAreaView, View, FlatList, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSalonIncome } from '../apis/locations'

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}

export default function Salonincomerecords(props) {
  const [daily, setDaily] = useState([])
  const [monthly, setMonthly] = useState([])
  const [yearly, setYearly] = useState([])
  const [viewType, setViewtype] = useState('')

  const getTheIncome = async() => {
    const locationid = await AsyncStorage.getItem("locationid")

    getSalonIncome(locationid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {

        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }

  useEffect(() => {
    getTheIncome()
  }, [])

  return (
    <SafeAreaView style={styles.paymentRecords}>
      <View style={styles.box}>
        <View style={styles.viewTypes}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={[styles.column, { width: '30%' }]}>
              <TouchableOpacity style={styles.viewType} onPress={() => setViewtype('days')}>
                <Text style={styles.viewTypeHeader}>By Days</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.column, { width: '30%' }]}>
              <TouchableOpacity style={styles.viewType} onPress={() => setViewtype('months')}>
                <Text style={styles.viewTypeHeader}>By Months</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.column, { width: '30%' }]}>
              <TouchableOpacity style={styles.viewType} onPress={() => setViewtype('years')}>
                <Text style={styles.viewTypeHeader}>By Years</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.records}>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  paymentRecords: { backgroundColor: 'white', height: '100%', width: '100%' },
  box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

  viewTypes: { flexDirection: 'column', height: '15%', justifyContent: 'space-around', width: '100%' },
  viewType: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 10 },
  viewTypeHeader: { fontSize: wsize(5), fontWeight: '300', textAlign: 'center' },

  recordBox: { height: '85%' },
  record: { backgroundColor: 'rgba(127, 127, 127, 0.3)', borderRadius: 5, margin: 10, padding: 5 },
})
