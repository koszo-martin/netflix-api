class Session{
    constructor(id) {
        this._id = id;
    }


    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }
}

module.exports=Session;