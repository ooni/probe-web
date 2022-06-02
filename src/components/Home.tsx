import * as React from "react";
import { Controller, useForm } from "react-hook-form";

import {
  Container,
  Text,
  Button,
  Heading,
  Flex,
  Box,
  theme,
} from "ooni-components";
import OONILogo from "./OONILogo";

import { Input, Label } from "@rebass/forms";

import { useNavigate } from "react-router-dom";

const Home = ({onResetInformedConsent}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      uploadResults: true,
      urlLimit: 0,
    },
  });

  const navigate = useNavigate();

  const onStart = (options) => {
    navigate(`/run?options=${btoa(JSON.stringify(options))}`);
  };

  return (
    <Container pt={2}>
      <Heading>Welcome to OONI Probe Web</Heading>
      <Text>Ready to start an OONI Probe test? Click start below.</Text>

      <Heading h={3}>Settings</Heading>
      <Flex flexWrap="wrap">
        <Box width={1 / 2}>
          <Label>Upload results</Label>
          <Controller
            control={control}
            name="uploadResults"
            render={({ field: { onChange, onBlur, value, name } }) => (
              <input
                type="checkbox"
                onChange={onChange}
                onBlur={onBlur}
                name={name}
                checked={value}
              />
            )}
          />
        </Box>
        <Box width={1 / 2}>
          <Label>URL Limit (0 for no limit)</Label>
          <Input defaultValue={0} {...register("urlLimit")} />
        </Box>
        <Box width={1 / 2}>
          <Button hollow onClick={onResetInformedConsent}>
            Reset onboarding
          </Button>
        </Box>
      </Flex>
      <Button mt={3} onClick={handleSubmit(onStart)}>
        Start
      </Button>
    </Container>
  );
};

export default Home;
