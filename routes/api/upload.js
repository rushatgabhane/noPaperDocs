const express = require('express')
const router = express.Router()
const fileUpload = require('express-fileupload')
const auth = require('../../middleware/auth')
const {check, validationResult} = require('express-validator')
const User = require('../../models/User')
const util = require('util')


router.use(express.json({limit: '10'})) // 10mb size limit
router.use(fileUpload({
    createParentPath: true,
    useTempFiles : true,
    tempFileDir : '/tmp/', 
    safeFileNames: true,
    limits: { fileSize: 10 * 1024 * 1024 },
    preserveExtension: true,
    abortOnLimit: true
}));

// @route POST api/upload
// @desc upload a file
// @access private
router.post('/', [auth, [
    check('tags').escape().trim()
]], async (req, res) => {
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
        }      

        const {tags} = req.body
        const file = req.files.file

        if(!file) {
            return res.status(400).json({errors: [{msg: 'No file uploaded.'}]})
        }
        if(file.mimetype != 'application/pdf') {
            return res.status(400).json({errors: [{msg: 'Please upload a pdf only.'}]})
        }
        
        const fileSchema = {}
        fileSchema.fileName = file.name
        if(tags){
            fileSchema.tags = tags.split(',').map(tag => tag.trim())
        }

        // update and save to db
        const user = await User.findById(req.user.id)
        user.files.push(fileSchema)
        await user.save()

        //Use the mv() method to place the file in upload directory (i.e. "uploads")
        file.mv(`${process.env.PWD}/userPDFs/${req.user.id}/${user.files[user.files.length-1].id}`)
        res.sendStatus(200)
    
    } catch (err) {
        console.error(err.message)
        res.status(500).json({errors: [{msg: 'Server error'}]})
    }
});

module.exports = router