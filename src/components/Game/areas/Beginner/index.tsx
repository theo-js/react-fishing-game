import React from 'react'
import FishArea from '../FishArea'
import DefaultFish from '../../../fishes/Default'
import { Path } from '../../../../interfaces/position'

interface Props {
    path: Path
}

const BeginnerArea: React.FC<Props> = ({ path }) => {
    return <FishArea
    path={path}
    fishes={[
        {
            amount: 1,
            component: DefaultFish,
            props: {
                size: 50
            }
        },
        {
            amount: 10,
            component: DefaultFish,
            props: {
                size: 10
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