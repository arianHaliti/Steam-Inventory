const mongoose = require("mongoose");

mongoose
  .connect(
    process.env.MONGODB_URI,
    { useNewUrlParser: true }
  )
  .then(
    () => {
      console.log(`Connected to the database -> ${process.env.MONGODB_URI}`);
    },
    err => console.log(err)
  );
