import { Dispatch, FC, SetStateAction, ReactNode, useState, useEffect, useRef, useMemo, useCallback } from 'react'
import styles from './index.module.sass'

interface Props {
    render: (page: number, setPage: Dispatch<SetStateAction<number>>) => ReactNode,
    transition?: number,
    initialPage?: number,
    firstPage?: number,
    lastPage: number,
    vertical?: boolean,
    useKeyboard?: boolean,
    useTouch?: boolean,
    swipeDistance?: number // number of px that user needs to swipe in order to activate page change
}

type TouchNavigation = {
    handleTouchStart: (event) => void,
    handleTouchMove: (event) => void,
    handleTouchEnd: (event) => void
}

const Slider: FC<Props> = ({ 
    render, 
    transition = .3,
    initialPage = 0,
    firstPage = 0,
    lastPage,
    vertical = false,
    useKeyboard = false,
    useTouch = true,
    swipeDistance = 30
}) => {
    const [page, setPage] = useState<number>(initialPage)

    const goToPreviousPage = useCallback(
        (): void => {
            if (page - 1 >= firstPage) setPage(page - 1)
        }, [page, firstPage, setPage]
    )
    const goToNextPage = useCallback(
        (): void => {
            if (page + 1 <= lastPage) setPage(page + 1)
        }, [page, lastPage, setPage]
    )

    // Enable keyboard page navigation
    useEffect(() => {
        if (useKeyboard) {
            const handleKey = (e: KeyboardEvent): void => {
                e.stopPropagation()
                switch (e.key) {
                    case 'ArrowLeft':
                    case 'Backspace':
                    case '0':
                    case 'Delete':
                        // Previous page
                        e.preventDefault()
                        goToPreviousPage()
                        break
                    case 'ArrowRight':
                    case ' ':
                        // Next page
                        e.preventDefault()
                        goToNextPage()
                        break
                    default: return
                }
            }
            window.addEventListener('keyup', handleKey, false)
            return () => window.removeEventListener('keyup', handleKey, false)
        }
    }, [
        useKeyboard, 
        page, 
        firstPage, 
        lastPage,
        goToPreviousPage,
        goToNextPage
    ])

    // Touch navigation
    const lastTouchStart = useRef<number|null>(null)
    const touchNavigation = useMemo((): TouchNavigation => (!useTouch ? null : ({
        // Get touchstart position
        handleTouchStart: (e): void => {
            lastTouchStart.current = (vertical ? e.touches[0].clientY : e.touches[0].clientX) || null
            return
        },
        // Swipe
        handleTouchMove: (e): void => {
            const touchPosition = (vertical ? e.touches[0].clientY : e.touches[0].clientX) || null
            if (touchPosition === null || lastTouchStart.current === null) return

            // Compare touchstart position with current position
            if ( touchPosition > (lastTouchStart.current + swipeDistance) ) {
                goToPreviousPage()
            } else if ( touchPosition < (lastTouchStart.current - swipeDistance) ) {
                goToNextPage();
            } else return

            // If the page was changed, must emit a new touchstart event to change the page again
            lastTouchStart.current = null 
        },
        // Reset touchstart position
        handleTouchEnd: (e): void => {
            lastTouchStart.current = null
        }
    })), [
        vertical, 
        swipeDistance,
        goToPreviousPage,
        goToNextPage
    ])

    return <div className={styles.sliderWrapper}>
        <div
            className={styles.slider}
            style={{
                transform: `translate${vertical ? 'Y' : 'X'}(-${page*100}%)`,
                transition: `ease-out transform ${transition}s`
            }}
            onTouchStart={useTouch ? touchNavigation.handleTouchStart : undefined}
            onTouchMove={useTouch ? touchNavigation.handleTouchMove : undefined}
            onTouchEnd={useTouch ? touchNavigation.handleTouchEnd : undefined}
        >
            {render(page, setPage)}
        </div>
    </div>
}

export default Slider