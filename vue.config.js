module.exports = {
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimizer[0].options.uglifyOptions = Object.assign(
        {},
        config.optimization.minimizer[0].options.uglifyOptions,
        {
          ecma: 5,
          compress: {
            keep_fnames: true,
          },
          warnings: false,
          mangle: {
            keep_fnames: true,
          },
        },
      );
    }
  },
};