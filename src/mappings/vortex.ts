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
    portal.creator = event.params.creator.toHexString();
    portal.endBlock = ZERO_BI;
    portal.rewardTokens = [];
    portal.rewardRates = [];
    portal.stakingToken = NULL_ETH_ADDRESS;
    portal.stakeLimit = ZERO_BI;
    portal.contractStakeLimit = ZERO_BI;
    portal.distributionLimit = ZERO_BI;
    portal.depositAmounts = [];
    portal.endDate = ZERO_BI;
    portal.recipient = NULL_ETH_ADDRESS;
  }

  const portals = vortex.portals;
  portals.push(portal.id);
  vortex.portals = portals;

  let user = User.load(event.params.creator.toHexString());
  if (!user) {
    user = new User(event.params.creator.toHexString());
    user.portals = [];
  }

  const userPortals = user.portals;
  userPortals.push(portal.id);
  user.portals = userPortals;

  portal = populatePortalData(portal);

  user.save();
  portal.save();
  vortex.save();
}
