const recast = require("recast");

const initValAccordingType = require("../common/initValAccordingType");

const builder = recast.types.builders;

/**
 * 添加Property node
 * @param props Properties node
 * @param {String} k key of Property
 * @param {String} t type of value for Property
 */
const constructStateProp = (props, k, t) => {
  const prop = builder.property(
    "init",
    builder.identifier(k),
    initValAccordingType(t)
  );
  props.push(prop);
  return props;
};

/**
 * 构造mutation的property
 * @param {Object} meta 元数据
 */
const constructMutProp = (meta) => {
  return builder.property(
    "init",
    builder.identifier(meta.arguments.mutationName),
    builder.functionExpression(
      null,
      [builder.identifier("state"), builder.identifier("data")],
      builder.blockStatement(
        meta.arguments.state && meta.arguments.state.name
          ? [
              builder.expressionStatement(
                builder.assignmentExpression(
                  "=",
                  builder.memberExpression(
                    builder.identifier("state"),
                    builder.identifier(meta.arguments.state.name)
                  ),
                  builder.identifier("data")
                )
              )
            ]
          : []
      )
    )
  );
};

// 修改store中各属性的方法集合
// 通过修改ast node 改变store中各属性的值
const fnList = {
  state(path, meta) {
    const node = path.node;
    if (meta.arguments.state && meta.arguments.state.name) {
      node.init.properties = constructStateProp(
        node.init.properties,
        meta.arguments.state.name,
        meta.arguments.state.type
      );
      path.replace(node);
    }
  },
  mutation(path, meta) {
    const node = path.node;
    const props = node.init.properties;
    if (props.length > 0) {
      for (let i = 0; i < props.length; i++) {
        if (
          meta.arguments.mutationName &&
          props[i].key.name === meta.arguments.mutationName
        ) {
          props[i] = constructMutProp(meta);
          path.replace(node);
          return;
        }
      }
    }
    // 如果是新的字段就push到末尾
    // 如果node.init.properties是空就push到末尾
    const prop = constructMutProp(meta);
    props.push(prop);
    path.replace(node);
  }
};

module.exports = fnList;
