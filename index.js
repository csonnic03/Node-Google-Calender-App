//Add all the Dependencies
var express = require('express');
const app = express();
var http = require('http');
var fs = require("fs");
const bodyParser = require('body-parser')
const hostname = "127.0.0.1";
const port = 8000;
const router = express.Router();
const path = require('path');
const {google} = require('googleapis');
const Credentials = require('./credentials.json');
const Id = Credentials.CLIENT_ID;
const Key = Credentials.API_KEY;
const Secret = Credentials.CLIENT_SECRET;
const Refresh = Credentials.REFRESH_TOKEN;
const Redirect = 'https://developers.google.com/oauthplayground'
const oAuth2Client = new google.auth.OAuth2(Id,Secret,Redirect);
oAuth2Client.setCredentials({refresh_token:Refresh});
  
//Creating the Server
app.use(express.static(__dirname + '/css/styles.css'));

router.get('/', function(req, res){
    res.sendFile(path.join(__dirname + '/index.html'));
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//Add the Router
app.use('/', router);
app.listen(process.env.port || 8000);
console.log(`Running at`, hostname + ':' + port)

//Creating a Server
/*var server = http.createServer(function (req, res) {
    fs.readFile('index.html', function (err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
    });
});

const server = http.createServer(function(request, response) {

	if(request.url === "./index.html"){
		sendFileContent(response, "index.html", "text/html");
	}
	else if(request.url === "/"){
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.write('<b>Hey there!</b><br /><br />This is the default response. Requested URL is: ' + request.url);
	}
	else if(/^\/[a-zA-Z0-9\/]*.js$/.test(request.url.toString())){
		sendFileContent(response, request.url.toString().substring(1), "text/javascript");
	}
	else if(/^\/[a-zA-Z0-9\/]*.css$/.test(request.url.toString())){
		sendFileContent(response, request.url.toString().substring(1), "text/css");
	}
	else{
		console.log("Requested URL is: " + request.url);
		response.end();
	}
});

function sendFileContent(response, fileName, contentType){
	fs.readFile(fileName, function(err, data){
		if(err){
			response.writeHead(404);
			response.write("Not Found!");
		}
		else{
			response.writeHead(200, {'Content-Type': contentType});
			response.write(data);
		}
		response.end();
	});
}
*/
/*server.listen(port, hostname, () =>{
    console.log('server running @ '+hostname+ ':' + port);
});*/
// Create a new calender instance.
const Calendar = google.calendar({ version: 'v3', auth: oAuth2Client })

// Create a new event start date instance for temp uses in our calendar.
const eventStartTime = new Date()
eventStartTime.setDate(eventStartTime.getDay() + 10)

// Create a new event end date instance for temp uses in our Calendar.
const eventEndTime = new Date();
eventEndTime.setDate(eventEndTime.getDay() + 10);
eventEndTime.setMinutes(eventEndTime.getMinutes() + 30);

// Create a dummy event for temp uses in our Calendar


app.post('/event_creation', function (req, res){
    var summary = req.body.summary,
    location = req.body.location,
    description = req.body.description,
    colorId = req.body.colorId,
    start = req.body.start,
    end = req.body.end;
    res.sendFile(__dirname + '/index.html');

//create the event 
const event = {
    summary: summary,
    location: location,
    description: description,
    colorId: colorId,
    start: {
        dateTime: eventStartTime,
        timeZone: 'America/Phoenix',
    },
    end: {
        dateTime: eventEndTime,
        timeZone: 'America/Phoenix',
    },
}
// Check if we a busy and have an event on our Calendar for the same time.
Calendar.freebusy.query(
    {
        resource: {
        timeMin: eventStartTime,
        timeMax: eventEndTime,
        timeZone: 'America/Phoenix',
        items: [{ id: 'primary' }],
        },
    }, (err, res) => {
    // Check for errors in our query and log them if they exist.
    if (err) return console.error('Free Busy Query Error: ', err)
    
    // Create an array of all events on our calendar during that time.
    const eventArr = res.data.calendars.primary.busy
    
    // Check if event array is empty which means we are not busy
    if (eventArr.length === 0)
        // If we are not busy create a new calendar event.
        return Calendar.events.insert({ calendarId: 'primary', resource: event },
            err => {
            // Check for errors and log them if they exist.
            if (err) return console.error('Error Creating Calender Event:', err)
            // Else log that the event was created.
            return console.log('Calendar event successfully created.')
        })
    });
})
// .send(event);

//List the upcoming events
async function listEvents(auth){
    try{

        const Calendar = google.calendar({ version: 'v3', auth })

        const accessToken = await oAuth2Client.getAccessToken();

        Calendar.events.list({
          calendarId: 'csonnichsen186@west-mec.org',
          timeMin: (new Date()).toISOString(),
          maxResults: 10,
          singleEvents: true,
          orderBy: 'startTime',
          key: Key,
        }, (err, res) => {
            console.log('No upcoming events found.');
          if(err)return console.log('The API returned an error: ' + err);
          const events = res.data.items;
          if (events.length) {
              console.log('Upcoming Events: ');
              events.map((event, i) => {
                  const start = event.start.dateTime || event.start.date;
                  console.log(`${start} - ${event.summary}`);
              });
          } else {
              console.log('No upcoming events found.');
          }
        });
    }catch(error){return error};
  }

  //End Calendar QuickStart
//   module.exports = {
//       SCOPES,
//       listEvents,
//   }
listEvents(oAuth2Client);