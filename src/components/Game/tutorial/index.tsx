import { FC, Dispatch, SetStateAction, memo, Component, lazy, Suspense, ReactNode } from 'react'
import { TutorialEntry } from '../../../interfaces/game'
import { WaveSpinnerLoading } from '../../misc/Spinners/Wave'
import modalStyles from './styles/modal.module.sass'
// Redux
import { useSelector, useDispatch } from 'react-redux'
import { tutorialEntrySelectors } from '../../../store/selectors/game'
import { completeTutorialEntryAction } from '../../../store/actions/game'


/*
    Base tutorial component:
    - renders a view and marks this tutorial entry as completed when finished
    - passes common styles to all tutorial entries
*/
export interface EntryProps {
    onComplete: Dispatch<SetStateAction<TutorialEntry>>,
    modalStyles: any
}

export interface TutorialProps {
    entry: TutorialEntry,
    render: (renderOptions: EntryProps) => any,
    afterComplete?: () => any // Do smth after tutorial entry has been completed
}

const Tutorial: FC<TutorialProps> = ({ 
    entry, 
    render, 
    afterComplete 
}) => {
    const dispatch = useDispatch()
    const onComplete = () => {
        dispatch(completeTutorialEntryAction(entry))
        afterComplete && afterComplete()
    }

    return render({ onComplete, modalStyles })
}


/* 
    LoadTutorial component: checks if tutorial entry is already completed;
    if not, lazy loads and renders tutorial component 
*/
interface LoadTutorialProps {
    entry: TutorialEntry,
    dependencies?: TutorialEntry[],
    fallback?: ReactNode, // Component to display while Tutorial is loading. Defaults to spinner
    onLoad?: () => any, // Do smth when tutorial has been loaded
    afterComplete?: () => any // Do smth after tutorial entry has been completed
}
export const LoadTutorial: FC<LoadTutorialProps> = memo(({ entry, dependencies = [], fallback, onLoad, afterComplete }) => {
    const isCompleted: boolean = useSelector(tutorialEntrySelectors[entry])
    const depCompletionState: Array<boolean|undefined> = useSelector(
        state => dependencies.map((dep: TutorialEntry): (boolean|undefined) => state.game.tutorial[dep])
    )
    
    // Check if target entry is completed already
    if (isCompleted || typeof isCompleted === 'undefined') return null

    // Check if all dependency entries are completed
    const isAnyDepMissing = depCompletionState.some((state: (boolean|undefined)) => state !== true)
    if (isAnyDepMissing) return null

    // Tutorial entry is not completed yet: load tutorial component
    const Tuto = lazy(() => {
        const promise = import(`./${entry}`)
        promise.then(() => onLoad && onLoad()) // Do smth
        return promise
    })

    return <LoadTutorialErrBoundary>
        <Suspense fallback={typeof fallback === 'undefined' ? <WaveSpinnerLoading /> : fallback}>
            <Tuto afterComplete={afterComplete} />
        </Suspense>
    </LoadTutorialErrBoundary>
})

class LoadTutorialErrBoundary extends Component {
    constructor (props) {
        super(props)
    }
    state = { hasError: false }
    componentDidCatch () {
        this.state.hasError = true
    }
    render () {
        if (this.state.hasError) return null
        return this.props.children
    }
}


export default Tutorial