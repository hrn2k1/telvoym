var mpns = require('mpns');
var azure=require("azure");
var edge = require('edge');
var config=require('./config.js');
var utility=require('./utility.js');
var mongo = require('mongodb');
var monk = require('monk');


var db = monk(config.MONGO_CONNECTION_STRING);



/// User Creation Method Exposed here
//http://localhost:8080/user?userID=sumon@live.com&deviceID=1323809&firstName=Shams&lastName=Sumon%20Bhai&phoneNo=0181256341&masterEmail=sumon@live.com&location=Magura
function insertUser(response,userID,deviceID,firstName,lastName,phoneNo,masterEmail,password,location)
{

  db.open(function(err, db) {
  var collection = db.get('Users');
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
    collection.findOne({"UserID":userID}, function(error, result) {
        if(error)
        {
          utility.log("getUser() error: " + error,'ERROR');
          response.setHeader("content-type", "text/plain");
          response.write('{\"Status\":\"Unsuccess\"}');
          response.end();
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
                    }
                    else
                    {
                      utility.log("Invitation inserted Successfully");
                      response.setHeader("content-type", "text/plain");
                      response.write('{\"Status\":\"Success\"}');
                      response.end();
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
                    }
                    else
                    {
                      utility.log("User Updated Successfully");
                      response.setHeader("content-type", "text/plain");
                      response.write('{\"Status\":\"Success\"}');
                      response.end();
                    }
                    db.close();
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
  var collection = db.get('EmailAddresses');
  var entity = {
      "UserID": userID,
      "EmailID": emailID
  };

    collection.insert(entity, function(error, result){
        if(error)
        {
          utility.log("insertEmailAddress() error: " + error,'ERROR');
          response.setHeader("content-type", "text/plain");
          response.write('{\"Status\":\"Unsuccess\"}');
          response.end();
        }
        else
        {
          utility.log("Email(s) inserted Successfully");
          response.setHeader("content-type", "text/plain");
          response.write('{\"Status\":\"Success\"}');
          response.end();
        }
    });
}


// http://localhost:8080/removeemail?userID=sumon@live.com&emailID=sumon3@live.com
//// Remove method to remove User's Other Emails
function deleteEmailAddress(response,userID,emailID)
{
  var collection = db.get('EmailAddresses');
  var entity = {
      "UserID": userID,
      "EmailID": emailID
  };
  collection.remove(entity, function(error, result){
    if(error)
    {
      utility.log("deleteEmail() error: " + error,'ERROR');
      response.setHeader("content-type", "text/plain");
      response.write('{\"Status\":\"Unsuccess\"}');
      response.end();
    }
    else
    {
      utility.log("Email Address deleted Successfully");
      response.setHeader("content-type", "text/plain");
      response.write('{\"Status\":\"Success\"}');
      response.end();
    }
    });
}

// http://localhost:8080/editemail?userID=sumon@live.com&oldEmailID=sumon4@live.com&newEmailID=sumon3@live.com
function updateEmailAddress(response,userID,oldEmailID,newEmailID)
{
  var collection = db.get('EmailAddresses');
  var entity = {
      "EmailID": newEmailID
  };
    collection.update({"UserID":userID,"EmailID":oldEmailID}, {$set:entity}, function(error,result){
    if(error)
    {
      utility.log("updateEmail() error: " + error,'ERROR');
      response.setHeader("content-type", "text/plain");
      response.write('{\"Status\":\"Unsuccess\"}');
      response.end();
    }
    else
    {
      utility.log("EmailAddress updated Successfully");
      response.setHeader("content-type", "text/plain");
      response.write('{\"Status\":\"Success\"}');
      response.end();
    }
    });
}

// http://localhost:8080/getemail?userID=sumon@live.com
function getEmailAddresses(response,userID)
{
    var collection = db.get('EmailAddresses');
    var entity = {
      "UserID":userID
    };
    collection.find(entity, function(error,result){
    if(error)
    {
        utility.log("getEmail() error: " + error,'ERROR');
        response.setHeader("content-type", "text/plain");
        response.write('{\"Status\":\"UnSuccess\"}');
        response.end();
    }
    else
    {
        utility.log(result);
        response.setHeader("content-type", "text/plain");
        response.write("{\"Emails\":" + JSON.stringify(result) + "}");
        response.end();
    }
    });
}

// http://localhost:8080/addcalllog?userID=harun@live.com&startTime=2013-12-31%2016:00:00&endTime=2013-12-31%2016:10:00&callNo=+8801816745951
/// User Call Log History
function insertCallLog(response,userID,startTime,endTime,callNo)
{
    var collection = db.get('CallLog');
    var entity = {
      "UserID": userID,
      "StartTime": startTime,
      "EndTime": endTime,
      "CallNo": callNo
    };

    collection.insert(entity ,function(error,result){
    if(error)
    {
      utility.log("insertCallLog() error: " + error,'ERROR');
      response.setHeader("content-type", "text/plain");
      response.write('{\"Status\":\"Unsuccess\"}');
      response.end();
    }
    else
    {
      utility.log("CallLog inserted Successfully");
      response.setHeader("content-type", "text/plain");
      response.write('{\"Status\":\"Success\"}');
      response.end();
    }
    });
}

/// Mapping Dial In 
// http://localhost:8080/toll?area=Australia&dialInProvider=WebEx
// {"Tolls":[{"ID":1,"Area":"Australia","Number":"+61 29037 1692","Provider":"WebEx"}]}

function getTollNo(response,area,dialInProvider)
{
    var collection = db.get('DialInNumbers');
    var entity = {
      "Area": area,
      "Provider": dialInProvider
    };

    collection.findOne(entity, function(error, result) {
        if(error)
        {
          utility.log("getTollNo() error: " + error,'ERROR');
          response.setHeader("content-type", "text/plain");
          response.write('{\"Status\":\"Unsuccess\"}');
          response.end();
        }
        else
        {
          utility.log(result);
          response.setHeader("content-type", "text/plain");
          response.write("{\"Tolls\":" + JSON.stringify(result) + "}");
          response.end();
        }
    });
}


function AddDialInNumbersAction(response,area,dialInProvider)
{
    var collection = db.get('DialInNumbers');
    var entity = {
      "Area": area,
      "Provider": dialInProvider
    };

    // if (entity.length == 0) {

    // } else {
      
    // }

    collection.insert(entity, function(error, result) {
        if(error)
        {
          utility.log("AddDialInNumbers() error: " + error,'ERROR');
          response.setHeader("content-type", "text/plain");
          response.write('{\"Status\":\"Error in Adding !!!\"}');
          response.end();
        }
        else
        {
          utility.log("getTollNo() error: " + error,'ERROR');
          response.setHeader("content-type", "text/plain");
          response.write('{\"Status\":\"Successfully added.\"}');
          response.end();
        }
    });
}

// Get user's call credit info
// http://localhost:8080/credit?userID=harun@live.com
// {"_id":"52d8fd70e4b04b3452b13eb3","UserID":"harun@live.com","Credit":100}

function getCreditBalance(response,userID)
{
    var collection = db.get('UserCredits');
    var entity = {
      "UserID": userID,
    };

    collection.findOne(entity, function(error, result) {
        if(error)
        {
          utility.log("getCreditBalance() error: " + error,'ERROR');
          response.setHeader("content-type", "text/plain");
          response.write('{\"Status\":\"Unsuccess\"}');
          response.end();
        }
        else
        {
          utility.log(result);
          response.setHeader("content-type", "text/plain");
          response.write(JSON.stringify(result));
          response.end();
        }
    });
}


// http://localhost:8080/conf?userID=harun@movial.com
/// method to get latest invitation from Mobile set
function getInvitations(response,userID,id)
{
    if( userID == null ) userID = 'jari.ala-ruona@movial.com';
    if( id == null ) id = 0;

    var Invitations = db.get('Invitations');
    var Invitees = db.get('Invitees');

    Invitees.find({ UserID: userID},
        function (error, result) {
           if(error)
            {
              utility.log("error: " + error,'ERROR');
              response.setHeader("content-type", "text/plain");
              response.write('{\"Status\":\"Unsuccess\"}');
              response.end();
            }
            else
            {
              var Invitations_ids = [];
              for (var i = 0; i < result.length; i++) {
                Invitations_ids.push(result[i].Invitations_id);
              };
              
              Invitations.find({ _id: { $in : Invitations_ids}},
                  function (error, result) {
                     if(error)
                      {
                        utility.log("error: " + error,'ERROR');
                        response.setHeader("content-type", "text/plain");
                        response.write('{\"Status\":\"Unsuccess\"}');
                        response.end();
                      }
                      else
                      {
                        utility.log(result);
                        response.setHeader("content-type", "text/plain");
                        response.write(JSON.stringify(result));
                        response.end();
                      }
              });
            }
    });
}


function insertInvitationEntity(entity,addresses)
{
    var Invitations = db.get('Invitations');
    var Invitees = db.get('Invitees');
    var EmailAddresses = db.get('EmailAddresses');

    Invitations.insert(entity, function(error, result) {
        if(error)
        {
          utility.log("insertInvitationEntity() error: " + error, 'ERROR');
        }
        else
        {
            for (var i = 0; i < addresses.length; i++) {
              var emailID = addresses[i].address;
              EmailAddresses.findOne({EmailID: emailID}, function(error, result1){
                if(!error){
                  var userID = result1.UserID;
                  var entity = {
                    "UserID": userID,
                    "EmailID": emailID,
                    "Invitations_id": result._id
                  };
                  Invitees.insert(entity);
                }
              });
            }
            utility.log("Invitation inserted Successfully");
        }

    });
}

/// User Creation Method Exposed here
function insertUser_SQL(response,userID,deviceID,firstName,lastName,phoneNo,masterEmail,password,location)
{

var insertUserinfo = edge.func('sql', function () {/*
INSERT INTO dbo.Users(UserID,DeviceID,FirstName,LastName,PhoneNo,MasterEmail,Password,Location,RegistrationTime,IsBlackListed)
VALUES(@UserID,@DeviceID,@FirstName,@LastName,@PhoneNo,@MasterEmail,@Password,@Location,GETDATE(),0);
*/});
 var getUser = edge.func('sql',function(){/*
    SELECT * FROM dbo.Users WHERE UserID=@UserID;
 */});

var updateUser = edge.func('sql',function(){/*
UPDATE dbo.Users SET DeviceID=@DeviceID,FirstName=@FirstName,LastName=@LastName,PhoneNo=@PhoneNo,MasterEmail=@MasterEmail,Password=@Password,Location=@Location WHERE UserID=@UserID;
*/});
  // var entity = {
  //       UserID : userID,
  //       DeviceID: deviceID,
  //       FirstName : firstName,
  //       LastName : lastName,
  //       PhoneNo : phoneNo,
  //       MasterEmail : masterEmail,
  //       Password : '',
  //       Location : location
        
  //   };



  var entity = {
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


    utility.log('User object to add');
    utility.log(entity);
    getUser({UserID:userID},function(error,result){
        if(error)
        {
          utility.log("getUser() error: "+error,'ERROR');
          response.setHeader("content-type", "text/plain");
          response.write('{\"Status\":\"Unsuccess\"}');
          response.end();
        }
        else
        {
            if(result.length==0)
            {
                insertUserinfo(entity,function(error,result){
                    if(error)
                    {
                      utility.log("insertUser() error: "+error,'ERROR');
                      response.setHeader("content-type", "text/plain");
                      response.write('{\"Status\":\"Unsuccess\"}');
                      response.end();
                    }
                    else
                    {
                        utility.log("Invitation inserted Successfully");
                         response.setHeader("content-type", "text/plain");
                         response.write('{\"Status\":\"Success\"}');
                         response.end();
                    }
                });
            }
            else
            {
                updateUser(entity,function(error,result){
                    if(error)
                    {
                        utility.log("updateUser() error: "+error,'ERROR');
                       response.setHeader("content-type", "text/plain");
                       response.write('{\"Status\":\"Unsuccess\"}');
                       response.end();
                    }
                    else
                    {
                        utility.log("User updated Successfully");
                         response.setHeader("content-type", "text/plain");
                         response.write('{\"Status\":\"Success\"}');
                         response.end();
                    }
                });
            }
        }
    });
   
   
    
}

//// Add method to add User's Other Emails 
function insertEmailAddress_SQl(response,userID,emailID)
{
    utility.log('Adding Email Address');
    var addEmail=edge.func('sql',function(){/*
     INSERT INTO dbo.EmailAddresses(UserID,EmailAddress,isBlocked) VALUES(@UserID,@EmailAddress,0);
    */});
    var mail={UserID:userID,EmailAddress:emailID};
    utility.log(mail);
    addEmail(mail,function(error,result){
    if(error)
    {
        utility.log("insertEmail() error: "+error,'ERROR');
       response.setHeader("content-type", "text/plain");
      response.write('{\"Status\":\"Unsuccess\"}');
       response.end();
    }
    else
    {
        utility.log("EmailAddress inserted Successfully");
         response.setHeader("content-type", "text/plain");
         response.write('{\"Status\":\"Success\"}');
         response.end();
    }
    });
}
function deleteEmailAddress_SQL(response,userID,emailID)
{
    var delEmail=edge.func('sql',function(){/*
     DELETE FROM EmailAddresses WHERE UserID=@UserID AND EmailAddress=@EmailAddress;
    */});
    delEmail({UserID:userID,EmailAddress:emailID},function(error,result){
    if(error)
    {
        utility.log("deleteEmail() error: "+error,'ERROR');
       response.setHeader("content-type", "text/plain");
        response.write('{\"Status\":\"Unsuccess\"}');
       response.end();
    }
    else
    {
        utility.log("EmailAddress deleted Successfully");
         response.setHeader("content-type", "text/plain");
          response.write('{\"Status\":\"Success\"}');
         response.end();
    }
    });
}
function updateEmailAddress_SQL(response,userID,oldEmailID,newEmailID)
{
    var editEmail=edge.func('sql',function(){/*
     UPDATE EmailAddresses SET EmailAddress=@NewEmailID  WHERE UserID=@UserID AND EmailAddress=@OldEmailID;
    */});
    editEmail({UserID:userID,OldEmailID:oldEmailID,NewEmailID:newEmailID},function(error,result){
    if(error)
    {
        utility.log("updateEmail() error: "+error,'ERROR');
       response.setHeader("content-type", "text/plain");
        response.write('{\"Status\":\"Unsuccess\"}');
       response.end();
    }
    else
    {
        utility.log("EmailAddress updated Successfully");
         response.setHeader("content-type", "text/plain");
          response.write('{\"Status\":\"Success\"}');
         response.end();
    }
    });
}

function getEmailAddresses_SQL(response,userID)
{
    var getEmail=edge.func('sql',function(){/*
     SELECT * FROM  EmailAddresses WHERE UserID=@UserID;
    */});
    getEmail({UserID:userID},function(error,result){
    if(error)
    {
        utility.log("updateEmail() error: "+error,'ERROR');
       response.setHeader("content-type", "text/plain");
        response.write('{\"Status\":\"UnSuccess\"}');
       response.end();
    }
    else
    {
        utility.log("EmailAddress updated Successfully");
         response.setHeader("content-type", "text/plain");
         response.write("{\"Emails\":"+JSON.stringify(result)+"}");
         response.end();
    }
    });
}

/// User Call Log History
function insertCallLog_SQL(response,userID,startTime,endTime,callNo)
{
    var addCallLog=edge.func('sql',function(){/*
     INSERT INTO CallLog(TimeStamp,UserID,StartTime,EndTime,CallNo) VALUES(GETDATE(),@UserID,@StartTime,@EndTime,@CallNo);
    */});
    addCallLog({UserID:userID,StartTime:startTime,EndTime:endTime,CallNo:callNo},function(error,result){
    if(error)
    {
        utility.log("insertCallLog() error: "+error,'ERROR');
       response.setHeader("content-type", "text/plain");
       response.write('{\"Status\":\"Unsuccess\"}');
       response.end();
    }
    else
    {
        utility.log("CallLog inserted Successfully");
         response.setHeader("content-type", "text/plain");
         response.write('{\"Status\":\"Success\"}');
         response.end();
    }
    });
}
/// Mapping Dial In 
function getTollNo_SQL(response,area,dialInProvider)
{
 var getToll = edge.func('sql', function () {/*
    SELECT * FROM DialInNumbers WHERE Area=@Area AND Provider=@Provider;
*/});
 
 getToll({Area:area,Provider:dialInProvider},function(error,result){
if(error)
{
    utility.log("GetDialToll() error: "+error,'ERROR');
  
    var invites = {"Status":"Unsuccess"};
          response.setHeader("content-type", "text/plain");
         response.write(JSON.stringify(invites));
        response.end();
}
else
{
        utility.log(result);
        //return JSON.stringify(result);
        response.setHeader("content-type", "text/plain");
         response.write("{\"Tolls\":"+JSON.stringify(result)+"}");
        response.end();
}
});
}
/// Not used now
function insertPushURL(response,deviceID,userID,pushURL)
{
	var TABLE_NAME="PushURLs";	
var tableService = azure.createTableService(config.STORAGE_ACCOUNT_NAME, config.STORAGE_ACCOUNT_KEY);
tableService.createTableIfNotExists(TABLE_NAME, function(error) {
        if (error) {
            utility.log('insertPushURL() error: ' + error,'ERROR');
            //request.respond(statusCodes.BAD_REQUEST, error);
            
            response.setHeader("content-type", "text/plain");
            response.write('Error : ' + error);
            response.end();
        }
        else
        {
            response.setHeader("content-type", "text/plain");
            response.write('Success');
            response.end();
        }
    });


  var entity = {
        PartitionKey : 'default',
        RowKey : utility.generateUid(),
        UserID : userID,
        DeviceID: deviceID,
        PushURL : pushURL,
        IsActive : true
    };

    tableService.insertEntity(TABLE_NAME, entity, function(error) {
        if (error) {
            console.error('insertPushURL() error: ' + error);
            //request.respond(statusCodes.BAD_REQUEST, error);
            return 'Error : ' + error;
        }
        });

    return 'Success';
}


/// Method to Add an invitation to database after parsing invitation email

function insertInvitationEntity_SQL(entity,addresses){
    var insertInvite = edge.func('sql', function () {/*
    INSERT INTO Invitations(ToEmails,FromEmail,InvDate,InvTime,Subject,Toll,PIN,AccessCode,Password,DialInProvider,TimeStamp,Agenda,MessageID) 
    VALUES(@ToEmails,@FromEmail,@InvDate,@InvTime,@Subject,@Toll,@PIN,@AccessCode,@Password,@DialInProvider,GETDATE(),@Agenda,@MessageID);

*/});

var getMaxInvID = edge.func('sql', function () {/*
    SELECT ISNULL(MAX(ID),0) AS MXID FROM Invitations;

*/});
var insertInvitee = edge.func('sql', function () {/*
    INSERT INTO Invitees(UserID,EmailID,InvID) VALUES(@UserID,@EmailID,@InvID);

*/});

var getUserIDByEmail=edge.func('sql',function(){/*
SELECT u.UserID,a.Emailaddress FROM users u LEFT JOIN emailaddresses a ON u.UserID=a.UserID
WHERE  u.UserID=RTRIM(LTRIM(@Email)) OR a.emailaddress=RTRIM(LTRIM(@Email))
*/});

insertInvite(entity,function(error,result){
if(error)
{
    utility.log("insertInvitation() error: "+error,'ERROR');
   return -1;
}
else
{
    utility.log("Invitation inserted Successfully");
    getMaxInvID(null,function(error,result){
    if(error)
    {
        utility.log("insertInvitation() error: "+error,'ERROR');
        return -1;
    }
    else
    {

        var MxInvID=result[0].MXID;
        utility.log("Max Invitation ID  retrieved Successfully, ID: "+MxInvID);
        for (var i =0; i<addresses.length; i++) {
               
            var emailID=addresses[i].address;
            getUserIDByEmail({Email:emailID},function(error,result){
            if(error)
            {
                utility.log("getUserIDByEmail() error: "+error,'ERROR');
                return -1;
            }
            else
            {
              //console.log('loggggggggggg '+result.length);
              if(result.length==0)
              {

                utility.log(emailID+' not found in white list');
                //send email
                var mailer= require('./mailsender.js');
                mailer.sendMail(config.NOT_WHITELISTED_EMAIL_SUBJECT,config.NOT_WHITELISTED_EMAIL_BODY,emailID);
              }
              else
              {
                utility.log('UserID '+result[0].UserID+' found for '+emailID);
                  attendee={UserID:result[0].UserID,EmailID:emailID,InvID:MxInvID};

                  insertInvitee(attendee,function(error,result){
                  if(error)
                  {
                      utility.log("insertInvitee() error: "+error,'ERROR');
                      return -1;
                  }
                  else
                  {
                      utility.log("Invitee inserted Successfully");
                      return result;;
                  }
                  });
               }
            }
               });
            

        }
        utility.log('End Invitation Save into sql database');

    }
    });
}
});

}

/// Method to send/push notification to MPNS
function PushNotification(notificationRemainderTime)
{
    var getNotif=edge.func('sql',function(){/*
       SELECT [Subject],Agenda,a.UserID,EmailID,Handle AS PushURL
        FROM [dbo].[Invitations] i INNER JOIN dbo.Invitees a ON i.ID=a.InvID
        INNER JOIN telvoy.Registrations r ON 1=1  WHERE datediff(minute,GETDATE(),InvTime) between  0 and  @NotifTime
    */})

getNotif({NotifTime:notificationRemainderTime},function(error,result){
if(error)
{
    utility.log("PushNotification() error: "+error,'ERROR');
    return "Error: "+error;
}
else
{
    utility.log("Total Eligible getNotifications: "+result.length);
    for(var i=0;i<result.length;i++){

        var tileObj={
            'title': result[i].Subject,
            'backTitle': "Next Conference",
            'backBackgroundImage': "/Assets/Tiles/BackTileBackground.png",
            'backContent': result[i].Agenda,
        };
        mpns.sendTile(result[i].PushURL,tileObj,function(){utility.log('Pushed OK');});
    }
}
});

}

/// method to get latest invitation from Mobile set
function getInvitations_SQL(response,userID,id)
{
    if(userID==null) userID='jari.ala-ruona@movial.com';
    if(id==null) id=0;

     var getInviteByUserID = edge.func('sql', function () {/*
    SELECT i.*,a.UserID,a.EmailID FROM dbo.Invitations i INNER JOIN dbo.Invitees a ON i.ID=a.InvID WHERE a.UserID=@UserID AND i.ID>@ID ORDER BY TimeStamp DESC;
*/});
 
 getInviteByUserID({UserID:userID,ID:id},function(error,result){
if(error)
{
    utility.log("GetInvitation() error: "+error,'ERROR');
  
    var invites = {"Status":"Unsuccess"};
          response.setHeader("content-type", "text/plain");
         response.write(JSON.stringify(invites));
        response.end();
}
else
{
        utility.log(result);
        //return JSON.stringify(result);
        response.setHeader("content-type", "text/plain");
         response.write("{\"invitations\":"+JSON.stringify(result)+"}");
        response.end();
}
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
////
function getCreditBalance_SQL(response,userID){
  utility.log('Getiing credit balance for '+userID);
  var getCreditBal = edge.func('sql', function () {/*
    SELECT * FROM UserCredits WHERE UserID=@UserID;
*/});
    /*response.setHeader("content-type", "text/plain");
    response.write("{\"Credit\":10}");
    response.end();
    utility.log('balance: 10');*/

    getCreditBal({UserID:userID},function(error,result){
      if(error)
      {
          utility.log("GetCredit() error: "+error,'ERROR');
        
          var obj = {"Status":"Unsuccess"};
                response.setHeader("content-type", "text/plain");
               response.write(JSON.stringify(obj));
              response.end();
      }
      else
      {
              utility.log(result);
              if(result.length==0)
              {
                response.setHeader("content-type", "text/plain");
                response.write("{\"ID\":0,\"UserID\":\""+userID+"\",\"Credit\":0}");
                response.end();
              }
              else
              {
              //return JSON.stringify(result);
              response.setHeader("content-type", "text/plain");
              response.write(JSON.stringify(result[0]));
              response.end();
            }
      }
    });
}
function deductCreditBalance(response,userID){
  utility.log('Deduct credit balance for '+userID);
  var deductCreditBal = edge.func('sql', function () {/*
    UPDATE UserCredits SET Credit=Credit-1 WHERE UserID=@UserID AND Credit>0;
*/});
    
    deductCreditBal({UserID:userID},function(error,result){
      if(error)
      {
          utility.log("DeductCredit() error: "+error,'ERROR');
        
          var obj = {"Status":"Unsuccess"};
                response.setHeader("content-type", "text/plain");
               response.write(JSON.stringify(obj));
              response.end();
      }
      else
      {
             utility.log("UserCredits Deducted Successfully");
             response.setHeader("content-type", "text/plain");
             response.write('{\"Status\":\"Success\"}');
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
exports.insertPushURL=insertPushURL;
exports.insertInvitationEntity=insertInvitationEntity;
exports.getInvitations=getInvitations;
exports.PushNotification=PushNotification
exports.getNotifications=getNotifications;
exports.getTollNo=getTollNo;
exports.updateEmailAddress=updateEmailAddress;
exports.getEmailAddresses=getEmailAddresses;
exports.getCreditBalance=getCreditBalance;
exports.deductCreditBalance=deductCreditBalance;


