var tsTransformer = require('react-native-typescript-transformer')
var rnTransformer = require('react-native/jest/preprocessor')
var generate = require('babel-generator')

var preprocessor = Object.assign({}, rnTransformer, {
  process (src, file) {
    const {ast} = tsTransformer.transform({
      filename: file,
      localPath: file,
      options: {
        dev: true,
        platform: '',
        projectRoot: '',
      },
      src,
    })

    return generate.default(ast, {
      filename: file,
      retainLines: true
    }, src)
  },
})

module.exports = preprocessor