const mongoose = require('mongoose')
const bcrypt = require('bcrypt') //used to hash the passwords
const validator = require('validator') //used to make the user write valid emails and passwords to the inputs

const Schema = mongoose.Schema

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true  //if a record already exists in the database, mongoose wont let us save it
  },
  password: {
    type: String,
    required: true
  }
})

// static signup method
// its not an arrow function because i couldnt use "this" keyword
userSchema.statics.signup = async function(email, password) {

  // validation
  if (!email || !password) { //checks if i have a value for email or password or both
    throw Error('All fields must be filled')
  }
  if (!validator.isEmail(email)) {
    throw Error('Email not valid')
  }
  if (!validator.isStrongPassword(password)) {
    throw Error('Password not strong enough')
  }

  const exists = await this.findOne({ email }) //this equals to user

  if (exists) {
    throw Error('Email already in use')
  }

  const salt = await bcrypt.genSalt(10) //adds 10 chars to the String-Password before it gets hashed (extra protection)
  const hash = await bcrypt.hash(password, salt) 

  const user = await this.create({ email, password: hash })

  return user
}

// static login method
userSchema.statics.login = async function(email, password) {

  if (!email || !password) {
    throw Error('All fields must be filled')
  }

  const user = await this.findOne({ email })
  if (!user) {
    throw Error('Incorrect email')
  }

  const match = await bcrypt.compare(password, user.password)
  // compares the passwords, the first is plain text and the other is hashed password
  // bcrypt can compare them and return if the passwords are the same
  if (!match) {
    throw Error('Incorrect password')
  }

  return user
}

module.exports = mongoose.model('User', userSchema)