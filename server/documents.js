const mongoose = require('mongoose')
const Schema = mongoose.Schema

const docSchema = new Schema({
    _id: {
        type: String,
    },
    data: {
        type: Object,
    }
})  
const Doc = mongoose.model('Doc', docSchema)
module.exports = Doc