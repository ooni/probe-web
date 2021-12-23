import * as React from 'react'
import styled from 'styled-components'
import Sections from './onboard/Sections'

import { useNavigate } from 'react-router'

const SectionContainer = styled.div`
  color: ${props => props.theme.colors.white};
`

const Onboard = () => {
    const navigate = useNavigate()

    const onGo = (crashReporting : boolean) => {
        if (crashReporting === true) {
            window.localStorage.setItem('crashReporting', 'yes');
        } else {
            window.localStorage.setItem('crashReporting', 'no');
        }
        window.localStorage.setItem('informedConsent', 'yes');
        navigate('/')
    }

    return (
        <SectionContainer>
            <Sections onGo={onGo} />
        </SectionContainer>
    )
}

export default Onboard