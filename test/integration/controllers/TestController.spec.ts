import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import {expect, assert} from 'chai';
import * as sinon from 'sinon';
const request = require('supertest');

declare var sails:any;
declare var MysqlService:any;

// see https://github.com/PanayotCankov/mocha-typescript
@suite("TestController")
class TestTestController {
  private queryStub:any;

  constructor() {
  }

  // instance before/after will be called before/after each test
  before() {
    this.queryStub = sinon.stub(MysqlService, 'query');
    this.queryStub.returns(Promise.resolve());
  }

  after() {
    this.queryStub.restore();
  }

  // static before/after will be called before/after all tests
  static before() {
  }

  @test("should pass")
  testTest(done: Function) {
    request(sails.hooks.http.app)
      .post('/test/test')
      .expect(200)
      .expect({value: 1}, done);
  }

  @test("mock test")
  testMock(done: Function) {
    request(sails.hooks.http.app)
      .post('/test/test2')
      .end(() => {
        sinon.assert.calledWith(this.queryStub, sails.config.mysql, 'select 1');
        done();
      });
  }

}
