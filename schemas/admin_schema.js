const mongoose = require("mongoose")


const add_admin_schema = new mongoose.Schema({

   discord_id: {type: String, require: true},
   name: { type: String, require: true, unique: false},

}, {
    versionKey: false
})


const model = mongoose.model("stream_admins", add_admin_schema);

module.exports = model

