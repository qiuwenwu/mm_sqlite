const Sqlite = require('./index.js').Sqlite;

console.log('开始测试');
// // 测试Sqlite
// async function test() {
// 	var sql = new Sqlite();
// 	sql.open();
// 	var db = sql.db();
// 	db.table = "test3";

// 	var bl;
// 	bl = await db.addTable('test3', 'uid', 'int');
// 	console.log("添加表：" + bl);

// 	// bl = await db.field_del('uid', 'int');
// 	// console.log("删除字段：" + bl, db.error);
// 	// bl = await db.field_add('uid', 'int', true);
// 	// console.log("添加字段：" + bl, db.error);
// 	bl = await db.field_add('name', 'str');
// 	console.log("添加字段：" + bl, db.error);
// 	bl = await db.field_add('password', 'str');
// 	console.log("添加字段：" + bl, db.error);
// 	bl = await db.field_add('username', 'str');
// 	console.log("添加字段：" + bl, db.error);

// 	var addArr = [];
// 	for (var i = 1; i <= 9; i++) {
// 		var add = {
// 			name: "test" + i,
// 			username: "t" + i,
// 			password: "a" + i
// 		};
// 		addArr.push(add);
// 	}
// 	// db.addObj({
// 	// 	name: "test",
// 	// 	username: "t",
// 	// 	password: "a"
// 	// });
// 	var ret = await db.addList(addArr);
// 	console.log("添加：" + $.toJson(ret), db.error);
// 	if(!ret)
// 	{
// 		console.log(db.sql);
// 	}

// 	var setArr = [];
// 	for (var i = 1; i <= addArr.length; i++) {
// 		setArr.push({
// 			query: {
// 				name: "test" + i
// 			},
// 			item: {
// 				username: "username" + i,
// 				password: "password" + i
// 			}
// 		});
// 	}
// 	ret = await db.setList(setArr);
// 	console.log("修改：" + $.toJson(ret), db.error);

// 	var delArr = [];
// 	for (var i = 1; i <= addArr.length; i++) {
// 		if (i % 2 == 0) {
// 			delArr.push({
// 				query: {
// 					username: "username" + i
// 				}
// 			});
// 		}
// 	}
// 	ret = await db.delList(delArr);
// 	console.log("删除：" + $.toJson(ret), db.error);



// 	// ret = await db.get({ username: "username1" });
// 	// console.log("获取：" + $.toJson(ret,true), db.error);
// }

// test();

/**
 * 测试通过对象操作数据库
 */
async function testFM() {
	var sql = new Sqlite();
	sql.open();
	var db = sql.db();
	db.table = "test3";

	db.key = 'uid';
	var obj = await db.getObj({});
	console.log("获取：" + $.toJson(obj), db.error);

	obj.username = "张三";
	obj = await db.getObj({});
	console.log("获取：" + $.toJson(obj), db.error);
}

testFM();

/**
 * 测试新建数据库和表，如果已存在则只打开，不会再创建
 */
async function testNew() {
	var sql = new Sqlite();
	sql.setConfig({
		host: __dirname + '/db',
		database: 'test'
	})
	sql.open();
	var db = sql.db();
	var bl;
	bl = await db.addTable('test6', 'uid', 'int');
	console.log('创建：' + (bl == 1));
	console.log(await db.tables());
}
testNew();

// 
// async function testTable() {
// var sql = new Sqlite();
// sql.open();
// var db = sql.db();
// db.table = "test9";
// var bl;
// 	bl = await db.addTable('test6', 'uid', 'int');
// 	console.log("添加表" + bl, db.error);
// 	var arr = await db.tables('t*');
// 	console.log("获取表" + $.toJson(arr), db.error);
// 	var list = await db.fields('test');
// 	console.log("获取字段信息" + $.toJson(list), db.error);
// 	
// 	db.table = 'test';
// 	bl = await db.field_del('set6');
// 	console.log("删除字段" + bl, db.error);
// 	bl = await db.field_add('set6', 'str');
// 	console.log("添加字段" + bl, db.error);
// }
// 
// testTable();
