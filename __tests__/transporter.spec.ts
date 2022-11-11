/* eslint-disable @typescript-eslint/ban-ts-comment */
import { it } from 'mocha';
import { expect, use, should, spy } from 'chai';
import chaiSpies from 'chai-spies';

import { ILogObject } from 'tslog';
import { ITransporterOptions, Transporter } from '../src/transporter';

should();
use(chaiSpies);
describe('transporter tests', () => {
  const message1 = {
    instanceName: undefined,
    loggerName: 'MyLogger',
    hostname: 'msmikesm.local',
    requestId: undefined,
    date: '2022-11-03T23:06:42.750Z',
    logLevel: 'error',
    logLevelId: 5,
    filePath: 'src/main.ts',
    fullFilePath: '/pat/to/file/in/project/src/main.ts',
    fileName: 'main.ts',
    lineNumber: 29,
    columnNumber: 12,
    isConstructor: false,
    functionName: undefined,
    typeName: undefined,
    methodName: undefined,
    argumentsArray: [
      'Error occurred while started app',
      {
        nativeError: ['ServerSelectionError'],
        details: [{ aa: 'bb' }],
        name: 'ServerSelectionError',
        isError: true,
        message: 'ECONNREFUSED'
      },
      ['Helo', { hello: ['aaa', [{ bb: 'cc' }]] }]
    ],
    toJSON: [() => {}]
  } as unknown as ILogObject;

  const baseTrasporterOptions: Partial<ITransporterOptions> = { address: 'localhost', port: 3123, socketType: 'udp4' };
  const transporter = new Transporter({
    ...baseTrasporterOptions,
    minLevel: 'debug',
    measurementName: 'testMEA'
  } as ITransporterOptions);

  it('should properly prepare entries', () => {
    const tags = transporter['prepareEntries'](message1, transporter['DEFAULT_TAG_KEYS']);
    expect(tags).to.be.equal(
      'instanceName=unknown,loggerName=MyLogger,hostname=msmikesm.local,requestId=unknown,logLevel=error,filePath=src/main.ts,fullFilePath=/pat/to/file/in/project/src/main.ts,fileName=main.ts,isConstructor=false,functionName=unknown,typeName=unknown,methodName=unknown,argumentsArray=Error\\ occurred\\ while\\ started\\ app\\ nativeError:\\ ServerSelectionError\\ details:\\ aa:\\ bb\\ name:\\ ServerSelectionError\\ isError:\\ true\\ message:\\ ECONNREFUSED\\ Helo\\ hello:\\ aaa\\ Array'
    );

    const fields = transporter['prepareEntries'](
      {
        ...message1,
        // @ts-ignore
        argumentsArray: { message: 'if arguments be an object' }
      },
      transporter['DEFAULT_FIELD_KEYS']
    );
    expect(fields).to.be.equal(`logLevelId=5,lineNumber=29,columnNumber=12`);
  });

  it('should properly prepare message for telegraf', () => {
    const result = transporter['prepareMessage'](message1);
    expect(result).to.be.equal(
      'testMEA,instanceName=unknown,loggerName=MyLogger,hostname=msmikesm.local,requestId=unknown,logLevel=error,filePath=src/main.ts,fullFilePath=/pat/to/file/in/project/src/main.ts,fileName=main.ts,isConstructor=false,functionName=unknown,typeName=unknown,methodName=unknown,argumentsArray=Error\\ occurred\\ while\\ started\\ app\\ nativeError:\\ ServerSelectionError\\ details:\\ aa:\\ bb\\ name:\\ ServerSelectionError\\ isError:\\ true\\ message:\\ ECONNREFUSED\\ Helo\\ hello:\\ aaa\\ Array logLevelId=5,lineNumber=29,columnNumber=12'
    );
  });

  it('when debug log occurred - transport should be called', () => {
    const spyMethod = spy('transport', transporter['transport'].bind(transporter));
    expect(spyMethod).to.be.spy;
    // @ts-ignore
    spyMethod(message1);
    expect(spyMethod).has.been.called.once;
    expect(spyMethod).has.called.with(message1);
  });

  it('should throw error when measurementName is not provided', () => {
    expect(() => new Transporter({} as ITransporterOptions)).to.throw('You need to provide measurementName !');
  });

  it('should throw error when only tagKeys are provided', () => {
    expect(
      () => new Transporter({ measurementName: 'test', tagKeys: ['columnNumber'] } as ITransporterOptions)
    ).to.throw('If you provided tagKeys you must provide fieldKeys as well');
  });

  it('should throw error when only fieldKeys are provided', () => {
    expect(
      () => new Transporter({ measurementName: 'test', fieldKeys: ['columnNumber'] } as ITransporterOptions)
    ).to.throw('If you provided fieldKeys you must provide tagKeys as well');
  });

  it('should throw error while keys are duplicated', () => {
    expect(
      () =>
        new Transporter({
          measurementName: 'test',
          fieldKeys: ['columnNumber'],
          tagKeys: ['columnNumber']
        } as ITransporterOptions)
    ).to.throw('Keys cannot be duplicated! (duplicated: columnNumber)');
  });

  it('should return transport provider', () => {
    const spyMethod = spy('getTransportProvider', transporter['getTransportProvider'].bind(transporter));
    expect(spyMethod).to.be.spy;
    spyMethod();
    expect(spyMethod).has.been.called.once;
    const transportProvider = transporter.getTransportProvider();
    expect(transportProvider).to.have.all.keys('minLevel', 'transportLogger');
    expect(transportProvider.minLevel).to.be.equal('debug');
    expect(transportProvider.transportLogger).to.have.all.keys(
      'debug',
      'warn',
      'error',
      'fatal',
      'info',
      'silly',
      'trace'
    );
  });

  it('should use default logLevel if not set', () => {
    const myTransporter = new Transporter({
      ...baseTrasporterOptions,
      measurementName: 'myLogs'
    } as ITransporterOptions);
    const transportProvider = myTransporter.getTransportProvider();
    expect(transportProvider.minLevel).to.be.equal('debug');
  });
});
