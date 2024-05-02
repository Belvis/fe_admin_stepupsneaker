import { AccessControlProvider, CanParams } from "@refinedev/core";
import { newEnforcer } from "casbin";
import {
  decodeToken,
  getRoleFromDecodedToken,
  getToken,
} from "../helpers/token";
import { adapter, model } from "../utils/config/casbinConfig";
import { CanResponse } from "@refinedev/core/dist/contexts/accessControl/types";

export const accessControlProvider: AccessControlProvider = {
  can: async ({
    resource,
    action,
    params,
  }: CanParams): Promise<CanResponse> => {
    const enforcer = await newEnforcer(model, adapter);
    const token = getToken();
    const decodedToken = decodeToken(token);
    const role = getRoleFromDecodedToken(decodedToken);

    if (action === "field") {
      return Promise.resolve({
        can: await enforcer.enforce(
          role,
          `${resource}/${params?.field}`,
          action
        ),
      });
    }
    return {
      can: await enforcer.enforce(role, resource, action),
    };
  },
  options: {
    buttons: {
      enableAccessControl: true,
      hideIfUnauthorized: false,
    },
    queryOptions: {
      // ... default global query options
    },
  },
};
