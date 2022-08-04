import gulp from "gulp";
import { deleteSync } from "del";
import gpug from "gulp-pug";
import gimage from "gulp-image";
import minify from "gulp-csso";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import tailwindcss from "tailwindcss";
import postCss from "gulp-postcss";
import autoprefixer from "gulp-autoprefixer";
import ws from "gulp-webserver";
import bro from "gulp-bro";
import babelify from "babelify";
import { transform } from "@babel/core";

const sass = gulpSass(dartSass);

const routes = {
  pug: {
    watch: "src/**/*",
    src: "src/*.pug",
    dest: "build",
  },
  img: {
    src: "src/img/*",
    dest: "build/img",
  },
  css: {
    watch: "src/scss/*",
    src: "src/scss/style.scss",
    dest: "build/css",
  },
  js: {
    watch: "src/js/**/*.js",
    src: "src/js/main.js",
    dest: "build/js",
  },
};

const clean = async () => await deleteSync(["build/"]);

const pug = () =>
  gulp.src(routes.pug.src).pipe(gpug()).pipe(gulp.dest(routes.pug.dest));

const img = () =>
  gulp.src(routes.img.src).pipe(gimage()).pipe(gulp.dest(routes.img.dest));

const styles = () =>
  gulp
    .src(routes.css.src)
    .pipe(sass().on("error", sass.logError))
    .pipe(postCss([tailwindcss, autoprefixer]))
    .pipe(minify())
    .pipe(gulp.dest(routes.css.dest));

const js = () =>
  gulp
    .src(routes.js.src)
    .pipe(
      bro({
        transform: [
          babelify.configure({ presets: ["@babel/preset-env"] }),
          ["uglifyify", { global: true }],
        ],
      })
    )
    .pipe(gulp.dest(routes.js.dest));

const watch = () => {
  gulp.watch(routes.css.watch, styles);
  gulp.watch(routes.pug.watch, pug);
  gulp.watch(routes.pug.watch, styles);
  gulp.watch(routes.js.watch, js);
};

const webserver = () =>
  gulp.src("build").pipe(ws({ livereload: true, open: true }));

const prepare = gulp.series([clean, img]);

const assets = gulp.series([pug, styles, js]);

const live = gulp.parallel([webserver, watch]);

export const dev = gulp.series([prepare, assets, live]);
export const build = gulp.series([prepare, assets]);
