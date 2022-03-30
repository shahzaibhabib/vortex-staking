import { Portal } from "../../generated/schema";
import { Deposited } from "./../../generated/templates/Portal/Portal";

export function handleDeposited(event: Deposited): void {
  let portal = Portal.load(event.address.toHexString());

  //   portal: address
  //   amount: uint256[]
  //   endDate: uint256
  //   recipient: address
}
