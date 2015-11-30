var gulp = require('gulp')
  , minimist = require('minimist')
  , babel = require('gulp-babel')

var argv = minimist(process.argv.slice(2))

gulp.task('build', () => {
  return gulp.src('src/**/*.js')
    .pipe(babel({
      presets: ['stage-0', 'es2015'],
      plugins: ['babel-plugin-transform-runtime']
    }))
    .pipe(gulp.dest('lib'))
})
