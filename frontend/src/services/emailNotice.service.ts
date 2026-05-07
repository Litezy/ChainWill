import axios from "axios";
import { Api_Endpoints } from "@/lib/api";
import { handleCommunicationError } from "@/error/handleCommunicationError";
import { errorMessage } from "@/utils/messageStatus";

/* =========================
   TYPES
========================= */

export interface OwnerNotificationPayload {
  type: "owner";
  ownerName: string;
  ownerEmail: string;
  contractAddress: string;
}

export interface SignerNotificationPayload {
  type: "signer";
  ownerName: string;
  contractAddress: string;

  signers: {
    signerName: string;
    signerEmail: string;
  }[];
}

export interface BeneficiaryNotificationPayload {
  type: "beneficiary";
  ownerName: string;
  contractAddress: string;

  beneficiaries: {
    beneficiaryName: string;
    beneficiaryEmail: string;
    allocationPercentage: number | string;
  }[];
}

export type EmailNotificationPayload =
  | OwnerNotificationPayload
  | SignerNotificationPayload
  | BeneficiaryNotificationPayload;

export interface SendOtpPayload {
  email: string;
  audience: "signer" | "beneficiary";
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

/* =========================
   EMAIL NOTIFICATIONS
========================= */

export const sendNotificationEmail = async (
  payload: EmailNotificationPayload,
) => {
  try {
    const response = await axios.post(
      Api_Endpoints.sendNotificationEmail,
      payload,
    );

    return response.data;
  } catch (error) {
    errorMessage(
      handleCommunicationError(error, "Failed to notification email"),
    );
  }
};

export const sendOtp = async (payload: SendOtpPayload) => {
  try {
    const response = await axios.post(Api_Endpoints.sendOtp, payload);

    return response.data;
  } catch (error) {
    errorMessage(handleCommunicationError(error, "Failed to send OTP"));
  }
};

export const verifyOtp = async (payload: VerifyOtpPayload) => {
  try {
    const response = await axios.post(Api_Endpoints.verifyOtp, payload);

    return response.data;
  } catch (error) {
    errorMessage(handleCommunicationError(error, "Failed to verify OTP"));
  }
};
