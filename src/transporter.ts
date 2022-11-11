import { format } from 'util';
import { createSocket, Socket, SocketType } from 'dgram';
import { TTransportLogger, ILogObject, TLogLevelName } from 'tslog';

export type AvailableKeys = Omit<ILogObject, 'toJSON' | 'stack'>;

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
  fieldKeys?: Array<keyof AvailableKeys>;
  /** List of tag keys - with string value only - If keys are not specified, default ones will be used */
  tagKeys?: Array<keyof AvailableKeys>;
}

export interface ITransportProvider {
  minLevel: TLogLevelName;
  transportLogger: TTransportLogger<(message: ILogObject) => void>;
}

export class Transporter {
  private socket: Socket;
  private readonly MATCH_SPECIAL_CHARS: RegExp = /[\n|\'|\{|\}|/|\[|\]|,]/gm;
  private readonly MATCH_TWO_OR_MORE_SPACES: RegExp = /\s{2,}/gm;
  private readonly SKIP_SPACES_PATTERN: RegExp = /\s/gm;
  private readonly SKIP_SPACES_REPLACEMENT: string = '\\ ';
  private readonly DEFAULT_FIELD_KEYS: Array<keyof AvailableKeys> = ['columnNumber', 'lineNumber', 'logLevelId'];
  private readonly DEFAULT_TAG_KEYS: Array<keyof AvailableKeys> = [
    'fileName',
    'isConstructor',
    'filePath',
    'fullFilePath',
    'functionName',
    'hostname',
    'instanceName',
    'logLevel',
    'loggerName',
    'methodName',
    'requestId',
    'typeName',
    'argumentsArray'
  ];

  constructor(private options: ITransporterOptions) {
    if (!this.options.measurementName) {
      throw new Error('You need to provide measurementName !');
    }

    if (this.options.tagKeys?.length && !this.options?.fieldKeys?.length) {
      throw this.errorIfOnlyOneListProvided('tagKeys', 'fieldKeys');
    }

    if (this.options.fieldKeys?.length && !this.options?.tagKeys?.length) {
      throw this.errorIfOnlyOneListProvided('fieldKeys', 'tagKeys');
    }

    if (this.options.fieldKeys?.length && this.options?.tagKeys?.length) {
      for (const itr of this.options.fieldKeys) {
        if (this.options.tagKeys.includes(itr)) {
          throw new Error(`Keys cannot be duplicated! (duplicated: ${itr})`);
        }
      }
    }

    if (!this.options.tagKeys?.length) {
      this.options.tagKeys = [...this.DEFAULT_TAG_KEYS];
    }

    if (!this.options.fieldKeys?.length) {
      this.options.fieldKeys = [...this.DEFAULT_FIELD_KEYS];
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
    const preparedMsg = this.prepareMessage(message);
    const msg = Buffer.from(preparedMsg);
    this.socket.send(msg, 0, msg.length, this.options.port, this.options.address || 'localhost');
  }

  private prepareMessage(message: ILogObject): string {
    const tags = this.prepareEntries(message, this.options.tagKeys || []);
    const fields = this.prepareEntries(message, this.options.fieldKeys || []);
    return `${this.options.measurementName},${tags} ${fields}`;
  }

  private prepareEntries(message: ILogObject, entries: string[]): string {
    const keyValuePairs = Object.entries(message)
      .filter(([key]) => entries.includes(key as keyof AvailableKeys))
      .map(([key, value]) => {
        if (typeof value === 'undefined') {
          value = 'unknown';
        }

        if (typeof value === 'object' && !Array.isArray(value)) {
          value = [value];
        }

        if (typeof value === 'string') {
          value = value
            .trim()
            .replace(this.MATCH_TWO_OR_MORE_SPACES, ' ')
            .replace(this.SKIP_SPACES_PATTERN, this.SKIP_SPACES_REPLACEMENT);
        }

        if (Array.isArray(value)) {
          return (
            `${key}=` +
            format(...value)
              .replace(this.MATCH_SPECIAL_CHARS, '')
              .replace(this.MATCH_TWO_OR_MORE_SPACES, ' ')
              .trim()
              .replace(this.SKIP_SPACES_PATTERN, this.SKIP_SPACES_REPLACEMENT)
          );
        }

        return `${key}=${value}`;
      })
      .join(',');

    return keyValuePairs;
  }

  private errorIfOnlyOneListProvided(
    exist: keyof Pick<ITransporterOptions, 'tagKeys' | 'fieldKeys'>,
    missing: keyof Pick<ITransporterOptions, 'tagKeys' | 'fieldKeys'>
  ): Error {
    return new Error(`If you provided ${exist} you must provide ${missing} as well`);
  }
}
