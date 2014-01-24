/* lib/mailee.js
 *
 * Reads unread mails from imap inbox defined in config.js.
 * Checks if sender is an user in SqERL and parses email
 * sender, subject, body and image attachment to new whatshot
 * item poster, title, body and image respectively. Mails
 * are then marked as read. This is currently run from app.js
 * peridiocally.
 */



var Imap = require('imap');
var MailParser = require('mailparser').MailParser;
var fs = require('fs');
var inspect = require('util').inspect;
var icalendar = require('icalendar');
var config = require('./config.js');
var dao=require('./dataaccess.js');
var mimelib = require("mimelib-noiconv");
var utility=require('./utility.js');
var querystring = require("querystring");

var debug = config.IS_DEBUG_MODE;
var markSeen = true;

var imap = new Imap({
    user: config.PULL_EMAIL_ID,
    password: config.PULL_EMAIL_PASS,
    host: config.PULL_EMAIL_SERVER,
    port: config.PULL_EMAIL_SERVER_PORT,
    secure: config.PULL_EMAIL_SERVER_SECURE,
    tls: config.PULL_EMAIL_SERVER_SECURE,
    tlsOptions: { rejectUnauthorized: false }
});
/*var imap = new Imap({
    user: 'confme@ext.movial.com',
    password: 'aivohyiey0iePh',
    host: 'imap.gmail.com',
    port: 993,
    secure: true
});*/

if(debug==true)
{
  utility.log('IMAP Info:');
  utility.log(imap);
}
//var db_ = null;
var isUser = {}
var urlRegExp = new RegExp('https?://[-!*\'();:@&=+$,/?#\\[\\]A-Za-z0-9_.~%]+');

var mpns = require('mpns');

var http = require("http");
var url = require("url");
var fs = require('fs');
var PARSE_RES = { "fetch" : "empty", "fetchMessage" : "Cold start, fetching in progress..."};



process.on('uncaughtException', function (err) {
    fs.writeFile("test.txt",  err, "utf8");    
})
http.createServer(function(request, response) {
    var uri = url.parse(request.url).pathname;

    if(debug==true)
    {
        utility.log('Requested URL: '+request.url);
        utility.log('Requested Query String: '+ url.parse(request.url).query);
    }
    //console.log(request.url);
    if (uri.toLowerCase() === "/conf") {
        var query = url.parse(request.url).query;
        var params=querystring.parse(query);
         dao.getInvitations(response,utility.Nullify(params['userID']),utility.Nullify(params['id']));
        /*response.setHeader("content-type", "text/plain");
        response.write(JSON.stringify(PARSE_RES));
        response.end();*/
    }
    else if (uri.toLowerCase() === "/notif") {
        utility.log(request.url);
        dao.getNotifications(response);
        
    } 
    else if (uri.toLowerCase() === "/user") {
        var query = url.parse(request.url).query;
        var user=querystring.parse(query);
        //var u=utility.Nullify(user['u']);
        //utility.log(user);
        dao.insertUser(response,utility.Nullify(user['userID']),utility.Nullify(user['deviceID']),utility.Nullify(user['firstName']),utility.Nullify(user['lastName']),utility.Nullify(user['phoneNo']),utility.Nullify(user['masterEmail']),utility.Nullify(user['password']),utility.Nullify(user['location']) );
        
    }
    else if (uri.toLowerCase() === "/register") {
        var query = url.parse(request.url).query;
        var user=querystring.parse(query);
        //var u=utility.Nullify(user['u']);
        //console.log(u);
        dao.insertPushURL(response,utility.Nullify(user['handle']),utility.Nullify(user['userID']));
        
    }
    else if (uri.toLowerCase() === "/addemail") {
        var query = url.parse(request.url).query;
        var user=querystring.parse(query);
        //var u=utility.Nullify(user['u']);
        utility.log(user);
        // dao.insertEmailAddress(response,utility.Nullify(user['userID']),utility.Nullify(user['emailID']));
        dao.insertEmailAddress(response,utility.Nullify(user['userID']),utility.Nullify(user['emailID']));
    }
    else if (uri.toLowerCase() === "/removeemail") {
        var query = url.parse(request.url).query;
        var user=querystring.parse(query);
        //var u=utility.Nullify(user['u']);
        //console.log(u);
        dao.deleteEmailAddress(response,utility.Nullify(user['userID']),utility.Nullify(user['emailID']));
        
    }
    else if (uri.toLowerCase() === "/editemail") {
        var query = url.parse(request.url).query;
        var user=querystring.parse(query);
        //var u=utility.Nullify(user['u']);
        //console.log(u);
        dao.updateEmailAddress(response,utility.Nullify(user['userID']),utility.Nullify(user['oldEmailID']),utility.Nullify(user['newEmailID']));
        
    }
    else if (uri.toLowerCase() === "/getemail") {
        var query = url.parse(request.url).query;
        var user=querystring.parse(query);
        //var u=utility.Nullify(user['u']);
        //console.log(u);
        dao.getEmailAddresses(response,utility.Nullify(user['userID']));
        
    }
    else if (uri.toLowerCase() === "/addcalllog") {
        var query = url.parse(request.url).query;
        var user=querystring.parse(query);
        //var u=utility.Nullify(user['u']);
        //console.log(u);
        dao.insertCallLog(response,utility.Nullify(user['userID']),new Date(Date.parse(utility.isNull(user['startTime'],''))),new Date(Date.parse(utility.isNull(user['endTime'],''))),utility.Nullify(user['callNo']));
        
    }
    else if (uri.toLowerCase() === "/toll") {
        var query = url.parse(request.url).query;
        var user=querystring.parse(query);
        //var u=utility.Nullify(user['u']);
        //console.log(u);

        dao.getTollNo(response,utility.isNull(user['area'],''),utility.isNull(user['dialInProvider'],'WebEx'));
        
    }
    else if (uri.toLowerCase() === "/credit") {
        var query = url.parse(request.url).query;
        var user=querystring.parse(query);
        //var u=utility.Nullify(user['u']);
        //console.log(u);

        dao.getCreditBalance(response,utility.Nullify(user['userID']));
        
    }
    else if(uri.toLowerCase()=="/deductcredit")
    {

        var query = url.parse(request.url).query;
        var user=   querystring.parse(query);
        dao.deductCreditBalance(response,utility.Nullify(user['userID']));
    }
    else if(uri.toLowerCase()=="/config")
    {
              utility.log('Showing Configuration Settings');
              response.setHeader("content-type", "text/plain");
              response.write(JSON.stringify(config));
              response.end();
    }
    else if(uri.toLowerCase()=="/log")
    {
        fs.readFile("../../LogFiles/Application/index.html" ,function(error,data){
            if(error){
               response.writeHead(404,{"Content-type":"text/plain"});
               response.end("Sorry the page was not found"+error);
            }else{
               response.writeHead(202,{"Content-type":"text/html"});
               response.end(data);

            }
        });
    }
    else if(uri.toLowerCase()=="/adddialinnumbers")
    {
        fs.readFile("crm/DialInNumbers.html" ,function(error,data){
            if(error){
               response.writeHead(404,{"Content-type":"text/plain"});
               response.end("Sorry the page was not found"+error);
            }else{
               response.writeHead(202,{"Content-type":"text/html"});
               response.end(data);

            }
        });
    }
    else if (uri.toLowerCase() === "/adddialinnumbersaction") {
        var query = url.parse(request.url).query;
        var user = querystring.parse(query);
        //var u=utility.Nullify(user['u']);
        console.log(user);

        dao.AddDialInNumbersAction(response,utility.isNull(user['area'],''),utility.isNull(user['number'],''),utility.isNull(user['provider'],'WebEx'));
        
    }
    else if(uri.toLowerCase() === "/dialinnumbers") {
        var query = url.parse(request.url).query;
        var user = querystring.parse(query);
        //var u=utility.Nullify(user['u']);
        console.log(user);

        dao.getDialInNumbers(response);
    }
    else if(uri.toLowerCase() === "/deletenumber") {
        var query = url.parse(request.url).query;
        var user = querystring.parse(query);
        //var u=utility.Nullify(user['u']);
        console.log(user);

        dao.deleteDialInNumber(response,utility.isNull(user['_id'],'0'));
    }    
    else if(RightString(uri,3).toLowerCase()=="txt"){
         //console.log(RightString(uri,3));
         fs.readFile("../../LogFiles/Application"+uri ,function(error,data){
       if(error){
           response.writeHead(404,{"Content-type":"text/plain"});
           response.end("Sorry the page was not found"+error);
       }else{
           response.writeHead(202,{"Content-type":"text/plain"});
           response.end(data);

       }
        });
    }
    ///addcalendarevent?subject=meeting2&startTime=2014-01-26 15:00:00 PM&&endTime=2014-01-26 15:30:00 PM&organizarName=Imtaz&organizarEmail=imtiaz@live.com&attendeesName=rabbi,harun&attendeesEmail=rabbi@live.com,harun@live.com&accountName=harun&accountKind=public&location=dhaka&status=active&isPrivate=true&isAllDayEvent=false
    else if (uri.toLowerCase() === "/addcalendarevent") {
        var query = url.parse(request.url).query;
        var params=querystring.parse(query);
        utility.log(params);
        dao.insertCalendarEvent(response,utility.isNull(params['subject'],'[no subject]'),utility.isNull(params['startTime'],''),utility.isNull(params['endTime'],''),utility.isNull(params['organizarName'],''),utility.isNull(params['organizarEmail'],''),utility.isNull(params['attendeesName'],''),utility.isNull(params['attendeesEmail'],''),utility.isNull(params['accountName'],''),utility.isNull(params['accountKind'],''),utility.isNull(params['location'],''),utility.isNull(params['status'],''),utility.isNull(params['isPrivate'],false),utility.isNull(params['isAllDayEvent'],false));
    }
    else {
        response.setHeader("content-type", "text/plain");
        response.write(JSON.stringify(url.parse(request.url)));
        response.end();
    }
}).listen(process.env.port || 8080);

function RightString(str, n){
        if (n <= 0)
        return "";
        else if (n > String(str).length)
        return str;
        else {
        var intLen = String(str).length;
        return String(str).substring(intLen, intLen - n);
            }
}
function checkConfMe() {
   //console.log(config);
    checkMails();
}

function checkMails() {
    /*console.log(imap);*/
    utility.log('Connecting imap');
    imap.setMaxListeners(0);
     //console.log('Connecting imap...');
   /* imap.once('error', function(err) {
  console.log(err);
    });*/
    imap.connect(function(err) {
        if (err) {
            PARSE_RES['fetchMessage'] = 'Unable to connect imap: ' + err;
            utility.log('Unable to connect imap '+err,'ERROR');
            return;
        }
        
        utility.log('Connected imap');
        
        imap.openBox('INBOX', false, function(err, mailbox) {
            if (err) {
                PARSE_RES['fetchMessage'] = 'Unable to open inbox: ' + err;
                utility.log(PARSE_RES['fetchMessage'],'ERROR');
                imap.logout();
                return;
            }

            imap.search([ config.EMAIL_PULL_CRITERIA, ['SINCE', 'June 01, 2013'] ], function(err, results) {
                if(debug==true)
                utility.log('IMAP Search '+'Error:'+inspect(err, false, Infinity)+' Results:'+inspect(results, false, Infinity),'GENERAL');
                
                if (err) {
                    PARSE_RES['fetchMessage'] = 'Cannot search inbox: ' + err;
                    utility.log(PARSE_RES['fetchMessage'],'ERROR');
                    imap.logout();
                    return;
                }

                if ( !results || results.length <= 0 ) {
                    PARSE_RES['fetchMessage'] = 'No new mail';
                    utility.log(PARSE_RES['fetchMessage']);
                    imap.logout();
                    return;
                }
                
                imap.fetch(results, { markSeen: markSeen }, { headers: { parse: false }, body: true, cb: fetchMailProcess}, fetchMailDone);
            });
        });
    });
}

function fetchMailProcess(fetch) {
    fetch.on('message', function(msg) {
        utility.log('BEGIN SeqNo:'+msg.seqno);
        mailParser = new MailParser();

        mailParser.on('end', function(mail) {
            var out = parseMail(mail);
            if (!out)
                return;

            out['fetch'] = "success";
            PARSE_RES = out;
            var addressStr = out['to']; //'jack@smart.com, "Development, Business" <bizdev@smart.com>';
            var addresses = mimelib.parseAddresses(addressStr);
            utility.log('No. of Attendees :'+ addresses.length);
            utility.log('Starting Invitation Save into mongodb database...');
            var emailsto='';
        if(addresses.length>0)
         {
                
            for (var i =0; i<addresses.length; i++) {
                if(i >0) emailsto =emailsto +",";
                emailsto = emailsto+ addresses[i].address;
                
            //console.log(addresses[i].address);
            //console.log(addresses[i].name);
            }
        }
        else
        {
            emailsto='';
            //console.log('receipent not found');
            //console.log(utility.convertToDateTime(utility.Nullify(out['date']),utility.Nullify(out['time'])));
        /*var entity = {
                UserID : '',
                ToEmail:'',
                FromEmail: utility.isNull(out['from'],''),
                InvDate : new Date(Date.parse(utility.isNull(out['date'],''))),
                InvTime : utility.convertToDateTime(utility.isNull(out['date'],''),utility.isNull(out['time'],'')),
                Subject: utility.isNull(out['subject'],''),
                Toll:utility.isNull(out['toll'],''),
                PIN: utility.isNull(out['pin'],''),
                AccessCode: utility.isNull(out['code'],''),
                Password: utility.isNull(out['password'],''),
                DialInProvider:'WebEx'
                };
                //console.log(entity);
                 dao.insertInvitationEntity(entity);*/
        }
         utility.log(addresses);
         utility.log('EmailsTo: '+emailsto);
         var entity = {
                ToEmails : emailsto,
                FromEmail: utility.isNull(out['from'],''),
                InvDate : new Date(Date.parse(utility.isNull(out['date'],''))),
                InvTime : utility.convertToDateTime(utility.isNull(out['date'],''),utility.isNull(out['time'],'')),
                Subject: utility.isNull(out['subject'],''),
                Toll:utility.isNull(out['toll'],''),
                PIN: utility.isNull(out['pin'],''),
                AccessCode: utility.isNull(out['code'],''),
                Password: utility.isNull(out['password'],''),
                DialInProvider:'WebEx',
                TimeStamp: new Date(),
                Agenda:utility.isNull(out['agenda'],''),
                MessageID:utility.isNull(out['messageId'],'')
                };
        utility.log("db invite entity to insert");
        utility.log(entity);
         dao.insertInvitationEntity(entity,addresses);

           //console.log('End Invitation Save into sql database');
            //sendPushNotification(out);
        });

        msg.on('data', function(data) {
            //console.log('data:'+data.toString('utf8'));
            mailParser.write(data.toString());
        });

        msg.on('end', function() {
            console.log('END SeqNo:'+msg.seqno);
            mailParser.end();
        });
    });

    fetch.on('error', function(error) {
        utility.log(error,'ERROR');
    });
}

function fetchMailDone(err) {
    if (err) {
        utility.log('Mail fetching failed:'+err,'ERROR');
    }
    
    utility.log('Mail fetching completed');
    imap.logout();
}



function parseMail(mail)
{
     //utility.log("<Header......................");
     //utility.log(inspect(mail.headers["authentication-results"], false, Infinity));
     //utility.log("</Header......................");
    if(debug==true)
    utility.log(inspect(mail.messageId, false, Infinity));

    var out = null;

    if (mail.attachments)
        out = parseAttachments(mail.attachments);

    if (!out)
        out = parseBody(mail);
     out['messageId']=mail.messageId;
    utility.log(inspect(out));

    if (!out || !out['toll'] || !out['code'] || !out['subject'] )
        return null;

    //if (out['date'] && out['time'])
    //    out['date_time'] = new Date(out['date'] + ", " + out['time']);

    //console.log(JSON.stringify(out));

    var currentTime = new Date()
    var hours = currentTime.getHours()
    var minutes = currentTime.getMinutes()
    var seconds = currentTime.getSeconds()
    out['timestamp'] = currentTime;

    return out;
}

function parseBody(mail)
{
    //console.log(inspect(mail));
    var out = null;
    if (mail.text) {
        utility.log('##### fallback to parsing text BODY ######');
        out = parseString(mail.text, ':', '\n', true, false);
         //console.log(out);
        //out["body"] = mail.text;
    } else if (mail.html) {
        utility.log('##### fallback to parsing html BODY ######');
        var text = mail.html.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>?|&nbsp;/gi, '');
        out = parseString(text, ':', '\n', true, false);
        //console.log(out);
        //out["body"] = mail.html;
    } else {
        return null;
    }

    out["subject"] = mail.subject;
	
    return out;

    /*
    if ( mail.inReplyTo ) {
        // do not post replies, for example vacation notices
        return;
    }

    if ( mail.from ) {
        for ( var i=0; i<mail.from.length; i++ ) {
            var sender = mail.from[i].address.toLowerCase();
            if ( isUser[sender] ) {
                parseAttachments(mail);
                return;
            }
        }
    }

    if ( mail.replyTo ) {
        for ( var i=0; i<mail.replyTo.length; i++ ) {
            var sender = mail.replyTo[i].address.toLowerCase();
            if ( isUser[sender] ) {
                parseAttachments(mail);
                return;
            }
        }
    }

    if ( mail.headers && mail.headers.sender ) {
        var sender = mail.headers.sender.toLowerCase();
        if ( isUser[sender] ) {
            parseAttachments(mail);
            return;
        }
    }
    */

    //var sender = mail.headers && mail.headers.sender ? mail.headers.sender : 'nobody';
    //parseAttachments(mail);

    // X-Sender and other fields?
}

function parseAttachments(attachments)
{
    var out = {};

    for (var i = 0; i < attachments.length; i++) {
        var atch = attachments[i];
        utility.log('##### parsing ATTACHMENT ' + i + ' ######');
        if (atch.contentType && atch.contentType.match(/calendar/) && atch.content) {
            var str_data = atch.content.toString('utf-8');

            var icalendar_res = icalendar.parse_calendar(str_data);

            //console.log(inspect(icalendar_res, false, Infinity));

            var res = {};
            while (!res['toll'] || !res['code']) {
                // case 1, phone and pin in LOCATION
                if (icalendar_res.events()[0].properties.LOCATION) {
                    var LOCATION = icalendar_res.events()[0].properties.LOCATION[0].value;
                    //console.log("<location>"+LOCATION+"</location>");
                    res = parseString(LOCATION, ':', '\\s*', false, true);
                    //console.log(res);
                    if (res['toll'] && res['code'])
                        break;
                }

                // case 2, search in DESCRIPTION
                if (icalendar_res.events()[0].properties.DESCRIPTION) {
                    var DESCRIPTION = icalendar_res.events()[0].properties.DESCRIPTION[0].value;
                    //console.log(DESCRIPTION);
                    var res = parseString(DESCRIPTION, ':', '\\n', true, false);
                    utility.log(res);
                    if (res['toll'] && res['code'])
                        break;
                }

                break;
            }

            if (!res['toll'] || !res['code'])
                return null;

            out['toll'] = utility.Nullify(res['toll']);
            out['code'] = utility.Nullify(res['code']);
            out['password']=utility.Nullify(res['password']);
            //console.log("$$ :"+icalendar_res.events()[0].properties.DTSTART[0].value);
            var date = new Date(icalendar_res.events()[0].properties.DTSTART[0].value);
            out['date_time'] = date.toString();
            var date_split = out['date_time'].split(" ");
            out['date'] = date_split.slice(0, 4).join(" ");
            out['time'] = date;//date_split.slice(4).join(" ");;

            out['subject'] = icalendar_res.events()[0].properties.SUMMARY[0].value;

            return out;
        }
    }
}

function parseString(str, delimiter, endMarker, allowFuzzy, usePattern)
{
    var dict =
    [
        {
            keyword: 'toll', // TODO: rename to 'phone'
            alts: 'toll|bridge|dial-in|dial',
            pattern: '[0-9\\-+]+',
            fuzzy: true,
        },
        {
            keyword: 'code', // TODO: rename to 'pin'
            alts: 'pin|code',
            pattern: '[0-9]+',
            fuzzy: true,
        },
        {
            keyword: 'password',
            alts: 'password',
            pattern: '.+',
            fuzzy: false,
        },
        {
            keyword: 'date',
            alts: 'date',
            pattern: '.+',
            fuzzy: false,
        },
        {
            keyword: 'time',
            alts: 'time',
            pattern: '.+',
            fuzzy: false,
        },
        {
            keyword: 'to',
            alts: 'to',
            pattern: '.+',
            fuzzy: false,
        },
        {
            keyword: 'from',
            alts: 'from',
            pattern: '.+',
            fuzzy: false,
        },
        {
            keyword: 'subject',
            alts: 'subject',
            pattern: '.+',
            fuzzy: false,
        },
        {
            keyword: 'agenda',
            alts: 'topic|agenda',
            pattern: '.+',
            fuzzy: false,
        },
    ];

    var out = {};

    for (i = 0; i < dict.length; i++) {
        var re = new RegExp('\\b(?:' + dict[i].alts + ')\\b' +
                            (allowFuzzy && dict[i].fuzzy ? '.*' : '(?:\\s*)?') + delimiter +
                            '\\s*(' + (usePattern ? dict[i].pattern : '.+') + ')' + endMarker, 'i');
        var match = str.match(re);
        if (match && match.length > 0) {
            if(match[1] !=null)
                out[dict[i].keyword] = match[1].trim();
            else
                out[dict[i].keyword]=null;
        }
    }

    return out;
}

/*function addItem(senderEmail, senderName, imgPath, title, link, content) {
    //console.log('addItem email:'+senderEmail+' name:'+senderName+' title:'+title+' link:'+link);
    //console.log('imgPath: '+imgPath+' content: '+content);

    var newItem = {
        pubDate: new Date(),
        title: title,
        link: link,
        description: content,
        content: content,
        security: 3,
        submitterName: senderName,
        submitterEmail: senderEmail,
        tags: [ "PUBLIC" ],
        likeCount: 0 };

    if ( imgPath )
        newItem['image'] = imgPath;

    db_.conn.model('WhatsHot').create(newItem, function(err, savedItem) {
        if (err)
            console.log(err);
        else
            console.log('Added whatshot');
    });
}

function populateIsUser(cb) {
    isUser = {};
    db_.User.find().exec(function(err, userList) {
        if ( err ) {
            console.log(err);
            cb(err);
            return;
        }

        for ( var i=0; i<userList.length; i++ ) {
            var isUserData = {};
            isUserData['security'] = userList[i].security;
            isUserData['fullName'] = userList[i].firstName+' '+userList[i].lastName;
            isUser[userList[i].email] = isUserData;
        }

        cb(null);
    });
}
*/

exports.checkConfMe = checkConfMe;
