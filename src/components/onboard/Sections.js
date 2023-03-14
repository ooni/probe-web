import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { FormattedMessage } from "react-intl";
import { MdKeyboardArrowLeft } from "react-icons/md";
/*
 * XXX This component is a bit written a bit hasily. State is stored and encapsulated in the following way:
 *
 * The `Sections` component keeps track of:
 * - What is the current step of the wizard
 * - If the Quiz has been completed and/or if it's shown or hidden

 * The `QuizSteps` component is responsible for the state of:
 * - What is the current step of the quizActive
 *
 * It learns of if it should be shown or hidden from the props passed to it by
 * the Sections component.
 *
 * Using something like flux would have maybe made writing this easier, but this
 * is really the only place in which I felt the need of something like flux.
 */

import { Button, Box, Flex, Heading, Link } from "ooni-components";

import FormattedMarkdown from "../FormattedMarkdown";

import Stepper from "./Stepper";
import QuizSteps from "./QuizSteps";

import onboardURL0 from "../../../public/static/images/onboarding_0.svg";
import onboardURL1 from "../../../public/static/images/onboarding_1.svg";
import onboardURL2 from "../../../public/static/images/onboarding_2.svg";

const HeadsUpList = styled.li`
  margin-top: 20px;
  margin-bottom: 20px;
`;

const TopBar = styled(Box)`
  position: absolute;
  top: 0;
  width: 100%;
  height: 50px;
  background-color: transparent;
  color: ${(props) => props.theme.colors.white};
  /* This makes it possible to drag the window around from the side bar */
  -webkit-app-region: drag;
`;

const OnboardBG = styled(Flex)`
  background: ${(props) => `no-repeat url(${props.img})`};
  background-color: ${(props) => props.bgColor || "#002b54"};
  background-position-y: ${(props) => props.positionY || 0};
  background-size: contain;
  height: 500px;
`;

const SectionThingsToKnow = ({
  onNext,
  quizActive,
  quizComplete,
  toggleQuiz,
  onQuizComplete,
}) => (
  <div>
    {quizActive && !quizComplete && (
      <QuizSteps
        onClose={toggleQuiz}
        onDone={onQuizComplete}
        questionList={[
          <FormattedMessage
            key="Onboarding.PopQuiz.1.Question"
            id="Onboarding.PopQuiz.1.Question"
          />,
          <FormattedMessage
            key="Onboarding.PopQuiz.2.Question"
            id="Onboarding.PopQuiz.2.Question"
          />,
        ]}
        actuallyList={[
          <FormattedMessage
            key="Onboarding.PopQuiz.1.Wrong.Paragraph"
            id="Onboarding.PopQuiz.1.Wrong.Paragraph"
          />,
          <FormattedMessage
            key="Onboarding.PopQuiz.2.Wrong.Paragraph"
            id="Onboarding.PopQuiz.2.Wrong.Paragraph"
          />,
        ]}
      />
    )}

    <Flex flexWrap="wrap" flexDirection="column">
      <Box width={1}>
        <Heading textAlign="center" h={1}>
          <FormattedMessage id="Onboarding.ThingsToKnow.Title" />
        </Heading>
      </Box>
      <Box width={2 / 3} my={0} mx="auto">
        <FormattedMarkdown id="Onboarding.ThingsToKnow.Description" openInNewWindow/>
      </Box>
      <Box mx="auto">
        <Button inverted onClick={quizComplete ? onNext : toggleQuiz}>
          <FormattedMessage id="Onboarding.ThingsToKnow.Button" />
        </Button>
      </Box>
      <Box mt={3} mx="auto">
        <Link color="gray3" href="https://ooni.org/about/risks/" passHref target="blank">
          <FormattedMessage id="Settings.About.Content.LearnMore" />
        </Link>
      </Box>
    </Flex>
  </div>
);

SectionThingsToKnow.propTypes = {
  quizActive: PropTypes.bool,
  quizComplete: PropTypes.bool,
  toggleQuiz: PropTypes.func,
  onQuizComplete: PropTypes.func,
  onNext: PropTypes.func,
};

const SectionWhatIsOONI = ({ onNext }) => (
  <Flex flexWrap="wrap" flexDirection="column">
    <Box width={1} px={4}>
      <Heading h={1} textAlign="center">
        <FormattedMessage id="Onboarding.WhatIsOONIProbe.Title" />
      </Heading>
    </Box>
    <Box width={1 / 2} my={3} px={4} mx="auto">
      <FormattedMarkdown id="Onboarding.WhatIsOONIProbe.Paragraph" openInNewWindow/>
    </Box>
    <Box mx="auto">
      <Button inverted onClick={onNext}>
        <FormattedMessage id="Onboarding.WhatIsOONIProbe.GotIt" />
      </Button>
    </Box>
  </Flex>
);

SectionWhatIsOONI.propTypes = {
  onNext: PropTypes.func,
};

const NoButton = styled(Button)`
  color: white;
  border-color: white;
  &:hover:enabled {
    border-color: ${(props) => props.theme.colors.gray0};
  }
`;


const SectionDefaultSettings = ({ onGo }) => (
  <Flex flexDirection="column">
    <Box>
      <Heading textAlign="center" h={1}>
        <FormattedMessage id="Onboarding.DefaultSettings.Title" />
      </Heading>
    </Box>
    <Box px={4}>
      <Flex>
        <Box width={1 / 2}>
          <Heading h={4}>
            <FormattedMessage id="Onboarding.DefaultSettings.Header" />
          </Heading>
          <ul>
            <li>
              <FormattedMessage id="Onboarding.DefaultSettings.Bullet.1" />
            </li>
            <li>
              <FormattedMessage id="Onboarding.DefaultSettings.Bullet.2" />
            </li>
            <li>
              <FormattedMessage id="Onboarding.DefaultSettings.Bullet.3" />
            </li>
          </ul>
        </Box>
        <Box width={1 / 2} mt={4}>
          <FormattedMarkdown id="Onboarding.DefaultSettings.Paragraph" openInNewWindow/>
        </Box>
      </Flex>
    </Box>
    <Flex alignItems="center" flexDirection="column">
      <Button inverted onClick={onGo} data-test-id="letsgo">
        <FormattedMessage id="Onboarding.DefaultSettings.Button.Go" />
      </Button>
    </Flex>
  </Flex>
);

SectionDefaultSettings.propTypes = {
  onGo: PropTypes.func,
  onChange: PropTypes.func,
};

const BackButtonContainer = styled.div`
  position: absolute;
  left: 10px;
  top: 40px;
  cursor: pointer;
  &:hover {
    color: ${(props) => props.theme.colors.gray4};
  }
`;

const numSteps = 3;

const onboardingBGs = [onboardURL0, onboardURL1, onboardURL2];
const onboardingBGOffsets = [null, "-70px", null]

const Sections = ({ onGo }) => {
  const [activeSection, setActiveSection] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [crashReportsOptIn, setOptIn] = useState(false);

  const toggleQuiz = useCallback(() => {
    setQuizActive((quizActive) => !quizActive);
  }, [setQuizActive]);

  const onQuizComplete = useCallback(() => {
    setQuizComplete(true);
    setActiveSection((activeIdx) => activeIdx + 1);
  }, [setQuizComplete, setActiveSection]);

  const nextStep = useCallback(() => {
    if (activeSection >= numSteps) {
      return;
    }

    setActiveSection(activeSection + 1);
  }, [activeSection, setActiveSection]);

  const prevStep = useCallback(() => {
    if (activeSection <= 0) {
      return;
    }

    setActiveSection(activeSection - 1);
  }, [activeSection, setActiveSection]);

  return (
    <OnboardBG
      img={onboardingBGs[activeSection]}
      positionY={onboardingBGOffsets[activeSection]}
      // last onboarding screen needs a darker background
      bgColor={activeSection === 3 ? "#001a33" : "#002b54"}
      flexDirection="column"
      justifyContent="flex-end"
      flex="0 1"
    >
      <TopBar />
      <Flex flexWrap="wrap" justifyContent="center" alignItems="center">
        <Box width={1}>
          {activeSection === 0 && <SectionWhatIsOONI onNext={nextStep} />}

          {activeSection === 1 && (
            <SectionThingsToKnow
              onQuizComplete={onQuizComplete}
              quizComplete={quizComplete}
              quizActive={quizActive}
              toggleQuiz={toggleQuiz}
              onPrevious={prevStep}
              onNext={nextStep}
            />
          )}
          {activeSection === 2 && (
            <SectionDefaultSettings onGo={() => onGo(crashReportsOptIn)} />
          )}
        </Box>

        <Box width={1}>
          {activeSection !== 0 && (
            <BackButtonContainer onClick={prevStep}>
              <Flex>
                <Box>
                  <MdKeyboardArrowLeft size={20} />
                </Box>
                <Box>
                  <FormattedMessage id="Onboarding.PopQuiz.Wrong.Button.Back" />
                </Box>
              </Flex>
            </BackButtonContainer>
          )}
        </Box>

        <Box width={1} my={4}>
          <Stepper activeIdx={activeSection} />
        </Box>
      </Flex>
    </OnboardBG>
  );
};

Sections.propTypes = {
  onGo: PropTypes.func,
};

export default Sections;
