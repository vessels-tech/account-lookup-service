'use strict'

const Path = require('path')
const Migrations = require('@mojaloop/central-services-database').Migrations
const Knexfile = require('../../config/knexfile')

const updateMigrationsLocation = (kf) => {
  const parsedMigrationDir = Path.parse(kf.migrations.directory)
  kf.migrations.directory = Path.join(process.cwd(), parsedMigrationDir.base)
  const parsedSeedsDir = Path.parse(kf.seeds.directory)
  kf.seeds.directory = Path.join(process.cwd(), parsedSeedsDir.base)
  console.log("kf is", kf)
  return kf
}

exports.migrate = async function () {
  return Migrations.migrate(updateMigrationsLocation(Knexfile))
}
