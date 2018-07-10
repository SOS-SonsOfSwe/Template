/*jshint loopfunc:true*/
import "regenerator-runtime/runtime"; // needed for async calls
import ClassContract from '../../../../build/contracts/ClassData'
import StudentDataContract from '../../../../build/contracts/StudentData'
import { browserHistory } from 'react-router'
import store from '../../../store'
import { EXAMS as req } from "../../reducers/costants/studentCostants";

// import { web3HexToInt } from '../../../utils/validations'

import {
  readingData,
  dataRead,
  dataEmpty,
  errorReadingData
} from '../StandardDispatches/readingData'

import ipfsPromise from '../../../../api/utils/ipfsPromise'

const contract = require('truffle-contract')

function doAwesomeStuff(dispatch, load) {
  dispatch(dataRead({ load }, req))
  var currentLocation = browserHistory.getCurrentLocation()
  if('redirect' in currentLocation.query) {
    //return browserHistory.push(decodeURIComponent(currentLocation.query.redirect))
    return browserHistory.replace('/profile')
  }
  // return browserHistory.push('/profile/degrees') //|| alert(payload.FC + " successfully logged in as " + utils.userDef(payload.tp) + " with badge number: " + payload.badgeNumber)
}

async function processIPFSResultParallel(ipfs, payload) {
  const promises = payload.map(item => ipfs.getJSON(item.load)
    .then(result => {
      // here I overwrite the description information with the JSON returning from the ipfs
      item.load = result
    }))
  await Promise.all(promises)
}

export function readStudentExamsFromDatabase(badgeNumber) {
  let web3 = store.getState()
    .web3.web3Instance

  if(typeof web3 !== 'undefined') {

    return function (dispatch) {
      // Using truffle-contract we create the authentication object.
      const studentData = contract(StudentDataContract)
      studentData.setProvider(web3.currentProvider)

      const sClass = contract(ClassContract)
      sClass.setProvider(web3.currentProvider)

      // Declaring this for later so we can chain functions on Authentication.
      var studentDataInstance
      var classInstance

      // Get current ethereum wallet.
      web3.eth.getCoinbase((error, coinbase) => {

        dispatch(readingData(req))

        // Log errors, if any.
        if(error) {
          console.error(error);
        }

        studentData.deployed()
          .then(function (instance) {
            studentDataInstance = instance

            // Attempt to read exams per class/class

            studentDataInstance.getStudentDegree(badgeNumber, { from: coinbase })
              // .then(console.log)
              .then(degree => {
                sClass.deployed()
                  .then(function (instance) {
                    classInstance = instance
                    classInstance.getClasses(degree, { from: coinbase })
                      .then(classes => {
                        var i = 0;
                        var payload
                        console.error('badgeNumber: ' + badgeNumber)
                        for(let sclass of classes) {
                          var classUnicode = web3.toUtf8(sclass)
                          classInstance.getClassExamsData(classUnicode, { from: coinbase })
                            .then(result => {
                              // result[0] = examHashcode
                              // result[1] = examsTeacher
                              // result[2] = examUnicode

                              console.log('EXAMS READ RESULT: ')
                              console.log(result)

                              if(result[0].length === 0 && i === 0) {
                                dispatch(dataEmpty(req))
                              } else {

                                var hashIPFS
                                for(let j = 0; j < result[0].length; j++) {
                                  var exam = result[2][j]
                                  var hash = result[0][j]
                                  var teac = web3.toDecimal(result[1][j])
                                  console.log("teacher: " + teac)
                                  var exUni = web3.toUtf8(exam)
                                  // console.log('dgr: ' + dgr)
                                  hashIPFS = ipfsPromise.getIpfsHashFromBytes32(hash)
                                  // i'm storing the informations inside the description. We will retrieve them later.
                                  if(i === 0) { // first element of array
                                    payload = [{ load: hashIPFS, examUnicode: exUni, teacher: teac }, ]
                                  } else
                                    payload = [...payload,
                                      { load: hashIPFS, examUnicode: exUni, teacher: teac }
                                    ]
                                  i++
                                }
                              }
                            })
                            .catch(function (error) {
                              // If error, go to signup page.
                              console.error('Error while reading exams.')
                              console.log(error)
                              dispatch(errorReadingData(req))
                              // return browserHistory.push('/profile')
                            })
                        }
                        // here I dispatch all the exams the student is registered to
                        var ipfs = new ipfsPromise()
                        processIPFSResultParallel(ipfs, payload)
                          .then(result => {
                            payload.sort((a, b) => b.load.date - a.load.date)
                            return doAwesomeStuff(dispatch, payload)
                          })
                          .catch(function (error) {
                            // If error, go to signup page.
                            console.error('Error while reading ipfs informations.')
                            console.log(error)
                            dispatch(errorReadingData(req))
                            // return browserHistory.push('/profile')
                          })
                      })
                      .catch(function (error) {
                        // If error, go to signup page.
                        console.error('Error while reading classes.')
                        console.log(error)
                        dispatch(errorReadingData(req))
                        // return browserHistory.push('/profile')
                      })
                  })
                  .catch(function (error) {
                    // If error, go to signup page.
                    console.error('Error while deploying class contract.\n')
                    console.log(error)
                    dispatch(errorReadingData(req))
                    // return browserHistory.push('/profile')
                  })
              })
              .catch(function (error) {
                // If error, go to signup page.
                console.error('Error while reading degree.\n')
                console.log(error)
                dispatch(errorReadingData(req))
                // return browserHistory.push('/profile')
              })
          })
          .catch(function (error) {
            // If error, go to signup page.
            console.error('Error while deploying studentData.\n')
            console.log(error)
            dispatch(errorReadingData(req))
            // return browserHistory.push('/profile')
          })
      })
    }
  } else {
    console.error('Web3 is not initialized.');
  }
}