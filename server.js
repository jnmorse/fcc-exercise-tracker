const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')

mongoose.Promise = require('bluebird')

mongoose.connect(`mongodb://mongo:27017}`).then(
  () => {
    console.log('connected to database')
  }
).catch((e) => {
  console.log(e.message)
})

const User = require('./schema/userSchema');

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', async (req, res) => {
  const users = await User.find();
  console.log(users)

  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/exercise/new-user', async (req, res) => {
  const { username } = req.body;

  const newUser = new User({ username })

  const foundOne = await User.find({ username })

  if (!foundOne.length) {
    try {
      const saved = await newUser.save()

      res.send(saved)
    } catch (e) {
      res.send(e.message)
    }
  }

  res.send('User already exists')
})


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
