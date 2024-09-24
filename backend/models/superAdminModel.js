const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const superAdminSchema = new Schema({
    //list of columns in db
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: {type:Number, required:true},
    email: { type: String, required: true},
    password: {type:String, required:true}
});

module.exports = mongoose.model('SuperAdmin', superAdminSchema);

