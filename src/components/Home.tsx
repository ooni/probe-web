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
      <Heading>Welcome to OONI Probe Web</Heading>

      {browserName == "firefox" && <AlertBanner>
        <Text>You appear to be using firefox.
          For accurate measurements, please be sure to <a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop#w_strict-enhanced-tracking-protection">disable strict enhanced tracking protection</a> for this site.
        </Text>
      </AlertBanner>
      }

      <Text>This is an experimental version of OONI Probe which checks for websites blocking by using your web browser.
        Keep in mind that tests run using probe-web cannot be as accurate as those run with
        the <a href="https://ooni.org/install/mobile">OONI Probe mobile</a> or <a href="https://ooni.org/install/desktop">desktop apps</a>.
      </Text>

      <Text>OONI Probe web is not designed to be a replacement for <a href="https://ooni.org/install/">OONI Probe</a> on mobile and desktop platforms.</Text>

      <Heading h={3}>Settings</Heading>
      <Flex flexWrap="wrap">
        <Box width={1 / 2}>
          <Label>URL Limit (0 for no limit)</Label>
          <Input defaultValue={0} {...register("urlLimit")} />
        </Box>
        <Box width={1 / 2} style={{ display: "none" }}>
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
