import * as React from "react";
import { Controller, useForm } from "react-hook-form";

import styled from "styled-components"

import {
  Container,
  Text,
  Button,
  Heading,
  Flex,
  Box
} from "ooni-components";

import { getBrowserName } from "./utils";

import { Input, Label } from "@rebass/forms";

import { useNavigate } from "react-router-dom";

import FormattedMarkdown from './FormattedMarkdown'
import { FormattedMessage } from "react-intl";

const AlertBanner = styled.div`
padding: 8px 16px;
border-radius: 4px;
margin-top: 8px;
margin-bottom: 8px;
border: 1px solid transparent;
background-color: ${(props) => props.theme.colors.yellow2};
`

const Home = ({ onResetInformedConsent }) => {
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

  const browserName = getBrowserName();

  const navigate = useNavigate();

  const onStart = (options) => {
    navigate(`/run?options=${btoa(JSON.stringify(options))}`);
  };

  return (
    <Container pt={2}>
      <Heading>
          <FormattedMessage id="Home.Title" />
      </Heading>

      {browserName == "firefox" && <AlertBanner>
        <Text>
          <FormattedMarkdown id="Home.FirefoxWarning" />
        </Text>
      </AlertBanner>
      }

      <Text>
      <FormattedMarkdown id="Home.MainDescription" />
     </Text>

      <Heading h={3}>
        <FormattedMarkdown id="Settings.Title" />
      </Heading>
      <Flex flexWrap="wrap">
        <Box width={1 / 2}>
          <Label>
            <FormattedMessage id="Settings.URLLimit" />
          </Label>
          <Input defaultValue={0} {...register("urlLimit")} />
        </Box>
        <Box width={1 / 2} style={{ display: "none" }}>
          <Button hollow onClick={onResetInformedConsent}>
            Reset onboarding
          </Button>
        </Box>
      </Flex>
      <Button mt={3} onClick={handleSubmit(onStart)}>
        Run
      </Button>
    </Container>
  );
};

export default Home;
