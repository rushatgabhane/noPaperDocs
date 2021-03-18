const express = require('express')
const app = express()
const config = require('config')
const connectDB = require('./config/db')()

require('dotenv').config({path: '.env'})

app.get('/', (req, res) => {
    res.send('api running')
})

// @route  GET invalid routes
// @desc   Display page not found message
// @access Public
app.get('*', (req, res) => {
	res.status(404).render('404');
});

app.listen(config.get('port'), () => {
    console.log(`Listening on port ${config.get('port')}`)
})