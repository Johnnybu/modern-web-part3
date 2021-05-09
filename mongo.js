const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>');
  process.exit(1);
}

const password = process.argv[2];

const url =
  `mongodb://app:${encodeURIComponent(password)}@localhost:27017/phonebook?retryWrites=true&ssl=false`;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });

const personSchema = new mongoose.Schema({
  name: String,
  number: String
});

const Person = mongoose.model('Person', personSchema);

if (process.argv.length === 5) {
  const name = process.argv[3];

  const number = process.argv[4];

  const person = new Person({ 
    name: name, 
    number: number
  });

  person.save().then(result => {
    console.log('person saved!');
    mongoose.connection.close();
  });
} else {
  Person.find({}).then(persons => {
    console.log('phonebook:');
    persons.forEach(person => {
      console.log(`${person.name} ${person.number}`);
    })
    mongoose.connection.close()
  });
}