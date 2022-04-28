import { Portal, Stake, Token, User } from "../../generated/schema";
import { NULL_ETH_ADDRESS, ZERO_BI } from "../utils/constants";
import { convertTokenToDecimal } from "../utils/helpers";
import { Deposited, Staked } from "./../../generated/templates/Portal/Portal";

export function handleDeposited(event: Deposited): void {
  let portal = Portal.load(event.address.toHexString());
  if (!portal) return;

  portal.rewards = event.params.amount;
  portal.newEndBlock = event.params.endDate;
  portal.recipient = event.params.recipient.toHexString();
  portal.rewardAdded = true;

  portal.save();
}

export function handleStaked(event: Staked): void {
  let stake = Stake.load(
    event.params.staker.toHexString() + "-" + event.address.toHexString()
  );

  if (!stake) {
    stake = new Stake(
      event.params.staker.toHexString() + "-" + event.address.toHexString()
    );

    let portal = Portal.load(event.address.toHexString());
    if (!portal) return;

    let stakingToken = Token.load(portal.stakingToken);
    if (!stakingToken) return;

    stake.portal = portal.id;
    stake.staker = event.params.staker.toHexString();
    stake.recipient = event.params.recipient.toHexString();
    stake.amount = event.params.amount;
    stake.name =
      convertTokenToDecimal(
        event.params.amount,
        stakingToken.decimals
      ).toString() +
      " - " +
      portal.name;
    stake.timestamp = event.block.timestamp;
    stake.active = true;
  }

  let user = User.load(event.params.staker.toHexString());
  if (!user) {
    user = new User(event.params.staker.toHexString());
    user.portals = [];
    user.stakes = [];
  }

  let userStakes = user.stakes;
  userStakes.push(stake.id);
  user.stakes = userStakes;

  stake.save();
  user.save();
}
