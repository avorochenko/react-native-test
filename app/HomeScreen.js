import React, { Component } from 'react';

import  {DrawerNavigator}  from 'react-navigation';

import { Button, Text, View, TouchableHighlight, Image, ListView,
    ActivityIndicator, TextInput, RefreshControl, AsyncStorage, Alert } from 'react-native';

/*import Button from 'react-native-button';*/
import Like from './components/like.custom';


import { getMedia } from './InstagramPictureApi';
import { fetchLikes, onLike } from './services/likeService';

import CustomText from './components/like.custom';

import MenuScreen from './MenuScreen';

import styles from '../styles/Styles';

/*import * as firebase from 'firebase';

firebase.initializeApp({
    apiKey: "yourkeyhere",
    authDomain: "projName-d0c3e.firebaseapp.com",
    databaseURL: "https://projName-d0c3e.firebaseio.com",
    storageBucket: "projName-d0c3e.appspot.com"
});*/

/*var Firebase = require('firebase');*/

export default class HomeScreen extends React.Component {
    static navigationOptions = {
        //drawerLabel: 'Home',
        title: `Home`
    };
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            isOpen: false,
            selectedItem: 'About',
            refreshing: false,
            likes:{},
            dataSource: this.getDs([])
        }
    }

    toggleLikes = (photoId, countLikes)=>{
        let likes = this.state.likes;
        likes[photoId] = countLikes;
        this.setState({
            likes: likes
        });
    }

    _onRefresh = (tagName)=> {
        this.setState({refreshing: true});
        this.fetchImages(tagName).then(() => {
            this.setState({refreshing: false});
        });
    }

    getDs(data){
        let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        return ds.cloneWithRows(data);
    }

    componentDidMount() {
        this.fetchImages().then((response)=> {
            this.setState({
                isLoading: false,
                dataSource: this.getDs(response)
            });

            fetchLikes().then((likes)=>{
                    this.setState({
                        likes: likes
                    });
                });
        });
    }

    fetchImages = (tagName) => {
        return getMedia(tagName);
    }

    render() {
        if (this.state.isLoading) {
            return (
                <View style={{flex: 1, paddingTop: 20}}>
                    <ActivityIndicator />
                </View>
            );
        }
        const { navigate } = this.props.navigation;
        return (
            <View style={{ paddingTop: 20}}>

                <View style={styles.searchSection}>
                    <TouchableHighlight
                        onPress={() => navigate('Menu')}>
                        <Image
                            source={{uri:'https://cdn3.iconfinder.com/data/icons/32-fufficon/32/32x32_fluffy-03-512.png'}}
                            style={styles.icon}
                        />
                    </TouchableHighlight>

                    <TextInput
                        style={styles.input}
                        placeholder="Enter tag name..."
                        onChangeText={(text) => this.setState({text})}
                        onSubmitEditing={(text) => this._onRefresh(this.state.text || null)}
                    />
                    <Button
                        style={styles.button}
                        onPress={() => this._onRefresh(this.state.text || null)}
                        title="Search"
                    />


                </View>
                <ListView
                    dataSource = {this.state.dataSource}
                    enableEmptySections={true}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={() => this._onRefresh.bind(this)}
                        />
                    }
                    renderRow={(rowData) =>
                        <View>
                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center',}}>
                                <TouchableHighlight
                                    onPress={() => navigate('PhotoDetails', {
                                        id: rowData.caption.id,
                                        tag: rowData.caption.text,
                                        url: rowData.images.standard_resolution.url,
                                        likes: this.state.likes[rowData.caption.id] || 0
                                    })}>
                                    <Image
                                        source={{uri:rowData.images.standard_resolution.url}}
                                        style={{width: 320, height: 320}}/>
                                </TouchableHighlight>
                                    <Like
                                        onPress={()=> {onLike(rowData.caption.id).then((newLikes)=>{
                                            this.toggleLikes(rowData.caption.id, newLikes);
                                        })}}
                                       likes={this.state.likes[rowData.caption.id] + '' || '0'}
                                    />
                            </View>
                            <Text>{rowData.caption.id}</Text>
                            <Text>{rowData.caption.text}</Text>
                        </View>
                    }
                />
            </View>
        );
    }
}