const chai = require('chai');
const expect = chai.expect;
const should = chai.should;
const mocha = require('mocha');
const request = require('supertest');
const sinon = require('sinon');
const server = require('../../../app');
const Category = require("../../../api/classes/Category");
const Video = require("../../../api/classes/Video");
const User = require("../../../api/classes/User");
const axios = require('axios');
const database = axios.create({
    baseURL: 'http://localhost:3001/api/v1/'
})
const mongoose = require('mongoose');


before("wait for server", async () =>{
    await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, 10)
    })
})
describe('User tests', function () {
    before('delete user if already existing', async () =>{
        try {
            const response = await database.get(`User?query={"username": "user"}`);
            await database.delete(`User/${response.data[0]._id}`);
        }catch (err){}
    })
    it('create user', async function () {
        const response = await request(server).post("/user")
            .send({
                "username": "user",
                "password": "asdkl"
            })
            .expect(200)

        expect(response.status).to.be.equal(200);
        expect(response.body).to.be.equal("success");
    })
    it('create user fail when trying to add same user', async function (){
        const response = await request(server).post("/user")
            .send({
                "username": "user",
                "password": "asdkl"
            })
        expect(response.status).to.be.equal(400);
        expect(response.body).to.be.equal("User already exists");
    })
    it('login success', async function (){
        const response = await request(server).post("/user/login")
            .send({
                "username": "user",
                "password": "asdkl"
            })
        expect(response.status).to.be.equal(200);
        const responseUser = await database.get(`User?query={"username": "user"}`);
        const id = (await database.get(`User/${responseUser.data[0]._id}`)).data._id;
        expect(response.body.user_id).to.be.equal(id);
    })
    it('login fail', async function (){
        const response = await request(server).post("/user/login")
            .send({
                "username": "user",
                "password": "fdssa"
            })
        expect(response.status).to.be.equal(400);
        expect(response.body).to.be.equal("User not found");
    })
    it('logout success', async function (){
        const responseUser = await database.get(`User?query={"username": "user"}`);
        const userId = (await database.get(`User/${responseUser.data[0]._id}`)).data._id;
        console.log(userId);
        const sessions = (await database.get(`Session`)).data;
        const sessionId = sessions.find(session => session.user_id===userId)._id;
        const response = await request(server).get("/user/logout")
            .set("session_id", sessionId);
        expect(response.status).to.be.equal(200);
        expect(response.body).to.be.equal("success");
    })
    it('logout fail', async function (){
        const response = await request(server).get("/user/logout")
            .set("session_id", "619d46d849cb2215605104e9")
        expect(response.status).to.be.equal(403);
        expect(response.body.code).to.be.equal("server_error")
    })
})
describe('video tests', function (){
    it('get video', async function (){
        const response = await request(server).get("/video")
            .set("session_id", "619bf4f3f9cf3939f8b7c674")
            .query({
                title: "king"
            })
        expect(response.status).to.be.equal(200);
        expect(response.body[0].title).to.contain("king");
    })
    it('add to queue with wrong session', async function (){
        const response = await request(server)
            .post("/queue")
            .set("session_id", "619d46d849cb2215605104e9")
            .send({
                "id": "1"
            })
        expect(response.status).to.be.equal(403);
        expect(response.body.code).to.be.equal("server_error")
    })
    it('add to queue with wrong id', async function (){
        const response = await request(server).post("/queue")
            .set("session_id", "619bf4f3f9cf3939f8b7c674")
            .send({
                "id": "619cab6c2a7ae52b20b222d8"
            })
        expect(response.status).to.be.equal(400);
        expect(response.body).to.be.equal("Video not found")
    })
    it('add to queue success', async function (){
        let responseUser = (await database.get(`User?query={"username": "valaki"}`)).data[0];
        let queueLength = responseUser.queue.length;
        const response = await request(server).post("/queue")
            .set("session_id", "619bf4f3f9cf3939f8b7c674")
            .send({
                "id": "619d46d849cb2215605104e9"
            })
        expect(response.status).to.be.equal(200);
        responseUser = (await database.get(`User?query={"username": "valaki"}`)).data[0];
        expect(responseUser.queue.length).to.be.equal(queueLength+1);
    })
    it('get queue without session', async function (){
        const response = await request(server)
            .get("/queue")
        expect(response.status).to.be.equal(403);
        expect(response.body.code).to.be.equal("server_error");
    })
    it('get queue success', async function (){
        const response = await request(server).get("/queue")
            .set("session_id", "619bf4f3f9cf3939f8b7c674")
        expect(response.status).to.be.equal(200);
        expect(response.body[response.body.length-1]).to.be.equal("619d46d849cb2215605104e9");
    })
})
describe('admin', function (){
    it('post video success', async function (){
        let videosLength = (await database.get('Video')).data.length;
        const response = await request(server).post("/admin/video")
            .set("admin_api_key", 241234213478364)
            .send({
                "category": {
                    "name": "Action"
                },
                "title": "Kings",
                "type": "TV show"
            })
        expect(response.status).to.be.equal(200);
        expect((await database.get('Video')).data.length).to.be.equal(videosLength+1);
        let id = (await database.get(`Video?query={"title":"Kings"}`)).data[0]._id;
        await database.delete(`Video/${id}`);
    })
    it('post video fail', async function (){
        await request(server).post("/admin/video")
            .set("admin_api_key", 241234213478364)
            .send({
                "category": {
                    "name": "Action"
                },
                "title": "Kings",
                "type": "TV show"
            })
        const response = await request(server).post("/admin/video")
            .set("admin_api_key", 241234213478364)
            .send({
                "category": {
                    "name": "Action"
                },
                "title": "Kings",
                "type": "TV show"
            })
        expect(response.status).to.be.equal(400);
        expect(response.body).to.be.equal("Invalid video title");
        let id = (await database.get(`Video?query={"title":"Kings"}`)).data[0]._id;
        await database.delete(`Video/${id}`);
    })
    it('patch video fail', async function (){
        const response = await request(server).patch("/admin/video")
            .set("admin_api_key", 241234213478364)
            .send({
                "_id": "619bf4f3f9cf3939f8b7c674",
                "category": {
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
            .set("admin_api_key", 241234213478364)
            .send({
                "_id": "619d46d849cb2215605104e9",
                "category": {
                    "name": "Action"
                },
                "title": "Kings",
                "type": "TV show"
            })
        expect(response.status).to.be.equal(200);
        expect(response.body.title).to.be.equal("Kings");
        await request(server).patch("/admin/video")
            .set("admin_api_key", 241234213478364)
            .send({
                "_id": "619d46d849cb2215605104e9",
                "category": {
                    "name": "Action"
                },
                "title": "Vikings",
                "type": "TV show"
            })
    })
    it('delete video fail', async function (){
        const response = await request(server).delete("/admin/video")
            .set("admin_api_key", 241234213478364)
            .query({
                id: "619bf4f3f9cf3939f8b7c674"
            })
        expect(response.status).to.be.equal(400);
        expect(response.body).to.be.equal("Video not found");
    })
    it('delete video success', async function (){
        await request(server).post("/admin/video")
            .set("admin_api_key", 241234213478364)
            .send({
                "category": {
                    "name": "Action"
                },
                "title": "Test",
                "type": "TV show"
            })
        let id = (await database.get(`Video?query={"title":"Test"}`)).data[0]._id;
        let videosLength = (await database.get('Video')).data.length;
        const response = await request(server).delete("/admin/video")
            .set("admin_api_key", 241234213478364)
            .query({
                id: id
            })
        expect(response.status).to.be.equal(200);
        expect((await database.get('Video')).data.length).to.be.equal(videosLength-1);
    })
})

