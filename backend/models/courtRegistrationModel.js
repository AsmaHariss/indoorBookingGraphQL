const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courtRegistrationSchema = new Schema({
    //list of columns in db
    courtName:{ type: String, required: true },
    location: { type: String, required: true },
    sportName: { type: String, required: true },
    status: { type: String, required: true },
    userId: { type: String, required: true }
});

module.exports = mongoose.model('CourtRegistration', courtRegistrationSchema);

