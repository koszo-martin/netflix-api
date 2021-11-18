const Session = require("../classes/Session");
const User = require("../classes/User");
const Video = require("../classes/Video");
const Category = require("../classes/Category");
const Repository = require("../classes/Repository");

let repository = new Repository();

repository.addCategory(new Category(1, "Action"));
repository.addCategory(new Category(2, "Drama"));
repository.addVideo(new Video(1, repository.categories[0], "Vikings", "TV show"));
repository.addVideo(new Video(2, repository.categories[1], "Die Hard", "Movie"));

module.exports=repository;



function createUser(req, res){
    return createUserAsync(req, res);
}

async function createUserAsync(req, res){
    if(repository.users.some(user => user.username === req.body.username)) {
        res.status(400).json("User already exists");
        return res;
    }
    await repository.addUser(new User(req.body.username, req.body.password));
    await res.json("success");
    return res;
}

function login(req, res){
    let user = repository.users.find(user => user.username === req.body.username && user.password === req.body.password);
    if(user){
            let session = new Session("123")
            repository.addSession(session);
            user.session = session;
            res.status(200).json(session);
            return res;
        }
    res.status(400).json("User not found");
    return res;
}

function logoutUser(req, res){
    let user = repository.users.find(user => user.session.id === req.headers.session_id);
    if(user){
        repository.deleteSession(user.session);
        user.destroySession();
        res.json("success");
        return res;
    }
    res.status(400).json("No session found");
    return res;
}

function getVideoByTitle(req, res) {
    let videos = repository.videos.filter(video => video.title.toLowerCase().includes(req.query.title.toLowerCase()));
    if(videos){
        res.json(videos);
        return res;
    }
    return res;
}

function addVideoToQueue(req, res){
    let user = repository.getUserBySession(req.headers.session_id);
    if(!user){
        res.status(400).json("No session");
        return res;
    }
    let video = repository.getVideoById(req.body.id);
    if(!video) {
        res.status(400).json("Video not found").send();
        return res;
    }
    user.addToQueue(video);
    res.json(video);
    return res;
}

function getVideosInQueue(req, res){
    let user = repository.getUserBySession(req.headers.session_id);
    if(!user){
        res.status(400).json("No session");
        return res;
    }
    res.json(user.queue);
    return res;
}

function getVideoAdmin(req, res){
    getVideoByTitle(req, res);
}

function postVideo(req, res){
    let category = repository.getCategoryById(req.body.category.id);
    if(!category){
        category = new Category(req.body.category.id, req.body.category.name);
        repository.addCategory(category);
    }
    let video = repository.videos.find(video => video.id === req.body.id);
    if(video){
        res.status(400).json("Invalid video ID")
        return res
    }
    video = new Video(req.body.id, category, req.body.title, req.body.type);
    repository.addVideo(video);
    res.json(video);
    return res;
}

function patchVideo(req, res){
    let video = repository.getVideoById(req.body.id);
    let index = repository.videos.indexOf(video);
    if(index===-1) {
        res.status(400).json("Video not found");
        return res;
    }
    let currentVideo = repository.videos[index];
    currentVideo.id=req.body.id;
    let category = repository.getCategoryById(req.body.category.id);
    if(category===undefined){
        category= new Category(req.body.category.id, req.body.category.name);
        repository.addCategory(category);
    }
    currentVideo.category=category;
    currentVideo.title=req.body.title;
    currentVideo.type=req.body.type;
    res.json(video);
    return res;
}

function deleteVideo(req, res){
    let video = repository.getVideoById(parseInt(req.query.id));
    if(!video){
        res.status(400).json("Video not found");
        return res;
    }
    repository.deleteVideo(video);
    res.json("Success");
    return res;
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
    repository: repository
};