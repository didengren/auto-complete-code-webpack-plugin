const fs = require("fs");

const recast = require("recast");

const storehandler = require("./store");

const onWatch = function(compiler, name, hook) {
  // webpack >= 4.0.0
  if (compiler.hooks) compiler.hooks.watchRun.tapAsync(name, hook);
  // webpack < 4.0.0
  else compiler.plugin("watch-run", hook);
};

/**
 * 过滤出文件中的js代码
 * @param {String} file 文件路径
 * @param {String} data 文件内容字符串
 * @returns {String} js代码字符串
 */
const howGetJsCode = function(file, data) {
  if (~file.indexOf(".vue")) {
    const start = data.search(/<script.*?>/i);
    const end = data.search(/<\/script>/i);
    return data.slice(start, end).replace(/<script.*?>/i, "");
  } else if (~file.indexOf(".js") || ~file.indexOf(".ts")) return data;
  return "";
};

/**
 * 解析es module的ast获取关键代码
 * @param {Object} prop declaration.properties数组里的元素
 * @param {Array} opts 插件参数
 */
const astParserForESM = function(prop, opts = []) {
  if (prop.value.type === "ObjectExpression") {
    prop.value.properties.forEach((propItem) => {
      // console.log("ObjectExpression");
      // console.log(`prop.value.properties...propItem${i}_____ `, propItem.value);
      if (propItem.value.type === "FunctionExpression")
        astParserForESM(propItem);
    });
  }
  if (prop.value.type === "FunctionExpression") {
    // console.log("FunctionExpression_____", prop.value.params, prop.value.body);
    if (prop.value.body.type === "BlockStatement") {
      prop.value.body.body.forEach((exprStatement) => {
        if (exprStatement.type === "ExpressionStatement") {
          // console.log("ExpressionStatement______", exprStatement.expression);
          // 有不同的expression e.g. AssignmentExpression CallExpression
          if (exprStatement.expression.type === "CallExpression") {
            if (
              (exprStatement.expression.callee.type === "Identifier" &&
                exprStatement.expression.callee.name === opts.funcName) ||
              (exprStatement.expression.callee.type === "MemberExpression" &&
                exprStatement.expression.callee.property.name === opts.funcName)
            ) {
              if (opts.length === 0) return;
              opts.forEach((optItem) => {
                try {
                  if (optItem.module) {
                    switch (optItem.module) {
                      case "store":
                        storehandler(exprStatement, optItem);
                        break;
                      default:
                        break;
                    }
                  } else throw new Error("传参错误 module字段不存在");
                } catch (error) {
                  console.error("auto-complete-code-webpack-plugin", error);
                }
              });
            }
          }
        }
      });
    }
  }
};

function AutoCompleteCodeWebpackPlugin(options = []) {
  this.options = options;
}
AutoCompleteCodeWebpackPlugin.prototype.apply = function(compiler) {
  const that = this;
  onWatch(compiler, "auto-complete-code-webpack-plugin", function(
    compiler,
    cb
  ) {
    const changedTimes = compiler.watchFileSystem.watcher.mtimes;
    const changedFiles = Object.keys(changedTimes);
    if (changedFiles instanceof Array && changedFiles.length > 0) {
      changedFiles.forEach((file) => {
        fs.readFile(file, "utf-8", (err, data) => {
          if (err) throw err;
          const code = howGetJsCode(file, data);
          if (code) {
            const ast = recast.parse(code);
            ast.program.body.forEach((item) => {
              if (item.type === "ExportDefaultDeclaration") {
                item.declaration &&
                  item.declaration.properties.forEach((item) => {
                    astParserForESM(item, that.options);
                  });
              }
            });
          }
        });
      });
    }
    cb && cb();
  });
};

module.exports = AutoCompleteCodeWebpackPlugin;
