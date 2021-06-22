import React, { useState, useEffect } from "react";
import { Platform, View } from "react-native";
import { Appbar, TextInput, Snackbar, Button } from "react-native-paper";
import { getFileObjectAsync, uuid } from "../../../Utils";

// See https://github.com/mmazzarolo/react-native-modal-datetime-picker
// Most of the date picker code is directly sourced from the example.
import DateTimePickerModal from "react-native-modal-datetime-picker";

// See https://docs.expo.io/versions/latest/sdk/imagepicker/
// Most of the image picker code is directly sourced from the example.
import * as ImagePicker from "expo-image-picker";
import { styles } from "./NewSocialScreen.styles";

import firebase from "firebase/app";
import "firebase/firestore";
import { SocialModel } from "../../../models/social";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../RootStackScreen";

interface Props {
  navigation: StackNavigationProp<RootStackParamList, "NewSocialScreen">;
}

export default function NewSocialScreen({ navigation }: Props) {

  const [date, setDate] = useState(0);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [location, setLocation] = useState("");
  const [name, setName] = useState("");

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [dateButtonText, setDateButtonText] = useState("CHOOSE A DATE");
  const [imageButtonText, setImageButtonText] = useState("PICK AN IMAGE");
  const [isSnackBarVisible, setSnackBarVisibility] = useState(false);
  const [isLoading, setLoading] = useState(false);

  // TODO: Follow the Expo Docs to implement the ImagePicker component.
  // https://docs.expo.io/versions/latest/sdk/imagepicker/

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      setImage(result.uri);
      setImageButtonText("CHANGE IMAGE");
    }
  };

  // TODO: Follow the GitHub Docs to implement the react-native-modal-datetime-picker component.
  // https://github.com/mmazzarolo/react-native-modal-datetime-picker

  const handleConfirmDatePicker = (date) => {
    setDate(date.getTime());
    setDateButtonText(date.toLocaleString());
    setDatePickerVisibility(false);
  };

  // TODO: Follow the SnackBar Docs to implement the Snackbar component.
  // https://callstack.github.io/react-native-paper/snackbar.html

  const asyncAwaitNetworkRequests = async () => {
    const object = await getFileObjectAsync(image);
    const result = await firebase
      .storage()
      .ref()
      .child(uuid() + ".jpg")
      .put(object as Blob);
    const downloadURL = await result.ref.getDownloadURL();
    const doc: SocialModel = {
      eventName: name,
      eventDate: date,
      eventLocation: location,
      eventDescription: description,
      eventImage: downloadURL,
    };
    await firebase.firestore().collection("socials").doc().set(doc);
    setLoading(false);
    console.log("Finished social creation.");
    navigation.navigate("Main");
  };

  const saveEvent = async () => {
    setLoading(true);

    if ((name == "") || (location == "") || (description == "") || (image == "") || (date == 0)) {
      setSnackBarVisibility(true);
      setLoading(false);
      return;
    }

    try {

      asyncAwaitNetworkRequests();

    } catch (e) {
      console.log("Error while writing social:", e);
    }
  };

  const Bar = () => {
    return (
      <Appbar.Header>
        <Appbar.Action onPress={navigation.goBack} icon="close" />
        <Appbar.Content title="New Social" />
      </Appbar.Header>
    );
  };

  return (
    <>
      <Bar />
      <View style={{ ...styles.container, padding: 20 }}>
        <TextInput style={{marginVertical: 10, backgroundColor: "white"}} label="Event Name" value={name} onChangeText={name => setName(name)}/>
        <TextInput style={{marginVertical: 10, backgroundColor: "white"}} label="Event Location" value={location} onChangeText={location => setLocation(location)}/>
        <TextInput style={{marginVertical: 10, backgroundColor: "white"}} label="Event Description" value={description} onChangeText={description => setDescription(description)}/>
        <Button style={{marginVertical: 7}} mode="outlined" onPress={() => setDatePickerVisibility(true)}>{dateButtonText}</Button>
        <Button style={{marginVertical: 7}} mode="outlined" onPress={() => pickImage()}>{imageButtonText}</Button>
        <Button style={{marginVertical: 7}} mode="contained" loading={isLoading} onPress={() => saveEvent()}>SAVE EVENT</Button>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          onConfirm={handleConfirmDatePicker}
          onCancel={() => setDatePickerVisibility(false)}
        />
        <Snackbar
          visible={isSnackBarVisible}
          onDismiss={() => setSnackBarVisibility(false)}>
          Error: All fields must be filled in.
        </Snackbar>
      </View>
    </>
  );
}
