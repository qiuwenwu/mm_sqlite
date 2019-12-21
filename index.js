const resolve = require('path').resolve;
const sqlite3 = require('sqlite3').verbose();
const {
	DB
} = require('./db');

var pool = {};

/// 数据库封装
class Sqlite {
	/**
	 * @description 创建Redis帮助类函数 (构造函数)
	 * @param {String} scope 作用域
	 * @param {String} dir 当前路径
	 * @constructor
	 */
	constructor(scope, dir) {
		// 作用域
		this.scope;
		if (scope) {
			this.scope = scope;
		} else {
			this.scope = $.val.scope + '';
		}
		// 当前目录
		this.dir = __dirname;
		if (dir) {
			this.dir = dir;
		}
		// 错误提示
		this.error;
		/**
		 * sql语句
		 */
		this.sql = "";
		// 执行结果
		this.results = [];
		// 连接器
		this.conn;

		// 数据库配置参数
		this.config = {
			// 服务器地址
			host: "./db/".fullname(this.dir),
			// 数据库
			database: "mm"
		};

		// 唯一标识符
		this.identifier = resolve(this.config.host, this.config.database);

		// 定义当前类, 用于数据库实例化访问
		var $this = this;

		/**
		 * @description 查询sql
		 * @param {String} sql 查询参
		 * @param {Array} val 替换值
		 * @return {Promise|Array} 异步构造器, 当await时返回执行结果
		 */
		this.run = function(sql, val) {
			var _this = this;
			this.sql = sql;
			// 返回一个 Promise
			return new Promise((resolve, reject) => {
				$this.conn.all(sql, val, function(err, rows) {
					if (err) {
						// reject(err);
						_this.error = {
							code: err.errno,
							message: $.info(err).between('Error: ', ']')
						};
						resolve(rows);
					} else {
						_this.error = undefined;
						resolve(rows);
					}
				});
			});
		};

		/**
		 * @description 增删改sql
		 * @param {String} sql 查询参
		 * @param {Array} val 替换值
		 * @return {Promise|Array} 异步构造器, 当await时返回执行结果
		 */
		this.exec = function(sql) {
			var _this = this;
			this.sql = sql;
			// 返回一个 Promise
			return new Promise((resolve, reject) => {
				$this.conn.run(sql, function(err, rows) {
					if (err) {
						// reject(err);
						_this.error = {
							code: err.errno,
							message: $.info(err).between('Error: ', ']')
						};
						resolve(0);
					} else {
						_this.error = undefined;
						resolve(1);
					}
				});
			});
		};

		/**
		 * @description 获取数据库管理器
		 */
		this.db = function() {
			return new DB($this.config.database, $this.run, $this.exec);
		};
	}
}

/**
 * 设置配置参数
 * @param {Object} cg 配置对象或配置路径
 */
Sqlite.prototype.setConfig = function(cg) {
	var obj;
	if (typeof(cg) === "string") {
		obj = cg.loadJson(this.dir);
	} else {
		obj = cg;
	}
	$.push(this.config, obj);
	this.identifier = resolve(this.config.host, this.config.database);
};

/**
 * @description 打开数据库, 如果没有则建立数据库连接再打开
 */
Sqlite.prototype.open = function() {
	if (!pool[this.identifier]) {
		var file = resolve(this.config.host, this.config.database) + '.db';
		var _this = this;
		pool[this.identifier] = new sqlite3.Database(file, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
			function(err) {
				if (err) {
					_this.error = {
						code: err.errno,
						message: $.info(err).between('Error: ', ']')
					};
				} else {
					_this.error = undefined;
				}
			});
	}
	this.conn = pool[this.identifier];
};
/**
 * @description 关闭连接
 */
Sqlite.prototype.close = function() {
	if (pool[this.identifier]) {
		pool[this.identifier].close();
		pool[this.identifier] = null;
	}
};

exports.Sqlite = Sqlite;


/**
 * @description sqlite连接池
 */
if (!$.pool.sqlite) {
	$.pool.sqlite = {};
}
/**
 * @description sqlite管理器，用于创建缓存
 * @param {String} scope 作用域
 * @param {String} dir 当前路径
 * @return {Object} 返回一个缓存类
 */
function sqlite_admin(scope, dir) {
	if (!scope) {
		scope = $.val.scope
	}
	var obj = $.pool.sqlite[scope];
	if (!obj) {
		$.pool.sqlite[scope] = new Sqlite(scope, dir);
		obj = $.pool.sqlite[scope];
	}
	return obj;
}

/**
 * @module 导出sqlite管理器
 */
exports.sqlite_admin = sqlite_admin;
