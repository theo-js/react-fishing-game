import React, { FC, useRef } from 'react'
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
    const fishGroupID = useRef<string>(uuid())

    return <FishGroup groupID={fishGroupID} path={path} render={groupProps => {
        return (
         /* Pass props to each fish */
        fishes
        .map((fishEntry: FishEntry) => {
            const { amount, props } = fishEntry
            const Fish: any = fishEntry.component
            // Render "amount" times the provided component
            let result = []
            for (let i = 0; i < amount; i++) {
                const fishID = uuid()

                result.push(
                    <Fish
                        key={fishID}
                        _id={fishID}
                        groupID={fishGroupID}
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