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
            if(err) reject({statusCode: 500, "erroR": JSON.stringify(err)})
            else {
                let temp = []
                if(records.toString().includes('DOCTYPE')) reject('request rejected')
                else {
                    records.forEach(function(record, ind) {         
                        // console.log(record.get('year'), typeof record.get('year'));           
                        if(years.includes(record.get('year').trim())) {
                            
                            temp.push({ year: record._rawJson.fields.year, datA: record._rawJson.fields.jsoN || '' })
                            // temp.push({ year: record.get('year'), datA: record._rawJson.fields.jsoN || '' })
                        } 
                    });
                }
                resolve(temp)
            }
        });
    })
    return await promise
}
