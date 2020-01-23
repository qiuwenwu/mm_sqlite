const Sql = require('mm_sql');

/**
 * @class 数据库操作类
 * @extends Sql
 */
class DB extends Sql {
	/**
	 * @description 数据库管理器
	 * @param {String} database 数据库名称
	 * @param {Object} run 查询函数
	 * @param {Object} exec 更改函数
	 */
	constructor(database, run, exec) {
		super(run, exec);

		// 数据库名
		this.database = database;
	}
}

/**
 * @description 批量添加数据
 * @param {Array} list 添加的对象组
 * @property {Promise|Number} 返回成功数 
 */
DB.prototype.addList = async function(list) {
	var bl_num = 0;
	var len = list.length;
	for (var i = 0; i < len; i++) {
		var bl = await this.addObj(list[i]);
		if(bl)
		{
			bl_num += 1;
		}
	}
	return bl_num;
};

/**
 * @description 获取所有表名
 * @param {String} table 表名关键词
 * @return {Promise|Array} 表名数组
 */
DB.prototype.tables = async function(table) {
	var list = await this.run("SELECT `name` FROM sqlite_master WHERE type='table';");
	if (table) {
		list = list.search(table, 'name');
	}
	return list.getArr('name');
};

/**
 * @description 获取所有表字段
 * @param {String} table 表名
 * @return {Promise|Array} 字段信息列表
 */
DB.prototype.fields = async function(table) {
	if (!table) {
		table = this.table;
	}
	var sql = "PRAGMA table_info(`{0}`);".replace('{0}', table);
	var list = await this.run(sql);
	var len = list.length;
	for (var i = 0; i < len; i++) {
		list[i].pk = list[i].pk ? true : false;
		list[i].notnull = list[i].notnull ? true : false;
	}
	return list;
};

/**
 * @description 设置类型
 * @param {String} type 类型名, 常用类型 mediumint, int, varchar
 * @param {Boolean} auto  是否自增字段 (默认为自增字段)
 * @return {String} 返回类型名
 */
DB.prototype.setType = function(type, auto) {
	if (!type) {
		type = 'int';
	}
	switch (type) {
		case "str":
		case "varchar":
		case "string":
			type = "varchar(255) NOT NULL";
			break;
		case "int":
		case "number":
			type = "integer NOT NULL";
			if (auto || auto === undefined) {
				type += " autoincrement";
			}
			break;
		case "bool":
		case "tinyint":
			type = "tinyint(1) NOT NULL";
			break;
		default:
			type += " NOT NULL";
			if (type.indexOf('int') !== -1) {
				if (auto || auto === undefined) {
					type += " autoincrement";
				}
			}
			break;
	}
	return type;
}

/**
 * @description 创建数据表
 * @param {String} table 表名
 * @param {String} field 主键字段名
 * @param {String} type  类型名 (string) 常用类型 mediumint, int, varchar
 * @param {Boolean} auto 是否自增字段, 默认为自增字段 
 * @return {Promise|Boolean} 执行结果
 */
DB.prototype.addTable = async function(table, field, type, auto) {
	if (!field) {
		field = "id";
	}
	var te = this.setType(type, auto).replace('NULL', 'NULL PRIMARY KEY');
	var sql = "CREATE TABLE IF NOT EXISTS `{0}` (`{1}` {2});".replace('{0}', table).replace('{1}',
		field).replace('{2}', te);
	return await this.exec(sql);
};

/**
 * @description 创建数据表
 * @param {String} field 字段名
 * @param {String} type  类型名 (string) 常用类型 mediumint, int, float, double, varchar, tinyint, text, date, datetime, time
 * @param {String|Number} isKey 默认值
 * @param {Boolean} isKey 是否主键
 * @return {Promise|Boolean} 添加成功返回true, 失败返回false
 */
DB.prototype.field_add = async function(field, type, value, isKey) {
	var sql =
		"select count(*) as `count` from sqlite_master where `type` = 'table' and `name` = '{0}' and `sql` like '%`{1}`%'";
	sql = sql.replace('{0}', this.table).replace('{1}', field);
	var arr = await this.run(sql);
	if (arr && arr.length > 0) {
		if (arr[0].count == 0) {
			var type = this.setType(type, false);
			if (value !== undefined) {
				if (typeof(value) == 'string') {
					type += " DEFAULT '" + value + "'";
				} else {
					type += " DEFAULT " + value;
				}
			} else if (type.has('varchar') || type.has('text')) {
				type = type.replace('NOT NULL', '');
			} else if (type.has('dateTime')) {
				type += " DEFAULT '1970-01-01 00:00:00'";
			} else if (type.has('date')) {
				type += " DEFAULT '1970-01-01'";
			} else if (type.has('time')) {
				type += " DEFAULT '00:00:00'";
			} else {
				type += " DEFAULT 0";
			}
			var sql = "ALTER Table `{0}` ADD `{1}` {2}".replace('{0}', this.table).replace('{1}', field).replace('{2}',
				type);
			if (isKey) {
				sql += ", ADD PRIMARY KEY (`{0}`)".replace('{0}', field);
			}
			return await this.exec(sql);
		}
	}
	return false;
};

/**
 * @description 删除字段
 * @param {String} field 字段名
 */
DB.prototype.field_del = async function(field) {
	var arr = await this.fields();
	if (arr && arr.length > 0 && arr.has({
			'name': field
		})) {
		var fields = ',' + arr.getArr('name').toStr(',') + ',';
		fields = fields.replace(',' + field + ',', ',').trim(',');
		await this.exec("drop table `mm_temp`");
		var sql = "create table `mm_temp` as select {0} from `{1}` where 1 = 1;".replace('{0}', fields).replace('{1}',
			this.table);
		var bl = await this.exec(sql);
		if (bl) {
			bl = await this.exec("drop table `{0}`".replace('{0}', this.table));
			if (bl) {
				bl = await this.exec("alter table `mm_temp` rename to `{0}`;".replace('{0}', this.table));
				if (bl) {
					this.error = undefined;
				}
			}
		} else {

		}
		return bl;
	}
	return false;
};

exports.DB = DB;
