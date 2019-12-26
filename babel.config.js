const MIN_BABEL_VERSION = 7;

module.exports = (api) => {
  api.assertVersion(MIN_BABEL_VERSION);

  return {
    presets: [
      [
        "@babel/preset-env",
        {
          modules: false,
          useBuiltIns: "usage"
        }
        // {
        //   targets: {
        //     node: '10.15.3',
        //   },
        // }
      ]
    ]
  };
};
