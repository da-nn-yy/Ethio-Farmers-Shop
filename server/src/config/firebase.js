import admin from 'firebase-admin';
import 'dotenv/config';

// Initialize Firebase Admin SDK based on available credentials
const hasProject = Boolean(process.env.FIREBASE_PROJECT_ID);
const hasServiceAccount = Boolean(process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);

if (hasProject && admin.apps.length === 0) {
  if (hasServiceAccount) {
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey
      })
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  }
}

export default admin;
