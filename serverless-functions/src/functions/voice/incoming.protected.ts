// Imports global types
import "@twilio-labs/serverless-runtime-types";
import * as AIAUtil from "../common/aia.helper.private";

// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessEventObject,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

// Type(s)
type RequestContext = {
  AUTH_TOKEN: string;
  ACCOUNT_SID: string;
};

type RequestEvent = {
  aiAssistantSid: string;
  language?: string;
  voiceIntelligenceSid?: string;
};

// Load Libraries
const { sendMessageToAIA, verifyRequest, signRequest } = <typeof AIAUtil>(
  require(Runtime.getFunctions()["common/aia.helper"].path)
);
const voiceLanguagesConfig = JSON.parse(
  Runtime.getAssets()["/voice-languages-config.json"].open()
);

export const handler: ServerlessFunctionSignature<
  RequestContext,
  ServerlessEventObject<RequestEvent>
> = async function (
  context: Context<RequestContext>,
  event: ServerlessEventObject<RequestEvent>,
  callback: ServerlessCallback
) {
  console.log("[voice][incoming] Event Received", event);

  const response = new Twilio.Response();

  // Set the CORS headers to allow Flex to make an error-free HTTP request
  // to this Function
  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
  response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
  response.appendHeader("Content-Type", "text/xml; charset=utf8");

  // Check Required Parameter(s)
  // -- AI Assistant SID: Required for sending message to a specific AI Assistant
  if (!event.aiAssistantSid?.startsWith("aia_asst_")) {
    console.log(
      "[voice][incoming] Invalid AI Assistant SID",
      event.aiAssistantSid
    );
    response.setStatusCode(400);
    response.setBody({ error: "Invalid AI Assistant SID" });
    return callback(null, response);
  }
  try {
    // Step 1: Determine Default Parameters
    // -- AI Assistant SID
    console.log(
      `[voice][incoming] Using AI Assistant SID: ${event.aiAssistantSid}`
    );
    // -- Language Configuration for AI Assistant's Voice Channel
    let selectedLanguage = "default";
    if (event.language) {
      const isSupportedLanguage = Object.keys(voiceLanguagesConfig).includes(
        event.language
      );
      if (isSupportedLanguage) {
        selectedLanguage = event.language;
        console.log(
          `[voice][incoming] Setting AI Assistant language to be: ${selectedLanguage}`
        );
      } else {
        console.log(
          "[voice][incoming] Unsupported Language. Defaulting to en-US with Google's Voice. Please edit the assets/voice-languages-config.private.json file to include your language.",
          event.language
        );
      }
    } else {
      console.log(
        "[voice][incoming] No langage parameter passed. Defaulting language to en-US with Google's Voice"
      );
    }
    const selectedLanguageConfig = voiceLanguagesConfig[selectedLanguage];
    console.log(
      `[voice][incoming] Using the following configuration for ${selectedLanguage}`,
      selectedLanguageConfig
    );

    // Step 2: Generate TwiML for Connecting Voice Channel to AI Assistant
    const twiML = `
        <Response>
            <Connect>
                <Assistant id="${event.aiAssistantSid}" welcomeGreeting="${selectedLanguageConfig.welcomeGreeting}" transcriptionProvider="${selectedLanguageConfig.transcriptionProvider}" transcriptionLanguage="${selectedLanguageConfig.transcriptionLanguage}" ttsProvider="${selectedLanguageConfig.ttsProvider}" ttsLanguage="${selectedLanguageConfig.ttsLanguage}" voice="${selectedLanguageConfig.voice}" >
                </Assistant>
            </Connect>
        </Response>
    `;
    response.setBody(twiML);
    /*
     * Last Step: Return API response
     */
    return callback(null, response);
  } catch (err) {
    console.log("[voice][incoming] Catch Error", err);
    throw Error("[voice][incoming] Catch Error");
  }
};
