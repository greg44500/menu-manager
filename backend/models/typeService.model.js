const mongoose = require('mongoose')

const TypeServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
})

module.exports = mongoose.model("TypeService", TypeServiceSchema);