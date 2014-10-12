module.exports = function(appInfo, https, xml2jsParser, nodeOnly)
{
  var goodreads = require('goodreads'),
    url = require('url'),
    grClient = new goodreads.client({ 'key': appInfo.key, 'secret': appInfo.secret }),
    grURLs = {

    },
    goodReadsCallQueue = [],
    goodReadsCallStates = {
      waiting: 0,
      active: 1
    },
    goodReadsCallState = goodReadsCallStates.waiting, // this can have one of three
    lastGoodReadsCallTime = 0,
    httpsOptions = {
      host: 'www.goodreads.com',
      port: 443
    },
    user,
    oauthToken,
    oauthTokenSecret;

  function setUser(_user) {
    user = _user;
  }

  function requestGoodReadsResource(path, callback) {
    var requestInfo = {
      "callback": callback,
      "path": path
    };

    goodReadsCallQueue.push(requestInfo);

    // good reads terms of use state that no more than one call per second can take place
    // if something is not happening then start the calls
    if(goodReadsCallQueue.length === 1 && goodReadsCallState === goodReadsCallStates.waiting) { // no call is happening
      makeGoodReadsCall();
    }
  }

  function makeGoodReadsCall () {
    console.log('makeGoodReadsCall');
    console.log('user.token: ' + user.token);
    goodReadsCallState = goodReadsCallStates.active;
    lastGoodReadsCallTime = new Date().getTime();
    var requestInfo = goodReadsCallQueue.shift();

    if (!user.token) {
      console.error("You didn't have the user log in first");
    }

    console.log('requestInfo.path: ' + requestInfo.path);
    https.get(
      requestInfo.path,
      user.token,
      user.tokenSecret,
      function(e, data, res){
        console.log('oauth call finished');
        if (e) console.errisLoggedInor(e);

        xml2jsParser.parseString(data, function(err, result){
        console.log('xml2jsParser finished');
          requestInfo.callback(result['GoodreadsResponse']);

          if(goodReadsCallQueue.length > 0) { // there is a call waiting to happen
            var numMillisecondsBetweenCalls = 1000,
              timeSinceLastCall = new Date().getTime() - lastGoodReadsCallTime;

            if(timeSinceLastCall > numMillisecondsBetweenCalls) {
              makeGoodReadsCall();
            } else {
              setTimeout(numMillisecondsBetweenCalls - timeSinceLastCall, makeGoodReadsCall)
            }
          } else {
            goodReadsCallState = goodReadsCallStates.waiting;
          }
        });
      }
    );
  }

  var isLoggedIn = function(req, res) {
    console.log('isLoggedIn');
    // console.log('user: ' + user);
    // if(typeof oauthToken !== 'undefined' && typeof oauthTokenSecret !== 'undefined') {
    //   res.send({ isLoggedIn: 'true'});
    // } else {
    //   login(req, res);
    // }
    res.send({ isLoggedIn: 'true'});
  };

  var getUserInfo = function(req, res) {
    console.log('getUserInfo');
    // https.get('https://www.goodreads.com/api/auth_user', oauthToken, oauthTokenSecret, function (e, data, res) {
    //   console.log(jsonData);
    //   if(nodeOnly === true) {
    //     res.render('userInfo', { response: jsonData });
    //     return;
    //   }

    //   res.send(jsonData);
    // });
    res.send(JSON.stringify(user));
    console.log('getUserInfo end');
  };

  var shelfInfo = function(req, res) {
    user = req.user;
    var pageNum = req.query.pageNum,
      shelfName = req.query.shelfName;

    requestGoodReadsResource('/review/list/' + req.user.id + '.xml?key=' + appInfo.key + '&page=' + pageNum + '&shelf=' + shelfName, function (jsonData) {
      if(nodeOnly === true) {
        res.render('shelfInfo', { response: jsonData, name: shelfName });
        return;
      }

      res.send(jsonData);
    });
  };

  var bookInfo = function(req, res) {
    user = req.user;
    var bookId = req.query.bookId;

    requestGoodReadsResource('/book/show/' + bookId + '.xml?key=' + appInfo.key, function (jsonData) {
      if(nodeOnly === true) {
        res.render('bookInfo', { response: jsonData });
        return;
      }

      res.send(jsonData);
    });
  };

  var seriesInfo = function (req, res) {
    user = req.user;
    var seriesId = req.query.seriesId;

    requestGoodReadsResource('/series/' + seriesId + '?key=' + appInfo.key, function (jsonData) {
      if(nodeOnly === true) {
        res.render('seriesInfo', { response: jsonData });
        return;
      }

      res.send(jsonData);
    });
  };

  var getSeriesToFinish = function (req, res) {
    user = req.user;
    requestGoodReadsResource('/series/' + seriesId + '?key=' + appInfo.key, function (jsonData) {

      res.send(jsonData);
    });
  };

  // var login = function (req, res) {
  //   console.log('login');
  //   grClient.requestToken(function(callback) {
  //     oauthToken = callback.oauthToken;
  //     oauthTokenSecret = callback.oauthTokenSecret;

  //     // getUserInfo();
  //     processCallBack(req, res);
  //   });
  // }

  // var processCallBack = function (req, res) {
  //   console.log('processCallBack');
  //   grClient.processCallback(oauthToken, oauthTokenSecret, true, function(callback) {
  //     console.log('callback: ' + JSON.stringify(callback));
  //     // oauthToken = callback.oauthToken;
  //     // oauthTokenSecret = callback.oauthTokenSecret;

  //     getUserInfo();
  //   });
  // }

  return {
    // ProcessCallBack: processCallBack,
    // Login: login,
    GetUserInfo: getUserInfo,
    ShelfInfo: shelfInfo,
    BookInfo: bookInfo,
    SeriesInfo: seriesInfo,
    GetSeriesToFinish: getSeriesToFinish,
    SetUser: setUser,
    IsLoggedIn: isLoggedIn
  };
};
