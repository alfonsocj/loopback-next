import {NoteApplication} from './application';
import {ApplicationConfig} from '@loopback/core';
import {Request, Response} from 'express';
import * as express from 'express';
import * as path from 'path';
import * as pEvent from 'p-event';
import * as http from 'http';

export class ExpressServer {
  private app: express.Application;
  public readonly lbApp: NoteApplication;
  private server: http.Server;

  constructor(options: ApplicationConfig = {}) {
    this.app = express();
    this.lbApp = new NoteApplication(options);

    // Expose the front-end assets via Express, not as LB4 route
    this.app.use('/api', this.lbApp.requestHandler);

    // Custom Express routes
    this.app.get('/', function(_req: Request, res: Response) {
      res.sendFile(path.resolve('public/express.html'));
    });
    this.app.get('/hello', function(_req: Request, res: Response) {
      res.send('Hello world!');
    });

    // Serve static files in the public folder
    this.app.use(express.static('public'));
  }

  public async boot() {
    await this.lbApp.boot();
  }

  public async start() {
    await this.lbApp.start();
    this.server = this.app.listen(3000);
    await pEvent(this.server, 'listening');
  }

  // For testing purposes
  public async stop() {
    if (!this.server) return;
    this.server.close();
    await pEvent(this.server, 'close');
  }
}
