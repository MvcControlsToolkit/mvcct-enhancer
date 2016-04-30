var gulp = require('gulp');
var closureCompiler = require('gulp-closure-compiler');

gulp.task('default', function() {
  return gulp.src(["mvcct.enhancer.js"], { base: "." })
    .pipe(closureCompiler({
      //compilerPath: 'node_modules/gulp-closure-compiler/node_modules/google-closure-compiler/compiler.jar',
      fileName: 'mvcct.enhancer.min.js',
      compilerFlags: {
        compilation_level: 'ADVANCED_OPTIMIZATIONS'
      }
    }))
    .pipe(gulp.dest('.'));
});