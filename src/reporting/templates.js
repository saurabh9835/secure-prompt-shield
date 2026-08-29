"use strict";

const { CATEGORIES, SEVERITY } = require("../utils/constants");

const CATEGORY_EXPLANATIONS = Object.freeze({
  [CATEGORIES.DIRECT_INJECTION]:
    "The prompt attempts to override, cancel, or replace prior instructions given to the model.",
  [CATEGORIES.SYSTEM_PROMPT_EXTRACTION]:
    "The prompt attempts to make the model reveal its system prompt, developer message, or internal configuration.",
  [CATEGORIES.ROLE_MANIPULATION]:
    "The prompt attempts to reassign the model to a different, more privileged role or persona.",
  [CATEGORIES.JAILBREAK]:
    "The prompt attempts to directly disable, bypass, or remove the model's safety behavior.",
  [CATEGORIES.DATA_EXFILTRATION]:
    "The prompt attempts to extract secrets, credentials, or other sensitive data.",
  [CATEGORIES.OBFUSCATION]:
    "The prompt contains encoded or obfuscated content, potentially hiding instructions from simple text scanning.",
  [CATEGORIES.INDIRECT_INJECTION]:
    "The prompt contains structural indicators consistent with instructions embedded in external or untrusted content."
});

const SEVERITY_RECOMMENDATIONS = Object.freeze({
  [SEVERITY.LOW]: "No action typically required. Consider logging for trend visibility.",
  [SEVERITY.MEDIUM]:
    "Review before allowing if this endpoint has elevated privileges. Consider flagging for manual review.",
  [SEVERITY.HIGH]:
    "Recommend blocking or requiring additional verification before this prompt reaches the model.",
  [SEVERITY.CRITICAL]:
    "Recommend blocking immediately and logging with full context for security review."
});

module.exports = { CATEGORY_EXPLANATIONS, SEVERITY_RECOMMENDATIONS };
