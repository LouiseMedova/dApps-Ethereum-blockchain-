pragma solidity ^0.5.0;

import "./ERC721Full.sol";

contract Color is ERC721Full {
    

  string[] public colors;
  mapping(string => bool) _colorExists;

  // A mapping from color string to colorId
  mapping (string => uint256) public colorStringToIndex;


  // A mapping from color index to the address that owns them
  mapping (uint256 => address) public colorIndexToOwner;

  //  A mapping from owner address to count of tokens that address owns.
  mapping (address => uint256) public ownershipTokenCount;

  /// A mapping from color token to an address that has been approved to call
  ///  transferFrom(). Each color token can only have one approved address for transfer
  ///  at any time. A zero value means no approval is outstanding.
  mapping (string => address) public colorIndexToApproved;

    constructor() ERC721Full("Color", "COLOR") public {
  }

  function _transfer(address _from, address _to, uint256 _tokenId) internal {

        ownershipTokenCount[_to]++;
        // transfer ownership
        colorIndexToOwner[_tokenId] = _to;

        // Emit the transfer event.
        emit Transfer(_from, _to, _tokenId);
    }

    function _owns(address _claimant, uint256 _tokenId) internal view returns (bool) {
        return colorIndexToOwner[_tokenId] == _claimant;
    }

  function transfer(address _to, uint256 _tokenId) external {
        // Safety check to prevent against an unexpected 0x0 default.
        require(_to != address(0));
        // Disallow transfers to this contract to prevent accidental misuse.
        require(_to != address(this));

        // You can only send your own color.
        require(_owns(msg.sender, _tokenId));
        // Reassign ownership, clear pending approvals, emit Transfer event.
        _transfer(msg.sender, _to, _tokenId);
    }


  function mint(string memory _color) public {
    require(!_colorExists[_color]);
    uint _id = colors.push(_color);
    _mint(msg.sender, _id);
    _colorExists[_color] = true;
    colorStringToIndex[_color] = _id;
    ownershipTokenCount[msg.sender]++;
    colorIndexToOwner[_id] = msg.sender;
    // Call the mint function
  }
}