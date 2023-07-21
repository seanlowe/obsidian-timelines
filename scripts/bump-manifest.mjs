import * as fs from 'fs'

// Read the current version from package.json
const packageJson = JSON.parse( fs.readFileSync( 'package.json', 'utf8' ))
const newVersion = packageJson.version

// Update the version in manifest.json
const manifestJson = JSON.parse( fs.readFileSync( 'manifest.json', 'utf8' ))
manifestJson.version = newVersion
fs.writeFileSync( 'manifest.json', JSON.stringify( manifestJson, null, 2 ))
