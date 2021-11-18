class User{
    constructor(username, password) {
        this._username = username;
        this._password = password;
        this._session = "no";
        this._queue=[];
    }


    get username() {
        return this._username;
    }

    set username(value) {
        this._username = value;
    }

    get password() {
        return this._password;
    }

    set password(value) {
        this._password = value;
    }

    get session(){
        return this._session;
    }

    set session(value){
        this._session = value;
    }

    destroySession(){
        this._session = "no";
    }

    get queue(){
        return this._queue;
    }

    addToQueue(video){
        this._queue.push(video);
    }
}

module.exports=User;