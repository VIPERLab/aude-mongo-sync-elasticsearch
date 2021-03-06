var config = require('./config.js');
var fs = require("fs");
var MongoClient = require('mongodb').MongoClient;
var ElasticsearchClient = require('elasticsearch').Client;

var url = 'mongodb://'+
  config.source_mongo.host +':'+ config.source_mongo.port +'/'+
  config.source_mongo.db+"?replicaSet=rs_nicovideo&connectTimeoutMS=8000000;socketTimeoutMS=8000000";
var elastic = new ElasticsearchClient({
  host:"localhost:9200"
});

MongoClient.connect(url, function(err, mongo) {
  if (err) {
    console.log('ERROR connecting to source MongodDB:', err);
  } else {
    console.log('Connected to source MongoDB');

    elastic.ping({requestTimeout: 5000}, function(err) {
      if (err) {
        console.log('ERROR pinging target Elasticsearch:', err);
        process.exit();
      } else {
        console.log('Connected to target Solr');
        start(mongo, elastic);
      }
    });
    process.on('exit', function() {
      mongo.close();
    })
  }
});

function start(mongo, elastic) {
  console.log('Starting import');
  var collection = mongo.collection(config.source_mongo.collection);

  function doBatch(i) {
    console.log('========================== BATCH:', i, '(size: '+ config.batch_size +')');
    collection.find({}, config.fields).skip(i * config.batch_size ).limit(config.batch_size).toArray(function(err, items) {
      if (err) {
        console.log('Error getting batch from Mongo:', err);
        process.exit();
      } else {
//        console.log(items);
        var results = [];
        for (var n = 0, l = items.length; n < l; n++) {
          results.push({index: {_index: "nicovideo", _type:"posts",_id:items[n]._id}});
	delete items[n]._id;
	          if (items[n].storage && items[n].storage.local && items[n].storage.local.progress) {
            items[n].storage.local.progress = parseInt(items[n].storage.local.progress);
          }

          if (items[n].storage && items[n].storage.google && items[n].storage.google.progress) {
            items[n].storage.google.progress = parseInt(items[n].storage.google.progress);
          }

          results.push(items[n]);
        }
        elastic.bulk({body: results}, function(err, resp) {
          if (err) {
            console.log('ERROR performing bulk insert:', err);
          }

	            for(var n = 0 , l = resp.items.length; n < l ; n++){

            console.log(resp.items[n].index.error);

//		if (typeof resp.items[n].index.error != undefined) {
        //      //写入文件aude_error.log
      //        var writerStream = fs.createWriteStream('aude_error.log');
    //          writerStream.write(resp.items[n].index.error,"UTF-8");
  //            writerStream.end();
//            }
          }

          doBatch(i + 1);
        });
      }
    });
  }
  doBatch(config.batch_start_from);
}
