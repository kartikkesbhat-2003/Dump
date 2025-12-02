const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
    mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology:true,
    })
    .then(() => console.info("DB Connected Successfully"))
    .catch( (error) => {
        console.error("DB Connection Failed", error);
        process.exit(1);
    } )
};