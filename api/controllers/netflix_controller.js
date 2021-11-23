const Session = require("../classes/Session");
const User = require("../classes/User");
const Video = require("../classes/Video");
const Category = require("../classes/Category");
const Repository = require("../classes/Repository");
const axios = require('axios');
const database = axios.create({
    baseURL: 'http://localhost:3001/api/v1/'
})

async function getUserBySession(session){
    let response = await database.get(`User/${session.user_id}`);
    let user = response.data;
    return user;
}

async function getUsersFromDb(){
    let users;
    await database.get('User')
        .then(function (response){
            users=response.data;
        })
    return users;
}
function createUser(req, res){
    return createUserAsync(req, res);
}

async function createUserAsync(req, res){
        let response = await database.get(`User?query={"username" : "${req.body.username}"}`);
        if(response.data.length>0) {
            res.status(400).json("User already exists");
            return res;
        }
        const user = {
            username:req.body.username,
            password:req.body.password
        }
        await database.post('User', user);
        await res.json("success");
        return res;
}

function login(req, res){
    return loginAsync(req,res);
}

async function loginAsync(req, res){
    let response = await database.get(`User?query={"username":"${req.body.username}","password":"${req.body.password}"}`);
    if(response.data.length===0){
        res.status(400).json("User not found");
        return res;
        }
    let session = new Session(response.data[0]._id);
    await database.post('Session', session);
    res.status(200).json(session);
    return res;
}

function logoutUser(req, res){
    return logoutUserAsync(req, res);
}
async function logoutUserAsync(req, res){
    try {
        await database.delete(`Session/${req.headers.session_id}`);
        res.json("success");
        return res;
    }catch (err){
        res.status(400).json("no session found");
        return res;
    }
}

function getVideoByTitle(req, res){
    return getVideoByTitleAsync(req, res);
}

async function getVideoByTitleAsync(req, res) {
    let response = await database.get('Video')
    let videos = response.data;
    videos = videos.filter(video => video.title.toLowerCase().includes(req.query.title.toLowerCase()))
    if(videos){
        res.json(videos);
        return res;
    }
    return res;
}

function addVideoToQueue(req, res){
    return addVideoToQueueAsync(req, res);
}

async function addVideoToQueueAsync(req, res){
    let response = await database.get(`Session/${req.headers.session_id}`);
    if(response.data.length===0){
        res.status(400).json("No session");
        return res;
    }
    let session = response.data;
    let user = await getUserBySession(session);
    response = await database.get(`Video/${req.body.id}`);
    if(response.data.length===0) {
        res.status(400).json("Video not found").send();
        return res;
    }
    let video = response.data;
    user.queue.push(video._id);
    await database.patch(`User/${user._id}`, {queue:user.queue});
    res.json(video);
    return res;
}

function getVideosInQueue(req,res){
    return getVideosInQueueAsync(req,res);
}

async function getVideosInQueueAsync(req, res){
    let response = await database.get(`Session/${req.headers.session_id}`);
    if(response.data.length===0){
        res.status(400).json("No session");
        return res;
    }
    let session = response.data;
    let user = await getUserBySession(session);
    res.json(user.queue);
    return res;
}

function getVideoAdmin(req, res){
    return getVideoByTitleAsync(req, res);
}

function postVideo(req,res){
    return postVideoAsync(req,res);
}

async function createCategoryIfNotExisting(req){
    let response = await database.get(`Category?query={"name":"${req.body.category.name}"}`);
    if(response.data.length===0){
        let category = new Category(req.body.category.name);
        await database.post('Category', category);
    }
    return (await database.get(`Category?query={"name":"${req.body.category.name}"}`)).data[0];
}

async function postVideoAsync(req, res){
    let category = await createCategoryIfNotExisting(req);
    let response = await database.get(`Video?query={"title":"${req.body.title}"}`);
    if(response.data.length>0){
        res.status(400).json("Invalid video title")
        return res
    }
    let video = new Video(category, req.body.title, req.body.type);
    await database.post('Video', video);
    res.json(video);
    return res;
}

function patchVideo(req,res){
    return patchVideoAsync(req, res);
}

async function patchVideoAsync(req, res){
    let category = await createCategoryIfNotExisting(req);
    let response = await database.get(`Video/${req.body._id}`);
    if(response.data.length===0) {
        res.status(400).json("Video not found").send();
        return res;
    }
    await database.patch(`Video/${req.body._id}`, {category: category, title: req.body.title, type: req.body.type});
    res.json(response.data);
    return res;
}

function deleteVideo(req,res){
    return deleteVideoAsync(req,res);
}

async function deleteVideoAsync(req, res){
    try {
        await database.delete(`Video/${req.query.id}`);
        res.json("success");
        return res;
    }catch (err){
        res.status(400).json("delete failed");
        return res;
    }
}



module.exports = {
    getVideoByTitle: getVideoByTitle,
    createUser: createUser,
    login: login,
    logoutUser: logoutUser,
    addVideoToQueue: addVideoToQueue,
    getVideosInQueue: getVideosInQueue,
    getVideoAdmin: getVideoAdmin,
    postVideo: postVideo,
    patchVideo: patchVideo,
    deleteVideo: deleteVideo,
};