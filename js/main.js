//data.php and data2.php are used to grab data from mysql databases
//sample_data.php provided as template


//setup app and name it myApp, call ngRoute for routing
var app = angular.module('myApp', ['ngRoute']);


//setup routing to partials (i.e. the views)
app.config(function ($routeProvider) {
	$routeProvider

	    .when('/',
		  {
		      controller: 'MyCtrl',
		      templateUrl: 'partials/v1.html'
		  })
	    .when('/v2/:rID',
		  {
		      controller: 'ViolController',
		      templateUrl: 'partials/v2.html'
		  })
	    .otherwise({ redirectTo: '/' });

    });


//controller for view 1, the restaurant listing
app.controller('MyCtrl', function($scope, $route, $routeParams, dataService) {
	dataService.getData().then(function(data) {
		$scope.myData = data;
	    });
	$scope.$route = $route;
	$scope.$routeParams = $routeParams;
    });

//controller for view 1, the violations for selected restaurant
app.controller('ViolController', function ($scope, $route, $routeParams, dataService, violService) {

	//Grab the selected restaurant name using route parameters
	//Not done very efficiently, but to demonstrate how one might do it
	dataService.getItem(($routeParams.rID) ? parseInt($routeParams.rID) : 0).then(function(data) {
		$scope.c = data[0];
	    });

	//Get the list of violations
        violService.getViol(($routeParams.rID) ? parseInt($routeParams.rID) : 0).then(function(data) {
                $scope.sData = data;
            });
    });



//Factory to get violations data
app.factory('violService',function($http,$q){
	return {
	    //gets all the violations from main table
	    //extract meanings from the violations table
            getViol: function(id){
		return $q.all([
			       //Do to calls to get data, wait until both complete then do following
			       $http.get('js/data.php'), //restaurant listing
			       $http.get('js/data2.php') //violations listing
			       ])

		    .then(function(results) {
			    var datapull = [];
			    angular.forEach(results, function(result){
				    datapull.push(result.data);
				});
			    
			    //datapull[0] main restaurant table
			    //datapull[1] violation meanings table
			    
			    var fin = {};
			    var fin2 = {};
			    var finale = [];

			    //Grab restaurant violations given the item id
			    angular.forEach(datapull[0], function(val, key){
				    if (String(id) === String(val.CAMIS) && val.VIOLCODE != ""){
					fin[key] = {VIOLCODE: val.VIOLCODE, INSPDATE: val.INSPDATE, GRADE: val.CURRENTGRADE};
				    }
				});
			    
			    //Merge the violations meanings from datatable 2 with violations listing datatable 1
			    angular.forEach(fin, function(v1, k1){
				    angular.forEach(datapull[1], function(v2, k2) {
					    if (String(v1.VIOLCODE) === String(v2.VIOLATIONCODE))
						fin2[k1] = {VIOLCODE: v1.VIOLCODE, INSPDATE: v1.INSPDATE, VIOLDESC: v2.VIOLATIONDESC, GRADE: v1.GRADE};
					});
				    
				});
			    
			    //Push object to finale array
			    angular.forEach(fin2, function(v, k){
				    finale.push({VIOLCODE: v.VIOLCODE, INSPDATE: v.INSPDATE, VIOLDESC: v.VIOLDESC, CURRENTGRADE: v.GRADE});
				});
			    
			    //Return json/data
			    return finale;

			});

	    }
	}
	
    });


//Factory to get restaurant data for view 1
app.factory('dataService',function($http){
	return {
	    getData: function(){
		return $http.get('js/data.php').then(function(result){

			//clean the open data to just grab a listing of the restaurants
			var fin = {};
			var finale = [];
			
			angular.forEach(result.data, function(val, key){
				fin[val.CAMIS] = {DBA: val.DBA, BUILDING: val.BUILDING, STREET: val.STREET, ZIP: val.ZIPCODE, PHONE: val.PHONE};
			    });

			angular.forEach(fin, function(v, k){
				finale.push({CAMIS: k, DBA: v.DBA, BUILDING: v.BUILDING, STREET: v.STREET, ZIPCODE: v.ZIP, PHONE: v.PHONE });
			    });
			
			//return listing of restaurants
			return finale;
		    });
	    },
		getItem: function(id){
		//get specific restaurant item
		
		return $http.get('js/data.php').then(function(result){
			var fin = {};
                        var finale = [];
                        angular.forEach(result.data, function(val, key){
				if (String(id) === String(val.CAMIS)){
				    fin[val.CAMIS] = val.DBA;
				}
                            });

                        angular.forEach(fin, function(v, k){
				finale.push({CAMIS: k, DBA: v});
                            });
                        return finale;
                    });
	    }
	}	
    });