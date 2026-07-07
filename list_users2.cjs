const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = require('./firebase-applet-config.json');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const querySnapshot = await getDocs(collection(db, "users"));
  if (querySnapshot.empty) {
     console.log("Database is empty");
  } else {
     querySnapshot.forEach((doc) => {
       console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
     });
  }
  process.exit(0);
}
run();
