import React from 'react'
import FishArea from '../FishArea'
import DefaultFish from '../../../fishes/Default'
import allFishesData from '../../../fishes/fishes.json'
import { Path } from '../../../../interfaces/position'

interface Props {
    path: Path
}

const IntermediateArea: React.FC<Props> = ({ path }) => {
    return <FishArea
    path={path}
    fishes={[
        {
            amount: 5,
            component: DefaultFish,
            fish: allFishesData['Clown fish'],
            props: {
                ...allFishesData['Clown fish']
            }
        },
        {
            amount: 4,
            component: DefaultFish,
            fish: allFishesData['Angelfish'],
            props: {
                ...allFishesData['Angelfish']
            }
        },
        {
            // Boss
            amount: 1,
            component: DefaultFish,
            fish: allFishesData['Angelfish'],
            props: {
                ...allFishesData['Angelfish'],
                size: [70, 70],
                strength: [80, 80],
                isBoss: true,
                biteChance: .25,
                look: 'alpha',
                catchTimeLapse: [875, 1000]
            }
        }
    ]}
     />
}

export default React.memo(IntermediateArea)