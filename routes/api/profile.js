const express = require('express')
const router = express.Router()
const User = require('../../models/User')
const auth = require('../../middleware/auth')
const {check, validationResult} = require('express-validator')


// @route GET api/profile/me
// @desc get current user data
// @access private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password') // select everything but the password
        res.json({user})
    } catch (err) {
        console.error(err.message)
        res.sendStatus(500)
    }
})

// @route POST api/profile
// @desc create a user profile or update
// @access private
// router.post('/', [auth, [

// ]], async (req, res) => {
//     const errors = validationResult(req)
//     if(!errors.isEmpty()){
//         return res.status(400).json({errors: errors.array()})
//     }
//     const {companyName} = req.body
//     // build profile object
//     const profileFields = {}
//     profileFields.user = req.user.id
//     if(companyName) profileFields.company = companyName

//     // fileName : {type: String, required: true},
//     // tags: [String],
//     if(files){
//         profileFields.files =  [{

//         }]
//     }
// })
module.exports = router