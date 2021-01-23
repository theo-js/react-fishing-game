import React from 'react'
import { connect } from 'react-redux'
import styles from './index.module.sass'

const ResistanceGauge = () => {
    return <div className={styles.resistanceGauge}></div>
}

// Redux connection
const mapStateToProps = state => ({

})
export default connect(
    mapStateToProps,
    dispatch => ({})
)(ResistanceGauge)