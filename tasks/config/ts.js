/**
 * Compile TS files to JS.
 *
 * @see https://github.com/TypeStrong/grunt-ts
 */
module.exports = function(grunt) {
  grunt.config.set('ts', {
    api: {
      files: [
        {
          src: [
            'api/**/*.ts', "!api/**/.*.ts", "!api/**/*.d.ts", "!node_modules/**/*.ts", "!typings/**/*.ts"
          ]
        }
      ],

      options: {
        compiler: 'node_modules/typescript/bin/tsc',
        module: 'commonjs',
        target: 'es6',
        fast: 'never',
        comments: true,
        sourceMap: true,// Useless on the server side.
        declaration: true,// Always useful to have declarations available.
        noEmitOnError: false,// Force log errors.
        failOnTypeErrors: true,// Force log grunt errors pipeline.
        verbose: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-ts');
};
