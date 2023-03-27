const mongoose = require("mongoose")


const sent_embed_schema = new mongoose.Schema({

   name: {type: String, required: true, unique: true},
   channels: [{type: String, required: true}],
   embeds: [{type: String, required: true}]

}, {
    versionKey: false
})


const model = mongoose.model("embeds", sent_embed_schema );

module.exports = model

