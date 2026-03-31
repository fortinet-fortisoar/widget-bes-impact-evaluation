/* Copyright start
   MIT License
   Copyright (c) 2026 Fortinet Inc  
Copyright end */
(function () {
  angular
    .module('cybersponse')
    .controller('besImpactEvaluation100Ctrl', besImpactEvaluation100Ctrl);

  besImpactEvaluation100Ctrl.$inject = ['$scope', '$window', '$timeout', 'CommonUtils', '_', 'toaster', '$http', '$state', 'WizardHandler', 'API', 'Entity', '$resource', 'PagedCollection', '$q'];

  function besImpactEvaluation100Ctrl($scope, $window, $timeout, CommonUtils, _, toaster, $http, $state, WizardHandler, API, Entity, $resource, PagedCollection, $q) {
    $scope.id = $state.params.id;
    $scope.note = { 'data': "" }
    $scope.impactTab = {
      open: true
    };
    $scope.entityTab = {
      open: true
    };
    $scope.digitalTab = {
      open: true
    };
    $scope.criteriaTab = {
      open: true
    };
    $scope.routableTab = {
      open: true
    };
    $scope.selectAll = {
      isSelected: false
    };
    $scope.module = $state.params.module;
    $scope.moveNext = moveNext;
    $scope.movePrevious = movePrevious;
    $scope.saveAndCloseWidget = saveAndCloseWidget;
    $scope.isEntityAndDCSSelected = isEntityAndDCSSelected;
    $scope.convertHexToRgbA = CommonUtils.convertHexToRgbA;
    $scope.checkDistributionProviderValue = checkDistributionProviderValue
    $scope.checkGenerationResourceValue = checkGenerationResourceValue
    $scope.displaySubCriteria = displaySubCriteria
    $scope.selectAllOperations = selectAllOperations
    $scope.entityNextPage = 'Assess Criteria'
    $scope.selectedDPValue = { data: "" }
    $scope.WizardHandler = WizardHandler;
    $scope.criteriaOutput = "Low";
    $scope.pagedCollectionList = [];
    $scope.gridOptions = {
      csOptions: {
        allowAdd: false,
        allowDelete: false,
        allowClone: false,
        showPagination: true
      },
      enableSorting: false,
      enableFiltering: false,
      enableGridMenu: false,
      enableSelectAll: false,
      enableRowSelection: false,
      enableRowHeaderSelection: false,
      selectWithCheckboxOnly: false,
      enableColumnResizing: false,
      enableColumnMoving: false,
      paginationPageSizes: [5, 10, 30],
      refresh: false
    };

    // Load Entity data
    _init()
    function _init() {
      var entity = new Entity($scope.module);
      entity.get($scope.id, {
        $relationships: true
      }).then(function () {
        $scope.entity = entity;
      });
      loadInputJSONData().then(function (response) {
        $scope.inputJSONData = response.data;
        _loadRelationship()
      })
    }

    // Load Input json data
    function loadInputJSONData() {
      var defer = $q.defer();
      $http.get('widgets/installed/besImpactEvaluation-1.0.0/besImpactInput.json').then(function (response) {
        defer.resolve(response);
      }, function (error) {
        defer.reject(error);
      });
      return defer.promise;
    }

    // Load relationship data defined in "correlatedDataValues"
    function _loadRelationship() {
      var pagedCollectionList = [];
      var promises = [];
      for (var i = 0; i < $scope.inputJSONData.correlatedDataValues.length; i++) {
        var relationshipEntity = new Entity($scope.inputJSONData.correlatedDataValues[i].name);
        var params = {
          id: $scope.id,
          fieldName: $scope.inputJSONData.correlatedDataValues[i].name
        };
        pagedCollectionList.push(new PagedCollection($state.params.module, relationshipEntity, params, null, null, $scope.inputJSONData.correlatedDataValues[i].defaultColumns, null, null, false));
        angular.extend(pagedCollectionList[i].query, { limit: 10 });
        promises.push(pagedCollectionList[i].load(null, null, relationshipEntity.name).$promise);
      }
      $q.all(promises).then(function () {
        $scope.pagedCollectionList = pagedCollectionList;
      });
    }

    // loads default Entity and Digital Control System of record
    function loadDefaultEntityAndDCS() {
      $scope.entity.originalData.entityType.forEach(item1 => {
        $scope.entity.fields.entityType.options.forEach(item2 => {
          if (item1.itemValue === item2.itemValue) {
            item2.isSelected = true;
          }
          item2.itemValue = item2.itemValue.replace(/-/g, '/').replace(/\[/g, '(').replace(/\]/g, ')');
        })
      })
      $scope.entity.originalData.digitalControlSystems.forEach(item1 => {
        $scope.entity.fields.digitalControlSystems.options.forEach(item2 => {
          if (item1.itemValue === item2.itemValue) {
            item2.isSelected = true;
          }
          item2.itemValue = item2.itemValue.replace(/-/g, '/');
        })
      })
      isEntityAndDCSSelected()
    }

    // Checks if any of the Entity and Digital Control System is Selected or not
    function isEntityAndDCSSelected() {
      const selectedEntity = $scope.entity.fields.entityType.options.some(option => option.isSelected);
      const selectedDigitalControl = $scope.entity.fields.digitalControlSystems.options.some(option => option.isSelected);
      $scope.isOnlyDistributionProviderSelected = $scope.entity.fields.entityType.options.every(item => (item.itemValue !== 'Distribution Provider (DP)') === !item.isSelected);
      $scope.isOnlyGenerationResourceSelected = $scope.entity.fields.digitalControlSystems.options.every(item => (item.itemValue !== 'Generation Resource') === !item.isSelected);
      if (!$scope.isOnlyDistributionProviderSelected && !$scope.isOnlyGenerationResourceSelected) {
        $scope.entityNextPage = 'Assess Criteria';
      }
      $scope.disableEntityContinue = !(selectedEntity && selectedDigitalControl);
    }

    // function isEntityAndDCSSelected() {
    //   const selectedEntity = $scope.entity.fields.entityType.options.map(option => option.isSelected);
    //   $scope.isOnlyDistributionProviderSelected = checkOnlySelected('Distribution Provider (DP)', $scope.entity.fields.entityType.options)
    //   $scope.isOnlyGenerationResourceSelected = checkOnlySelected('Generation Resource', $scope.entity.fields.digitalControlSystems.options)
    //   if (!$scope.isOnlyDistributionProviderSelected && !$scope.isOnlyGenerationResourceSelected) {
    //     $scope.entityNextPage = 'Assess Criteria'
    //   }
    //   const selectedDigitalControl = $scope.entity.fields.digitalControlSystems.options.map(option => option.isSelected)
    //   if (selectedEntity.includes(true) && selectedDigitalControl.includes(true)) {
    //     $scope.disableEntityContinue = false
    //   }
    //   else {
    //     $scope.disableEntityContinue = true
    //   }
    // }

    function checkOnlySelected(name, searchPath) {
      for (var i = 0; i < searchPath.length; i++) {
        var item = searchPath[i];
        if (item.itemValue === name) {
          if (!item.isSelected) {
            return false;
          }
        } else {
          if (item.isSelected) {
            return false;
          }
        }
      }
      return true
    }

    function checkDistributionProviderValue(option) {
      $scope.isDPValueNone = option === 'None'
      if ($scope.isDPValueNone) {
        $scope.entityNextPage = 'Exit'
        toaster.error({
          body: 'CIP does not appear to be applicable based on this preliminary information.'
        });
      }
      else if (!$scope.isGRValueNuclear) {
        $scope.entityNextPage = 'Assess Criteria'
        $scope.selectedDPValue.data = option
      }
      else {
        $scope.entityNextPage = 'Assess Criteria'
      }
    }

    function checkGenerationResourceValue() {
      $scope.isGRValueNuclear = checkOnlySelected('Nuclear', $scope.inputJSONData['digitalControlSystemsSubCriteria']['Generation Resource'])
      if ($scope.isGRValueNuclear) {
        $scope.entityNextPage = 'Exit'
        toaster.error({
          body: 'CIP does not appear to be applicable based on this preliminary information. Kindly review the Electronic Code of Federal Regulations (10 CFR 72.54) for applicability.'
        });
      }
      else if (!$scope.isDPValueNone) {
        $scope.entityNextPage = 'Assess Criteria'
      }
    }

    // Function load Criteria as per chosen Entity and Digital Control System
    function loadCriteria() {
      $scope.impactRatingCriteriaList = []
      $scope.selectedEntityList = []
      $scope.entity.fields.digitalControlSystems.options.forEach(item => {
        if (item.itemValue === 'Control Center / Backup Control Center' && item.isSelected) {
          $scope.entity.fields.entityType.options.forEach(criteria => {
            if (criteria.isSelected && $scope.inputJSONData['impactRatingCriteria']['Control Center / Backup Control Center'][criteria.itemValue].length > 0) {
              $scope.selectedEntityList.push(criteria.itemValue)
              $scope.impactRatingCriteriaList.push(...$scope.inputJSONData['impactRatingCriteria']['Control Center / Backup Control Center'][criteria.itemValue])
            }
          })
        }
        else if (item.isSelected && $scope.inputJSONData['impactRatingCriteria']['commonData'][item.itemValue].length > 0) {
          $scope.impactRatingCriteriaList.push(...$scope.inputJSONData['impactRatingCriteria']['commonData'][item.itemValue])
        }
      })
    }

    // Select All option
    function selectAllOperations() {
      angular.forEach($scope.impactRatingCriteriaList, function (impact) {
        impact.isSelected = $scope.selectAll.isSelected
      })
      displaySubCriteria()
    }

    // Display Sub Criteria if any
    function displaySubCriteria() {
      if ($scope.selectedEntityList.length > 0) {
        $scope.selectedEntityList.forEach(entity => {
          $scope.inputJSONData['impactRatingCriteria']['Control Center / Backup Control Center'][entity].forEach(item => {
            if (item.isSelected && 'yes' in item) {
              item['yes'].forEach(data => {
                if (!containsObject($scope.impactRatingCriteriaList, data)) {
                  $scope.impactRatingCriteriaList.push(data)
                }
              })
            }
            else {
              loadCriteria();
            }
          })
        })
      }
      allSelected = $scope.impactRatingCriteriaList.every(function (impact) {
        return impact.isSelected;
      })
      if (allSelected) {
        $scope.selectAll.isSelected = true
      }
      else {
        $scope.selectAll.isSelected = false
      }
    }

    // get selected criteria
    function checkCriteriaSelected() {
      $scope.selectedCriteria = [];
      $scope.impactRatingCriteriaList.forEach((criteria) => {
        if (criteria.isSelected) {
          $scope.selectedCriteria.push(criteria.criteriaNumber);
        }
      });
    }

    // set criteria output
    function setCriteriaOutput() {
      if (checkImpact("High")) {
        $scope.criteriaOutput = "High"
      }
      else if (checkImpact("Medium")) {
        $scope.criteriaOutput = "Medium"
      }
    }

    // Check Impact
    function checkImpact(impactType) {
      // Check confirmedList
      if ($scope.impactRatingCriteriaList.some(selectedItem => $scope.inputJSONData['impactRatingCriteria'][impactType].confirmedList.includes(selectedItem.criteriaNumber) && selectedItem.isSelected)) {
        return true;
      }

      // Check unConfirmedList
      for (const [key, value] of Object.entries($scope.inputJSONData['impactRatingCriteria'][impactType].unConfirmedList)) {
        const isMatch = $scope.entity.fields.digitalControlSystems.options.some(item => item.itemValue === key && item.isSelected);

        if (isMatch && $scope.impactRatingCriteriaList.some(data => {
          if (data.isSelected && data.criteriaNumber in value) {
            return Object.keys(value[data.criteriaNumber]).length === 0 || value[data.criteriaNumber].subCriteria.some(item => $scope.selectedCriteria.includes(item)) || $scope.entity.fields.entityType.options.some(entity => entity.itemValue === value[data.criteriaNumber].entityType && entity.isSelected);
          }
        })) {
          return true;
        }
      }
      return false;
    }

    function containsObject(mainList, subObject) {
      return mainList.some(item => JSON.stringify(item) === JSON.stringify(subObject));
    }

    function moveNext() {
      $scope.WizardHandler.wizard('besImpactEvaluation').next();
      if ($scope.WizardHandler.wizard('besImpactEvaluation').currentStep().wzTitle === 'Associated Assets') {
        loadDefaultEntityAndDCS()
      }
      if ($scope.WizardHandler.wizard('besImpactEvaluation').currentStep().wzTitle === 'Entity & Control Systems') {
        if ($scope.entityNextPage === 'Exit') {
          $scope.close();
        }
        loadCriteria();
        displaySubCriteria();
      }
      if ($scope.WizardHandler.wizard('besImpactEvaluation').currentStep().wzTitle === 'Impact Rating Criteria') {
        checkCriteriaSelected()
        setCriteriaOutput()
        $scope.impactColor = $scope.entity.fields.bESImpact.options.find(item => item.itemValue === $scope.criteriaOutput).color
        const impactColorElement = document.getElementById('impactColorElement');
        var impactColorRGB = $scope.convertHexToRgbA(CommonUtils.isUndefined($scope.impactColor) ? '#000' : $scope.impactColor);
        impactColorElement.style.borderColor = $scope.impactColor;
        impactColorElement.style.background = 'linear-gradient(to right, ' + impactColorRGB + ' 5%, transparent 100%)';
      }
    }

    function movePrevious() {
      if ($scope.WizardHandler.wizard('besImpactEvaluation').currentStep().wzTitle === "Summary") {
        $scope.criteriaOutput = "Low"
      }
      if ($scope.WizardHandler.wizard('besImpactEvaluation').currentStep().wzTitle === "Impact Rating Criteria") {
        $scope.selectAll.isSelected = false
      }
      $scope.WizardHandler.wizard('besImpactEvaluation').previous();
    }

    // Save and Close Widget
    function saveAndCloseWidget() {
      var bESImpact = $scope.entity.fields.bESImpact.options.find(item => item.itemValue === $scope.criteriaOutput);
      var entityType = $scope.entity.fields.entityType.options.filter(function (item) {
        return item.isSelected === true;
      })
      var digitalControlSystems = $scope.entity.fields.digitalControlSystems.options.filter(function (item) {
        return item.isSelected === true
      })
      const epochDate = Date.now() / 1000;

      // Add selected criteria
      let selectedCriteria = ''
      if ($scope.selectedCriteria.length === 0) {
        selectedCriteria = 'No Criteria Selected!';
      }
      else {
        selectedCriteria = '<ol type="1">';
        for (let i = 0; i < $scope.impactRatingCriteriaList.length; i++) {
          if ($scope.impactRatingCriteriaList[i].isSelected)
            selectedCriteria += '<li><span class="font-size-14">' + $scope.impactRatingCriteriaList[i].name + '</span></li>';
        }
        selectedCriteria += '</ol>'
      }

      $resource(API.API_3_BASE + $scope.entity.module + '/' + $scope.entity.id, null, {
        'update': {
          method: 'PUT'
        }
      }).update({ 'entityType': entityType, 'digitalControlSystems': digitalControlSystems, 'bESImpact': bESImpact, 'lastAssessmentDate': epochDate, 'selectedCriteria': selectedCriteria }).$promise.then(function () {
      });

      // Add note/comment in the detailed view
      var noteData = 'No Notes available!'
      if ($scope.note.data !== "") {
        noteData = $scope.note.data
      }
      const date = new Date(epochDate * 1000);
      let noteAsComment = '<h4>Details of the last Impact Level Assessment: </h4><p>Assessment Date: ' + date.toLocaleString() + '</p><p>Impact Level: <span style="color:' + $scope.impactColor + '">' + bESImpact.itemValue + '</span></p><p>Entity Type: <ol type="1">' + entityType.map(item => `<li>${item.itemValue}</li>`).join('\n') + '</ol>' + '</p><p>Digital Control System: <ol type="1">' + digitalControlSystems.map(item => `<li>${item.itemValue}</li>`).join('\n') + '</ol>' + '</p><p>Criteria: ' + selectedCriteria + '</p><p>Notes: ' + noteData
      $resource(API.API_3_BASE + 'comments', null, {
        'update': {
          method: 'POST'
        }
      }).update({
        "content": noteAsComment,
        "recordTags": [],
        "type": "/api/3/picklists/ff599189-3eeb-4c86-acb0-a7915e85ac3b",
        "people": [],
        "files": [],
        "peopleUpdated": false,
        "bESCyberSystems": [
          $scope.entity.originalData["@id"]
        ]
      }).$promise.then(function () {
      });

      toaster.success({
        body: 'Successfully evaluated and marked impact on the System ' + $scope.entity.originalData.title
      });
      $timeout(function () {
        $window.location.reload();
      }, 3000);
      $scope.close();
    }
  }
})();
