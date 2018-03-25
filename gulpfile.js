'use strict';

var gulp =	require('gulp'),
		uglify = require('gulp-uglify'),
		sass = require('gulp-sass'),
		sourcemaps = require('gulp-sourcemaps'),
		rigger = require('gulp-rigger'),
		cssnano = require('gulp-cssnano'),
		imagemin = require('gulp-imagemin'),
		pngquant = require('imagemin-pngquant'),
		prettify = require('gulp-prettify'),
		changed = require('gulp-changed'),
		size = require('gulp-filesize'),
		ngmin = require('gulp-ng-annotate'),
		spritesmith = require('gulp.spritesmith'),
		svgSprite = require('gulp-svg-sprite'),
		imageResize = require('gulp-image-resize'),
		gm = require('gulp-gm'),
		gcmq = require('gulp-group-css-media-queries'),
		autoprefixer = require('gulp-autoprefixer'),
		rename = require('gulp-rename'),
		del = require('del'),
		plumber = require('gulp-plumber'),
		browserSync = require('browser-sync').create(),
		notify = require('gulp-notify'),
		runSequence = require('run-sequence'),
		fileinclude = require('gulp-file-include')
;

//--------------------------------------------------------//
// [TASK] TASK NAME HOOK																	//
//--------------------------------------------------------//
gulp.Gulp.prototype.__runTask = gulp.Gulp.prototype._runTask;
gulp.Gulp.prototype._runTask = function(task) {
	this.currentTask = task;
	this.__runTask(task);
}

gulp.task("someTask", function(){
	//Get current Task name
	console.log(this.currentTask.name)
});

//--------------------------------------------------------//
// [CFG] OPTIONS FOR TASK																	//
//--------------------------------------------------------//
var autoPrefixerOptions = {
	browsers: ['last 2 versions', '> 1%', 'Firefox ESR', 'ie > 8', 'safari 5', 'opera 12.1'],
	cascade: true,
}

var sassOptions = {
	outputStyle: 'nested',
	errLogToConsole: false,
	includePaths: './sass'
}

var plumberCfg = {
	errorHandler: 
		notify.onError({
			message:  "Error: <%= error.message %>",
		})
}

var spriteDefaultCfg = {
	imgName: 'sprite.png',
	cssName: '_sprite.scss',
	imgPath: '../img/sprite.png',
	padding: 5
}

var browserSyncCfg = {
	server: {
		baseDir: "./"
		// proxy: "projectName.dev"
	}
}
var cmqCfg = {
	log: true,
	use_external: true
}

var cssNanoCfg = {
	discardComments: {removeAll: true}
}

var htmlBuldCfg = {
	indent_with_tabs: true,
	indent_size: 2,
}

var spriteMithRetinaCfg = {
	imgName: 'sprite.png',
	cssName: '_sprite.scss',
	imgPath: '../img/sprite.png',
	retinaImgName: 'sprite@2x.png',
	retinaSrcFilter: ['img/sprite/retina/**/*_2x.png'],
	retinaImgPath: '../img/sprite@2x.png',
	padding: 5
}

var spriteSvgCfg = {
	"mode": {
		"css": {
			"spacing": {
				"padding": 5
			},
			"dest": "./",
			"layout": "horizontal",
			"sprite": "sprite-svg.svg",
			"bust": false,
			"render": {
				"scss": {
						"dest": "_sprite-svg.scss",
				}
			}
		}
	}
}

var imgResizeCfg = {
	width: '50%',
	height: '50%',
	crop: false,
	upscale: false
}

var svgSymbol = {
	mode: {
		view: {
			bust: false,
				// render: {
				// 	scss: true,
				// 	css: true,
				// }
		},
		symbol: true
	}
};

var fileIncludeCfg = {
				prefix: '@@',
				basepath: '@root'
			}

//--------------------------------------------------------//
// [PATH] RELATIVE PATH FOR TASKS													//
//--------------------------------------------------------//
var path = {

		// Пути, куда складывать готовые после сборки файлы
		build: { 
				html: './',
				js: 'htdocs/js/',
				css: 'css',
				img: 'htdocs/img/',
				fonts: 'htdocs/fonts/',
				pic: 'htdocs/pic/',
				root: 'htdocs/',
				svg: 'img/svg-sprite/'
		},

		// Пути откуда брать исходники
		src: { 
				html: 'template/**/*.html',
				js: 'js/*.js',
				style: 'css/**/*.css',
				img: 'img/*.*',
				spr: {
					default: 'img/sprite/default/**/*.png',
					svg: 		 'img/sprite/svg/**/*.svg',
					retina:  'img/sprite/retina/**/*.png',
					x3:  		 'img/sprite/x3/**/*.png',
				},      			
				fonts: 'fonts/**/*.*',
				pic: 'pic/**/*.*',
				sass: 'sass/**/*.scss*',
				template: 'template/block/*.html'
		},
		
		// Указываем, за изменением каких файлов мы хотим наблюдать
		watch: { 
				html: ['template/**/*.html', 'img/svg-sprite/symbol/svg/sprite.symbol.svg'],
				js: 'js/**/*.js',
				style: 'css/**/*.css',
				img: 'img/**/*.*',
				fonts: 'fonts/**/*.*',
				pic: 'pic/**/*.*',
				sass: ['sass/**/*.scss', '!sass/**/*~*', '!sass/**/*.TMP'],
				spr: {
					default: 'img/sprite/default/**/*.png',
					svg: 		 'img/sprite/svg/**/*.svg',
					retina:  'img/sprite/retina/2x/*.png',
				},
		},
		clean: './htdocs'
};

//--------------------------------------------------------//
// [HTML] RIGGER HTML FILES AND PRETTIFY THEM							//
//--------------------------------------------------------//
gulp.task('template:build', function () {
	runSequence('html:build', 'template:clear', function() {
		done();
	});
});

gulp.task('html:build', function () {
	var buildHTML =
		gulp.src(path.src.html)					
			.pipe(plumber(plumberCfg))
			.pipe(fileinclude(fileIncludeCfg))					
			.pipe(gulp.dest(path.build.html)) 

		gulp.src('src/favicon.ico')
			.pipe(gulp.dest(path.build.root));

	return buildHTML;
});

gulp.task('template:clear', function () {
	return del(['layout/', 'blocks/'])
});

//--------------------------------------------------------//
// [JS] MINIFY AND BUILD																	//
//--------------------------------------------------------//
gulp.task('js:build', function () {
	gulp.src(path.src.js)        					// Найдем наш main файл
		.pipe(rigger())             				// Прогоним через rigger
		.pipe(uglify())             				// Сожмем наш js
		.pipe(gulp.dest(path.build.js)); 		// Выплюнем готовый файл в build

	gulp.src('src/js/html5.js')
		.pipe(gulp.dest(path.build.js));
});

//--------------------------------------------------------//
// [CSS] MINIFY CSS AND BUILD IT													//
//--------------------------------------------------------//
gulp.task('style:build', function () {
	gulp.src(path.src.style) 							// Выберем наш main.css
		.pipe(cssnano(cssNanoCfg)) 					// Сожмем
		.pipe(gulp.dest(path.build.css)); 	// Пушим в билд
});

//--------------------------------------------------------//
// [IMAGES] MINIFY AND BUILD TASKS												//
//--------------------------------------------------------//
gulp.task('image:build', function () {
	gulp.src(path.src.img) 	//Выберем наши картинки
		.pipe(imagemin({ 			//Сожмем их
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()],
			interlaced: true
		}))
		.pipe(gulp.dest(path.build.img)); //И бросим в build

	gulp.src(path.src.pic) //Выберем наши картинки
		.pipe(imagemin({ //Сожмем их
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()],
			interlaced: true
		}))
		.pipe(gulp.dest(path.build.pic)); //И бросим в build
});

gulp.task('img:build', function () {
	gulp.src(path.src.img) //Выберем наши картинки
		.pipe(imagemin({ //Сожмем их
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()],
			interlaced: true
		}))
		.pipe(gulp.dest(path.build.img)); //И бросим в build
});

//--------------------------------------------------------//
// [IMAGES] PUSH FONTS IN BUILD FOLDER										//
//--------------------------------------------------------//
gulp.task('fonts:build', function() {
	gulp.src(path.src.fonts)
		.pipe(gulp.dest(path.build.fonts))
});

//--------------------------------------------------------//
// [MEDIA QUERY] SEPARATE TASK 														//
//--------------------------------------------------------//
// gulp.task('cmq', function() {
// 	gulp.src(path.src.style)
// 		.pipe(cmq(cmqCfg))
// 		.pipe(plumber(plumberCfg))
// 		.pipe(gulp.dest(path.build.css));
// });

gulp.task('gcmq', function () {
	gulp.src(path.src.style)
		.pipe(gcmq())
		.pipe(gulp.dest(path.build.css));
});

//--------------------------------------------------------//
// [SASS] COMPILE TASK 																		//
//--------------------------------------------------------//
gulp.task('sass:new', function() {
	gulp.src(path.src.sass)
	.pipe(plumber(plumberCfg))
	// .pipe(sourcemaps.init())									// Соурсмапы весят много, очень много (в сравнении с стилями),
	.pipe(sass(sassOptions))										// в идеале использовать их только если проект делали не вы
	.pipe(autoprefixer(autoPrefixerOptions))		// или проект делается несколькими людьми
	// .pipe(sourcemaps.write())
	.pipe(gulp.dest(path.build.css))
});

//--------------------------------------------------------//
// [SERVER] BROWSER SYNC TASK															//
//--------------------------------------------------------//
gulp.task('browser-sync', function() {
	browserSync.init([path.watch.js, path.watch.style, path.watch.html[0]], browserSyncCfg);
});

//--------------------------------------------------------//
// [SPRITES:RETINA] RETINA SPRITE													//
//--------------------------------------------------------//
gulp.task('sprite:retina', ['retina:resize'], function() {
	var spriteData = 
		gulp.src(path.src.spr.retina)
			.pipe(plumber(plumberCfg))
			.pipe(spritesmith(spriteMithRetinaCfg));
	spriteData.img.pipe(gulp.dest('./img/')); 
	spriteData.css.pipe(gulp.dest('./sass/'));

	return spriteData;
});

// [SPRITES:RETINA] RETINA SPRITE => CLEAN 1x FULDER
//--------------------------------------------------------//
gulp.task('clean:1x', function(cb) {
	return del('img/sprite/retina/1x/*.png')
});

// [SPRITES:RETINA] RETINA SPRITE => RESIZE 2x TO 1x
//--------------------------------------------------------//
gulp.task('retina:resize', ['clean:1x'], function(cb) {	
	var ret = gulp.src('img/sprite/retina/2x/*.png')
		.pipe(plumber(plumberCfg)) 		
		.pipe(rename(function (path){
			path.basename = path.basename.slice(0, -3);
		}))
		.pipe(imageResize(imgResizeCfg))
		.pipe(gulp.dest('img/sprite/retina/1x'));

	return ret;
});

//--------------------------------------------------------//
// [SPRITES:SVG] DEFAULT SVG SPRITE TASK									//
//--------------------------------------------------------//
gulp.task('sprite:svg', function() {
	gulp.src(path.src.spr.svg)
		.pipe(plumber(plumberCfg))
		.pipe(svgSprite(svgSymbol))
		.pipe(gulp.dest(path.build.svg));
});

//--------------------------------------------------------//
// [SPRITES:DEFAULT] DEFAULT SPRITE TASK									//
//--------------------------------------------------------//
gulp.task('sprite:default', function() {
	var spriteData = 
		gulp.src(path.src.spr.default, {read: false}) // Путь, откуда берем картинки для спрайта
			.pipe(plumber(plumberCfg)) 								// Отключаем падение таска при ошибке
			.pipe(spritesmith(spriteDefaultCfg))
		spriteData.img.pipe(gulp.dest('./img/')); 	// путь, куда сохраняем картинку
		spriteData.css.pipe(gulp.dest('./sass/')); 	// путь, куда сохраняем стили
	return spriteData;
});

//--------------------------------------------------------//
// [WATCH] MAIN WATCH TASK																//
//--------------------------------------------------------//
gulp.task('watch', ['browser-sync'], function() {
	gulp.watch(path.watch.sass, ['sass:new']);
	gulp.watch(path.watch.html, ['template:build']);
	gulp.watch(path.watch.spr.default, 	['sprite:default']);
	gulp.watch(path.watch.spr.retina, 	['sprite:retina']);
	gulp.watch(path.watch.spr.svg, 			['sprite:svg']);
});

//--------------------------------------------------------//
// [BUILD] MAIN BUILD TASK																//
//--------------------------------------------------------//
gulp.task('build', [
	'html:build',
	'js:build',
	'style:build',
	'fonts:build',
	'image:build'
]);


