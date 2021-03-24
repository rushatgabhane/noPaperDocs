const express = require('express')
const router = express.Router()
const fileUpload = require('express-fileupload')
const auth = require('../../middleware/auth')
const {check, validationResult} = require('express-validator')
const User = require('../../models/User')
const util = require('util')
const fs = require('fs')
const {performance} = require('perf_hooks');

function CustomException (msg, code) {
    this.msg = msg
    this.code = code
}

router.use(fileUpload({
    createParentPath: true,
    useTempFiles : true,
    tempFileDir : '/tmp/', 
    safeFileNames: true,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10mb size limit
    preserveExtension: true,
    abortOnLimit: true
}));

// @route POST api/file/upload
// @desc upload a file
// @access private
router.post('/upload', [auth, [
    check('tags').escape().trim()
]], async (req, res) => {
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
        }
        const user = await upload(req, res)

        res.send(JSON.stringify(user))
    } 
    catch (err) {
        if(err instanceof CustomException){
            res.status(err.code).json({errors: [{msg: err.msg}]})
        } else {
            console.error(err.message)
            res.status(500).json({errors: [{msg: 'Server error'}]})
        }
    }
});

// @route PUT api/file/updatefile
// @desc update a file
// @access private
router.put('/update/:fileId', [auth, [
    check('tags').escape().trim()
]], async (req, res) => {
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
        }      
        deleteFile(req, res, req.params.fileId)
        await upload(req, res)
    } catch (err) {
        if(err instanceof CustomException){
            res.status(err.code).json({errors: [{msg: err.msg}]})
        } else {
            console.error(err)
            res.status(500).json({errors: [{msg: 'Server error'}]})
        }
    }
});


const deleteFile = (req, res, fileId) => {
    try {
        // delete the file link in db
        User.updateOne({'files.id' : fileId}, { $pull: { files: { _id: fileId } } }, (err, user) => {
            if(err) {
                console.error(err)
                throw new CustomException('id not found', 400)
            } 
            // delete the file from system
            fs.unlink(`${process.env.PWD}/userPDFs/${req.user.id}/${fileId}`, (err) => {
                console.error(err)
                throw err
            })
        })
    } catch (err) {
        throw err
    }
}

const upload = async (req, res) => {
    try {
        const {tags} = req.body
        if(!req.files) {
            throw new CustomException('No file uploaded', 400)
        }
        const file = req.files.file

        if(file.mimetype != 'application/pdf') {
            throw new CustomException('Please upload a pdf only', 400)
        }
        
        const fileSchema = {}
        fileSchema.fileName = file.name
        if(tags){
            fileSchema.tags = tags.split(',').map(tag => tag.trim())
        }

        // update and save to db
        const user = await User.findById(req.user.id).select('-password')
        user.files.push(fileSchema)
        user.save()

        // Place the file in user's directory with name = file id
        file.mv(`${process.env.PWD}/userPDFs/${req.user.id}/${user.files[user.files.length-1].id}`)
        return user
    } catch (err) {
        throw err
    }
}
  
module.exports = router