const mongoose = require('mongoose')

const FileSchema = new mongoose.Schema({
    fileName : {type: String, required: true},
    tags: [String]
}, {timestamps: true})

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
    files : [FileSchema]
})

module.exports = User = mongoose.model('user', UserSchema)