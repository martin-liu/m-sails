/**
 * `watch`
 *
 * ---------------------------------------------------------------
 *
 * Run predefined tasks whenever watched file patterns are added, changed or deleted.
 *
 * Watch for changes on:
 * - files in the `assets` folder
 * - the `tasks/pipeline.js` file
 * and re-run the appropriate tasks.
 *
 * For usage docs see:
 *   https://github.com/gruntjs/grunt-contrib-watch
 *
 */
module.exports = function(grunt) {
  grunt.config.set('watch', {
    api: {
      files: ['api/**/*.ts', '!api/**/.#*.ts', '!api/**/*.d.ts'],
      tasks: ['ts'],
      options: {
        spawn: false
      }
    },
    assets: {

      // Assets to watch:
      files: ['assets/**/*', 'tasks/pipeline.js', '!**/node_modules/**'],

      // When assets are changed:
      tasks: ['syncAssets' , 'linkAssets' ]

    }
  });

  (function onlyCompileChangedFiles(){
    var changedTsFiles = {};

    var onChangeTs = grunt.util._.debounce(function () {
      var tsFiles = Object.keys(changedTsFiles);

      tsFiles = tsFiles.concat(['api/.baseDir.ts']);
      grunt.config('ts.api.files', [{src: tsFiles}]);

      changedTsFiles = Object.create(null);
    }, 50);

    grunt.event.on('watch', function (action, filepath) {
      if (filepath.endsWith('.ts')) {
        changedTsFiles[filepath] = action;
        onChangeTs();
      }
    });
  })();

  grunt.loadNpmTasks('grunt-contrib-watch');
};
