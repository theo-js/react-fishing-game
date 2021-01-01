import { FishRodLevel } from '../../../interfaces/evolution'
import { mToPx } from '../../../utils/position'
import styles from './index.module.sass'

export const rodLevels: FishRodLevel[] = [
    {
        _id: 'Starter',
        className: styles.fishrodDefault,
        maxLength: mToPx(10)

    },
    {
        _id: 'Beginner',
        className: styles.fishrodBeginner,
        maxLength: mToPx(15)
    }
]