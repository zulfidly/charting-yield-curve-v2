export const useMainStorePinia = defineStore('appStore', {
    state: ()=> ({
        tableData: [],
        chartData: [],
        selectedYear: [],
        isChartShowing: false,
        isFetching: false,
        isDataContinuityOK: true,
        userScr: {
            W: 0,
            H: 0,
            isDark: false,
            ratioWH: undefined,
            orientation: undefined,
            formFactor: undefined,
            isMobileLandscape: undefined,        
        },
    }),
    getters: {      // does not mutate original state
        // consider transfer isMobileLandscape here
        // isDark can be here ?
    },
    actions: {      // will mutate original state
        updateIsFetching(bool) { this.isFetching = bool },
        updateSelectedYear(years) { this.selectedYear = years },
        toggleIsChartShowing(bool) { this.isChartShowing = bool },
        m_userScrW() { this.userScr.W = window.innerWidth },
        m_userScrH() { this.userScr.H = window.innerHeight },
        m_userScrFormFactor() { this.userScr.formFactor = getUserDeviceFormFactor() },
        m_userScrIsMobileLandscape() { this.userScr.isMobileLandscape = getIsMobileLandscapeStatus() },
        m_userScrOrientation() { this.userScr.orientation = window.screen.orientation.type },
        m_userScrRatioWH() { this.userScr.ratioWH = (window.screen.width / window.screen.height).toFixed(2) * 1 },
        m_listenIsDark() { listenIsDark() },
        buildTableData(data) {  this.tableData = data },
        buildChartData() {
            let arr = this.tableData
            let temp = [['Month', '10yr−2yr', '10yr−3mth']]
            arr.forEach((obj, ind)=> {
                let TenyrTwoyr = (obj['10yr']-obj['2yr']).toFixed(3) * 1
                let TenyrThreemth = (obj['10yr']-obj['3mth']).toFixed(3) * 1
                let ddmmyyyy = Intl.DateTimeFormat('en-GB').format(new Date(obj.date)) 
                if(typeof TenyrTwoyr === 'number' && typeof TenyrThreemth === 'number') {
                    if(isNaN(TenyrTwoyr) || isNaN(TenyrThreemth)) return
                    else temp.push([ddmmyyyy, TenyrTwoyr, TenyrThreemth])
                } else return
            })
            this.chartData = temp
        },
    }
})

    function getUserDeviceFormFactor() {
        let orientation = window.screen.orientation.type
        if(
            orientation==='portrait-primary' || 
            orientation==='portrait-secondary'
        ) {
            let ratio = window.screen.width / window.screen.height
            if(window.screen.height < 1024) {     // entering hand-held devices
                if      (ratio < 0.5) return 'Smartphone'
                else if (0.5 <= ratio && ratio < 1) return 'Tablet'
                else return 'unknown form factor 1'
            }
            else {    // if height > 1024px in portrait i.e: vertical LED screen
                return 'Desktop|Laptop'
            }
        }
        else if(
            orientation==='landscape-primary' || 
            orientation==='landscape-secondary'
        ) {
            if(window.screen.width < 1024) {
                let ratio = window.screen.height / window.screen.width
                if      (ratio < 0.5) return 'Smartphone'
                else if (0.5 <= ratio && ratio < 1) return 'Tablet'
                else return 'unknown form factor 2'
            }
            else {    // if width > 1024px in landscape i.e: laptops or normal horizontal desktop screens 
                return 'Desktop|Laptop'
            }
        }
        else return 'unknown form factor 3'
    }

    function getIsMobileLandscapeStatus() {
        let orientation = window.screen.orientation.type
        let formFactor = getUserDeviceFormFactor()
        if(
            (formFactor === 'Smartphone' || formFactor === 'Tablet') && 
            (orientation === 'landscape-primary'|| orientation === 'landscape-secondary')
        ) return true
        else return false
    }
    function listenIsDark() {
        useEventListener(window.matchMedia("(prefers-color-scheme:dark)"), 'change', ()=>{      // if dark mode is true
            // if() {
            let isDark = window.matchMedia("(prefers-color-scheme:dark)").matches
            if(isDark) {
                return true
            } else {
                return false
            }
                console.log(window.matchMedia("(prefers-color-scheme:dark)").matches);
            //   document.querySelector('html').classList.toggle('dark')
            // } else return
          })
    }
  