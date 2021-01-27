import React from 'react'
import FishArea from '../FishArea'
import DefaultFish from '../../../fishes/Default'
import allFishesData from '../../../fishes/fishes.json'
import { Path } from '../../../../interfaces/position'

interface Props {
    path: Path
}

const Abyss: React.FC<Props> = ({ path }) => {
    return <FishArea
    path={path}
    fishes={[
        {
            amount: 5,
            component: DefaultFish,
            fish: allFishesData['Anglerfish'],
            props: {
                ...allFishesData['Anglerfish']
            }
        },
        {
            amount: 4,
            component: DefaultFish,
            fish: allFishesData['Sea monster'],
            props: {
                ...allFishesData['Sea monster']
            }
        },
        {
            // Boss
            amount: 1,
            component: DefaultFish,
            fish: allFishesData['Sea monster'],
            props: {
                ...allFishesData['Sea monster'],
                size: [200, 200],
                strength: [250, 250],
                isBoss: true,
                biteChance: .125,
                look: 'alpha',
                catchTimeLapse: [5000, 500]
            }
        }
    ]}
     />
}

export default React.memo(Abyss)