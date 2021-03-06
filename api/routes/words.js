var _ = require('lodash'),
  async = require('async'),
  Promise = require('bluebird');

module.exports = function(app) {

  var users = app.get('users'),
    words = app.get('words'),
    abortIfNotAuthenticated = app.get('abortIfNotAuthenticated');

  app.all('/words*?', function(req,res,next) {
    if(!abortIfNotAuthenticated(req, res)) return;
    next();
  });

  app.delete('/words/:word/?', function(req, res) {
    var userWords = req.session.userDocument.words,
        word = req.params.word,
        pos = userWords.indexOf(word);
    if(-1 !== pos) {
      userWords.splice(pos,1);
      res.send({success:true});
      return;
    }
    res.status(400).send({success:false});
  });

  app.get('/words/?', function(req, res) {

    app.get('auth')
      .getCurrentUserDocument() // DRY issue that doing this in every route
      .done(function (userDocument) {

        var userWords = _.clone(userDocument.words),
          wordnik = app.get('wordnik');
        // todo optimization/caching opportunity
        async.each(
          userWords,
          function(word, callback) {
            // For each user word, populate the word's definition
            wordnik.getWord(word.word)
              .then(function(wordDocument) {
                word.definition = wordDocument;
                callback();
              }, function (err) {
                // ...
                return Promise.reject();
              });
          },
          function() {
            res.send(userWords);
          }
        );

      }, function (err) { // DRY issue
        res.send({debug:err, error:"Failed loading user doc."});
        return Promise.reject();
      });

    return;

    var userWords = _.clone(req.session.userDocument.words);
    // todo optimization/caching opportunity
    async.each(
      userWords,
      // For each user word, populate the word's definition
      function(word, callback) {
        words.fetchWord(word.word, function(wordDocument) {
          word.definition = wordDocument;
          callback();
        });
      },
      // Respond with user words, now with populated definitions
      function() {
        res.send(userWords);
      }
    );
  });

  app.get('/words/:word/?', function(req, res) {
    app.get('wordnik')
      .getWord(req.params.word)
      .done(function (wordDocument) {
        res.send(wordDocument);
      }, function (err) {
        res.status(404).send({debug:err, error:"Failed to lookup word"});
        return Promise.reject();
      });
  });

  app.post('/words/?', function(req, res) {
    var userWords = req.session.userDocument.words,
      userDocument = req.session.userDocument,
      word = req.body.word,
      wordEntry = _.find(userWords, function(entry) { return entry.word == word; });
    words.fetchWord(word, function(wordDocument) {
      if(!wordDocument) {
        return res.status(404).send({error: 'No definitions found'});
      }
      if(undefined !== wordEntry) {
        return res.send(wordEntry); //??
      }
      wordEntry = {
        word: word,
        hits: 0,
        misses: 0,
        created: new Date,
        modified: new Date
      };
      userWords.push(wordEntry);
      users.userCollection.updateById(
        userDocument._id,
        {$push: {words: wordEntry}},
        {},
        function(err, result) {
          res.send(wordEntry);
        }
      );
    });
  });

};