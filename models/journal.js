const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const journalSchema = new Schema({
    title: {type:String, require:true},
    user: {type:mongoose.Types.ObjectId, require:true, ref: 'User'},
    articles: [
        {type:mongoose.Types.ObjectId, require:false, ref: 'Article'}
    ]
});

journalSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Journal', journalSchema);
