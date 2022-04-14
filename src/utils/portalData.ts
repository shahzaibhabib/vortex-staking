import { Address } from "@graphprotocol/graph-ts";
import { Portal } from "./../../generated/Vortex/Portal";
import { Portal as PortalEntity } from "./../../generated/schema";
import { ZERO_BI } from "./constants";

export function populatePortalData(portal: PortalEntity): PortalEntity {
  const portalContract = Portal.bind(Address.fromString(portal.id));

  const ownerResult = portalContract.try_owner();
  if (!ownerResult.reverted) portal.owner = ownerResult.value.toHexString();

  const endBlockResult = portalContract.try_endBlock();
  if (!endBlockResult.reverted) portal.endBlock = endBlockResult.value;

  const rewardTokensResult = portalContract.try_getRewardTokens();
  if (!rewardTokensResult.reverted) {
    let rewardTokens = rewardTokensResult.value;
    let tokens = portal.rewardTokens;
    for (let index = 0; index < rewardTokens.length; index++) {
      tokens.push(rewardTokens[index].toHexString());
    }
    portal.rewardTokens = tokens;
  }

  const minimumRewardRateResult = portalContract.try_getRewardRate();
  if (!minimumRewardRateResult.reverted) {
    portal.rewardRates = minimumRewardRateResult.value;
  }

  const stakingTokenResult = portalContract.try_stakingToken();
  if (!stakingTokenResult.reverted)
    portal.stakingToken = stakingTokenResult.value.toHexString();

  const stakeLimitResult = portalContract.try_userStakeLimit();
  if (!stakeLimitResult.reverted) portal.stakeLimit = stakeLimitResult.value;

  const contractStakeLimitResult = portalContract.try_contractStakeLimit();
  if (!contractStakeLimitResult.reverted)
    portal.contractStakeLimit = contractStakeLimitResult.value;

  const distributionLimitResult = portalContract.try_distributionLimit();
  if (!distributionLimitResult.reverted)
    portal.distributionLimit = distributionLimitResult.value;

  return portal;
}
