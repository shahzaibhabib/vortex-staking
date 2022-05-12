import { PortalCreated } from "../../generated/Vortex/Vortex";
import { Vortex, Portal, User } from "../../generated/schema";
import {
  fetchAndSaveRewardTokens,
  populateMinimumRewardRates,
  populatePortalData,
  populateRewardTokens,
} from "../utils/portalData";
import { Portal as PortalTemplate } from "./../../generated/templates";
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
    portal.endBlock = ZERO_BI;
    portal.rewardTokens = [];
    portal.minimumRewardRates = [];
    portal.stakingToken = NULL_ETH_ADDRESS;
    portal.userStakeLimit = ZERO_BI;
    portal.portalStakeLimit = ZERO_BI;
    portal.distributionLimit = ZERO_BI;
    portal.owner = NULL_ETH_ADDRESS;
    portal.createdAtTimestamp = event.block.timestamp;
    portal.createTxHash = event.transaction.hash.toHexString();
    portal.rewards = [];
    portal.newEndBlock = ZERO_BI;
    portal.recipient = NULL_ETH_ADDRESS;
    portal.rewardAdded = false;
    portal.depositTxHash = NULL_ETH_ADDRESS;
  }

  // fetching portal details
  portal = populatePortalData(portal);

  // adds current portal in the vortex's portal list
  const portals = vortex.portals;
  portals.push(portal.id);
  vortex.portals = portals;

  // checks if the user exist
  let user = User.load(portal.owner);
  if (!user) {
    user = new User(portal.owner);
    user.portals = [];
    user.stakes = [];
  }

  // adds current portal in the user's portal list
  const userPortals = user.portals;
  userPortals.push(portal.id);
  user.portals = userPortals;

  // saves in the DB
  portal.save();
  user.save();
  vortex.save();

  // creates data template of the current portal
  PortalTemplate.create(event.params.portal);
}
