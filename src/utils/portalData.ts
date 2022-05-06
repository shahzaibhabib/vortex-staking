import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Portal } from "./../../generated/Vortex/Portal";
import { Portal as PortalEntity, Token } from "./../../generated/schema";
import { populateTokenData } from "./token";
import { convertTokenToDecimal } from "./helpers";

// Middleware function that takes in a Portal type variable and populates it's fields
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
    let rates = portal.minimumRewardRates;
    let nameStr = "";
    for (let index = 0; index < rewardTokens.length; index++) {
      tokens.push(populateTokenData(rewardTokens[index]).id);

      const minimumRewardRateResult = portalContract.try_minimumRewardRate(
        BigInt.fromI32(index)
      );
      if (!minimumRewardRateResult.reverted) {
        rates.push(minimumRewardRateResult.value);
      }

      // naming portal a 2 step process, this is step 1
      let token = Token.load(rewardTokens[index].toHexString());
      if (token && index < 3) {
        nameStr = nameStr + token.symbol + " ";
      }
    }
    portal.rewardTokens = tokens;
    portal.minimumRewardRates = rates;
    portal.name = nameStr.trim();
  }

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

  // continue naming portal, step 2
  const stakingToken = Token.load(portal.stakingToken);
  if (stakingToken) {
    portal.name =
      convertTokenToDecimal(
        portal.portalStakeLimit,
        stakingToken.decimals
      ).toString() +
      " " +
      portal.name;
  }

  return portal;
}
