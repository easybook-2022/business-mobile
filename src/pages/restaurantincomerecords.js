import { useEffect, useState } from 'react'
import { SafeAreaView, View, FlatList, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRestaurantIncome } from '../apis/locations'

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}
let source

export default function Restaurantincomerecords(props) {
  const [daily, setDaily] = useState([])
  const [monthly, setMonthly] = useState([])
  const [yearly, setYearly] = useState([])
  const [viewType, setViewtype] = useState('')

  const getTheIncome = async() => {
    const locationid = await AsyncStorage.getItem("locationid")
    const data = { locationid, cancelToken: source.token }

    getRestaurantIncome(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setDaily(res.daily)
          setMonthly(res.monthly)
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

    source = axios.CancelToken.source();

    return () => {
      if (source) {
        source.cancel("components got unmounted");
      }
    }
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

        <View style={styles.recordBox}>
          {viewType ? 
            <>
              {viewType == 'days' && ( 
                <FlatList
                  data={daily}
                  renderItem={({ item, index }) => 
                    <View key={item.key} style={styles.record}>
                      <Text style={styles.recordHeader}>
                        {item.header + '\n'}
                        <Text style={{ fontSize: wsize(10), fontWeight: '200' }}>$ {item.total}</Text>
                      </Text>
                    </View>
                  }
                />
              )}

              {viewType == 'months' && (
                <FlatList
                  data={monthly}
                  renderItem={({ item, index }) => 
                    <View key={item.key} style={styles.record}>
                      <Text style={styles.recordHeader}>
                        {item.header + '\n'}
                        <Text style={{ fontSize: wsize(10), fontWeight: '200' }}>$ {item.total}</Text>
                      </Text>
                    </View>
                  }
                />
              )}

              {viewType == 'years' && (
                <FlatList
                  data={yearly}
                  renderItem={({ item, index }) => 
                    <View key={item.key} style={styles.record}>
                      <Text style={styles.recordHeader}>
                        {item.header + '\n'}
                        <Text style={{ fontSize: wsize(10), fontWeight: '200' }}>$ {item.total}</Text>
                      </Text>
                    </View>
                  }
                />
              )}
            </>
            :
            <View style={styles.noResult}>
              <Text style={styles.noResultHeader}>Select the time you want to view your income by</Text>
            </View>
          }
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
  recordHeader: { fontSize: wsize(6), fontWeight: 'bold', textAlign: 'center' },

  noResult: { flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  noResultHeader: { fontSize: wsize(6), paddingHorizontal: '10%', textAlign: 'center' },
})
