import bcrypt from "bcrypt";

const plain = "Test@12345";

bcrypt.hash(plain, 12, function(err, hash) {
  if (err) return console.error(err);
  console.log("Generated hash:", hash);

  bcrypt.compare(plain, hash, function(err, result) {
    if (err) return console.error(err);
    console.log("Test compare result:", result);  // Should print true
  });
});
