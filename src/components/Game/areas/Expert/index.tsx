import React from 'react'
import FishArea from '../FishArea'
import DefaultFish from '../../../fishes/Default'
import allFishesData from '../../../fishes/fishes.json'
import { Path } from '../../../../interfaces/position'

interface Props {
    path: Path
}

const ExpertArea: React.FC<Props> = ({ path }) => {
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
            fish: allFishesData['Clown fish'],
            props: {
                ...allFishesData['Clown fish']
            }
        },
        {
            // Boss
            amount: 1,
            component: DefaultFish,
            fish: allFishesData['Angelfish'],
            props: {
                ...allFishesData['Angelfish'],
                size: [80, 80],
                strength: [90, 90],
                isBoss: true,
                biteChance: .33,
                look: 'alpha',
                catchTimeLapse: [250, 1500]
            }
        }
    ]}
     />
}

export default React.memo(ExpertArea)