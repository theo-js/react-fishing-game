import { createSelector } from 'reselect'
import { State } from '../reducers/position'
import { Coordinates, Map } from '../../interfaces/position'

export const mapSelector = createSelector(
    (state: any): State => state.position,
    (position: State): Map => position.map
)
export const mapWidthSelector = createSelector(
    mapSelector,
    (map: Map): number => map.width
)
export const baitLakeCoordsSelector = createSelector(
    (state: any): State => state.position,
    (position: State): Coordinates => position.baitLakeCoords
)