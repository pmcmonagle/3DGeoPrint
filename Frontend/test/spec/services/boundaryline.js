'use strict';

describe('Service: boundaryline', function () {

  // load the service's module
  beforeEach(module('3DgeoPrintFrontendApp'));

  // instantiate service
  var boundaryline;
  beforeEach(inject(function (_boundaryline_) {
    boundaryline = _boundaryline_;
  }));

  it('should do something', function () {
    expect(!!boundaryline).toBe(true);
  });

});
