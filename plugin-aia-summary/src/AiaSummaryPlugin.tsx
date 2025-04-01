import React from "react";
import * as Flex from "@twilio/flex-ui";
import { FlexPlugin } from "@twilio/flex-plugin";
import { CustomizationProvider } from "@twilio-paste/core/customization";
import AIAssistantSummary from "./components/AIAssistantSummary/AIAssistantSummary";

const PLUGIN_NAME = "AiaSummaryPlugin";

export default class AiaSummaryPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof Flex }
   */
  async init(flex: typeof Flex, manager: Flex.Manager): Promise<void> {
    const options: Flex.ContentFragmentProps = { sortOrder: -1 };

    // Use Twilio Paste
    flex.setProviders({
      PasteThemeProvider: CustomizationProvider,
    });

    // AI Assistant Summary
    flex.TaskCanvas.Content.add(
      <AIAssistantSummary key="AIAssistantVoiceSummary" />,
      options
    );
  }
}
