const Color = artifacts.require('Color')

require('chai')
        .use(require('chai-as-promised'))
        .should()

contract('Color', (accounts) => {
	let contract

	before(async () => {
		contract = await Color.deployed();
	})
	describe('deployment', async () => {

                it('deploys successfully', async () => {
                	const address = contract.address
                	console.log(address)
                	assert.notEqual(address, '')
                	assert.notEqual(address, 0x0)
                	assert.notEqual(address, null)
                	assert.notEqual(address, undefined)
                })

                it('it has a name', async () => {
                	const name  = await contract.name()
                	console.log(name)
                	assert.equal(name, 'Color')
                })


                it('it has a symbol', async () => {
                	const symbol  = await contract.symbol()
                	console.log(symbol)
                	assert.equal(symbol, 'COLOR')
                })
        })

	describe('minting', async () => {

		        it('it creates a new token', async () => {
                	const result = await contract.mint('FFFFF')
                	const totalSupply = await contract.totalSupply()
                	// SUCCESS
                	assert.equal(totalSupply, 1)

                	const event = result.logs[0].args
                	assert.equal(event.tokenId.toNumber(), 1, 'id is correct')
                	assert.equal(event.from, 0x0000000000000000000000000000000000000000, 'from is correct')
                	assert.equal(event.to, accounts[0], 'to is correct')

                	//FAILRE: cannot mint the same color twice
                	await contract.mint('FFFFF').should.be.rejected;

                })
		})

		describe('indexing', async () => {

		        it('lists colors', async () => {
		        	// Mint 3 more tokens
		        	await contract.mint('CCCCC')
		        	await contract.mint('BBBBB')
		        	await contract.mint('AAAAA')
		        	const totalSupply = await contract.totalSupply()
		        	
		        	let color
		        	let result = []

		        	for(var i = 1; i <= totalSupply; i++){
		        		color = await contract.colors(i-1);
		        		result.push(color)
		        	}
		        	let expected = ['FFFFF', 'CCCCC','BBBBB','AAAAA']
		        	assert.equal(result.join(','), expected.join(','))
                })

        describe('Transferring tokens', async () => {

		        it('transfers tokens', async () => {
		        	const ind = await contract.colorStringToIndex('CCCCC')
		        	const addr1 = await contract.colorIndexToOwner(2)
		        	const bal = await contract.balanceOf(accounts[0])
		        	console.log(addr1)
		        	console.log(bal.toNumber())
		        	await contract.transfer(accounts[1], 2)
		        	const addr2 = await contract.colorIndexToOwner(2)
		        	const bal2 = await contract.balanceOf(accounts[0])
		        	const count1 = await contract.ownershipTokenCount(addr1)
		        	console.log(count1.toNumber())
					console.log(bal2.toNumber())
					const bal3 = await contract.balanceOf(accounts[1])
					console.log(bal3.toNumber())
		        	console.log(addr2)
                })
		})
    })
})