import { PortalCreated } from "../../generated/Vortex/Vortex";
import { Vortex, Portal } from "../../generated/schema";

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
  }

  const portals = vortex.portals;
  if (portals) {
    portals.push(portal.id);
    vortex.portals = portals;
  }

  portal.save();
  vortex.save();
}
