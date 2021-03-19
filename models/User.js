const mongoose = require('mongoose')

const FolderSchema = new mongoose.Schema({
    folderName: {
        type : String,
         required: true
    },
    files: [{type: String}]
})

FolderSchema.add({folders: [FolderSchema]}) // recursive folder structure

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
    },
    companyName: {
        type: String
    },
    path : {
        type: String,
        required: true
    },
    directoryStructure : [FolderSchema]
})

module.exports = User = mongoose.model('user', UserSchema)