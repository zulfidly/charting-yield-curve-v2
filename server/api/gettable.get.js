import Airtable from 'airtable'

export default defineEventHandler(async(event) => {
    Airtable.configure({ endpointUrl: 'https://api.airtable.com', apiKey: process.env.AT_TOKEN });
    var base = new Airtable.base(process.env.AT_BASE_ID);
    let years = getQuery(event).userOptedYr
    years = years.split(',')
    console.log(years);

    return await new Promise(function(resolve, reject) {
        base(process.env.AT_yearly_TABLE_ID)
        .select({ view: 'Grid view' })
        .firstPage(function(err, records) {     // 100 records per page by default
            if(err) reject( { statusCode: 500, erroR: JSON.stringify(err) } )
            else {
                // let temp = []
                    records.forEach(function(record, ind) {         
                        if(years.includes(record.get('year').trim())) {                            
                            // temp.push({ year: record.get('year'), yieldData: record.get('daily') || '' })
                            // resolve([{ year: record.get('year'), yieldData: record.get('daily') || '' }])
                            resolve(record.get('year').toString())
                            console.log(record);
                        } 
                    });
                // resolve(temp)
            }
        })
    })
}) 
