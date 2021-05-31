const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cors = require('cors')

app.use(cors())
app.use(express.json())

const knex = require('knex')
const connection = require('./knexfile.js').development
const database = knex(connection)

const port = 5000

app.listen(port, () => {
    console.log(`listening to port ${port}`)
})

app.post('/users', (request, response) => {
    const user = request.body 
    bcrypt(request.body.password, 12, (error, hashedPassword))
        .then(
            database('users')
                .insert({
                    username: request.params.username,
                    password_hash: hashedPassword
                })
                .returing('*')
                .then(user => {
                    response.json({user})
                }).catch(error => {
                    console.error({error: error.message})
                    response.sendStatus(500)
                })
        )
})



