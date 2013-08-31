'use strict';

var FriendsListCtrl = function($scope, $filter, navSvc, userService, hatchService, imageService, $http){
  $scope.slidePage = function (path,type) {
    navSvc.slidePage(path,type);
  };

  $scope.pendingFriends = [];
  $scope.currentFriends = [];
  $scope.updateFriendList = function(){
    $http.get(userService.oaktreeUrl+'friends/' + userService.currentUser._id)
      .success(function(u, getRes){
        userService.currentUser.friends = u;
        _.each(userService.currentUser.friends, function(userObj, key){
          userObj.checked = false;
          if (userObj.status === 0){
            userObj.pending = ' - pending';
            $scope.pendingFriends.push(userObj);
          } else if (userObj.status === 1){
            userObj.waiting = 1;
            $scope.pendingFriends.push(userObj);
          } else if (userObj.status === 2){
            $scope.currentFriends.push(userObj);
          }
        });
      });
  };
  // $scope.currentFriends = [{username: 'Guy', _id: 123}, {username: 'Dave', _id: 123}, {username: 'Sav', _id: 123}, {username: 'Piu', _id: 123}]
  // $scope.fakeSend = function(){
  //   _.each($filter('filter')($scope.currentFriends, {checked:true}), function(value){
  //     receiverIds.push(value._id);
  //   });
  //   console.log('receiverIds', receiverIds);
  // }

  $scope.acceptFriend = function(userObj){
    $http.get(userService.oaktreeUrl+'friends/accept/'+userObj._id+'/'+userService.currentUser._id)
      .success(function(u, getRes){
        userObj.invited = 1;
      });
  };
  $scope.denyFriend = function(userObj){
    $http.get(userService.oaktreeUrl + 'friends/deny/'+userObj._id+'/'+userService.currentUser._id)
      .success(function(u, getRes){
        userObj.invited = 1;
      });
  };

  $scope.friendClass = function(user){
    if (user.invited){
      return 'is-disabled';
    }
  };
  $scope.check = function(friend){
    if (!friend.checked){
      friend.checked = true;
    } else {
      friend.checked = false;
    }
  };

  $scope.checkboxClass = function(friend){
    if (friend.checked){
      return 'icon-check icon-2x';
    } else {
      return "icon-check-empty icon-2x";
    }
  };

  $scope.checkboxback = function(friend){
    if (friend.checked){
      return 'checkboxbackground';
    }
  }
  $scope.allUsers = userService.allUsers;
  $scope.selectedFriends = $filter('filter')($scope.currentFriends, {checked:true});
  var receiverIds = [];
  $scope.send = function(){
    console.log('hatch obj', hatchService.hatchObject);
    // build the object
    hatchService.set('sender_id', userService.currentUser._id);
    hatchService.set('sender_name', userService.currentUser.username);
    _.each($filter('filter')($scope.currentFriends, {checked:true}), function(value){
      receiverIds.push(value._id);
    });
    hatchService.set('receiver_ids', receiverIds);
    console.log('hatch', hatchService.hatchObject.latlng);
    $http.post(userService.oaktreeUrl +'message/', JSON.stringify(hatchService.hatchObject))
      .success(function(data, status, headers, config){
        console.log('send message success data', data);
        if (imageService.photo && typeof imageService.photo.photo !== 'undefined') {
          console.log('attaching image...');
          var messageIds = '?';
          for (var i = 0; i < data.length; i++){
            messageIds+= i+'='+data[i]._id+'&';
          }
          messageIds.substring(0, messageIds.length-1);
          console.log('hatch obj', hatchService.hatchObject);
          console.log('image obj', imageService.photo);
          $http.post(userService.oaktreeUrl + 'image/' + messageIds, imageService.photo)
            .success(function(u, getRes){
              console.log('photo u', u);
              console.log('photo res', getRes);
              hatchService.clear();
              imageService.clear();
            })
            .error(function(data, status){
              console.log('error status', status);
              console.log('error data', data);
              hatchService.clear();
              imageService.clear();
            });
        } else {
          hatchService.clear();
          imageService.clear();
        }
      }).error(function(data, status){
        console.log('send msg err status', status);
        hatchService.clear();
        imageService.clear();
      });
  };
};