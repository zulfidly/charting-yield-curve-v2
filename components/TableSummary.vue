<script setup>
    // import { useVirtualList } from '@vueuse/core';
    const props = defineProps({
        propTableData: {
            type: Array,
            default: [],
            required: true
        },
        propScrH: {
            type: Number,
            default: 0,
            required: true
        },
        propIsMobileLandscape: {
            type: Boolean,
            default: false,
            required: true
        },
    })

    const iheight = ref(26)
    const vListRef = ref(null)

    const computedList = computed(()=> { return props.propTableData || [] })
    const { list, containerProps, wrapperProps } = useVirtualList(
        computedList,
        {
            itemHeight: iheight.value,
        },
    )

    const changeindicator = ref('init')
    function vListMarker() {
        let getLastRenderedDate = vListRef.value.lastElementChild.firstElementChild.textContent
        let getNumberOfRenderedList = vListRef.value.childElementCount
        changeindicator.value = getLastRenderedDate + ' [rend:' + getNumberOfRenderedList + '/' + props.propTableData.length + ']'
    }
    const ctnrPropsHeight = computed(()=> {
        if(props.propIsMobileLandscape) return `height:${props.propScrH-36}px;`
        return `height:510px;`
    })
</script>

<template>
    <div class="mt-3 sm:mt-0 flex flex-col w-full rounded-md">
        <div class="fixed bottom-0 right-0 text-xs">{{ changeindicator }}</div>
        <div class="text-center mx-auto rounded-lg transition-all duration-700" @scroll="vListMarker" v-bind="containerProps" :style="ctnrPropsHeight">
            <p class="bg-[--table-cap]">Summary Data (in %)</p> 
            <div class="inline-block w-full" ref="vListRef" v-bind="wrapperProps">
                <section class="table-row sticky top-0 bg-rose-300 [&>*]:px-2 [&>*]:align-middle [&>*]:lg:px-20 bg-[var(--color-background-mute)]">
                    <p class="table-cell ">Date</p>
                    <p class="table-cell">10yr</p>
                    <p class="table-cell">2yr</p>
                    <p class="table-cell">3mth</p>
                    <p class="table-cell">10yr-2yr</p>
                    <p class="table-cell">10yr-3mth</p>
                </section>
                <section v-for="(item, ind) in list" :style="'height:'+iheight+'px;'" :key="'row'+ind" class="table-row mb-4 [&>*]:px-2 [&>*]:sm:px-10 [&>*]:even:bg-[var(--color-background-mute)]">
                    <p class="table-cell">{{ Intl.DateTimeFormat('en-GB').format(new Date(item.data.date)) }}</p>
                    <p class="table-cell">{{ item.data['10yr'] }}</p>
                    <p class="table-cell">{{ item.data['2yr'] }}</p>
                    <p class="table-cell">{{ item.data['3mth'] }}</p>
                    <p class="table-cell">{{ (item.data['10yr'] - item.data['2yr']).toFixed(2) }}</p>
                    <p class="table-cell">{{ (item.data['10yr'] - item.data['3mth']).toFixed(2) }}</p>
                </section>
            </div>
        </div>
    </div>
</template>
