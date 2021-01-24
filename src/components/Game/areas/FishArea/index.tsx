import React, { FC, useRef } from 'react'
import FishGroup from '../FishGroup'
import { randomIntFromInterval } from '../../../../utils/math'
import { Fish } from '../../../../interfaces/fishes'
import { Path } from '../../../../interfaces/position'
import { v4 as uuid } from 'uuid'

interface FishEntryProps {
    size: number[],
    strength: number[],
    [key: string]: any
}

interface FishEntry {
    amount: number,
    component: any,
    fish: Fish,
    props: any
}

interface Props {
    path: Path,
    fishes: FishEntry[],
}

const FishArea: FC<Props> = ({ path, fishes }) => {
    const fishGroupID = useRef<string>(uuid())

    return <FishGroup groupID={fishGroupID.current} path={path} render={groupProps => {
        return (
         /* Pass props to each fish */
        fishes
        .map((fishEntry: FishEntry) => {
            const { amount, fish, props } = fishEntry
            const Fish: any = fishEntry.component
            // Render "amount" times the provided component
            let result = []
            for (let i = 0; i < amount; i++) {
                const fishID = uuid()

                result.push(
                    <Fish
                        key={fishID}
                        fishID={fishID}
                        fish={fish}
                        groupID={fishGroupID.current}
                        {...props}
                        {...groupProps}
                        area={groupProps.path}
                        // Generate random props for a unique fish
                        size={randomIntFromInterval(props.size[0], props.size[1])}
                        strength={randomIntFromInterval(props.strength[0], props.strength[1])}
                     />
                )
            }
            return result
        })
        .flat()
    )}} />
}

export default React.memo(FishArea)