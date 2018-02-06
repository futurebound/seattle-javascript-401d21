'use strict';

//going to require this into routes

module.exports = function (err, res) { //error happened elsewhere, parse out error, handle response, and kick it back
  let msg = err.message.toLowerCase(); //force any error message to lowercase so can validate that string


  //rather than parsing out msg which we define elsewhere, could just take status code and attach it as new property to error objct as opposed to having to create new swtich statement cases for each error type below
  switch (true) { //setting to true so it will run every time
  //generates response up one layer in REQ/RES cycle
  case msg.includes('validation error'): return res.status(400).send(`${err.name}: ${err.message}`);
  case msg.includes('authorization'): return res.status(401).send(`${err.name}: ${err.message}`); //401 not authorized
  case msg.includes('path error'): return res.status(404).send(`${err.name}: ${err.message}`);
    // case msg.includes('enoent'): return res.status(404).send(`${err.name}: ${err.message}`);
    // case msg.includes('cast'): return res.status(400).send(`${err.name}: ${err.message}`);

    //says 'that ID DNE, can't return you that thing'
  case msg.includes('objectid failed'): return res.status(404).send(`${err.name}: ${err.message}`);
    //says we already have the unique value in a record, means only one record in the entire database can have the value of that key IN THE SCHEMA, WILL BE SET AS UNIQUE JUST LIKE THE REQUIRED
  case msg.includes('duplicate key'): return res.status(409).send(`${err.name}: ${err.message}`);

  default: return res.status(500).send(`${err.name}: ${err.message}`); //means that something happened bad on server other than not found or bad request, hardware/software issue could not control such as a server/website being offline that was being used outside of the application
  }
};