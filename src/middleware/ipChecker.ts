import { Request, Response, NextFunction } from 'express';
import ipaddr from 'ipaddr.js';

export default class IpChecker {
  checkAddress(addr: string, applyCidr: string) {
    try {
      const parsedAddr = ipaddr.parse(addr);
      if (applyCidr.indexOf('/') === -1) {
        return parsedAddr.toString() === ipaddr.process(applyCidr).toString();
      }

      const parsedRange = ipaddr.parseCIDR(applyCidr);
      return parsedAddr.match(parsedRange);
    } catch (err) {
      return false;
    }
  }

  checkMultiAddress(addr: string, applyCidrs: Array<string>) {
    if (typeof applyCidrs === 'string') {
      return this.checkAddress(addr, applyCidrs);
    }

    if (typeof applyCidrs === 'object') {
      for (let i = 0; i < applyCidrs.length; i++) {
        if (this.checkAddress(addr, applyCidrs[i])) {
          return true;
        }
      }
    }

    return false;
  }
}

export const checkIp = function (applyCidrs: string[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    const isValid = new IpChecker().checkMultiAddress(
      res.locals.ip,
      applyCidrs
    );

    if (!isValid) {
      res.status(401).send('접근이 허용되지 않은 IP입니다.');
      return;
    }

    next();
  };
};
