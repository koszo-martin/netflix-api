class User{
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.queue=[];
    }
}

module.exports=User;