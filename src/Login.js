import React from 'react'
import axios from 'axios';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
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
        <form>
          email:<Input type="text" name="email" onChange={this.handleChange} />
          password:<Input type="password" name="password" onChange={this.handleChange} />
          <Button variant="contained" color="primary" onClick={this.login}>Log in</Button>
        </form>
      </div>
    )
  }
}

export default Login;