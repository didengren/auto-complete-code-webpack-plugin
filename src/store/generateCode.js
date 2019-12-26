// 根据元数据生成代码
const fs = require("fs");

const readFile = (fs, path) => {
  try {
    return fs.readFileSync(path, "utf-8");
  } catch (error) {
    console.error("auto-complete-code-webpack-plugin 读取文件错误", error);
  }
};

/**
 * 创建写入流并写入内容
 * @param {Object} meta 动态元信息
 */
export const createFileAndWrite = function(meta) {
  readFile(fs, meta.path);
  const ctxTpl = `const state = () => ({});

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
  // 全部写入内存后执行回调 阻塞
  fs.writeFileSync("./src/store/module/test.js", ctxTpl, (err) => {
    try {
      if (err) throw err;
      console.log("store module写入成功");
    } catch (error) {
      console.error("auto-complete-code-webpack-plugin", error);
    }
  });
};

export const writeInFile = function() {};
