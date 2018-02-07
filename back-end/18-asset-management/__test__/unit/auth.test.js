// 'use strict';

// const Auth = require('../../model/auth');
// // const debugger = require('debug')('auth.test');
// require('jest');

// describe('#auth.test.js', function () {
//   describe('testing new Auth instances', function () {

//     it('should return a promise object instance', () => {
//       return new Auth('reginald', 'lemonberry', 'regi@gmail.com')
//         .then(auth => { //will pass just auth object back
//           expect(auth).toBeInstanceOf(Object);
//         });
//     });

//     it('should have _id, name, and city properties', () => {
//       return new Auth('reginald', 'lemonberry', 'regi@gmail.com')
//         .then(auth => { //will pass just auth object back
//           expect(auth).toHaveProperty('username');
//           expect(auth).toHaveProperty('password');
//           expect(auth).toHaveProperty('email');
//         });
//     });

//     it('should have property values _id of long ass number string, name of reginald, and city of lemonberry', () => {
//       return new Auth('reginald', 'lemonberry', 'regi@gmail.com')
//         .then(auth => { //will pass just auth object back
//           expect(auth.username).toEqual('reginald');
//           expect(auth.name).toEqual('lemonberry');
//           expect(auth.city).toEqual('regi@gmail.com');
//         });
//     });

//     it('should reject an Error if missing an argument', () => {
//       return new Auth('reginald')
//         .catch(err => {
//           expect(err).not.toBeNull();
//         });
//     });
//   });
// });