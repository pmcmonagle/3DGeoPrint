'use strict';

describe('Service: database', function () {

  // load the service's module
  beforeEach(module('3DgeoPrintFrontendApp'));

  // instantiate service
  var database;
  beforeEach(inject(function (_database_) {
    database = _database_;
  }));

  it('should do something', function () {
    expect(!!database).toBe(true);
  });

});
