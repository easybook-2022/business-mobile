import { useEffect, useState } from 'react';
import { SafeAreaView, View, FlatList, ScrollView, Text, TextInput, Image, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Dimensions, Modal, Keyboard } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { socket, logo_url } from '../../assets/info'
import { displayTime, resizePhoto } from 'geottuse-tools'

import { getLocationHours, getLocationProfile } from '../apis/locations'
import { getAllWorkingStylists, getStylistInfo, getAllWorkersTime, getWorkersHour } from '../apis/owners'
import { getMenus } from '../apis/menus'
import { bookWalkIn } from '../apis/schedules'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}

export default function Walkin({ navigation }) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const monthsObj = { January: 1, February: 2, March: 3, April: 4, May: 5, June: 6, July: 7, August: 8, September: 9, October: 10, November: 11, December: 12 }
  const daysObj = { Sunday: 1, Monday: 2, Tuesday: 3, Wednesday: 4, Thursday: 5, Friday: 6, Saturday: 7 }

  const [locationId, setLocationid] = useState(0)
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [step, setStep] = useState('')
  const [selectedWorkerinfo, setSelectedworkerinfo] = useState({ id: -1, username: "", hours: {}, loading: false })
  const [hoursInfo, setHoursinfo] = useState({})
  const [allStylists, setAllstylists] = useState({ stylists: [], numStylists: 0, ids: [] })
  const [allWorkerstime, setAllworkerstime] = useState({})
  const [requestInfo, setRequestinfo] = useState({ show: false, search: '', error: false })
  const [menuInfo, setMenuinfo] = useState({ list: [], photos: [] })
  const [scheduled, setScheduled] = useState({})
  const [confirm, setConfirm] = useState({ show: false, worker: -1, search: "", serviceInfo: null, showClientInput: false, clientName: "", cellnumber: "", confirm: false, timeDisplay: "" })
  const [loaded, setLoaded] = useState(false)

  const getAllTheWorkingStylists = async() => {
    const locationid = await AsyncStorage.getItem("locationid")
    const locationtype = await AsyncStorage.getItem("locationtype")
    const date = new Date(Date.now()), day = days[date.getDay()].substr(0, 3), hour = date.getHours().toString(), minute = date.getMinutes()
    const data = { locationid, day, hour, minute: minute < 10 ? "0" + minute : minute.toString() }

    getAllWorkingStylists(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setAllstylists({ ...allStylists, stylists: res.stylists, numStylists: res.numStylists, ids: res.ids })
          setLocationid(locationid)
          setType(locationtype)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getTheLocationProfile = async() => {
    const locationid = await AsyncStorage.getItem("locationid")
    const data = { locationid }

    getLocationProfile(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setName(res.info.name)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {

        }
      })
  }
  const getTheLocationHours = async() => {
    const locationid = await AsyncStorage.getItem("locationid")

    getLocationHours(locationid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { hours } = res

          setHoursinfo(hours)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getAllTheWorkersTime = async() => {
    const locationid = await AsyncStorage.getItem("locationid")
    
    getAllWorkersTime(locationid)
    .then((res) => {
      if (res.status == 200) {
        return res.data
      }
    })
    .then((res) => {
      if (res) {
        setAllworkerstime(res.workers)
      }
    })
    .catch((err) => {
      if (err.response && err.response.status == 400) {
        const { errormsg, status } = err.response.data
      }
    })
  }
  const getAllScheduledTimes = async() => {
    const locationid = await AsyncStorage.getItem("locationid")
    const data = { locationid, ownerid: null }

    getWorkersHour(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { workersHour } = res

          for (let worker in workersHour) {
            for (let info in workersHour[worker]) {
              if (info == "scheduled") {
                const newScheduled = {}

                for (let info in workersHour[worker]["scheduled"]) {
                  let splitTime = info.split("-")
                  let time = splitTime[0]
                  let status = splitTime[1]
                  
                  newScheduled[jsonDateToUnix(JSON.parse(time))] = workersHour[worker]["scheduled"][info]
                }

                workersHour[worker]["scheduled"] = newScheduled
              }
            }
          }

          setScheduled(workersHour)
          setLoaded(true)
        }
      })
  }
  const selectWorker = id => {
    getStylistInfo(id)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setSelectedworkerinfo({ ...selectedWorkerinfo, id, username: res.username, hours: res.days })
          getAllMenus()
          setStep(2)
        }
      })
  }
  const getAllMenus = async() => {
    getMenus(locationId)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setMenuinfo({ ...menuInfo, list: res.list, photos: res.photos })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const displayListItem = info => {
    return (
      <View style={styles.item}>
        <View style={{ flexDirection: 'row', width: '100%' }}>
          {info.image.name && (
            <View style={{ width: '25%' }}>
              <View style={styles.itemImageHolder}>
                <Image 
                  style={resizePhoto(info.image, wsize(20))} 
                  source={{ uri: logo_url + info.image.name }}
                />
              </View>
            </View>
          )}
          <View style={{ width: '80%' }}>
            <Text style={styles.itemHeader}>{info.name}</Text>
            <Text style={styles.itemMiniHeader}>{info.description}</Text>
            <Text style={styles.itemHeader}>$ {info.price}</Text>
            <TouchableOpacity style={styles.itemAction} onPress={() => bookTheWalkIn(info)}>
              <Text style={styles.itemActionHeader}>Pick</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }
  const displayList = info => {
    let { id, image, name, list, listType, show = true, parentId = "" } = info

    return (
      <View>
        {name ?
          <View style={styles.menu}>
            <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => {
              const newList = [...menuInfo.list]

              const toggleMenu = list => {
                list.forEach(function (item) {
                  if (item.parentId == parentId) {
                    item.show = false
                  }

                  if (item.id == id) {
                    item.show = show ? false : true
                  } else if (item.list) {
                    toggleMenu(item.list)
                  }
                })
              }

              toggleMenu(newList)

              setMenuinfo({ ...menuInfo, list: newList })
            }}>
              {image.name && (
                <View style={styles.menuImageHolder}>
                  <Image 
                    style={resizePhoto(image, wsize(10))} 
                    source={image.name ? { uri: logo_url + image.name } : require("../../assets/noimage.jpeg")}
                  />
                </View>
              )}
              <View style={styles.column}><Text style={styles.menuName}>{name} (Menu)</Text></View>
            </TouchableOpacity>
            {list.length > 0 && list.map((info, index) => (
              <View key={"list-" + index}>
                {show && (
                  info.listType == "list" ? 
                    displayList({ id: info.id, name: info.name, image: info.image, list: info.list, listType: info.listType, show: info.show, parentId: info.parentId })
                    :
                    displayListItem(info)
                )}
              </View>
            ))}
          </View>
          :
          list.map((info, index) => (
            <View key={"list-" + index}>
              {show && (
                info.listType == "list" ? 
                  displayList({ id: info.id, name: info.name, image: info.image, list: info.list, listType: info.listType, show: info.show, parentId: info.parentId })
                  :
                  displayListItem(info)
              )}
            </View>
          ))
        }
      </View>
    )
  }
  const bookTheWalkIn = serviceInfo => {
    if (!confirm.show) {
      let { id, username } = selectedWorkerinfo
      const { search } = requestInfo

      setConfirm({ ...confirm, show: true, worker: { id, username }, search, serviceInfo })
    } else {
      const { worker, search, serviceInfo, clientName } = confirm
      const time = new Date(Date.now()), hour = time.getHours().toString(), minute = time.getMinutes().toString()
      const jsonDate = { "day":days[time.getDay()],"month":months[time.getMonth()],"date":time.getDate(),"year":time.getFullYear() }
      let bM = "0", eM = "10", bH = parseInt(hour), eH = parseInt(hour), bTime = "", eTime = ""

      if (minute >= 10) {
        bM = minute.substr(0, 1)
        eM = minute.substr(1)
      }

      if (minute >= 0 && minute < 15) {
        eMone = 0
        eMtwo = 15
      } else if (minute < 30) {
        eMone = 15
        eMtwo = 30
      } else if (minute < 45) {
        eMone = 30
        eMtwo = 45
      } else {
        eMone = 45
        eMtwo = 0

        eH = eH < 23 ? eH + 1 : 0
      }

      bTime = bH.toString() + ":" + eMone.toString()
      eTime = eH.toString() + ":" + eMtwo.toString()

      jsonDate["hour"] = bH
      jsonDate["minute"] = eMone

      let data = { 
        workerid: worker.id, locationid: locationId, 
        time: jsonDate, bTime, eTime,
        unix: jsonDateToUnix(jsonDate),
        note: "", type, 
        client: {
          service: !serviceInfo ? search : "",
          type: !serviceInfo ? "service" : "",
          name: clientName
        }, 
        serviceid: serviceInfo ? serviceInfo.id : null
      }

      bookWalkIn(data)
        .then((res) => {
          if (res.status == 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            data = { ...data, receiver: res.receiver }

            socket.emit("socket/business/bookWalkIn", data, () => {
              setConfirm({ ...confirm, showClientInput: false, timeDisplay: res.timeDisplay })

              setTimeout(function () {
                setConfirm({ ...confirm, show: false, client: { name: "", cellnumber: "" }, confirm: false })
                setSelectedworkerinfo({ ...selectedWorkerinfo, id: -1, hours: {} })
                setStep(0)
              }, 3000)
            })
          }
        })
        .catch((err) => {
          if (err.response && err.response.status == 400) {
            const { errormsg, status } = err.response.data

          }
        })
    }
  }
  const logout = async() => {
    const ownerid = await AsyncStorage.getItem("ownerid")

    socket.emit("socket/business/logout", ownerid, () => {
      AsyncStorage.clear()

      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "auth" }]}));
    })
  }
  const jsonDateToUnix = date => {
    return Date.parse(date["day"] + " " + date["month"] + " " + date["date"] + " " + date["year"] + " " + date["hour"] + ":" + date["minute"])
  }

  const initialize = () => {
    getTheLocationProfile()
    getTheLocationHours()
    getAllTheWorkersTime()
    getAllScheduledTimes()
  }

  useEffect(() => initialize(), [])

  useEffect(() => {
    getAllTheWorkingStylists()
  }, [step == 1])

  return (
    <SafeAreaView style={styles.walkin}>
      <View style={styles.box}>
        {step == 0 && (
          <View style={styles.headers}>
            <Text style={styles.header}>
              Hi Client{':)\n'}
              Welcome to {name}
            </Text>
            <Text style={styles.header}>
              Easily pick the stylist and service{'\n'}
              <Text style={{ fontSize: wsize(8), fontWeight: 'bold' }}>(you want)</Text>
              {'\n'}and have a seat
            </Text>

            <TouchableOpacity style={styles.action} onPress={() => setStep(1)}>
              <Text style={styles.actionHeader}>Begin</Text>
            </TouchableOpacity>
          </View>
        )}

        {step == 1 && (
          <View style={styles.workerSelection}>
            <Text style={styles.workerSelectionHeader}>Pick a stylist (Optional)</Text>

            <View style={styles.workersList}>
              <FlatList
                data={allStylists.stylists}
                renderItem={({ item, index }) => 
                  <View key={item.key} style={styles.workersRow}>
                    {item.row.map(info => (
                      info.id ? 
                        <TouchableOpacity key={info.key} style={[styles.worker, { backgroundColor: (selectedWorkerinfo.id == info.id) ? 'rgba(0, 0, 0, 0.3)' : null }]} disabled={selectedWorkerinfo.loading} onPress={() => selectWorker(info.id)}>
                          <View style={styles.workerProfile}>
                            <Image 
                              source={info.profile.name ? { uri: logo_url + info.profile.name } : require("../../assets/profilepicture.jpeg")} 
                              style={resizePhoto(info.profile, wsize(20))}
                            />
                          </View>
                          <Text style={styles.workerHeader}>{info.username}</Text>
                        </TouchableOpacity>
                        :
                        <View key={info.key} style={styles.worker}></View>
                    ))}
                  </View>
                }
              />
            </View>

            {allStylists.numStylists > 1 && (
              <View style={styles.actions}>
                <TouchableOpacity style={styles.action} onPress={() => {
                  const { ids } = allStylists

                  selectWorker(ids[Math.floor(Math.random() * ids.length)])
                }}>
                  <Text style={styles.actionHeader}>Random</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {(step == 2 && (menuInfo.photos.length > 0 || menuInfo.list.length > 0)) && (
          <>
            <ScrollView style={{ height: '90%', width: '100%' }}>
              <View style={{ marginHorizontal: width * 0.025 }}>{displayList({ id: "", name: "", image: "", list: menuInfo.list })}</View>
            </ScrollView>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.action} onPress={() => setStep(step - 1)}>
                <Text style={styles.actionHeader}>Go back</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
      <View style={styles.bottomNavs}>
        <View style={styles.bottomNavsRow}>
          <View style={styles.column}>
            <TouchableOpacity style={styles.bottomNav} onPress={() => logout()}>
              <Text style={styles.bottomNavHeader}>Log-Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {(confirm.show || requestInfo.show) && (
        <Modal transparent={true}>
          <SafeAreaView style={{ flex: 1 }}>
            {confirm.show && (
              <View style={styles.bookWalkInContainer}>
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                  <View style={styles.bookWalkInBox}>
                    {!confirm.confirm ? 
                      <>
                        <View style={styles.bookWalkInHeaders}>
                          <Text style={styles.bookWalkInHeader}>Confirming....</Text>

                          <Text style={[styles.bookWalkInHeader, { marginTop: '10%' }]}>
                            {confirm.serviceInfo ? confirm.serviceInfo.name : confirm.search}
                          </Text>

                          <Text style={styles.bookWalkInHeader}>Stylist: {confirm.worker.username}</Text>
                        </View>

                        <View style={styles.bookWalkInActions}>
                          <TouchableOpacity style={styles.bookWalkInAction} onPress={() => setConfirm({ ...confirm, show: false })}>
                            <Text style={styles.bookWalkInActionHeader}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.bookWalkInAction} onPress={() => setConfirm({ ...confirm, confirm: true, showClientInput: true })}>
                            <Text style={styles.bookWalkInActionHeader}>Ok</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                      :
                      confirm.showClientInput ? 
                        <>
                          <TextInput style={styles.bookWalkInInput} placeholder="Enter your name" onChangeText={clientName => setConfirm({ ...confirm, clientName })}/>

                          <TouchableOpacity style={styles.action} onPress={() => bookTheWalkIn()}>
                            <Text style={styles.actionHeader}>Done</Text>
                          </TouchableOpacity>
                        </>
                        :
                        <Text style={styles.bookWalkInHeader}>
                          Ok,{' '}
                          {confirm.timeDisplay == "right now" ? 
                            "There's no wait. You can go straight in"
                            :
                            "we will call you soon. Your estimated time: " + '\n\n' + confirm.timeDisplay
                          }
                        </Text>
                    }
                  </View>
                </TouchableWithoutFeedback>
              </View>
            )}

            {requestInfo.show && (
              <View style={styles.serviceInputBox}>
                <View style={styles.serviceInputHeader}>
                  <TouchableOpacity onPress={() => setRequestinfo({ ...requestInfo, show: false })}>
                    <AntDesign color="white" name="closecircleo" size={30}/>
                  </TouchableOpacity>

                  {(menuInfo.photos.length > 0 || menuInfo.list.length > 0) && (
                    <>
                      <View style={styles.menuInputBox}>
                        <TextInput 
                          style={styles.menuInput} type="text" 
                          placeholder={
                            "Enter " + 
                            (type == "restaurant" && "meal" || type == "store" && "product" || (type == "hair" || type == "nail") && "service") 
                            + " # or name"
                          } 
                          placeholderTextColor="rgba(0, 0, 0, 0.5)"
                          onChangeText={(info) => setRequestinfo({ ...requestInfo, search: info, error: false })} maxLength={37} autoCorrect={false} autoCapitalize="none"
                        />
                        <View style={styles.menuInputActions}>
                          <TouchableOpacity style={styles.menuInputTouch} onPress={() => {
                            if (requestInfo.search) {
                              setRequestinfo({ ...requestInfo, show: false })

                              bookTheWalkIn()
                            } else {
                              setRequestinfo({ ...requestInfo, error: true })
                            }
                          }}>
                            <Text style={styles.menuInputTouchHeader}>Next</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      {requestInfo.error && <Text style={styles.errorMsg}>Your request is empty</Text>}
                    </>
                  )}
                </View>

                <View style={styles.menuPhotos}>
                  <ScrollView>
                    {menuInfo.photos.length > 0 && ( 
                      menuInfo.photos[0].row && (
                        menuInfo.photos.map(info => (
                          info.row.map(item => (
                            item.photo && item.photo.name && (
                              <View key={item.key} style={[styles.menuPhoto, resizePhoto(item.photo, wsize(95)), { borderRadius: wsize(95) / 2 }]}>
                                <Image 
                                  style={{ width: '100%', height: '100%' }}
                                  source={{ uri: logo_url + item.photo.name }}
                                />
                              </View>
                            )
                          ))
                        ))
                      )
                    )}
                  </ScrollView>
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
  walkin: { backgroundColor: 'white', height: '100%', width: '100%' },
  box: { alignItems: 'center', backgroundColor: '#EAEAEA', flexDirection: 'column', height: '90%', justifyContent: 'space-between', width: '100%' },

  headers: { alignItems: 'center', flexDirection: 'column', height: '90%', justifyContent: 'space-around', width: '100%' },
  header: { fontSize: wsize(6), textAlign: 'center' },

  inputsBox: { alignItems: 'center', height: '70%', width: '90%' },
  input: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(6), marginBottom: 30, paddingVertical: 20, width: '100%' },

  actions: { flexDirection: 'row', justifyContent: 'space-around' },
  action: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 10 },
  actionHeader: { fontSize: wsize(6) },

  // stylists list
  workerSelection: { alignItems: 'center', marginTop: 20 },
  workerSelectionHeader: { fontSize: wsize(8), fontWeight: 'bold', textAlign: 'center' },
  workersList: { height: '60%' },
  workersRow: { flexDirection: 'row', justifyContent: 'space-between' },
  worker: { alignItems: 'center', borderRadius: 10, marginHorizontal: 5, padding: 5, width: (width / 3) - 30 },
  workerProfile: { borderRadius: wsize(20) / 2, flexDirection: 'column', height: wsize(20), justifyContent: 'space-around', overflow: 'hidden', width: wsize(20) },
  workerHeader: { fontSize: wsize(4), fontWeight: 'bold'  },
  selectedWorker: { marginVertical: 10 },
  selectedWorkerImage: { borderRadius: wsize(20) / 2, height: wsize(20), width: wsize(20) },
  selectedWorkerHeader: { fontSize: wsize(4), fontWeight: 'bold', textAlign: 'center' },

  openInput: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), margin: 5, padding: 10, width: '40%' },
  openInputHeader: { fontSize: wsize(4), textAlign: 'center' },

  serviceInputBox: { backgroundColor: 'rgba(0, 0, 0, 0.9)', height: '100%', width: '100%' },
  serviceInputHeader: { alignItems: 'center', height: '20%', width: '100%' },
  menuInputBox: { alignItems: 'center', marginBottom: 5, width: '100%' },
  menuInput: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), padding: 10, width: '95%' },
  menuInputActions: { flexDirection: 'row', justifyContent: 'space-around' },
  menuInputTouch: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), margin: 5, padding: 10, width: '40%' },
  menuInputTouchHeader: { fontSize: wsize(4), textAlign: 'center' },
  menuPhotos: { height: '80%', width: '100%' },
  menuPhoto: { marginBottom: 10, marginHorizontal: width * 0.025 },

  menu: { borderTopLeftRadius: 3, borderTopRightRadius: 3, marginVertical: 10 },
  menuImageHolder: { borderRadius: wsize(10) / 2, flexDirection: 'column', height: wsize(10), justifyContent: 'space-around', overflow: 'hidden' },
  menuName: { fontSize: wsize(6), fontWeight: 'bold', marginLeft: 5, marginTop: wsize(4) / 2 },
  itemInfo: { fontSize: wsize(5), marginLeft: 10, marginVertical: 10 },
  item: { backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3, padding: 5, width: '100%' },
  itemImageHolder: { borderRadius: wsize(20) / 2, flexDirection: 'column', height: wsize(20), justifyContent: 'space-around', margin: 5, overflow: 'hidden', width: wsize(20) },
  itemHeader: { fontSize: wsize(6), fontWeight: 'bold' },
  itemMiniHeader: { fontSize: wsize(4) },
  itemActions: { flexDirection: 'row', marginTop: 0 },
  itemAction: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, padding: 5, width: '50%' },
  itemActionHeader: { fontSize: wsize(5), textAlign: 'center' },

  bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
  bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  bottomNav: { flexDirection: 'row' },
  bottomNavHeader: { color: 'black', fontSize: wsize(4), fontWeight: 'bold', paddingVertical: 5 },

  bookWalkInContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  bookWalkInBox: { alignItems: 'center', backgroundColor: 'white', height: '90%', paddingVertical: '5%', width: '90%' },
  bookWalkInHeader: { fontSize: wsize(6), fontWeight: 'bold', textAlign: 'center' },
  bookWalkInInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(6), marginHorizontal: '5%', marginVertical: 10, padding: 2, width: '90%' },
  bookWalkInActions: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  bookWalkInAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: '40%' },
  bookWalkInActionHeader: { fontSize: wsize(6), textAlign: 'center' },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
  errorMsg: { color: 'red', fontWeight: 'bold' },
})
