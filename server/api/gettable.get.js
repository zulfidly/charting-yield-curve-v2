import Airtable from 'airtable'
Airtable.configure({ endpointUrl: 'https://api.airtable.com', apiKey: process.env.AT_TOKEN });
var base = new Airtable.base(process.env.AT_BASE_ID);

export default defineEventHandler(async(event) => {
    let yearsQuery = getQuery(event).userOptedYr
    yearsQuery = yearsQuery.split(',')
    console.log('yearsQuery:', yearsQuery);

        let ext = 'json_recId_' + yearsQuery.toString()
        let promise = new Promise(function(resolve, reject) {
            base(process.env.AT_yearly_TABLE_ID)
            .find(process.env[ext], function(err, record) {
                if (err) { 
                    reject( { statusCode:500, erroRR:JSON.stringify(err) } )
                } else {
                    resolve(record.fields.daily)
                }
            })    
        })
    return await promise
})

