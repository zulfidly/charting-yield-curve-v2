import Airtable from 'airtable'
Airtable.configure({ endpointUrl: 'https://api.airtable.com', apiKey: process.env.AT_TOKEN });
var base = new Airtable.base(process.env.AT_BASE_ID);

export default defineEventHandler(async(event) => {
  let promise = new Promise(function(resolve, reject) {
    let currentCount = undefined
    let incremented = undefined
    base(process.env.AT_visitorcount_TABLE_ID)
    .find(process.env.otherInfo_recordId, function(err, record) {
      if (err) { 
        console.error(err)
        reject(err)
      } else {
        currentCount = record.fields.visitorCount * 1
        incremented = (currentCount + 1).toString()
        resolve(incremented)
        updateCount(incremented)
      }
    })
  })
  return  await promise
}) 

function updateCount(newcount) {
  base(process.env.AT_visitorcount_TABLE_ID)
  .update([
      {
        "id": process.env.otherInfo_recordId,
        "fields": { 'visitorCount': newcount }
      }
    ],
    function(err, records) {
      if (err) {
        console.error('updateCountError:', err);
        return;
      }
    });
}
