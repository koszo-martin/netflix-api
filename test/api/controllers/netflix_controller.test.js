const chai = require('chai');
const expect = chai.expect;
const should = chai.should;
const request = require('supertest');
const sinon = require('sinon');
const server = require('../../../app');
const Repository = require("../../../api/classes/Repository");
const Category = require("../../../api/classes/Category");
const Video = require("../../../api/classes/Video");
const User = require("../../../api/classes/User");
let repository = require("../../../api/controllers/netflix_controller").repository


before("wait for server", async () =>{
    await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, 10)
    })
})
describe('User tests', function () {
    it('create user', async function () {

        const response = await request(server).post("/user")
            .send({
                "username": "asda",
                "password": "asdkl"
            })
            .expect(200)

        expect(response.status).to.be.equal(200);
        expect(response.body).to.be.equal("success");
    })
    it('create user fail when trying to add same user', async function (){
        await request(server).post("/user")
            .send({
                "username": "asda",
                "password": "asdkl"
            })
        const response = await request(server).post("/user")
            .send({
                "username": "asda",
                "password": "asdkl"
            })
        expect(response.status).to.be.equal(400);
        expect(response.body).to.be.equal("User already exists");
    })
    it('login success', async function (){
        const response = await request(server).post("/user/login")
            .send({
                "username": "asda",
                "password": "asdkl"
            })
        expect(response.status).to.be.equal(200);
        expect(response.body._id).to.be.equal("123");
    })
    it('login fail', async function (){
        const response = await request(server).post("/user/login")
            .send({
                "username": "asda",
                "password": "fdssa"
            })
        expect(response.status).to.be.equal(400);
        expect(response.body).to.be.equal("User not found");
    })
    it('logout', async function (){
        const response = await request(server).get("/user/logout")
            .set("session_id", "123")
        expect(response.status).to.be.equal(200);
        expect(response.body).to.be.equal("success");
    })
    it('logout fail', async function (){
        const response = await request(server).get("/user/logout")
            .set("session_id", "1234")
        expect(response.status).to.be.equal(400);
        expect(response.body).to.be.equal("No session found");
    })
})
describe('video tests', function (){
    it('get video', async function (){
        const response = await request(server).get("/video")
            .set("session_id", "123")
            .query({
                title: "Die"
            })
        expect(response.status).to.be.equal(200);
        expect(response.body[0]._title).to.contain("Die");
    })
    it('add to queue with wrong session', async function (){
        const response = await request(server)
            .post("/queue")
            .send({
                "id": "1"
            })
        expect(response.status).to.be.equal(400);
        expect(response.body).to.be.equal("No session")
    })
    it('add to queue with wrong id', async function (){
        await request(server).post("/user")
            .send({
                "username": "asda",
                "password": "asdkl"
            })
        await request(server).post("/user/login")
            .send({
                "username": "asda",
                "password": "asdkl"
            })
        const response = await request(server).post("/queue")
            .set("session_id", "123")
            .send({
                "id": 6
            })
        expect(response.status).to.be.equal(400);
        expect(response.body).to.be.equal("Video not found")
    })
    it('add to queue success', async function (){
        let user = repository.getUserBySession("123");
        let queueLength = user.queue.length;
        await request(server).post("/user")
            .send({
                "username": "asda",
                "password": "asdkl"
            })
        await request(server).post("/user/login")
            .send({
                "username": "asda",
                "password": "asdkl"
            })
        const response = await request(server).post("/queue")
            .set("session_id", "123")
            .send({
                "id": 1
            })
        expect(response.status).to.be.equal(200);
        expect(response.body._id).to.be.equal(1);
        expect(user.queue.length).to.be.equal(queueLength+1);
    })
    it('get queue without session', async function (){
        const response = await request(server)
            .get("/queue")
        expect(response.status).to.be.equal(400);
        expect(response.body).to.be.equal("No session")
    })
    it('get queue success', async function (){
        const response = await request(server).get("/queue")
            .set("session_id", "123")
        expect(response.status).to.be.equal(200);
        expect(response.body[0]._id).to.be.equal(1)
    })
})
describe('admin', function (){
    it('post video success', async function (){
        let videosLength = repository.videos.length;
        const response = await request(server).post("/admin/video")
            .send({
                "id": 3,
                "category": {
                    "id": 3,
                    "name": "Action"
                },
                "title": "Kings",
                "type": "TV show"
            })
        expect(response.status).to.be.equal(200);
        expect(response.body._id).to.be.equal(3);
        expect(repository.videos.length).to.be.equal(videosLength+1);
    })
    it('post video fail', async function (){
        const response = await request(server).post("/admin/video")
            .send({
                "id": 1,
                "category": {
                    "id": 3,
                    "name": "Action"
                },
                "title": "Kings",
                "type": "TV show"
            })
        expect(response.status).to.be.equal(400);
        expect(response.body).to.be.equal("Invalid video ID");
    })
    it('patch video fail', async function (){
        const response = await request(server).patch("/admin/video")
            .send({
                "id": 132,
                "category": {
                    "id": 3,
                    "name": "Action"
                },
                "title": "Kings",
                "type": "TV show"
            })
        expect(response.status).to.be.equal(400);
        expect(response.body).to.be.equal("Video not found");
    })
    it('patch video success', async function (){
        const response = await request(server).patch("/admin/video")
            .send({
                "id": 1,
                "category": {
                    "id": 3,
                    "name": "Action"
                },
                "title": "New Vikings",
                "type": "TV show"
            })
        expect(response.status).to.be.equal(200);
        expect(response.body._title).to.be.equal("New Vikings");
        expect(repository.getVideoById(1).title).to.be.equal("New Vikings");
    })
    it('delete video fail', async function (){
        const response = await request(server).delete("/admin/video")
            .query({
                id: 123
            })
        expect(response.status).to.be.equal(400);
        expect(response.body).to.be.equal("Video not found");
    })
    it('delete video success', async function (){
        let videosLength = repository.videos.length;
        const response = await request(server).delete("/admin/video")
            .query({
                id: 1
            })
        expect(response.status).to.be.equal(200);
        expect(repository.videos.length).to.be.equal(videosLength-1);
    })
})
describe('stub spy mock', function (){
    it('add to queue stub', async function (){
        let getUser = sinon.stub(repository, "getUserBySession");
        let getVideo = sinon.stub(repository, "getVideoById");
        let user = new User("name", "pass");
        getUser.returns(user);
        let video = new Video(5, repository.categories[0], "Title", "Movie")
        getVideo.returns(video);
        let queueLength = user.queue.length;
        const response = await request(server).post("/queue")
            .set("session_id", "123")
            .send({
                "id": 1
            })
        expect(response.status).to.be.equal(200);
        expect(response.body._id).to.be.equal(video.id);
        expect(user.queue.length).to.be.equal(queueLength+1);
    })
    it('login mock', async function (){
        let mock = sinon.mock(repository);
        let expectation = mock.expects("addSession");
        expectation.exactly(1);
        const response = await request(server).post("/user/login")
            .send({
                "username": "asda",
                "password": "asdkl"
            })
        expect(response.status).to.be.equal(200);
        mock.verify();
    })
    it('delete video spy', async function (){
        let deleteSpy = sinon.spy(repository, "deleteVideo");
        let videosLength = repository.videos.length;
        const response = await request(server).delete("/admin/video")
            .query({
                id: 2
            })
        expect(response.status).to.be.equal(200);
        expect(repository.videos.length).to.be.equal(videosLength-1);
        expect(deleteSpy.calledOnce);
    })
})

