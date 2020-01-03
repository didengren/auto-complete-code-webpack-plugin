const recast = require("recast");

const initValAccordingType = require("../common/initValAccordingType");

const builder = recast.types.builders;

const paramsofActProp = (...idNames) => {
  return idNames.map((idName) => {
    idName = builder.property(
      "init",
      builder.identifier(idName),
      builder.identifier(idName)
    );
    idName.shorthand = true;
    return idName;
  });
};

/**
 * 构造state属性中的property
 * @param {Object} meta 元数据
 */
const constructStateProp = (meta) => {
  return builder.property(
    "init",
    builder.identifier(meta.arguments.state.name),
    initValAccordingType(meta.arguments.state.type)
  );
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

/**
 * 构造action的property
 * @param {Object} meta 元数据
 */
const constructActProp = (meta) => {
  const params = paramsofActProp("commit", "dispatch", "state");

  return builder.property(
    "init",
    builder.identifier(meta.arguments.actionName),
    builder.functionExpression(
      null,
      [builder.objectPattern([...params]), builder.identifier("params")],
      builder.blockStatement([])
    )
  );
};

// 修改store中各属性的方法集合
// 通过修改ast node 改变store中各属性的值
const fnList = {
  state(path, meta) {
    const node = path.node;
    const props = node.init.properties;
    if (props.length > 0) {
      for (let i = 0; i < props.length; i++) {
        if (
          meta.arguments.state &&
          props[i].key.name === meta.arguments.state.name
        ) {
          props[i] = constructStateProp(meta);
          path.replace(node);
          return;
        }
      }
    }
    const prop = constructStateProp(meta);
    props.push(prop);
    path.replace(node);
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
  },
  action(path, meta) {
    const node = path.node;
    const props = node.init.properties;
    if (props.length > 0) {
      for (let i = 0; i < props.length; i++) {
        if (
          meta.arguments.actionName &&
          props[i].key.name === meta.arguments.actionName
        ) {
          props[i] = constructActProp(meta);
          path.replace(node);
          return;
        }
      }
    }
    const prop = constructActProp(meta);
    props.push(prop);
    path.replace(node);
  }
};

module.exports = fnList;
