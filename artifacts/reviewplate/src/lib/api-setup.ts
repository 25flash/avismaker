import { setAuthTokenGetter } from "@workspace/api-client-react";

export function initializeApiAuth() {
  setAuthTokenGetter(() => {
    return localStorage.getItem("reviewplate_token");
  });
}
