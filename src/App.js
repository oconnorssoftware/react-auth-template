import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter
} from 'react-router-dom'
import PropTypes from "prop-types";
import axios from 'axios';
axios.defaults.baseURL = "http://127.0.0.1:8000/";

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

//refactor below the following
//make it so that on initilization it does backend call to see if the key is valid


const Public = () => <h3>Public</h3>
const Protected = () => <h3>Protected</h3>

class Login extends React.Component {
  // static contextTypes = {
  //   router: PropTypes.object
  // }
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
    console.log("compdidMMM");
    console.log(getCookie("Auth"));
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
    .catch(function (error) {
      // handle error
      console.log(error);
      this.setState(() => ({
          isAuthenticated: true
      }))  
    })
  }
  logout (){
    // withRouter(({ history }) => history.push('http://www.facebook.com'));
    // let config = {
    //   headers: {
    //     "Authorization": "Token "+getCookie("Auth")
    //   }
    // }
    axios.post('coreback/rest-auth/logout/',
      {
        "Authorization": "Token "+getCookie("Auth")
      }
      ).then((response) => {
      // handle success
      console.log(response);
      this.setState(() => ({
        isAuthenticated: false
      }))
      // this.context.router.history.push("/");
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
        document.cookie = "Auth=" + response.data.key;
        this.setState(() => ({
          isAuthenticated: true
        }))

        console.log("HHHHHHHHHHHHH");
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
        <input type="text" name="email" onChange={this.handleChange} />
        <input type="password" name="password" onChange={this.handleChange} />
        <button onClick={this.login}>Log in</button>
      </div>
    )
  }
}


export default function AuthExample () {
  return (
    <div>
      <Login />
      <div>
      <Router>
        <div>
          <ul>
            <li><Link to="/public">Public Page</Link></li>
            <li><Link to="/protected">Protected Page</Link></li>
          </ul>
          <Route path="/public" component={Public}/>
        </div>
      </Router>
      </div>
    </div>
  )
}
