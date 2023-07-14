<script setup>
    const msg = ref('message board init')
    const isShow = ref(false)
    defineExpose({ showMessageBoard })

    const card = {
        init: ['fixed z-10 mt-3 w-11/12 p-3 left-1/2 -translate-x-1/2 text-center bg-orange-300 rounded-xl text-xl tracking-wider text-[var(--vt-c-indigo)] transition-all duration-700'],
        show: ['opacity-100 top-0'],
        hide: ['opacity-0 -top-full'],
    }
    function showMessageBoard(text) {
        msg.value = text
        isShow.value = true
        setTimeout(()=> isShow.value = false, 4500)
    }
</script>
<!-- code at parent side -->
<!-- const exposeMessageBoardRef = ref(null) -->
<!-- setTimeout(() => { displayMessageBoard('Welcome 🎵') }, 500); -->
<!-- function displayMessageBoard(text) { exposeMessageBoardRef.value.showMessageBoard(text.toString())} -->
<template>
    <p :class="[card.init, isShow ? card.show : card.hide]" >
        {{ msg }}
    </p>
</template>
