const express = require('express')
const router = express.Router()
const {check, validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')

const User = require('../../models/User')

// @route POST api/users
// @desc register a user
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
            res.status(400).json({errors: [{msg: 'Email is already registered. Please login'}]})
        }
        user = new User({
            email,
            password,
            companyName
        })
        // encrypt password
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, salt)

        // save user to database
        await user.save()
        // return jsonwebtoken
        res.send(200)
    } catch (err) {
        console.error(err.message)
        res.status(500).json({errors: [{msg: 'Server error'}]})
    }

    
})

module.exports = router