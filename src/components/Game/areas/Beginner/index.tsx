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
        }/*,
        {
            amount: 3,
            component: DefaultFish,
            props: {
                size: 20
            }
        },
        {
            amount: 1,
            component: DefaultFish,
            props: {
                size: 50
            }
        }*/
    ]}
     />
}

export default React.memo(BeginnerArea)