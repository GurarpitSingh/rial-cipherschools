const mongoose = require('mongoose');

mongoose.set("strictQuery", false);
mongoose.connect('mongodb+srv://sgurarpit:gurarpitsingh@cluster0.mb8t4k0.mongodb.net/?retryWrites=true&w=majority',() => {
    console.log("Connected to DB")
})

