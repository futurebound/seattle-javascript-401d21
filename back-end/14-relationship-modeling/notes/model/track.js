'use strict'

const Album = require('./album')
const mongoose = require('mongoose');

const Track = mongoose.Schema({
  'speechiness': { type: Number },
  'key' : { type: Number },
  'time_signature': { type: Number },
  'liveness' : { type: Number },
  'loudness': { type: Number },
  'duration_ms' : { type: Number },
  'danceability': { type: Number },
  'duration' : { type: Number },
  'valence': { type: Number },
  'acousticness' : { type: Number },
  'spotify_id': { type: String },
  'volume_number' : { type: Number },
  'energy': { type: Number },
  'tempo' : { type: Number },
  'instrumentalness': { type: Number },
  'mode' : { type: Number },
  'number': { type: Number },
  'artist' : { type: String, required: true },
  'title': { type: String, required: true },
  'album': {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'album'},
}, {timestamps: true})

//neither of these can be arrow functions, need access to 'this' thing happening in function

//looks up album by ID, once we have album, try and add track record ID to tracks 'records' array, and first check if it already exists in there (to not allow duplicate IDs)
Track.pre('save', function (next) { //when save something, will have access to track created through 'this' binding
  Album.findById(this.album) //when create track, going to send title, artist, and albumID
    .then(album  => {
      // can also do line 36 instead of lines 38-41
      // album.tracks = [... new Set(album.tracks).add(this._id)]

      let trackIds = new Set(album.tracks); // new SET creates a non-duplicate array
      trackIds.add(this._id); // this._id is tracks ID property
      album.tracks = [...trackIds]; //spreads de-duplicated IDs, and avoids an update duplicating an ID
      album.save(); //can't actually return this, was returning promise into next
    })
    .then(next) //return of album.save() will be passed to .then() and handed off to next thing
    .catch(() => next(new Error('Validation Error. Failed to save Track.'))); //means something went wrong in scope of finding album, getting/generating id
}); 

//NEEDS TO BE DEBUGGED
//post as in AFTER
Track.post('remove', function(doc, next) { 
  Album.findById(doc.album) //doc now reference to thing we removed, will refer to ID of album
    .then(album => {
      album.tracks = album.tracks.filter(a => doc !== a); // filters out anything that doesnt match 
      return album.save();
    })
    .then(next)
    .catch(next) //can explicitly decide what error to pass back, or just let it pass raw error message that mongo generates
});

module.exports = mongoose.model('track', Track)