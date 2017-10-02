var scrape = require("../scripts/scrape")
var makeDate = require("../scripts/date")

var Headline = require("../models/Headline")

module.exports = {
  fetch: function(cb) {
    scrape(function(data) {
      var articles = data;
      for (var i = 0; i < articles.length; i++) {
        articles[i].date = makeDate();
        articles[i].saved = false;
      }
      // Mongo function
      Headline.collection.insertMany(articles, {ordered:false}, function(err, docs) {
        // if there is an error, it will skip that articles
        cb(err, docs);
      });
    });
  },
  delete: function(query, cb) {
    Headline.remove(query, cb);
  },
  get: function(query, cb) {
    Headline.find(query)
    .sort({
      _id: -1
    })
    .exec(function(err, doc) {
      cb(doc);
    });
  },
  update: function(query, cb) {
    Headline.update({_id: query._id}, {
      $set: query
    }, {}, cb);
  }
}
