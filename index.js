const express = require('express')
const app = express()
const config = require('config')
const connectDB = require('./config/db')()

require('dotenv').config({path: '.env'})

// init middleware
app.use(express.json({extended: false}))

app.get('/', (req, res) => {
    res.send('api running')
})

app.use('/api/users', require('./routes/api/users'))
app.use('/api/qrcode', require('./routes/api/qrcode'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/file', require('./routes/api/file'))

// @route  GET invalid routes
// @desc   Display page not found message
// @access Public
app.get('*', (req, res) => {
	res.status(404).send('404');
});

app.listen(config.get('port'), () => {
    console.log(`Listening on port ${config.get('port')}`)
})