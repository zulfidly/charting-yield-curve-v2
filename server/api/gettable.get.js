import Airtable from 'airtable'
Airtable.configure({ endpointUrl: 'https://api.airtable.com', apiKey: process.env.AT_TOKEN });
var base = new Airtable.base(process.env.AT_BASE_ID);

export default defineEventHandler(async(event) => {
    let years = getQuery(event).userOptedYr
    years = years.split(',')
    console.log(years);
    // return await getRecordIDforSelectedYears(years)
    return await getRecordId(years)
    // const recordID = await getRecordIDforSelectedYears(years)
    // console.log(recordID);

    // return await new Promise(function(resolve, reject) {
    //     base(process.env.AT_visitorcount_TABLE_ID)
    //     .find(recordID, function(err, record) {
    //     // .find('reclym0nvm4wF19qa', function(err, record) {
    //       if (err) { 
    //         // console.error(err)
    //         reject( { statusCode:500, error:JSON.stringify(err) } )
    //       } else {
    //         resolve(JSON.stringify(record))
    //         // let retrieveDate = record.fields.lastYieldUpdate
    //         // resolve(retrieveDate.toString())
    //       }
    //     })

    // })
}) 
async function getRecordId(years) {
    let temp = []
    return await new Promise(function(resolve, reject) {
        base(process.env.AT_yearly_TABLE_ID)
        .select({ view: 'Grid view' })
        .firstPage(function(err, records) {     // 100 records per page by default
            if(err) reject({ statusCode: 500, erroR: JSON.stringify(err) })
            else {
                records.forEach(function(record, ind) {         
                    if(years.includes(record.get('year').trim())) {     
                        temp.push({year: record.get('year'), recID: record.id })                       
                    }
                });
                resolve(JSON.stringify(temp))
            }
        })
    })
}

async function getRecordIDforSelectedYears(years) {
    let temp = []
    base(process.env.AT_yearly_TABLE_ID)
    .select({ view: 'Grid view' })
    .firstPage(function(err, records) {     // 100 records per page by default
        if(err) return { statusCode: 500, erroR: JSON.stringify(err) } 
        else {
            records.forEach(function(record, ind) {         
                if(years.includes(record.get('year').trim())) {     
                    temp.push(record.id)                       
                }
            });
            console.log(temp);
            return temp
        }
    })
    // return await temp

}