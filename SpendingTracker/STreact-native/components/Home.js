import React, { Component } from 'react';
import {StyleSheet, Text, View, Button, TextInput, Image} from 'react-native';

export class Home extends Component{
    onPressButton= () =>{
        this.props.navigation.navigate('Login');
    }
    render(){
        return (
            <View>
                <View style={styles.logout}>
                    <Button color="#343C47"   onPress={
                    this.onPressButton} title="Odjavi se"/>
                 </View>
                <View style={styles.imagecontainer}>
                <Text style={{color: '#343C47', fontWeight: 'bold', fontSize:25}}>Trenutno stanje</Text>
                </View>
                <View style={styles.contentcontainer}>
                <View style={styles.costcontainer}>
                <Text style={styles.accountText}>300 KM</Text>
                </View>
                </View>  
                <View style={styles.buttonContainer}>
                <Button color="#343C47" style={styles.button}  onPress={()=>
                this.props.navigation.navigate('NewExpense')} title="Unesi trošak"/>   
                </View>  
                <View style={styles.buttonContainer}>
                <Button color="#343C47" style={styles.button}  title="Unesi prihod"/>   
                    </View>
                <View style={styles.buttonContainer}>
                <View style={styles.buttonContainer}>
                <Button color="#343C47" style={styles.button} onPress={()=>
                this.props.navigation.navigate('PregledKategorija')} title="Pregled kategorija"/>
                </View>
                <View style={styles.buttonContainer}>
                <Button color="#343C47" style={styles.button} onPress={()=>
                this.props.navigation.navigate('PregledStatistike')} title="Pregled statistike"/>
                </View>
                <View style={styles.buttonContainer}>
                <Button color="#343C47" style={styles.button} onPress={()=>
                this.props.navigation.navigate('HistorijaTroskova')} title="Historija troskova"/>
                </View>
                <Button color="#343C47" style={styles.button} onPress={()=>
                this.props.navigation.navigate('DevelopersHelp')} title="Pomoć za razvojni tim"/>
                
                </View>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    imagecontainer: {
      alignItems: 'center'
    },
    buttonContainer:{
        marginBottom:8
    },
    contentcontainer:{
     
      alignItems: 'flex-start',
      padding: 20,
      
    },
    button:{
        backgroundColor:'#343C47',
        color:'white',
        width:320,
        marginBottom:5
    },
   costcontainer:{
       width:320,
       height:200,
        alignItems: 'center',
        padding: 20,
        borderWidth: 2,
        backgroundColor:'#6FAD4A',
        borderColor:  '#343C47',
        justifyContent:'center'
      },
    container: {
      flex: 3,
      width:200,
      backgroundColor: '#F0FFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    input:{
      height:35,
      marginBottom:10,
      backgroundColor: 'transparent',
      width:300
    },
    accountText:{
        color:'white',
        fontSize: 30
    },
    logout:{
        width: 100,
        marginLeft:130
    }
  });

export default Home; 