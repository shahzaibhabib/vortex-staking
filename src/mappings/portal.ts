import { log } from "@graphprotocol/graph-ts";
import { Portal, Stake, Token, Unstake, User } from "../../generated/schema";
import { convertTokenToDecimal } from "../utils/helpers";
import { populateTokenData } from "../utils/token";
import {
  Deposited,
  Staked,
  Withdrawn,
  AddRewardTokensCall,
} from "./../../generated/templates/Portal/Portal";

export function handleAddRewardTokens(call: AddRewardTokensCall): void {
  // make sure call.to exists
  // if (!call.transaction.to) return;

  log.debug("CALL_HANDLER_PROP ==> {} ==> {} ==> {}", [
    call.from.toHexString(),
    call.to.toHexString(),
    call.transaction.from.toHexString(),
  ]);

  let portal = Portal.load(call.to.toHexString());
  if (!portal) return;

  let prevRewardTokens = portal.rewardTokens;
  let prevMinimumRewardRates = portal.minimumRewardRates;
  let prevRewardTokensLength = portal.rewardTokens.length;

  let newRewardTokens = call.inputs._rewardsToken;
  let newMinimumRewardRates = call.inputs._minimumRewardRate;
  let newRewardTokensLength = call.inputs._rewardsToken.length;

  let totalNewLength = prevRewardTokensLength + newRewardTokensLength;

  // fetch & save token data if it does not already exists
  for (let index = 0; index < newRewardTokensLength; index++)
    populateTokenData(newRewardTokens[index]);

  // update reward tokens & minimum reward rates with new ones
  for (let index = prevRewardTokensLength; index < totalNewLength; index++) {
    prevRewardTokens[index] = newRewardTokens[
      index - prevRewardTokensLength
    ].toHexString();
    prevMinimumRewardRates[index] =
      newMinimumRewardRates[index - prevRewardTokensLength];
  }

  // Now, the prevRewardTokens & prevMinimumRewardRates have been updated with new ones
  portal.rewardTokens = prevRewardTokens;
  portal.minimumRewardRates = prevMinimumRewardRates;

  portal.save();
}

export function handleDeposited(event: Deposited): void {
  let portal = Portal.load(event.address.toHexString());
  if (!portal) return;

  portal.rewards = event.params.amount;
  portal.newEndBlock = event.params.endDate;
  portal.endBlock = event.params.endDate;
  portal.recipient = event.params.recipient.toHexString();
  portal.rewardAdded = true;
  portal.depositTxHash = event.transaction.hash.toHexString();

  portal.save();
}

// stake id = portal + "/" +staker
export function handleStaked(event: Staked): void {
  let portal = Portal.load(event.address.toHexString());
  if (!portal) return;

  let stakingToken = Token.load(portal.stakingToken);
  if (!stakingToken) return;

  let user = User.load(event.params.staker.toHexString());
  if (!user) {
    user = new User(event.params.staker.toHexString());
    user.portals = [];
    user.stakes = [];
    user.unstakes = [];
  }

  let stake = Stake.load(portal.id + "/" + event.params.staker.toHexString());
  if (!stake) {
    stake = new Stake(portal.id + "/" + event.params.staker.toHexString());

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

    let userStakes = user.stakes;
    userStakes.push(stake.id);
    user.stakes = userStakes;
  } else if (stake && !stake.active) {
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
  } else {
    stake.amount = stake.amount.plus(event.params.amount);
    stake.name =
      convertTokenToDecimal(stake.amount, stakingToken.decimals).toString() +
      " - " +
      portal.name;
  }

  stake.save();
  user.save();
}

export function handleWithdrawn(event: Withdrawn): void {
  let portal = Portal.load(event.address.toHexString());
  if (!portal) return;

  let stakingToken = Token.load(portal.stakingToken);
  if (!stakingToken) return;

  let user = User.load(event.params.recipient.toHexString());
  if (!user) return;

  let stake = Stake.load(
    portal.id + "/" + event.params.recipient.toHexString()
  );
  if (!stake) return;

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
    " - " +
    portal.name;
  unstake.timestamp = event.block.timestamp;

  let userUnstakes = user.unstakes;
  userUnstakes.push(unstake.id);
  user.unstakes = userUnstakes;

  stake.active = false;

  unstake.save();
  user.save();
  stake.save();
}
