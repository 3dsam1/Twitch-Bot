const mongoose = require("mongoose")


const add_channel_schema = new mongoose.Schema({

   channel_id: {type: String, require: true}

}, {
    versionKey: false
})


const model = mongoose.model("channel_list", add_channel_schema);

module.exports = model

