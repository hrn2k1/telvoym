var mailee = require('./mailee.js');
var inspect = require('util').inspect;
var azure = require('azure');
var config = require('./config.js');
var dao=require('./dataaccess.js');
var utility=require('./utility.js');


function HandleEmails() {
    
            mailee.checkConfMe();
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
function SendEligibleNotifications(){
    dao.PushNotification(NotificationRemainderDuration);
}
SendEligibleNotifications();
setInterval(function(){
    utility.log('Sending Notification...');
    SendEligibleNotifications();
},NotificationRemainderDuration-100);