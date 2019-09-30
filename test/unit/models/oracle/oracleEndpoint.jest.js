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

const Mockgen = require('../../../util/mockgen.js')
const Helper = require('../../../util/helper')
const Db = require('../../../../src/lib/db')
const initServer = require('../../../../src/server').initialize
// const { getEndpointTypeByType } = require('../../../../src/models/endpointType')
const oracleEndpoint = require('../../../../src/models/oracle/oracleEndpoint')

let sandbox

const getOracleDatabaseResponse = [{
  oracleEndpointId: 1,
  endpointType: 'URL',
  value: 'http://localhost:8444',
  idType: 'MSISDN',
  currency: 'USD',
  isDefault: true
}]

describe('oracleEndpoint', () => {
  beforeEach(() => {
    sandbox = Sinon.createSandbox()
    sandbox.stub(Db, 'connect').returns(Promise.resolve({}))
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('getOracleEndpointByType', () => {
    let queryStub

    beforeEach(() => {
      queryStub = sandbox.stub()
      Db.oracleEndpoint = {
        query: queryStub
      }
    })

    it('gets an oracleEndpoint by type', async () => {
      // Arrange
      queryStub.resolves(getOracleDatabaseResponse)
      
      // Act
      const result = await oracleEndpoint.getOracleEndpointByType('URL')
      
      // Assert
      expect(queryStub.calledOnce).toBe(true)
      expect(result).toStrictEqual(getOracleDatabaseResponse)
    })

    it('fails to get an oracleEndpoint', async () => {
      // Arrange
      queryStub.throws(new Error("failed to get oracleEndpoint"))

      // Act
      const action = async () => await oracleEndpoint.getOracleEndpointByType("123")

      // Assert
      await expect(action()).rejects.toThrow()
    })
  })

  describe('getOracleEndpointByTypeAndCurrency', () => {
    let queryStub

    beforeEach(() => {
      queryStub = sandbox.stub()
      Db.oracleEndpoint = {
        query: queryStub
      }
    })

    it('gets an oracleEndpoint by type and currency', async () => {
      // Arrange
      queryStub.resolves(getOracleDatabaseResponse)

      // Act
      const result = await oracleEndpoint.getOracleEndpointByTypeAndCurrency('URL', 'USD')

      // Assert
      expect(queryStub.calledOnce).toBe(true)
      expect(result).toStrictEqual(getOracleDatabaseResponse)
    })

    it('fails to get an oracleEndpoint by type and currency', async () => {
      // Arrange
      queryStub.throws(new Error("failed to get oracleEndpoint"))

      // Act
      const action = async () => await oracleEndpoint.getOracleEndpointByTypeAndCurrency('URL', 'USD')

      // Assert
      await expect(action()).rejects.toThrow()
    })
  })

  describe('getOracleEndpointByCurrency', () => {
    let queryStub

    beforeEach(() => {
      queryStub = sandbox.stub()
      Db.oracleEndpoint = {
        query: queryStub
      }
    })

    it('gets an oracleEndpoint by currency', async () => {
      // Arrange
      queryStub.resolves(getOracleDatabaseResponse)

      // Act
      const result = await oracleEndpoint.getOracleEndpointByCurrency('USD')

      // Assert
      expect(queryStub.calledOnce).toBe(true)
      expect(result).toStrictEqual(getOracleDatabaseResponse)
    })

    it('fails to get an oracleEndpoint by currency', async () => {
      // Arrange
      queryStub.throws(new Error("failed to get oracleEndpoint"))

      // Act
      const action = async () => await oracleEndpoint.getOracleEndpointByCurrency('USD')

      // Assert
      await expect(action()).rejects.toThrow()
    })
  })

  describe('getOracleEndpointById', () => {
    it.todo('gets an oracleEndpoint by Id')
    it.todo('fails to get an oracleEndpoint by Id')
  })

  describe('getAllOracleEndpoint', () => {
    it.todo('gets all oracle endpoints')
    it.todo('fails to get all oracleEndpoints') //not needed
  })

  describe('updateOracleEndpointById', () => {
    it.todo('updates an oracleEndpoint by Id')
    it.todo('fails to update an oracleEndpoint by Id')
  })

  describe('setIsActiveOracleEndpoint', () => {
    it.todo('sets the active oracleEndpoint')
    it.todo('fails to set the active oracleEndpoint')
  })

  describe('destroyOracleEndpointById', () => {
    it.todo('destroys the oracleEndpoint by Id')
    it.todo('fails to destroy the oracleEndpoint')
  })
})