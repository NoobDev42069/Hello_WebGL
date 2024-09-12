const path = require('path');

module.exports = {
    mode:'development',
    entry:{
      WebGL :  './Chapter 1/src/index.js',
      // threejs : './src/Three_Test.js'
      WebGL2:'./Chapter 2/src/index.js'
    },
    output:{
        filename:'[name].bundle.js',
        path: path.resolve((__dirname,'dist'))
    }
}