'use strict';

describe('Directive: selectionbox', function () {

  // load the directive's module
  beforeEach(module('3DgeoPrintFrontendApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<selectionbox></selectionbox>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the selectionbox directive');
  }));
});
