const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = require('./firebase-applet-config.json');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const querySnapshot = await getDocs(collection(db, "users"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (typeof data.fullName !== 'string' && data.fullName !== undefined) {
      console.log('Bad fullName:', doc.id, data.fullName);
    }
    if (typeof data.email !== 'string' && data.email !== undefined) {
      console.log('Bad email:', doc.id, data.email);
    }
    if (typeof data.username !== 'string' && data.username !== undefined) {
      console.log('Bad username:', doc.id, data.username);
    }
  });
  console.log("Done checking types");
  process.exit(0);
}
run();
