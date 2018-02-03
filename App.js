import React from 'react';
import { StyleSheet, Text, View, AppRegistry, Button, TextInput, ToastAndroid, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { StackNavigator } from 'react-navigation';
import { Observable } from 'rxjs/Observable';
import Rx from 'rxjs/Rx';

const PATH = 'http://172.30.50.74:7001';


class HomeScreen extends React.Component {

  constructor(props) {
	    super(props);
	    this.state = {
	      q: '',
	    };
	    this.subject = new Rx.Subject();	    
  }
  
  componentDidMount(){
	    this.subscription = this.subject
	      .debounceTime(300)
	      .switchMap((q) => {
	    	  return Rx.Observable.fromPromise(this.createRequest(q));
	      })
	      .subscribe(result => this.showItems(result));
	    this.search('');
  }
  
  static navigationOptions = {
    title: 'لیست اقلام '
  };
  
  
  showItems(items){
	  this.items = items;
	  this.forceUpdate()
  }
  
  search(q){
	  this.setState({q});
	  this.subject.next(q);
  }
  
	createRequest(q) {
		  return request = fetch(PATH+'/oa/rest/mobile/letter/item?q='+encodeURIComponent(q),	{
			  method: 'GET',
		  })
		    .then((response) => response.json())
		    .catch((error) => {
		      console.error(error);
		    });
		}
	
	_keyExtractor = (item, index) => item.name;
	  _renderItem = ({item}) => (
			  <MyListItem
			      id={item.name}
			      onPressItem={this._onPressItem}
			      title={item.name}
			  	  count={item.age}
			  	  selected={item.name}
			    />
			    
			  );
			  	  
	  _renderSeparator = () => (
			    <View
			    style={styles.separator}
			    />
			  );
	
	  
  render() {
	const {navigate} = this.props.navigation;
    return <View style={{flex:1}}>
	    <View style={{flex:0.2}}>
		    <TextInput
			    style={{height: 40, borderColor: 'gray', borderWidth: 1, backgroundColor: 'white', paddingLeft: 10, paddingRight: 10}}
			    onChangeText={(q)=>this.search(q)} 
		    	placeholder="جستجو"
			    value={this.state.age}/>
		    <Button
		      onPress={() => navigate('Item')}
		      title="ایجاد قلم جدید"/>
	    </View>
    
	    <ScrollView style={{flex:0.8}}>
		    <FlatList
				data={this.items}
				ItemSeparatorComponent={this._renderSeparator}
				keyExtractor={this._keyExtractor}
				renderItem={this._renderItem}
				/>
	    </ScrollView>
	   </View>;
  }
  
  _onPressItem = (id: string) => {
		ToastAndroid.show(id, ToastAndroid.SHORT);
  };

}

const styles = StyleSheet.create({
	  container: {
		    flex: 1,
		    backgroundColor: '#fff',
		    alignItems: 'center',
		    justifyContent: 'center',
	    paddingTop: 20,
	  },
	  item:{
		  padding: 5,
		  textAlign: 'center'
	  },
	  header:{
		  backgroundColor: 'rgba(119,136,153, 0.8)',	
		  fontWeight: 'bold',
		  padding: 5
	  },
	  separator:{
		    borderBottomColor: 'rgba(220, 220, 220, .8)',
		    borderBottomWidth: 1,
	  }
	});


class MyListItem extends React.PureComponent {
	  _onPress = () => {
	    this.props.onPressItem(this.props.id);
	  };
	  render() {
	    return (
	      <TouchableOpacity onPress={this._onPress}>
	      <View style={{flex: 1, flexDirection: 'row', padding: 5, height: 30}}>
		      <View style={{flex: 0.15}}>
		        <Text>{this.props.count}</Text>
		      </View>
		      <View style={{flex: 0.85}}>
		        <Text numberOfLines={1} ellipsizeMode='head' style={{textAlign: 'right'}}>{this.props.title}</Text>
		      </View>
	    </View>
	      </TouchableOpacity>
	    );
	  }
}


class ItemScreen extends React.Component {

  constructor(props) {
	    super(props);
	    this.state = { name: '', age: '' };
  }
	static navigationOptions = {
    title: 'ایجاد یا ویرایش قلم',
  };

	onSave(){
		fetch(PATH+'/oa/rest/mobile/letter/item', {
			credentials: 'include',
			method: 'POST',
			  headers: {"Content-Type": "application/json"},
			  body: JSON.stringify({name:this.state.name, age: this.state.age})
			}).then(function (response) {
				ToastAndroid.show('ذخیره شد', ToastAndroid.SHORT);
			}.bind(this))
	    	  .catch(function (error) {
					ToastAndroid.show('خطا در ذخیره', ToastAndroid.SHORT);
					console.error(error);
	    	  });
	}	
	
  render() {
    return (
    <View>
	    <View style={{padding: 10}}>
	        <Text>نام</Text>
	        <TextInput
		        style={{height: 40, borderColor: 'gray', borderWidth: 1, backgroundColor: 'white'}}
		        onChangeText={(name) => this.setState({name})}
		        value={this.state.name}
		      />
	      </View>
	        
	      <View style={{padding: 10}}>
	        <Text>تعداد</Text>
	        <TextInput
		        style={{height: 40, borderColor: 'gray', borderWidth: 1, backgroundColor: 'white'}}
		        onChangeText={(age) => this.setState({age})}
		        value={this.state.age}
		      />
	      </View> 
	        
	      <View style={{paddingTop: 40, paddingLeft: 40, paddingRight: 40}}>
		      <Button
		      onPress={this.onSave.bind(this)}
		      title="ذخیره"
		      color="#841584"
		      accessibilityLabel="Learn more about this purple button"
		      
		    />
	      </View>
      </View>
    );
  }
}

const SimpleApp = StackNavigator({
	  Home: { screen: HomeScreen },
	  Item: { screen: ItemScreen },
});

export default class App extends React.Component {
  render() {
    return <SimpleApp />;
  }
}

