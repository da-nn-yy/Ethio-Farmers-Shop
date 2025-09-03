import admin from 'firebase-admin';

// Initialize Firebase Admin SDK if Firebase is configured via env vars
// Falls back to application default credentials when service account is not provided
// In development, when FIREBASE_PROJECT_ID is not set, auth middleware will bypass auth

const hasProject = Boolean(process.env.FIREBASE_PROJECT_ID);
const hasServiceAccount = Boolean(process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);

if (hasProject) {
  if (admin.apps.length === 0) {
    if (hasServiceAccount) {
      // Note: private key may contain escaped newlines in env; replace them
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
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
}

export default admin;
