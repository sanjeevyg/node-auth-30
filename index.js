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
    bcrypt.hash(request.body.password, 12, (error, hashedPassword) => {
        database('users')
                .insert({
                    username: request.body.username,
                    password_hash: hashedPassword
                })
                .returning('*')
                .then(user => {
                    response.json({user})
                }).catch(error => {
                    console.error({error: error.message})
                    response.sendStatus(500)
                })
    })
})

app.post('/login', (request, response) => {
    const user = request.body
    database('users')
        .where({username: user.username})
        .first()
        .then(retrieveduser => {
            if (!retrieveduser) throw new Error('User not found!')

            return Promise.all([
                bcrypt.compare(user.password, retrieveduser.password_hash),
                Promise.resolve(retrieveduser)
            ])
        }).then(results => {
                const areSamePasswords = results[0]
                const user = results[1]

                if(!areSamePasswords) throw new Error('Wrong password!')

                const payload = {username: user.username}
                const secret = 'SECRET!'

                jwt.sign(payload, secret, (error, token) => {
                    if(error) throw new Error('Sign in error!')

                    response.json({ token })
                })
            }).catch(error => {
                response.json({error: error.message})
        })

})

app.get('/authenticate', authenticate, (request, response) => {
    response.json(`${request.user.username} found the lucky charm`)
})


function authenticate(request, response, next) {
    const authHeader = request.get('Authorization')
    const token = authHeader.split(" ")[1]
    const secret = 'SECRET!'
    jwt.verify(token, secret, (error, payload) => {
        if(error) throw new Error('sign in error')
        
        database('users')
            .where({ username: payload.username })
            .first()
            .then(user => {
                request.user = user    
                next()
            }).catch(error => {
                response.json({ error: error.message })
        })
    })
}


app.get('/users', (request, response) => {
    database('users')
        .select()
        .then(users => {
            response.json({users})
        })
})




