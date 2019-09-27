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
const participantsDomain = require('../../../../src/domain/participants/participants')
const Endpoints = require('@mojaloop/central-services-shared').Util.Endpoints
const request = require('@mojaloop/central-services-shared').Util.Request
const Enums = require('@mojaloop/central-services-shared').Enum
const Helper = require('../../../util/helper')
const DB = require('../../../../src/lib/db')
const Config = require('../../../../src/lib/config')
const Util = require('@mojaloop/central-services-shared').Util

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

  it('getParticipantsByTypeAndID should send a callback request to the requester', async () => {
    // Arrange
    request.sendRequest.withArgs(Helper.validatePayerFspUri, Helper.defaultSwitchHeaders, Helper.defaultSwitchHeaders['fspiop-destination'], Helper.defaultSwitchHeaders['fspiop-source']).returns(Promise.resolve({}))
    DB.oracleEndpoint.query.returns(Helper.getOracleEndpointDatabaseResponse)
    request.sendRequest.withArgs(Helper.oracleGetCurrencyUri, Helper.getByTypeIdCurrencyRequest.headers, Helper.getByTypeIdCurrencyRequest.method, undefined, true).returns(Promise.resolve(Helper.getOracleResponse))
    request.sendRequest.withArgs(Helper.getPayerfspEndpointsUri, Helper.defaultSwitchHeaders, Helper.defaultSwitchHeaders['fspiop-destination'], Helper.defaultSwitchHeaders['fspiop-source']).returns(Promise.resolve(Helper.getEndPointsResponse))
    request.sendRequest.withArgs(Helper.getEndPointsResponse.data[0].value, Helper.getByTypeIdCurrencyRequest.headers, Enums.Http.RestMethods.PUT, Helper.fspIdPayload).returns(Promise.resolve({}))

    // Act
    await participantsDomain.getParticipantsByTypeAndID(Helper.getByTypeIdCurrencyRequest.headers, Helper.getByTypeIdCurrencyRequest.params, Helper.getByTypeIdCurrencyRequest.method, Helper.getByTypeIdCurrencyRequest.query)

    // Assert
    expect(request.sendRequest.callCount).toBe(4)
  })

  it('postParticipantsByTypeAndID should send a callback request to the requester', async () => {
    // Arrange
    request.sendRequest.withArgs(Helper.validatePayerFspUri, Helper.defaultSwitchHeaders, Helper.defaultSwitchHeaders['fspiop-destination'], Helper.defaultSwitchHeaders['fspiop-source']).returns(Promise.resolve({}))
    DB.oracleEndpoint.query.returns(Helper.getOracleEndpointDatabaseResponse)
    request.sendRequest.withArgs(Helper.oracleGetCurrencyUri, Helper.postByTypeIdCurrencyRequest.headers, Helper.postByTypeIdCurrencyRequest.method, undefined, true).returns(Promise.resolve())
    request.sendRequest.withArgs(Helper.getPayerfspEndpointsUri, Helper.defaultSwitchHeaders, Helper.defaultSwitchHeaders['fspiop-destination'], Helper.defaultSwitchHeaders['fspiop-source']).returns(Promise.resolve(Helper.getEndPointsResponse))
    request.sendRequest.withArgs(Helper.getEndPointsResponse.data[0].value, Helper.getByTypeIdCurrencyRequest.headers, Enums.Http.RestMethods.POST, Helper.fspIdPayload).returns(Promise.resolve({}))

    // Act
    await participantsDomain.postParticipants(Helper.getByTypeIdCurrencyRequest.headers, Helper.getByTypeIdCurrencyRequest.params, Helper.getByTypeIdCurrencyRequest.method, Helper.getByTypeIdCurrencyRequest.query)

    // Assert
    expect(request.sendRequest.callCount).toBe(2)
  })
})
