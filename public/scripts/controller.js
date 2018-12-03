//angularJS

var app = angular.module('app',[]);

app.controller('httpFormController', function($scope, $http){
    $scope.num = [0];
    $scope.posuv = [{value: 1, city: '', from: 1}];
    $scope.rozloha = false;
    $scope.rozlohaObj = {value: 0};
    var polygonArray = [];
    var markerArray = [];
    var heat = null;
    

    $scope.addCycle = function(){
        $scope.posuv.push({ value: 1, city: '', from: 1} );
    }

    $scope.removeElem = function(x){
        $scope.posuv.splice(x, 1);
    }

    function removeCycle(){
        for(var i = 0; i < polygonArray.length; i++){
            map.removeLayer(polygonArray[i]);
        }
        polygonArray = [];

        for(var i = 0; i < markerArray.length; i++){
            map.removeLayer(markerArray[i]);
        }
        markerArray = [];
        
        if(heat){
            map.removeLayer(heat);
        }
            
    }

    $scope.removeCycleButt = function(){
        removeCycle();
    }


    $scope.searchAll = function(){
        removeCycle();
        
        $http.get("http://localhost:8080/allMeadows").then(function succ(data){
            var marker = [];
            console.log(data.data);
            for(var i = 0; i < data.data.data.length; i++){
                var temp = data.data.data[i].coordinates;

                marker.push([temp[1],temp[0], 1]);

            }
           
            heat = L.heatLayer(marker, {radius: 40}).addTo(map);

        }, function err(err){
            console.log(err);
        });
        
    }

    $scope.filter = function(){
        removeCycle();

        var data = [];
        var user = {};
        var roz = 0;

        if($scope.rozloha){
            console.log($scope.rozlohaObj.value);
            roz = $scope.rozlohaObj.value;
        }else{
            roz = 0;
        }


        for(var i = 0; i < $scope.posuv.length; i++){

            if($scope.posuv[i].city != ''){
                user = {city: $scope.posuv[i].city, posuv: $scope.posuv[i].value, from: $scope.posuv[i].from};
                data.push(user);
            }
            
        }
        //console.log("Data: "+JSON.stringify(data));
        if(data.length != 0){
            $http.post("http://localhost:8080/query", {rozloha: roz, data:data} ).then(function succ(data){
                console.log(data.data);
                if(data.data.data.length < 1){
                    alert("Neboli najdene ziadne vyhovujuce miesta");
                }
                var poly;
                var marker;
                for(var i = 0; i < data.data.data.length; i++){
                    
                    var temp = data.data.data[i].coordinates[0];
                    var markerS = data.data.centroids[i].coordinates;
                    var surPoly = [];

                    for(var j = 0; j < temp.length; j++){
                        var sur = [];
                        sur.push(temp[j][1]);
                        sur.push(temp[j][0]);
                        surPoly.push(sur);
                    }
                    
                    marker = L.marker([markerS[1],markerS[0]]).addTo(map);
                    markerArray.push(marker);
                    poly = L.polygon(surPoly).addTo(map);
                    polygonArray.push(poly);
                }
            }, function err(){
                console.log(err);
            });
        }
        
            
    }


});



