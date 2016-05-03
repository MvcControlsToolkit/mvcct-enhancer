var gulp = require('gulp');
var closureCompiler = require('gulp-closure-compiler');

gulp.task('main:compile', function() {
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
gulp.task('input:basic:compile', function() {
  return gulp.src(["enhancer-modules/mvcct.enhancer.input.basic.js"], { base: "." })
    .pipe(closureCompiler({
      //compilerPath: 'node_modules/gulp-closure-compiler/node_modules/google-closure-compiler/compiler.jar',
      fileName: 'mvcct.enhancer.input.basic.min.js',
      compilerFlags: {
        compilation_level: 'ADVANCED_OPTIMIZATIONS'
      }
    }))
    .pipe(gulp.dest('./enhancer-modules'));
});
gulp.task("default", ["main:compile", "input:basic:compile"]);