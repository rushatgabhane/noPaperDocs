const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const jwt = require('jsonwebtoken')
const config = require('config')
const bcrypt = require('bcryptjs')
const {check, validationResult} = require('express-validator')

const User = require('../../models/User')

// @route POST api/auth
// @desc  Authenticate user and get jwt token
// @access public
router.post('/', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req)
    
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    
    const {email, password} = req.body
    
    try {
        // see if user exists
        let user = await User.findOne({email})
        if(!user) return res.status(400).json({errors: [{msg: 'Invalid credentials.'}]})

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) return res.status(400).json({errors: [{msg: 'Invalid credentials.'}]})
        
        // return jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        }
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