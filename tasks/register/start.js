module.exports = function (grunt) {
    grunt.registerTask('start', [
      'clean:ts', 'ts', 'concurrent:dev'
    ]);
};
