const fs = require("fs");

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
  return null;
};

/**
 * 异步读取文件string
 * @param {String} 文件地址
 */
exports.readFile = (file, cb) => {
  fs.readFile(file, "utf-8", (err, data) => {
    try {
      if (err) throw err;
      const code = howGetJsCode(file, data);
      if (code) cb(code);
    } catch (error) {
      console.error("auto-complete-code-webpack-plugin", error);
    }
  });
};

/**
 * 同步读取文件string
 * @param {String} 文件地址
 */
exports.readFileSync = (file, cb) => {
  try {
    const data = fs.readFileSync(file, "utf-8");
    const code = howGetJsCode(file, data);
    if (code) cb(code);
  } catch (error) {
    console.error("auto-complete-code-webpack-plugin", error);
  }
};
