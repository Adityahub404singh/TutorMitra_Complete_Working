import React, { useEffect, useState } from "react";
import { database } from "../firebaseConfig";
import { ref, set, onValue } from "firebase/database";

export default function FirebaseTest() {
  const [dbValue, setDbValue] = useState<string>("");

  useEffect(() => {
    const testRef = ref(database, "test/message");

    // Write a test message to the database
    set(testRef, "Hello Firebase!").catch(console.error);

    // Listen for changes at this ref
    const unsubscribe = onValue(testRef, (snapshot) => {
      const val = snapshot.val();
      setDbValue(val);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6 bg-gray-100 rounded shadow max-w-md mx-auto mt-10 text-center">
      <h2 className="text-xl font-bold mb-4">Firebase Realtime Database Test</h2>
      <p className="text-lg">Current value at "test/message":</p>
      <p className="mt-2 p-4 bg-white rounded border text-indigo-700">{dbValue || "No data"}</p>
    </div>
  );
}
