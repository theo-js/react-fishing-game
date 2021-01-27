import React from 'react'
import FishArea from '../FishArea'
import DefaultFish from '../../../fishes/Default'
import allFishesData from '../../../fishes/fishes.json'
import { Path } from '../../../../interfaces/position'

interface Props {
    path: Path
}

const KingArea: React.FC<Props> = ({ path }) => {
    return <FishArea
    path={path}
    fishes={[
        {
            amount: 5,
            component: DefaultFish,
            fish: allFishesData['Angelfish'],
            props: {
                ...allFishesData['Angelfish']
            }
        },
        {
            amount: 4,
            component: DefaultFish,
            fish: allFishesData['Anglerfish'],
            props: {
                ...allFishesData['Anglerfish']
            }
        },
        {
            // Boss
            amount: 1,
            component: DefaultFish,
            fish: allFishesData['Anglerfish'],
            props: {
                ...allFishesData['Anglerfish'],
                size: [100, 100],
                strength: [110, 110],
                isBoss: true,
                biteChance: .33,
                look: 'alpha',
                catchTimeLapse: [2000, 500]
            }
        }
    ]}
     />
}

export default React.memo(KingArea)