var mailee = require('./mailee.js');
var inspect = require('util').inspect;
var azure = require('azure');
var config = require('./config.js');
var dao=require('./dataaccess.js');
var utility=require('./utility.js');
/*var STORAGE_ACCOUNT_NAME = "confme";
var STORAGE_ACCOUNT_KEY = "2z+ki/6U8yUwraWWhhfZZrrKLYpQWyJxM8gVXpA3F0e8BUmgir2BCdOU15S88YeyCmioXetW0lgEL86gOqepNg==";
var TABLE_NAME = "confmeTable";

var tableService = azure.createTableService(STORAGE_ACCOUNT_NAME, STORAGE_ACCOUNT_KEY);

var tableQuery = azure.TableQuery
    .select()
    .from(TABLE_NAME)
    .top(1)
;*/

function HandleEmails() {
    /*tableService.queryEntities(tableQuery, function (error, entities) {
        console.log(inspect(entities));
        if (error) {
            console.log("tableService.queryEntities error: " + error);
        } else {
            var pushUri = entities[0].URI;
            console.log("received push uri, fetching mail now");*/
            mailee.checkConfMe();
        /*}
    });*/
}



var duration=config.PULL_EMAIL_DURATION;
var NotificationRemainderDuration=config.NOTIFICATION_DURATION;

//console.log(duration);
HandleEmails();
setInterval(function() {
    utility.log('Pulling Invitation..');
    HandleEmails();
}, duration);

//console.log(NotificationRemainderDuration);
// function SendEligibleNotifications(){
//  dao.PushNotification(NotificationRemainderDuration);
// }
// SendEligibleNotifications();
// setInterval(function(){
//     utility.log('Sending Notification...');
//     SendEligibleNotifications();
// },NotificationRemainderDuration-100);