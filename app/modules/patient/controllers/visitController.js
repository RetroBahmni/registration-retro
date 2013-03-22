'use strict';

angular.module('registration.visitController', ['resources.patientService', 'resources.visitService', 'resources.concept', 'resources.bmi','resources.date'])
    .controller('VisitController', ['$scope', '$location', 'patientService', 'visitService', 'concept', 'bmi','date', function ($scope, $location, patientService, visitService, conceptService, bmiModule, date) {
    var registrationConcepts = [];

    (function () {
        $scope.encounter = {};
        $scope.obs = {};
        $scope.obs.registration_fees = defaults.registration_fees;
        $scope.visit = {};
        $scope.patient = patientService.getPatient();

        conceptService.getRegistrationConcepts().success(function (data) {
            var concepts = data.results[0].setMembers;
            concepts.forEach(function (concept) {
                registrationConcepts.push({name:concept.name.name,uuid:concept.uuid });
            });
        });
    })();


    $scope.calculateBMI = function () {
        var bmi = bmiModule.calculateBmi($scope.obs.height, $scope.obs.weight);
        var valid = bmi.valid();
        $scope.obs.error = !valid;
        $scope.obs.bmi = valid ? bmi.value : "";
        $scope.obs.bmi_status = valid ? bmi.status() : "";
    };

    $scope.back = function () {
        $location.path("/create");
    }

    $scope.create = function () {
        var datetime = date.now().toISOString();
        $scope.visit.patient = $scope.patient.uuid;
        $scope.visit.startDatetime = datetime;
        $scope.visit.visitType = constants.visitType.registration;

        $scope.encounter.patient = $scope.patient.uuid;
        $scope.encounter.encounterDatetime = datetime;
        $scope.encounter.encounterType = constants.visitType.registration;

        $scope.encounter.obs = [];
        registrationConcepts.forEach(function (concept) {
            var conceptName = concept.name.replace(" ","_").toLowerCase();
            var value = $scope.obs[conceptName];
            if(value != null && value!=""){
                $scope.encounter.obs.push({concept:concept.uuid,value:value});
            }
        });
        $scope.visit.encounters = [$scope.encounter];

        visitService.create($scope.visit);
        $location.path("/search");
    };
}]);