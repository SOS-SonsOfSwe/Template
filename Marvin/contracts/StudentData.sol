pragma solidity ^0.4.2;
import "./ContractManager.sol";

contract StudentData {
    address uniAddress;
    ContractManager manager;
    
    mapping (address => bytes10) degreeClassStudents;
    
    /* Student accepted tests result
     * key = student badgeNumber, value = uniCodes of passed exams */
    mapping(uint32 => bytes10[]) acceptedResults;

    /* Student subscribed exams
     * key = student badgeNumber, value = uniCodes of subscribed exams */
    mapping(uint32 => bytes10[]) subscribedExams;

    constructor(address _contractManagerAddress) public {
        uniAddress = msg.sender;
        manager = ContractManager(_contractManagerAddress);
    }
    
    modifier onlyStudentContract() {
        require(msg.sender == manager.getStudentContract());
        _;
    }

    function getStudentDegreeClass(address _studentAddress) public view onlyStudentContract returns(bytes10) {
        return(degreeClassStudents[_studentAddress]);
    }

    // return all the accepted student results
    function getAcceptedResults(uint32 _studentBadgeNumber) public view onlyStudentContract returns(bytes10[]) {
        return(acceptedResults[_studentBadgeNumber]);
    }

    function getSubscribedExams(uint32 _studentBadgeNumber) public view onlyStudentContract returns(bytes10[]) {
        return(subscribedExams[_studentBadgeNumber]);
    }

    // return the number of accepted student results
    function getAcceptedResultNumber(uint32 _studentBadgeNumber) public view onlyStudentContract returns(uint) {
        return(acceptedResults[_studentBadgeNumber].length);
    }

    function addAcceptedResult(bytes10 _classUniCode, uint32 _studentBadgeNumber) public onlyStudentContract {
        acceptedResults[_studentBadgeNumber].push(_classUniCode);
    }

    function addSubscribedExam(bytes10 _examUniCode, uint32 _studentBadgeNumber) public onlyStudentContract {
        subscribedExams[_studentBadgeNumber].push(_examUniCode);
    }

    // Admin o Student?
    function setStudentDegree(address _studentAddress, bytes10 _degreeUniCode) public {
        require(degreeClassStudents[_studentAddress] == 0);
        degreeClassStudents[_studentAddress] = _degreeUniCode;
    }
}