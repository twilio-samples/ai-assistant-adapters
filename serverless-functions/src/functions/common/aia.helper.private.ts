// Imports Libs
import * as twilio from "twilio";
import fetch from "node-fetch";
import { sign, verify } from "jsonwebtoken";

// Type(s)
type RequestContext = {
  ACCOUNT_SID: string;
  AUTH_TOKEN: string;
  TWILIO_FLEX_WORKSPACE_SID: string;
  TWILIO_FLEX_WORKFLOW_SID: string;
};

type RequestEvent = {
  workspaceSid?: string;
  workflowSid?: string;
  request: any;
};

type SignRequestBody = {
  serviceSid: string;
  conversationSid: string;
  author: string;
};

type SendMessageResult = {
  aborted: boolean;
  account_sid: string;
  body: string;
  error: any;
  flagged: boolean;
  session_id: string;
  status: string;
};

/**
 * Send Message to AI Assistant
 *
 * @param {RequestContext} context - Context
 * @param {string} aiAssistantSid - AI Assistant's SID
 * @param {any} body - Payload body
 * @returns {boolean} Success / Fail
 */

export const sendMessageToAIA = async (
  context: RequestContext,
  aiAssistantSid: string,
  body: any
) => {
  if (!aiAssistantSid?.startsWith("aia_asst_")) {
    throw new Error("[sendMessageToAIA] AI Assistant SID invalid or missing.");
  }
  const baseUrl = `https://assistants.twilio.com/v1/Assistants/${aiAssistantSid}/Messages`;
  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${context.ACCOUNT_SID}:${context.AUTH_TOKEN}`,
          "utf-8"
        ).toString("base64")}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const data: SendMessageResult =
      (await response.json()) as SendMessageResult;
    if (data.status && data.status === "Success") {
      console.log(
        "[sendMessageToAIA] Successfully sent message to AI Assistant"
      );
      return true;
    } else {
      console.log(data);
      throw new Error(
        "[sendMessageToAIA] Failed to send request to AI Assistants."
      );
    }
  } catch (err) {
    console.log(err);
    throw new Error(
      "[sendMessageToAIA] Failed to send request to AI Assistants."
    );
  }
};

/**
 * Signs AI Assistant Request
 *
 * @param {string} authToken - Twilio Auth Token
 * @param {SignRequestBody} body - Payload body
 * @returns {string} JWT Token
 */

export const signRequest = (authToken: string, body: SignRequestBody) => {
  if (!authToken) {
    throw new Error("[signRequest] Invalid Auth Token for Signing");
  }
  try {
    return sign(body, authToken, { expiresIn: "5m" });
  } catch (err) {
    throw new Error("[signRequest] Fatal Error: Unable to sign request");
  }
};

/**
 * Verify AI Assistant Request
 *
 * @param {string} authToken - Twilio Auth Token
 * @param {string} token - JWT Token
 * @returns {any} Decoded JSON body
 */

export const verifyRequest = (authToken: string, token: string) => {
  if (!authToken || !token) {
    throw new Error(
      "[verifyRequest] Invalid Auth Token and/or JWT Token for Verification"
    );
  }
  try {
    const decoded = verify(token, authToken);
    return decoded;
  } catch (err) {
    throw new Error("[verifyRequest] Fatal Error: Unable to verify jwt");
  }
};
