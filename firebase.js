import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getDatabase, ref, runTransaction } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD4agXlMHKV40BLL-BecUqCADi-q9ekxb4",
  authDomain: "jsonprettier.firebaseapp.com",
  databaseURL:
    "https://jsonprettier-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "jsonprettier",
  storageBucket: "jsonprettier.firebasestorage.app",
  messagingSenderId: "960262979381",
  appId: "1:960262979381:web:4e76fe721190716687967c",
  measurementId: "G-F8X84Y931X",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

isSupported()
  .then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  })
  .catch(() => {});

export function recordSiteHit() {
  const hitRef = ref(database, "hit");

  return runTransaction(hitRef, (currentValue) => {
    if (typeof currentValue !== "number") {
      return 1;
    }

    return currentValue + 1;
  });
}
