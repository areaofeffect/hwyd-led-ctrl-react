import { Mongo } from 'meteor/mongo';
export const Coders = new Mongo.Collection('coders');
import { check } from 'meteor/check';


if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('coders', function codersPublication() {
    return Coders.find({});
  });
}

// http://docs.meteor.com/api/collections.html#Mongo-Collection-upsert
Meteor.methods({
  'coders.upsert'(name) {

    Coders.upsert({
      name: name
    },
    {
      $set: {
        name: name,
        updatedAt: new Date(),
      }
    });
  }
})