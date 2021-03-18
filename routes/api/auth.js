const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
// @route GET api/auth
// @desc  route
// @access public
router.get('/', auth, (req, res) => {
    try {
        
    } catch (err) {
        
    }
})

module.exports = router