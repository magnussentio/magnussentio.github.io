const fetch = require("node-fetch")

const Airtable = require("airtable")

const handler = async (event) => {
// Configure Airtable base connection
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
)
// Configure table name
const table = base(process.env.AIRTABLE_TABLE_NAME)

const etrnlAuth = async (tagId, eCode, enc, cmac, base, table) => {
  try {
    console.log(tagId)
    console.log(eCode)
    const res = await fetch('https://third-party.etrnl.app/v1/verify', {
      method: 'POST',
      body: JSON.stringify({
        tagId,
        eCode,
        enc,
        cmac,

      }),
    });
    const {
        success, // boolean
        exists, // boolean
        authentic, // boolean
        ctr, // number
        uid, // string (only provided if using the private key)
        err // error code
      } = await res.json();

      if ( authentic ) {

         // Show authentic product page

        const date = new Date();
        await table
        .create({
          createdTime: date.toISOString(),
          tagId,
          eCode,
          enc,
          cmac,
        })
        .then((records) => {
          console.log("Successfully inserted authentic rune into database")
        })
        return {
          statusCode: 202,
          body: JSON.stringify({ message: "Authentic"})
        }
/*      .catch((err) => {
        console.log(Error.err)
      })*/
      } else {
        return {
          statusCode: 600,
          body: JSON.stringify({ message: "Inauthentic"})
        }

         // Show inauthentic product page

      }
  } catch(err) {
    console.error(err);
  }
};

  try {
    const { httpMethod } = event
    let fields = JSON.parse(event.body)
    
    const runDate = new Date()
    console.log(runDate)
    const runTime = runDate.toISOString()
    const { tagId, eCode, enc, cmac } = fields
    const date = new Date()
    console.log(date)
    console.log(fields)
    console.log(tagId)
    // Only allow POST
    if (httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method Not Allowed" })
      }
    } else if (!tagId || !eCode || !enc || !cmac) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Bad Request" })
      }
    }

    // Create record
    // NOTE: Without `await`, this will not wait until data has been inserted into Airtable and return Status 202 due to async behaviour.
    // As a result, we will receive 202 response code but our data are not inserted into our Airtable base.
    
    console.log("made it here")
    const fieldTagId = 'tagId'
    const fieldECode = 'eCode'
    const fieldENC = 'enc'
    const fieldCMAC = 'cmac'
    await table
    .select({
        filterByFormula: `AND({${fieldTagId}} = ${tagId}, {${fieldECode}} = ${eCode}, {${fieldENC}} = ${enc}, {${fieldCMAC}} = ${cmac})`,
      })
      .all(function(err, records) {
     if (err) { 
      console.error(err); 
      return; 
    }
    if (records && records.length >= 1) {
        records.forEach(function(record) {
        const dateTime = record.get('createdTime')
        console.log('Retrieved', dateTime);
        const d1 = new Date(dateTime);
        const d2 = new Date(runTime);
        const timeDif = d2 - d1
        console.log(timeDif)
        if ((timeDif) > 30 * 60 * 1000) {
          console.log("old rune")
          return {
            statusCode: 202,
            body: JSON.stringify({ message: "Rune Decayed"})
          } 

        } else {
            return {
              statusCode: 202,
              body: JSON.stringify({ message: "Authentic" })
            }
        }
        

      });

    } else {
      console.log("No records found")
      console.log("ETRNL TIME")
      etrnlAuth(tagId, eCode, enc , cmac, base, table);

    }
 
    });
    



  } catch (error) {
    console.log(error)
    return { 
      statusCode: 500, 
      body: "Oops! Something went wrong." }
  }
}



module.exports = { handler }