import { AuthBindings } from "@refinedev/core";

/**
 * Basic auth provider for Hummii Admin
 * This is a placeholder that will be implemented with real authentication later
 */
export const authProvider: AuthBindings = {
  login: async ({ email, password }) => {
    // TODO: Implement real authentication with NestJS backend
    // For now, just a placeholder
    return {
      success: true,
      redirectTo: "/",
    };
  },

  logout: async () => {
    // TODO: Implement real logout
    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    // TODO: Implement real authentication check
    return {
      authenticated: true,
    };
  },

  getPermissions: async () => {
    // TODO: Get real permissions from backend
    return null;
  },

  getIdentity: async () => {
    // TODO: Get real user identity
    return null;
  },

  onError: async (error) => {
    console.error(error);
    return { error };
  },
};

