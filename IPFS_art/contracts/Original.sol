pragma solidity 0.5.16;

contract Original {


   
    address[] public artistlist;
    mapping(address => bool) isArtist;
    mapping(string => bytes32) public ipfsHashestoNames;

    // owners of art
    mapping(address => string[]) public artOwnership;

    // num of art items
    mapping(address => uint256) public numOfItems;

    // access to art
    mapping(address => string[]) public controlAccess;


    mapping(string => address payable) artToOwner;
    // Events
    event artSent(string _ipfsHash, address _address);
    event payAuthor(
        uint256 tipAmount,
        address payable author
    );

    constructor() public {
    }

    function sendArt(string memory _ipfsHash, bytes32 _name) public {
        bytes memory stringTest = bytes(_ipfsHash); 
        require (stringTest.length != 0);
        artOwnership[msg.sender].push(_ipfsHash);
        artToOwner[_ipfsHash] = msg.sender;
        controlAccess[msg.sender].push(_ipfsHash);
        numOfItems[msg.sender] ++;
        ipfsHashestoNames[_ipfsHash] = _name;
        if (!isArtist[msg.sender]) {
            artistlist.push(msg.sender);
            isArtist[msg.sender] = true;
        }  
        emit artSent(_ipfsHash, msg.sender);

    }

    function getAccess(string memory _ipfsHash) public payable {
        require(msg.value > 0);
        address payable _author = artToOwner[_ipfsHash];
        _author.transfer(msg.value); 
        controlAccess[msg.sender].push(_ipfsHash);
        emit payAuthor(msg.value, _author);
    }

    // Returns the array of items
    function getArtistList() public view returns(address[] memory) {
        return artistlist;
    }

    // Checks if the user has access to art
    function ifAccess(string memory _ipfsHash) public view returns (bool) {

       for ( uint8 i = 0; i < controlAccess[msg.sender].length; i ++) {
         if ( keccak256(abi.encodePacked(controlAccess[msg.sender][i])) == keccak256(abi.encodePacked(_ipfsHash)) ) {
            return true;
         }
       } 
       return false;
    }
   
}
