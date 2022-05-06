import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Token } from "../../generated/schema";
import { ERC20 } from "./../../generated/Vortex/ERC20";
import { ERC20NameBytes } from "./../../generated/Vortex/ERC20NameBytes";
import { ERC20SymbolBytes } from "./../../generated/Vortex/ERC20SymbolBytes";
import { isNullEthValue } from "./helpers";

function fetchTokenName(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress);
  let contractNameBytes = ERC20NameBytes.bind(tokenAddress);

  let name = "unknown";
  let nameResult = contract.try_name();

  if (nameResult.reverted) {
    let nameByesResult = contractNameBytes.try_name();
    if (!nameByesResult.reverted) {
      if (!isNullEthValue(nameByesResult.value.toHexString())) {
        name = nameByesResult.value.toString();
      }
    }
  } else {
    name = nameResult.value;
  }
  return name;
}

function fetchTokenSymbol(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress);
  let contractSymbolBytes = ERC20SymbolBytes.bind(tokenAddress);

  let symbol = "unknown";
  let symbolResult = contract.try_symbol();

  if (symbolResult.reverted) {
    let symbolBytesResult = contractSymbolBytes.try_symbol();
    if (!symbolBytesResult.reverted) {
      if (!isNullEthValue(symbolBytesResult.value.toHexString())) {
        symbol = symbolBytesResult.value.toString();
      }
    }
  } else {
    symbol = symbolResult.value;
  }

  return symbol;
}

function fetchTokenDecimals(tokenAddress: Address): BigInt {
  let contract = ERC20.bind(tokenAddress);

  let decimals = 0;
  let decimalResult = contract.try_decimals();

  if (!decimalResult.reverted) {
    decimals = decimalResult.value;
  }

  return BigInt.fromI32(decimals);
}

// Middleware function that takes in a Token type variable and populates it's fields
export function populateTokenData(tokenAddress: Address): Token {
  let token = Token.load(tokenAddress.toHexString());
  if (!token) {
    token = new Token(tokenAddress.toHexString());
    token.name = fetchTokenName(tokenAddress);
    token.symbol = fetchTokenSymbol(tokenAddress);
    token.decimals = fetchTokenDecimals(tokenAddress);
    token.save();
  }
  return token;
}
