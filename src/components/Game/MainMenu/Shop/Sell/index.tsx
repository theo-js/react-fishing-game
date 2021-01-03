import React, { useState, useMemo, useEffect } from 'react'
import { ContentID } from '../index'
import styles from './index.module.sass'

interface Props {
    setSellerPhrase: React.Dispatch<React.SetStateAction<string>>,
    setCurrentContentID: React.Dispatch<React.SetStateAction<ContentID>>
}

const Sell: React.FC<Props> = ({ setSellerPhrase, setCurrentContentID }) => {


    return <div className={styles.sell}></div>
}

export default Sell