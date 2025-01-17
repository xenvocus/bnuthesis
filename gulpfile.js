const argv = require('minimist')(process.argv.slice(2));
const path = require('path');
const gulp = require('gulp');
const log = require('fancy-log');
const color = require('ansi-colors');
const del = require('del');
const zip = require('gulp-zip');

const packageName = 'bnuthesis';

const config = {
    template: {
        files: [
                "LICENSE",
                'README.md',
                'CHANGELOG.md',
                'bnuthesis.dtx',
                'bnuthesis.ins',
                'tsinghua-name-bachelor.pdf',
                'bnuthesis-*.bst',
                'bnuthesis-*.bbx',
                'bnuthesis-*.cbx',
                'Makefile',
                'latexmkrc',
                'bnuthesis.pdf'
            ],
        // generated should not be included for ctan archive
        generated: ['bnuthesis.cls']
    },

    example: {
        files: ['bnuthesis-example.tex',
                'spine.tex',
                'bnuthesis-example.pdf',
                'spine.pdf',
                'bnusetup.tex',
                'data/*.tex',
                'figures/*.*',
                'ref/*.bib']
    },

    dist: {
        root: './dist',
        files: [],
        build: '',
        zip: ''
    },
};

function usage() {
    log('Usage:');
    log('\t make dist version=x.y.z');
}

function _default(callback) {
    usage();

    callback();
}

function bootstrap(callback) {
    if (!argv.hasOwnProperty('version')) {
        usage();

        process.exit(1);
    }

    callback();
}

function cleanup(callback) {
    del.sync([path.join(config.dist.root, config.dist.build)]);

    log(color.green.bold(`🍺 ${config.dist.zip} generated`));

    callback();
}

function copy(callback) {
    const src = config.dist.files;
    const dest = path.join(config.dist.root, config.dist.build);

    return gulp.src(src, {
        cwdbase: true
    })
        .pipe(gulp.dest(dest));
}

function compress(callback) {
    const src = path.join(config.dist.build, '**/*');

    return gulp.src(src, {
        cwd: config.dist.root,
        cwdbase: true
    })
        .pipe(zip(config.dist.zip))
        .pipe(gulp.dest(config.dist.root));
}

function init_self(callback) {
    config.dist.files = [...config.template.files, ...config.example.files, ...config.template.generated];
    config.dist.build = `${packageName}-v${argv.version}`;
    config.dist.zip = `${config.dist.build}.zip`;

    log(`Removing old ${config.dist.build}...`);
    del.sync([path.join(config.dist.root, config.dist.build),
              path.join(config.dist.root, config.dist.zip)]);

    callback();
}

function init_ctan(callback) {
    config.dist.files = [...config.template.files, ...config.example.files];
    config.dist.build = `${packageName}`;
    config.dist.zip = `${config.dist.build}.zip`;

    log(`Removing old ${config.dist.build}...`);
    del.sync([path.join(config.dist.root, config.dist.build),
              path.join(config.dist.root, config.dist.zip)]);

    callback();
}

const build_self = gulp.series(init_self, copy, compress, cleanup);
const build_ctan = gulp.series(init_ctan, copy, compress, cleanup);

const build = gulp.series(bootstrap, build_self);

exports.default = _default;
exports.build = build;
