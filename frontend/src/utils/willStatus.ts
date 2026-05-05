import { formatUnits } from "ethers";

const TOKEN_DECIMALS = 18;

export const formatCwtAmount = (value: string | bigint, decimals = TOKEN_DECIMALS) => {
  const formatted = formatUnits(value, decimals);
  const asNumber = Number(formatted);

  if (!Number.isFinite(asNumber)) {
    return formatted;
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(asNumber);
};

export const getSecondsUntil = (unixTimestamp: number, nowMs = Date.now()) => {
  if (!unixTimestamp) return 0;

  return Math.max(unixTimestamp - Math.floor(nowMs / 1000), 0);
};

export const formatCountdown = (totalSeconds: number) => {
  const safeSeconds = Math.max(totalSeconds, 0);
  const days = Math.floor(safeSeconds / 86400);
  const hours = Math.floor((safeSeconds % 86400) / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

export const formatUnixDateTime = (unixTimestamp: number) => {
  if (!unixTimestamp) return "Not set";

  return new Date(unixTimestamp * 1000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const getLiveTimeRemaining = (
  timeRemaining: number,
  lastUpdatedAt: number | null,
  nowMs = Date.now()
) => {
  if (!lastUpdatedAt) return Math.max(timeRemaining, 0);

  const elapsedSeconds = Math.floor((nowMs - lastUpdatedAt) / 1000);
  return Math.max(timeRemaining - elapsedSeconds, 0);
};

export const getPrimaryTriggerCountdown = ({
  timeRemaining,
  attestationOpensAt,
  triggerUnlocksAt,
  triggered,
  lastUpdatedAt,
  nowMs,
}: {
  timeRemaining: number;
  attestationOpensAt: number;
  triggerUnlocksAt: number;
  triggered: boolean;
  lastUpdatedAt: number | null;
  nowMs?: number;
}) => {
  const currentNowMs = nowMs ?? Date.now();
  const liveTimeRemaining = getLiveTimeRemaining(timeRemaining, lastUpdatedAt, currentNowMs);
  const attestationCountdown = getSecondsUntil(attestationOpensAt, currentNowMs);
  const unlockCountdown = getSecondsUntil(triggerUnlocksAt, currentNowMs);

  if (!triggered) {
    return {
      label: formatCountdown(liveTimeRemaining),
      caption: "Time left before the proof-of-life process begins.",
      accent: "Inactivity window",
    };
  }

  if (attestationCountdown > 0) {
    return {
      label: formatCountdown(attestationCountdown),
      caption: "Time left until the attestation window opens.",
      accent: "Attestation pending",
    };
  }

  if (unlockCountdown > 0) {
    return {
      label: formatCountdown(unlockCountdown),
      caption: "Time left before the grace period fully unlocks execution.",
      accent: "Grace period active",
    };
  }

  return {
    label: "0s",
    caption: "The trigger countdown has completed.",
    accent: "Execution window reached",
  };
};
