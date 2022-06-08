# mobile

# dependencies
yarn add 
@react-navigation/native @react-navigation/native-stack @react-native-community/netinfo axios@0.24.0 @react-native-async-storage/async-storage@1.15.0 socket.io-client react-native-gesture-handler@2.1.0 @react-native-voice/voice geottuse-tools

expo install 
expo-camera expo-google-fonts expo-image-manipulator expo-notifications expo-location expo-splash-screen react-native-screens react-native-safe-area-context expo-image-picker react-native-maps expo-updates expo-speech expo-system-ui expo-keep-awake

# (ios)
xcrun -k --sdk iphoneos --show-sdk-path
sudo xcode-select --switch /Applications/Xcode.app

# (android)
expo fetch:android:keystore
keytool -export -rfc -alias <alias name> -file upload_certificate.pem -keystore easygo-business.jks
