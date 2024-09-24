const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    //list of columns in db
    // time format => 13:20:12
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    sportName: { type: String, required: true },
    status: { type: String, required: true },
    userId: { type: String, required: true },
    courtId: { type: String, required: true }
});

module.exports = mongoose.model('Booking', bookingSchema);

