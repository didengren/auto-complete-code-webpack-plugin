const recast = require("recast");

const TNT = recast.types.namedTypes;

/**
 * 节点处理
 * @param {*} path
 * @param {*} cb 处理回调
 */
const nodeHandler = function(path, cb) {
  cb(path);
  this.traverse(path);
};

/**
 * code string转化成ast树
 * @param {String} code 文件内容
 */
exports.codeToAst = (code) => recast.parse(code);

exports.parseAst = (ast, cb) => {
  return new Promise((resolve, reject) => {
    try {
      Promise.resolve(
        recast.visit(ast, {
          visitVariableDeclaration(path) {
            TNT.VariableDeclaration.assert(path.node);
            console.log(
              "\n------------- VariableDeclaration over ---------------\n"
            );
            nodeHandler.call(this, path, cb);
          },
          visitVariableDeclarator(path) {
            TNT.VariableDeclarator.assert(path.node);
            console.log(
              "\n------------- VariableDeclarator over ---------------\n"
            );
            nodeHandler.call(this, path, cb);
          },
          visitIdentifier(path) {
            TNT.Identifier.assert(path.node);
            console.log("\n------------- Identifier over ---------------\n");
            nodeHandler.call(this, path, cb);
          },
          visitArrowFunctionExpression(path) {
            TNT.ArrowFunctionExpression.assert(path.node);
            console.log(
              "\n------------- ArrowFunctionExpression over ---------------\n"
            );
            nodeHandler.call(this, path, cb);
          },
          visitFunctionExpression(path) {
            TNT.FunctionExpression.assert(path.node);
            console.log(
              "\n------------- FunctionExpression over ---------------\n"
            );
            nodeHandler.call(this, path, cb);
          },
          visitObjectExpression(path) {
            TNT.ObjectExpression.assert(path.node);
            console.log(
              "\n------------- ObjectExpression over ---------------\n"
            );
            nodeHandler.call(this, path, cb);
          },
          visitExportDefaultDeclaration(path) {
            TNT.ExportDefaultDeclaration.assert(path.node);
            console.log(
              "\n------------- ExportDefaultDeclaration over ---------------\n"
            );
            nodeHandler.call(this, path, cb);
          }
        })
      ).then(
        () => {
          resolve(ast);
        },
        (err) => {
          reject(err);
        }
      );
    } catch (error) {
      console.error("auto-complete-code-webpack-plugin", error);
    }
  });
};
