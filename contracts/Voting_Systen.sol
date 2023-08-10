// SPDX-License-Identifier: MIT

pragma solidity ^0.8.14;

import "@openzeppelin/contracts/access/Ownable.sol" ;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Voting_Systen is Ownable {
    using SafeMath for uint256;

  struct Votante{
    address votante; // Direccion del votante
    address delegate;
    uint voto; // Indica el indice de la opcion por la cual voto
    bool voted;  // Indica si ya voto o no
    
  }

  struct Propuesta{
    bytes32 titulo;   // Titulo de la propuesta
    uint conteoVotos;
  }

  mapping(address=>Votante) public votantes;
  Propuesta[] propuestasList;
  uint conteoPropuestas;
  

  uint[] propuestasGanadoras;
  
  event VotingStarted(address indexed  _owner, uint256 _conteoPropuestas);
  event VotoCasted(uint _propuestaVotada , address indexed _votante);
  event DelegateSuccesse(address indexed votante , address indexed delegate);


  modifier PropuestaExistente(uint _propuestaIndex){
    require(_propuestaIndex < conteoPropuestas , "Sistema de votacion: Error esta propuesta no existe");
    _;
  }

  modifier NoHayaVotado (address _voter){
    require(!votantes[_voter].voted , "Sistema de votacion: El votante ya voto");
    _;
  }

  constructor(string[] memory tituloPropuesta , address[] memory votanteAddress) {
    conteoPropuestas = tituloPropuesta.length;
    for (uint i= 0; i < conteoPropuestas; i = i.add(1)){
      Propuesta memory propuesta = Propuesta (StringToBytes32(tituloPropuesta[i]),0);
      propuestasList.push(propuesta);
    
    }
    
    for (uint i= 0; i < votanteAddress.length; i = i.add(1)){
    Votante memory votante = Votante (votanteAddress[i], address(0), 0, false);
    votantes[votanteAddress[i]] = votante;

    emit VotingStarted(owner(), conteoPropuestas);
    
    }

  }
   
  
  function getPropuesta(uint256 _propuestaIndex) public view PropuestaExistente(_propuestaIndex) returns(string memory _tituloPropuesta , uint _conteoVotos){
   (_tituloPropuesta , _conteoVotos) = (Bytes32ToString(propuestasList[_propuestaIndex].titulo), propuestasList[_propuestaIndex].conteoVotos);
  }

  function votar(address _votante , uint256 _propuestaIndex) external PropuestaExistente(_propuestaIndex) NoHayaVotado (msg.sender) returns(bool){
    Votante storage sender = votantes[_votante];
    require(msg.sender == _votante  || msg.sender == sender.delegate , "Sistema de votacion: Error no puedes votar");

    sender.voto = _propuestaIndex;
    propuestasList[_propuestaIndex].conteoVotos = (propuestasList[_propuestaIndex].conteoVotos.add(1));
    sender.voted = true;

    emit VotoCasted(_propuestaIndex , _votante);
    return true;
  }


  function DelegarVoto(address _to) external NoHayaVotado (msg.sender) returns(bool){
    require (_to != msg.sender,"No puedes delegar tu voto");
    Votante storage sender = votantes[msg.sender];
    require(sender.votante != address(0) , "Sistema de votacion: Esta direccion no puede votar");

    sender.delegate = _to;
    emit DelegateSuccesse(msg.sender , _to);
    return  true ;

  }


  function Ganador() external onlyOwner{
    delete propuestasGanadoras;
    uint256 ganadorConteoVotos = 0;
    uint256 winner = 0;

    for(uint i = 0; i < propuestasList.length; i= i.add(1) ){
      if (propuestasList[i].conteoVotos > ganadorConteoVotos){
        ganadorConteoVotos = propuestasList[i].conteoVotos;
        winner = i;
      }
    }

    propuestasGanadoras.push(winner);

    for(uint i = 0; i < propuestasList.length; i= i.add(1) ){
      if (propuestasList[i].conteoVotos == propuestasList[winner].conteoVotos && i != winner){
       
        propuestasGanadoras.push(i);
      }
  }
  }


  function getnombreGanador() external view returns (string[] memory _nombreGanadores){
    for(uint i = 0; i < propuestasGanadoras.length; i = i.add(1)){
       _nombreGanadores[i] = Bytes32ToString(propuestasList[propuestasGanadoras[i]].titulo);
    }
  }

  function GetPropuestasGanadores() external view returns(uint256[] memory){
    return propuestasGanadoras;
  }

   function StringToBytes32(string memory str) internal pure returns(bytes32){

    return bytes32(abi.encodePacked(str));
    }                                            // Funcion para pasar de string a bytes32                                 

   
   
   function Bytes32ToString(bytes32 byt) internal pure returns(string memory){
    return string(abi.encodePacked(byt));
    }                                                // Funcion para pasar de bytes32 a string

  }
