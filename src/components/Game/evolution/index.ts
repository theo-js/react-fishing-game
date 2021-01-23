import { FishRodLevel } from '../../../interfaces/evolution'
import { mToPx } from '../../../utils/position'
import styles from './index.module.sass'

export const rodLevels: FishRodLevel[] = [
    {
        _id: 'Starter',
        className: styles.fishrodDefault,
        maxLength: mToPx(10),
        resistance: 1000,
        strength: .25

    },
    {
        _id: 'Beginner',
        className: styles.fishrodBeginner,
        maxLength: mToPx(15),
        resistance: 1250,
        strength: .3
    },
    {
        _id: 'Intermediate',
        className: styles.fishrodIntermediate,
        maxLength: mToPx(20),
        resistance: 2000,
        strength: .5
    },
    {
        _id: 'Advanced',
        className: styles.fishrodAdvanced,
        maxLength: mToPx(25),
        resistance: 3500,
        strength: .6
    },
    {
        _id: 'Expert',
        className: styles.fishrodExpert,
        maxLength: mToPx(30),
        resistance: 7000,
        strength: .75
    },
    {
        _id: 'Sea king',
        className: styles.fishrodSeaKing,
        maxLength: mToPx(35),
        resistance: 15000,
        strength: .9
    },
    {
        _id: 'Abyssal',
        className: styles.fishrodAbyssal,
        maxLength: mToPx(70),
        resistance: 40000,
        strength: .99
    },
    {
        _id: 'Legendary',
        className: styles.fishrodLegendary,
        maxLength: mToPx(99),
        resistance: 100000,
        strength: 1
    }
]