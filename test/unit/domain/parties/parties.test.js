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

const Test = require('ava')
const Sinon = require('sinon')
const Logger = require('@mojaloop/central-services-logger')
const request = require('@mojaloop/central-services-shared').Util.Request
const Endpoints = require('@mojaloop/central-services-shared').Util.Endpoints
const Enums = require('@mojaloop/central-services-shared').Enum
const Util = require('@mojaloop/central-services-shared').Util
const Helper = require('../../../util/helper')
const DB = require('../../../../src/lib/db')
const partiesDomain = require('../../../../src/domain/parties/parties')
const Config = require('../../../../src/lib/config')

let sandbox

Test.beforeEach(async () => {
  await Endpoints.initializeCache(Config.ENDPOINT_CACHE_CONFIG)
  sandbox = Sinon.createSandbox()
  sandbox.stub(request)
  sandbox.stub(Util.Http, 'SwitchDefaultHeaders').returns(Helper.defaultSwitchHeaders)
  DB.oracleEndpoint = {
    query: sandbox.stub()
  }
})

Test.afterEach(() => {
  sandbox.restore()
})

// GET /parties/{Type}/{ID}
// GET /parties/MSISDN/123456789

Test.serial('getPartiesByTypeAndID should send a callback request to the requester', async (t) => {
  try {
    request.sendRequest.withArgs(Helper.validatePayerFspUri, Helper.defaultSwitchHeaders, Helper.defaultSwitchHeaders['fspiop-destination'], Helper.defaultSwitchHeaders['fspiop-source']).returns(Promise.resolve({}))
    DB.oracleEndpoint.query.returns(Helper.getOracleEndpointDatabaseResponse)
    request.sendRequest.withArgs(Helper.oracleGetPartiesUri, Helper.getByTypeIdRequest.headers, Helper.getByTypeIdRequest.method, undefined, true).returns(Promise.resolve(Helper.getOracleResponse))
    request.sendRequest.withArgs(Helper.getPayerfspEndpointsUri, Helper.defaultSwitchHeaders, Helper.defaultSwitchHeaders['fspiop-destination'], Helper.defaultSwitchHeaders['fspiop-source']).returns(Promise.resolve(Helper.getEndPointsResponse))
    request.sendRequest.withArgs(Helper.getEndPointsResponse.data[0].value, Helper.getByTypeIdRequest.headers, Enums.Http.RestMethods.GET, Helper.fspIdPayload).returns(Promise.resolve({}))
    await partiesDomain.getPartiesByTypeAndID(Helper.getByTypeIdRequest.headers, Helper.getByTypeIdRequest.params, Helper.getByTypeIdRequest.method, Helper.getByTypeIdRequest.query)
    t.is(request.sendRequest.callCount, 4, 'send request called 4 times')
  } catch (e) {
    Logger.error(`getPartiesByTypeAndID test failed with error - ${e}`)
    t.fail()
  }
})

Test.serial('putPartiesByTypeAndID should send a callback request to the requester', async (t) => {
  try {
    request.sendRequest.withArgs(Helper.validatePayerFspUri, Helper.defaultSwitchHeaders).returns(Promise.resolve({}))
    DB.oracleEndpoint.query.returns(Helper.getOracleEndpointDatabaseResponse)
    request.sendRequest.withArgs(Helper.oracleGetPartiesUri, Helper.putByTypeIdRequest.headers, Helper.putByTypeIdRequest.method, undefined, true).returns(Promise.resolve())
    request.sendRequest.withArgs(Helper.getPayerfspEndpointsUri, Helper.defaultSwitchHeaders).returns(Promise.resolve(Helper.getEndPointsResponse))
    request.sendRequest.withArgs(Helper.getEndPointsResponse.data[0].value, Helper.putByTypeIdRequest.headers, Enums.Http.RestMethods.PUT, Helper.fspIdPayload).returns(Promise.resolve({}))
    await partiesDomain.getPartiesByTypeAndID(Helper.getByTypeIdRequest.headers, Helper.getByTypeIdRequest.params, Helper.getByTypeIdRequest.method, Helper.getByTypeIdRequest.query)
    t.is(request.sendRequest.callCount, 4, 'send request called 4 times')
  } catch (e) {
    Logger.error(`putPartiesByTypeAndID test failed with error - ${e}`)
    t.fail()
  }
})
