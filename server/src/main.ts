import path from "path";
import http from "http";
import express, { Express, NextFunction, Request, Response } from "express";
import { serverInfo } from "./ServerInfo";
import * as IMAP from "./IMAP";
import * as SMTP from "./SMTP";
import * as Contacts from "./Contacts";
import { IContact } from "./Contacts";

const app: Express = express();

app.use(express.json());

app.use("/", express.static(path.join(__dirname, "../../client/dist")));

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

app.get("/mailboxes", async (req: Request, res: Response) => {
  try {
    const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
    const mailboxes: IMAP.IMailbox[] = await imapWorker.listMailboxes();
    res.json(mailboxes)
  } catch (error) {
    res.send("error")
  }
});

app.get("/mailboxes/:mailbox", async (req: Request, res: Response) => {
  try {
    const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
    const messages: IMAP.IMessage[] = await imapWorker.listMessages({
      mailbox: req.params.mailbox
    });
    res.json(messages)
  } catch (error) {
    res.send("error")
  }
});

app.get("/messages/:mailbox/:id", async (req: Request, res: Response) => {
  try {
    const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
    const messageBody: string | undefined = await imapWorker.getMessageBody({
      mailbox: req.params.mailbox,
      id: parseInt(req.params.id, 10)
    });
    res.send(messageBody)
  } catch (error) {
    res.send("error")
  }
});

app.delete("/messages/:mailbox/:id", async (req: Request, res: Response) => {
  try {
    const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
    await imapWorker.deleteMessage({
      mailbox: req.params.mailbox,
      id: parseInt(req.params.id, 10)
    });
    res.send("ok");
  } catch (error) {
    res.send("error")
  }
});

app.post("/messages", async (req: Request, res: Response) => {
  try {
    const smtpWorker: SMTP.Worker = new SMTP.Worker(serverInfo);
    await smtpWorker.sendMessage(req.body);
    res.send("ok");
  } catch (error) {
    res.send("error")
  }
});

app.get("/contacts", async (req: Request, res: Response) => {
  try {
    const contactsWorker: Contacts.Worker = new Contacts.Worker();
    const contacts: IContact[] = await contactsWorker.listContacts();
    res.json(contacts)
  } catch (error) {
    res.send("error")
  }
});

app.post("/contacts", async (req: Request, res: Response) => {
  try {
    const contactsWorker: Contacts.Worker = new Contacts.Worker();
    const contact: IContact = await contactsWorker.addContact(req.body);
    res.json(contact)
  } catch (error) {
    res.send("error")
  }
});

app.delete("/contacts/:id", async (req: Request, res: Response) => {
  try {
    const contactsWorker: Contacts.Worker = new Contacts.Worker();
    await contactsWorker.deleteContact(req.params.id);
    res.send("ok")
  } catch (error) {
    res.send("error")
  }
})

const server = http.createServer(app);

server.listen(3000, () => {
  console.log(`*****Mailbag server accepting requests on port 3000*****`);
});