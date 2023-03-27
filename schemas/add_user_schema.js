const mongoose = require("mongoose")


const add_user_schema = new mongoose.Schema({

   discord_id: {type: String, require: true},
   name: { type: String, require: true, unique: false},
   live_status: {type: Boolean, default: false}
}, {
    versionKey: false
})


const model = mongoose.model("stream_members", add_user_schema);

module.exports = model

