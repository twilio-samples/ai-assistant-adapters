# Twilio Flex - AI Assistant Summary Plugin

This Twilio Flex Plugin enhances the Flex UI by displaying the conversation summary and sentiment analysis provided by Twilio AI Assistant. The plugin extracts the `conversationSummary` and `conversationSentiment` attributes from the Task attributes and renders them in the agent's interface.

<p align="center">
    <img src="./docs/plugin-aia-summary-hero.png" alt="Flex Plugin - AIA Summary" />
</p>

<p align="center">
    <img src="./docs/plugin-aia-summary-hero-2.png" alt="Flex Plugin - AIA Summary" />
</p>

## Prerequisites

Before deploying the plugin, ensure you have:

1. Twilio Flex Account ([Guide](https://support.twilio.com/hc/en-us/articles/360020442333-Setup-a-Twilio-Flex-Account))
2. Node.js v18.x.x only ([Guide](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm))
3. Twilio CLI v5.22.9 or above ([Guide](https://www.twilio.com/docs/twilio-cli/quickstart))
4. Twilio CLI Flex Plugin v7.1.0 or above ([Guide](https://www.twilio.com/docs/flex/developer/plugins/cli/install))

## Setup

1. On your computer, open up your preferred terminal and perform the following

```bash
# Clone Project
git clone https://github.com/leroychan/twilio-aia-adapters.git

# Change Directory
cd twilio-aia-adapters
cd plugin-aia-summary

# Install Dependencies
npm install

# Optional - Local Development
twilio flex:plugins:start

# Deploy to Twilio Flex Instance
# Before you deploy, ensure that `twilio profiles:list` has an active Flex account set.
twilio flex:plugins:deploy --changelog "Deploy AI Assistant Summary Plugin"
twilio flex:plugins:release --plugin plugin-aia-summary@0.0.1 --name "Deploy AIA Plugin" --description "Displays AI Assistant's Conversation Summary and Conversation Sentiment"
```
