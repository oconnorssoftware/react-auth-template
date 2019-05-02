import React from 'react'
import axios from 'axios';
import Reg from './Reg';
import Login from './Login';
axios.defaults.baseURL = "http://127.0.0.1:8000/";//URL to django back end

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

class Profile extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      username:""
    }
  };
  componentDidMount (){
    let config = {
      headers: {
        "Authorization": "Token "+getCookie("Auth")
      }
    }
    axios.get('coreback/profile/',config
      ).then((response) => {
      // handle success
      console.log(response);
      this.setState(() => ({
          username: response.data.fname
      }))
    })
    .catch((error) => {
      // handle error
      console.log(error);
      this.setState(() => ({
          isAuthenticated: false
      }))  
    })
  }    
  render() {
    return (<h1>Hello:{this.state.username}</h1>)
  }

}

class App extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      isAuthenticated:false
    }
  };
  onLogin = (val) => {
    this.setState({
      isAuthenticated: val
    })
  };
  componentDidMount (){
    let config = {
      headers: {
        "Authorization": "Token "+getCookie("Auth")
      }
    }
    axios.get('coreback/test_auth/',config
      ).then((response) => {
      // handle success
      console.log(response);
      this.setState(() => ({
          isAuthenticated: true
      }))
    })
    .catch((error) => {
      // handle error
      console.log(error);
      this.setState(() => ({
          isAuthenticated: false
      }))  
    })
  }
  render() {

    if (this.state.isAuthenticated){
      return (<div>
                <Login onLogin={this.onLogin} />
                <h1>WELCOME TO YO HOMESCREEN BRO</h1><br/>
                <Profile />
              </div>)
    }
    
    return (
      <div>
        <Login onLogin={this.onLogin} />
        <Reg onLogin={this.onLogin} />
      </div>
    )
  }
}


export default function AuthExample () {
  return (
    <div>
      <App />
    </div>
  )
}
