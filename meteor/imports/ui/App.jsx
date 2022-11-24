import React, { useState } from 'react';
import { ReactP5Wrapper } from "react-p5-wrapper";
import { Ascii } from '../api/ascii.js';
import sketch from './p5/sketch.js';
import { useTracker } from 'meteor/react-meteor-data';

export const App = () => {

  // Meteor.call('send_data', "FF0000|00FF00|0000FF|",  function(err, response) {
  //   console.log("err: " +err + " response: " + response);
  // });

  const { ascii, isLoading } = useTracker(() => {
    const noDataAvailable = { ascii: {text: ''} };
    const handler = Meteor.subscribe('ascii');
    if (!handler.ready()) {
      return { ...noDataAvailable, isLoading: true };
    }
    const ascii = Ascii.find({}, { sort: { updatedAt: -1 } }).fetch()[0]; 
    return { ascii };
  });


   // this happens when we click the render display button
  const renderDisplay = (pixels) => {
    Meteor.call('serial.write', pixels);
  }

  return (
    <div className="container">
    
      <h1>LED control</h1>
      {/*pass the p5 sktech file into the React wrapper
      also pass the ascii prop which will updated based on withTracker above*/}
      <ReactP5Wrapper sketch={sketch} renderDisplay={renderDisplay}  />
    </div>
  );
}

