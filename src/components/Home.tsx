import * as React from 'react'
import { useState } from 'react'

import styled from 'styled-components'

import { 
    Container, Text, Button, Heading,
    Flex, Box
} from 'ooni-components'

import {
    Checkbox,
    Input,
    Label
} from '@rebass/forms'

import { useNavigate } from 'react-router'

const Home = () => {
    const [ uploadResults, setUploadResults ] = useState(true)
    const [ urlLimit, setUrlLimit ] = useState(0)

    const runOptions = {
        urlLimit,
        uploadResults
    }

    const navigate = useNavigate()

    const onStart = () => {
        const options = btoa(JSON.stringify(runOptions))
        navigate(`/run?options=${options}`)
    }

    return (
        <Container>
            <Heading>Welcome to OONI Probe Web</Heading>
            <Text>Ready to start an OONI Probe test? Click start below.</Text>

            <Heading h={3}>Settings</Heading>
            <Flex>
                <Box width={1/2}>
                    <Label>
                        Upload results
                    </Label>
                    <Checkbox onChange={() => setUploadResults(!uploadResults)} checked={uploadResults} />
                </Box>
                <Box width={1/2}>
                    <Label>
                        URL Limit (0 for no limit)
                    </Label>
                    <Input type='number' onChange={(v) => setUrlLimit(Number(v.target.value))} value={urlLimit} />
                </Box>
            </Flex>
            <Button mt={3} onClick={onStart}>Start</Button>
        </Container>
    )
}

export default Home