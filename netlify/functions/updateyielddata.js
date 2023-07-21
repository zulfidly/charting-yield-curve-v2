import { schedule } from "@netlify/functions"
import Airtable from 'airtable'
Airtable.configure({ endpointUrl: 'https://api.airtable.com', apiKey: process.env.AT_TOKEN });
var base = new Airtable.base(process.env.AT_BASE_ID);

const updateYield = async function(event, context) {
    let promises = [
        await getAirtableRecordIdMatchingCurrentYear(),
        await scrapeForDataMatchingCurrentYear(),
    ]

    let mergedPromise = await Promise.all(promises)
    .then((data)=> {
        return { statusCode: 200, 'data': data}
    })
    .catch((err)=> {
        return { statusCode: 500, error: JSON.stringify(err)}
    })
    return updateAirtableRecordMatchingCurrentYear(mergedPromise)
}
exports.handler = schedule("20 14 * * 1-5", updateYield);   
// Standard UTC cron: “At 14:20 on every day-of-week from Monday through Friday.”   https://crontab.guru/
// equivalent to 10:20am Washington time

async function scrapeForDataMatchingCurrentYear() {
    const endpoint = 'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve&field_tdr_date_value='
    const yearUTC = new Date().getUTCFullYear().toString()
    return await fetch(endpoint + yearUTC, {mode:'cors'})
    .then((response) => response.text())
    .then((data) => { 
        console.log('then() scrapeForDataMatchingCurrentYear');
        return structurePerDayObj( getRowsFromTable(stringSlicer(data, '<tbody>', '</tbody>')) ) 
    })
    .catch((err)=> {
        console.log('catch() scrapeForDataMatchingCurrentYear');
        return { statusCode: 500, error: 'catch() scrapeForDataMatchingCurrentYear' }
    })
}
async function getAirtableRecordIdMatchingCurrentYear() {
    let yearUTC = new Date().getUTCFullYear()
    let recordID = undefined
    return await new Promise(function(resolve, reject) {
        base(process.env.AT_yearly_TABLE_ID)
        .select({ view: 'Grid view' })
        .firstPage(function(err, records) {     // 100 records per page by default
            if (err) reject(err)
            else {
                records.forEach(function(record, ind) {                    
                    if(yearUTC.toString() === record.get('year').toString()) {
                        recordID = record.id
                        console.log('recordID:', recordID, '| yearUTC:', yearUTC);
                        // if not
                    } else {
                        // when no matches i.e: it's a new year
                    }
                });
                resolve(recordID)
            }
        });
    })
}
async function updateAirtableRecordMatchingCurrentYear(mergedPromise) {
    const recID = mergedPromise.data[0]
    const dataAT = JSON.stringify(mergedPromise.data[1])
    return await new Promise(function(resolve, reject) {
        base(process.env.AT_yearly_TABLE_ID)
        .update([
            {
            "id": recID,
            "fields": { "daily": dataAT }        // can change jsoN to env ?
            }
        ],
        function(err, records) {
            if (err) {
                console.log('update rejected');
                reject({ statusCode: 500, body:JSON.stringify(err) })
            return;
            } else {
                console.log('updating Airtable record...');
                resolve({ statusCode: 200, body:'update successful' })
                updateLastYieldUpdateFieldInOtherInfo()
            }
        })
    })
}

function updateLastYieldUpdateFieldInOtherInfo() {
    let date = { 'utc' : new Date(), 'utc_ms': Date.now() }
    base(process.env.AT_visitorcount_TABLE_ID)
    .update([
        {
          "id": process.env.otherInfo_recordId,
          "fields": { 'lastYieldUpdate': JSON.stringify(date) }   // date/time in UTC
        }
      ],
      function(err, records) {
        if (err) {
          console.error('updateDateError:', err);
          return;
        }
    });  
}

function structurePerDayObj(arr) {
    let tempArr = []
    arr.forEach((entry, ind)=> {
        let dayObj = {
            'date': getCellData('time', entry.rowData),
            '1mth': getCellData('1month', entry.rowData),
            '2mth': getCellData('2month', entry.rowData),
            '3mth': getCellData('3month', entry.rowData),
            '4mth': getCellData('4month', entry.rowData),
            '6mth': getCellData('6month', entry.rowData),
            '1yr': getCellData('1year', entry.rowData),
            '2yr': getCellData('2year', entry.rowData),
            '3yr': getCellData('3year', entry.rowData),
            '5yr': getCellData('5year', entry.rowData),
            '7yr': getCellData('7year', entry.rowData),
            '10yr': getCellData('10year', entry.rowData),
            '20yr': getCellData('20year', entry.rowData),
            '30yr': getCellData('30year', entry.rowData),
        }
    tempArr.push(dayObj)
    })  // forEach loop
    return tempArr
} 
function getRowsFromTable(string) {
    let balstr = string.toString()
    let temp = []
    let qtyOfRows = findQTYofRows(stringSlicer(string, '<tbody>', '</tbody>'))
    for(let i=0; i< qtyOfRows; i++) {
        let obj = { 'rowData' : stringSlicer(balstr, '<tr', '</tr>') }      
        temp.push(obj)
        balstr = balstr.slice(balstr.indexOf('</tr>')+5, balstr.length+1)
    }
    return temp
}
function stringSlicer(string, startMarker, endMarker) {
    if(typeof string == 'string') { 
        let str = string.toString()
        let start = string.indexOf(startMarker)       // remoce whitespaces at both start and end of string
        let end = string.indexOf(endMarker) + endMarker.length
        str = string.slice(start, end)
        str = str.replace(/\s/ig, '')  // remove all whitespace in between
        str = str.trim()
        return str
    } 
    else if(string instanceof Array) {
        console.log('Not a string, but an Array:', string);
        return 'arraY'
    }
    else if( string instanceof Object) {
        console.log('Not a string, but an Object');
        return 'objecT'
    }
}
function findQTYofRows(str) {
    let qty = str.match(/<\/tr>/ig)
    return qty.length || 0
}
function getCellData(tag, str) {
    if(tag=='time') {
        let marker = '</time>'
        let x = str.slice( str.indexOf(marker)-10, str.indexOf(marker) )
        return x || '_invalid'
    }
    else if(tag=='1month') {
        let marker = '<tdclass="bc1monthviews-fieldviews-field-field-bc-1month"headers="view-field-bc-1month-table-column">'
        let x = str.indexOf(marker)
        let y = str.slice(marker.length + x, marker.length + x+8)
        let z = y.replace(/[<td/>]/ig, '')
        return z || '_invalid'        
    }
    else if(tag=='2month') {
        let marker = '<tdclass="bc2monthviews-fieldviews-field-field-bc-2month"headers="view-field-bc-2month-table-column">'
        let x = str.indexOf(marker)
        let y = str.slice(marker.length + x, marker.length + x+8)
        let z = y.replace(/[<td/>]/ig, '')
        return z || '_invalid'        
    }
    else if(tag=='3month') {
        let marker = '<tdclass="bc3monthviews-fieldviews-field-field-bc-3month"headers="view-field-bc-3month-table-column">'
        let x = str.indexOf(marker)
        let y = str.slice(marker.length + x, marker.length + x+8)
        let z = y.replace(/[<td/>]/ig, '')
        return z || '_invalid'        
    }
    else if(tag=='4month') {
        let marker = '<tdclass="bc4monthviews-fieldviews-field-field-bc-4month"headers="view-field-bc-4month-table-column">'
        let x = str.indexOf(marker)
        let y = str.slice(marker.length + x, marker.length + x+8)
        let z = y.replace(/[<td/>]/ig, '')
        return z || '_invalid'        
    }
    else if(tag=='6month') {
        let marker = '<tdheaders="view-field-bc-6month-table-column"class="views-fieldviews-field-field-bc-6month">'
        let x = str.indexOf(marker)
        let y = str.slice(marker.length + x, marker.length + x+8)
        let z = y.replace(/[<td/>]/ig, '')
        return z || '_invalid'        
    }
    else if(tag=='1year') {
        let marker = '<tdheaders="view-field-bc-1year-table-column"class="views-fieldviews-field-field-bc-1year">'
        let x = str.indexOf(marker)
        let y = str.slice(marker.length + x, marker.length + x+8)
        let z = y.replace(/[<td/>]/ig, '')
        return z || '_invalid'        
    }
    else if(tag=='2year') {
        let marker = '<tdheaders="view-field-bc-2year-table-column"class="views-fieldviews-field-field-bc-2year">'
        let x = str.indexOf(marker)
        let y = str.slice(marker.length + x, marker.length + x+8)
        let z = y.replace(/[<td/>]/ig, '')
        return z || '_invalid'        
    }
    else if(tag=='3year') {
        let marker = '<tdclass="bc3monthviews-fieldviews-field-field-bc-3year"headers="view-field-bc-3year-table-column">'
        let x = str.indexOf(marker)
        let y = str.slice(marker.length + x, marker.length + x+8)
        let z = y.replace(/[<td/>]/ig, '')
        return z || '_invalid'        
    }
    else if(tag=='5year') {
        let marker = '<tdheaders="view-field-bc-5year-table-column"class="views-fieldviews-field-field-bc-5year">'
        let x = str.indexOf(marker)
        let y = str.slice(marker.length + x, marker.length + x+8)
        let z = y.replace(/[<td/>]/ig, '')
        return z || '_invalid'        
    }
    else if(tag=='7year') {
        let marker = '<tdheaders="view-field-bc-7year-table-column"class="views-fieldviews-field-field-bc-7year">'
        let x = str.indexOf(marker)
        let y = str.slice(marker.length + x, marker.length + x+8)
        let z = y.replace(/[<td/>]/ig, '')
        return z || '_invalid'        
    }
    else if(tag=='10year') {
        let marker = '<tdheaders="view-field-bc-10year-table-column"class="views-fieldviews-field-field-bc-10year">'
        let x = str.indexOf(marker)
        let y = str.slice(marker.length + x, marker.length + x+8)
        let z = y.replace(/[<td/>]/ig, '')
        return z || '_invalid'        
    }
    else if(tag=='20year') {
        let marker = '<tdclass="bc20yearviews-fieldviews-field-field-bc-20year"headers="view-field-bc-20year-table-column">'
        let x = str.indexOf(marker)
        let y = str.slice(marker.length + x, marker.length + x+8)
        let z = y.replace(/[<td/>]/ig, '')
        return z || '_invalid'        
    }
    else if(tag=='30year') {
        let marker = '<tdclass="bc30yearviews-fieldviews-field-field-bc-30year"headers="view-field-bc-30year-table-column">'
        let x = str.indexOf(marker)
        let y = str.slice(marker.length + x, marker.length + x+8)
        let z = y.replace(/[<td/>]/ig, '')
        return z || '_invalid'        
    }
    else {
        return 'invalid_'
    }
}
