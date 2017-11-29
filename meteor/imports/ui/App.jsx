import React, { Component } from 'react';
import PropTypes from 'prop-types';
import P5Wrapper from 'react-p5-wrapper';
import sketch from './p5/sketch-basic.js';
import { withTracker } from 'meteor/react-meteor-data';
import { Led } from '../api/led.js';


class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      led: [],
    };
 
  }


  // this happens when we click the render display button
  sendName(name) {
    console.log('App.jsx received name', name);
    Meteor.call('send.name', name);
  }

  // this happens when we click the render display button
  renderDisplay(pixels) {
    Meteor.call('serial.write', pixels);
  }

  // render the html to the page
  render() {

    return (
      <div className="container">
        {/*pass the p5 sktech file into the React wrapper
        also pass the ascii prop which will updated based on withTracker below*/}
        <P5Wrapper sketch={sketch} sendName={this.sendName} renderDisplay={this.renderDisplay} led={this.props.led} />
      </div>
    );
  }
}

App.defaultProps = {
  led: [],
};

App.propTypes = {
  led: PropTypes.array.isRequired,
};

export default withTracker(props => {
  Meteor.subscribe('led');
  return {
    led: Led.find({}, { sort: { updatedAt: -1 } }).fetch()[0],
  };
})(App);