export const minsToHrsMins = (mins: number): string => {
    if (typeof mins !== 'number' || mins <= 0) return '00:00'
    mins = Math.round(mins)

    let h: number | string = Math.floor(mins / 60)
    let m: number | string = mins % 60
    h = h < 10 ? '0' + h : h
    m = m < 10 ? '0' + m : m
    return `${h}:${m}`;
}

export const setVariableInterval = (
    callback: () => any,
    getNextInterval: () => number
): (() => void) => {
    let stop: boolean = false
    let timerID: number|null = null

    const repeat = () => {
        if (stop) {
            // Exit repeat function
            window.clearTimeout(timerID)
            timerID = null
            return
        }

        // Do smth
        callback()

        // Recursively call repeat function
        timerID = window.setTimeout(repeat, getNextInterval() || 1000)
    }

    // Initial call
    timerID = window.setTimeout(() => {
        if (!stop) repeat()
    }, getNextInterval() || 1000)

    // Return a function that clears the interval
    return () => stop = true
}