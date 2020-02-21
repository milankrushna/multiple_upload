var express = require('express');
var router = express.Router();
var firebase = require('firebase');
var moment = require('moment');
require('firebase/auth');
require('firebase/database');
require('./config');
firebase.initializeApp(global.config, 'spaywall');
// fire base admin
var admin = require("firebase-admin");
var serviceAccount = require("../firebasekey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: ""
}, 'paywall');
const FirebaseREST = require('firebase-rest').default;
var jsonClient = new FirebaseREST.JSONClient(global.dburl, { auth: global.dbauth });
var jsonClientOrbocare = new FirebaseREST.JSONClient(global.config.orbocareDatabaseURL, { auth: global.config.orbocareAuthKey });
// end of the firebase admin
var auth = firebase.auth();
/* GET users listing. */



router.post('/', function (req, res, next) {
  var db = firebase.database();
  console.log(req.body);

  //code for  the date management
  //console.log("INIAN TIME"+date.toISOString());
  //console.log("MY TARGET DATE IS:"+date);
  var days = 1; // Days you want to subtract
  var date = new Date();
  var last = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000))

  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }
  var today = dd + '/' + mm + '/' + yyyy;


  //var adminuid ='Sidt5KKpPqfmC67CHECtG5Gt8Zl1';
  //var adminuid  = 'gn8jPdAU4GRzGRbpLQPGSXJfR2L2';
  var adminuid = 'krKk3Y6Vktf4jDUe5GzfLLwTE243';
  //console.log("I WILL UPDATE DAT A OF "+ftoday);

  //////////////////// codefor the date mangement//

  let sample_id = "";
  if (req.body.sample_id) {
    sample_id = req.body.sample_id;
  }

  var franchise_id = req.body.franchise_id;

  var amount = parseFloat(req.body.amount);

  var db = firebase.database();

  db.ref("usersettings")
    .orderByChild("orbo_id")
    .equalTo(req.body.uid)
    .once("value")
    .then((snapshot) => {

      //console.log(snapshot);
      let holidaying = [];
      snapshot.forEach((child) => {
        let respon = child.val();
        //    console.log(val.uid);
        //	console.log(respon);

        jsonClient.get("/wallet/" + respon.wallet_id).then(function (walletmsg) {
          //    console.log(walletmsg);

          vwallet = parseFloat(walletmsg.body.virtualBalance);
          console.log(vwallet);
          console.log(franchise_id);
          if (vwallet < amount && franchise_id != '') {
            jsonClientOrbocare.get("/agents/" + franchise_id).then(function (franchiseOrboInfo) {
              
              if (franchiseOrboInfo.body && franchiseOrboInfo.body['fo']) {
		res.send({ status: 0, 'message': 'Insufficient Wallet Balance.' });
                //add amount to vendor wallet from franchise and then deduct for sample registration
               /* db.ref("/usersettings/").orderByChild("orbo_id").equalTo(franchise_id).once("value", function (franchiseUserInfo) {
                  var franchiseKey = Object.keys(franchiseUserInfo.val())[0];
                  var franchiseUserDetails = franchiseUserInfo.val()[franchiseKey];
                  console.log(franchiseUserDetails);
                  if (franchiseUserDetails && franchiseUserDetails['wallet_id']) {
                    db.ref("/wallet/" + franchiseUserDetails['wallet_id']).once("value", function (franchiseWalletInfo) {
                      var franchiseWalletDetails = franchiseWalletInfo.val();
                      var franchiseWalletBal = franchiseWalletDetails['virtualBalance'];
                      console.log(franchiseWalletBal);
                      if(franchiseWalletBal >= amount){
                      var franNewBalance = franchiseWalletBal - parseFloat(amount);
                      var franchiseUpdatedData = {
                        virtualBalance: franNewBalance,
                        updated_by: 'Transaction API data',
                        updated_date: new Date().toISOString()
                      }
                      jsonClient.update("/wallet/" + franchiseUserDetails['wallet_id'], franchiseUpdatedData).then(function (responwa) {
                        var newbal = parseFloat(vwallet) + parseFloat(amount);

                        var updatedata = {
                          virtualBalance: newbal,
                          updated_by: 'Transaction API data',
                          updated_date: new Date().toISOString()
                        }
                        jsonClient.update("/wallet/" + respon.wallet_id, updatedata).then(function (responwa) {
                          // res.send({status:1,'message':'Wallet Updated'});
                          var translog = {
                            amount: amount,
                            prev_bal: franchiseWalletBal,
                            "newbal": franNewBalance,
                            actual_amt: amount,
                            gst: 0,
                            mdr: 0,
                            type: "DEBIT",
                            wallet_id: franchiseUserDetails.wallet_id,
                            vendor_id: franchise_id,
                            customerReceiptUrl: 'NA',
                            formattedPan: amount + "  added to " + respon.name +" for sample registration",
                            updated_by: amount + "  added to " + respon.name +" for sample registration",
                            updated_date: new Date().toISOString(),
                            customername: franchiseUserDetails.name,
                            device_serail: "",
                            uid: franchiseUserDetails.uid,
                            vendorname: franchiseUserDetails.name,
                            email: franchiseUserDetails.email,
                            entry_date: today
                          }
                          var vendorTranslog = {
                            amount: amount,
                            prev_bal: vwallet,
                            "newbal": newbal,
                            actual_amt: amount,
                            gst: 0,
                            mdr: 0,
                            type: "CREDIT",
                            wallet_id: respon.wallet_id,
                            vendor_id: respon.uid,
                            customerReceiptUrl: 'NA',
                            formattedPan: amount + " added by " + franchiseOrboInfo.body['name'] +" for sample registration",
                            updated_by: amount + "  added by " + franchiseOrboInfo.body['name']+ " for sample registration",
                            updated_date: new Date().toISOString(),
                            customername: respon.name,
                            device_serail: '',
                            uid: respon.uid,
                            vendorname: respon.name,
                            email: respon.email,
                            entry_date: today
                          }
                          jsonClient.post("/translog/" + respon.uid, vendorTranslog).then(function () {
                            jsonClient.post("/translog/" + franchiseUserDetails.uid, translog).then(function () {
                              var newBalance = newbal - parseFloat(amount);
                              var updatedata = {
                                virtualBalance: newBalance,
                                updated_by: 'Transaction API data',
                                updated_date: new Date().toISOString()
                              }
                              jsonClient.update("/wallet/" + respon.wallet_id, updatedata).then(function (responwa) {
                                // res.send({status:1,'message':'Wallet Updated'});
                                var translog = {
                                  amount: amount,
                                  prev_bal: newbal,
                                  "newbal": newBalance,
                                  actual_amt: amount,
                                  gst: 0,
                                  mdr: 0,
                                  type: "DEBIT",
                                  wallet_id: respon.wallet_id,
                                  vendor_id: respon.uid,
                                  customerReceiptUrl: 'NA',
                                  formattedPan: 'PAYBY WALLET',
                                  updated_by: 'AGENT PAY BY WALLET',
                                  updated_date: new Date().toISOString(),
                                  customername: respon.name,
                                  device_serail: respon.deviceSerial,
                                  uid: respon.uid,
                                  sample_id: sample_id,
                                  vendorname: respon.name,
                                  email: respon.email,
                                  entry_date: today
                                }
                                jsonClient.post("/translog/" + respon.uid, translog);
                                var franchise_amount = parseFloat(req.body.franchise_amount);
                                var franewbal = franNewBalance + franchise_amount;
                                

                            var fraupdatedata = {
                              virtualBalance: franewbal,
                              updated_by: 'Transaction API data',
                              updated_date: new Date().toISOString()
                            }
                            jsonClient.update("/wallet/" + franchiseUserDetails['wallet_id'], fraupdatedata).then(function (fraresponwa) {
                              // res.send({status:1,'message':'Wallet Updated'});

                              var fratranslog = {
                                amount: franchise_amount,
                                "prev_bal": franNewBalance,
                                 "newbal": franewbal,
                                actual_amt: franchise_amount,
                                gst: 0,
                                mdr: 0,
                                type: "CREDIT",
                                wallet_id: franchiseUserDetails.wallet_id,
                                vendor_id: franchiseUserDetails.uid,
                                customerReceiptUrl: 'NA',
                                formattedPan: 'COMISSION THROUGH ' + respon.name,
                                updated_by: 'AGENT PAY BY WALLET',
                                updated_date: new Date().toISOString(),
                                customername: franchiseUserDetails.name,
                                device_serail: "",
                                sample_id: sample_id,
                                uid: franchiseUserDetails.uid,
                                vendorname: franchiseUserDetails.name,
                                email: franchiseUserDetails.email,
                                entry_date: today
                              }
                              jsonClient.post("/translog/" + franchiseUserDetails.uid, fratranslog).then(data=>{
                                jsonClient.get("/usersettings/" + adminuid).then(function (adrespon) {
                                  jsonClient.get("/wallet/" + adrespon.body.wallet_id).then(function (adwalletmsg) {
                                    //  console.log(adwalletmsg);
                                    var adnewbal = parseFloat(adwalletmsg.body.virtualBalance) + amount;
                
                                    var admtranslog = {
                                      amount: amount,
                                      actual_amt: amount,
                                      gst: 0,
                                      type: "CREDIT",
                                      mdr: 0,
                                      wallet_id: adrespon.body.wallet_id,
                                      vendor_id: respon.uid,
                                      customerReceiptUrl: 'NA',
                                      formattedPan: 'PAYBY WALLET',
                                      updated_by: 'AGENT PAY BY WALLET',
                                      updated_date: new Date().toISOString(),
                                      customername: respon.name,
                                      device_serail: respon.deviceSerial,
                                      uid: adminuid,
                                      vendorname: adrespon.body.name,
                                      sample_id: sample_id,
                                      email: adrespon.body.email,
                                      entry_date: today
                                    }
                
                                    console.log(admtranslog)
                                    jsonClient.post("/translog/" + adminuid, admtranslog);
                
                                    var adupdatedata = {
                                      virtualBalance: adnewbal,
                                      updated_by: 'Transaction API data',
                                      updated_date: new Date().toISOString()
                                    }
                                    jsonClient.update("/wallet/" + adrespon.body.wallet_id, adupdatedata).then(function (adrespon) {
                                      res.send({ status: 1, 'message': 'Wallet Updated' });
                
                                    });
                                  });
                                });
                              })

                            });
                              });
                            });

                          });
                        });
                      });
                    }else{
                      res.send({ status: 0, 'message': 'Insufficient Wallet Balance.' });
                    }
                    })
                  }else{
                    res.send({ status: 0, 'message': 'Invalid Franchise Details' });
                  }
                })*/
              }else{
                if (vwallet >= amount) {

                  var newbal = vwallet - amount;
    
                  var updatedata = {
                    virtualBalance: newbal,
                    updated_by: 'Transaction API data',
                    updated_date: new Date().toISOString()
                  }
    
                  jsonClient.update("/wallet/" + respon.wallet_id, updatedata).then(function (responwa) {
                    // res.send({status:1,'message':'Wallet Updated'});
    
                    var translog = {
                      amount: amount,
                      prev_bal: vwallet,
                      "newbal": newbal,
                      actual_amt: amount,
                      gst: 0,
                      mdr: 0,
                      type: "DEBIT",
                      wallet_id: respon.wallet_id,
                      vendor_id: respon.uid,
                      customerReceiptUrl: 'NA',
                      formattedPan: 'PAYBY WALLET',
                      updated_by: 'AGENT PAY BY WALLET',
                      updated_date: new Date().toISOString(),
                      customername: respon.name,
                      device_serail: respon.deviceSerial,
                      uid: respon.uid,
                      sample_id: sample_id,
                      vendorname: respon.name,
                      email: respon.email,
                      entry_date: today
                    }
                    jsonClient.post("/translog/" + respon.uid, translog);
    
                    if (!franchise_id) {
                      console.log("NO AVAILABLE");
                    } else {
                      if (franchise_id != '') {
    
                        var franchise_amount = parseFloat(req.body.franchise_amount);
    
                        db.ref("usersettings")
                          .orderByChild("orbo_id")
                          .equalTo(franchise_id)
                          .once("value")
                          .then((snapshot) => {
    
                            //console.log(snapshot);
                            let holidaying = [];
                            snapshot.forEach((frachild) => {
                              let frarespon = frachild.val();
                              //    console.log(val.uid);
                              //	console.log(respon);
    
                              jsonClient.get("/wallet/" + frarespon.wallet_id).then(function (frawalletmsg) {
                                //    console.log(walletmsg);
    
                                frawallet = parseFloat(frawalletmsg.body.virtualBalance);
    
    
                                var franewbal = frawallet + franchise_amount;
    
                                var fraupdatedata = {
                                  virtualBalance: franewbal,
                                  updated_by: 'Transaction API data',
                                  updated_date: new Date().toISOString()
                                }
    
                                jsonClient.update("/wallet/" + frarespon.wallet_id, fraupdatedata).then(function (fraresponwa) {
                                  // res.send({status:1,'message':'Wallet Updated'});
    
                                  var fratranslog = {
                                    amount: franchise_amount,
                                    "prev_bal": frawallet, "newbal": franewbal,
                                    actual_amt: franchise_amount,
                                    gst: 0,
                                    mdr: 0,
                                    type: "CREDIT",
                                    wallet_id: frarespon.wallet_id,
                                    vendor_id: respon.uid,
                                    customerReceiptUrl: 'NA',
                                    formattedPan: 'COMISSION THROUGH ' + respon.name,
                                    updated_by: 'AGENT PAY BY WALLET',
                                    updated_date: new Date().toISOString(),
                                    customername: respon.name,
                                    device_serail: respon.deviceSerial,
                                    uid: frarespon.uid,
                                    sample_id: sample_id,
                                    vendorname: frarespon.name,
                                    email: frarespon.email,
                                    entry_date: today
                                  }
                                  jsonClient.post("/translog/" + frarespon.uid, fratranslog);
    
    
                                });
                              });
                            });
                          });
                      }
    
    
    
                    }
    
    
                    // end of franchise
    
                    /// start of the code for admin wallet
    
    
                    jsonClient.get("/usersettings/" + adminuid).then(function (adrespon) {
                      jsonClient.get("/wallet/" + adrespon.body.wallet_id).then(function (adwalletmsg) {
                        //  console.log(adwalletmsg);
                        var adnewbal = parseFloat(adwalletmsg.body.virtualBalance) + amount;
    
                        var admtranslog = {
                          amount: amount,
                          actual_amt: amount,
                          gst: 0,
                          type: "CREDIT",
                          mdr: 0,
                          wallet_id: adrespon.body.wallet_id,
                          vendor_id: respon.uid,
                          customerReceiptUrl: 'NA',
                          formattedPan: 'PAYBY WALLET',
                          updated_by: 'AGENT PAY BY WALLET',
                          updated_date: new Date().toISOString(),
                          customername: respon.name,
                          device_serail: respon.deviceSerial,
                          uid: adminuid,
                          vendorname: adrespon.body.name,
                          sample_id: sample_id,
                          email: adrespon.body.email,
                          entry_date: today
                        }
    
                        console.log(admtranslog)
                        jsonClient.post("/translog/" + adminuid, admtranslog);
    
                        var adupdatedata = {
                          virtualBalance: adnewbal,
                          updated_by: 'Transaction API data',
                          updated_date: new Date().toISOString()
                        }
                        jsonClient.update("/wallet/" + adrespon.body.wallet_id, adupdatedata).then(function (adrespon) {
                          res.send({ status: 1, 'message': 'Wallet Updated' });
    
                        });
                      });
                    });
    
    
                    ///// end of thecode fo r admin wallt
    
                  });
    
    
    
                } else {
                  res.send({ status: 0, 'message': 'Insufficient Wallet Balance.' });
                }
              }
            })
          } else {
            if (vwallet >= amount) {

              var newbal = vwallet - amount;

              var updatedata = {
                virtualBalance: newbal,
                updated_by: 'Transaction API data',
                updated_date: new Date().toISOString()
              }

              jsonClient.update("/wallet/" + respon.wallet_id, updatedata).then(function (responwa) {
                // res.send({status:1,'message':'Wallet Updated'});

                var translog = {
                  amount: amount,
                  prev_bal: vwallet,
                  "newbal": newbal,
                  actual_amt: amount,
                  gst: 0,
                  mdr: 0,
                  type: "DEBIT",
                  wallet_id: respon.wallet_id,
                  vendor_id: respon.uid,
                  customerReceiptUrl: 'NA',
                  formattedPan: 'PAYBY WALLET',
                  updated_by: 'AGENT PAY BY WALLET',
                  updated_date: new Date().toISOString(),
                  customername: respon.name,
                  device_serail: respon.deviceSerial,
                  uid: respon.uid,
                  sample_id: sample_id,
                  vendorname: respon.name,
                  email: respon.email,
                  entry_date: today
                }
                jsonClient.post("/translog/" + respon.uid, translog);

                if (!franchise_id) {
                  console.log("NO AVAILABLE");
                } else {
                  if (franchise_id != '') {

                    var franchise_amount = parseFloat(req.body.franchise_amount);

                    db.ref("usersettings")
                      .orderByChild("orbo_id")
                      .equalTo(franchise_id)
                      .once("value")
                      .then((snapshot) => {

                        //console.log(snapshot);
                        let holidaying = [];
                        snapshot.forEach((frachild) => {
                          let frarespon = frachild.val();
                          //    console.log(val.uid);
                          //	console.log(respon);

                          jsonClient.get("/wallet/" + frarespon.wallet_id).then(function (frawalletmsg) {
                            //    console.log(walletmsg);

                            frawallet = parseFloat(frawalletmsg.body.virtualBalance);


                            var franewbal = frawallet + franchise_amount;

                            var fraupdatedata = {
                              virtualBalance: franewbal,
                              updated_by: 'Transaction API data',
                              updated_date: new Date().toISOString()
                            }

                            jsonClient.update("/wallet/" + frarespon.wallet_id, fraupdatedata).then(function (fraresponwa) {
                              // res.send({status:1,'message':'Wallet Updated'});

                              var fratranslog = {
                                amount: franchise_amount,
                                "prev_bal": frawallet, "newbal": franewbal,
                                actual_amt: franchise_amount,
                                gst: 0,
                                mdr: 0,
                                type: "CREDIT",
                                wallet_id: frarespon.wallet_id,
                                vendor_id: respon.uid,
                                customerReceiptUrl: 'NA',
                                formattedPan: 'COMISSION THROUGH ' + respon.name,
                                updated_by: 'AGENT PAY BY WALLET',
                                updated_date: new Date().toISOString(),
                                customername: respon.name,
                                device_serail: respon.deviceSerial,
                                uid: frarespon.uid,
                                sample_id: sample_id,
                                vendorname: frarespon.name,
                                email: frarespon.email,
                                entry_date: today
                              }
                              jsonClient.post("/translog/" + frarespon.uid, fratranslog);


                            });
                          });
                        });
                      });
                  }



                }


                // end of franchise

                /// start of the code for admin wallet


                jsonClient.get("/usersettings/" + adminuid).then(function (adrespon) {
                  jsonClient.get("/wallet/" + adrespon.body.wallet_id).then(function (adwalletmsg) {
                    //  console.log(adwalletmsg);
                    var adnewbal = parseFloat(adwalletmsg.body.virtualBalance) + amount;

                    var admtranslog = {
                      amount: amount,
                      actual_amt: amount,
                      gst: 0,
                      type: "CREDIT",
                      mdr: 0,
                      wallet_id: adrespon.body.wallet_id,
                      vendor_id: respon.uid,
                      customerReceiptUrl: 'NA',
                      formattedPan: 'PAYBY WALLET',
                      updated_by: 'AGENT PAY BY WALLET',
                      updated_date: new Date().toISOString(),
                      customername: respon.name,
                      device_serail: respon.deviceSerial,
                      uid: adminuid,
                      vendorname: adrespon.body.name,
                      sample_id: sample_id,
                      email: adrespon.body.email,
                      entry_date: today
                    }

                    console.log(admtranslog)
                    jsonClient.post("/translog/" + adminuid, admtranslog);

                    var adupdatedata = {
                      virtualBalance: adnewbal,
                      updated_by: 'Transaction API data',
                      updated_date: new Date().toISOString()
                    }
                    jsonClient.update("/wallet/" + adrespon.body.wallet_id, adupdatedata).then(function (adrespon) {
                      res.send({ status: 1, 'message': 'Wallet Updated' });

                    });
                  });
                });


                ///// end of thecode fo r admin wallt

              });



            } else {
              res.send({ status: 0, 'message': 'Insufficient Wallet Balance.' });
            }
          }
        });
      });
    });

  //res.send({"status": 1,"message" : "WALLETS UPDATED"});




});
//res.send({"status": 1,"message" : "WALLETS UPDATED"});

module.exports = router;
