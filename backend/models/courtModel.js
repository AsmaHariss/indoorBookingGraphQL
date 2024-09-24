const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courtSchema = new Schema({
    //list of columns in db
    name: { type: String, required: true },
    sportName: { type: String, required: true },
    location: { type: String, required: true }
});

module.exports = mongoose.model('Court', courtSchema);

