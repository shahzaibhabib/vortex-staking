import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { Portal } from "./../../generated/Vortex/Portal";
import { Portal as PortalEntity, Token } from "./../../generated/schema";
import { populateTokenData } from "./token";
import { convertTokenToDecimal } from "./helpers";

// Middleware function that takes in a Portal type variable and populates it's fields
export function populatePortalData(
  portal: PortalEntity,
  portalCount: BigInt
): PortalEntity {
  const portalContract = Portal.bind(Address.fromString(portal.id));

  const one_rewardTokensResult = portalContract.try_getRewardTokens();
  let length = 0;
  if (!one_rewardTokensResult.reverted) {
    let rewardTokens = one_rewardTokensResult.value;
    length = one_rewardTokensResult.value.length;
    for (let index = 0; index < rewardTokens.length; index++) {
      populateTokenData(rewardTokens[index]);
      log.debug("REWARD_TOKENS_POP ==> {} ==> {} ==> {}", [
        portal.id.toString(),
        index.toString(),
        rewardTokens[index].toHexString(),
      ]);
    }
  }

  const ownerResult = portalContract.try_owner();
  if (!ownerResult.reverted) portal.owner = ownerResult.value.toHexString();

  const endBlockResult = portalContract.try_endBlock();
  if (!endBlockResult.reverted) portal.endBlock = endBlockResult.value;

  let rewardTokens = portal.rewardTokens;
  let minimumRewardRates = portal.minimumRewardRates;
  let nameStr = "";

  for (let index = 0; index < length; index++) {
    // log.debug("REWARD_TOKENS_FOR ==> {} ==> {}", [portal.id, index.toString()]);
    const rewardsTokenResult = portalContract.try_rewardsToken(
      BigInt.fromI32(index)
    );
    if (!rewardsTokenResult.reverted) {
      let token = Token.load(rewardsTokenResult.value.toHexString());
      if (token) {
        if (index < 3) nameStr = nameStr + token.symbol + " ";
        log.debug("REWARD_TOKENS ==> {} ==> {} ==> {} ==> {} ==> {}", [
          portal.id,
          index.toString(),
          token.symbol,
          rewardsTokenResult.value.toHexString(),
          token.id,
        ]);
        rewardTokens[index] = token.id;
      }
    }
  }

  for (let index = 0; index < length; index++) {
    const minimumRewardRateResult = portalContract.try_minimumRewardRate(
      BigInt.fromI32(index)
    );
    if (!minimumRewardRateResult.reverted) {
      minimumRewardRates[index] = minimumRewardRateResult.value;
      // log.debug("MINIMUM_REWARD_RATES ==> {} ==> {} ==> {} ==> {}", [
      //   portal.id,
      //   index.toString(),
      //   minimumRewardRateResult.value.toString(),
      //   minimumRewardRates[index].toString(),
      // ]);
    }
  }

  for (let index = 0; index < length; index++) {
    // log.debug("REWARD_TOKENS_TOKENS ==> {} ==> {} ==> {}", [
    //   portal.id,
    //   index.toString(),
    //   rewardTokens[index],
    // ]);
  }

  for (let index = 0; index < length; index++) {
    // log.debug("REWARD_RATES_RATES ==> {} ==> {} ==> {}", [
    //   portal.id,
    //   index.toString(),
    //   minimumRewardRates[index].toString(),
    // ]);
  }

  portal.rewardTokens = rewardTokens;
  portal.minimumRewardRates = minimumRewardRates;
  portal.name = "#" + portalCount.toString() + " " + nameStr.trim();

  const stakingTokenResult = portalContract.try_stakingToken();
  if (!stakingTokenResult.reverted) {
    portal.stakingToken = populateTokenData(stakingTokenResult.value).id;
  }

  const stakeLimitResult = portalContract.try_userStakeLimit();
  if (!stakeLimitResult.reverted)
    portal.userStakeLimit = stakeLimitResult.value;

  const contractStakeLimitResult = portalContract.try_contractStakeLimit();
  if (!contractStakeLimitResult.reverted)
    portal.portalStakeLimit = contractStakeLimitResult.value;

  const distributionLimitResult = portalContract.try_distributionLimit();
  if (!distributionLimitResult.reverted)
    portal.distributionLimit = distributionLimitResult.value;

  return portal;
}

export function fetchAndSaveRewardTokens(portal: PortalEntity): number {
  const portalContract = Portal.bind(Address.fromString(portal.id));

  const rewardTokensResult = portalContract.try_getRewardTokens();
  let length = 0;
  if (!rewardTokensResult.reverted) {
    let rewardTokens = rewardTokensResult.value;
    length = rewardTokensResult.value.length;
    for (let index = 0; index < rewardTokens.length; index++)
      populateTokenData(rewardTokens[index]);
  }

  return length;
}

export function populateRewardTokens(
  portal: PortalEntity,
  length: number
): string[] {
  const portalContract = Portal.bind(Address.fromString(portal.id));
  const tokens = portal.rewardTokens;

  for (let index = 0; index < length; index++) {
    const rewardTokenResult = portalContract.try_rewardsToken(
      BigInt.fromI32(index)
    );

    if (!rewardTokenResult.reverted) {
      let token = Token.load(rewardTokenResult.value.toHexString());
      if (token) tokens[index] = token.id;
    }
  }

  return tokens;
}

export function populateMinimumRewardRates(
  portal: PortalEntity,
  length: number
): BigInt[] {
  const portalContract = Portal.bind(Address.fromString(portal.id));
  const rates = portal.minimumRewardRates;

  for (let index = 0; index < length; index++) {
    const minimumRewardRateResult = portalContract.try_minimumRewardRate(
      BigInt.fromI32(index)
    );

    if (!minimumRewardRateResult.reverted) {
      rates[index] = minimumRewardRateResult.value;
    }
  }

  return rates;
}
