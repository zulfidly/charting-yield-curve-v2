<script setup>
    const props = defineProps({
        disconnectBtn: {
            type: Boolean, default: false, required: true
        },
        propIsMobileLandscape: {
            type: Boolean, default: false, required: true
        },
        propIsChartShowing: {
            type: Boolean, default: false, required: true
        },
        propIsFetching: {
            type: Boolean, default: false, required: true
        },
        propSelectedYear: {
            type: Array, default: [], required: true
        },
    })
    const emiT = defineEmits(['viewChart', 'updatechartData', 'updatetableData', 'updateisFetching', 'updateselectedYear'])  
    const endYear = new Date().getFullYear()
    const startYear = 1990      // earliest data available on the Treasury website
    const arrYearDropList = ref([])     // in numbers
    const selectYrFrom = ref(endYear.toString())
    const selectYrTo = ref(endYear.toString())
    const yearRange = ref([endYear.toString()])       

    for(let i = endYear; i>=startYear; i--) { arrYearDropList.value.push(i) }

    const filteredOptionFrom = computed(()=> arrYearDropList.value.filter((x, y, z)=> {
        return x.toString() <= selectYrTo.value
    }))
    const filteredOptionTo = computed(()=> arrYearDropList.value.filter((x, y, z)=> {
        return x.toString() >= selectYrFrom.value
    }))

    async function fetchDataFromAirtable(btnType) {
        let temp = await useFetch('/api/getTable', { query: { userOptedYr: yearRange.value.toString() } })
        console.log('fetchDataFromAirtable', temp);
        return { 'data': temp, btn: btnType }
    }

    async function submitUserOptions(btnType) {
        console.log(btnType);
        yearRange.value = []
        for(let i = Number(selectYrFrom.value); i <= Number(selectYrTo.value); i++) {
            yearRange.value.push(i)
        }        
        if(yearRange.value.toString() === props.propSelectedYear.toString()) {
            if(btnType === 'viewChart' && props.propIsChartShowing === false) {
                emiT('viewChart') // display chart
            }
            return  // do nothing if user requested same set of data
        }
        else {
            emiT('updateisFetching', true)
            emiT('updateselectedYear', yearRange.value)
            userSubmission(await fetchDataFromAirtable(btnType))
            if(btnType === 'viewChart' && props.propIsChartShowing === false) {
                emiT('viewChart') // display chart
            }
        }
    }
    function userSubmission(dataReceivedFromServer) {
        console.log('userSubmission');
        let arr = dataReceivedFromServer.data.data._rawValue
        let temp = []
        arr.forEach((obj, ind)=> {
            temp.push(JSON.parse(obj.datA))
        })
        emiT('updatetableData', temp.flat())        
        emiT('updateisFetching', false)
        emiT('updatechartData', temp)
    }

</script>

<template>
    <div v-show="!props.propIsMobileLandscape" class="w-full p-2 sm:p-3 border border-[--color-border] rounded-lg bg-[--color-background-soft]">
        <form class="flex items-center gap-1 sm:gap-3">
            <section class="basis-1/2 border border-[--color-border] bg-[--color-background-mute] p-1 sm:p-2 rounded-lg">
                <label class="font-normal w-2/12 text-center italic sm:mr-2" for="yearFrom">fr:</label>
                <select class="w-10/12 rounded-md bg-[--color-background]" id="yearFrom" name="yearFrom" v-model="selectYrFrom">
                    <option class="text-center" v-for="(yr, ind) in filteredOptionFrom" :value="yr" :key="'fr'+yr"> {{ yr }}</option>
                </select>
            </section>
            <!-- <p class="text-center breack-all font-normal">Set data range</p> -->
            <section class="basis-1/2 border border-[--color-border] bg-[--color-background-mute] p-1 sm:p-2 rounded-lg">
                <label class="font-normal w-2/12 text-center italic sm:mr-2" for="yearTo">to:</label>
                <select class="w-10/12 rounded-md bg-[--color-background]" id="yearTo" name="yearTo" v-model="selectYrTo">
                    <option class="text-center" v-for="(yr, ind) in filteredOptionTo" :value="yr" :key="'to'+yr"> {{ yr }}</option>
                </select>
            </section>
        </form>
        <section class="flex gap-1 sm:gap-3">
            <button
                class="flex gap-4 justify-center items-center mt-3 py-1 bg-[--view-btn] rounded-lg w-full"
                @click="submitUserOptions('viewTable')"
                >
                <span class="tracking-wider">View Table</span>
                <IconSpinner v-if="props.propIsFetching" />
                <IconTable v-else />
            </button>
            <button 
                :disabled="0" 
                :class="[0?'opacity-0':'opacity-100 bg-[--view-btn]']" class="flex gap-4 justify-center items-center mt-3 py-1 rounded-lg w-full"
                @click="submitUserOptions('viewChart')"
                >
                <span class="tracking-wider">View Chart</span>
                <IconSpinner v-if="props.propIsChartShowing" />
                <IconChart v-else />
            </button>
        </section>

    </div>
</template>