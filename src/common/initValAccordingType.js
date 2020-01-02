const recast = require("recast");

const builder = recast.types.builders;

/**
 * 不同类型node生成策略
 * @param builder recast.types.builders
 */
const nodeStrategy = {
  Boolean: (b) => b.literal(false),
  String: (b) => b.literal(""),
  Object: (b) => b.objectExpression([]),
  Array: (b) => b.arrayExpression(null, [], b.blockStatement([])),
  Number: (b) => b.literal(0),
  Function: (b) => b.functionExpression(null, [], b.blockStatement([])),
  Null: (b) => b.literal(null),
  Undefined: (b) => b.identifier("undefined"),
  Symbol: (b) => b.callExpression(b.identifier("Symbol"), b.literal(0))
};

/**
 * 根据类型返回初始化node变量
 * @param {String} t type of value for Property
 */
const initValAccordingType = (t) => {
  const keys = Object.keys(nodeStrategy);
  const reg = new RegExp(t, "i");
  for (let i = 0; i < keys.length; i++) {
    if (t.length === keys[i].length && reg.test(keys[i]))
      return nodeStrategy[keys[i]](builder);
  }
  return builder.literal(null);
};

module.exports = initValAccordingType;
