import React, { ReactNode, FC, useMemo } from 'react'
import FishGroup from '../FishGroup'
import { Path } from '../../../../interfaces/position'
import { v4 as uuid } from 'uuid'

interface FishEntry {
    amount: number,
    component: any,
    props: any
}

interface Props {
    path: Path,
    fishes: FishEntry[],
}

const FishArea: FC<Props> = ({ path, fishes }) => {
    return <FishGroup path={path} render={groupProps => {
        return (
         /* Pass props to each fish */
        fishes
        .map((fishEntry: FishEntry) => {
            const { amount, props } = fishEntry
            const Fish: any = fishEntry.component
            // Render "amount" times the provided component
            let result = []
            for (let i = 0; i < amount; i++) {
                result.push(
                    <Fish
                        key={uuid()}
                        {...props}
                        {...groupProps}
                        area={groupProps.path}
                     />
                )
            }
            return result
        })
        .flat()
    )}} />
}

export default React.memo(FishArea)