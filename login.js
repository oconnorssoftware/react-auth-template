

// const e = React.createElement;

class Login extends React.Component{

  constructor () {
    super();
    this.state = {
      email: '',
      password: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  handleChange (evt) {
    this.setState({ [evt.target.name]: evt.target.value });
  }
  
  handleSubmit(event) {
    event.preventDefault();
    alert('submitted: ' + this.state);
    this.setState({
      invalid: false,
    });
  }

  render () {
    return (
      <form onSubmit={this.handleSubmit}>
      
        <label>Email</label>
        <input type="text" name="email" onChange={this.handleChange} />
        <br/>
        <label>Password</label>
        <input type="password" name="password" onChange={this.handleChange} />
        <br/>
        <input type="submit" value="Submit" />

      </form>
    );
  }
}

ReactDOM.render(
  <Login />,
  document.getElementById('root')
);