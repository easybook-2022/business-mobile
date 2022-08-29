import { useEffect, useState } from 'react';
import { SafeAreaView, View, FlatList, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Modal } from 'react-native';
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarCodeScanner } from 'expo-barcode-scanner';
import QRCode from 'react-native-qrcode-svg';
import { tr } from '../../assets/translate'
import { getId } from 'geottuse-tools';
import { getTables, getQrCode, addTable, removeTable } from '../apis/dining_tables'
import { tableUrl } from '../../assets/info'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}
let source

export default function Tables() {
  const [ownerId, setOwnerid] = useState(null)
  const [language, setLanguage] = useState('')
  const [showAddtable, setShowaddtable] = useState({ show: false, table: "", errorMsg: "" })
  const [showRemovetable, setShowremovetable] = useState({ show: false, table: { id: -1, name: "" } })
  const [showQr, setShowqr] = useState({ show: false, table: "", codeText: "" })
  
  const [tables, setTables] = useState([])

  const addATable = async() => {
    if (!showAddtable.show) {
      setShowaddtable({ ...showAddtable, show: true })
    } else {
      const locationid = await AsyncStorage.getItem("locationid")
      const { table } = showAddtable

      if (table) {
        const data = { locationid, table, tableid: getId(), cancelToken: source.token }
        
        addTable(data)
          .then((res) => {
            if (res.status == 200) {
              return res.data
            }
          })
          .then((res) => {
            if (res) {
              setShowaddtable({ ...showAddtable, show: false, table: "", errorMsg: "" })
              getTheTables()
            }
          })
          .catch((err) => {
            if (err.response && err.response.status == 400) {
              const { errormsg, status } = err.response.data

              switch(status) {
                case "exist":
                  setShowaddtable({ ...showAddtable, errorMsg: "Table number already exist" })

                  break;
                default:
              }
            }
          })
      } else {
        setShowaddtable({ ...showAddtable, errorMsg: "Please enter a number" })
      }
    }
  }
  const removeTheTable = (id, name) => {
    if (!showRemovetable.show) {
      setShowremovetable({ ...showRemovetable, show: true, table: { id, name } })
    } else {
      const { id } = showRemovetable.table
      const data = { tableid: id, cancelToken: source.token }

      removeTable(data)
        .then((res) => {
          if (res.status == 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            setShowremovetable({ ...showRemovetable, show: false, table: { id: -1, name: "" } })
            getTheTables()
          }
        })
        .catch((err) => {
          if (err.response && err.response.status == 400) {
            const { errormsg, status } = err.response.data
          }
        })
    }
  }
  const showQrCode = async(id) => {
    const locationid = await AsyncStorage.getItem("locationid")
    const data = { tableid: id, cancelToken: source.token }

    getQrCode(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setShowqr({ ...showQr, show: true, table: res.name, codeText: tableUrl + id })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data

          
        }
      })
  }
  const getTheTables = async() => {
    tr.locale = await AsyncStorage.getItem("language")

    setLanguage(await AsyncStorage.getItem("language"))

    const locationid = await AsyncStorage.getItem("locationid")
    const data = { locationid, cancelToken: source.token }

    getTables(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then(async(res) => {
        if (res) {
          const ownerid = await AsyncStorage.getItem("ownerid")

          setTables(res.tables)
          setOwnerid(ownerid)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }

  useEffect(() => {
    getTheTables()

    source = axios.CancelToken.source();

    return () => {
      if (source) {
        source.cancel("components got unmounted");
      }
    }
  }, [])

  return (
    <SafeAreaView style={styles.tables}>
      <View style={styles.box}>
        <TouchableOpacity style={styles.addTable} onPress={() => addATable()}>
          <Text style={styles.addTableHeader}>+ {tr.t("tables.addTable")}</Text>
        </TouchableOpacity>

        <FlatList
          style={{ width: '100%' }}
          showsVerticalScrollIndicator={false}
          data={tables}
          renderItem={({ item, index }) => 
            <View key={item.key} style={styles.table}>
              <View style={styles.column}><Text style={styles.tableHeader}>{tr.t("tables.table")}{item.name}</Text></View>

              <View style={styles.tableActions}>
                <View style={styles.column}>
                  <TouchableOpacity style={[styles.tableAction, { padding: 10 }]} onPress={() => showQrCode(item.tableid)}>
                    <Text style={{ fontSize: wsize(3) }}>{tr.t("tables.showBarcode")}</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.tableAction} onPress={() => removeTheTable(item.key, item.name)}>
                  <AntDesign name="close" size={wsize(10)}/>
                </TouchableOpacity>
              </View>
            </View>
          }
        />
      </View>

      {(showAddtable.show || showRemovetable.show || showQr.show) && (
        <Modal transparent={true}>
          <SafeAreaView style={{ flex: 1 }}>
            {showAddtable.show && (
              <View style={styles.addTableBox}>
                <View style={styles.addTableContainer}>
                  <Text style={styles.addTableHeader}>{tr.t("tables.hidden.add.tableNumber")}</Text>

                  <TextInput style={styles.addTableInput} keyboardType="numeric" onChangeText={name => setShowaddtable({ ...showAddtable, table: name })}/>

                  <Text style={styles.errorMsg}>{showAddtable.errorMsg}</Text>

                  <View style={styles.addTableActions}>
                    <TouchableOpacity style={styles.addTableAction} onPress={() => setShowaddtable({ ...showAddtable, show: false, errorMsg: "" })}>
                      <Text style={styles.addTableActionHeader}>{tr.t("buttons.cancel")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addTableAction} onPress={() => addATable()}>
                      <Text style={styles.addTableActionHeader}>{tr.t("buttons.done")}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {showRemovetable.show && (
              <View style={styles.removeTableBox}>
                <View style={styles.removeTableContainer}>
                  <Text style={styles.removeTableHeader}>{tr.t("tables.hidden.remove.header")}{showRemovetable.table.name} ?</Text>

                  <View style={styles.removeTableActions}>
                    <TouchableOpacity style={styles.removeTableAction} onPress={() => setShowremovetable({ ...showRemovetable, show: false, table: '' })}>
                      <Text style={styles.removeTableActionHeader}>{tr.t("buttons.no")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.removeTableAction} onPress={() => removeTheTable()}>
                      <Text style={styles.removeTableActionHeader}>{tr.t("buttons.yes")}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {showQr.show && (
              <View style={styles.qrBox}>
                <View style={styles.qrContainer}>
                  <TouchableOpacity style={styles.qrClose} onPress={() => setShowqr({ ...showQr, show: false, table: "" })}>
                    <AntDesign name="close" size={wsize(10)}/>
                  </TouchableOpacity>

                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.qrHeader}>{tr.t("tables.hidden.qr.header")}{showQr.table}</Text>

                    <QRCode size={wsize(80)} value={showQr.codeText}/>
                  </View>
                </View>
              </View>
            )}
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  tables: { backgroundColor: 'white', height: '100%', width: '100%' },
  box: { alignItems: 'center', height: '100%', width: '100%' },
  addTable: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 20, padding: 5 },
  addTableHeader: { fontSize: wsize(5), textAlign: 'center' },

  table: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, flexDirection: 'row', justifyContent: 'space-between', margin: '2.5%', padding: 10, width: '95%' },
  tableHeader: { fontSize: wsize(6), fontWeight: 'bold' },
  tableActions: { flexDirection: 'row', justifyContent: 'space-around' },
  tableAction: { borderRadius: wsize(10) / 2, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5 },

  // hidden
  // add table
  addTableBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  addTableContainer: { alignItems: 'center', backgroundColor: 'white', height: '70%', width: '70%' },
  addTableHeader: { fontSize: wsize(6), textAlign: 'center' },
  addTableInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(6), marginVertical: 30, padding: 5, width: '90%' },
  addTableActions: { flexDirection: 'row', justifyContent: 'space-around' },
  addTableAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 10, padding: 5, width: 100 },
  addTableActionHeader: { textAlign: 'center' },

  // remove table
  removeTableBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  removeTableContainer: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '70%', justifyContent: 'space-around', width: '70%' },
  removeTableHeader: { fontSize: wsize(6), textAlign: 'center' },
  removeTableActions: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  removeTableAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: '40%' },
  removeTableActionHeader: { fontSize: wsize(6), textAlign: 'center' },

  // show qr barcode
  qrBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  qrContainer: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  qrHeader: { fontSize: wsize(6), fontWeight: 'bold', textAlign: 'center' },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
  errorMsg: { color: 'darkred', fontWeight: 'bold', marginVertical: 20 },
})