const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const fs = require('fs');


const settings = {
  sourceMap: false,
  bundleAnalyze: false
}


// just html pages transfer
function generateHtmlPlugins(templateDir) {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
  return templateFiles.map(item => {
    const parts = item.split('.');
    const name = parts[0];
    const extension = parts[1];
    return new HtmlWebpackPlugin({
      filename: `${name}.html`,
      template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
      inject: false,
    });
  });
}
// just html pages transfer
const htmlPlugins = generateHtmlPlugins('./src/pages');

module.exports = (env, argv) => {
  return {
    entry: ['./src/common/js/main.js'],
    output: {
      filename: './assets/js/main.min.js',
      path: path.resolve(__dirname, 'dist'),
    },
    devtool: settings.sourceMap,
    stats: {
      assets: false,
      builtAt: false,
      children: false,
      entrypoints: false,
      hash: false,
      modules: true,
      version: false,
      errors: true
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          styles: {
            name: 'main',
            test: /\.(sass|scss)$/,
            chunks: 'all',
            enforce: true,
          },
        },
      },
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, 'dist')],
        cleanAfterEveryBuildPatterns: ['!assets/**/*'],
        verbose: true,
        dry: false
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'src/pages/index.pug',
        inject: false
      }),
      new MiniCssExtractPlugin({
        filename: './assets/css/[name].css',
      }),
      new CopyWebpackPlugin(
        [
          { from: './src/static', to: './assets' }
        ]
      ),
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: settings.bundleAnalyze,
      }),
      new BrowserSyncPlugin({
        server: {
          baseDir: 'dist',
          index: 'index.html'
        },
        open: false,
        online: true,
        tunnel: false,
        host: '192.168.1.14', // need PC local address (for mobile access)
        port: 3004,
        files: ['dist/*.html']
      }),
    ].concat(htmlPlugins),
    module: {
      rules: [
        {
          enforce: "pre",
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "eslint-loader",
          options: {
            configFile: path.resolve(__dirname, '.eslintrc')
          }
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "babel-loader",
          options: {
            'presets': ['@babel/preset-env']
          }
        },
        {
          test: /\.pug$/,
          oneOf: [
            {
              use: [
                "html-loader",
                "pug-html-loader"
              ]
            }
          ]
        },
        {
          test: /\.(sass|scss)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: argv.mode !== 'production'
              },
            },
            {
              loader: 'css-loader',
              options: {
                url: false
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [
                  autoprefixer({
                    overrideBrowserslist: ['ie >= 11', 'last 4 version']
                  })
                ]
              }
            },
            {
              loader: 'sass-loader',
            }
          ]
        },
      ]
    }
  };
};
