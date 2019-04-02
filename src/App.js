import React from 'react'
import axios from 'axios';
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

class Reg extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      username:"",
      email:"",
      password1:"",
      password2:""
    }
    this.handleChange = this.handleChange.bind(this);
    this.registerUser = this.registerUser.bind(this);
  };

  handleChange (evt) {
    this.setState({ [evt.target.name]: evt.target.value});
  }
  registerUser () {
    //http://127.0.0.1:8000/coreback/rest-auth/registration/
    axios.post('coreback/rest-auth/registration/',{ //TODO:add CORS headers
      username:this.state.username,
      email:this.state.email,
      password1:this.state.password1,
      password2:this.state.password2
    }).then((response) => {
      if("key" in response.data){
        axios.defaults.headers.common['Authorization'] = response.data.key;
        setCookie("Auth", response.data.key, 3);
        this.setState(() => ({
          isAuthenticated: true
        }))
        this.props.onLogin(true);
      }
    }).catch((error) => {
      console.log(error);
      if(error.response.status === 400){
        alert("An error occured in registration");
      }
    });
  }
  render() {
    return (
      <div>
        <h1>YOU WANNA MAKE AN ACCOUNT MAN?</h1><br/>
        username:<input type="text" name="username" onChange={this.handleChange} /><br/>
        email:<input type="text" name="email" onChange={this.handleChange} /><br/>
        password<input type="password" name="password1" onChange={this.handleChange} /><br/>
        confirm password<input type="password" name="password2" onChange={this.handleChange} /><br/>
        <button onClick={this.registerUser}>Register</button>
      </div>
      )
  }

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

class Login extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      email:"",
      password:"",
      redirectToReferrer: false,
      isAuthenticated:false
    };

    this.handleChange = this.handleChange.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }
  handleChange (evt) {
    this.setState({ [evt.target.name]: evt.target.value});
  }
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
  logout (){

    axios.post('coreback/rest-auth/logout/',
      {
        headers: { 
          "Authorization": "Bearer " + getCookie("Auth")
         }
      }
      ).then((response) => {
      // handle success
      console.log(response);
      setCookie("Auth", "", 0);
      this.setState(() => ({
        isAuthenticated: false
      }))
      this.props.onLogin(false);
    })
    .catch(function (error) {
      // handle error
      console.log(error);   
    })
    
  }
  login (){
    axios.post('coreback/rest-auth/login/',{ //TODO:add CORS headers
      email:this.state.email,
      password:this.state.password
    }).then((response) => {
      if("key" in response.data){
        axios.defaults.headers.common['Authorization'] = response.data.key;
        setCookie("Auth", response.data.key, 3);
        this.setState(() => ({
          isAuthenticated: true
        }))
        this.props.onLogin(true);
      }
    }).catch((error) => {
      if(error.response.status === 400){
        if("email" in error.response.data){
          alert("Please provide a valid email address");
        }
        else{
          alert("Unable to login with provided credentials");
        }
      }
    });

  }
  render() {

    if (this.state.isAuthenticated){
      return (<button onClick={this.logout}>Log out</button>)
    }
    
    return (
      <div>
        <p>You must log in to view the page</p>
        email:<input type="text" name="email" onChange={this.handleChange} />
        password:<input type="password" name="password" onChange={this.handleChange} />
        <button onClick={this.login}>Log in</button>
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
