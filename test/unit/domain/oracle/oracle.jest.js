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

 * ModusBox
 - Rajiv Mothilal <rajiv.mothilal@modusbox.com>

 * Crosslake
 - Lewis Daly <lewisd@crosslaketech.com>

 --------------
 ******/

'use strict'

const Sinon = require('sinon')
const Logger = require('@mojaloop/central-services-logger')
const oracleDomain = require('../../../../src/domain/oracle/oracle')
const Db = require('../../../../src/lib/db')

const partyIdTypeResponse = {
  partyIdTypeId: 1,
  name: 'MSISDN',
  description: 'A MSISDN (Mobile Station International Subscriber Directory Number, that is, the phone number)',
  isActive: true,
  createdDate: '2019-05-24 08:52:19'
}

const endpointTypeResponse = {
  endpointTypeId: 1,
  type: 'URL',
  description: 'REST URLs',
  isActive: true,
  createdDate: '2019-05-24 08:52:19'
}

const getOracleRequest = {
  query: {}
}

const getOracleDatabaseResponse = [{
  oracleEndpointId: 1,
  endpointType: 'URL',
  value: 'http://localhost:8444',
  idType: 'MSISDN',
  currency: 'USD',
  isDefault: true
}]

let sandbox

describe('Oracle tests', () => {

  beforeEach(() => {
    sandbox = Sinon.createSandbox()
    Db.partyIdType = {
      findOne: sandbox.stub()
    }
    Db.endpointType = {
      findOne: sandbox.stub()
    }
    Db.oracleEndpoint = {
      update: sandbox.stub(),
      insert: sandbox.stub(),
      query: sandbox.stub()
    }
    Db.partyIdType.findOne.returns(partyIdTypeResponse)
    Db.endpointType.findOne.returns(endpointTypeResponse)
    Db.oracleEndpoint.insert.returns(true)
    Db.oracleEndpoint.query.returns(getOracleDatabaseResponse)
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('createOracle', () => {
    it('should create an oracle when isDefault is true', async () => {
      // Arrange
      const createPayload = {
        oracleIdType: 'MSISDN',
        endpoint: {
          value: 'http://localhost:8444',
          endpointType: 'URL'
        },
        isDefault: true
      }

      // Act
      const response = await oracleDomain.createOracle(createPayload)

      // Assert
      expect(response).toBe(true)
    })

    it('should create an oracle isDefault false', async () => {
      // Arrange
      const createPayload = {
        oracleIdType: 'MSISDN',
        endpoint: {
          value: 'http://localhost:8444',
          endpointType: 'URL'
        }
      }

      // Act
      const response = await oracleDomain.createOracle(createPayload)

      // Assert
      expect(response).toBe(true)
    })

    it('should fail if `partyIdType` throws', async () => {
      // Arrange
      sandbox.restore()
      Db.partyIdType = {
        findOne: sandbox.stub()
      }
      Db.partyIdType.findOne.throws(new Error())

      const createPayload = {
        oracleIdType: 'MSISDN',
        endpoint: {
          value: 'http://localhost:8444',
          endpointType: 'URL'
        }
      }
      
      // Act
      const action = async () => await oracleDomain.createOracle(createPayload)

      // Assert
      await expect(action()).rejects.toThrow()
    })
  })

  describe('getOracle', () => {
    it('should get the details of the requested oracle without currency and type', async () => {
      // Arrange
      const query = {}
      const expected = [{
        oracleId: 1,
        oracleIdType: 'MSISDN',
        endpoint: {
          value: 'http://localhost:8444',
          endpointType: 'URL'
        },
        currency: 'USD',
        isDefault: true
      }]
      
      // Act
      const response = await oracleDomain.getOracle(getOracleRequest.query)
      
      // Assert
      expect(response).toEqual(expected)
    })


    it('should get the details of the requested oracle with currency', async () => {
      // Arrange
      const query = {
        currency: "USD"
      }
      const expected = [{
        oracleId: 1,
        oracleIdType: 'MSISDN',
        endpoint: {
          value: 'http://localhost:8444',
          endpointType: 'URL'
        },
        currency: 'USD',
        isDefault: true
      }]
      
      // Act
      const response = await oracleDomain.getOracle(getOracleRequest.query)
      
      // Assert
      expect(response).toEqual(expected)
    })


    it('should get the details of the requested oracle with type', async () => {
      // Arrange
      const query = {
        type: 'MSISDN'
      }
      const expected = [{
        oracleId: 1,
        oracleIdType: 'MSISDN',
        endpoint: {
          value: 'http://localhost:8444',
          endpointType: 'URL'
        },
        currency: 'USD',
        isDefault: true
      }]
      
      // Act
      const response = await oracleDomain.getOracle(getOracleRequest.query)

      // Assert
      expect(response).toEqual(expected)
    })

    it('should get the details of the requested oracle with currency and type', async () => {
      // Arrange
      const query = {
        currency: 'USD',
        type: 'MSISDN'
      }
      const expected = [{
        oracleId: 1,
        oracleIdType: 'MSISDN',
        endpoint: {
          value: 'http://localhost:8444',
          endpointType: 'URL'
        },
        currency: 'USD',
        isDefault: true
      }]
      
      // Act
      const response = await oracleDomain.getOracle(getOracleRequest.query)

      // Assert
      expect(response).toEqual(expected)
    })

    it('should throw on database query error', async () => {
      // Arrange
      sandbox.restore()
      Db.oracleEndpoint = {
        query: sandbox.stub(),
        insert: sandbox.stub()
      }
      Db.oracleEndpoint.insert.returns(true)
      Db.oracleEndpoint.query.throws(new Error())
      const request = {
        query: {}
      }
      
      // Act
      const action = async () => await oracleDomain.getOracle(request)

      // Assert
      await expect(action()).rejects.toThrow()
    })
  })

})