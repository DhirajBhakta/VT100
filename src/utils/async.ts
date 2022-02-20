/**
 *This is a  drop-in replacement of the utils.promisify from the
 * standard `utils` package which works for all functions that have N-arity
 * except for nullaries :/
 * @param functionThatTakesCallback
 * @returns functionThatGivesAPromise
 */

import { connect } from "net";

export function promisifyNullary(
  functionThatTakesCallback: (
    cb: (...args: Array<unknown>) => unknown
  ) => unknown
): () => Promise<unknown> {
  return function () {
    return new Promise((res, rej) => {
      functionThatTakesCallback(rej);
    });
  };
}


export function ping(host='localhost',port=8080){
  try{
    const sock = connect(port, host);
    return true
  }catch{
    return false;
  }
}
