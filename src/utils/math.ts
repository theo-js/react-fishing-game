export const toRad = (deg: number): number => deg*Math.PI/180
export const toDeg = (rad: number): number => rad*180/Math.PI
export const randomIntFromInterval = (min: number, max: number): number => {
    // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}
export const probability = (n: number): boolean => !!n && Math.random() <= n