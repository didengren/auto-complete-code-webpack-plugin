/**
 * vuex状态管理套路代码生成
 */
import { createFileAndWrite, writeInFile } from "./generateCode";

const path = require("path");

const fs = require("fs");

const recast = require("recast");

/**
 * 拼接路径
 * @param {String} publicPath 子路径
 * @param {String} filePath 文件路径
 */
const piecedPath = (publicPath, filePath) =>
  path.posix.join(process.cwd(), publicPath, filePath);

export default {
  /**
   * 收集元数据并生成套路代码的调用方法
   * @param {Object} exprStatement
   * @param {Object} optItem
   */
  storehandler(exprStatement, optItem) {
    if (!optItem.publicPath) optItem.publicPath = "src/store";
    const meta = {
      arguments: null,
      path: piecedPath(optItem.publicPath, "index")
    };

    try {
      // obtain params as meta data from exprStatement.expression
      // 获取dispatch等方法的传参
      meta.arguments = exprStatement.expression.arguments.map((args) => {
        if (args.type === "Literal") return args.value;
        else if (args.type === "ObjectExpression")
          return recast.print(args).code;
        return void 0;
      });
      // 获取dispatch等方法头上的注释信息
      const codeStringContainAnnotation = recast.print(exprStatement).code;
      // /(?:^|\n|\r)\s*\/\*[\s\S]*?\*\/\s*(?:\r|\n|$)|(?:^|\n|\r)\s*\/\/.*(?:\r|\n|$)/
      const matchRes = codeStringContainAnnotation.match(
        /(?:^|\n|\r)\s*\/\*[\s\S]*?\*\/\s*(?:\r|\n|$)/
      );
      const trimRes = matchRes[0].replace(/\s+/g, "");
      const replaceRes = trimRes.replace(/\/\**/, "").replace(/\**\//, "");
      if (!~replaceRes.indexOf("store-path:")) return;
      const filePath = replaceRes.replace(/store-path:/, "");
      if (filePath === "") meta.path = piecedPath(optItem.publicPath, "index");
      else meta.path = piecedPath(optItem.publicPath, filePath);

      // 判断是否创建文件还是打开现有文件 写入套路代码
      fs.open(meta.path, "r+", (err) => {
        if (err && err.code === "ENOENT") createFileAndWrite(meta);
        else writeInFile(meta);
      });
    } catch (error) {
      console.error("auto-complete-code-webpack-plugin", error);
    }
  }
};
