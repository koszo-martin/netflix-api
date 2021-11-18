class Video{
    constructor(id, category, title, type) {
        this._id = id;
        this._category = category;
        this._title = title;
        this._type = type;
    }


    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get category() {
        return this._category;
    }

    set category(value) {
        this._category = value;
    }

    get title() {
        return this._title;
    }

    set title(value) {
        this._title = value;
    }

    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }
}

module.exports=Video;