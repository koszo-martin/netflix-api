const axios = require('axios');
const database = axios.create({
    baseURL: 'http://localhost:3001/api/v1/'
})

const adminApiKey = '241234213478364'

module.exports = {
    swaggerSecurityHandlers: {
        session_id: async function (req, authOrSecDef, scopesOrApiKey, callback) {
            try {
                await database.get(`Session/${req.headers.session_id}`)
                callback();
            } catch (error) {
                callback(new Error(''));
            }
        },
        admin_api_key: function (req, authOrSecDef, scopesOrApiKey, callback) {
            if(req.headers.admin_api_key===adminApiKey){
                callback();
            }else{
                callback(new Error(''));
            }
        }
    }
};