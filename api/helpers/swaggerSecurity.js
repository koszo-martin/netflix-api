module.exports = {
    swaggerSecurityHandlers: {
        session_id: function (req, authOrSecDef, scopesOrApiKey, callback) {
            try {
                callback();
            } catch (error) {
                callback(new Error(''));
            }
        },
        admin_api_key: function (req, authOrSecDef, scopesOrApiKey, callback) {
            callback();
        }
    }
};