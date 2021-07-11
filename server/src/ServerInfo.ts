import path from "path";
import fs from "fs";

export interface IServerInfo {
  smtp: {
    host: string;
    port: number;
    auth: {
      user: string;
      pass: string;
    }
  },
  imap: {
    host: string;
    port: number;
    auth: {
      user: string;
      pass: string;
    }
  }
}


export let serverInfo: IServerInfo;

const rawInfo: string = fs.readFileSync(path.join(__dirname, "../serverInfo.json"), 'utf-8');

serverInfo = JSON.parse(rawInfo);