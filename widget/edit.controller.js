/* Copyright start
  MIT License
  Copyright (c) 2026 Fortinet Inc
  Copyright end */
  'use strict';
  (function () {
      angular
          .module('cybersponse')
          .controller('editBesImpactEvaluation100Ctrl', editBesImpactEvaluation100Ctrl);
  
      editBesImpactEvaluation100Ctrl.$inject = ['$scope', '$uibModalInstance', 'config'];
  
      function editBesImpactEvaluation100Ctrl($scope, $uibModalInstance, config) {
          $scope.cancel = cancel;
          $scope.save = save;
          $scope.config = config;
  
          function cancel() {
              $uibModalInstance.dismiss('cancel');
          }
  
          function save() {
              $uibModalInstance.close($scope.config);
          }
  
      }
  })();
