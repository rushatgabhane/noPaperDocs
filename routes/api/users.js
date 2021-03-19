const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const gravatar = require('gravatar')
const jwt = require('jsonwebtoken')
const config = require('config')
const {check, validationResult} = require('express-validator')
const fs = require('fs')
const util = require('util')


const User = require('../../models/User')

// @route POST api/users
// @desc sign up a user
// @access public
router.post('/', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 8 or more characters').isLength({min:8, max:32})
], async (req, res) => {
    const errors = validationResult(req)
    
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    
    const {email, password, companyName} = req.body
    
    try {
        // see if user exists
        let user = await User.findOne({email})
        if(user) {
            return res.status(400).json({errors: [{msg: 'Email is already registered. Please login.'}]})
        }

        // generate user root directory id for storing all pdfs to
        const path = process.env.PWD +'/userPDFs/' + crypto.randomBytes(24).toString('hex') + '/'

        await fs.promises.mkdir(path)

        // generate gravatar
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })
        
        user = new User({
            email,
            password,
            avatar,
            companyName,
            path,
            files
        })
        // encrypt password
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, salt)

        // save user to database
        await user.save()
        // return jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        }
        console.log(user, "***************************************************************")
        console.log(util.inspect(user.files, false, null, true /* enable colors */))

        jwt.sign(payload, config.get('jwtSecret'), {expiresIn: 36000}, (err, token) => {
            if(err) throw err
            res.json({token})
        })
    } catch (err) {
        console.error(err.message)
        res.status(500).json({errors: [{msg: 'Server error'}]})
    }
})

module.exports = router