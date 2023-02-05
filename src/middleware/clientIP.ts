import requestIP from 'request-ip';
import { Request, Response, NextFunction } from 'express';

class clientIP {
  public getClientIP(req: Request) {
    const ip = requestIP.getClientIp(req);

    //localhost
    if (ip === '::1') return '127.0.0.1';
    //Ipv6+Ipv4 to Ipv4
    if (ip.indexOf(':') > -1) return ip.split(':')[3];
    return ip;
  }
}

export default function (req: Request, res: Response, next: NextFunction) {
  res.locals.ip = new clientIP().getClientIP(req);
  next();
}
