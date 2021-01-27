import React from 'react'
import FishArea from '../FishArea'
import DefaultFish from '../../../fishes/Default'
import allFishesData from '../../../fishes/fishes.json'
import { Path } from '../../../../interfaces/position'

interface Props {
    path: Path
}

const StarterArea: React.FC<Props> = ({ path }) => {
    return <FishArea
    path={path}
    fishes={[
        {
            amount: 5,
            component: DefaultFish,
            fish: allFishesData['Anchovy'],
            props: {
                ...allFishesData['Anchovy']
            }
        },
        {
            amount: 4,
            component: DefaultFish,
            fish: allFishesData['Sardine'],
            props: {
                ...allFishesData['Sardine']
            }
        },
        {
            // Boss
            amount: 1,
            component: DefaultFish,
            fish: allFishesData['Sardine'],
            props: {
                ...allFishesData['Sardine'],
                size: [30, 30],
                strength: [35, 35],
                isBoss: true,
                biteChance: .33,
                look: 'alpha',
                catchTimeLapse: [500, 1500]
            }
        }
    ]}
     />
}

export default React.memo(StarterArea)