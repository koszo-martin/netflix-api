const express = require('express')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const restify = require('express-restify-mongoose')
const app = express()
const router = express.Router()

app.use(bodyParser.json())
app.use(methodOverride())

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    queue: [
        {
            type : mongoose.Schema.ObjectId,
            ref: 'Video'
        }
    ]
})

const CategorySchema = new mongoose.Schema({
    name: String
})


const VideoSchema = new mongoose.Schema({
    category: CategorySchema,
    title: String,
    type: String
})

const SessionSchema = new mongoose.Schema({
    user_id: {
        type : mongoose.Schema.ObjectId,
        ref: 'User'
    }
})

const User = mongoose.model('User', UserSchema)
const Category = mongoose.model('Category', CategorySchema);
const Video = mongoose.model('Video', VideoSchema);
const Session = mongoose.model('Session', SessionSchema);


function startDbApi(){
    mongoose.connect('mongodb+srv://martin:fintechX@interntraining.bu99f.mongodb.net/InternTraining?retryWrites=true&w=majority');
    restify.serve(router, User);
    restify.serve(router, Category);
    restify.serve(router, Video);
    restify.serve(router, Session);

    app.use(router)

    app.listen(3001, () => {
        console.log('Express server listening on port 3001')
    })
}

module.exports = {
    startDbApi
}
