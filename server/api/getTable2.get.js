import Airtable from 'airtable'

export default defineEventHandler(async(event) => {
    Airtable.configure({ endpointUrl: 'https://api.airtable.com', apiKey: process.env.AT_TOKEN });
    var base = new Airtable.base(process.env.AT_BASE_ID);
    let years = getQuery(event).userOptedYr
    years = years.split(',')
    console.log(years);

    let promise = new Promise(function(resolve, reject) {
        base(process.env.AT_visitorcount_TABLE_ID)
        .find('reclym0nvm4wF19qa', function(err, record) {
          if (err) { 
            // console.error(err)
            reject( { statusCode:500, error:JSON.stringify(err) } )
          } else {
            resolve(JSON.stringify(record))
            // let retrieveDate = record.fields.lastYieldUpdate
            // resolve(retrieveDate.toString())
          }
        })
    })
    return await promise}) 
