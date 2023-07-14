import { schedule } from "@netlify/functions"
import Airtable from 'airtable'
Airtable.configure({ endpointUrl: 'https://api.airtable.com', apiKey: process.env.AT_TOKEN });
var base = new Airtable.base(process.env.AT_BASE_ID);

const updateYield = async function(event, context) {

    console.log(new Date());

    // return await fetch(endpoint, {mode:'cors'})
    // .then((response) => response.text())
    // .then((data) => { 
    //     return structurePerDayObj( getRowsFromTable(stringSlicer(data, '<tbody>', '</tbody>')) ) 
    // })
    // .catch((err)=> {
    //     return { statusCode: 500, error: err }
    // })

}
exports.handler = schedule("6 4 * * 1-5", updateYield);   // Standard UTC cron: “At 10:30 on every day-of-week from Monday through Friday.”   https://crontab.guru/
