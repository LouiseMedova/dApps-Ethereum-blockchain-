pragma solidity >=0.4.22 <0.9.0;

contract  SocialMusic {

  struct User {
    bytes32 name;
    uint256 age;
    string state;
    string[] musicRecommendations;
    address [] following;
  }

 mapping(address => User) public users;

 mapping(address => bool) public UserHasRegistered;

 address[] public userList;

  // to add a new musical recommendation
  function addSong(string memory _songName) public {
    require(bytes(_songName).length > 0 && bytes(_songName).length < 100);
    users[msg.sender].musicRecommendations.push(_songName);
  }

  // To setup user information
  function setup(bytes32 _name, uint256 _age, string memory _state) public {
    require(_name.length > 0);
    require(UserHasRegistered[msg.sender] == false);
    User memory newUser = User(_name, _age, _state, users[msg.sender].musicRecommendations, users[msg.sender].following);
    users[msg.sender] = newUser;
    UserHasRegistered[msg.sender] = true;
    userList.push(msg.sender);
  }

  // Returns the array of users
  function getUserList() public view returns(address[] memory) {
    return userList;
  }

  // To follow new users
  function follow(address _user) public {
    require(_user != address(0));
    require(_user != msg.sender);
    require(UserHasRegistered[_user] == true);
    users[msg.sender].following.push(_user);
  }
  // To unfollow users
  function unfollow(address _user) public {
   if (checkExistingSubscription(_user)) {
    for(uint256 i = 0; i < users[msg.sender].following.length; i++) {
      if(users[msg.sender].following[i] == _user) {
        address lastElement = users[msg.sender].following[users[msg.sender].following.length - 1];
        users[msg.sender].following[i] = lastElement;
        users[msg.sender].following.length--;
        break;
      }
    }
   }
  }

// Returns the music recommendations
    function getUsersMusicRecommendation(address _user, uint256 _recommendationIndex) public view returns(string memory) {
        return users[_user].musicRecommendations[_recommendationIndex];
    }

  // Returns how many music recommendations that user has
    function getUsersMusicRecommendationLength(address _user) public view returns(uint256) {
        return users[_user].musicRecommendations.length;
    }

    // Returns the addresses of the users _user is following
    function getUsersFollowings(address _user) public view returns(address[] memory) {
        return users[_user].following;
    }


   /// @notice To check if the use is already subscribed to another user
   /// @return bool If you are subscribed to that user or not

  function checkExistingSubscription(address _user) public view returns(bool) {
        for(uint256 i = 0; i < users[msg.sender].following.length; i++) {
            if(users[msg.sender].following[i] == _user) return true;
        }
        return false;
    }
}