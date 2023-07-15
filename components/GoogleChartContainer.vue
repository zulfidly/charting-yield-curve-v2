<template>
  <div>
    <div v-show="props.propIsChartShowing"    
      class="fixed z-10 top-0 left-0 w-screen h-screen transition-all duration-700" 
      id="curve_chart"
      ref="googchartTemplateRef"
      >
    </div>
    <button v-if="propIsChartShowing" @click="closeGoogChart" class=" z-20 fixed top-0 right-0 m-4 lg:m-8" >
      <IconCloseChart />
    </button>  
  </div>
</template>

<script setup>
  let color = {}
  let dimension = {
      innerChart: {
      W: undefined,
      H: undefined,
      L: undefined,
      T: undefined,
      },
      outerChart: {
      W: undefined,
      H: undefined,
      }
  }  
  function getChartColor() {
      var r = document.querySelector(':root')
      var rs = getComputedStyle(r)
      let txtClr = rs.getPropertyValue("--chart-text").trim()
      color = {
      mainTitle: txtClr,
      legendTextColor: txtClr,
      xAxisLabels: txtClr,
      yAxisLabels: txtClr,
      chartAreaBG: rs.getPropertyValue("--chartarea-bg").trim(),
      chartBG: rs.getPropertyValue("--chart-bg").trim(),
      }
  }

  defineExpose({ showGoogChart })
  const props = defineProps({
    propIsChartShowing:  { type: Boolean, default: false, required: true },
    propChartData:       { type: Array, default: []  }
  })

  const googchartTemplateRef = ref(null)
  const emiT = defineEmits(['isChartShown'])
  onMounted(()=> {
    // console.log(googchartTemplateRef.value);
    useEventListener(window.matchMedia("(prefers-color-scheme:dark)"), 'change', ()=>{    
      let isDark = window.matchMedia("(prefers-color-scheme:dark)").matches
      if(props.propIsChartShowing) {
      
      // if(isDark) {
        showGoogChart()
        // document.querySelector('html').classList.add('dark')

      }
      // } else return
    })
    useEventListener('resize', ()=>{
      if(props.propIsChartShowing) showGoogChart()
      else return
    })
  })
  function closeGoogChart() { emiT('isChartShown', false) }

  function showGoogChart() {
    emiT('isChartShown', true)
    google.charts.load('current', { 'packages': ['corechart'] });            
    google.charts.setOnLoadCallback(()=>drawChart(props.propChartData)) 
  }

  function drawChart(propChartData) {
    getChartColor()
    setChartDimension()
    var options = {
      title: "U.S Treasury Yield Difference",
      titlePosition: "out",
      titleTextStyle: {
          fontSize: 16,
          bold: true,
          color: color.mainTitle,
      },
      width: dimension.outerChart.W,
      height: dimension.outerChart.H,         
      backgroundColor: color.chartBG,
      chartArea: {
        top: dimension.innerChart.T,
        left: dimension.innerChart.L,
        width: dimension.innerChart.W,
        height: dimension.innerChart.H,
        backgroundColor: color.chartAreaBG
      },
      vAxis: {
        textPosition: "out",
        textStyle: {
          fontSize: 14,
          bold: true,
          color: color.yAxisLabels,
        },
      },
      hAxis: { 
        textPosition: "out",
        slantedText: true, 
        slantedTextAngle: 45,
        showTextEvery: 28,
        viewWindowMode: "pretty",
        textStyle: {
            fontSize: 14,
            color: color.xAxisLabels,
        },
      },
      legend: {
        position: "top",
        alignment: "end",
        textStyle: {
            color: color.legendTextColor,
            bold: true,
        },
      },
    };
    var data = google.visualization.arrayToDataTable(propChartData);
    var chart = new google.visualization.LineChart(googchartTemplateRef.value);
    chart.draw(data, options);
  }

  function setChartDimension() { 
    dimension.innerChart.W = window.innerWidth * 0.75
    dimension.innerChart.H = window.innerHeight * 0.65
    dimension.innerChart.T = "auto"
    dimension.innerChart.L = "auto"
    dimension.outerChart.W = window.innerWidth
    dimension.outerChart.H = window.innerHeight
  }

</script>