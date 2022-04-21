import { PortalCreated } from "../../generated/Vortex/Vortex";
import { Vortex, Portal, User } from "../../generated/schema";
import { populatePortalData } from "../utils/portalData";
import { NULL_ETH_ADDRESS, ZERO_BI } from "../utils/constants";

export function handlePortalCreated(event: PortalCreated): void {
  let vortex = Vortex.load(event.address.toHexString());
  if (!vortex) {
    vortex = new Vortex(event.address.toHexString());
    vortex.portals = [];
  }

  let portal = Portal.load(event.params.portal.toHexString());
  if (!portal) {
    portal = new Portal(event.params.portal.toHexString());
    portal.name = "Placeholder Name";
    portal.owner = NULL_ETH_ADDRESS;
    portal.endBlock = ZERO_BI;
    portal.rewardTokens = [];
    portal.rewardRates = [];
    portal.stakingToken = NULL_ETH_ADDRESS;
    portal.userStakeLimit = ZERO_BI;
    portal.portalStakeLimit = ZERO_BI;
    portal.distributionLimit = ZERO_BI;
    portal.depositAmounts = [];
    portal.endDate = ZERO_BI;
    portal.recipient = NULL_ETH_ADDRESS;
  }

  portal = populatePortalData(portal);

  const portals = vortex.portals;
  portals.push(portal.id);
  vortex.portals = portals;

  let user = User.load(portal.owner);
  if (!user) {
    user = new User(portal.owner);
    user.portals = [];
  }

  const userPortals = user.portals;
  userPortals.push(portal.id);
  user.portals = userPortals;

  user.save();
  portal.save();
  vortex.save();
}
