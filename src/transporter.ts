import { createSocket, Socket, SocketType } from 'dgram';
import { TTransportLogger, ILogObject, TLogLevelName } from 'tslog';
import { flatArr } from './flat-arr';

export type AvailableTagKeys = Pick<
  ILogObject,
  | 'instanceName'
  | 'loggerName'
  | 'hostname'
  | 'requestId'
  | 'logLevel'
  | 'filePath'
  | 'fullFilePath'
  | 'fileName'
  | 'functionName'
  | 'typeName'
  | 'methodName'
>;

export type AvailableFieldKeys = Pick<
  ILogObject,
  'argumentsArray' | 'columnNumber' | 'date' | 'isConstructor' | 'lineNumber' | 'logLevelId'
>;

export interface ITransporterOptions {
  /** Name of measurement */
  measurementName: string;
  /** Destination port */
  port: number;
  /** Destination host name or IP address */
  address: string;
  /** Type of socket - udp4 or udp6 */
  socketType: SocketType;
  /** Minimum logging level to transport - default 'debug' */
  minLevel?: TLogLevelName;
  /** List of field keys - If no keys are provided, the default ones will be used */
  fieldKeys?: Array<keyof (AvailableTagKeys & AvailableFieldKeys)>;
  /** List of tag keys - with string value only - If keys are not specified, default ones will be used */
  tagKeys?: Array<keyof AvailableTagKeys>;
}

export interface ITransportProvider {
  minLevel: TLogLevelName;
  transportLogger: TTransportLogger<(message: ILogObject) => void>;
}

export class Transporter {
  private socket: Socket;
  private readonly DEFAULT_FIELD_KEYS: Array<keyof AvailableFieldKeys> = [
    'argumentsArray',
    'columnNumber',
    'isConstructor',
    'lineNumber',
    'logLevelId'
  ];
  private readonly DEFAULT_TAG_KEYS: Array<keyof AvailableTagKeys> = [
    'fileName',
    'filePath',
    'fullFilePath',
    'functionName',
    'hostname',
    'instanceName',
    'logLevel',
    'loggerName',
    'methodName',
    'requestId',
    'typeName'
  ];

  constructor(private options: ITransporterOptions) {
    if (!this.options.measurementName) {
      throw new Error('You need to provide measurementName !');
    }
    this.socket = createSocket(this.options.socketType);
  }

  /**
   * @returns Transport provider
   */
  public getTransportProvider(): ITransportProvider {
    return {
      minLevel: this.options?.minLevel || 'debug',
      transportLogger: {
        debug: this.transport.bind(this),
        error: this.transport.bind(this),
        fatal: this.transport.bind(this),
        info: this.transport.bind(this),
        silly: this.transport.bind(this),
        trace: this.transport.bind(this),
        warn: this.transport.bind(this)
      }
    };
  }

  private transport(message: ILogObject): void {
    const msg = Buffer.from(this.prepareMessage(message));
    this.socket.send(msg, 0, msg.length, this.options.port, this.options.address || 'localhost');
  }

  private prepareMessage(message: ILogObject): string {
    const tags = this.prepareTags(message);
    const fields = this.prepareFields(message);
    return `${this.options.measurementName}${tags}${fields}`;
  }

  private prepareTags(message: ILogObject): string {
    const fields = [...(this.options?.tagKeys || this.DEFAULT_TAG_KEYS)];
    const keyValuePairs = Object.entries(message)
      .filter(([key]) => fields.includes(key as keyof AvailableTagKeys))
      .map(([key, value]) => {
        if (typeof value === 'undefined') {
          return `${key}="unknown"`;
        }
        return `${key}="${value}"`;
      })
      .join(',');
    return `,${keyValuePairs}`;
  }

  private prepareFields(message: ILogObject): string {
    const fields = [...(this.options?.fieldKeys || this.DEFAULT_FIELD_KEYS)];
    const keyValuePairs = Object.entries(message)
      .filter(([key]) => fields.includes(key as keyof AvailableFieldKeys))
      .map(([key, value]) => {
        if (typeof value === 'undefined') {
          value = 'unknown';
        }

        if (typeof value === 'string') {
          return `${key}="${value}"`;
        }

        if (typeof value === 'object' && !Array.isArray(value)) {
          value = [value];
        }

        if (Array.isArray(value)) {
          value = flatArr(value);
          return `${key}="${value.join(',')}"`;
        }

        return `${key}=${value}`;
      })
      .join(',');
    return ` ${keyValuePairs}`;
  }
}
