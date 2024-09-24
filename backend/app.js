const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema/schema.js');
const mongoose = require('mongoose');

const app = express();
//db name => indoorBookingGraphLQ
mongoose.connect('mongodb://127.0.0.1:27017/indoorBookingGraphLQ');
mongoose.connection.once('open', ()=> {

}); console.log('connected to mongo');

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true, 
}));

app.listen(4000, () => {
    console.log('Server running on port 4000');
});
