<script setup>
  const lastYieldUpdate = ref('retrieving')
  const exposeGoogChartRef = ref(null)
  const exposeMessageBoardRef = ref(null)
  const appStore = useMainStorePinia()

  useHead({
    title: 'Yield Curve Difference',
    htmlAttrs:{ lang:'en' },
  })

  onMounted(async()=> {    // hydrating
    updateUserScreenPropertiesOnMounted()
    useEventListener('resize', ()=> { updateUserScreenPropertiesOnMounted() })
    setTimeout(() => {      
      displayMessageBoard('Welcome 🎵')
    }, 500);
    let dummy = await useFetch('/api/getOtherInfo') 
    getLastYieldUpdateOnMounted()
  })
  async function getLastYieldUpdateOnMounted() {
    let temp = await useFetch('/api/getLastYieldUpdate')
    temp = JSON.parse(temp.data.value)
    lastYieldUpdate.value = new Date(temp.utc_ms)
  }

  onNuxtReady(()=> {  // hydrated
    console.log('Nuxt hydrated');
    useHead({
      script: [    
        `if(window.matchMedia("(prefers-color-scheme:dark)").matches) document.querySelector('html').classList.add('dark')`,
        {
          type: "text/javascript",
          src: "https://www.gstatic.com/charts/loader.js",
          async: true
        }
      ]
    })      
  })

  function displayMessageBoard(text) {
    exposeMessageBoardRef.value.showMessageBoard(text.toString())
  }

  function updateUserScreenPropertiesOnMounted() {   
    appStore.m_userScrW()
    appStore.m_userScrH()
    appStore.m_userScrFormFactor()
    appStore.m_userScrIsMobileLandscape()
    appStore.m_userScrOrientation()
    appStore.m_userScrRatioWH()
    // appStore.m_listenIsDark()
  }
</script>

<template>
  <div>
    <Notifier 
      ref="exposeMessageBoardRef"
    />
    <HeaderAttr v-if="!appStore.userScr.isMobileLandscape" />

    <GoogleChartContainer
      ref="exposeGoogChartRef"
      :prop-chart-data="appStore.chartData"
      :prop-is-chart-showing="appStore.isChartShowing"
      @is-chart-shown="(bool)=> appStore.toggleIsChartShowing(bool)"
    />

    <YieldChartOptionsForm
      :disconnectBtn="!appStore.isDataContinuityOK"
      :prop-is-mobile-landscape="appStore.userScr.isMobileLandscape"
      :prop-is-fetching="appStore.isFetching"
      :prop-is-chart-showing="appStore.isChartShowing"
      :prop-selected-year="appStore.selectedYear"
      @view-chart="exposeGoogChartRef.showGoogChart()"
      @updateis-fetching="(bool)=> appStore.updateIsFetching(bool)"
      @updatetable-data="(data)=> appStore.buildTableData(data)"
      @updatechart-data="appStore.buildChartData()"
      @updateselected-year="(years)=> appStore.updateSelectedYear(years)"
    />
    <div
      v-show="!appStore.userScr.isMobileLandscape"
      class="pl-2 text-[11px] lg:text-sm text-right italic font-thin" >
      updated: {{ lastYieldUpdate }}
      <div>*pending: solving Airtable's data being returned as DOCTYPE from Netlify</div>
    </div>

    <TableSummary 
      :prop-table-data="appStore.tableData"
      :prop-is-mobile-landscape="appStore.userScr.isMobileLandscape"
      :prop-scr-h="appStore.userScr.H"
    />

  </div>
</template>
