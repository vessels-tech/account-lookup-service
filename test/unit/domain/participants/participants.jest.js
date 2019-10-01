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

const request = require('@mojaloop/central-services-shared').Util.Request
const Enums = require('@mojaloop/central-services-shared').Enum
const Util = require('@mojaloop/central-services-shared').Util
const Endpoints = require('@mojaloop/central-services-shared').Util.Endpoints
const Logger = require('@mojaloop/central-services-logger')

const participantsDomain = require('../../../../src/domain/participants/participants')
const participant = require('../../../../src/models/participantEndpoint/facade')
const oracle = require('../../../../src/models/oracle/facade')
const Helper = require('../../../util/helper')
const DB = require('../../../../src/lib/db')
const Config = require('../../../../src/lib/config')


let sandbox

describe('Participant Tests', () => {
  beforeEach(async () => {
    await Endpoints.initializeCache(Config.ENDPOINT_CACHE_CONFIG)
    sandbox = Sinon.createSandbox()
    sandbox.stub(request)
    sandbox.stub(Util.Http, 'SwitchDefaultHeaders').returns(Helper.defaultSwitchHeaders)
    DB.oracleEndpoint = {
      query: sandbox.stub()
    }
  })

  afterEach(() => {
    sandbox.restore()
  })

  // it('getParticipantsByTypeAndID should send a callback request to the requester', async () => {
  //   // Arrange
  //   request.sendRequest.withArgs(Helper.validatePayerFspUri, Helper.defaultSwitchHeaders, Helper.defaultSwitchHeaders['fspiop-destination'], Helper.defaultSwitchHeaders['fspiop-source']).returns(Promise.resolve({}))
  //   DB.oracleEndpoint.query.returns(Helper.getOracleEndpointDatabaseResponse)
  //   request.sendRequest.withArgs(Helper.oracleGetCurrencyUri, Helper.getByTypeIdCurrencyRequest.headers, Helper.getByTypeIdCurrencyRequest.method, undefined, true).returns(Promise.resolve(Helper.getOracleResponse))
  //   request.sendRequest.withArgs(Helper.getPayerfspEndpointsUri, Helper.defaultSwitchHeaders, Helper.defaultSwitchHeaders['fspiop-destination'], Helper.defaultSwitchHeaders['fspiop-source']).returns(Promise.resolve(Helper.getEndPointsResponse))
  //   request.sendRequest.withArgs(Helper.getEndPointsResponse.data[0].value, Helper.getByTypeIdCurrencyRequest.headers, Enums.Http.RestMethods.PUT, Helper.fspIdPayload).returns(Promise.resolve({}))

  //   // Act
  //   await participantsDomain.getParticipantsByTypeAndID(Helper.getByTypeIdCurrencyRequest.headers, Helper.getByTypeIdCurrencyRequest.params, Helper.getByTypeIdCurrencyRequest.method, Helper.getByTypeIdCurrencyRequest.query)

  //   // Assert
  //   expect(request.sendRequest.callCount).toBe(4)
  // })

  // it('postParticipantsByTypeAndID should send a callback request to the requester', async () => {
  //   // Arrange
  //   request.sendRequest.withArgs(Helper.validatePayerFspUri, Helper.defaultSwitchHeaders, Helper.defaultSwitchHeaders['fspiop-destination'], Helper.defaultSwitchHeaders['fspiop-source']).returns(Promise.resolve({}))
  //   DB.oracleEndpoint.query.returns(Helper.getOracleEndpointDatabaseResponse)
  //   request.sendRequest.withArgs(Helper.oracleGetCurrencyUri, Helper.postByTypeIdCurrencyRequest.headers, Helper.postByTypeIdCurrencyRequest.method, undefined, true).returns(Promise.resolve())
  //   request.sendRequest.withArgs(Helper.getPayerfspEndpointsUri, Helper.defaultSwitchHeaders, Helper.defaultSwitchHeaders['fspiop-destination'], Helper.defaultSwitchHeaders['fspiop-source']).returns(Promise.resolve(Helper.getEndPointsResponse))
  //   request.sendRequest.withArgs(Helper.getEndPointsResponse.data[0].value, Helper.getByTypeIdCurrencyRequest.headers, Enums.Http.RestMethods.POST, Helper.fspIdPayload).returns(Promise.resolve({}))

  //   // Act
  //   await participantsDomain.postParticipants(Helper.getByTypeIdCurrencyRequest.headers, Helper.getByTypeIdCurrencyRequest.params, Helper.getByTypeIdCurrencyRequest.method, Helper.getByTypeIdCurrencyRequest.query)

  //   // Assert
  //   expect(request.sendRequest.callCount).toBe(2)
  // })

  describe('getParticipantsByTypeAndID', () => {
    beforeEach(() => {
      sandbox.stub(participant)
      sandbox.stub(oracle)
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('gets participants and sends callback', async () => {
      // Arrange
      participant.validateParticipant = sandbox.stub().resolves({})
      oracle.oracleRequest = sandbox.stub().resolves({
        data: {
          partyList: [
            { fspId: 'fsp1' }
          ]
        }
      })
      participant.sendRequest = sandbox.stub()
      const args = [
        Helper.getByTypeIdCurrencyRequest.headers, 
        Helper.getByTypeIdCurrencyRequest.params, 
        Helper.getByTypeIdCurrencyRequest.method, 
        Helper.getByTypeIdCurrencyRequest.query
      ]

      // Act
      await participantsDomain.getParticipantsByTypeAndID(...args)
      
      // Assert
      expect(participant.sendRequest.callCount).toBe(1)
      const firstCallArgs = participant.sendRequest.getCall(0).args
      expect(args[0][Enums.Http.Headers.FSPIOP.DESTINATION]).toBe('payeefsp')
    })

    it('fails with `Requester FSP not found` if `validateParticipant` fails', async () => {
      // Arrange
      participant.validateParticipant = sandbox.stub().resolves(null)
      const logErrorStub = sandbox.stub(Logger, 'error')
      
      participant.sendRequest = sandbox.stub()
      const args = [
        Helper.getByTypeIdCurrencyRequest.headers,
        Helper.getByTypeIdCurrencyRequest.params,
        Helper.getByTypeIdCurrencyRequest.method,
        Helper.getByTypeIdCurrencyRequest.query
      ]

      // Act
      await participantsDomain.getParticipantsByTypeAndID(...args)

      // Assert
      const firstCallArgs = logErrorStub.getCall(0).args
      expect(firstCallArgs[0]).toBe('Requester FSP not found')
    })

    it('fails when `oracleRequest` response is empty', async () => {
      // Arrange
      participant.validateParticipant = sandbox.stub().resolves({})
      oracle.oracleRequest = sandbox.stub().resolves(null)
      participant.sendErrorToParticipant = sandbox.stub()

      const args = [
        Helper.getByTypeIdCurrencyRequest.headers,
        Helper.getByTypeIdCurrencyRequest.params,
        Helper.getByTypeIdCurrencyRequest.method,
        Helper.getByTypeIdCurrencyRequest.query
      ]

      // Act
      await participantsDomain.getParticipantsByTypeAndID(...args)

      // Assert
      expect(participant.sendErrorToParticipant.callCount).toBe(1)
    })

    it('handles error when `sendRequest` and sendErrorToParticipant` fails', async () => {
      // Arrange
      participant.validateParticipant = sandbox.stub().resolves({})
      oracle.oracleRequest = sandbox.stub().resolves({
        data: {
          partyList: [
            { fspId: 'fsp1' }
          ]
        }
      })
      participant.sendRequest = sandbox.stub().throws(new Error('sendRequest error'))
      participant.sendErrorToParticipant = sandbox.stub().throws(new Error('sendErrorToParticipant error'))

      const args = [
        Helper.getByTypeIdCurrencyRequest.headers,
        Helper.getByTypeIdCurrencyRequest.params,
        Helper.getByTypeIdCurrencyRequest.method,
        Helper.getByTypeIdCurrencyRequest.query
      ]

      // Act
      await participantsDomain.getParticipantsByTypeAndID(...args)

      // Assert
      expect(participant.sendRequest.callCount).toBe(1)
      expect(participant.sendErrorToParticipant.callCount).toBe(1)
    })
  })

  // describe('putParticipantsErrorByTypeAndID')
  // describe('postParticipants')
  // describe('postParticipantsBatch')
})
