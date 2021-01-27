import React, { Fragment } from 'react'
import { rodLevels } from '../evolution'

import StarterArea from './Starter'
import BeginnerArea from './Beginner'
import IntermediateArea from './Intermediate'
import AdvancedArea from './Advanced'
import ExpertArea from './Expert'
import KingArea from './King'
import Abyss from './Abyss'

// Redux
import { connect } from 'react-redux'
import { mapWidthSelector } from '../../../store/selectors/position'

interface Props {
    // Redux
    mapWidth?: number
}

// Manage all lake areas
const FishingAreas: React.FC<Props> = ({ mapWidth }) => {
    return <>
        <StarterArea path={{
            from: {x: 0, y: 200},
            to: {x: mapWidth, y: rodLevels.find(lvl => lvl._id === 'Starter').maxLength}
        }} />
        <BeginnerArea path={{
            from: {x: 0, y: rodLevels.find(lvl => lvl._id === 'Starter').maxLength},
            to: {x: mapWidth, y: rodLevels.find(lvl => lvl._id === 'Beginner').maxLength}
        }} />
        <IntermediateArea path={{
            from: {x: 0, y: rodLevels.find(lvl => lvl._id === 'Beginner').maxLength},
            to: {x: mapWidth, y: rodLevels.find(lvl => lvl._id === 'Intermediate').maxLength}
        }} />
        <AdvancedArea path={{
            from: {x: 0, y: rodLevels.find(lvl => lvl._id === 'Intermediate').maxLength},
            to: {x: mapWidth, y: rodLevels.find(lvl => lvl._id === 'Advanced').maxLength}
        }} />
        <ExpertArea path={{
            from: {x: 0, y: rodLevels.find(lvl => lvl._id === 'Advanced').maxLength},
            to: {x: mapWidth, y: rodLevels.find(lvl => lvl._id === 'Expert').maxLength}
        }} />
        <KingArea path={{
            from: {x: 0, y: rodLevels.find(lvl => lvl._id === 'Expert').maxLength},
            to: {x: mapWidth, y: rodLevels.find(lvl => lvl._id === 'Sea king').maxLength}
        }} />
        <Abyss path={{
            from: {x: 0, y: rodLevels.find(lvl => lvl._id === 'Sea king').maxLength},
            to: {x: mapWidth, y: rodLevels.find(lvl => lvl._id === 'Abyssal').maxLength}
        }} />
    </>
}

// Redux connection

export default React.memo(connect(
    state => ({ mapWidth: mapWidthSelector(state) }),
    dispatch => ({})
)(FishingAreas))