export const minsToHrsMins = (mins: number): string => {
    let h: number | string = Math.floor(mins / 60)
    let m: number | string = mins % 60
    h = h < 10 ? '0' + h : h
    m = m < 10 ? '0' + m : m
    return `${h}:${m}`;
}