module.exports = function(grunt) {

  grunt.config.set('node-inspector', {
    custom: {
      options: {
        'web-host': 'localhost',
        'web-port': 8081,
        'debug-port': 5858,
        'save-live-edit': true,
        'preload': false,
        'hidden': ['node_modules'],
        'stack-trace-limit': 4
      }
    }
  });

  grunt.loadNpmTasks('grunt-node-inspector');
};
