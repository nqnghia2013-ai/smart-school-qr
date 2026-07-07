const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = require('./firebase-applet-config.json');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const users = [
    { email: 'admin@school.edu.vn', role: 'admin', fullName: 'Ban Giám Hiệu', username: 'admin' },
    { email: 'maiphuong@school.edu.vn', role: 'teacher', fullName: 'Cô Mai Phương', subject: 'Toán học', username: 'maiphuong' },
  ];
  for (const u of users) {
    const id = u.username === 'admin' ? 'admin1' : 'teacher1';
    await setDoc(doc(db, 'users', id), u, { merge: true });
    console.log(`Added ${u.fullName}`);
  }
  process.exit(0);
}
run();
