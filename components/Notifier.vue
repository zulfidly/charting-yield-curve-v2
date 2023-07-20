<script setup>
    const msg = ref('message board init')
    const isShow = ref(false)
    defineExpose({ showNotifier })

    const card = {
        init: ['fixed z-10 mt-3 w-11/12 p-3 left-1/2 -translate-x-1/2 text-center bg-slate-300 rounded-xl text-xl tracking-wider text-[var(--vt-c-indigo)] transition-all duration-700'],
        show: ['opacity-100 top-0'],
        hide: ['opacity-0 -top-full'],
    }
    function showNotifier(text, duration) {
        msg.value = String(text)
        isShow.value = true
        setTimeout(()=> isShow.value = false, Number(duration))
    }
</script>
<!-- code at parent side -->
<!-- const exposeNotifierRef = ref(null) -->
<!-- displayNotifier('Welcome 🎵', 3000) -->
<!-- function displayNotifier(text, duration) { exposeNotifierRef.value.showNotifier(text.toString(), duration)} -->
<template>
    <p :class="[card.init, isShow ? card.show : card.hide]" >
        {{ msg }}
    </p>
</template>
