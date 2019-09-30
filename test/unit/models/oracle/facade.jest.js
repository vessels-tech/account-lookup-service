/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 * Crosslake
 - Lewis Daly <lewisd@crosslaketech.com>

 --------------
 ******/

'use strict'

const getPort = require('get-port')
const Sinon = require('sinon')
const Enums = require('@mojaloop/central-services-shared').Enum
const request = require('@mojaloop/central-services-shared').Util.Request

const Mockgen = require('../../../util/mockgen.js')
const Helper = require('../../../util/helper')
const Db = require('../../../../src/lib/db')
const initServer = require('../../../../src/server').initialize
const OracleFacade = require('../../../../src/models/oracle/facade')
const oracleEndpoint = require('../../../../src/models/oracle')

let sandbox

// const getOracleDatabaseResponse = [{
//   oracleEndpointId: 1,
//   endpointType: 'URL',
//   value: 'http://localhost:8444',
//   idType: 'MSISDN',
//   currency: 'USD',
//   isDefault: true
// }]

// const createOracleModel = {
//   oracleEndpointId: 1,
//   endpointType: 'URL',
//   value: 'http://localhost:8444',
//   idType: 'MSISDN',
//   currency: 'USD',
// }

describe('Oracle Facade', () => {
  beforeEach(() => {
    sandbox = Sinon.createSandbox()
    // sandbox.stub(Db, 'connect').returns(Promise.resolve({}))
    sandbox.stub(request)
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('oracleRequest', () => {

    it('sends requests to more than 1 oracle', async () => {
      // Arrange
      const requestStub = sandbox.stub()
      request.sendRequest = requestStub
      requestStub.resolves(true)

      const getOracleResponse = [{
        oracleId: '1',
        oracleIdType: 'MSISDN',
        endpoint: {
          value: 'http://localhost:8444',
          endpointType: 'URL'
        },
        isDefault: true
      },
      {
        oracleId: '2',
        oracleIdType: 'MSISDN',
        endpoint: {
          value: 'http://localhost:8445',
          endpointType: 'URL'
        },
        isDefault: false
      }]
      sandbox.stub(oracleEndpoint, 'getOracleEndpointByTypeAndCurrency').resolves(getOracleResponse)
      const headers = {

      }
      headers[Enums.Http.Headers.FSPIOP.SOURCE] = 'fsp01'
      headers[Enums.Http.Headers.FSPIOP.DESTINATION] = 'fsp02'
      const method = Enums.Http.RestMethods.GET
      const params = {
        Type: "request_type",
        ID: "12345"
      }
      const payload = { currency: 'AUD' }
      
      // Act
      const result = await OracleFacade.oracleRequest(headers, method, params, {}, payload)

      // Assert
      expect(requestStub.calledOnce).toBe(true)
    })

    it('sends requests based on a payload currency', async () => {
      // Arrange
      const requestStub = sandbox.stub()
      request.sendRequest = requestStub
      requestStub.resolves(true)

      const getOracleResponse = [{
        oracleId: '1',
        oracleIdType: 'MSISDN',
        endpoint: {
          value: 'http://localhost:8444',
          endpointType: 'URL'
        },
        isDefault: true
      }]
      sandbox.stub(oracleEndpoint, 'getOracleEndpointByTypeAndCurrency').resolves(getOracleResponse)
      const headers = {}
      headers[Enums.Http.Headers.FSPIOP.SOURCE] = 'fsp01'
      headers[Enums.Http.Headers.FSPIOP.DESTINATION] = 'fsp02'
      const method = Enums.Http.RestMethods.GET
      const params = {
        Type: "request_type",
        ID: "12345"
      }
      const payload = { currency: 'AUD' }

      // Act
      const result = await OracleFacade.oracleRequest(headers, method, params, {}, payload)

      // Assert
      expect(requestStub.calledOnce).toBe(true)
    })

    it.only('fails to send request when type + currency cannot be found', async () => {
      // Arrange
      const requestStub = sandbox.stub()
      request.sendRequest = requestStub
      requestStub.resolves(true)

      const getOracleResponse = []
      sandbox.stub(oracleEndpoint, 'getOracleEndpointByTypeAndCurrency').resolves(getOracleResponse)
      const headers = {}
      headers[Enums.Http.Headers.FSPIOP.SOURCE] = 'fsp01'
      headers[Enums.Http.Headers.FSPIOP.DESTINATION] = 'fsp02'
      const method = Enums.Http.RestMethods.GET
      const params = {
        Type: "request_type",
        ID: "12345"
      }
      const payload = { currency: 'AUD' }

      // Act
      const action = async () => await OracleFacade.oracleRequest(headers, method, params, {}, payload)

      // Assert
      await expect(action()).rejects.toThrow()
    })

    it.todo('handles requests whe no currency is specified')
    it.todo('handles requests whe no currency is specified and more than 1 oracleEndpintModel is found')
    it.todo('fails to send when currency is not specified, and type cannot be found')
    it.todo('throws when an unknown error occours')

  })

  describe('oracleBatchRequest', () => {

  })

  // describe('getOracleEndpointByType', () => {
  //   let queryStub

  //   beforeEach(() => {
  //     queryStub = sandbox.stub()
  //     Db.oracleEndpoint = {
  //       query: queryStub
  //     }
  //   })

  //   it('gets an oracleEndpoint by type', async () => {
  //     // Arrange
  //     queryStub.resolves(getOracleDatabaseResponse)

  //     // Act
  //     const result = await oracleEndpoint.getOracleEndpointByType('URL')

  //     // Assert
  //     expect(queryStub.calledOnce).toBe(true)
  //     expect(result).toStrictEqual(getOracleDatabaseResponse)
  //   })

  //   it('gets an oracleEndpoint by type with builder', async () => {
  //     // Arrange
  //     const builderStub = sandbox.stub()
  //     builderStub.innerJoin = sandbox.stub().returns({
  //       innerJoin: sandbox.stub().returns({
  //         where: sandbox.stub().returns({
  //           select: sandbox.stub().resolves(getOracleDatabaseResponse)
  //         })
  //       })
  //     })
  //     Db.oracleEndpoint.query.callsArgWith(0, builderStub)

  //     // Act
  //     const result = await oracleEndpoint.getOracleEndpointByType('URL')

  //     // Assert
  //     expect(result).toStrictEqual(getOracleDatabaseResponse)
  //   })

  //   it('fails to get an oracleEndpoint', async () => {
  //     // Arrange
  //     queryStub.throws(new Error("failed to get oracleEndpoint"))

  //     // Act
  //     const action = async () => await oracleEndpoint.getOracleEndpointByType("123")

  //     // Assert
  //     await expect(action()).rejects.toThrow()
  //   })
  // })
})