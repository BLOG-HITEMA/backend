const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const journalSchema = new Schema({
    title: {type:String, require:true},
    user: {type:mongoose.Types.ObjectId, require:true, ref: 'User'},
    articles: [
        {type:mongoose.Types.ObjectId, require:false, ref: 'Article'}
    ]
});


module.exports = mongoose.model('Journal', journalSchema);
