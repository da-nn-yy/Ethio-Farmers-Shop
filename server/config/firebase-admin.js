const admin  = require('firebase-admin');
// const serviceAccount = require('../../firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(),
});

module.exports = admin;
