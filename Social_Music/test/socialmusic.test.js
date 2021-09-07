const SocialMusic = artifacts.require('SocialMusic')

require('chai')
	.use(require('chai-as-promised'))
	.should()


function fillBytes32WithSpaces(name) {
        let nameHex = web3.utils.toHex(name)
        for(let i = nameHex.length; i < 66; i++) {
            nameHex = nameHex + '0'
        }
        return nameHex
    }

contract('SocialMusic', ([Louisa, Sofia, Anna]) => {
	
    let socialMusic

    before(async () => {
        socialMusic = await SocialMusic.new()
    })

    describe('SocialMusic deployment', async () => {

        it('setups user information', async () => {
            await socialMusic.setup(fillBytes32WithSpaces("Louisa"), 24, "Moscow")
            const user = await socialMusic.users(Louisa)
            assert.equal(user.name, fillBytes32WithSpaces("Louisa"))
            assert.equal(user.age, 24)
            assert.equal(user.state, "Moscow")

            // FAILURE: user can't register more than one account from the same address
            await socialMusic.setup(fillBytes32WithSpaces("Sofia"), 18, "Orenburg").should.be.rejected

        })
        it('follows others users', async () => {
            await socialMusic.setup(fillBytes32WithSpaces("Sofia"), 18, "Orenburg",{ from: Sofia })
            await socialMusic.setup(fillBytes32WithSpaces("Anna"), 24, "Moscow",{ from: Anna })
            await socialMusic.follow(Sofia);
            await socialMusic.follow(Anna);
            await socialMusic.follow(Louisa, {from: Anna});
            const followingsOfLouisa = await socialMusic.getUsersFollowings(Louisa);
            const followingsOfAnna = await socialMusic.getUsersFollowings(Anna);
            const followingsOfSofia = await socialMusic.getUsersFollowings(Sofia);
            assert.equal(followingsOfLouisa.length, 2)
            assert.equal(followingsOfAnna.length, 1)
            assert.equal(followingsOfSofia.length, 0)
            

        })

         it('unfollows users', async () => {
            await socialMusic.unfollow(Sofia);
            await socialMusic.unfollow(Louisa, {from:  Anna });
            const followingsOfLouisa = await socialMusic.getUsersFollowings(Louisa);
            const followingsOfAnna = await socialMusic.getUsersFollowings(Anna);
         
            assert.equal(followingsOfLouisa.length, 1)
            assert.equal(followingsOfAnna.length, 0)
            

        })

    })

})