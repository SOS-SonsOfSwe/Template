import UniversityContract from '../../../../build/contracts/UserLogic'
import {
  browserHistory
} from 'react-router'
import store from '../../../store'
import * as utils from '../../../utils/validations'

import {
  USER_INSERTED
} from '../../reducers/costants'

const contract = require('truffle-contract')

// export const USER_INSERTED = 'USER_INSERTED'
//function userLoggedIn(user) 
function userInserted(YesOrNo) {
  return {
    type: USER_INSERTED,
    //payload: user
    payload: YesOrNo
  }
}

export function insertUser(FCInserted, UCInserted, tpInserted) {
  let web3 = store.getState()
    .web3.web3Instance

  // Double-check web3's status.
  if(typeof web3 !== 'undefined') {

    return function (dispatch) {
      // Using truffle-contract we create the authentication object.
      const university = contract(UniversityContract)
      university.setProvider(web3.currentProvider)

      // Declaring this for later so we can chain functions on Authentication.
      var universityInstance

      // Get current ethereum wallet.
      web3.eth.getCoinbase((error, coinbase) => {
        // Log errors, if any.
        if(error) {
          console.error(error);
        }

        university.deployed()
          .then(instance => {
            universityInstance = instance
            universityInstance.addUser(FCInserted, UCInserted, tpInserted, {
                from: coinbase,
                value: 100000000000000000
              })
              .then(result => {
                // yon.receipt.status ritorna lo stato dell'operazione: 0x01 se successo, 0x00 se fallito
                var yon = result.receipt.status;

                console.log(yon);

                dispatch(userInserted({
                  "YesOrNo": yon
                }))

                return browserHistory.push('/') | alert(UCInserted + " inserted as " + utils.userDef(parseInt(tpInserted, 10)))
              })

              .catch(function (result) {

              })
          })
      })
    }
  } else {
    console.error('Web3 is not initialized.');
  }
}