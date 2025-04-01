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
  TWILIO_AIA_IS_TYPING: string;
};

type RequestEvent = {
  aiAssistantIsTyping?: boolean;
  _token: string;
  Body: string;
  Status: string;
};

type JWTPayload = {
  serviceSid: string;
  conversationSid: string;
  author: string;
};

// Load Libraries
const { verifyRequest } = <typeof AIAUtil>(
  require(Runtime.getFunctions()["common/aia.helper"].path)
);

export const handler: ServerlessFunctionSignature<
  RequestContext,
  ServerlessEventObject<RequestEvent>
> = async function (
  context: Context<RequestContext>,
  event: ServerlessEventObject<RequestEvent>,
  callback: ServerlessCallback
) {
  console.log("[conversations][response] Event Received", event);

  const response = new Twilio.Response();

  // Set the CORS headers to allow Flex to make an error-free HTTP request
  // to this Function
  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
  response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
  response.appendHeader("Content-Type", "application/json");

  // Check Required Parameter(s)
  // -- Auth Token: Required for verifying JWT Payload
  if (!context.AUTH_TOKEN) {
    console.log(
      "[conversations][response] Invalid Auth Token",
      context.AUTH_TOKEN
    );
    response.setStatusCode(400);
    response.setBody({ error: "Invalid Auth Token" });
    return callback(null, response);
  }
  // -- Auth Token: Required for verifying JWT Payload
  if (!event._token) {
    console.log(
      "[conversations][response] Missing JWT Token",
      context.AUTH_TOKEN
    );
    response.setStatusCode(400);
    response.setBody({ error: "Missing JWT Token" });
    return callback(null, response);
  }

  // Core Logic
  try {
    const client = context.getTwilioClient();

    /*
     * Step 1: Validate Request
     */
    // -- AI Assistant's Response
    if (event.Status === "Failed") {
      console.log(
        "[conversations][response] Failed to generate AI Asssitant Response"
      );
      response.setStatusCode(400);
      response.setBody({ error: "Failed to generate AI Asssitant Responsen" });
      return callback(null, response);
    }
    // -- JWT Token: Validity of JWT Token
    const jwtPayload = verifyRequest(
      context.AUTH_TOKEN,
      event._token
    ) as JWTPayload;

    if (!jwtPayload) {
      console.log("[conversations][response] Invalid JWT Token", jwtPayload);
      response.setStatusCode(400);
      response.setBody({ error: "Invalid JWT Token" });
      return callback(null, response);
    }

    /*
     * [Optional] Step 2: Inject "AI Assistant is typing" into Conversation Attribute
     * Note: This will increaes the latency as it requires 2 additional synchronous API calls. Recommended to set TWILIO_AIA_IS_TYPING to "false" in .env file.
     */

    let finalAiAssistantIsTyping = context.TWILIO_AIA_IS_TYPING === "true";
    if (event.aiAssistantIsTyping) {
      finalAiAssistantIsTyping = true;
    }

    if (finalAiAssistantIsTyping) {
      console.log(
        `[conversations][messageAdded] Updating conversation attributes with isTyping... this increases latency`
      );
      // Get Conversation Attributes
      const conversationAttributes = await client.conversations.v1
        .services(jwtPayload.serviceSid)
        .conversations(jwtPayload.conversationSid)
        .fetch();

      const parsedConversationAttributes = JSON.parse(
        conversationAttributes.attributes
      );
      // Update Conversation Attributes
      await client.conversations.v1
        .services(jwtPayload.serviceSid)
        .conversations(jwtPayload.serviceSid)
        .update({
          attributes: JSON.stringify({
            ...parsedConversationAttributes,
            assistantIsTyping: false,
          }),
        });
    }

    /*
     * Step 3: Inject AI Assistant Response to Conversation
     */
    const message = await client.conversations.v1
      .services(jwtPayload.serviceSid)
      .conversations(jwtPayload.conversationSid)
      .messages.create({
        body: event.Body,
        author: jwtPayload.author,
      });
    console.log(
      `[conversations][response] AI Assistant Response Successfully Sent. Message SID: ${message.sid}`
    );
    response.setBody({
      status: "success",
      messageSid: message.sid,
    });

    /*
     * Last Step: Return API response
     */
    return callback(null, response);
  } catch (err) {
    console.log("[conversations][response] Catch Error", err);
    response.setBody({ error: "error" });
    response.setStatusCode(500);
    return callback(null, response);
  }
};
