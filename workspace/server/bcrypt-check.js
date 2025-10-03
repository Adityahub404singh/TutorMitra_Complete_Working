import bcrypt from "bcrypt";

const dbHash = "$2b$12$01nsYldcF0MVgWkxQ8bEc.GzndTzqQDmkp/cOsJ.7IPbxwF5l2Ngm";
const plain = "Test@12345";

bcrypt.compare(plain, dbHash, function(err, result) {
  console.log("Command line compare result (should be true):", result);
});

