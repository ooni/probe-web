import React from 'react'
import styled from 'styled-components'
import Sections from './onboard/Sections'

const SectionContainer = styled.div`
  color: ${props => props.theme.colors.white};
`

const Onboard = () => {
    return (
        <SectionContainer>
            <Sections />
        </SectionContainer>
    )
}

export default Onboard