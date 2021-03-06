import React from 'react'
import FishArea from '../FishArea'
import DefaultFish from '../../../fishes/Default'
import allFishesData from '../../../fishes/fishes.json'
import { Path } from '../../../../interfaces/position'

interface Props {
    path: Path
}

const BeginnerArea: React.FC<Props> = ({ path }) => {
    return <FishArea
    path={path}
    fishes={[
        {
            amount: 4,
            component: DefaultFish,
            fish: allFishesData['Anchovy'],
            props: {
                ...allFishesData['Anchovy']
            }
        },
        {
            amount: 5,
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
            fish: allFishesData['Clown fish'],
            props: {
                ...allFishesData['Clown fish'],
                size: [50, 50],
                strength: [60, 60],
                isBoss: true,
                biteChance: .33,
                look: 'alpha',
                catchTimeLapse: [750, 1250]
            }
        }
    ]}
     />
}

export default React.memo(BeginnerArea)