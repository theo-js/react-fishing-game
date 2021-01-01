import React, { ReactNode, useState, useCallback, useImperativeHandle, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import styles from './index.module.sass'

interface Props {
    onClose: any,
    className?: string,
    style?: any,
    transition?: number,
    children?: ReactNode
}

const Modal = React.forwardRef<any, Props>(({
    onClose,
    transition = .3,
    className = '',
    style = {},
    children
}, ref) => {
    const [isClosing, setIsClosing] = useState<boolean>(false)
    const closeModal = useCallback(
        (): void => {
            setIsClosing(true)
            timerID.current = window.setTimeout(() => {
                onClose()
            }, transition*1000)
        }, [onClose]
    )
    const timerID = useRef<number>(null)
    useEffect(() => () => window.clearTimeout(timerID.current), [])
    useImperativeHandle(ref, () => ({ closeModal }), [closeModal])

    return ReactDOM.createPortal(
        (
            <div
                className={`${styles.modalWrapper} ${isClosing ? styles.closing : ''}`}
                onClick={closeModal}
                style={{ transition: `all ease ${transition}s`, animationDuration: `${transition}s` }}
            >
                <div className={`${styles.modalWindow} ${className}`} style={style} onClick={e => e.stopPropagation()}>
                    {children}
                </div>
            </div>
        ), document.getElementById('portal')
    )
})

Modal.defaultProps = {
    children: null,
    style: null,
    className: '',
    onClose: () => false
}

export default Modal