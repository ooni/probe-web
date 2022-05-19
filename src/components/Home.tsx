import * as React from 'react'
import { Controller, useForm } from "react-hook-form"

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
    const { register, handleSubmit, control, formState: { errors } } = useForm({
        defaultValues: {
            uploadResults: true,
            urlLimit: 0,
        }
    });

    const navigate = useNavigate()

    const onStart = (options) => {
        navigate(`/run?options=${btoa(JSON.stringify(options))}`)
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
                    <Controller
                        control={control}
                        name="uploadResults"
                        render={({field: {onChange, onBlur, value, name}}) => (
                            <input type="checkbox" onChange={onChange} onBlur={onBlur} name={name} checked={value} />
                        )
                    } />
                </Box>
                <Box width={1/2}>
                    <Label>
                        URL Limit (0 for no limit)
                    </Label>
                    <Input defaultValue={0} {...register("urlLimit")} />
                </Box>
            </Flex>
            <Button mt={3} onClick={handleSubmit(onStart)}>Start</Button>
        </Container>
    )
}

export default Home