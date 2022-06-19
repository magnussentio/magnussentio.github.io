const PORT = 8000
const express = require('express')
const cors = require('cors')
const axios = require('axios')
require('dotenv').config()

const app = express()

app.use(cors())

app.get('/', (req, res) => {
	res.json('hi')
})

app.get('/runespring', (req, res) => {
	res.json('hi')
})



app.listen(8000, () => console.log('Server is running on port ${PORT}'))