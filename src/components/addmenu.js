import React, { useEffect, useState } from 'react'
import { 
  SafeAreaView, Platform, ActivityIndicator, Dimensions, ScrollView, Modal, View, 
  Text, TextInput, Image, Keyboard, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, 
  PermissionsAndroid
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker';
import { getId } from 'geottuse-tools';
import { logo_url } from '../../assets/info'
import { addNewMenu, getMenuInfo, saveMenu } from '../apis/menus'

import Ionicons from 'react-native-vector-icons/Ionicons'

// widgets
import Loadingprogress from '../widgets/loadingprogress';

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}
const steps = ['name', 'photo']

export default function Addmenu(props) {
	const params = props.route.params
	const { parentMenuid, menuid, refetch } = params

	const [setupType, setSetuptype] = useState('name')
	const [cameraPermission, setCamerapermission] = useState(null);
	const [pickingPermission, setPickingpermission] = useState(null);
  const [camType, setCamtype] = useState('back')
	const [camComp, setCamcomp] = useState(null)
  const [choosing, setChoosing] = useState(false) // for android
	
	const [name, setName] = useState('')
	const [image, setImage] = useState({ uri: '', name: '', size: { height: 0, width: 0 }, loading: false })

	const [loaded, setLoaded] = useState(menuid ? false : true)
	const [loading, setLoading] = useState(false)

	const [errorMsg, setErrormsg] = useState('')

	const addTheNewMenu = async() => {
    setLoading(true)

		const ownerid = await AsyncStorage.getItem("ownerid")
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { locationid, parentMenuid, name, image }

		addNewMenu(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
          setLoading(false)

					refetch()
					props.navigation.goBack()
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data
				}

        setLoading(false)
			})
	}
	const saveTheMenu = () => {
    setLoading(true)

		const data = { menuid, name, image, permission: cameraPermission && pickingPermission }
		
		saveMenu(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
          setLoading(false)

					refetch()
					props.navigation.goBack()
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
				}
			})
	}
	const saveInfo = () => {
		const index = steps.indexOf(setupType)
		let msg = ""

		setLoading(true)

		switch (index) {
			case 0:
				if (!name) {
					msg = "Please provide a name for the menu"
				}

				break
			default:
		} 

		if (msg == "") {
			const nextStep = index == 1 ? "done" : steps[index + 1]

			if (nextStep == "photo") {
				allowCamera()
				allowChoosing()
			}

			setSetuptype(nextStep)
			setErrormsg('')
		} else {
			setErrormsg(msg)
		}

		setLoading(false)
	}

	const getTheMenuInfo = async() => {
		getMenuInfo(menuid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { name, menuImage } = res.info

					setName(name)
					setImage({ ...image, uri: menuImage.name ? logo_url + menuImage.name : "" })
					setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
				}
			})
	}

	const snapPhoto = async() => {
    setImage({ ...image, loading: true })

		let char = getId()

		if (camComp) {
			let options = { quality: 0, skipProcessing: true };
			let photo = await camComp.takePictureAsync(options)
			let photo_option = [{ resize: { width, height: width }}]
			let photo_save_option = { format: ImageManipulator.SaveFormat.JPEG, base64: true }

      if (camType == "front") {
        photo_option.push({ flip: ImageManipulator.FlipType.Horizontal })
      }

			photo = await ImageManipulator.manipulateAsync(
				photo.localUri || photo.uri,
				photo_option,
				photo_save_option
			)

			FileSystem.moveAsync({
				from: photo.uri,
				to: `${FileSystem.documentDirectory}/${char}.jpg`
			})
			.then(() => {
				setImage({ 
          ...image, 
          uri: `${FileSystem.documentDirectory}/${char}.jpg`, name: `${char}.jpg`, loading: false, 
          size: { width, height: width }
        })
				setErrormsg('')
			})
		}
	}
	const choosePhoto = async() => {
    setChoosing(true)

		let char = getId(), photo = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			aspect: [1, 1],
			quality: 0.1,
			base64: true
		});

		if (!photo.cancelled) {
			FileSystem.moveAsync({
				from: photo.uri,
				to: `${FileSystem.documentDirectory}/${char}.jpg`
			})
			.then(() => {
				setImage({ 
          ...image, 
          uri: `${FileSystem.documentDirectory}/${char}.jpg`, name: `${char}.jpg`, loading: false, 
          size: { width: photo.width, height: photo.height }
        })
				setErrormsg('')
			})
		}

    setChoosing(false)
	}
	const allowCamera = async() => {
		if (Platform.OS == "ios") {
      const { status } = await Camera.getCameraPermissionsAsync()

      if (status == 'granted') {
        setCamerapermission(status === 'granted')
      } else {
        const { status } = await Camera.requestCameraPermissionsAsync()

        setCamerapermission(status === 'granted')
      }
    } else {
      const status = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA)

      if (!status) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "EasyGO Business allows you to take a photo for menu",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setCamerapermission(true)
        }
      } else {
        setCamerapermission(true)
      }
    }
	}
	const allowChoosing = async() => {
		if (Platform.OS === "ios") {
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync()
          
      if (status == 'granted') {
        setPickingpermission(status === 'granted')
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        setPickingpermission(status === 'granted')
      }
    } else {
      setPickingpermission(true)
    }
	}

	useEffect(() => {
		getTheMenuInfo()
	}, [])

	return (
		<SafeAreaView style={[styles.addmenu, { opacity: loading ? 0.5 : 1 }]}>
			<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
				{loaded ? 
					<View style={styles.box}>
						{setupType == 'name' && (
							<View style={styles.inputContainer}>
								<Text style={styles.addHeader}>What is this menu call</Text>

								<TextInput 
									style={styles.addInput} placeholder="example: Beverages" placeholderTextColor="rgba(127, 127, 127, 0.5)" 
									onChangeText={(name) => setName(name)} value={name} autoCorrect={false} autoCompleteType="off" 
									autoCapitalize="none"
								/>
							</View>
						)}
            
						{setupType == 'photo' && (
							<View style={styles.cameraContainer}>
								<Text style={styles.cameraHeader}>Provide a photo for {name} (Optional)</Text>
                
								{image.uri ? (
									<>
										<Image style={styles.camera} source={{ uri: image.uri }}/>

										<TouchableOpacity style={styles.cameraAction} onPress={() => setImage({ ...image, uri: '' })}>
											<Text style={styles.cameraActionHeader}>Cancel</Text>
										</TouchableOpacity>
									</>
								) : (
									<>
                    {!choosing && (
                      <>
                        <Camera 
                          style={styles.camera} 
                          type={camType} 
                          ref={r => { setCamcomp(r) }}
                          ratio={"1:1"}
                        />

                        <View style={{ alignItems: 'center', marginVertical: 10 }}>
                          <Ionicons name="camera-reverse-outline" size={wsize(7)} onPress={() => setCamtype(camType == 'back' ? 'front' : 'back')}/>
                        </View>
                      </>
                    )}

										<View style={styles.cameraActions}>
											<TouchableOpacity style={[styles.cameraAction, { opacity: image.loading ? 0.5 : 1 }]} disabled={image.loading} onPress={snapPhoto.bind(this)}>
												<Text style={styles.cameraActionHeader}>Take{'\n'}this photo</Text>
											</TouchableOpacity>
											<TouchableOpacity style={[styles.cameraAction, { opacity: image.loading ? 0.5 : 1 }]} disabled={image.loading} onPress={() => {
                        allowChoosing()
                        choosePhoto()
                      }}>
												<Text style={styles.cameraActionHeader}>Choose{'\n'}from phone</Text>
											</TouchableOpacity>
										</View>
									</>
								)}
							</View>
						)}
						
						<Text style={styles.errorMsg}>{errorMsg}</Text>

						<View style={styles.addActions}>
							<TouchableOpacity style={styles.addAction} disabled={loading} onPress={() => props.navigation.goBack()}>
								<Text style={styles.addActionHeader}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.addAction} disabled={loading} onPress={() => {
								if (!menuid) {
									if (setupType == "photo") {
										addTheNewMenu()
									} else {
										saveInfo()
									}
								} else {
									if (setupType == "photo") {
										saveTheMenu()
									} else {
										saveInfo()
									}
								}
							}}>
								<Text style={styles.addActionHeader}>{
									!menuid ? 
										setupType == "photo" ? image.uri ? "Save" : "Skip" : "Next"
										:
										setupType == "photo" ? image.uri ? "Next" : "Skip" : "Next"
								}</Text>
							</TouchableOpacity>
						</View>
					</View>
					:
					<View style={styles.loading}>
						<ActivityIndicator color="black" size="large"/>
					</View>
				}
			</TouchableWithoutFeedback>

      {(image.loading || loading) && <Modal transparent={true}><Loadingprogress/></Modal>}
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	addmenu: { height: '100%', paddingTop: Platform.OS == "ios" ? 0 : Constants.statusBarHeight, width: '100%' },
	box: { alignItems: 'center', height: '100%', width: '100%' },
	inputContainer: { alignItems: 'center', width: '100%' },
	addHeader: { fontSize: wsize(5), fontWeight: 'bold', paddingVertical: 5, textAlign: 'center' },
	addInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, fontSize: wsize(5), padding: 10, width: '90%' },
  
	cameraContainer: { alignItems: 'center', width: '100%' },
	cameraHeader: { fontSize: wsize(5), fontWeight: 'bold', paddingVertical: 5 },
	camera: { height: width, width },
	cameraActions: { flexDirection: 'row' },
	cameraAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: wsize(30) },
	cameraActionHeader: { fontSize: wsize(3), textAlign: 'center' },
	
	addActions: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 50, width: '100%' },
	addAction: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(0.07), padding: 5, width: wsize(30) },
	addActionHeader: { fontSize: wsize(3) },

  loading: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  errorMsg: { color: 'darkred', fontSize: wsize(4), textAlign: 'center' },
})
