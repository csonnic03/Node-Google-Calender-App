const clientInfo = require('./credentials.json');

// Require google from googleapis package.
const { google } = require('googleapis')

// Require oAuth2 from our google instance.
const { OAuth2 } = google.auth

// Create a new instance of oAuth and set our Client ID & Client Secret.
const oAuth2Client = new OAuth2(
  clientInfo.CLIENT_ID,
  clientInfo.CLIENT_SECRET
)

// Call the setCredentials method on our oAuth2Client instance and set our refresh token.
oAuth2Client.setCredentials({
  refresh_token: clientInfo.REFRESH_TOKEN,
})

// Create a new calender instance.
const calendar = google.calendar({ version: 'v3', auth: oAuth2Client })

// Create a new event start date instance for temp uses in our calendar.
const eventStartTime = new Date()
eventStartTime.setDate(eventStartTime.getDay() + 10)

// Create a new event end date instance for temp uses in our calendar.
const eventEndTime = new Date()
eventEndTime.setDate(eventEndTime.getDay() + 10)
eventEndTime.setMinutes(eventEndTime.getMinutes() + 30)

// Create a dummy event for temp uses in our calendar
const event = {
  summary: `Caleb - Work`,
  location: `20205 N 67th Ave #100, Glendale, AZ 85308`,
  description: `Work as a Cashier`,
  colorId: 5,
  start: {
    dateTime: eventStartTime,
    timeZone: 'America/Phoenix',
  },
  end: {
    dateTime: eventEndTime,
    timeZone: 'America/Phoenix',
  },
}

// Check if we a busy and have an event on our calendar for the same time.
calendar.freebusy.query(
  {
    resource: {
      timeMin: eventStartTime,
      timeMax: eventEndTime,
      timeZone: 'America/Phoenix',
      items: [{ id: 'primary' }],
    },
  },
  (err, res) => {
    // Check for errors in our query and log them if they exist.
    if (err) return console.error('Free Busy Query Error: ', err)

    // Create an array of all events on our calendar during that time.
    const eventArr = res.data.calendars.primary.busy

    // Check if event array is empty which means we are not busy
    if (eventArr.length === 0)
      // If we are not busy create a new calendar event.
      return calendar.events.insert(
        { calendarId: 'primary', resource: event },
        err => {
          // Check for errors and log them if they exist.
          if (err) return console.error('Error Creating Calender Event:', err)
          // Else log that the event was created.
          return console.log('Calendar event successfully created.')
        }
      )

    // If event array is not empty log that we are busy.
    return console.log(`Sorry I'm busy...`)
  }
)
