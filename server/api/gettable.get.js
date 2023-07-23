import Airtable from 'airtable'
Airtable.configure({ endpointUrl: 'https://api.airtable.com', apiKey: process.env.AT_TOKEN });
var base = new Airtable.base(process.env.AT_BASE_ID);

export default defineEventHandler(async(event) => {
    let years = getQuery(event).userOptedYr
    years = years.split(',')
    console.log(years);
    return await getRecordIDforSelectedYears(years)
})
async function getRecordId(years) {
    let temp = []
    return await base(process.env.AT_yearly_TABLE_ID)
        .select({ view: 'Grid view' })
        .firstPage(function (err, records) {     // 100 records per page by default
            if (err) return JSON.stringify(err)
            else {
                records.forEach(function (record, ind) {
                    if (years.includes(record.get('year').trim())) {
                        temp.push({ year: record.get('year'), recID: record.id })
                    }
                });
            }
            return temp.toString()
        })
}

async function getRecordIDforSelectedYears(years) {
    Airtable.configure({ endpointUrl: 'https://api.airtable.com', apiKey: process.env.AT_TOKEN });
    var base = new Airtable.base(process.env.AT_BASE_ID);
    let temp = []
    return await new Promise(function(resolve, reject) {
        base(process.env.AT_yearly_TABLE_ID)
        .select({ view: 'Grid view' })
        .firstPage(function (err, records) {     // 100 records per page by default
            if (err) return { statusCode: 500, erroR: JSON.stringify(err) }
            records.forEach(function (record, ind) {
                // console.log(record.id);
                if (years.includes(record.get('year').trim())) {
                    temp.push(record.id)
                }
            });
            console.log('found:', temp);
            resolve(JSON.stringify(temp))
        })
    })
}