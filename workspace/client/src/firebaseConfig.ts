import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Use values from your screenshots explicitly
const firebaseConfig = {
  apiKey: "AlzaSyBA2lEOG0uWgIKlJ6JFssZxk6UgSygtwO4",
  authDomain: "tutormitra-520fa.firebaseapp.com",
  databaseURL: "https://tutormitra-520fa-default-rtdb.firebaseio.com",
  projectId: "tutormitra-520fa",
  storageBucket: "tutormitra-520fa.appspot.com",
  messagingSenderId: "571416031913",
  appId: "1:571416031913:android:3499084d3fd9248b426fb8", // <-- From Screenshot-28.jpg
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
