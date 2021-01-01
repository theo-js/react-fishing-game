import { createSelector } from 'reselect'

export const mapSelector = state => state.position.map
export const baitLakeCoordsSelector = createSelector(
    (state: any) => state,
    (state: any) => state.position.baitLakeCoords
)