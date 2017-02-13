/**
 * Generate API documentation for rest services.
 */
module.exports = function(grunt) {

    grunt.config.set('apidoc', {
        service: {
            src: 'api/controllers/v1/',
            dest: 'apidoc/'
        }
    });

    grunt.loadNpmTasks('grunt-apidoc');
};
