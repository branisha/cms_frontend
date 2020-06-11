import React from 'react';
import logo from './logo.svg';
import './App.css';
import Filer from './filer';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = { apiResponse: "" };
  }

  callAPI() {
    fetch("http://localhost:9000/testAPI/files")
      .then(res => res.json())
      .then(res => this.setState({ apiResponse: res }, () => console.log("api finished")));
  }

  updateFolder(data) {
    this.setState({ apiResponse: data });
  }

  componentDidMount() {
    this.callAPI();
  }

  reloadData() {
    this.callAPI();
  }

  changeFolder(obj) {

    fetch('http://localhost:9000/testAPI/files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(obj),
    }).then(res => res.json())

      .then(res => this.setState({ apiResponse: res }));
  }

  render() {

    return (
      <div className="App">
        <Filer changeFolder={this.changeFolder.bind(this)} updateFolder={this.updateFolder.bind(this)} files={Array.from(this.state.apiResponse)} reloadData={this.reloadData.bind(this)}></Filer>
      </div>
    );
  }
}



export default App;
