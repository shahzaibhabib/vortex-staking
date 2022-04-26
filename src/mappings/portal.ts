import { Portal } from "../../generated/schema";
import { Deposited } from "./../../generated/templates/Portal/Portal";

export function handleDeposited(event: Deposited): void {
  let portal = Portal.load(event.address.toHexString());
  if (!portal) return;

  portal.rewards = event.params.amount;
  portal.newEndBlock = event.params.endDate;
  portal.recipient = event.params.recipient.toHexString();
  portal.rewardAdded = true;

  portal.save();
}

// event Deposited(
//   uint256[] amount,
//   uint256 endDate,
//   address recipient,
//   address portal
// );

// emit Deposited(rewards, newEndBlock, msg.sender, address(this));
