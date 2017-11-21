import { Mongo } from 'meteor/mongo';
export const Led = new Mongo.Collection('led');
import { check } from 'meteor/check';


if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('led', function ledPublication() {
    return Led.find({});
  });
}

// http://docs.meteor.com/api/collections.html#Mongo-Collection-upsert
Meteor.methods({
  'led.insert'(pixels) {
    
  }
})