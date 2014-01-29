var mpns = require('mpns');
var azure=require("azure");
var edge = require('edge');
var config=require('./config.js');
var utility=require('./utility.js');
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var monk = require('monk');
 var mailer= require('./mailsender.js');

var db = monk(config.MONGO_CONNECTION_STRING);


function setRemainder(response,userID,remainder){
 
  
 var entity_update = {
   "RemainderMinute": remainder,
   "TimeStamp": new Date()
 };
mongo.MongoClient.connect(config.MONGO_CONNECTION_STRING, function(err, connection) {
   var collection = connection.collection('Registrations');
 collection.update({"UserID":userID}, {$set:entity_update}, function(error, result){
        if(error)
        {
          utility.log("setRemainder() error: " + error,'ERROR');
          response.setHeader("content-type", "text/plain");
          response.write('{\"Status\":\"Unsuccess\"}');
          response.end();
          connection.close();
        }
        else
        {
          utility.log("Set Remainder Successfully");
          response.setHeader("content-type", "text/plain");
          response.write('{\"Status\":\"Success\"}');
          response.end();
          connection.close();
        }
        
      });
});
}

function insertPushURL(response,url,userID){
  
  var entity_insert = {
   "Handle":url,
   "UserID":userID,
   "RemainderMinute": 10,
   "TimeStamp": new Date()
 };
 var entity_update = {
   "Handle":url,
   "TimeStamp": new Date()
 };
 mongo.MongoClient.connect(config.MONGO_CONNECTION_STRING, function(err, connection) {
  var collection = connection.collection('Registrations');
 collection.findOne({"UserID":userID}, function(error, result) {
  if(error)
  {
    utility.log("getUser() error: " + error,'ERROR');
    response.setHeader("content-type", "text/plain");
    response.write('{\"Status\":\"Unsuccess\"}');
    response.end();
    connection.close();
  }
  else
  {
    if(result == null)
    {

      collection.insert(entity_insert, function(error, result){
        if(error)
        {
          utility.log("insertPushURL() error: " + error,'ERROR');
          response.setHeader("content-type", "text/plain");
          response.write('{\"Status\":\"Unsuccess\"}');
          response.end();
          connection.close();
        }
        else
        {
          utility.log("Push URL inserted Successfully");
          response.setHeader("content-type", "text/plain");
          response.write('{\"Status\":\"Success\"}');
          response.end();
          connection.close();
        }
      });
    }
    else
    {
      collection.update({"UserID":userID}, {$set:entity_update}, function(error, result){
        if(error)
        {
          utility.log("updateRegister() error: " + error,'ERROR');
          response.setHeader("content-type", "text/plain");
          response.write('{\"Status\":\"Unsuccess\"}');
          response.end();
          connection.close();
        }
        else
        {
          utility.log("Push URL Updated Successfully");
          response.setHeader("content-type", "text/plain");
          response.write('{\"Status\":\"Success\"}');
          response.end();
          connection.close();
        }
        
      });
    }
  }
});
});
}

function insertCalendarEvent(response,Subject,Details,StartTime,EndTime,OrganizarName,OrganizarEmail,AttendeesName,AttendeesEmail,AccountName,AccountKind,Location,Status,IsPrivate,IsAllDayEvent)
{


 var entity = {
   "Subject":Subject,
   "Details": Details,
   "StartTime":StartTime, 
   "EndTime":EndTime, 
   "OrganizarName":OrganizarName, 
   "OrganizarEmail":OrganizarEmail, 
   "AttendeesName":AttendeesName, 
   "AttendeesEmail":AttendeesEmail, 
   "AccountName":AccountName, 
   "AccountKind":AccountKind, 
   "Location":Location, 
   "Status":Status, 
   "IsPrivate":IsPrivate, 
   "IsAllDayEvent":IsAllDayEvent
 };
mongo.MongoClient.connect(config.MONGO_CONNECTION_STRING, function(err, connection) {
  var collection = connection.collection('CalendarEvents'); 
 collection.insert(entity, function(error, result){
  if(error)
  {
    utility.log("insertCalendarEvent() error: " + error,'ERROR');
    response.setHeader("content-type", "text/plain");
    response.write('{\"Status\":\"Unsuccess\"}');
    response.end();
    connection.close();
  }
  else
  {
    utility.log("Calendar Event inserted Successfully");
    response.setHeader("content-type", "text/plain");
    response.write('{\"Status\":\"Success\"}');
    response.end();
    connection.close();
  }
});
});
}


/// User Creation Method Exposed here
//http://localhost:8080/user?userID=sumon@live.com&deviceID=1323809&firstName=Shams&lastName=Sumon%20Bhai&phoneNo=0181256341&masterEmail=sumon@live.com&location=Magura
function insertUser(response,userID,deviceID,firstName,lastName,phoneNo,masterEmail,password,location)
{


 
  var insert_entity = {
    "UserID": userID,
    "DeviceID": deviceID,
    "FirstName": firstName,
    "LastName": lastName,
    "PhoneNo": phoneNo,
    "MasterEmail": masterEmail,
    "Password": "",
    "Location": location,
    "RegistrationTime": new Date(),
    "IsBlackListed": false
  };
  var update_entity = {
    "UserID": userID,
    "DeviceID": deviceID,
    "FirstName": firstName,
    "LastName": lastName,
    "PhoneNo": phoneNo,
    "MasterEmail": masterEmail,
    "Password": "",
    "Location": location
  };


  utility.log('User object to add');
  utility.log(insert_entity);
  mongo.MongoClient.connect(config.MONGO_CONNECTION_STRING, function(err, connection) {
  var collection = connection.collection('Users');
  collection.findOne({"UserID":userID}, function(error, result) {
    if(error)
    {
      utility.log("getUser() error: " + error,'ERROR');
      response.setHeader("content-type", "text/plain");
      response.write('{\"Status\":\"Unsuccess\"}');
      response.end();
      connection.close();
    }
    else
    {
      if(result == null)
      {
        collection.insert(insert_entity, function(error, result){
          if(error)
          {
            utility.log("insertUser() error: " + error,'ERROR');
            response.setHeader("content-type", "text/plain");
            response.write('{\"Status\":\"Unsuccess\"}');
            response.end();
            connection.close();
          }
          else
          {
            utility.log("Invitation inserted Successfully");
            response.setHeader("content-type", "text/plain");
            response.write('{\"Status\":\"Success\"}');
            response.end();
            connection.close();
          }
        });
      }
      else
      {
       collection.update({"UserID":userID}, {$set:update_entity}, function(error, result){
        if(error)
        {
          utility.log("updateUser() error: " + error,'ERROR');
          response.setHeader("content-type", "text/plain");
          response.write('{\"Status\":\"Unsuccess\"}');
          response.end();
          connection.close();
        }
        else
        {
          utility.log("User Updated Successfully");
          response.setHeader("content-type", "text/plain");
          response.write('{\"Status\":\"Success\"}');
          response.end();
          connection.close();
        }
        
      });
     }
   }
 });
});
}

// http://localhost:8080/addemail?userID=sumon@live.com&emailID=sumon3@live.com
//// Add method to add User's Other Emails 
function insertEmailAddress(response,userID,emailID)
{
 
  var entity = {
    "UserID": userID,
    "EmailID": emailID
  };
mongo.MongoClient.connect(config.MONGO_CONNECTION_STRING, function(err, connection) {
 var collection = connection.collection('EmailAddresses');
  collection.insert(entity, function(error, result){
    if(error)
    {
      utility.log("insertEmailAddress() error: " + error,'ERROR');
      response.setHeader("content-type", "text/plain");
      response.write('{\"Status\":\"Unsuccess\"}');
      response.end();
      connection.close();
    }
    else
    {
      utility.log("Email(s) inserted Successfully");
      response.setHeader("content-type", "text/plain");
      response.write('{\"Status\":\"Success\"}');
      response.end();
      connection.close();
    }
  });
});
}


// http://localhost:8080/removeemail?userID=sumon@live.com&emailID=sumon3@live.com
//// Remove method to remove User's Other Emails
function deleteEmailAddress(response,userID,emailID)
{
  
  var entity = {
    "UserID": userID,
    "EmailID": emailID
  };
  mongo.MongoClient.connect(config.MONGO_CONNECTION_STRING, function(err, connection) {
  var collection = connection.collection('EmailAddresses');
  collection.remove(entity, function(error, result){
    if(error)
    {
      utility.log("deleteEmail() error: " + error,'ERROR');
      response.setHeader("content-type", "text/plain");
      response.write('{\"Status\":\"Unsuccess\"}');
      response.end();
      connection.close();
    }
    else
    {
      utility.log("Email Address deleted Successfully");
      response.setHeader("content-type", "text/plain");
      response.write('{\"Status\":\"Success\"}');
      response.end();
      connection.close();
    }
  });
});
}

// http://localhost:8080/editemail?userID=sumon@live.com&oldEmailID=sumon4@live.com&newEmailID=sumon3@live.com
function updateEmailAddress(response,userID,oldEmailID,newEmailID)
{
  
  var entity = {
    "EmailID": newEmailID
  };
   mongo.MongoClient.connect(config.MONGO_CONNECTION_STRING, function(err, connection) {
  var collection = connection.collection('EmailAddresses');
  collection.update({"UserID":userID,"EmailID":oldEmailID}, {$set:entity}, function(error,result){
    if(error)
    {
      utility.log("updateEmail() error: " + error,'ERROR');
      response.setHeader("content-type", "text/plain");
      response.write('{\"Status\":\"Unsuccess\"}');
      response.end();
      connection.close();
    }
    else
    {
      utility.log("EmailAddress updated Successfully");
      response.setHeader("content-type", "text/plain");
      response.write('{\"Status\":\"Success\"}');
      response.end();
      connection.close();
    }
  });
});
}

// http://localhost:8080/getemail?userID=sumon@live.com
function getEmailAddresses(response,userID)
{
  
  var entity = {
    "UserID":userID
  };
  mongo.MongoClient.connect(config.MONGO_CONNECTION_STRING, function(err, connection) {
    var collection = connection.collection('EmailAddresses');
  collection.find(entity).toArray(function(error,result){
    if(error)
    {
      utility.log("getEmail() error: " + error,'ERROR');
      response.setHeader("content-type", "text/plain");
      response.write('{\"Status\":\"UnSuccess\"}');
      response.end();
      connection.close();
    }
    else
    {
      utility.log(result);
      response.setHeader("content-type", "text/plain");
      response.write("{\"Emails\":" + JSON.stringify(result) + "}");
      response.end();
      connection.close();
    }
  });
});
}

// http://localhost:8080/addcalllog?userID=harun@live.com&startTime=2013-12-31%2016:00:00&endTime=2013-12-31%2016:10:00&callNo=+8801816745951
/// User Call Log History
function insertCallLog(response,userID,startTime,endTime,callNo)
{
  
  var entity = {
    "UserID": userID,
    "StartTime": startTime,
    "EndTime": endTime,
    "CallNo": callNo
  };
mongo.MongoClient.connect(config.MONGO_CONNECTION_STRING, function(err, connection) {
  var collection = connection.collection('CallLog');
  collection.insert(entity ,function(error,result){
    if(error)
    {
      utility.log("insertCallLog() error: " + error,'ERROR');
      response.setHeader("content-type", "text/plain");
      response.write('{\"Status\":\"Unsuccess\"}');
      response.end();
      connection.close();
    }
    else
    {
      utility.log("CallLog inserted Successfully");
      response.setHeader("content-type", "text/plain");
      response.write('{\"Status\":\"Success\"}');
      response.end();
      connection.close();
    }
  });
});
}

/// Mapping Dial In 
// http://localhost:8080/toll?area=Australia&dialInProvider=WebEx
// {"Tolls":[{"ID":1,"Area":"Australia","Number":"+61 29037 1692","Provider":"WebEx"}]}

function getTollNo(response,area,dialInProvider)
{
  
  var entity = {
    "Area": area,
    "Provider": dialInProvider
  };
mongo.MongoClient.connect(config.MONGO_CONNECTION_STRING, function(err, connection) {
  var collection = connection.collection('DialInNumbers');
  collection.findOne(entity, function(error, result) {
    if(error)
    {
      utility.log("getTollNo() error: " + error,'ERROR');
      response.setHeader("content-type", "text/plain");
      response.write('{\"Status\":\"Unsuccess\"}');
      response.end();
      connection.close();
    }
    else
    {
      utility.log(result);
      response.setHeader("content-type", "text/plain");
      response.write(JSON.stringify(result));
      response.end();
      connection.close();
    }
  });
});
}
function deleteDialInNumber(response,id){
  mongo.MongoClient.connect(config.MONGO_CONNECTION_STRING, function(err, connection) {
  var collection = connection.collection('DialInNumbers');
  collection.remove({_id:id},function(error, result) {
    if(error)
    {
      utility.log("deleteDialInNumber() error: " + error,'ERROR');
      response.setHeader("content-type", "text/plain");
      response.write('{\"Status\":\"Unsuccess\"}');
      response.end();
      connection.close();
    }
    else
    {
      utility.log("DialInNumber deleted successfully");
      response.setHeader("content-type", "application/json");
      response.write('{\"Status\":\"Successfully dleleted.\"}');
      response.end();
      connection.close();
    }
  });
});
}
function getDialInNumbers(response)
{
  mongo.MongoClient.connect(config.MONGO_CONNECTION_STRING, function(err, connection) {
  var collection = connection.collection('DialInNumbers');
    // var entity = {
    //   "Area": area,
    //   "Provider": dialInProvider
    // };

    collection.find({}).toArray( function(error, result) {
      if(error)
      {
        utility.log("getDialInNumbers() error: " + error,'ERROR');
        response.setHeader("content-type", "text/plain");
        response.write('{\"Status\":\"Unsuccess\"}');
        response.end();
        connection.close();
      }
      else
      {
          // utility.log(result);
          // response.setHeader("content-type", "text/html");
          // //response.write("{\"Tolls\":" + JSON.stringify(result) + "}");
          // var tb="<table>";
          // tb +="<tr><td>Area</td><td>Number</td><td>Provider</td></tr>";
          // for (var i = 0; i < result.length; i++) {
          //  tb +="<tr>"+ "<td>"+result[i].Area+"</td>"+"<td>"+result[i].Number+"</td>"+"<td>"+result[i].Provider +"</td>"+"</tr>";
          // };
          // tb += "</table>";
          // response.write(tb);
          // response.end();

          utility.log(result);
          response.setHeader("content-type", "application/json");
          response.write("{\"data\":" + JSON.stringify(result) + "}");
          response.end();
          connection.close();




        }
      });
});
}

function AddDialInNumbersAction(response,area,number,dialInProvider)
{
  //console.log(area+' : '+dialInProvider);
 
  var entity = {
    "Area": area,
    "Number":number,
    "Provider": dialInProvider
  };

    // if (entity.length == 0) {

    // } else {

    // }
mongo.MongoClient.connect(config.MONGO_CONNECTION_STRING, function(err, connection) {
   var collection = connection.collection('DialInNumbers');
    collection.insert(entity, function(error, result) {
      if(error)
      {
        utility.log("AddDialInNumbers() error: " + error,'ERROR');
        response.setHeader("content-type", "application/json");
        response.write('{\"Status\":\"Error in Adding !!!\"}');
        response.end();
        connection.close();
      }
      else
      {
        utility.log("AddDialInNumbers Success");
        response.setHeader("content-type", "application/json");
        response.write('{\"Status\":\"Successfully added.\"}');
        response.end();
        connection.close();
      }
    });
  });
  }

// Get user's call credit info
// http://localhost:8080/credit?userID=harun@live.com
// {"_id":"52d8fd70e4b04b3452b13eb3","UserID":"harun@live.com","Credit":100}

function getCreditBalance(response,userID)
{
 
  var entity = {
    "UserID": userID,
  };
mongo.MongoClient.connect(config.MONGO_CONNECTION_STRING, function(err, connection) {
   var collection = connection.collection('UserCredits');
  collection.findOne(entity, function(error, result) {
    if(error)
    {
      utility.log("getCreditBalance() error: " + error,'ERROR');
      response.setHeader("content-type", "text/plain");
      response.write('{\"Status\":\"Unsuccess\"}');
      response.end();
      connection.close();
    }
    else
    {
      utility.log(result);
      response.setHeader("content-type", "text/plain");
      response.write(JSON.stringify(result));
      response.end();
      connection.close();
    }
  });
});
}
function deductCreditBalance(response,userID){
    utility.log('Deduct credit balance for '+userID);


}
function getInvitations(response,userID,id){

  if( userID == null ) userID = 'sumon@live.com';
  if( id == null ) id = 0;
//console.log(config.MONGO_CONNECTION_STRING);
  mongo.MongoClient.connect(config.MONGO_CONNECTION_STRING, function(err, connection) {
    var Invitations = connection.collection('Invitations');
    var Invitees = connection.collection('Invitees');

    Invitees.find({ UserID: userID}).toArray(
    function (error, result) {
      if(error)
      {
        utility.log("Invitees find error: " + error,'ERROR');
        response.setHeader("content-type", "text/plain");
        response.write('{\"Status\":\"Unsuccess\"}');
        response.end();
        connection.close();
      }
      else
      {
        console.log(result);
        /////

          var Invitations_ids = [];
          for (var i = 0; i < result.length; i++) {
          Invitations_ids.push(result[i].Invitations_id);
          };

          Invitations.find({ _id: { $in : Invitations_ids}}).toArray(
          function (error, result) {
          if(error)
          {
          utility.log("Invitations find error: " + error,'ERROR');
          response.setHeader("content-type", "text/plain");
          response.write('{\"Status\":\"Unsuccess\"}');
          response.end();
          connection.close();
          }
          else
          {
          utility.log(result);
          response.setHeader("content-type", "text/plain");
          response.write("{\"invitations\":"+JSON.stringify(result)+"}");
          response.end();
          connection.close();
          }

          });

        /////
      }
    });
  });
}



function insertInvitationEntity(entity,addresses)
{
   mongo.MongoClient.connect(config.MONGO_CONNECTION_STRING, function(err, connection) {
  var Invitations = connection.collection('Invitations');
  var Invitees = connection.collection('Invitees');
  var EmailAddresses = connection.collection('EmailAddresses');

  Invitations.insert(entity, function(error, result) {
    if(error)
    {
      utility.log("insertInvitationEntity() error: " + error, 'ERROR');
      connection.close();
    }
    else
    {
      for (var i = 0; i < addresses.length; i++) {
        var emailID = addresses[i].address;
        EmailAddresses.findOne({EmailID: emailID}, function(error, result1){
          if(!error){
            if(result1==null){
              utility.log(emailID+' not found in white list');
                //send email
               
                mailer.sendMail(config.NOT_WHITELISTED_EMAIL_SUBJECT,config.NOT_WHITELISTED_EMAIL_BODY,emailID);
              connection.close();
            }
            else{
              var userID = result1.UserID;
              var entity = {
              "UserID": userID,
              "EmailID": emailID,
              "Invitations_id": result._id
            };
            Invitees.insert(entity,function(e,r){
              if(e){
                 utility.log("insert Invitee error: " + e, 'ERROR');
                 connection.close();
              }
              else
              {
               mailer.sendMail(config.ATTENDEE_EMAIL_SUBJECT,config.ATTENDEE_EMAIL_BODY,emailID);
               connection.close();
             }
            });
           
              
            }
            
          }
        });
      }
      utility.log("Invitation inserted Successfully");
    }

  });
});
}




function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes*60000);
}


/// Method to send/push notification to MPNS
function PushNotification(notificationRemainderTime)
{

mongo.MongoClient.connect(config.MONGO_CONNECTION_STRING, function(err, connection) {

  var Invitations = connection.collection('Invitations');
  var Invitees = connection.collection('Invitees');
  var Registrations = connection.collection('Registrations');
  var sttime = new Date(); //addMinutes(new Date(), -99999999);
  //console.log(sttime);
  var edtime = addMinutes(new Date(), notificationRemainderTime/(1000*60));
  //console.log(edtime);
  var invtime = {
    InvTime: {
      $gte: sttime,
      $lte: edtime
    }
  }

  Invitations.find(invtime).toArray( function(error, invites) {
    if(error)
    {
      utility.log("find Invitations error: " + error, 'ERROR');
      connection.close();
    }
    else
    {

      var pushInfo = [];
      for (var i = 0; i < invites.length; i++) {
         
        pushInfo["Subject"] = invites[i].Subject;
        pushInfo["Agenda"] = invites[i].Agenda;

          // Invitations_ids.push(invites[i]._id);
          Invitees.find({Invitations_id: invites[i]._id}).toArray( function(error, invitees) {
            if(error)
            {
              utility.log("find Invitees error: " + error, 'ERROR');
              connection.close();
            }
            else
            {
              
              for (var j = 0; j < invitees.length; j++) {
                
                pushInfo["UserID"] = invitees[j].UserID;

                Registrations.findOne({UserID: invitees[j].UserID.trim()}, function(error, registrations) {
                  if(error)
                  {
                    utility.log("find registration error: " + error, 'ERROR');
                    connection.close();
                  }
                  else
                  {
                    // console.log("Inv ID: "+invites[i]._id);
                    // console.log(invitees[j]);
                    // console.log(registrations);
                    if(registrations != null)
                    {
                      pushInfo["PushUrl"] = registrations.Handle;
                      var tileObj = {
                                'title': pushInfo["Subject"],
                                'backTitle': "Next Conference",
                                'backBackgroundImage': "/Assets/Tiles/BackTileBackground.png",
                                'backContent': pushInfo["Agenda"]
                                };
                    mpns.sendTile(pushInfo["PushUrl"], tileObj, function(){utility.log('Pushed to ' + pushInfo["UserID"]);});
                    connection.close();
                    } 
                    // else {
                    //   pushInfo["PushUrl"] =null;
                    //   utility.log("Can't find push URL for "+pushInfo["UserID"]+" . so can't push notification.",'WARNING');
                    // }
                    // console.log(pushInfo);

                  }
                });
              }
            }
          });
          
        }
        
        //return JSON.stringify(result);
        // response.setHeader("content-type", "text/plain");
        // response.write("{\"Tolls\":" + JSON.stringify(result.Toll) + "}");
        // response.end();
      }

    });



});

}


//// Not used now.
function getNotifications(response)
{
    //console.log(new Date(Date.parse('2013-12-12T06:13:16.189Z')));
    var TimeFrom=new Date();
    var TimeTo=new Date(TimeFrom.getTime()+config.NOTIFICATION_DURATION);
    utility.log(TimeFrom+"-"+TimeTo);
    var TABLE_NAME="Invitations";   
    var tableService = azure.createTableService(config.STORAGE_ACCOUNT_NAME, config.STORAGE_ACCOUNT_KEY);
    var query = azure.TableQuery
    .select(subject)
    .from(TABLE_NAME)
    .where('Time gt ?', TimeFrom)
    .and('Time lt ?',TimeTo);
    var invites={"Success":"OK"};
    tableService.queryEntities(query, function(error, entities){
      if(!error){
        //entities contains an array of entities
        utility.log(entities);
        //return JSON.stringify(entities);
        response.setHeader("content-type", "text/plain");
        response.write(JSON.stringify(entities));
        response.end();
      }
      else
      {
       utility.log(error,'ERROR');
       invites = {"Error":error};
       response.setHeader("content-type", "text/plain");
       response.write(JSON.stringify(invites));
       response.end();
     }
   });
    
  }

//////////////////////////////


/// Exposes all methods to call outsite this file, using its object   
exports.insertUser=insertUser;
exports.insertEmailAddress=insertEmailAddress;
exports.deleteEmailAddress=deleteEmailAddress;
exports.insertCallLog=insertCallLog;
//exports.insertPushURL=insertPushURL;
exports.insertInvitationEntity=insertInvitationEntity;
exports.getInvitations=getInvitations;
exports.PushNotification=PushNotification
exports.getNotifications=getNotifications;
exports.getTollNo=getTollNo;
exports.updateEmailAddress=updateEmailAddress;
exports.getEmailAddresses=getEmailAddresses;
exports.getCreditBalance=getCreditBalance;
exports.deductCreditBalance=deductCreditBalance;
exports.AddDialInNumbersAction=AddDialInNumbersAction;
exports.getDialInNumbers=getDialInNumbers;
exports.deleteDialInNumber=deleteDialInNumber;
exports.insertCalendarEvent=insertCalendarEvent;
exports.insertPushURL=insertPushURL;
exports.setRemainder=setRemainder;
//exports.mongotestm=mongotestm;
