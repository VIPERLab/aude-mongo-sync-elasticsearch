# MongoSyncElasticsearch
mongo-connector 使用的时候有bug,所以自己实现了一个用来实现 mongodb 和 elasticsearch 数据同步和增量更新的小程序


# 说明

- ```MongodbSyncElasticsearch-all```
这个文件夹是用来实现全量复制,使用的字段是_id


- ```MongodbSyncElasticsearch-increment```
这个文件夹用来实现增量更新,使用的字段是lastget_at


- 注意:你可以根据你的数据结构来修改代码(非常简单)


- 分成两个部分,是因为数据量太大,如果用```MongodbSyncElasticsearch-all```来实现增量更新,那么就会非常消耗资源以及会很慢,所以就换了一个字段,并且实现了本地文件的写入和读取


# 希望对你有用:)
- 有问题可以 audestick#gmail 或直接提 issue
