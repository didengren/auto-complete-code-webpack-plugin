// 根据元数据生成代码
const fs = require("fs");

const recast = require("recast");

const { readFile } = require("../common/fileAccessor");

const { codeToAst, parseAst } = require("../common/fileParser");

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
 * 根据类型返回属性值的node
 * @param builder recast.types.builders
 * @param t type of value for Property
 */
const obtainValNodeFromType = (builder, t) => {
  const keys = Object.keys(nodeStrategy);
  const reg = new RegExp(t, "i");
  for (let i = 0; i < keys.length; i++) {
    if (t.length === keys[i].length && reg.test(keys[i]))
      return nodeStrategy[keys[i]](builder);
  }
  return builder.literal(null);
};

/**
 * 添加Property node
 * @param props Properties node
 * @param k key of Property
 * @param t type of value for Property
 */
const addProp = (props, k, t) => {
  const builder = recast.types.builders;
  const prop = builder.property(
    "init",
    builder.identifier(k),
    obtainValNodeFromType(builder, t)
  );
  props.push(prop);
  return props;
};

// 修改store中各属性的方法集合
// 通过修改ast node 改变store中各属性的值
const fnList = {
  state(path, meta) {
    const node = path.node;
    if (meta.arguments.state && meta.arguments.state.name) {
      node.init.properties = addProp(
        node.init.properties,
        meta.arguments.state.name,
        meta.arguments.state.type
      );
      path.replace(node);
    }
  }
};

/**
 * 读取文件或获取outermostStruct字符串内容后的操作
 * @param {String} data code string
 * @param {Object} meta 元数据
 */
const callParser = (data, meta) => {
  // code string转化成ast树
  const ast = codeToAst(data);
  // 分析ast树 找到对应的node并修改
  parseAst(ast, function(path) {
    try {
      const node = path.node;
      if (node.type === "VariableDeclarator") {
        switch (node.id.name) {
          case "state":
            if (node.init.properties.length === 0) {
              fnList.state(path);
            }
            break;
          default:
            break;
        }
      }
    } catch (error) {
      console.error("auto-complete-code-webpack-plugin", error);
    }
  })
    .then(
      (res) => {
        // 修改好的ast转成code string 写入文件中
        const finalData = recast.print(res).code;
        fs.writeFileSync(meta.path, finalData, (err) => {
          if (err) throw err;
          console.log("store module写入成功");
        });
      },
      (err) => {
        throw err;
      }
    )
    .catch((error) => {
      console.error("auto-complete-code-webpack-plugin", error);
    });
};

// 生成文件时初始化的模板
const outermostStruct = `const state = {};

const mutations = {};

const actions = {};

const getters = {};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
`;

/**
 * 创建写入流并写入内容
 * @param {Object} meta 动态元信息
 */
exports.createFileAndWrite = async function(meta) {
  // convert code string to ast and analyze it,
  // then insert code to ast,
  // finally convert ast to code string.
  callParser(outermostStruct, meta);
};

/**
 * 在已存在的文件中写入内容
 * @param {Object} meta 动态元信息
 */
exports.writeInFile = function(meta) {
  // 读取文件
  readFile(meta.path, function(data) {
    callParser(data, meta);
  });
};
