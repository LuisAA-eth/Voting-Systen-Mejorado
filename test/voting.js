const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting_Systen", function (){

    let tituloPropuesta;
    let votanteAddress;
    let voting;


    this.beforeEach(async function(){
       tituloPropuesta = ["Propuesta1","propuesta2","propuesta3","propuesta4"];
      
       [addr0, addr1,addr2,addr3,addr4,addr5,addr6,addr7] = await ethers.getSigners();
      
       votanteAddress = [addr0.address , addr1.address , addr2.address , addr3.address , addr4.address , addr5.address , addr6.address];
      
       const Voting = await hre.ethers.getContractFactory("Voting_Systen");
       voting = await Voting.deploy(tituloPropuesta,votanteAddress);

      await voting.waitForDeployment();

      

    });

   // Funcion para quitar los caracteres nulos 
    function removeNullBytes(str){
        return str.split("").filter(char => char.codePointAt(0)).join("");
    }

     describe ("Deployment" , function() {
        it('Should set the right value of the proposals', async function() {
            for (let i = 0; i < tituloPropuesta.length; i++){
                let prop = await voting.getPropuesta(i);
                await expect(removeNullBytes(prop[0])).to.equal(tituloPropuesta[i]);
            }
     });

     it('Should set the right value of the voter addresses', async function() {
        for (let i = 0; i < votanteAddress.length; i++){
            let voterAddr = await voting.votantes(votanteAddress[i]);
            await expect(voterAddr.votante).to.equal(votanteAddress[i]);
        }

    });

  });

     describe ("Vote" , function() {
        it("Shouldnt vote", async function(){
           await expect(voting.votar(votanteAddress[1], 1)).to.be.revertedWith("Sistema de votacion: Error no puedes votar");
        });

        it("Should vote", async function(){
            await expect(voting.votar(votanteAddress[0], 1)).not.to.be.reverted;
         });
 
        

      });

      describe("Delegate" , function(){
        it("Shouldnt delegate , self delegate" , async function(){
          await expect(voting.DelegarVoto(votanteAddress[0])).to.be.revertedWith("No puedes delegar tu voto");
        });

        it("Shouldnt delegate , user had already vote" , async function(){
          await voting.votar(votanteAddress[0], 1);
          await expect(voting.DelegarVoto(votanteAddress[1])).to.be.revertedWith("Sistema de votacion: El votante ya voto");
        });

        it("Shouldnt delegate, this address dont have the right to vote" , async function(){
            await expect(voting.connect(addr7).DelegarVoto(votanteAddress[1])).to.be.revertedWith("Sistema de votacion: Esta direccion no puede votar");
        });

        it("Should delegate" , async function(){
            await expect(voting.DelegarVoto(votanteAddress[1])).not.to.be.reverted;
            let voterAddr = await voting.votantes(votanteAddress[0]);
            await expect(voterAddr.DelegarVoto).to.be.equal(votanteAddress[1]);


        });
 
 
    });

    describe ("Vote", function() {
        it ("Shouldn`t vote, this proposal doesn't exist", async function (){
            await expect(voting.votar(votanteAddress[0], 8)).to.be.revertedWith("Sistema de votacion: Error esta propuesta no existe");
        });

        it ("Shouldn`t vote, this voter has already voted", async function (){
            await voting.votar(votanteAddress[0], 1);
            await expect(voting.votar(votanteAddress[0], 1)).to.be.revertedWith("Sistema de votacion: El votante ya voto");
        });

        it ("Shouldn`t vote, this address does not have the right to vote", async function (){
            await expect(voting.connect(addr1).votar(votanteAddress[0], 1)).to.be.revertedWith("Sistema de votacion: Error no puedes votar");
        });

        it ("Should can vote", async function (){
            await expect(voting.votar(votanteAddress[0], 1)).not.to.be.reverted;
        });
        

    });

    describe ("Winners", function() {
        it("Can't compute winners, not the owner" , async function() {
            await voting.votar(votanteAddress[0], 1); //addr0
            await voting.connect(addr1).votar(votanteAddress[1], 1); //Addr1
            await voting.connect(addr2).votar(votanteAddress[2], 0); //Addr2
            await voting.connect(addr3).votar(votanteAddress[3], 2); //Addr3
            await voting.connect(addr4).votar(votanteAddress[4], 1); //Addr4
            await voting.connect(addr5).votar(votanteAddress[5], 0); //Addr5
            await voting.connect(addr6).votar(votanteAddress[6], 1); //Addr6
            
            await expect(voting.connect(addr1).Ganador()).to.be.revertedWith("Ownable: caller is not the owner");
            
        } );
    

    it("Can compute winners" , async function() {
        await voting.votar(votanteAddress[0], 2); //addr0
        await voting.connect(addr1).votar(votanteAddress[1], 1); //Addr1
        await voting.connect(addr2).votar(votanteAddress[2], 0); //Addr2
        await voting.connect(addr3).votar(votanteAddress[3], 0); //Addr3
        await voting.connect(addr4).votar(votanteAddress[4], 1); //Addr4
        await voting.connect(addr5).votar(votanteAddress[5], 0); //Addr5
        await voting.connect(addr6).votar(votanteAddress[6], 1); //Addr6

        await expect(voting.Ganador()).not.to.be.reverted;
        let prop = await voting.GetPropuestasGanadores();
        
        expect(prop[0]).to.be.equal(0);
        expect(prop[1]).to.be.equal(1);
        
    
       });
    });

})


