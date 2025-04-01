import React, { useEffect, useState } from "react";
import { withTaskContext } from "@twilio/flex-ui";

import {
  Callout,
  CalloutProps,
  CalloutHeading,
  CalloutText,
} from "@twilio-paste/core";

interface AIAssistantSummaryProps {
  task: any;
}

const AIAssistantSummary: React.FC<AIAssistantSummaryProps> = (
  props: AIAssistantSummaryProps
) => {
  const [variantStyle, setVariantStyle] =
    useState<CalloutProps["variant"]>("neutral");
  const [conversationSummary, setConversationSummary] = useState<string>("");
  const [isDisplay, setIsDisplay] = useState<boolean>(false);

  useEffect(() => {
    if (
      props.task?.attributes?.conversationSummary &&
      props.task?.attributes?.conversationSummary.length > 0
    ) {
      setConversationSummary(props.task.attributes.conversationSummary);
      setIsDisplay(true);
    } else {
      setIsDisplay(false);
    }
    // Callout Variant Styling
    switch (props.task.attributes.conversationSentiment) {
      case "positive":
        setVariantStyle("success");
        break;
      case "neutral":
        setVariantStyle("neutral");
        break;
      case "negative":
        setVariantStyle("warning");
        break;
      default:
        setVariantStyle("neutral");
    }
  }, [props.task.conversationSummary]);

  return (
    <>
      {isDisplay && (
        <Callout variant={variantStyle}>
          <CalloutHeading as="h2">
            Pre-Agent Summary by AI Assistant
          </CalloutHeading>
          <CalloutText>{conversationSummary}</CalloutText>
        </Callout>
      )}
    </>
  );
};

export default withTaskContext(AIAssistantSummary);
