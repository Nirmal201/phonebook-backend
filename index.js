require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const Person = require("./models/people");

// app.use(express.static("build"));
app.use(express.json());
app.use(cors());

morgan.token("justBaoddy", function (req, res) {
  return JSON.stringify(req.body);
});

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :justBaoddy"
  )
);

// let persons = [
//   { name: "Nirmal Patel", number: "909-112-3134", id: 1 },
//   { name: "Dan Abramov", number: "892-121231", id: 2 },
//   { name: "Ryan Folrence", number: "912-341-1231", id: 3 },
//   { name: "Joshua", number: "123-141-5131", id: 4 },
//   { name: "Lil Wayne", number: "413-313-4134", id: 5 },
// ];

app.get("/", (req, res) => {
  res.send("<h1>PhoneBook</h1>");
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.get("/info", (req, res) => {
  let time = new Date();

  Person.countDocuments({}).then((count) => {
    res.send(
      ` <div><p>Phonebook has info for ${count} people.
      <p> ${time}</div>`
    );
  });
});

// GET :id
app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person.toJSON());
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

//DELETE
// app.delete("/api/persons/:id", (req, res, next) => {
//   console.log("I am alive");
//   Person.findByIdAndRemove(req.params.id)
//     .then((result) => {
//       console.log("intelligecee");
//       Person.find({}).then((persons) => {
//         console.log("$log:Person.find({})", persons);
//       });
//       return res.status(204).end();
//     })
//     .catch((error) => {
//       console.log("getting printed from catch block..");
//       next(error);
//     });
// });

app.delete("/api/persons/:id", async (req, res, next) => {
  const exists = await Person.find({}).then((persons) =>
    persons.map((p) => p.id).includes(req.params.id)
  );
  console.log(
    "$$$$The person is",
    exists ? "in database." : "not in database."
  );
  if (!exists) {
    return res.status(400).end();
  }

  Person.findByIdAndRemove(req.params.id).then((result) => {
    return res.status(204).end();
  });
});

//POST
app.post("/api/persons", (req, res, next) => {
  const body = req.body;
  if (body.name === "" && body.number === "") {
    return res.status(400).json({
      error: "name or phone number is missing",
    });
  }
  if (!body.name) {
    return res.status(400).json({
      error: "content missing",
    });
  }
  const person = new Person({
    name: body.name,
    number: body.number,
    // number: Math.floor(Math.random() * 1000000000),
  });
  person
    .save()
    .then((savedPerson) => {
      res.json(savedPerson.toJSON());
    })
    .catch((error) => {
      console.log(error.message);
      res.send(error.message);
      // res.send(`<h1>${error.res.data}</h1>`);

      // return next(error);
    });
});

app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body;

  const person = {
    name: body.name,
    number: body.number,
  };
  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then((updatedNumber) => {
      console.log(updatedNumber);

      res.json(updatedNumber.toJSON());
    })
    .catch((error) => next(error));
});

// const requestLogger = (req, res, next) => {
//   console.log("Method", req.method);
//   console.log("path", req.path);
//   console.log("body", req.body);
//   next();
// };
// app.use(requestLogger);

const unknownEndpoint = (request, response) => {
  response
    .status(404)
    .send({ error: "unknown endpoint- you have come to wrong point" });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  console.log(error.message);

  if (error.name === "CastError" && error.kind == "ObjectId") {
    return res.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }
  next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}.....`);
});
