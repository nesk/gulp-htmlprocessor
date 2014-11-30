'use strict';

var assert = require('assert'),
    gulp = require('gulp'),
    through = require('through2'),
    fs = require('fs'),
    Q = require('q'),
    htmlprocessor = require('../index');

describe('gulp-htmlprocessor in buffer mode', function() {

    it('should process and output an html file as defined by the build special comments for dev target', function(done) {
        gulp.src('test/fixtures/index.html')
            .pipe(htmlprocessor({
                data: {
                    message: 'This is dev target'
                },
                environment: 'dev'
            }))
            .pipe(through.obj(function(file, enc) {
                var actual = file.contents.toString(enc),
                    expected = fs.readFileSync('test/expected/dev/index.html').toString('utf-8');

                assert.equal(actual, expected);
                done();
            }));
    });

    it('should process and output an html file as defined by the build special comments for dist target', function(done) {
        gulp.src('test/fixtures/index.html')
            .pipe(htmlprocessor({
                data: {
                    message: 'This is dist target'
                },
                environment: 'dist'
            }))
            .pipe(through.obj(function(file, enc) {
                var actual = file.contents.toString(enc),
                    expected = fs.readFileSync('test/expected/dist/index.html').toString('utf-8');

                assert.equal(actual, expected);
                done();
            }));
    });

    it('should be able to process a template with custom delimiters', function(done) {
        gulp.src('test/fixtures/custom.html')
            .pipe(htmlprocessor({
                data: {
                    message: 'This has custom delimiters for the template'
                },
                environment: 'dist',
                templateSettings: {
                    interpolate: /{{([\s\S]+?)}}/g
                }
            }))
            .pipe(through.obj(function(file, enc) {
                var actual = file.contents.toString(enc),
                    expected = fs.readFileSync('test/expected/custom/custom.html').toString('utf-8');

                assert.equal(actual, expected);
                done();
            }));
    });

    it('should process and output an html file as defined by the build special comments for marker target', function(done) {
        gulp.src('test/fixtures/commentMarker.html')
            .pipe(htmlprocessor({
                data: {
                    message: 'This uses a custom comment marker',
                },
                commentMarker: 'process',
                environment: 'marker'
            }))
            .pipe(through.obj(function(file, enc) {
                var actual = file.contents.toString(enc),
                    expected = fs.readFileSync('test/expected/commentMarker/commentMarker.html').toString('utf-8');

                assert.equal(actual, expected);
                done();
            }));
    });

    it('should remove build comments for non-targets', function(done) {
        gulp.src('test/fixtures/strip.html')
            .pipe(htmlprocessor({
                strip: true
            }))
            .pipe(through.obj(function(file, enc) {
                var actual = file.contents.toString(enc),
                    expected = fs.readFileSync('test/expected/strip/strip.html').toString('utf-8');

                assert.equal(actual, expected);
                done();
            }));
    });

    it('parse comment block defining multiple targets', function(done) {
        var deferred1 = Q.defer(),
            deferred2 = Q.defer(),
            deferred3 = Q.defer();

        gulp.src('test/fixtures/multiple.html')
            .pipe(htmlprocessor({
                environment: 'mult_one'
            }))
            .pipe(through.obj(function(file, enc) {
                var actual = file.contents.toString(enc),
                    expected = fs.readFileSync('test/expected/multiple/mult_one.html').toString('utf-8');

                try {
                    assert.equal(actual, expected);
                } catch(e) {
                    deferred1.reject(e);
                }

                deferred1.resolve();
            }));

        gulp.src('test/fixtures/multiple.html')
            .pipe(htmlprocessor({
                environment: 'mult_two'
            }))
            .pipe(through.obj(function(file, enc) {
                var actual = file.contents.toString(enc),
                    expected = fs.readFileSync('test/expected/multiple/mult_two.html').toString('utf-8');

                try {
                    assert.equal(actual, expected);
                } catch(e) {
                    deferred2.reject(e);
                }

                deferred2.resolve();
            }));

        gulp.src('test/fixtures/multiple.html')
            .pipe(htmlprocessor({
                environment: 'mult_three'
            }))
            .pipe(through.obj(function(file, enc) {
                var actual = file.contents.toString(enc),
                    expected = fs.readFileSync('test/expected/multiple/mult_three.html').toString('utf-8');

                try {
                    assert.equal(actual, expected);
                } catch(e) {
                    deferred3.reject(e);
                }

                deferred3.resolve();
            }));

        Q.all([
            deferred1.promise,
            deferred2.promise,
            deferred3.promise
        ]).then(function() {
            done();
        }, function(error) {
            done(error);
        });
    });

    it('include a js file', function(done) {
        gulp.src('test/fixtures/include.html')
            .pipe(htmlprocessor(''))
            .pipe(through.obj(function(file, enc) {
                var actual = file.contents.toString(enc),
                    expected = fs.readFileSync('test/expected/include/include.html').toString('utf-8');

                assert.equal(actual, expected);
                done();
            }));
    });

    it('correctly parse build comments inside conditional ie statement', function(done) {
        gulp.src('test/fixtures/conditional_ie.html')
            .pipe(htmlprocessor(''))
            .pipe(through.obj(function(file, enc) {
                var actual = file.contents.toString(enc),
                    expected = fs.readFileSync('test/expected/conditional_ie/conditional_ie.html').toString('utf-8');

                assert.equal(actual, expected);
                done();
            }));
    });

    it('recursively process included files', function(done) {
        gulp.src('test/fixtures/recursive.html')
            .pipe(htmlprocessor({
                recursive: true
            }))
            .pipe(through.obj(function(file, enc) {
                var actual = file.contents.toString(enc),
                    expected = fs.readFileSync('test/expected/recursive/recursive.html').toString('utf-8');

                assert.equal(actual, expected);
                done();
            }));
    });

    it('define custom block types', function(done) {
        gulp.src('test/fixtures/custom_blocktype.html')
            .pipe(htmlprocessor({
                customBlockTypes: ['test/fixtures/custom_blocktype.js']
            }))
            .pipe(through.obj(function(file, enc) {
                var actual = file.contents.toString(enc),
                    expected = fs.readFileSync('test/expected/custom_blocktype/custom_blocktype.html').toString('utf-8');

                assert.equal(actual, expected);
                done();
            }));
    });

});
