import React, { useState, useEffect } from "react";
import { View, FlatList } from "react-native";
import { Appbar, Card, Title, Paragraph } from "react-native-paper";
import firebase from "firebase/app";
import "firebase/firestore";
import { SocialModel } from "../../../../models/social.js";
import { styles } from "./FeedScreen.styles";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../MainStackScreen.js";

/* HOW TYPESCRIPT WORKS WITH PROPS:

  Remember the navigation-related props from Project 2? They were called `route` and `navigation`,
  and they were passed into our screen components by React Navigation automatically.  We accessed parameters 
  passed to screens through `route.params` , and navigated to screens using `navigation.navigate(...)` and 
  `navigation.goBack()`. In this project, we explicitly define the types of these props at the top of 
  each screen component.

  Now, whenever we type `navigation.`, our code editor will know exactly what we can do with that object, 
  and it'll suggest `.goBack()` as an option. It'll also tell us when we're trying to do something 
  that isn't supported by React Navigation! */

interface Props {
  navigation: StackNavigationProp<MainStackParamList, "FeedScreen">;
}

export default function FeedScreen({ navigation }: Props) {

  const [socials, setSocials] = useState<SocialModel[]>([]);

  useEffect( () => {
    var unsubscribe = firebase.firestore()
    .collection('socials')
    .orderBy('eventDate')
    .onSnapshot((querySnapshot) => {
      var newSocials: SocialModel[] = [];
        querySnapshot.forEach((doc) => {
          let social = { 'eventDate': doc.data()['eventDate'], 
            'eventDescription': doc.data()['eventDescription'],
            'eventImage': doc.data()['eventImage'],
            'eventLocation': doc.data()['eventLocation'],
            'eventName': doc.data()['eventName']
          };
          newSocials.push(social);
        });
        setSocials(newSocials);
        console.log(socials.length)
    });
    return () => unsubscribe();
  }
    , []
  );

  const renderItem = ({ item }: { item: SocialModel }) => {

    var dateString = new Date(item.eventDate).toLocaleString()

    return (
      <Card onPress={() => navigation.navigate("DetailScreen", {social:item})}>
        <Card.Cover source={{ uri: item.eventImage }} />
        <Card.Content>
          <Title>{item.eventName}</Title>
          <Paragraph>{item.eventLocation} {dateString}</Paragraph>
        </Card.Content>
        <Card.Actions>
        </Card.Actions>
      </Card>
    );
  };

  const NavigationBar = () => {
    return (
    <Appbar.Header>
      <Appbar.Content title="Socials" />
      <Appbar.Action icon='plus' onPress={() => navigation.navigate("NewSocialScreen")} />
    </Appbar.Header>
    );
  };

  return (
    <>
      <NavigationBar />
      <View style={styles.container}>
      <FlatList
        data={socials}
        renderItem={renderItem}
        //keyExtractor={(item) => item.id}
      />
      </View>
    </>
  );
}
