import Airtable from 'airtable'

export default defineEventHandler(async(event) => {
    return await readDate()
}) 

export async function readDate() {
    Airtable.configure({ endpointUrl: 'https://api.airtable.com', apiKey: process.env.AT_TOKEN });
    var base = new Airtable.base(process.env.AT_BASE_ID);
    let promise = new Promise(function(resolve, reject) {
        base(process.env.AT_visitorcount_TABLE_ID)
        .find(process.env.otherInfo_recordId, function(err, record) {
          if (err) { 
            console.error(err)
            reject(err)
          } else {
            let retrieveDate = record.fields.lastYieldUpdate
            resolve(retrieveDate.toString())
          }
        })
    })
    return await promise
}
