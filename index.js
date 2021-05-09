require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');
const app = express();

morgan.token('body', (req) => JSON.stringify(req.body));

app.use(express.static('build'));
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
app.use(cors());

app.get('/info', async (request, response) => {
  const count = await Person.countDocuments();
  response.send(`<h3>Phonebook has info for ${count} people</h3>` +
    `<h3>${new Date()}</h3>`);
});

app.get('/api/persons', async (request, response) => {
  const persons = await Person.find({});
  response.json(persons);
});

app.get('/api/persons/:id', async (request, response, next) => {
  try {
    const person = await Person.findById(request.params.id);

    if (person) {
      response.json(person);
    } else {
      response.status(404).end();
    }
  } catch (error) {
    next(error);
  }
});

app.delete('/api/persons/:id', async (request, response, next) => {
  try {
    await Person.findByIdAndRemove(request.params.id);

    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.post('/api/persons', async (request, response, next) => {
  const body = request.body;

  try {
    const person = new Person({
      name: body.name,
      number: body.number
    });

    const newPerson = await person.save();

    response.json(newPerson);
  } catch (error) {
    next(error);
  }
});

app.put('/api/persons/:id', async (request, response, next) => {
  const body = request.body;

  const person = {
    number: body.number
  };

  try {
    const updatedPerson = await Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true });

    response.json(updatedPerson);
  } catch (error) {
    next(error);
  }
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

// handler of requests with unknown endpoint
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

// this has to be the last loaded middleware.
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
