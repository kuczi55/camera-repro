import {
  StyleSheet,
  Platform,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Image,
  Text,
  View,
  NativeModules,
  ActivityIndicator,
} from "react-native";
import { useRef, useEffect, useState } from "react";
import { Camera, CameraType } from "expo-camera";

const TRANSLUCENT_BG = "#717171C1";
const STATUS_BAR_HEIGHT = NativeModules.StatusBarManager.HEIGHT;

export default function App() {
  const camera = useRef(null);
  const { height } = Dimensions.get("window");
  const [cameraReady, setCameraReady] = useState(false);
  const [review, setReview] = useState(false);
  const [image, setImage] = useState();
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const [type, setType] = useState(CameraType.back);

  const permissionFunction = async () => {
    const cameraPermission = await Camera.requestCameraPermissionsAsync();

    if (cameraPermission.status !== "granted") {
      alert("Permission for media access needed.");
    }
  };

  useEffect(() => {
    permissionFunction();
  }, []);

  async function toggleCameraType() {
    await takePicture();
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
    camera.current?.resumePreview();
  }

  const takePicture = async () => {
    setProcessingPhoto(true);
    try {
      const photo = await camera.current.takePictureAsync();
      // camera.current?.pausePreview();
      if (photo) {
        setImage(photo);
        setReview(true);
      }
    } catch (e) {
      console.log("Error taking picture", e);
    } finally {
      setProcessingPhoto(false);
      // camera.current?.resumePreview();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {!review ? (
        <>
          <Camera
            type={type}
            ref={camera}
            // useCamera2Api
            style={styles.fullScreen}
            // style={Platform.select({
            //   ios: styles.fullScreen,
            //   android: {
            //     height,
            //     width: (height / 4) * 3,
            //   },
            // })}
            onCameraReady={() => {
              setCameraReady(true);
            }}
            onMountError={(e) => console.log("Camera mount error", e)}
          />
          {!processingPhoto ? (
            <TouchableOpacity
              style={styles.button}
              onPress={takePicture}
              disabled={!cameraReady}
            />
          ) : (
            <ActivityIndicator
              style={styles.button}
              size="large"
              color="#0000ff"
            />
          )}
          {!cameraReady && <View style={styles.cameraPlaceholder} />}
        </>
      ) : (
        <>
          <Image source={{ uri: image.uri }} style={styles.fullScreen} />
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={() => setReview(false)}
            disabled={!cameraReady}
          >
            <Text>Retake Picture</Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 20,
  },
  retakeButton: {
    width: 120,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 20,
  },
  cameraPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fff",
  },
});
