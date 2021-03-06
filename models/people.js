const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
const url = process.env.MONGODB_URI;

console.log("connecting to ", url);

mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB: ", error.message);
  });

const newPerson = new mongoose.Schema({
  name: { type: String, minlength: 3, required: true, unique: true },
  number: { type: Number, min: 9, required: true },
});

newPerson.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});
newPerson.plugin(uniqueValidator);
module.exports = mongoose.model("Person", newPerson);
