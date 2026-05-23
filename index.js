require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')
const app = express()

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if ( error.name === 'CastError' ) {
    return response.status(400).send({ error: 'malformatted id' })
  } 
  else if ( error.name == 'ValidationError' || error.number == 'ValidationError' ) {
    return response.status(400).json({ error: error.message })
  }  

  next(error)
}


morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})

// middlewares
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static('dist'))

/*const counter = () => {
    return Person.length
  }*/

/*const generateId = () => {
  const id = Math.floor(Math.random() * 1000000)
  return id
}*/

/*let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendick", 
      "number": "39-23-6423122"
    }
]*/

/*app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>')
})*/

// get all persons 
app.get('/api/persons', (request, response) => {
  Person.find({}).then(result => {
    response.json(result)
  })
})

//get info about the phonebook
app.get('/info', (request, response) => {
  response.send(`<p>Phonebook has info for ${Person.length} people</p>
  <p>${new Date()}</p>`)
})

// get person detail by id 
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).json({ error: 'Person not found' })
    }
  })
  .catch(error => next(error))
})  

// delete person from database
app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndDelete(request.params.id)
   .then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
})

// create a new person contacts
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number,
    //id: generateId()
  })

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }

  person.save().then(result => {
    response.json(result)
  })
  .catch(error => next(error))

})

// api to update person info
app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).end()
      }

      person.name = name
      person.number = number

      return person.save().then((updatedPerson) => {
        response.json(updatedPerson)
      })
    })
    .catch(error => next(error))
})


// middlewares
app.use(unknownEndpoint)
app.use(errorHandler)


const PORT = process.env.PORT 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
