const Session = require("../classes/Session");
const User = require("../classes/User");
const Video = require("../classes/Video");
const Category = require("../classes/Category");

class Repository{
    constructor() {
        this.sessions= [];
        this.users= [];
        this.videos = [];
        this.categories = [];
    }

    addSession(session){
        this.sessions.push(session);
    }

    addUser(user){
        this.users.push(user);
    }

    addVideo(video){
        this.videos.push(video);
    }

    addCategory(category){
        this.categories.push(category);
    }

    getSessions(){
        return this.sessions;
    }

    getUsers(){
        return this.users;
    }

    getVideos(){
        return this.videos;
    }

    getCategories(){
        return this.categories;
    }

    deleteSession(session){
        let index = this.sessions.indexOf(session);
        this.sessions.splice(index, 1);
    }

    deleteUser(user){
        let index = this.users.indexOf(user);
        this.users.splice(index, 1);
    }

    deleteVideo(video){
        let index = this.videos.indexOf(video);
        this.videos.splice(index, 1);
    }

    deleteCategory(category){
        let index = this.categories.indexOf(category);
        this.categories.splice(index, 1);
    }

    getUserBySession(session_id){
        for(let user of this.users){
            if(session_id!==undefined && user.session.id===session_id){
                return user;
            }
        }
    }

    getCategoryById(id){
        let category;
        for(let ct of this.categories){
            if(ct.id===id){
                category=ct;
            }
        }
        return category;
    }

    getVideoById(id){
        let video;
        for(let vid of this.videos){
            if(vid.id===id){
                video=vid;
            }
        }
        return video;
    }
}


module.exports = Repository;