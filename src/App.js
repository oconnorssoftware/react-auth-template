import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter
} from 'react-router-dom'
window.axios.defaults.baseURL = "http://127.0.0.1:8000/coreback/rest-auth/";

const fakeAuth = {
  isAuthenticated: false,
  authenticate(cb) {
    this.isAuthenticated = true
    setTimeout(cb, 100)
  },
  signout(cb) {
    this.isAuthenticated = false
    setTimeout(cb, 100)
  }
}

const Public = () => <h3>Public</h3>
const Protected = () => <h3>Protected</h3>

class Login extends React.Component {
  constructor () {
    super();
    this.state = {
      email:"",
      password:"",
      redirectToReferrer: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.login = this.login.bind(this);
  }
  handleChange (evt) {
    this.setState({ [evt.target.name]: evt.target.value});
  }
  login (){
    window.axios.post('login/',{ //TODO:add CORS headers
      email:this.state.email,
      password:this.state.password
    }).then((response) => {
      if("key" in response.data){
        window.axios.defaults.headers.common['Authorization'] = response.data.key;
        fakeAuth.isAuthenticated = true;
        fakeAuth.authenticate(() => {
          this.setState(() => ({
            redirectToReferrer: true
          }))
        })
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
    const { from } = this.props.location.state || { from: { pathname: '/' } }
    const { redirectToReferrer } = this.state
    if (redirectToReferrer === true) {
      return <Redirect to={from} />
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

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    fakeAuth.isAuthenticated === true
      ? <Component {...props} />
      : <Redirect to={{
          pathname: '/login',
          state: { from: props.location }
        }} />
  )} />
)

const AuthButton = withRouter(({ history }) => (
  fakeAuth.isAuthenticated ? (
    <p>
      Welcome! <button onClick={() => {
        fakeAuth.signout(() => history.push('/'))
      }}>Sign out</button>
    </p>
  ) : (
    <p>You are not logged in.</p>
  )
))

export default function AuthExample () {
  return (
    <Router>
      <div>
        <AuthButton/>
        <ul>
          <li><Link to="/public">Public Page</Link></li>
          <li><Link to="/protected">Protected Page</Link></li>
        </ul>
        <Route path="/public" component={Public}/>
        <Route path="/login" component={Login}/>
        <PrivateRoute path='/protected' component={Protected} />
      </div>
    </Router>
  )
}