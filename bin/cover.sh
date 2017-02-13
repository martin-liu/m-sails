#!env bash

grunt clean:ts ts && \
    tsc -p ./test && \
    istanbul cover --report lcovonly -i 'api/@(controllers|services|models)/**/*.js' node_modules/mocha/bin/_mocha test/bootstrap.test.js test/integration/**/*.spec.js && \
    remap-istanbul -i ./coverage/coverage.json -o ./coverage/lcov.info -t lcovonly
