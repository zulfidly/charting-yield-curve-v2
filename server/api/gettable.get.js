import Airtable from 'airtable'
Airtable.configure({ endpointUrl: 'https://api.airtable.com', apiKey: process.env.AT_TOKEN });
var base = new Airtable.base(process.env.AT_BASE_ID);

export default defineEventHandler(async(event) => {
    let yearsQuery = getQuery(event).userOptedYr
    yearsQuery = yearsQuery.split(',')
    console.log('yearsQuery:', yearsQuery);

    let promises = []
    yearsQuery.forEach(async(yr, ind) => {
        let ext = 'json_recId_' + yr.toString()
        let promise = new Promise(function(resolve, reject) {
            base(process.env.AT_yearly_TABLE_ID)
            .find(process.env[ext], function(err, record) {
                if (err) { 
                    reject( { statusCode:500, erroRR:JSON.stringify(err) } )
                } else {
                    resolve(JSON.stringify(record.fields.daily))
                }
            })    
        })
        promises.push(promise)
    });
    console.log(promises);
    
    return await Promise.all(promises)
    .then((res)=> {
        let temp = JSON.parse(res)
        // temp = res.flat()

        // temp = JSON.stringify(temp)
        console.log('resss', temp)
        return temp
    })
    .catch((err)=> {        
        console.log(err)
    })
})

