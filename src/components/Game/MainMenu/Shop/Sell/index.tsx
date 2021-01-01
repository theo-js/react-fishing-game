import React, { useState, useMemo } from 'react'
import styles from './index.module.sass'

interface Props {
    setSellerPhrase: React.Dispatch<React.SetStateAction<string>>
}

const Sell: React.FC<Props> = ({ setSellerPhrase }) => {
    return <div className={styles.sell}></div>
}

export default Sell