import { Address } from "@graphprotocol/graph-ts";
import { Portal } from "./../../generated/Vortex/Portal";

export function getPortalData(address: Address) {
  const portalContract = Portal.bind(address);
}
