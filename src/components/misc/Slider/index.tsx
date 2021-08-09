import { Dispatch, FC, SetStateAction, ReactNode, useState, useEffect } from 'react'
import styles from './index.module.sass'

interface Props {
    render: (page: number, setPage: Dispatch<SetStateAction<number>>) => ReactNode,
    transition?: number,
    initialPage?: number,
    firstPage?: number,
    lastPage: number,
    vertical?: boolean,
    useKeyboard?: boolean
}

const Slider: FC<Props> = ({ 
    render, 
    transition = .3,
    initialPage = 0,
    firstPage = 0,
    lastPage,
    vertical = false,
    useKeyboard = false
}) => {
    const [page, setPage] = useState<number>(initialPage)

    // Enable going back to previous page with keyboard
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
                        if (page - 1 >= firstPage) setPage(page - 1)
                        break
                    case 'ArrowRight':
                    case ' ':
                        // Next page
                        e.preventDefault()
                        if (page + 1 <= lastPage) setPage(page + 1)
                        break
                    default: return
                }
            }
            window.addEventListener('keyup', handleKey, false)
            return () => window.removeEventListener('keyup', handleKey, false)
        }
    }, [useKeyboard, page, firstPage, lastPage])

    return <div className={styles.sliderWrapper}>
        <div
            className={styles.slider}
            style={{
                transform: `translate${vertical ? 'Y' : 'X'}(-${page*100}%)`,
                transition: `ease-out transform ${transition}s`
            }}
        >
            {render(page, setPage)}
        </div>
    </div>
}

export default Slider