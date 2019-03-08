const gulp = require('gulp')
const sass = require('gulp-sass')
const babel = require('gulp-babel')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const cleanCSS = require('gulp-clean-css')
const autoprefixer = require('gulp-autoprefixer')
const del = require('del')
const htmlmin = require('gulp-htmlmin')
const fileinclude = require('gulp-file-include') // 可以 include html 文件
const imagemin = require('gulp-imagemin') // 图片优化
const browserSync = require('browser-sync') // 保存自动刷新

const server = browserSync.create()

const paths = {
  styles: {
    src: 'src/styles/**/*.{css,sass,scss}',
    dest: 'assets/styles/'
  },
  scripts: {
    src: 'src/scripts/**/*.js',
    dest: 'assets/scripts/'
  },
  html: {
    src: 'src/**/*.html',
    dest: 'assets/'
  },
  images: {
    src: 'src/images/**/*.{jpg,jpeg,png,gif}',
    dest: 'assets/images'
  }
}

/* Not all tasks need to use streams, a gulpfile is just another node program
 * and you can use all packages available on npm, but it must return either a
 * Promise, a Stream or take a callback and call it
 */
function clean() {
  // You can use multiple globbing patterns as you would with `gulp.src`,
  // for example if you are using del 2.0 or above, return its promise
  return del(['assets'])
}

/*
 * Define our tasks using plain functions
 */
function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sass({
      outputStyle: 'expanded'
    }))
    .pipe(autoprefixer('last 6 version'))
    .pipe(gulp.dest('assets/sass'))
    .pipe(cleanCSS())
    // pass in options to the stream
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(concat('main.min.css'))
    .pipe(gulp.dest(paths.styles.dest))
}

function scripts() {
  return gulp.src(paths.scripts.src, { sourcemaps: true })
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(gulp.dest(paths.scripts.dest))
}

function html() {
  return gulp.src(paths.html.src)
    .pipe(fileinclude({
      prefix: '@@', // 变量前缀 @@include
      basepath: './src/_include', // 引用文件路径
      indent: true// 保留文件的缩进
    }))
    .pipe(htmlmin({ collapseWhitespace: true })) // 压缩html
    .pipe(gulp.dest(paths.html.dest))
}

function images() {
  return gulp.src(paths.images.src)
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true, multipass: true }))
  // 取值范围：0-7（优化等级）,是否无损压缩jpg图片，是否隔行扫描gif进行渲染，是否多次优化svg直到完全优化
    .pipe(gulp.dest(paths.images.dest))
}

function serve(done) {
  server.init({
    server: {
      baseDir: './assets'
    },
    open: 'external'
  })
  done()
}

function reload(done) {
  server.reload()
  done()
}

function watch() {
  gulp.watch(paths.scripts.src, gulp.series(scripts, reload))
  gulp.watch(paths.styles.src, gulp.series(styles, reload))
  gulp.watch(paths.html.src, gulp.series(html, reload))
  gulp.watch(paths.images.src, gulp.series(images, reload))
}

/*
 * Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
 */
const build = gulp.series(clean, gulp.parallel(styles, scripts, html, images), serve, watch)

/*
 * You can use CommonJS `exports` module notation to declare tasks
 */
exports.clean = clean
exports.styles = styles
exports.scripts = scripts
exports.watch = watch
exports.build = build
/*
 * Define default task that can be called by just running `gulp` from cli
 */
exports.default = build
