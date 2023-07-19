# US Treasury yield difference 
- charting inversion points

## Netlify demo [version 2](https://yield-diff-at-fidly.netlify.app/)

## Issue (upon deployment, it's running fine on ```npm run dev```)
- Problem(15/Jul/2023): returned data from Airtable/Netlify not as expected (was working normally the day before hitting the automation monthly 100 limit)
- Netlify not able to execute scheduled web scraping 

## to see version 1 :
- see [version 1 demo](https://ust-yield-chart-fidly.netlify.app/) Netlify demo (prone to fetch failure due to CORS violations )
- see [version 1 repo](https://github.com/zulfidly/charting-yield-curve) repo

## Design Principles 
- to limit data channeling/directing only to ```app.vue```
- to improve modularity of each components with  ```defineExpose({})```
- to improve data type(ing) and modularity with ```defineProps({})``` for data consuming components
- to improve modularity with ```defineEmits([])``` for data mutating components
- data type(ing) with ```defineProps({})```
- to limit state mutations to within Pinia only, due to it's ```actions()``` feature
- utilising Airtable for cloud data storage and data updating
- Netlify function for data scraping automations
- large data presentation with virtual listed table and Google chart

## Install Nuxt
- ```npx nuxi@latest init <project-name>```
- ```cd <project-name>```
- ```npm install```
- ```npm run dev -- -o``` (this opens new browser)
- ```nuxt.config.ts``` renamed to ```.js```

## Adding Tailwind CSS 
- ```npm install -D @nuxtjs/tailwindcss```
- ```npx tailwindcss init -p``` (create tailwindcss.config.js & postcss.config.js inside root folder)
- see ```@nuxtjs/tailwindcss``` in nuxt.config.js

## deleted /server/tsconfig.json, content as below
- ```{"extends": "../.nuxt/tsconfig.server.json"}```

## install [Pinia](https://pinia.vuejs.org/ssr/nuxt.html)
- add ```overrides``` added to package.json
- ```npm install pinia @pinia/nuxt```
- ```export const useMainStorePinia = defineStore('appStore', {})```, dir: ```./composables/mainState.js``` 
- see ```@pinia/nuxt``` in nuxt.config.js
- see ```./composables/mainState.js```

## add [Airtable](https://www.airtable.com/)
- ```npm install airtable```

## add [Netlify Function](https://www.netlify.com/products/functions/)
- ```npm install @netlify/functions``` 
- ```import { schedule } from "@netlify/functions"```
- Standard [cron](https://crontab.guru/)
- CRON runner : ```exports.handler = schedule("20 14 * * 1-5", updateYield)```, “At 14:20 on every day-of-week from Monday through Friday.” (equivalent to 10:20am, GMT-4 US)
- ```return { statusCode: 200 }``` or ```return { statusCode: 500 }``` required
- create directory at root : ```netlify/functions```
- Note that scheduled functions don’t work with payloads or POST request data. When you need to work with payloads, you should use either a synchronous or background function instead.
- Background Functions feature is not available in free Starter plans
- Observed : maximum 10seconds server compute time per execution 
- server cannot hold data permanently

## add VueUse for access to Vue3 friendly composables
- ```npm i -D @vueuse/nuxt @vueuse/core```
- see ```@vueuse/nuxt``` in nuxt.config.js
- see ```useEventListener()```
- see ```useVirtualList()```, used to minimise number of rendered DOMs in the table (virtual scrolling)

## 'dark' class 
- see ```darkMode: 'class'```, inside tailwind.config.js
- see ```dark:text-[var(--color-text)]``` like syntaxes
