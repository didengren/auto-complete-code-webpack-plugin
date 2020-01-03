/**
 * vuex状态管理套路代码生成
 */

const path = require("path");

const fs = require("fs");

const recast = require("recast");

const {
  createFileAndWrite,
  writeInFile
} = require("./writeAccordingToMetadata");

/**
 * 拼接路径
 * @param {String} publicPath 子路径
 * @param {String} filePath 文件路径
 */
const piecedPath = (publicPath, filePath) =>
  path.posix.join(process.cwd(), publicPath, filePath + ".js");

/**
 * 收集元数据并生成套路代码的调用方法
 * @param {Object} exprStatement
 * @param {Object} optItem
 */
module.exports = (exprStatement, optItem, newFilePathArr) => {
  if (!optItem.publicPath) optItem.publicPath = "src/store";
  const meta = {
    arguments: {},
    path: ""
  };

  try {
    // obtain params as meta data from exprStatement.expression
    // 获取方法名(e.g. dispatch)
    meta.arguments.fnName =
      exprStatement.expression.callee.name ||
      exprStatement.expression.callee.property.name;

    // 获取文件路径
    meta.path = piecedPath(optItem.publicPath, "index");

    const args = exprStatement.expression.arguments;
    for (let i = 0; i < args.length; i++) {
      if (args[i].type === "Literal") {
        const posArr = args[i].value.split("/");
        // 获取文件路径
        if (posArr.length > 1) {
          const posArrFB = posArr.concat();
          posArrFB.pop();
          const filePath = posArrFB.join("/");
          meta.path = piecedPath(optItem.publicPath, "module/" + filePath);
        }

        // 获取mutation、action等属性名
        const namedToWho = posArr[posArr.length - 1];
        switch (meta.arguments.fnName) {
          case "commit":
            meta.arguments.mutationName = namedToWho;
            meta.nodeIdName = "mutations";
            break;
          case "dispatch":
            meta.arguments.actionName = namedToWho;
            meta.nodeIdName = "actions";
            break;
          case "preDispatch":
            meta.arguments.actionName = namedToWho;
            meta.nodeIdName = "actions";
            break;
          default:
            break;
        }
      } else if (args[i].type === "ObjectExpression") {
        // 获取存到vuex的数据
        meta.arguments.data = recast.print(args[i]).code;
      }
    }

    // 获取dispatch等方法头上的注释信息 e.g. state值的类型
    const codeStringContainAnnotation = recast.print(exprStatement).code;
    // /(?:^|\n|\r)\s*\/\*[\s\S]*?\*\/\s*(?:\r|\n|$)|(?:^|\n|\r)\s*\/\/.*(?:\r|\n|$)/
    const matchRes = codeStringContainAnnotation.match(
      /(?:^|\n|\r)\s*\/\*[\s\S]*?\*\/\s*(?:\r|\n|$)/
    );
    const trimRes = matchRes[0].replace(/\s+/g, "");
    const replaceRes = trimRes.replace(/\/\**/, "").replace(/\*+\//, "");
    if (!~replaceRes.indexOf("store")) return;
    /** 此处因注释形式待商榷，暂为临时解决方案 ***************************************************/
    if (replaceRes === "store") meta.arguments.state = null;
    else {
      const stateKV = replaceRes.replace(/store-/, "");
      const stateKVArr = stateKV.split("-");
      if (stateKVArr.length === 2) {
        meta.arguments.state = {
          name: stateKVArr[0],
          type: stateKVArr[1]
        };
      }
    }
    /** 此处因注释形式待商榷，暂为临时解决方案 over ***************************************************/

    // 判断是否创建文件还是打开现有文件 写入套路代码
    /**
     * meta e.g.
     * {
     *   nodeIdName: actions,
     *   arguments: {
     *     fnName: 'dispatch',
     *     actionName: 'CHANGE_SUB_BTN',
     *     data: '{ data: true }',
     *     state: {
     *       name: 'test',
     *       type: '{}'
     *     }
     *   },
     *   path: '/Users/xunianzu/work_space/trina/gold-medal-butler/src/store/amAdd'
     * }
     */
    newFilePathArr.push(meta.path);
    fs.open(meta.path, "r+", (err) => {
      if (err && err.code === "ENOENT") createFileAndWrite(meta);
      else writeInFile(meta);
    });
  } catch (error) {
    console.error("auto-complete-code-webpack-plugin", error);
  }
};
