import Airtable from 'airtable'

export default defineEventHandler(async(event) => {
    let years = getQuery(event).userOptedYr
    years = years.split(',')
    return await readTable1(years)
}) 

export async function readTable1(years) {
    Airtable.configure({ endpointUrl: 'https://api.airtable.com', apiKey: process.env.AT_TOKEN });
    var base = new Airtable.base(process.env.AT_BASE_ID);
    let promise = new Promise(function(resolve, reject) {
        base(process.env.AT_yearly_TABLE_ID)
        .select({ view: 'Grid view' })
        .firstPage(function(err, records) {     // 100 records per page by default
            if (err) reject({statusCode: 500, "error": JSON.stringify(err)})
            else {
                let temp = []
                records.forEach(function(record, ind) {                    
                    if(years.includes(record.get('year'))) temp.push({ year: record.get('year'), datA: record._rawJson.fields.jsoN || '' })
                });
                resolve(temp)
            }
        });
    })
    return await promise
}
