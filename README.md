# M-sails Service

For Windows users, please use `Git Bash Here` to start shell

## Setup

* Install git, nodejs
* Clone repository to your directory
* `npm run setup`

## Development

* `npm start`
This will start service at http://localhost:1337, when code change, it will **auto restart service**.

There's a test service at http://localhost:1337/test/test, you can play with it by editing `api/controller/TestController.ts`.

## Testing
Testing code is under `test` folder.

### Run Test
* `npm test` to run all the tests
* `npm testwith YOUR_FILE` to run specific files

### Coverage
* `npm run cover`

**Note**: For Windows users, this only works when you are using git bash.

## Debug
Visits http://localhost:8081/ for debug, the debug expirence is exactly the same as Chrome Develop Tool.
