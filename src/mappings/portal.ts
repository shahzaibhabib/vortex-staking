import { Portal, Stake, Token, Unstake, User } from "../../generated/schema";
import { convertTokenToDecimal } from "../utils/helpers";
import {
  Deposited,
  Staked,
  Withdrawn,
} from "./../../generated/templates/Portal/Portal";

export function handleDeposited(event: Deposited): void {
  let portal = Portal.load(event.address.toHexString());
  if (!portal) return;

  portal.rewards = event.params.amount;
  portal.newEndBlock = event.params.endDate;
  portal.recipient = event.params.recipient.toHexString();
  portal.rewardAdded = true;

  portal.save();
}

// staker/portal/blockNumber/txIndex
export function handleStaked(event: Staked): void {
  let portal = Portal.load(event.address.toHexString());
  if (!portal) return;

  let stakingToken = Token.load(portal.stakingToken);
  if (!stakingToken) return;

  let stake = Stake.load(event.transaction.hash.toHexString());
  if (!stake) {
    stake = new Stake(event.transaction.hash.toHexString());

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
    user.unstakes = [];
  }

  let userStakes = user.stakes;
  userStakes.push(stake.id);
  user.stakes = userStakes;

  stake.save();
  user.save();
}

export function handleWithdrawn(event: Withdrawn): void {
  let portal = Portal.load(event.address.toHexString());
  if (!portal) return;

  let stakingToken = Token.load(portal.stakingToken);
  if (!stakingToken) return;

  let unstake = new Unstake(event.transaction.hash.toHexString());
  unstake.portal = portal.id;
  unstake.unstaker = event.params.recipient.toHexString();
  unstake.recipient = event.params.recipient.toHexString();
  unstake.amount = event.params.amount;
  unstake.name =
    convertTokenToDecimal(
      event.params.amount,
      stakingToken.decimals
    ).toString() +
    "-" +
    portal.name;
  unstake.timestamp = event.block.timestamp;

  let user = User.load(event.params.recipient.toHexString());
  if (!user) return;

  let userUnstakes = user.unstakes;
  userUnstakes.push(unstake.id);
  user.unstakes = userUnstakes;

  unstake.save();
  user.save();
}
