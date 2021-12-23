import * as React from 'react'

import styled from 'styled-components'

import { Container, Text, Button, Heading } from 'ooni-components'

import { useNavigate } from 'react-router'

const Home = () => {
    const navigate = useNavigate()

    const onStart = () => {
        navigate('/run')
    }

    return (
        <Container>
            <Heading>Welcome to OONI Probe Web</Heading>
            <Text>Ready to start an OONI Probe test? Click start below.</Text>
            <Button mt={3} onClick={onStart}>Start</Button>
        </Container>
    )
}

export default Home